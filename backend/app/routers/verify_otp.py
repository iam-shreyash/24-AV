"""
Verify OTP API Route - Modular implementation
This file can be deleted along with send_otp.py and otpService.py to remove OTP functionality entirely.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime

from .. import models
from ..database import get_db
from ..services.otpService import is_otp_expired


router = APIRouter()


class VerifyOtpRequest(BaseModel):
    mobile_number: str = Field(..., description="Mobile number in international format")
    otp_code: str = Field(..., min_length=4, max_length=4, description="4-digit OTP code")


class VerifyOtpResponse(BaseModel):
    success: bool
    message: str
    mobile_verified: bool


@router.post("/verify-otp", response_model=VerifyOtpResponse, status_code=status.HTTP_200_OK)
def verify_otp(
    payload: VerifyOtpRequest,
    db: Session = Depends(get_db),
) -> VerifyOtpResponse:
    """
    Verify OTP for the provided mobile number.
    
    This endpoint:
    1. Finds the OTP record for the mobile number
    2. Checks if OTP matches and hasn't expired
    3. Marks OTP as verified if valid
    4. Returns success/error response
    """
    # Clean mobile number
    mobile_number = payload.mobile_number.strip().replace(' ', '')
    otp_code = payload.otp_code.strip()
    
    # Find the most recent unverified OTP for this mobile number
    otp_record = db.query(models.OtpVerification).filter(
        models.OtpVerification.mobile_number == mobile_number,
        models.OtpVerification.is_verified == False
    ).order_by(models.OtpVerification.created_at.desc()).first()
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No OTP found for this mobile number. Please request a new OTP."
        )
    
    # Check if OTP has expired
    if is_otp_expired(otp_record.expires_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new OTP."
        )
    
    # Verify OTP code
    if otp_record.otp_code != otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. Please check and try again."
        )
    
    # Mark OTP as verified
    otp_record.is_verified = True
    otp_record.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(otp_record)
    
    return VerifyOtpResponse(
        success=True,
        message="Mobile number verified successfully",
        mobile_verified=True
    )

