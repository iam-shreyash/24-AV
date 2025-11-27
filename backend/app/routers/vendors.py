from datetime import datetime
import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_role


router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOADS_DIR = Path("uploads/vendor_documents")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/application", response_model=schemas.VendorRead, status_code=status.HTTP_200_OK)
async def submit_vendor_application(
    company_name: str = Form(...),
    owner_name: Optional[str] = Form(default=None),
    business_background: Optional[str] = Form(default=None),
    business_background_other: Optional[str] = Form(default=None),
    license_number: Optional[str] = Form(default=None),
    business_registration_number: Optional[str] = Form(default=None),
    tax_id: Optional[str] = Form(default=None),
    contact_phone: Optional[str] = Form(default=None),
    phone: Optional[str] = Form(default=None),
    business_address: Optional[str] = Form(default=None),
    city: Optional[str] = Form(default=None),
    state: Optional[str] = Form(default=None),
    district: Optional[str] = Form(default=None),
    country: Optional[str] = Form(default=None),
    zip_code: Optional[str] = Form(default=None),
    website: Optional[str] = Form(default=None),
    years_in_business: Optional[str] = Form(default=None),
    number_of_aircraft: Optional[str] = Form(default=None),
    description: Optional[str] = Form(default=None),
    contact_person_name: Optional[str] = Form(default=None),
    contact_person_designation: Optional[str] = Form(default=None),
    contact_person_email: Optional[str] = Form(default=None),
    bank_account_number: Optional[str] = Form(default=None),
    bank_name: Optional[str] = Form(default=None),
    bank_ifsc: Optional[str] = Form(default=None),
    bank_branch: Optional[str] = Form(default=None),
    account_holder_name: Optional[str] = Form(default=None),
    certificate_of_incorporation: Optional[UploadFile] = File(default=None),
    gst_certificate: Optional[UploadFile] = File(default=None),
    owner_kyc_document: Optional[UploadFile] = File(default=None),
    owner_kyc_address_proof: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.VendorRead:
    """Submit or update vendor application with document uploads"""
    try:
        if current_user.role != models.UserRole.VENDOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only vendors can submit applications"
            )
        
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if not vendor:
            # Create vendor record if it doesn't exist (for users who registered before vendor creation was added)
            vendor = models.Vendor(
                user_id=current_user.id,
                company_name="Pending Application",
                approval_status="pending"
            )
            db.add(vendor)
            db.commit()
            db.refresh(vendor)
        
        # Validate required documents
        if not certificate_of_incorporation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Certificate of Incorporation is required"
            )
        if not gst_certificate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GST Certificate is required"
            )
        if not owner_kyc_document:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Owner KYC document is required"
            )
        
        # Save files to local storage
        async def save_file(file: UploadFile, vendor_id: int, document_type: str) -> str:
            """Save uploaded file and return the file path"""
            # Validate file size (10 MB max)
            MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
            
            # Get file extension
            file_ext = Path(file.filename).suffix if file.filename else ""
            # Create unique filename: vendor_id_documenttype_timestamp.ext
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"vendor_{vendor_id}_{document_type}_{timestamp}{file_ext}"
            file_path = UPLOADS_DIR / filename
            
            # Ensure directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Read and save file (check size while reading)
            contents = await file.read()
            if len(contents) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{document_type.replace('_', ' ').title()} file size exceeds 10 MB limit"
                )
            
            # Save file
            with open(file_path, "wb") as f:
                f.write(contents)
            
            # Return relative path for storage in database
            return str(file_path)
        
        # Save documents
        cert_inc_path = None
        gst_cert_path = None
        kyc_doc_path = None
        kyc_address_path = None
        
        if certificate_of_incorporation:
            cert_inc_path = await save_file(certificate_of_incorporation, vendor.id, "cert_incorporation")
        if gst_certificate:
            gst_cert_path = await save_file(gst_certificate, vendor.id, "gst_certificate")
        if owner_kyc_document:
            kyc_doc_path = await save_file(owner_kyc_document, vendor.id, "owner_kyc")
        if owner_kyc_address_proof:
            kyc_address_path = await save_file(owner_kyc_address_proof, vendor.id, "owner_kyc_address")
        
        # Update vendor application details
        vendor.company_name = company_name
        vendor.owner_name = owner_name if owner_name and owner_name.strip() else None
        vendor.business_background = business_background if business_background and business_background.strip() else None
        vendor.business_background_other = business_background_other if business_background_other and business_background_other.strip() else None
        vendor.license_number = license_number if license_number and license_number.strip() else None
        vendor.business_registration_number = business_registration_number if business_registration_number and business_registration_number.strip() else None
        vendor.tax_id = tax_id if tax_id and tax_id.strip() else None
        vendor.contact_phone = contact_phone if contact_phone and contact_phone.strip() else None
        vendor.phone = phone if phone and phone.strip() else None
        vendor.business_address = business_address if business_address and business_address.strip() else None
        vendor.city = city if city and city.strip() else None
        vendor.state = state if state and state.strip() else None
        vendor.district = district if district and district.strip() else None
        vendor.country = country if country and country.strip() else None
        vendor.zip_code = zip_code if zip_code and zip_code.strip() else None
        vendor.website = website if website and website.strip() else None
        # Convert string to int for numeric fields
        try:
            vendor.years_in_business = int(years_in_business) if years_in_business and years_in_business.strip() else None
        except (ValueError, TypeError):
            vendor.years_in_business = None
        try:
            vendor.number_of_aircraft = int(number_of_aircraft) if number_of_aircraft and number_of_aircraft.strip() else None
        except (ValueError, TypeError):
            vendor.number_of_aircraft = None
        vendor.description = description if description and description.strip() else None
        vendor.contact_person_name = contact_person_name if contact_person_name and contact_person_name.strip() else None
        vendor.contact_person_designation = contact_person_designation if contact_person_designation and contact_person_designation.strip() else None
        vendor.contact_person_email = contact_person_email if contact_person_email and contact_person_email.strip() else None
        vendor.bank_account_number = bank_account_number if bank_account_number and bank_account_number.strip() else None
        vendor.bank_name = bank_name if bank_name and bank_name.strip() else None
        vendor.bank_ifsc = bank_ifsc if bank_ifsc and bank_ifsc.strip() else None
        vendor.bank_branch = bank_branch if bank_branch and bank_branch.strip() else None
        vendor.account_holder_name = account_holder_name if account_holder_name and account_holder_name.strip() else None
        
        # Update document paths (only if new files were uploaded)
        if cert_inc_path:
            vendor.certificate_of_incorporation_path = cert_inc_path
        if gst_cert_path:
            vendor.gst_certificate_path = gst_cert_path
        if kyc_doc_path:
            vendor.owner_kyc_document_path = kyc_doc_path
        if kyc_address_path:
            vendor.owner_kyc_address_proof_path = kyc_address_path
        
        # Reset to pending if updating application
        if vendor.approval_status != "pending":
            vendor.approval_status = "pending"
            vendor.approval_notes = None
            vendor.approved_by = None
            vendor.approved_at = None
        
        db.commit()
        db.refresh(vendor)
        return schemas.VendorRead.model_validate(vendor)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        print(f"Error submitting vendor application: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application: {str(e)}"
        )


