"""
Centralized API Key Manager Service.
Loads keys from database and provides a unified interface for accessing API keys.
"""
import os
from typing import Dict, Optional
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from .key_encryption import KeyEncryptionService


class KeyManager:
    """Centralized manager for API keys."""
    
    _cache: Dict[str, str] = {}
    _initialized: bool = False
    
    # Standard API key names
    RAZORPAY_KEY_ID = "RAZORPAY_KEY_ID"
    RAZORPAY_KEY_SECRET = "RAZORPAY_KEY_SECRET"
    STRIPE_SECRET_KEY = "STRIPE_SECRET_KEY"
    STRIPE_PUBLISHABLE_KEY = "STRIPE_PUBLISHABLE_KEY"
    PAYPAL_CLIENT_ID = "PAYPAL_CLIENT_ID"
    PAYPAL_CLIENT_SECRET = "PAYPAL_CLIENT_SECRET"
    OTP_SERVICE_KEY = "OTP_SERVICE_KEY"
    
    @classmethod
    def initialize(cls, db: Session) -> None:
        """Initialize KeyManager by loading all keys from database."""
        if cls._initialized:
            return
        
        try:
            # Load all active API keys from database
            api_keys = db.query(models.ApiKey).filter(models.ApiKey.is_active == True).all()
            
            for api_key in api_keys:
                try:
                    decrypted_value = KeyEncryptionService.decrypt(api_key.encrypted_value)
                    cls._cache[api_key.key_name] = decrypted_value
                except Exception as e:
                    print(f"Warning: Failed to decrypt key {api_key.key_name}: {e}")
                    continue
            
            cls._initialized = True
            print(f"KeyManager initialized with {len(cls._cache)} keys from database")
        except Exception as e:
            print(f"Warning: Failed to initialize KeyManager from database: {e}")
            cls._initialized = True  # Mark as initialized to prevent retry loops
    
    @classmethod
    def get(cls, key_name: str, default: Optional[str] = None) -> Optional[str]:
        """
        Get an API key by name.
        
        Priority:
        1. Database (if initialized)
        2. Environment variable
        3. Default value
        
        Args:
            key_name: Name of the API key
            default: Default value if key not found
            
        Returns:
            API key value or None
        """
        # First check cache (database keys)
        if key_name in cls._cache:
            return cls._cache[key_name]
        
        # Fallback to environment variable
        env_value = os.getenv(key_name)
        if env_value:
            return env_value
        
        # Return default if provided
        return default
    
    @classmethod
    def set(cls, key_name: str, value: str, db: Session) -> bool:
        """
        Set/update an API key in the database.
        
        Args:
            key_name: Name of the API key
            value: Value to set
            db: Database session
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Encrypt the value
            encrypted_value = KeyEncryptionService.encrypt(value)
            
            # Check if key exists
            api_key = db.query(models.ApiKey).filter(
                models.ApiKey.key_name == key_name
            ).first()
            
            if api_key:
                # Update existing
                api_key.encrypted_value = encrypted_value
            else:
                # Create new
                api_key = models.ApiKey(
                    key_name=key_name,
                    encrypted_value=encrypted_value
                )
                db.add(api_key)
            
            db.commit()
            db.refresh(api_key)
            
            # Update cache
            cls._cache[key_name] = value
            
            return True
        except Exception as e:
            db.rollback()
            print(f"Error setting key {key_name}: {e}")
            return False
    
    @classmethod
    def validate(cls, key_name: str) -> bool:
        """Validate that a key exists and has a value."""
        value = cls.get(key_name)
        return value is not None and value.strip() != ""
    
    @classmethod
    def reload(cls, db: Session) -> None:
        """Reload all keys from database."""
        cls._cache.clear()
        cls._initialized = False
        cls.initialize(db)
    
    @classmethod
    def get_all_keys(cls) -> Dict[str, str]:
        """Get all cached keys (for debugging/admin purposes)."""
        return cls._cache.copy()

