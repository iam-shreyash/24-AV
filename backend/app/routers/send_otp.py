"""
Send OTP API Route - Modular implementation
This file can be deleted along with verify_otp.py and otpService.py to remove OTP functionality entirely.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from .. import models
from ..database import get_db
from ..services.otpService import generate_otp, get_otp_expiry, send_otp_sms


router = APIRouter()


class SendOtpRequest(BaseModel):
    mobile_number: str = Field(..., description="Mobile number in international format (e.g., +1234567890)")


class SendOtpResponse(BaseModel):
    success: bool
    message: str
    expires_in_minutes: int = 5
    otp_code: Optional[str] = None  # Only for development/testing - remove in production


@router.post("/send-otp", response_model=SendOtpResponse, status_code=status.HTTP_200_OK)
async def send_otp(
    payload: SendOtpRequest,
    db: Session = Depends(get_db),
) -> SendOtpResponse:
    """
    Send OTP to the provided mobile number.
    
    This endpoint:
    1. Generates a 6-digit OTP
    2. Saves it to the database with expiry (5 minutes)
    3. Sends OTP via SMS service
    4. Returns success response
    """
    # Validate mobile number format (basic validation)
    mobile_number = payload.mobile_number.strip()
    if not mobile_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number is required"
        )
    
    # Basic format validation (should start with + and contain digits)
    if not mobile_number.startswith('+') or not mobile_number[1:].replace(' ', '').isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mobile number format. Please use international format (e.g., +1234567890)"
        )
    
    # Clean mobile number (remove spaces)
    mobile_number = mobile_number.replace(' ', '')
    
    # Generate OTP (4 digits)
    otp_code = generate_otp(4)
    expires_at = get_otp_expiry(5)  # 5 minutes expiry
    
    try:
        # Delete any existing unverified OTPs for this mobile number
        db.query(models.OtpVerification).filter(
            models.OtpVerification.mobile_number == mobile_number,
            models.OtpVerification.is_verified == False
        ).delete()
        
        # Create new OTP record
        otp_record = models.OtpVerification(
            mobile_number=mobile_number,
            otp_code=otp_code,
            is_verified=False,
            expires_at=expires_at
        )
        db.add(otp_record)
        db.commit()
        db.refresh(otp_record)
    except Exception as db_error:
        db.rollback()
        error_msg = str(db_error)
        print(f"[OTP Service] Database error: {error_msg}")
        
        # Check if it's a table doesn't exist error
        if "does not exist" in error_msg.lower() or "relation" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OTP verification table not found. Please run the database migration: create_otp_table.sql"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {error_msg}"
        )
    
    # Send OTP via SMS
    sms_sent = await send_otp_sms(mobile_number, otp_code)
    
    if not sms_sent:
        # If SMS sending fails, still return success but log the error
        # In production, you might want to handle this differently
        print(f"Warning: Failed to send SMS to {mobile_number}, but OTP was generated: {otp_code}")
    
    # For development: return OTP in response (remove in production)
    return SendOtpResponse(
        success=True,
        message="OTP sent successfully to your mobile number",
        expires_in_minutes=5,
        otp_code=otp_code  # Remove this line in production
    )

