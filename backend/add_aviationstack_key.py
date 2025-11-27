"""
Quick script to add AviationStack API key to the system.
Run this once to add your API key securely.

Usage:
    python add_aviationstack_key.py
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine
from app.config import get_settings
from app.services.key_manager import KeyManager
from app.database import get_db

def add_aviationstack_key():
    """Add AviationStack API key to the system"""
    settings = get_settings()
    engine = create_engine(settings.database_url)
    
    # Get database session
    db = next(get_db())
    
    try:
        # Your API key from AviationStack dashboard
        api_key = "7a7f0d83e0d52320fa65107707b092ed"
        
        # Add the key using KeyManager
        success = KeyManager.set("AVIATIONSTACK_API_KEY", api_key, db)
        
        if success:
            print("✓ AviationStack API key added successfully!")
            print(f"✓ Key: {api_key[:10]}...{api_key[-4:]}")
            print("\nNext steps:")
            print("1. Set ENABLE_EXTERNAL_FLIGHT_API=true in your .env file")
            print("2. Restart your backend server")
            print("3. External flights will now be available in flight searches")
            return True
        else:
            print("✗ Failed to add API key")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    finally:
        db.close()
        engine.dispose()

if __name__ == "__main__":
    print("Adding AviationStack API key...")
    if add_aviationstack_key():
        print("\n✓ Setup completed successfully!")
    else:
        print("\n✗ Setup failed. Please check the error above.")
        sys.exit(1)

