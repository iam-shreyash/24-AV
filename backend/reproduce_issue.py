import sys
import os
from pathlib import Path
# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models
from app.security import create_access_token
from datetime import datetime, timedelta

def reproduce():
    client = TestClient(app)
    db = SessionLocal()
    
    try:
        print("Connecting to DB...")
        # 1. Get or create a vendor user
        vendor_email = "vendor_repro@test.com"
        user = db.query(models.User).filter(models.User.email == vendor_email).first()
        if not user:
            print("Creating test vendor user...")
            user = models.User(
                email=vendor_email,
                hashed_password="hashed",
                full_name="Repro Vendor",
                role=models.UserRole.VENDOR,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            print(f"Found existing user: {user.id}")
            
        # 2. Ensure vendor profile exists
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == user.id).first()
        if not vendor:
            print("Creating vendor profile...")
            vendor = models.Vendor(
                user_id=user.id,
                company_name="Repro Airlines",
                approval_status="approved"
            )
            db.add(vendor)
            db.commit()
            db.refresh(vendor)
        else:
            print(f"Found existing vendor profile: {vendor.id}")
            
        # 3. Create a plane
        plane_reg = "REPRO-001"
        plane = db.query(models.Plane).filter(models.Plane.registration_number == plane_reg).first()
        if not plane:
            print("Creating test plane...")
            plane = models.Plane(
                vendor_id=vendor.id,
                model="Test Jet",
                registration_number=plane_reg,
                seat_capacity=10
            )
            db.add(plane)
            db.commit()
            db.refresh(plane)
        else:
            print(f"Found existing plane: {plane.id}")
            
        # 4. Create token
        token, _ = create_access_token(subject=str(user.id), role="vendor")
        
        # 5. Make request
        payload = {
            "plane_id": plane.id,
            "flight_number": "REPRO-101",
            "origin": "JFK",
            "destination": "LHR",
            "departure_time": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "arrival_time": (datetime.utcnow() + timedelta(days=1, hours=7)).isoformat(),
            "flight_type": "charter",
            "base_price": 5000.0,
            "is_full_charter_only": False,
            "total_seats_available": 10,
            "allowed_luggage_kg": 20.0,
            "special_amenities": ["Wifi"],
            "notes_for_passengers": "Test flight"
        }
        
        print(f"Sending payload: {payload}")
        response = client.post(
            "/api/flights/",
            json=payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"Exception: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    reproduce()
