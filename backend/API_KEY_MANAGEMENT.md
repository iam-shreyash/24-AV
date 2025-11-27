# API Key Management System

## Overview

This project implements a secure, centralized API Key Management System that:
- Stores all API keys in an encrypted database table
- Provides a unified interface (`KeyManager`) for accessing keys
- Allows admins to manage keys via the Admin Panel UI
- Automatically loads keys from database on startup, overriding `.env` values
- Supports environment-based configuration (`.env.development`, `.env.production`, `.env.local`)

## Architecture

### Backend Components

1. **Database Model** (`models.ApiKey`)
   - Stores encrypted API keys
   - Tracks who updated each key and when
   - Supports active/inactive status

2. **Key Encryption Service** (`services/key_encryption.py`)
   - Uses Fernet symmetric encryption
   - Derives encryption key from `API_KEY_ENCRYPTION_KEY` or `JWT_SECRET`
   - All keys are encrypted at rest

3. **Key Manager Service** (`services/key_manager.py`)
   - Centralized interface for accessing API keys
   - Priority: Database → Environment Variable → Default
   - Caches keys in memory for performance
   - Initialized on application startup

4. **API Routes** (`routers/api_keys.py`)
   - Admin-only endpoints for managing keys
   - Never returns decrypted values in list endpoints
   - Separate endpoint for viewing/editing individual keys

5. **Configuration** (`config.py`)
   - Automatically uses KeyManager for all API keys
   - Falls back to environment variables if key not in database
   - Supports environment-based `.env` file loading

### Frontend Components

1. **Key Manager Utility** (`frontend/src/utils/keyManager.ts`)
   - Type-safe API key access
   - Caches keys for client-side operations
   - Only fetches keys when needed (e.g., Stripe publishable key)

2. **Admin UI** (`frontend/src/components/admin/ApiKeysManagement.tsx`)
   - Secure form for viewing/editing API keys
   - Password-masked input fields
   - Real-time validation and error handling

## Usage

### Backend Usage

**Always use KeyManager instead of direct environment variable access:**

```python
from app.services.key_manager import KeyManager

# Get an API key
razorpay_key = KeyManager.get("RAZORPAY_KEY_ID")
stripe_key = KeyManager.get("STRIPE_SECRET_KEY")

# With default fallback
api_key = KeyManager.get("SOME_KEY", default="fallback_value")

# Validate a key exists
if KeyManager.validate("RAZORPAY_KEY_ID"):
    # Use the key
    pass

# Set/update a key (admin only, usually via API)
KeyManager.set("RAZORPAY_KEY_ID", "new_value", db)
```

**In config.py (already implemented):**
```python
from app.config import get_settings

settings = get_settings()
# Keys are automatically loaded from database via KeyManager
stripe_key = settings.stripe_secret_key
```

### Frontend Usage

**For client-side operations (e.g., Stripe publishable key):**
```typescript
import { getApiKey, API_KEY_NAMES } from "./utils/keyManager";

// Get an API key
const stripeKey = await getApiKey(API_KEY_NAMES.STRIPE_PUBLISHABLE_KEY);

// Use in payment integration
if (stripeKey) {
  // Initialize Stripe with the key
}
```

**Note:** Most API keys should be used server-side only. Only publishable keys (like Stripe's) should be accessed from the frontend.

## Supported API Keys

The system supports the following standard API keys:

- `RAZORPAY_KEY_ID` - Razorpay API Key ID
- `RAZORPAY_KEY_SECRET` - Razorpay API Key Secret
- `STRIPE_SECRET_KEY` - Stripe Secret Key
- `STRIPE_PUBLISHABLE_KEY` - Stripe Publishable Key (for client-side)
- `PAYPAL_CLIENT_ID` - PayPal Client ID
- `PAYPAL_CLIENT_SECRET` - PayPal Client Secret
- `OTP_SERVICE_KEY` - OTP Service API Key (optional, future use)
- `AVIATIONSTACK_API_KEY` - AviationStack API Key (optional)

## Environment Configuration

The system automatically loads `.env` files based on `NODE_ENV`:

1. `.env.{NODE_ENV}.local` (highest priority)
2. `.env.local`
3. `.env.{NODE_ENV}`
4. `.env` (fallback)

**Example:**
- Development: `NODE_ENV=development` → loads `.env.development.local`, `.env.local`, `.env.development`, `.env`
- Production: `NODE_ENV=production` → loads `.env.production.local`, `.env.local`, `.env.production`, `.env`

**Important:** Keys stored in the database **always override** `.env` values. This allows admins to update keys without modifying `.env` files.

## Security Features

1. **Encryption at Rest**
   - All keys are encrypted using Fernet (AES-128)
   - Encryption key derived from `API_KEY_ENCRYPTION_KEY` or `JWT_SECRET`
   - Keys are never stored in plaintext

2. **Access Control**
   - Only admins can view/edit API keys
   - API endpoints require admin authentication
   - Values are never returned in list endpoints

3. **Audit Trail**
   - Tracks who updated each key (`updated_by`)
   - Records creation and update timestamps
   - Supports active/inactive status

4. **Secure Transmission**
   - Keys are only decrypted when needed
   - Frontend only receives keys via authenticated API calls
   - HTTPS should be used in production

## Admin Panel Usage

1. Navigate to **Admin Portal → API Keys**
2. View all configured API keys
3. Click on a key to view/edit its value
4. Enter new value and click "Save"
5. Keys are immediately available (cached in KeyManager)

## Migration from Hardcoded Keys

If you have existing code using hardcoded keys or direct `os.getenv()`:

**Before:**
```python
import os
razorpay_key = os.getenv("RAZORPAY_KEY_ID")
```

**After:**
```python
from app.services.key_manager import KeyManager
razorpay_key = KeyManager.get("RAZORPAY_KEY_ID")
```

## Database Schema

```sql
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    encrypted_value TEXT NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Troubleshooting

### Keys not loading from database
- Check that KeyManager is initialized in `main.py`
- Verify database connection
- Check encryption key is set correctly

### Keys not overriding .env values
- Ensure keys are stored in database (use Admin Panel)
- Verify KeyManager is initialized before config is loaded
- Check that `_get_api_key()` in config.py is working

### Encryption/Decryption errors
- Verify `API_KEY_ENCRYPTION_KEY` or `JWT_SECRET` is set
- Check that encryption key hasn't changed (would invalidate existing keys)
- Re-encrypt keys if encryption key was rotated

## Best Practices

1. **Never hardcode API keys** - Always use KeyManager
2. **Use environment-specific .env files** - Keep production keys separate
3. **Rotate keys regularly** - Update keys via Admin Panel
4. **Monitor key usage** - Check audit logs for key updates
5. **Use least privilege** - Only admins should access key management
6. **Backup encryption key** - Store `API_KEY_ENCRYPTION_KEY` securely
7. **Test key updates** - Verify functionality after updating keys

## Future Enhancements

- Key rotation automation
- Key expiration dates
- Usage analytics per key
- Webhook notifications on key updates
- Integration with secret management services (AWS Secrets Manager, etc.)

