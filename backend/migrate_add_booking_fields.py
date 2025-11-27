#!/usr/bin/env python3
"""
Migration script to add passenger details fields to bookings table.
Run this script if you have an existing database with bookings table.
"""

from sqlalchemy import text
from app.config import get_settings
from app.database import engine

def migrate():
    """Add new columns to bookings table"""
    settings = get_settings()
    print("=" * 60)
    print("Migration: Add Passenger Details to Bookings Table")
    print("=" * 60)
    
    try:
        with engine.connect() as conn:
            # Check if columns already exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'bookings' 
                AND column_name IN ('passenger_name', 'passenger_email', 'passenger_phone')
            """))
            existing_columns = [row[0] for row in result]
            
            if 'passenger_name' in existing_columns:
                print("[INFO] New columns already exist. Migration not needed.")
                return True
            
            print("\nAdding new columns to bookings table...")
            
            # Add new columns
            conn.execute(text("""
                ALTER TABLE bookings 
                ADD COLUMN IF NOT EXISTS passenger_name VARCHAR(255),
                ADD COLUMN IF NOT EXISTS passenger_email VARCHAR(255),
                ADD COLUMN IF NOT EXISTS passenger_phone VARCHAR(20),
                ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
                ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
                ADD COLUMN IF NOT EXISTS special_requests TEXT
            """))
            
            conn.commit()
            print("[OK] Migration completed successfully!")
            print("\nAdded columns:")
            print("  - passenger_name")
            print("  - passenger_email")
            print("  - passenger_phone")
            print("  - emergency_contact_name")
            print("  - emergency_contact_phone")
            print("  - special_requests")
            return True
            
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = migrate()
    if success:
        print("\n" + "=" * 60)
        print("[SUCCESS] Migration completed!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("[ERROR] Migration failed!")
        print("=" * 60)
        exit(1)

