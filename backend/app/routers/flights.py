from datetime import datetime
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Dict, Any

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..services.external_flight_api import get_external_flight_api
from ..utils.iata_codes import expand_search_terms


router = APIRouter()


# IMPORTANT: More specific routes must be defined BEFORE parameterized routes (like /{flight_id})
@router.get("/list/all", response_model=list[schemas.FlightRead])
def get_all_flights_debug(
    db: Session = Depends(get_db),
) -> list[schemas.FlightRead]:
    """
    DEBUG ENDPOINT: Get all flights without any filters.
    Use this to check if flights exist in the database.
    URL: /api/flights/list/all
    """
    flights = db.query(models.Flight).order_by(models.Flight.departure_time.desc()).all()
    result = []
    for flight in flights:
        try:
            flight_data = schemas.FlightRead.model_validate(flight)
            result.append(flight_data)
        except Exception as e:
            logging.error(f"Error serializing flight {flight.id}: {e}")
            continue
    logging.info(f"DEBUG: Returning {len(result)} flights (no filters applied)")
    return result


@router.post("/", response_model=schemas.FlightRead, status_code=status.HTTP_201_CREATED)
def create_flight(
    payload: schemas.FlightCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.FlightRead:
    if current_user.role not in {models.UserRole.ADMIN, models.UserRole.VENDOR}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    # Get the plane to verify it belongs to the vendor
    plane = db.get(models.Plane, payload.plane_id)
    if not plane:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aircraft not found")
    
    if current_user.role == models.UserRole.VENDOR:
        if not current_user.vendor or plane.vendor_id != current_user.vendor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Aircraft not found in your inventory")
    
    # Store extended flight data (crew info, etc.) - for now we'll store in a JSON field
    # In a production system, you'd want separate columns for these fields
    extended_data = {
        "flight_number": payload.flight_number,
        "total_seats_available": payload.total_seats_available or plane.seat_capacity,
        "captain_name": payload.captain_name,
        "co_pilot_name": payload.co_pilot_name,
        "attendant_names": payload.attendant_names,
        "emergency_crew_contact": payload.emergency_crew_contact,
        "allowed_luggage_kg": payload.allowed_luggage_kg,
        "special_amenities": payload.special_amenities,
        "notes_for_passengers": payload.notes_for_passengers
    }
    
    
    # Determine vendor_id based on user role
    if current_user.role == models.UserRole.VENDOR:
        if not current_user.vendor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor profile not found")
        vendor_id = current_user.vendor.id
    else:
        # Admin creating flight - use the plane's vendor_id
        vendor_id = plane.vendor_id
    
    flight = models.Flight(
        vendor_id=vendor_id,
        plane_id=payload.plane_id,
        origin=payload.origin,
        destination=payload.destination,
        departure_time=payload.departure_time,
        arrival_time=payload.arrival_time,
        flight_type=payload.flight_type,
        base_price=payload.base_price,
        is_full_charter_only=payload.is_full_charter_only,
    )
    
    # Log flight creation for debugging
    current_time = datetime.utcnow()
    is_future = payload.departure_time >= current_time
    logging.info(f"Creating flight: {payload.origin} → {payload.destination}")
    logging.info(f"  Departure: {payload.departure_time} (UTC)")
    logging.info(f"  Current UTC: {current_time}")
    logging.info(f"  Is future: {is_future}")
    if not is_future:
        logging.warning(f"⚠️  Flight departure time is in the past! It won't show in search results.")
    
    db.add(flight)
    db.commit()
    db.refresh(flight)
    
    logging.info(f"✅ Flight {flight.id} created successfully")
    
    # Create seat inventory for the flight (unless it's full charter only)
    if not payload.is_full_charter_only:
        total_seats = payload.total_seats_available or plane.seat_capacity
        # Create seats with seat numbers (1, 2, 3, etc.)
        for seat_num in range(1, total_seats + 1):
            seat = models.SeatInventory(
                flight_id=flight.id,
                seat_number=str(seat_num),
                class_type="standard",
                price=payload.base_price,
                is_available=True
            )
            db.add(seat)
        db.commit()
    
    # Create response with extended data
    # Note: In production, these fields should be added to the Flight model
    flight_data = schemas.FlightRead.model_validate(flight)
    flight_data.flight_number = payload.flight_number
    flight_data.total_seats_available = payload.total_seats_available or plane.seat_capacity
    flight_data.captain_name = payload.captain_name
    flight_data.co_pilot_name = payload.co_pilot_name
    flight_data.attendant_names = payload.attendant_names
    flight_data.emergency_crew_contact = payload.emergency_crew_contact
    flight_data.allowed_luggage_kg = payload.allowed_luggage_kg
    flight_data.special_amenities = payload.special_amenities
    flight_data.notes_for_passengers = payload.notes_for_passengers
    
    # Calculate available seats for the response
    if not flight.is_full_charter_only:
        available_seats = db.query(func.count(models.SeatInventory.id)).filter(
            models.SeatInventory.flight_id == flight.id,
            models.SeatInventory.is_available == True
        ).scalar() or 0
        flight_data.available_seats = available_seats
    else:
        flight_data.available_seats = None  # Full charter doesn't have individual seats
    
    return flight_data


@router.get("/vendor", response_model=list[schemas.FlightRead])
def get_vendor_flights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[schemas.FlightRead]:
    """Get all flights for the current vendor"""
    if current_user.role != models.UserRole.VENDOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only vendors can access this endpoint")
    
    if not current_user.vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor profile not found")
    
    flights = db.query(models.Flight).filter(
        models.Flight.vendor_id == current_user.vendor.id
    ).order_by(models.Flight.departure_time.desc()).all()
    
    result = []
    for flight in flights:
        flight_data = schemas.FlightRead.model_validate(flight)
        # Calculate available seats
        if not flight.is_full_charter_only:
            available_seats = db.query(func.count(models.SeatInventory.id)).filter(
                models.SeatInventory.flight_id == flight.id,
                models.SeatInventory.is_available == True
            ).scalar() or 0
            flight_data.available_seats = available_seats
        else:
            flight_data.available_seats = None  # Full charter doesn't have seats
        result.append(flight_data)
    
    return result


@router.get("/admin/all", response_model=list[schemas.FlightRead])
def get_all_flights_admin(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[schemas.FlightRead]:
    """Get all flights in the system (admin only). Includes past and future flights."""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can access this endpoint")
    
    # Get all flights, ordered by departure time (newest first)
    flights = db.query(models.Flight).order_by(models.Flight.departure_time.desc()).all()
    
    result = []
    for flight in flights:
        flight_data = schemas.FlightRead.model_validate(flight)
        # Calculate available seats
        if not flight.is_full_charter_only:
            available_seats = db.query(func.count(models.SeatInventory.id)).filter(
                models.SeatInventory.flight_id == flight.id,
                models.SeatInventory.is_available == True
            ).scalar() or 0
            flight_data.available_seats = available_seats
        else:
            flight_data.available_seats = None  # Full charter doesn't have seats
        result.append(flight_data)
    
    return result


@router.get("/", response_model=list[schemas.FlightRead])
async def search_flights(
    origin: str | None = None,
    destination: str | None = None,
    include_return_legs: bool = True,
    include_external: bool = True,
    db: Session = Depends(get_db),
) -> list[schemas.FlightRead]:
    """
    Search for available flights.
    This endpoint is public and allows passengers to see all available flights.
    Only shows future flights (departure_time >= current time).
    
    Combines:
    - Internal flights (from vendors in the system)
    - External flights (from third-party APIs like Aviationstack, if enabled)
    
    Query Parameters:
    - origin: Filter by origin airport/city
    - destination: Filter by destination airport/city
    - include_return_legs: Include return leg flights (default: True)
    - include_external: Include flights from external APIs (default: True)
    """
    try:
        result: List[schemas.FlightRead] = []
        
        # Log the search request
        logging.info("=" * 60)
        logging.info(f"🔍 FLIGHT SEARCH REQUEST")
        logging.info(f"   Origin: {origin}")
        logging.info(f"   Destination: {destination}")
        logging.info(f"   Include External: {include_external}")
        logging.info("=" * 60)
        
        # ============================================================
        # STEP 1: Get internal flights from database (vendor flights)
        # These are flights added by vendors and stored in our database
        # ============================================================
        # Show all flights immediately when vendor creates them (no approval needed)
        # NOTE: This includes ALL manually added flights from vendors - no approval needed!
        query = db.query(models.Flight)
    
        # Check total flights in database
        total_flights = db.query(models.Flight).count()
        logging.info(f"📦 Total flights in database: {total_flights} (includes all manually added vendor flights)")
        
        # Only show future flights (flights that haven't departed yet)
        # Note: This filters out past flights. If you want to see all flights, remove this filter
        current_time = datetime.utcnow()
        logging.info(f"⏰ Current UTC time: {current_time}")
        logging.info(f"⏰ Current date: {current_time.date()}")
        
        # Get sample flights before filtering to help debug
        if total_flights > 0:
            sample_flights = db.query(models.Flight).limit(5).all()
            logging.info(f"📋 Checking {len(sample_flights)} sample flights:")
            for flight in sample_flights:
                is_future = flight.departure_time >= current_time
                time_diff = (flight.departure_time - current_time).total_seconds() / 3600  # hours
                logging.info(f"   Flight {flight.id}: {flight.origin} → {flight.destination}")
                logging.info(f"      Departure: {flight.departure_time} (UTC)")
                logging.info(f"      Is Future: {is_future} (diff: {time_diff:.1f} hours)")
        
        query = query.filter(models.Flight.departure_time >= current_time)
        future_flights_count = query.count()
        logging.info(f"✅ Future flights (after time filter): {future_flights_count} out of {total_flights} total")
        
        if total_flights > 0 and future_flights_count == 0:
            logging.warning(f"⚠️  All {total_flights} flights are in the past!")
            logging.warning("   → Update flight departure times to future dates")
            logging.warning(f"   → Current UTC time: {current_time}")
            logging.warning("   → Check if there's a timezone mismatch (UTC vs local time)")
        
        # Filter by origin if provided (supports both IATA codes and city names)
        if origin:
            try:
                origin_terms = expand_search_terms(origin)
                if origin_terms:
                    # Create OR conditions for all expanded terms
                    origin_filters = [models.Flight.origin.ilike(f"%{term}%") for term in origin_terms]
                    query = query.filter(or_(*origin_filters))
                    logging.info(f"Filtering by origin: {origin} (expanded to: {origin_terms})")
            except Exception as e:
                logging.error(f"Error expanding origin search terms: {e}")
                # Fallback to simple search
                query = query.filter(models.Flight.origin.ilike(f"%{origin}%"))
        
        # Filter by destination if provided (supports both IATA codes and city names)
        if destination:
            try:
                destination_terms = expand_search_terms(destination)
                if destination_terms:
                    # Create OR conditions for all expanded terms
                    destination_filters = [models.Flight.destination.ilike(f"%{term}%") for term in destination_terms]
                    query = query.filter(or_(*destination_filters))
                    logging.info(f"Filtering by destination: {destination} (expanded to: {destination_terms})")
            except Exception as e:
                logging.error(f"Error expanding destination search terms: {e}")
                # Fallback to simple search
                query = query.filter(models.Flight.destination.ilike(f"%{destination}%"))
        
        # Filter out return legs if requested
        if not include_return_legs:
            query = query.filter(models.Flight.flight_type != models.FlightType.RETURN_LEG)
        
        # Order by departure time (earliest first)
        internal_flights = query.order_by(models.Flight.departure_time.asc()).all()
        
        # Log for debugging
        logging.info(f"📊 Search Results:")
        logging.info(f"   Found {len(internal_flights)} internal flights matching criteria")
        if len(internal_flights) > 0:
            for idx, flight in enumerate(internal_flights[:5], 1):  # Show first 5
                logging.info(f"   {idx}. Flight {flight.id}: {flight.origin} → {flight.destination}")
                logging.info(f"      Departure: {flight.departure_time}")
                logging.info(f"      Price: ₹{flight.base_price}")
        else:
            logging.warning("   ⚠️  NO FLIGHTS FOUND!")
            logging.warning("   → Check if flights have future departure times")
            logging.warning("   → Check if origin/destination values match")
        
        # Convert internal flights to response models
        # This processes ALL manually added vendor flights
        logging.info(f"🔄 Processing {len(internal_flights)} manually added flights...")
        if len(internal_flights) == 0:
            logging.warning("   ⚠️  NO FLIGHTS TO PROCESS!")
            logging.warning("   → Check if flights have future departure times")
            logging.warning("   → Check if search filters are too strict")
        else:
            for flight in internal_flights:
                try:
                    logging.info(f"   ✓ Processing flight {flight.id}: {flight.origin} → {flight.destination}")
                    logging.info(f"      Departure: {flight.departure_time} (UTC)")
                    flight_data = schemas.FlightRead.model_validate(flight)
                    # Calculate available seats
                    if not flight.is_full_charter_only:
                        available_seats = db.query(func.count(models.SeatInventory.id)).filter(
                            models.SeatInventory.flight_id == flight.id,
                            models.SeatInventory.is_available == True
                        ).scalar() or 0
                        flight_data.available_seats = available_seats
                    else:
                        flight_data.available_seats = None  # Full charter doesn't have seats
                    
                    # Fetch aircraft (plane) details and images for passenger display
                    plane = db.get(models.Plane, flight.plane_id)
                    if plane:
                        flight_data.model = plane.model
                        # Parse amenities JSON to get extended aircraft details and images
                        if plane.amenities:
                            try:
                                extended = json.loads(plane.amenities)
                                flight_data.manufacturer = extended.get("manufacturer")
                                flight_data.flight_name = extended.get("aircraft_name") or flight.flight_number or f"Flight {flight.id}"
                                # Get all aircraft images
                                aircraft_images = extended.get("aircraft_images") or extended.get("images") or []
                                if isinstance(aircraft_images, list):
                                    flight_data.aircraft_images = aircraft_images
                                elif isinstance(aircraft_images, str):
                                    # If stored as comma-separated string, split it
                                    flight_data.aircraft_images = [img.strip() for img in aircraft_images.split(",") if img.strip()]
                                else:
                                    flight_data.aircraft_images = []
                            except (json.JSONDecodeError, TypeError, AttributeError):
                                # If JSON parsing fails, use defaults
                                flight_data.flight_name = flight.flight_number or f"Flight {flight.id}"
                                flight_data.aircraft_images = []
                        else:
                            # No amenities JSON, use defaults
                            flight_data.flight_name = flight.flight_number or f"Flight {flight.id}"
                            flight_data.aircraft_images = []
                    else:
                        # Plane not found, use defaults
                        flight_data.flight_name = flight.flight_number or f"Flight {flight.id}"
                        flight_data.aircraft_images = []
                    
                    result.append(flight_data)
                    logging.info(f"   ✅ Successfully added manually added flight {flight.id} to results (with {len(flight_data.aircraft_images)} images)")
                except Exception as e:
                    logging.error(f"   ❌ Error serializing manually added flight {flight.id}: {e}", exc_info=True)
                    logging.error(f"      Flight details: origin={flight.origin}, dest={flight.destination}, dep={flight.departure_time}")
                    logging.error(f"      This flight will NOT appear in search results!")
                    continue
        
        # ============================================================
        # STEP 2: Get external flights from third-party APIs (if enabled)
        # These are flights from AviationStack/Amadeus APIs
        # ============================================================
        if include_external:
            try:
                external_api = get_external_flight_api()
                if external_api.is_enabled():
                    external_flights: List[Dict[str, Any]] = []

                    # Try Amadeus first (free tier), then AviationStack
                    try:
                        amadeus_key, amadeus_secret = external_api._get_amadeus_credentials()
                        if amadeus_key and amadeus_secret and origin and destination:
                            external_flights = await external_api.fetch_flights_amadeus(
                                origin=origin,
                                destination=destination,
                                limit=50,
                            )
                            logging.info(f"Fetched {len(external_flights)} flights from Amadeus")
                        else:
                            logging.debug("Skipping Amadeus: credentials or route info missing")
                    except Exception as amadeus_error:
                        logging.warning(f"Amadeus API failed, trying AviationStack: {amadeus_error}")

                        # Fallback to AviationStack
                        try:
                            aviationstack_key = external_api._get_api_key()
                            if aviationstack_key:
                                external_flights = await external_api.fetch_flights_aviationstack(
                                    origin=origin,
                                    destination=destination,
                                    limit=50,  # Limit external results
                                )
                                logging.info(f"Fetched {len(external_flights)} flights from AviationStack")
                            else:
                                logging.debug("Skipping AviationStack: API key missing")
                        except Exception as aviationstack_error:
                            logging.warning(f"AviationStack API also failed: {aviationstack_error}")
                    
                    # Convert external flights to our schema format
                    for ext_flight in external_flights:
                        try:
                            # Create a FlightRead-like object from external data
                            # Since external flights don't have database IDs, we'll create a special format
                            flight_data = schemas.FlightRead(
                                id=0,  # External flights don't have DB IDs
                                vendor_id=0,
                                plane_id=0,
                                origin=ext_flight.get("origin", ""),
                                destination=ext_flight.get("destination", ""),
                                departure_time=datetime.fromisoformat(ext_flight["departure_time"]),
                                arrival_time=datetime.fromisoformat(ext_flight["arrival_time"]),
                                flight_type=models.FlightType.CHARTER,
                                base_price=ext_flight.get("base_price", 0.0),
                                is_full_charter_only=False,
                                flight_number=ext_flight.get("flight_number"),
                                total_seats_available=None,
                                available_seats=None,  # External flights don't have seat inventory
                                captain_name=None,
                                co_pilot_name=None,
                                attendant_names=[],
                                emergency_crew_contact=None,
                                allowed_luggage_kg=None,
                                special_amenities=[],
                                notes_for_passengers=None,
                            )
                            
                            result.append(flight_data)
                        except Exception as e:
                            # Skip invalid external flight data
                            logging.warning(f"Skipping invalid external flight data: {e}")
                            continue
                else:
                    logging.debug("External flight API is not enabled or configured")
            except Exception as e:
                # If external API fails, continue with internal flights only
                logging.warning(f"External API error (continuing with internal flights only): {e}", exc_info=True)
        
        # ============================================================
        # STEP 3: Combine and sort all flights (vendor + API)
        # Both vendor flights and API flights are now in the same result array
        # ============================================================
        # Sort all results by departure time (earliest first)
        result.sort(key=lambda x: x.departure_time)
        
        # Log final combined results
        vendor_count = sum(1 for f in result if f.id > 0)  # Vendor flights have real DB IDs
        api_count = sum(1 for f in result if f.id == 0)  # API flights have id=0
        logging.info(f"📊 Combined Results: {vendor_count} vendor flights + {api_count} API flights = {len(result)} total")
        
        logging.info("=" * 60)
        logging.info(f"✅ RETURNING {len(result)} TOTAL FLIGHTS")
        logging.info("=" * 60)
        if len(result) == 0:
            logging.warning("⚠️  NO FLIGHTS RETURNED!")
            logging.warning(f"   Total flights in DB: {total_flights}")
            logging.warning(f"   Future flights: {future_flights_count}")
            logging.warning(f"   Search filters: origin={origin}, destination={destination}")
            logging.warning("   → Check backend logs above for details")
        return result
    except Exception as e:
        logging.error(f"Error in search_flights endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while searching for flights: {str(e)}"
        )


@router.get("/{flight_id}", response_model=schemas.FlightRead)
def get_flight(flight_id: int, db: Session = Depends(get_db)) -> schemas.FlightRead:
    flight = db.get(models.Flight, flight_id)
    if not flight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flight not found")
    
    flight_data = schemas.FlightRead.model_validate(flight)
    # Calculate available seats
    if not flight.is_full_charter_only:
        available_seats = db.query(func.count(models.SeatInventory.id)).filter(
            models.SeatInventory.flight_id == flight.id,
            models.SeatInventory.is_available == True
        ).scalar() or 0
        flight_data.available_seats = available_seats
    else:
        flight_data.available_seats = None  # Full charter doesn't have seats
    
    # Fetch aircraft (plane) details for passenger display
    plane = db.get(models.Plane, flight.plane_id)
    if plane:
        # Extract manufacturer, model, and aircraft_name from plane
        flight_data.model = plane.model
        
        # Parse amenities JSON to get extended aircraft details
        if plane.amenities:
            try:
                extended = json.loads(plane.amenities)
                flight_data.manufacturer = extended.get("manufacturer")
                flight_data.flight_name = extended.get("aircraft_name") or flight.flight_number or f"Flight {flight.id}"
                # Check if images are stored in amenities (e.g., "aircraft_images" or "images")
                aircraft_images = extended.get("aircraft_images") or extended.get("images") or []
                if isinstance(aircraft_images, list):
                    flight_data.aircraft_images = aircraft_images
                elif isinstance(aircraft_images, str):
                    # If stored as comma-separated string, split it
                    flight_data.aircraft_images = [img.strip() for img in aircraft_images.split(",") if img.strip()]
                else:
                    flight_data.aircraft_images = []
            except (json.JSONDecodeError, TypeError, AttributeError):
                # If JSON parsing fails, use defaults
                flight_data.flight_name = flight.flight_number or f"Flight {flight.id}"
                flight_data.aircraft_images = []
        else:
            # No amenities JSON, use defaults
            flight_data.flight_name = flight.flight_number or f"Flight {flight.id}"
            flight_data.aircraft_images = []
    else:
        # Plane not found, use defaults
        flight_data.flight_name = flight.flight_number or f"Flight {flight.id}"
        flight_data.aircraft_images = []
    
    return flight_data


@router.patch("/{flight_id}", response_model=schemas.FlightRead)
def update_flight(
    flight_id: int,
    payload: schemas.FlightUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.FlightRead:
    """Update flight information. Vendors can only update their own flights."""
    flight = db.get(models.Flight, flight_id)
    if not flight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flight not found")
    
    # Check permissions
    if current_user.role == models.UserRole.VENDOR:
        # Query vendor separately to ensure it's loaded
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Vendor profile not found. Please complete your vendor application."
            )
        if flight.vendor_id != vendor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own flights")
    elif current_user.role == models.UserRole.ADMIN:
        # Admins can edit any flight
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Insufficient permissions. Your role: {current_user.role.value}. Only vendors and admins can edit flights."
        )
    
    # Update fields if provided
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(flight, field, value)
    
    db.commit()
    db.refresh(flight)
    
    # Calculate available seats for response
    flight_data = schemas.FlightRead.model_validate(flight)
    if not flight.is_full_charter_only:
        available_seats = db.query(func.count(models.SeatInventory.id)).filter(
            models.SeatInventory.flight_id == flight.id,
            models.SeatInventory.is_available == True
        ).scalar() or 0
        flight_data.available_seats = available_seats
    else:
        flight_data.available_seats = None
    
    return flight_data


@router.delete(
    "/{flight_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_flight(
    flight_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> None:
    """Delete a flight. Vendors can only delete their own flights."""
    flight = db.get(models.Flight, flight_id)
    if not flight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flight not found")
    
    # Check permissions
    if current_user.role == models.UserRole.VENDOR:
        # Query vendor separately to ensure it's loaded
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Vendor profile not found. Please complete your vendor application."
            )
        if flight.vendor_id != vendor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="You can only delete your own flights"
            )
    elif current_user.role == models.UserRole.ADMIN:
        # Admins can delete any flight
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Insufficient permissions. Your role: {current_user.role.value}. Only vendors and admins can delete flights."
        )
    
    # Check if flight has confirmed bookings (vendors cannot delete, but admins can)
    confirmed_bookings = db.query(func.count(models.Booking.id)).filter(
        models.Booking.flight_id == flight_id,
        models.Booking.status == models.BookingStatus.CONFIRMED
    ).scalar() or 0
    
    if confirmed_bookings > 0 and current_user.role == models.UserRole.VENDOR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete flight with {confirmed_bookings} confirmed booking(s). Please cancel bookings first or contact an admin."
        )
    # Admins can delete flights even with confirmed bookings (for emergency cases)
    
    db.delete(flight)
    db.commit()

