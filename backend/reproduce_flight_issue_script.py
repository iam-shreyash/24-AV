import requests
import sys
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"

def main():
    # 1. Login as Vendor
    print("Logging in as vendor...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", data={
            "username": "vendor@test.com",
            "password": "Vendor123!"
        })
        if resp.status_code != 200:
            print(f"Login failed: {resp.status_code} {resp.text}")
            return
        
        token_data = resp.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful.")
        
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return

    # 2. Get Aircraft to use
    print("Fetching aircraft...")
    resp = requests.get(f"{BASE_URL}/aircraft/", headers=headers)
    if resp.status_code != 200:
        print(f"Failed to fetch aircraft: {resp.status_code} {resp.text}")
        return
    
    aircraft_list = resp.json()
    if not aircraft_list:
        print("No aircraft found. Creating one...")
        # Create aircraft
        plane_payload = {
            "model": "Gulfstream G650",
            "registration_number": f"VT-TST-{datetime.now().timestamp()}",
            "seat_capacity": 14,
            "aircraft_name": "Test Jet"
        }
        resp = requests.post(f"{BASE_URL}/aircraft/", data=plane_payload, headers=headers)
        if resp.status_code not in [200, 201]:
            print(f"Failed to create aircraft: {resp.status_code} {resp.text}")
            return
        plane = resp.json()
    else:
        plane = aircraft_list[0]
    
    print(f"Using aircraft: {plane['id']} - {plane['model']}")

    # 3. Create Flight
    print("Creating flight...")
    
    # Matches frontend payload structure
    flight_payload = {
        "plane_id": plane["id"],
        "flight_number": "TEST-101",
        "origin": "DEL",
        "destination": "BOM",
        "departure_time": (datetime.utcnow() + timedelta(days=1)).isoformat(),
        "arrival_time": (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat(),
        "flight_type": "charter",
        "base_price": 5000.0,
        "is_full_charter_only": False,
        "total_seats_available": 14,
        "allowed_luggage_kg": 20.0,
        "special_amenities": ["Wifi", "Bar"],
        "notes_for_passengers": "Enjoy the flight"
    }
    
    print(f"Payload: {json.dumps(flight_payload, indent=2)}")
    
    resp = requests.post(f"{BASE_URL}/flights/", json=flight_payload, headers=headers)
    
    print(f"\n{'='*60}")
    print(f"Response Status: {resp.status_code}")
    print(f"{'='*60}")
    print(f"Response Headers: {dict(resp.headers)}")
    print(f"{'='*60}")
    print(f"Response Body:")
    print(resp.text)
    print(f"{'='*60}")
    
    if resp.status_code >= 400:
        print("\n❌ FLIGHT CREATION FAILED")
        try:
            error_data = resp.json()
            print(f"Error Detail: {json.dumps(error_data, indent=2)}")
        except:
            pass
        sys.exit(1)
    else:
        print("\n✅ FLIGHT CREATED SUCCESSFULLY")
        try:
            flight_data = resp.json()
            print(f"Flight ID: {flight_data.get('id')}")
            print(f"Flight: {flight_data.get('origin')} → {flight_data.get('destination')}")
        except:
            pass

if __name__ == "__main__":
    main()
