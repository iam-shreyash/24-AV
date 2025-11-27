#!/usr/bin/env python3
"""
Database setup script for Private Plane CRM
This script helps verify database connection and optionally creates tables.
"""

import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, ProgrammingError

from app.config import get_settings
from app.database import Base, engine
from app import models  # Import models to register them with Base

def test_connection():
    """Test database connection"""
    settings = get_settings()
    print(f"Testing connection to: {settings.database_url.split('@')[1] if '@' in settings.database_url else 'database'}")
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"[OK] Successfully connected to PostgreSQL!")
            print(f"   PostgreSQL version: {version.split(',')[0]}")
            return True
    except OperationalError as e:
        print(f"[ERROR] Connection failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check your DATABASE_URL in .env file")
        print("3. Verify username, password, and database name")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False

def create_tables():
    """Create all database tables"""
    try:
        print("\nCreating database tables...")
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created successfully!")
        
        # List created tables
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result]
            if tables:
                print(f"\nCreated {len(tables)} tables:")
                for table in tables:
                    print(f"  - {table}")
        return True
    except Exception as e:
        print(f"[ERROR] Error creating tables: {e}")
        return False

def check_tables():
    """Check if tables already exist"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result]
            return tables
    except Exception as e:
        print(f"Error checking tables: {e}")
        return []

def main():
    print("=" * 60)
    print("Private Plane CRM - Database Setup")
    print("=" * 60)
    
    # Test connection
    if not test_connection():
        sys.exit(1)
    
    # Check existing tables
    existing_tables = check_tables()
    if existing_tables:
        print(f"\n[WARNING] Found {len(existing_tables)} existing tables:")
        for table in existing_tables:
            print(f"  - {table}")
        response = input("\nDo you want to create missing tables? (y/n): ").strip().lower()
        if response != 'y':
            print("Skipping table creation.")
            sys.exit(0)
    
    # Create tables
    if create_tables():
        print("\n" + "=" * 60)
        print("[SUCCESS] Database setup completed successfully!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Start the server: uvicorn app.main:app --reload")
        print("2. Register your first user via /api/auth/register")
        print("3. Visit http://localhost:8000/docs for API documentation")
    else:
        print("\n[ERROR] Database setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()

