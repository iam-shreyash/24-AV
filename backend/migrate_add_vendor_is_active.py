"""
Migration script to add is_active column to vendors table
Run this script to add the is_active column if it doesn't exist
"""
from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

def migrate_vendor_is_active():
    """Add is_active column to vendors table if it doesn't exist"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'vendors' AND column_name = 'is_active'
            """))
            
            if result.fetchone() is None:
                # Column doesn't exist, add it
                print("[INFO] Adding is_active column to vendors table...")
                conn.execute(text("""
                    ALTER TABLE vendors 
                    ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL
                """))
                trans.commit()
                print("[SUCCESS] is_active column added successfully!")
            else:
                print("[INFO] is_active column already exists in vendors table.")
                trans.rollback()
            
        except Exception as e:
            trans.rollback()
            print(f"[ERROR] Migration failed: {e}")
            raise

if __name__ == "__main__":
    migrate_vendor_is_active()

