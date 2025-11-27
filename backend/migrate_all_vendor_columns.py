#!/usr/bin/env python3
"""
Migration script to add all vendor table columns
Run this script if you have an existing database with vendors table that's missing columns
"""

from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

def migrate_vendor_columns():
    """Add all missing columns to vendors table"""
    engine = create_engine(DATABASE_URL)
    
    print("=" * 60)
    print("Migration: Add All Vendor Columns")
    print("=" * 60)
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Check which columns exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'vendors'
            """))
            existing_columns = {row[0] for row in result}
            
            print(f"\n[INFO] Found {len(existing_columns)} existing columns in vendors table")
            
            # Define all columns that should exist
            columns_to_add = [
                ("business_background", "VARCHAR(100)"),
                ("business_background_other", "VARCHAR(255)"),
                ("owner_name", "VARCHAR(255)"),
                ("phone", "VARCHAR(20)"),
                ("website", "VARCHAR(255)"),
                ("years_in_business", "INTEGER"),
                ("number_of_aircraft", "INTEGER"),
                ("description", "TEXT"),
                ("contact_person_name", "VARCHAR(255)"),
                ("contact_person_designation", "VARCHAR(100)"),
                ("contact_person_email", "VARCHAR(255)"),
                ("bank_account_number", "VARCHAR(50)"),
                ("bank_name", "VARCHAR(255)"),
                ("bank_ifsc", "VARCHAR(20)"),
                ("bank_branch", "VARCHAR(255)"),
                ("account_holder_name", "VARCHAR(255)"),
                ("district", "VARCHAR(100)"),
                ("is_active", "BOOLEAN DEFAULT TRUE"),
            ]
            
            added_count = 0
            skipped_count = 0
            
            for column_name, column_type in columns_to_add:
                if column_name in existing_columns:
                    print(f"[SKIP] Column '{column_name}' already exists")
                    skipped_count += 1
                else:
                    try:
                        print(f"[ADD] Adding column '{column_name}'...")
                        conn.execute(text(f"""
                            ALTER TABLE vendors 
                            ADD COLUMN {column_name} {column_type}
                        """))
                        added_count += 1
                        print(f"[OK] Column '{column_name}' added successfully")
                    except Exception as e:
                        print(f"[ERROR] Failed to add column '{column_name}': {e}")
            
            trans.commit()
            
            print("\n" + "=" * 60)
            print(f"[SUCCESS] Migration completed!")
            print(f"  - Added: {added_count} columns")
            print(f"  - Skipped: {skipped_count} columns (already exist)")
            print("=" * 60)
            return True
            
        except Exception as e:
            trans.rollback()
            print(f"\n[ERROR] Migration failed: {e}")
            print("=" * 60)
            return False

if __name__ == "__main__":
    success = migrate_vendor_columns()
    if not success:
        exit(1)

