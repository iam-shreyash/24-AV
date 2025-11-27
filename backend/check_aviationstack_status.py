"""
Simple script to check AviationStack API status.
This checks configuration without importing the full app.

Usage:
    python check_aviationstack_status.py
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

def check_status():
    """Check AviationStack API configuration status"""
    print("=" * 60)
    print("AviationStack API Status Check")
    print("=" * 60)
    
    # Load .env file
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        from dotenv import load_dotenv
        load_dotenv(env_path)
        print("\n✓ Loaded .env file")
    else:
        print("\n⚠ .env file not found (using environment variables)")
    
    # Check 1: API Key
    print("\n1. API Key Configuration:")
    api_key = os.getenv("AVIATIONSTACK_API_KEY", "")
    
    if api_key:
        print(f"   ✓ API Key found in environment: {api_key[:10]}...{api_key[-4:]}")
    else:
        print("   ✗ API Key NOT found in environment")
        print("   → Check if key is in database (via Admin Panel → API Keys)")
        print("   → Or add to .env: AVIATIONSTACK_API_KEY=your_key")
    
    # Check 2: Enable Flag
    print("\n2. Enable Flag:")
    enable_flag = os.getenv("ENABLE_EXTERNAL_FLIGHT_API", "false").lower()
    if enable_flag == "true":
        print("   ✓ ENABLE_EXTERNAL_FLIGHT_API=true")
    else:
        print("   ✗ ENABLE_EXTERNAL_FLIGHT_API is not 'true'")
        print(f"   → Current value: '{enable_flag}'")
        print("   → Add to .env: ENABLE_EXTERNAL_FLIGHT_API=true")
    
    # Check 3: Database Key (if possible)
    print("\n3. Database Configuration:")
    try:
        # Try to check database without full import
        database_url = os.getenv("DATABASE_URL", "")
        if database_url:
            print(f"   ✓ DATABASE_URL configured")
            print("   → API key might be stored in database (check Admin Panel)")
        else:
            print("   ✗ DATABASE_URL not found")
    except Exception as e:
        print(f"   ⚠ Could not check database: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("Summary:")
    print("=" * 60)
    
    has_key = bool(api_key)
    is_enabled = enable_flag == "true"
    
    if has_key and is_enabled:
        print("✅ Configuration looks good!")
        print("\nTo verify API is working:")
        print("1. Start your backend server")
        print("2. Log in as admin")
        print("3. Go to Admin Portal → External Flights")
        print("4. Check the status indicator")
        print("5. Try searching for flights (e.g., BOM → DXB)")
    elif has_key and not is_enabled:
        print("⚠ API Key found but API is not enabled")
        print("\nFix:")
        print("→ Add to .env: ENABLE_EXTERNAL_FLIGHT_API=true")
        print("→ Restart backend server")
    elif not has_key:
        print("❌ API Key not configured")
        print("\nFix:")
        print("→ Run: python add_aviationstack_key.py")
        print("→ Or add via Admin Panel → API Keys")
        print("→ Or add to .env: AVIATIONSTACK_API_KEY=7a7f0d83e0d52320fa65107707b092ed")
    
    print("\n" + "=" * 60)
    print("Quick Test:")
    print("=" * 60)
    print("\nTo test if API is actually working:")
    print("1. Make sure backend is running")
    print("2. Open browser console (F12)")
    print("3. Go to Admin Portal → External Flights")
    print("4. Check the status indicator color:")
    print("   🟢 Green = Working")
    print("   🟡 Yellow = Key found but not enabled")
    print("   🔴 Red = Key missing")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    try:
        check_status()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

