#!/usr/bin/env python3
"""
Create OTP verification table if it doesn't exist
Run this script to create the otp_verifications table in your database
"""

from sqlalchemy import create_engine, text
from app.config import get_settings
from app.database import Base, engine
from app import models  # Import models to register them with Base

def create_otp_table():
    """Create otp_verifications table if it doesn't exist"""
    settings = get_settings()
    
    print("=" * 60)
    print("Creating OTP Verification Table")
    print("=" * 60)
    
    try:
        # Check if table exists
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'otp_verifications'
                );
            """))
            table_exists = result.scalar()
            
            if table_exists:
                print("[INFO] Table 'otp_verifications' already exists.")
                return True
            
            print("[INFO] Table 'otp_verifications' does not exist. Creating...")
            
            # Create the table using SQLAlchemy
            Base.metadata.create_all(bind=engine, tables=[models.OtpVerification.__table__])
            
            print("[OK] Table 'otp_verifications' created successfully!")
            return True
            
    except Exception as e:
        print(f"[ERROR] Error creating table: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    create_otp_table()

