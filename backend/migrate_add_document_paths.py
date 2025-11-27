"""
Migration script to add document path columns to vendors table
"""
from sqlalchemy import text
from app.database import engine

def migrate_document_paths():
    """Add document path columns to vendors table"""
    print("=" * 60)
    print("Migration: Adding document path columns to vendors table")
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
            
            # Define document path columns to add
            columns_to_add = [
                ("certificate_of_incorporation_path", "VARCHAR(500)"),
                ("gst_certificate_path", "VARCHAR(500)"),
                ("owner_kyc_document_path", "VARCHAR(500)"),
                ("owner_kyc_address_proof_path", "VARCHAR(500)"),
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
            import traceback
            print(traceback.format_exc())
            print("=" * 60)
            return False

if __name__ == "__main__":
    success = migrate_document_paths()
    if not success:
        exit(1)

