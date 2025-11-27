from datetime import datetime
from io import BytesIO
import logging
import traceback
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import func
import qrcode

# Configure logging
logging.basicConfig(level=logging.INFO)

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..services.ticket_generator import TicketGenerator


router = APIRouter()


@router.post("/", response_model=list[schemas.BookingRead], status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[schemas.BookingRead]:
    """
    Create booking(s) for a flight.
    If quantity > 1, creates multiple bookings.
    Returns list of created bookings.
    """
    try:
        # Lock flight row for update to prevent race conditions
        flight = db.query(models.Flight).filter(models.Flight.id == payload.flight_id).with_for_update().first()
        if not flight:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flight not found")

        # Validate quantity
        quantity = max(1, min(payload.quantity or 1, 10))  # Limit to 10 tickets per booking
        
        if payload.is_full_charter and quantity > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full charter bookings can only be for 1 booking at a time"
            )

        # Check seat availability
        if payload.is_full_charter or flight.is_full_charter_only:
            # For full charter, check if flight has any bookings
            existing_bookings = db.query(func.count(models.Booking.id)).filter(
                models.Booking.flight_id == flight.id,
                models.Booking.status.in_([models.BookingStatus.CONFIRMED, models.BookingStatus.PENDING])
            ).scalar()
            if existing_bookings > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Flight is already booked (full charter)"
                )
        else:
            # For seat booking, check available seats
            # First, check if seat inventory exists, if not, create it from plane capacity
            seat_count = db.query(func.count(models.SeatInventory.id)).filter(
                models.SeatInventory.flight_id == flight.id
            ).scalar() or 0
            
            if seat_count == 0:
                # No seat inventory exists, create it from plane capacity
                plane = db.get(models.Plane, flight.plane_id)
                if plane:
                    total_seats = plane.seat_capacity
                    for seat_num in range(1, total_seats + 1):
                        seat = models.SeatInventory(
                            flight_id=flight.id,
                            seat_number=str(seat_num),
                            class_type="standard",
                            price=float(flight.base_price),
                            is_available=True
                        )
                        db.add(seat)
                    db.commit()
                    logging.info(f"Created {total_seats} seats for flight {flight.id}")
            
            # If specific seat_id is provided but quantity > 1, we can't use the same seat for all
            if payload.seat_id and quantity > 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot book multiple tickets for the same seat. Please use auto-assign for multiple tickets."
                )
            
            if payload.seat_id:
                # Specific seat booking (single ticket only)
                seat = db.query(models.SeatInventory).filter(
                    models.SeatInventory.id == payload.seat_id,
                    models.SeatInventory.flight_id == flight.id
                ).with_for_update().first()
                if not seat or not seat.is_available:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Seat not available")
            else:
                # Auto-assign seats - check total available seats
                available_seats = db.query(func.count(models.SeatInventory.id)).filter(
                    models.SeatInventory.flight_id == flight.id,
                    models.SeatInventory.is_available == True
                ).scalar() or 0
                
                if available_seats < quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Only {available_seats} seat(s) available. Requested: {quantity}"
                    )

        # Use provided passenger details or default to logged-in user
        passenger_name = payload.passenger_name or current_user.full_name or current_user.email
        passenger_email = payload.passenger_email or current_user.email
        passenger_phone = payload.passenger_phone

        # Create multiple bookings if quantity > 1
        bookings = []
        seats_to_mark_unavailable = []
        
        for i in range(quantity):
            seat = None
            amount = float(flight.base_price)
            
            if payload.is_full_charter:
                amount = float(flight.base_price)  # Full charter uses base price
            elif payload.seat_id:
                # Use the specific seat already fetched (only for single ticket)
                seat = db.query(models.SeatInventory).filter(
                    models.SeatInventory.id == payload.seat_id
                ).first()
                amount = float(seat.price)
            else:
                # Auto-assign next available seat (DIFFERENT seat for each ticket)
                # Use with_for_update to lock the seat and prevent race conditions
                seat = db.query(models.SeatInventory).filter(
                    models.SeatInventory.flight_id == flight.id,
                    models.SeatInventory.is_available == True
                ).order_by(models.SeatInventory.id).with_for_update().first()
                
                if not seat:
                    # Rollback any bookings we've created so far
                    for b in bookings:
                        if b.seat_id:
                            seat_to_restore = db.get(models.SeatInventory, b.seat_id)
                            if seat_to_restore:
                                seat_to_restore.is_available = True
                    db.rollback()
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Only {i} seat(s) were available. Requested: {quantity}"
                    )
                amount = float(seat.price)
            
            booking = models.Booking(
                flight_id=flight.id,
                passenger_id=current_user.id,
                seat_id=seat.id if seat else None,
                total_amount=amount,
                is_full_charter=payload.is_full_charter,
                status=models.BookingStatus.CONFIRMED,
                passenger_name=passenger_name,
                passenger_email=passenger_email,
                passenger_phone=passenger_phone,
                emergency_contact_name=payload.emergency_contact_name,
                emergency_contact_phone=payload.emergency_contact_phone,
                special_requests=payload.special_requests,
            )
            db.add(booking)
            bookings.append(booking)
            
            # Mark seat as unavailable IMMEDIATELY to prevent duplicate assignment
            if seat:
                seat.is_available = False
                seats_to_mark_unavailable.append(seat)
                # Flush to ensure the seat is marked unavailable before next iteration
                db.flush()

        # Commit all changes
        db.commit()
        
        # Create vendor notification for each booking
        vendor = db.query(models.Vendor).filter(models.Vendor.id == flight.vendor_id).first()
        if vendor:
            for booking in bookings:
                notification = models.VendorNotification(
                    vendor_id=vendor.id,
                    booking_id=booking.id,
                    notification_type="new_booking",
                    message=f"New booking from {passenger_name} - {quantity} seat(s) on flight {flight.origin} to {flight.destination}",
                    is_read=False
                )
                db.add(notification)
        
        db.commit()
        
        # Refresh all bookings
        for booking in bookings:
            db.refresh(booking)
        
        return [schemas.BookingRead.model_validate(b) for b in bookings]
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Rollback on any error
        db.rollback()
        import logging
        import traceback
        error_trace = traceback.format_exc()
        logging.error(f"Error creating booking: {e}\n{error_trace}")
        
        # Provide helpful error messages
        error_msg = str(e)
        if "column" in error_msg.lower() and "does not exist" in error_msg.lower():
            error_msg = "Database schema mismatch. Please run the migration script: python migrate_add_booking_fields.py"
        elif "not null constraint" in error_msg.lower():
            error_msg = "Missing required information. Please fill all required fields."
        elif "foreign key constraint" in error_msg.lower():
            error_msg = "Invalid flight or user reference."
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create booking: {error_msg}"
        )


