"""
Delete Vendor API Route - Modular implementation
This file can be deleted along with DeleteVendorButton.tsx to remove the delete vendor feature entirely.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import delete
from pathlib import Path
import os

from .. import models
from ..database import get_db
from ..dependencies import require_role


router = APIRouter()


@router.delete("/{vendor_id}", status_code=status.HTTP_200_OK)
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> dict:
    """
    Delete a vendor account and all related vendor data (admin only).

    This will:
    - Delete the vendor record
    - Delete the associated user account (cascade)
    - Delete all related data (planes, flights, bookings) through cascade
    - Delete uploaded vendor documents from the filesystem
    """
    vendor = db.get(models.Vendor, vendor_id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )

    # Store user_id before deletion (needed for document cleanup and user deletion)
    user_id = vendor.user_id
    company_name = vendor.company_name

    # Get vendor documents paths before deletion
    document_paths = [
        vendor.certificate_of_incorporation_path,
        vendor.gst_certificate_path,
        vendor.owner_kyc_document_path,
        vendor.owner_kyc_address_proof_path,
    ]

    # Get the user to delete
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated user account not found"
        )

    # Delete related records manually to avoid SQLAlchemy relationship issues
    # This ensures CASCADE works properly at the database level

    # 1. Delete bookings associated with the vendor's flights
    # Fetch flights first to get their IDs
    flights_to_delete_ids = [f.id for f in db.query(models.Flight).filter(models.Flight.vendor_id == vendor_id).all()]
    if flights_to_delete_ids:
        db.execute(delete(models.Booking).where(models.Booking.flight_id.in_(flights_to_delete_ids)))

    # 2. Delete seat_inventory associated with the vendor's flights
    if flights_to_delete_ids:
        db.execute(delete(models.SeatInventory).where(models.SeatInventory.flight_id.in_(flights_to_delete_ids)))

    # 3. Delete flights (they reference planes)
    db.execute(delete(models.Flight).where(models.Flight.vendor_id == vendor_id))

    # 4. Delete planes (they reference vendor)
    db.execute(delete(models.Plane).where(models.Plane.vendor_id == vendor_id))

    # 5. Now delete the vendor record
    db.delete(vendor)

    # 6. Finally delete the user account
    db.delete(user)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete vendor: {str(e)}"
        )

    # Verify deletion (both should be None after successful deletion)
    deleted_vendor = db.get(models.Vendor, vendor_id)
    deleted_user = db.get(models.User, user_id)

    if deleted_vendor is not None or deleted_user is not None:
        # Deletion verification failed
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify vendor deletion. Please check the database."
        )

    # Clean up uploaded vendor documents from filesystem
    try:
        for doc_path in document_paths:
            if doc_path:
                # Handle both absolute and relative paths
                full_path = Path(doc_path)
                if not full_path.is_absolute():
                    # If relative path, resolve from backend directory
                    backend_dir = Path(__file__).parent.parent.parent
                    full_path = backend_dir / doc_path

                # Delete file if it exists
                if full_path.exists() and full_path.is_file():
                    try:
                        os.remove(full_path)
                    except OSError as e:
                        # Log but don't fail the request if file deletion fails
                        print(f"Warning: Could not delete document file {full_path}: {e}")
    except Exception as e:
        # Log but don't fail the request if document cleanup fails
        print(f"Warning: Error during document cleanup: {e}")

    return {
        "success": True,
        "message": f"Vendor '{company_name}' and all related data deleted successfully"
    }
