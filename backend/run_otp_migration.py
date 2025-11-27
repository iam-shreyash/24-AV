#!/usr/bin/env python3
"""
Run OTP table creation SQL script
This script reads create_otp_table.sql and executes it against the database
"""

from sqlalchemy import create_engine, text
from app.config import get_settings

def run_otp_migration():
    """Execute the OTP table creation SQL"""
    settings = get_settings()
    
    print("=" * 60)
    print("Creating OTP Verification Table")
    print("=" * 60)
    print(f"Database: {settings.database_url.split('@')[1] if '@' in settings.database_url else 'database'}")
    print()
    
    try:
        # Read SQL file
        with open('create_otp_table.sql', 'r') as f:
            sql_script = f.read()
        
        # Create engine
        engine = create_engine(settings.database_url)
        
        # Execute SQL
        with engine.connect() as conn:
            # Split by semicolons and execute each statement
            statements = [s.strip() for s in sql_script.split(';') if s.strip() and not s.strip().startswith('--')]
            
            for statement in statements:
                if statement:
                    print(f"Executing: {statement[:50]}...")
                    conn.execute(text(statement))
                    conn.commit()
            
            print()
            print("[OK] OTP verification table created successfully!")
            
            # Verify table exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'otp_verifications'
                );
            """))
            if result.scalar():
                print("[OK] Table verification: otp_verifications table exists")
            else:
                print("[WARNING] Table verification: otp_verifications table not found")
        
        engine.dispose()
        return True
        
    except FileNotFoundError:
        print("[ERROR] create_otp_table.sql file not found!")
        print("Make sure you're running this script from the backend directory")
        return False
    except Exception as e:
        print(f"[ERROR] Error creating table: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = run_otp_migration()
    if success:
        print("\n" + "=" * 60)
        print("Migration completed successfully!")
        print("You can now use the OTP verification feature.")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("Migration failed. Please check the error messages above.")
        print("=" * 60)
        exit(1)

