# Fixing AviationStack 403 Forbidden Error

## What does 403 Forbidden mean?

A 403 Forbidden error from AviationStack API typically means one of the following:

1. **Invalid API Key**: The API key is incorrect, expired, or doesn't exist
2. **Insufficient Permissions**: Your API key plan doesn't have access to the flights endpoint
3. **Free Tier Restrictions**: Free tier accounts may have limited access
4. **API Key Not Activated**: The API key hasn't been activated in your AviationStack dashboard

## How to Fix

### Step 1: Verify Your API Key

1. Go to [AviationStack Dashboard](https://aviationstack.com/dashboard)
2. Log in to your account
3. Navigate to **API Keys** section
4. Check if your API key is:
   - ✅ Active
   - ✅ Not expired
   - ✅ Has the correct permissions

### Step 2: Check Your Plan

AviationStack has different plans:
- **Free Tier**: Limited requests, may not have access to all endpoints
- **Basic Plan**: More requests, full API access
- **Professional Plan**: Unlimited requests

If you're on the free tier, you might need to upgrade to access the flights endpoint.

### Step 3: Test Your API Key

You can test your API key directly using curl:

```bash
curl "https://api.aviationstack.com/v1/flights?access_key=YOUR_API_KEY&limit=1"
```

Replace `YOUR_API_KEY` with your actual API key.

### Step 4: Update API Key in Admin Portal

1. Go to **Admin Portal → API Keys**
2. Find **AVIATIONSTACK_API_KEY**
3. Update the value with your correct API key
4. Click **Save**

### Step 5: Verify Environment Variable

Make sure `ENABLE_EXTERNAL_FLIGHT_API=true` is set in your `.env` file:

```env
ENABLE_EXTERNAL_FLIGHT_API=true
AVIATIONSTACK_API_KEY=your_api_key_here
```

### Step 6: Restart Backend Server

After updating the API key, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
python -m uvicorn app.main:app --reload
```

## Alternative: Get a New API Key

If your current API key doesn't work:

1. Go to [AviationStack Sign Up](https://aviationstack.com/signup)
2. Create a new account (or log in to existing)
3. Get your new API key from the dashboard
4. Update it in the Admin Portal

## Still Having Issues?

If you continue to get 403 errors after following these steps:

1. Check AviationStack's [Status Page](https://status.aviationstack.com/)
2. Review their [API Documentation](https://aviationstack.com/documentation)
3. Contact AviationStack support if needed

## Common Issues

- **API Key Format**: Make sure there are no extra spaces or characters
- **Case Sensitivity**: API keys are case-sensitive
- **Rate Limits**: Free tier has rate limits - wait a few minutes and try again
- **Endpoint Access**: Some endpoints require paid plans

