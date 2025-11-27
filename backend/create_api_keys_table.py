"""
Migration script to create the api_keys table.
Run this script once to set up the API key management system.

Usage:
    python create_api_keys_table.py
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.config import get_settings

def create_api_keys_table():
    """Create the api_keys table if it doesn't exist."""
    settings = get_settings()
    engine = create_engine(settings.database_url)
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        encrypted_value TEXT NOT NULL,
        description VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_api_keys_key_name ON api_keys(key_name);
    CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
    """
    
    try:
        with engine.connect() as conn:
            conn.execute(text(create_table_sql))
            conn.commit()
        print("✓ API keys table created successfully")
        return True
    except Exception as e:
        print(f"✗ Error creating api_keys table: {e}")
        return False
    finally:
        engine.dispose()

if __name__ == "__main__":
    print("Creating api_keys table...")
    if create_api_keys_table():
        print("\n✓ Migration completed successfully!")
        print("\nNext steps:")
        print("1. Start your backend server (KeyManager will initialize automatically)")
        print("2. Log in as admin")
        print("3. Navigate to Admin Portal → API Keys")
        print("4. Add your API keys via the UI")
    else:
        print("\n✗ Migration failed. Please check the error above.")
        sys.exit(1)

