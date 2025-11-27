"""
Quick script to check if there are flights in the database.
Run this to see flight data without starting the full server.
"""
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import SessionLocal
    from app import models
    
    def check_flights():
        db = SessionLocal()
        try:
            print("=" * 60)
            print("CHECKING FLIGHT DATA")
            print("=" * 60)
            
            # Count total flights
            total_flights = db.query(models.Flight).count()
            print(f"\n📊 Total flights in database: {total_flights}")
            
            if total_flights == 0:
                print("\n❌ NO FLIGHTS FOUND!")
                print("\nTo add flights:")
                print("1. Login as a vendor at /dashboard/vendor")
                print("2. Go to 'My Flights' section")
                print("3. Click 'Add New Flight'")
                print("4. Fill in the flight details and save")
                return
            
            # Count future flights
            current_time = datetime.utcnow()
            future_flights = db.query(models.Flight).filter(
                models.Flight.departure_time >= current_time
            ).count()
            print(f"✈️  Future flights (departure_time >= now): {future_flights}")
            
            past_flights = total_flights - future_flights
            if past_flights > 0:
                print(f"⏰ Past flights: {past_flights}")
            
            # Show sample flights
            print(f"\n📋 Sample flights (showing first 10):")
            print("-" * 60)
            flights = db.query(models.Flight).order_by(models.Flight.departure_time.desc()).limit(10).all()
            
            for i, flight in enumerate(flights, 1):
                is_future = flight.departure_time >= current_time
                status = "✅ FUTURE" if is_future else "❌ PAST"
                print(f"\n{i}. {status} Flight ID: {flight.id}")
                print(f"   Route: {flight.origin} → {flight.destination}")
                print(f"   Departure: {flight.departure_time}")
                print(f"   Arrival: {flight.arrival_time}")
                print(f"   Price: ₹{flight.base_price:,.2f}")
                print(f"   Vendor ID: {flight.vendor_id}")
                print(f"   Flight Type: {flight.flight_type}")
                if flight.is_full_charter_only:
                    print(f"   ⚠️  Full Charter Only")
            
            # Check vendors with flights
            print(f"\n🏢 Vendors with flights:")
            vendors_with_flights = db.query(models.Vendor).join(models.Flight).distinct().all()
            for vendor in vendors_with_flights:
                flight_count = db.query(models.Flight).filter(
                    models.Flight.vendor_id == vendor.id
                ).count()
                print(f"   - Vendor {vendor.id} ({vendor.company_name}): {flight_count} flights")
            
            print("\n" + "=" * 60)
            print("SUMMARY:")
            print("=" * 60)
            print(f"✅ Total flights: {total_flights}")
            print(f"{'✅' if future_flights > 0 else '❌'} Future flights: {future_flights}")
            print(f"{'✅' if past_flights == 0 else '⚠️ '} Past flights: {past_flights}")
            
            if future_flights == 0 and total_flights > 0:
                print("\n⚠️  WARNING: All flights are in the past!")
                print("   → Update flight departure times to future dates")
                print("   → Or create new flights with future dates")
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            db.close()
    
    if __name__ == "__main__":
        check_flights()
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nThis script needs to be run from the backend directory.")
    print("Make sure you're in the correct directory and dependencies are installed.")

