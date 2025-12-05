#!/usr/bin/env python3
"""
Create Test Users in PostgreSQL Database

This script creates test users in the PostgreSQL database for both
web and mobile app testing.

Usage:
    python3 create_test_users_postgres.py
"""

import sys
from datetime import datetime
from pathlib import Path

# Add the app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app import models
from app.security import hash_password

def create_test_users():
    """Create test users in the database"""
    
    print("=" * 70)
    print("🔧 Creating Test Users in PostgreSQL Database")
    print("=" * 70)
    print()
    
    db = SessionLocal()
    
    try:
        # Test users to create
        test_users = [
            {
                "email": "passenger@test.com",
                "password": "Pass123!",
                "full_name": "Test Passenger",
                "role": "PASSENGER"
            },
            {
                "email": "vendor@test.com",
                "password": "Vendor123!",
                "full_name": "Test Vendor",
                "role": "VENDOR"
            },
            {
                "email": "admin@test.com",
                "password": "Admin123!",
                "full_name": "Test Admin",
                "role": "ADMIN"
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for user_data in test_users:
            # Check if user exists
            existing_user = db.query(models.User).filter(
                models.User.email == user_data["email"]
            ).first()
            
            if existing_user:
                # Update existing user
                print(f"⚠️  User {user_data['email']} already exists - updating password...")
                existing_user.hashed_password = hash_password(user_data["password"])
                existing_user.full_name = user_data["full_name"]
                existing_user.role = user_data["role"]
                existing_user.is_active = True
                existing_user.updated_at = datetime.utcnow()
                updated_count += 1
            else:
                # Create new user
                print(f"✅ Creating user: {user_data['email']}")
                new_user = models.User(
                    email=user_data["email"],
                    hashed_password=hash_password(user_data["password"]),
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(new_user)
                created_count += 1
        
        # Commit all changes
        db.commit()
        
        print()
        print("=" * 70)
        print("✅ Test Users Created/Updated Successfully!")
        print("=" * 70)
        print()
        print(f"Created: {created_count} users")
        print(f"Updated: {updated_count} users")
        print()
        
        # Show all users
        print("=" * 70)
        print("📊 All Users in Database")
        print("=" * 70)
        print()
        
        all_users = db.query(models.User).all()
        
        for user in all_users:
            status = "✅ Active" if user.is_active else "❌ Inactive"
            print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print(f"ID:     {user.id}")
            print(f"Email:  {user.email}")
            print(f"Name:   {user.full_name}")
            print(f"Role:   {user.role}")
            print(f"Status: {status}")
            
            # Show password for test accounts
            if user.email in ['passenger@test.com', 'vendor@test.com', 'admin@test.com']:
                if user.email == 'passenger@test.com':
                    print(f"Pass:   Pass123!")
                elif user.email == 'vendor@test.com':
                    print(f"Pass:   Vendor123!")
                elif user.email == 'admin@test.com':
                    print(f"Pass:   Admin123!")
            print()
        
        print("=" * 70)
        print("🔑 TEST CREDENTIALS (FOR WEB & MOBILE)")
        print("=" * 70)
        print()
        print("1. Passenger Account:")
        print("   Email:    passenger@test.com")
        print("   Password: Pass123!")
        print("   Role:     PASSENGER")
        print()
        print("2. Vendor Account:")
        print("   Email:    vendor@test.com")
        print("   Password: Vendor123!")
        print("   Role:     VENDOR")
        print()
        print("3. Admin Account:")
        print("   Email:    admin@test.com")
        print("   Password: Admin123!")
        print("   Role:     ADMIN")
        print()
        print("=" * 70)
        print("🌐 NEXT STEPS")
        print("=" * 70)
        print()
        print("1. Start backend server:")
        print("   cd backend")
        print("   python run_server.py")
        print()
        print("2. Test on web app:")
        print("   Open: http://localhost:5173/login")
        print("   Login with: passenger@test.com / Pass123!")
        print()
        print("3. Test on mobile app:")
        print("   npx expo start -c")
        print("   Login with: passenger@test.com / Pass123!")
        print()
        print("=" * 70)
        print()
        
    except Exception as e:
        print()
        print("❌ Error creating test users:")
        print(f"   {str(e)}")
        print()
        print("Possible issues:")
        print("  • PostgreSQL server not running")
        print("  • Database 'private_plane_crm' doesn't exist")
        print("  • Wrong database credentials in .env")
        print("  • Missing psycopg package: pip install psycopg")
        print()
        db.rollback()
        return False
    finally:
        db.close()
    
    return True

if __name__ == "__main__":
    success = create_test_users()
    sys.exit(0 if success else 1)
