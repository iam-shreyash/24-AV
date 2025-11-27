"""
Script to create an admin user
Run this from the backend directory with virtual environment activated
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.models import User, UserRole
from app.security import hash_password
from app.database import Base

# Load environment variables
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://crm_user:6648@localhost:5432/private_plane_crm")

def create_admin():
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        # Get admin details from environment or use defaults
        admin_email = os.getenv("ADMIN_DEFAULT_EMAIL", "admin@privateplane.app")
        admin_password = os.getenv("ADMIN_DEFAULT_PASSWORD", "ChangeMe123!")
        
        # Check if admin already exists
        existing_admin = db.query(User).filter(
            User.email == admin_email,
            User.role == UserRole.ADMIN
        ).first()
        
        if existing_admin:
            print(f"[INFO] Admin user with email '{admin_email}' already exists.")
            print(f"[INFO] To reset password, delete the user first or update manually in database.")
            db.close()
            return
        
        # Create admin user
        admin_user = User(
            email=admin_email,
            full_name="System Administrator",
            role=UserRole.ADMIN,
            hashed_password=hash_password(admin_password),
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("=" * 60)
        print("[SUCCESS] Admin user created successfully!")
        print("=" * 60)
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print()
        print("⚠️  IMPORTANT: Change the password after first login!")
        print("=" * 60)
        
        db.close()
        
    except Exception as e:
        print(f"[ERROR] Failed to create admin user: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check your .env file has correct DATABASE_URL")
        print("3. Verify database credentials")
        return False
    
    return True

if __name__ == "__main__":
    create_admin()