@router.get("/", response_model=list[schemas.BookingRead])
def list_bookings(
    passenger_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[schemas.BookingRead]:
    query = db.query(models.Booking)
    
    # Admin can view bookings for any passenger
    if current_user.role == models.UserRole.ADMIN:
        if passenger_id:
            query = query.filter(models.Booking.passenger_id == passenger_id)
    elif current_user.role == models.UserRole.PASSENGER:
        query = query.filter(models.Booking.passenger_id == current_user.id)
    elif current_user.role == models.UserRole.VENDOR:
        query = query.join(models.Flight).filter(models.Flight.vendor_id == current_user.vendor.id)
    
    bookings = query.order_by(models.Booking.booked_at.desc()).all()
    return [schemas.BookingRead.model_validate(b) for b in bookings]


@router.patch("/{booking_id}", response_model=schemas.BookingRead)
def update_booking_status(
    booking_id: int,
    status_payload: dict[str, str],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.BookingRead:
    booking = db.get(models.Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if current_user.role == models.UserRole.PASSENGER and booking.passenger_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify others' bookings")

    new_status = status_payload.get("status")
    if not new_status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status required")

    booking.status = models.BookingStatus(new_status)
    db.commit()
    db.refresh(booking)
    return schemas.BookingRead.model_validate(booking)


def generate_qr_code(data: str) -> BytesIO:
    """Generate QR code image"""
    try:
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        logging.info(f"QR code generated successfully")
        return buffer
    except Exception as e:
        logging.error(f"Error generating QR code: {e}")
        raise


def get_airport_code(airport_name: str) -> str:
    """Extract or generate airport code from airport name"""
    # Common airport codes mapping
    airport_map = {
        'mumbai': 'BOM', 'delhi': 'DEL', 'bangalore': 'BLR', 'chennai': 'MAA',
        'kolkata': 'CCU', 'hyderabad': 'HYD', 'pune': 'PNQ', 'goa': 'GOI',
        'los angeles': 'LAX', 'new york': 'JFK', 'london': 'LHR', 'dubai': 'DXB',
        'singapore': 'SIN', 'tokyo': 'NRT', 'paris': 'CDG', 'frankfurt': 'FRA',
        'teterboro': 'TEB'
    }
    name_lower = airport_name.lower()
    for key, code in airport_map.items():
        if key in name_lower:
            return code
    # Generate code from first 3 letters if not found
    return airport_name[:3].upper().replace(' ', '')


def get_airport_name(airport_name: str) -> str:
    """Get full airport name from city/airport name"""
    # Common airport name mappings
    airport_names = {
        'mumbai': 'Mumbai Airport',
        'delhi': 'Delhi Airport',
        'bangalore': 'Bangalore Airport',
        'chennai': 'Chennai Airport',
        'kolkata': 'Kolkata Airport',
        'hyderabad': 'Hyderabad Airport',
        'pune': 'Pune Airport',
        'goa': 'Goa Airport',
        'los angeles': 'Los Angeles Intl',
        'new york': 'New York JFK',
        'london': 'London Heathrow',
        'dubai': 'Dubai Intl',
        'singapore': 'Singapore Changi',
        'tokyo': 'Tokyo Narita',
        'paris': 'Paris CDG',
        'frankfurt': 'Frankfurt Airport',
        'teterboro': 'Teterboro Airport'
    }
    name_lower = airport_name.lower()
    for key, full_name in airport_names.items():
        if key in name_lower:
            return full_name
    # Return formatted name if not found
    return airport_name.title() + " Airport"


@router.get("/{booking_id}/ticket")
def download_ticket(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generate and download booking ticket as 24AV ticket PDF"""
    try:
        logging.info(f"Generating 24AV ticket for booking {booking_id}")
        booking = db.get(models.Booking, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        
        # Check if user has access to this booking
        if current_user.role == models.UserRole.PASSENGER and booking.passenger_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Load related data
        logging.info(f"Loading flight {booking.flight_id} and passenger {booking.passenger_id}")
        flight = db.get(models.Flight, booking.flight_id)
        passenger = db.get(models.User, booking.passenger_id)
        
        if not flight or not passenger:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Related data not found")
        
        logging.info(f"Flight: {flight.origin} -> {flight.destination}, Passenger: {passenger.email}")
        
        # Get passenger details
        passenger_name = booking.passenger_name or passenger.full_name or passenger.email
        
        # Generate ticket number
        ticket_number = f"PVT-{booking.booked_at.year}-{str(booking.id).zfill(6)}"
        
        # Get airport codes
        origin_code = get_airport_code(flight.origin)
        dest_code = get_airport_code(flight.destination)
        
        # Format dates and times
        departure_date = flight.departure_time.strftime('%d %b %Y').upper()
        departure_time = flight.departure_time.strftime('%H:%M')
        
        # Flight number
        flight_number = getattr(flight, 'flight_number', None) or f"PJ-{flight.id}"
        
        # Seat assignment
        seat_number = "N/A"
        if booking.is_full_charter:
            seat_number = "CHARTER"
        elif booking.seat_id and booking.seat:
            try:
                seat_number = booking.seat.seat_number
            except AttributeError:
                seat_number = "N/A"
        
        # Generate HTML ticket
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }}
                .ticket {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 24px;
                    border-bottom: 1px solid #d1d5db;
                    background: white;
                }}
                .header-left {{ display: flex; align-items: center; gap: 12px; }}
                .logo {{ width: 40px; height: 40px; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; font-size: 18px; }}
                .header-title {{ margin: 0; }}
                .header-title h2 {{ font-size: 20px; font-weight: bold; color: #1d4ed8; margin: 0; }}
                .header-title p {{ font-size: 12px; color: #9ca3af; margin: 0; margin-top: -4px; }}
                .booking-ref {{ text-align: right; }}
                .booking-ref p {{ font-size: 11px; color: #6b7280; margin: 0; }}
                .booking-ref .number {{ font-size: 18px; font-weight: bold; color: #1f2937; margin-top: 4px; }}
                
                .body {{ padding: 20px 24px; }}
                .passenger-section {{ margin-bottom: 20px; }}
                .label {{ font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }}
                .passenger-name {{ font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 12px; }}
                .charter-badge {{ display: inline-block; background: #1e40af; color: white; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; margin-bottom: 16px; }}
                
                .route-section {{ margin-bottom: 20px; }}
                .route-container {{ display: flex; align-items: center; gap: 40px; margin-bottom: 16px; }}
                .route-airport {{ text-align: center; }}
                .airport-code {{ font-size: 48px; font-weight: bold; color: #1f2937; line-height: 1; margin-bottom: 4px; }}
                .airport-name {{ font-size: 12px; color: #9ca3af; }}
                .arrow {{ font-size: 32px; color: #1f2937; }}
                
                .flight-details {{ display: flex; gap: 40px; margin-top: 16px; }}
                .detail {{ flex: 1; }}
                .detail .label {{ font-size: 10px; }}
                .detail .value {{ font-size: 14px; font-weight: bold; color: #1f2937; }}
                
                .right-section {{ border-left: 1px solid #d1d5db; padding-left: 20px; margin-left: 20px; text-align: right; }}
                .right-section .label {{ text-align: right; }}
                .right-section .value {{ font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 16px; }}
                .qr-code {{ display: flex; justify-content: flex-end; margin-top: 16px; }}
                .qr-code img {{ width: 100px; height: 100px; }}
                
                .main-content {{ display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }}
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">
                    <div class="header-left">
                        <div class="logo">24</div>
                        <div class="header-title">
                            <h2>24AV</h2>
                            <p>PRIVATE CHARTER TICKET</p>
                        </div>
                    </div>
                    <div class="booking-ref">
                        <p>BOOKING REF</p>
                        <div class="number">{ticket_number}</div>
                    </div>
                </div>
                
                <div class="body">
                    <div class="main-content">
                        <div>
                            <div class="passenger-section">
                                <p class="label">PASSENGER</p>
                                <p class="passenger-name">{passenger_name}</p>
                                <div class="charter-badge">CHARTER</div>
                            </div>
                            
                            <div class="route-section">
                                <div class="route-container">
                                    <div class="route-airport">
                                        <div class="airport-code">{origin_code}</div>
                                        <div class="airport-name">{flight.origin}</div>
                                    </div>
                                    <div class="arrow">→</div>
                                    <div class="route-airport">
                                        <div class="airport-code">{dest_code}</div>
                                        <div class="airport-name">{flight.destination}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flight-details">
                                <div class="detail">
                                    <p class="label">DATE</p>
                                    <p class="value">{departure_date}</p>
                                </div>
                                <div class="detail">
                                    <p class="label">DEPARTURE</p>
                                    <p class="value">{departure_time}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="right-section">
                            <p class="label">FLIGHT NUM</p>
                            <p class="value">{flight_number}</p>
                            
                            <p class="label" style="margin-top: 16px;">SEAT</p>
                            <p class="value">{seat_number}</p>
                            
                            <div class="qr-code">
                                <img src="https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl={ticket_number}&choe=UTF-8" alt="QR Code">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Convert HTML to PDF using weasyprint or similar
        try:
            from weasyprint import HTML
            
            logging.info("WeasyPrint available, attempting to convert HTML to PDF")
            pdf_buffer = BytesIO()
            HTML(string=html_content).write_pdf(pdf_buffer)
            pdf_buffer.seek(0)
            pdf_content = pdf_buffer.getvalue()
            
            if not pdf_content or len(pdf_content) == 0:
                logging.error("WeasyPrint generated empty PDF")
                raise ValueError("Generated PDF is empty")
            
            logging.info(f"PDF generated successfully using WeasyPrint, size: {len(pdf_content)} bytes")
            
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="boarding-pass-{booking_id}.pdf"',
                    "Content-Length": str(len(pdf_content))
                }
            )
        except ImportError as ie:
            # WeasyPrint not installed
            logging.warning(f"WeasyPrint not available ({ie}), using fallback HTML rendering")
            
            return Response(
                content=html_content,
                media_type="text/html; charset=utf-8",
                headers={
                    "Content-Disposition": f'inline; filename="boarding-pass-{booking_id}.html"'
                }
            )
        except Exception as pdf_err:
            # WeasyPrint failed for some other reason
            logging.error(f"WeasyPrint conversion failed: {pdf_err}", exc_info=True)
            logging.warning("Falling back to HTML rendering")
            
            return Response(
                content=html_content,
                media_type="text/html; charset=utf-8",
                headers={
                    "Content-Disposition": f'inline; filename="boarding-pass-{booking_id}.html"'
                }
            )
    
    except HTTPException:
        raise
    except Exception as e:
        error_trace = traceback.format_exc()
        logging.error(f"Error generating ticket for booking {booking_id}: {e}\n{error_trace}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate ticket: {str(e)}"
        )


@router.get("/{booking_id}/ticket-docx")
def download_ticket_from_docx(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Deprecated: Use /{booking_id}/ticket instead"""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="This endpoint is deprecated. Use /{booking_id}/ticket instead."
    )
