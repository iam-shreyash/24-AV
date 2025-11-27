"""
OTP Service - Modular implementation
This file can be deleted to remove OTP functionality entirely.
"""

import random
import string
import os
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


def generate_otp(length: int = 4) -> str:
    """
    Generate a random numeric OTP of specified length.
    Default is 4 digits.
    """
    return ''.join(random.choices(string.digits, k=length))


def get_otp_expiry(minutes: int = 5) -> datetime:
    """
    Get the expiry datetime for an OTP.
    Default expiry is 5 minutes from now.
    """
    return datetime.utcnow() + timedelta(minutes=minutes)


def is_otp_expired(expires_at: datetime) -> bool:
    """
    Check if an OTP has expired.
    """
    return datetime.utcnow() > expires_at


async def send_otp_sms(mobile_number: str, otp: str) -> bool:
    """
    Send OTP via SMS service.
    
    Supports multiple SMS providers:
    - Twilio (free trial: $15.50 credit, ~1000 SMS)
    - MSG91 (popular in India, free trial available)
    - Development mode (just logs OTP)
    
    Configure via environment variables:
    - SMS_PROVIDER: "twilio", "msg91", or "dev" (default: "dev")
    - For Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
    - For MSG91: MSG91_AUTH_KEY, MSG91_SENDER_ID, MSG91_TEMPLATE_ID (optional)
    
    Args:
        mobile_number: The mobile number to send OTP to (format: +1234567890)
        otp: The OTP code to send
    
    Returns:
        bool: True if SMS sent successfully, False otherwise
    """
    sms_provider = os.getenv("SMS_PROVIDER", "dev").lower()
    
    if sms_provider == "twilio":
        return await _send_via_twilio(mobile_number, otp)
    elif sms_provider == "msg91":
        return await _send_via_msg91(mobile_number, otp)
    else:
        # Development mode: just log the OTP
        print(f"[OTP Service] Sending OTP {otp} to {mobile_number}")
        print(f"[OTP Service] Development mode - SMS not actually sent")
        print(f"[OTP Service] To enable real SMS, set SMS_PROVIDER=twilio or SMS_PROVIDER=msg91 in .env")
        return True


async def _send_via_twilio(mobile_number: str, otp: str) -> bool:
    """
    Send OTP via Twilio SMS service.
    
    Free trial: Sign up at https://www.twilio.com/try-twilio
    Get $15.50 free credit (~1000 SMS messages)
    """
    try:
        from twilio.rest import Client
        
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        if not all([account_sid, auth_token, twilio_phone]):
            print("[OTP Service] Twilio credentials not configured. Check .env file.")
            return False
        
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=f"Your OTP is: {otp}. Valid for 5 minutes.",
            from_=twilio_phone,
            to=mobile_number
        )
        
        if message.sid:
            print(f"[OTP Service] Twilio SMS sent successfully. SID: {message.sid}")
            return True
        return False
    except ImportError:
        print("[OTP Service] Twilio library not installed. Run: pip install twilio")
        return False
    except Exception as e:
        print(f"[OTP Service] Twilio error: {str(e)}")
        return False


async def _send_via_msg91(mobile_number: str, otp: str) -> bool:
    """
    Send OTP via MSG91 SMS service.
    
    Popular in India. Sign up at https://msg91.com/
    Free trial available.
    """
    try:
        import httpx
        
        auth_key = os.getenv("MSG91_AUTH_KEY")
        sender_id = os.getenv("MSG91_SENDER_ID", "OTPMSG")  # Default sender ID
        template_id = os.getenv("MSG91_TEMPLATE_ID")  # Optional
        
        if not auth_key:
            print("[OTP Service] MSG91 AUTH_KEY not configured. Check .env file.")
            return False
        
        # Remove + from mobile number for MSG91
        mobile_clean = mobile_number.replace("+", "")
        
        # MSG91 API endpoint
        url = "https://control.msg91.com/api/v5/flow/"
        
        # Prepare message
        message = f"Your OTP is {otp}. Valid for 5 minutes."
        
        # MSG91 API payload
        payload = {
            "template_id": template_id,  # Optional: if you have a template
            "sender": sender_id,
            "short_url": "0",  # Disable URL shortening
            "mobiles": mobile_clean,
            "message": message
        }
        
        # Use simple SMS API (works without template)
        url = "https://control.msg91.com/api/sendhttp.php"
        params = {
            "authkey": auth_key,
            "mobiles": mobile_clean,
            "message": message,
            "sender": sender_id,
            "route": "4",  # Transactional route
            "country": "91" if mobile_clean.startswith("91") else "0"  # 0 for international
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                result = response.text.strip()
                # MSG91 returns request ID (numeric) on success, error codes on failure
                if result and result.isdigit() and not result.startswith("402"):  # 402 = invalid credentials
                    print(f"[OTP Service] MSG91 SMS sent successfully. Request ID: {result}")
                    return True
                else:
                    print(f"[OTP Service] MSG91 error: {result}")
                    return False
            return False
            
    except ImportError:
        print("[OTP Service] httpx library required for MSG91. Already installed.")
        return False
    except Exception as e:
        print(f"[OTP Service] MSG91 error: {str(e)}")
        return False

