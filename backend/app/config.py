import os
from functools import lru_cache
from pathlib import Path
from pydantic import BaseModel, Field

# Load .env file based on NODE_ENV or default to .env
try:
    from dotenv import load_dotenv
    
    # Determine which .env file to load
    node_env = os.getenv("NODE_ENV", "development").lower()
    env_files = [
        f".env.{node_env}.local",  # Highest priority
        f".env.local",  # Local overrides
        f".env.{node_env}",  # Environment-specific
        ".env"  # Default fallback
    ]
    
    env_path = Path(__file__).parent.parent
    loaded = False
    for env_file in env_files:
        file_path = env_path / env_file
        if file_path.exists():
            load_dotenv(file_path, override=False)  # Don't override already loaded vars
            if not loaded:
                print(f"✓ Loaded environment from {env_file}")
                loaded = True
    
    # Always try .env as fallback
    default_env = env_path / ".env"
    if default_env.exists() and not loaded:
        load_dotenv(default_env)
        print("✓ Loaded environment from .env")
except ImportError:
    # dotenv not installed, will use environment variables only
    pass


class Settings(BaseModel):
    app_name: str = "Private Plane CRM"
    database_url: str = Field(alias="DATABASE_URL")
    jwt_secret: str = Field(alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expires_in: int = Field(default=3600, alias="JWT_EXPIRES_IN")
    stripe_secret_key: str = Field(default="", alias="STRIPE_SECRET_KEY")
    stripe_publishable_key: str = Field(default="", alias="STRIPE_PUBLISHABLE_KEY")
    razorpay_key_id: str = Field(default="", alias="RAZORPAY_KEY_ID")
    razorpay_key_secret: str = Field(default="", alias="RAZORPAY_KEY_SECRET")
    paypal_client_id: str = Field(default="", alias="PAYPAL_CLIENT_ID")
    paypal_client_secret: str = Field(default="", alias="PAYPAL_CLIENT_SECRET")
    otp_service_key: str = Field(default="", alias="OTP_SERVICE_KEY")
    firebase_credentials_path: str = Field(alias="FIREBASE_CREDENTIALS_PATH")
    redis_url: str = Field(alias="REDIS_URL")
    admin_default_email: str = Field(alias="ADMIN_DEFAULT_EMAIL")
    admin_default_password: str = Field(alias="ADMIN_DEFAULT_PASSWORD")
    # External Flight API Configuration
    enable_external_flight_api: bool = Field(default=False, alias="ENABLE_EXTERNAL_FLIGHT_API")
    aviationstack_api_key: str = Field(default="", alias="AVIATIONSTACK_API_KEY")

    class Config:
        populate_by_name = True
        case_sensitive = False


def _get_api_key(key_name: str, env_fallback: str = "") -> str:
    """
    Get API key from KeyManager (database) or fallback to environment variable.
    This ensures keys from database override .env values.
    """
    try:
        from .services.key_manager import KeyManager
        # Try to get from KeyManager (database)
        value = KeyManager.get(key_name)
        if value:
            return value
    except Exception:
        # KeyManager not initialized yet or key not in DB, use env
        pass
    
    # Fallback to environment variable
    return os.getenv(key_name, env_fallback)


@lru_cache
def get_settings() -> Settings:
    # Read from environment variables (loaded from .env file if dotenv is available)
    # API keys are loaded from database via KeyManager, with .env as fallback
    return Settings(
        database_url=os.getenv("DATABASE_URL", ""),
        jwt_secret=os.getenv("JWT_SECRET", ""),
        jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        jwt_expires_in=int(os.getenv("JWT_EXPIRES_IN", "3600")),
        stripe_secret_key=_get_api_key("STRIPE_SECRET_KEY", os.getenv("STRIPE_SECRET_KEY", "")),
        stripe_publishable_key=_get_api_key("STRIPE_PUBLISHABLE_KEY", os.getenv("STRIPE_PUBLISHABLE_KEY", "")),
        razorpay_key_id=_get_api_key("RAZORPAY_KEY_ID", os.getenv("RAZORPAY_KEY_ID", "")),
        razorpay_key_secret=_get_api_key("RAZORPAY_KEY_SECRET", os.getenv("RAZORPAY_KEY_SECRET", "")),
        paypal_client_id=_get_api_key("PAYPAL_CLIENT_ID", os.getenv("PAYPAL_CLIENT_ID", "")),
        paypal_client_secret=_get_api_key("PAYPAL_CLIENT_SECRET", os.getenv("PAYPAL_CLIENT_SECRET", "")),
        otp_service_key=_get_api_key("OTP_SERVICE_KEY", os.getenv("OTP_SERVICE_KEY", "")),
        firebase_credentials_path=os.getenv("FIREBASE_CREDENTIALS_PATH", ""),
        redis_url=os.getenv("REDIS_URL", ""),
        admin_default_email=os.getenv("ADMIN_DEFAULT_EMAIL", ""),
        admin_default_password=os.getenv("ADMIN_DEFAULT_PASSWORD", ""),
        enable_external_flight_api=os.getenv("ENABLE_EXTERNAL_FLIGHT_API", "false").lower() == "true",
        aviationstack_api_key=_get_api_key("AVIATIONSTACK_API_KEY", os.getenv("AVIATIONSTACK_API_KEY", "")),
    )

