"""
Migration script to add vendor_notifications table
Run this script to add the vendor_notifications table to your database.
"""
from sqlalchemy import text
from app.config import get_settings
from app.database import engine

def migrate():
    settings = get_settings()
    print("=" * 60)
    print("Migration: Add Vendor Notifications Table")
    print("=" * 60)
    
    try:
        with engine.connect() as conn:
            # Check if table already exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'vendor_notifications'
                )
            """))
            table_exists = result.scalar()
            
            if table_exists:
                print("[INFO] vendor_notifications table already exists. Migration not needed.")
                return True
            
            print("\nCreating vendor_notifications table...")
            
            conn.execute(text("""
                CREATE TABLE vendor_notifications (
                    id SERIAL PRIMARY KEY,
                    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
                    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
                    notification_type VARCHAR(50) DEFAULT 'new_booking',
                    message TEXT,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Create indexes for better query performance
            conn.execute(text("""
                CREATE INDEX idx_vendor_notifications_vendor_id ON vendor_notifications(vendor_id)
            """))
            
            conn.execute(text("""
                CREATE INDEX idx_vendor_notifications_booking_id ON vendor_notifications(booking_id)
            """))
            
            conn.execute(text("""
                CREATE INDEX idx_vendor_notifications_is_read ON vendor_notifications(is_read)
            """))
            
            conn.execute(text("""
                CREATE INDEX idx_vendor_notifications_created_at ON vendor_notifications(created_at DESC)
            """))
            
            conn.commit()
            print("[OK] Migration completed successfully!")
            print("\nCreated:")
            print("  - vendor_notifications table")
            print("  - Indexes for vendor_id, booking_id, is_read, and created_at")
            return True
            
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        import traceback
        print(traceback.format_exc())
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