@router.get("/application", response_model=schemas.VendorRead)
def get_vendor_application(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.VendorRead:
    """Get current vendor's application"""
    if current_user.role != models.UserRole.VENDOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors can view their application"
        )
    
    vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor record not found")
    
    return schemas.VendorRead.model_validate(vendor)


@router.post("/", response_model=schemas.VendorRead, status_code=status.HTTP_201_CREATED)
def create_vendor(
    payload: schemas.VendorCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> schemas.VendorRead:
    vendor = models.Vendor(
        user_id=None,  # Will be linked after vendor user registration
        company_name=payload.company_name,
        license_number=payload.license_number,
        approval_status="approved",
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return schemas.VendorRead.model_validate(vendor)


@router.get("/", response_model=list[schemas.VendorRead])
def list_vendors(
    approval_status: str | None = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> list[schemas.VendorRead]:
    """List all vendors, optionally filtered by approval status"""
    query = db.query(models.Vendor)
    if approval_status:
        query = query.filter(models.Vendor.approval_status == approval_status)
    vendors = query.all()
    return [schemas.VendorRead.model_validate(v) for v in vendors]


@router.get("/pending", response_model=list[schemas.VendorRead])
def list_pending_vendors(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> list[schemas.VendorRead]:
    """List all pending vendor applications"""
    vendors = db.query(models.Vendor).filter(models.Vendor.approval_status == "pending").all()
    return [schemas.VendorRead.model_validate(v) for v in vendors]


@router.patch("/{vendor_id}/approve", response_model=schemas.VendorRead)
def approve_vendor(
    vendor_id: int,
    approval: schemas.VendorApprovalRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> schemas.VendorRead:
    """Approve or reject vendor application"""
    vendor = db.get(models.Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    
    if approval.approval_status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="approval_status must be 'approved' or 'rejected'"
        )
    
    vendor.approval_status = approval.approval_status
    vendor.approval_notes = approval.approval_notes
    vendor.approved_by = current_user.id
    vendor.approved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(vendor)
    return schemas.VendorRead.model_validate(vendor)


@router.patch("/{vendor_id}", response_model=schemas.VendorRead)
def update_vendor(
    vendor_id: int,
    payload: schemas.VendorApplicationUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> schemas.VendorRead:
    """Update vendor information (admin only)"""
    vendor = db.get(models.Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    
    # Update all vendor fields
    vendor.company_name = payload.company_name
    vendor.owner_name = payload.owner_name
    vendor.business_background = payload.business_background
    vendor.business_background_other = payload.business_background_other
    vendor.license_number = payload.license_number
    vendor.business_registration_number = payload.business_registration_number
    vendor.tax_id = payload.tax_id
    vendor.contact_phone = payload.contact_phone
    vendor.phone = payload.phone
    vendor.business_address = payload.business_address
    vendor.city = payload.city
    vendor.state = payload.state
    vendor.district = payload.district
    vendor.country = payload.country
    vendor.zip_code = payload.zip_code
    vendor.website = payload.website
    vendor.years_in_business = payload.years_in_business
    vendor.number_of_aircraft = payload.number_of_aircraft
    vendor.description = payload.description
    vendor.contact_person_name = payload.contact_person_name
    vendor.contact_person_designation = payload.contact_person_designation
    vendor.contact_person_email = payload.contact_person_email
    vendor.bank_account_number = payload.bank_account_number
    vendor.bank_name = payload.bank_name
    vendor.bank_ifsc = payload.bank_ifsc
    vendor.bank_branch = payload.bank_branch
    vendor.account_holder_name = payload.account_holder_name
    
    db.commit()
    db.refresh(vendor)
    return schemas.VendorRead.model_validate(vendor)


@router.put("/{vendor_id}/deactivate", status_code=status.HTTP_200_OK)
def deactivate_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> dict:
    """Deactivate a vendor account (admin only)"""
    vendor = db.get(models.Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    
    vendor.is_active = False
    # Also update the user's is_active status
    user = db.get(models.User, vendor.user_id)
    if user:
        user.is_active = False
    db.commit()
    db.refresh(vendor)
    if user:
        db.refresh(user)
    
    return {
        "success": True,
        "message": "Vendor account deactivated successfully"
    }


@router.put("/{vendor_id}/activate", status_code=status.HTTP_200_OK)
def activate_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> dict:
    """Activate a vendor account (admin only)"""
    vendor = db.get(models.Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    
    vendor.is_active = True
    # Also update the user's is_active status
    user = db.get(models.User, vendor.user_id)
    if user:
        user.is_active = True
    db.commit()
    db.refresh(vendor)
    if user:
        db.refresh(user)
    
    return {
        "success": True,
        "message": "Vendor account activated successfully"
    }


@router.get("/recent-bookings", response_model=list[schemas.BookingRead])
def get_recent_bookings(
    vendor_id: int | None = None,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[schemas.BookingRead]:
    """
    Get recent bookings for a vendor.
    If vendor_id is provided, it must match the current user's vendor ID (for vendors) or be accessible by admin.
    """
    # Determine which vendor to query
    if current_user.role == models.UserRole.VENDOR:
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if not vendor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor record not found")
        query_vendor_id = vendor.id
    elif current_user.role == models.UserRole.ADMIN:
        if vendor_id:
            query_vendor_id = vendor_id
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="vendor_id is required for admin users"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors and admins can access this endpoint"
        )
    
    # Query bookings for this vendor's flights
    bookings = db.query(models.Booking).join(models.Flight).filter(
        models.Flight.vendor_id == query_vendor_id,
        models.Booking.status.in_([models.BookingStatus.CONFIRMED, models.BookingStatus.PENDING])
    ).order_by(models.Booking.booked_at.desc()).limit(limit).all()
    
    return [schemas.BookingRead.model_validate(b) for b in bookings]


@router.get("/notifications", response_model=list[schemas.VendorNotificationRead])
def get_vendor_notifications(
    unread_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[schemas.VendorNotificationRead]:
    """Get notifications for the current vendor"""
    if current_user.role != models.UserRole.VENDOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors can access notifications"
        )
    
    vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor record not found")
    
    query = db.query(models.VendorNotification).filter(
        models.VendorNotification.vendor_id == vendor.id
    )
    
    if unread_only:
        query = query.filter(models.VendorNotification.is_read == False)
    
    notifications = query.order_by(models.VendorNotification.created_at.desc()).limit(limit).all()
    
    # Load booking data for each notification
    result = []
    for notif in notifications:
        notif_data = schemas.VendorNotificationRead.model_validate(notif)
        booking = db.get(models.Booking, notif.booking_id)
        if booking:
            notif_data.booking = schemas.BookingRead.model_validate(booking)
        result.append(notif_data)
    
    return result


@router.patch("/notifications/{notification_id}/read", response_model=schemas.VendorNotificationRead)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.VendorNotificationRead:
    """Mark a notification as read"""
    if current_user.role != models.UserRole.VENDOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors can mark notifications as read"
        )
    
    vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor record not found")
    
    notification = db.query(models.VendorNotification).filter(
        models.VendorNotification.id == notification_id,
        models.VendorNotification.vendor_id == vendor.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    
    notif_data = schemas.VendorNotificationRead.model_validate(notification)
    booking = db.get(models.Booking, notification.booking_id)
    if booking:
        notif_data.booking = schemas.BookingRead.model_validate(booking)
    
    return notif_data


@router.get("/{vendor_id}/documents/{document_type}")
async def get_vendor_document(
    vendor_id: int,
    document_type: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Get vendor document file (admin only)"""
    vendor = db.get(models.Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    
    # Map document type to file path
    document_paths = {
        "certificate_of_incorporation": vendor.certificate_of_incorporation_path,
        "gst_certificate": vendor.gst_certificate_path,
        "owner_kyc": vendor.owner_kyc_document_path,
        "owner_kyc_address": vendor.owner_kyc_address_proof_path,
    }
    
    file_path = document_paths.get(document_type)
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document type '{document_type}' not found or not uploaded"
        )
    
    # Check if file exists - handle both absolute and relative paths
    full_path = Path(file_path)
    if not full_path.is_absolute():
        # If relative path, resolve from backend directory
        backend_dir = Path(__file__).parent.parent.parent
        full_path = backend_dir / file_path
    
    if not full_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document file not found on server: {full_path}"
        )
    
    # Determine media type based on file extension
    file_ext = full_path.suffix.lower()
    media_types = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
    }
    media_type = media_types.get(file_ext, "application/octet-stream")
    
    return FileResponse(
        path=str(full_path),
        media_type=media_type,
        filename=full_path.name
    )