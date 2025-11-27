# AviationStack API Setup & Troubleshooting Guide

## Understanding 403 Forbidden Error

A **403 Forbidden** error from AviationStack means:
- ✅ Your API key is being sent correctly
- ❌ AviationStack is rejecting it due to:
  1. **Invalid/Expired Key**: The API key is no longer valid
  2. **Plan Restrictions**: Free tier may not have access to flights endpoint
  3. **Missing Permissions**: Your plan doesn't include the flights API

## Quick Fix Steps

### Step 1: Verify Your API Key

1. **Go to Admin Portal → API Keys**
2. Find `AVIATIONSTACK_API_KEY`
3. Copy the value
4. Test it using the test script:

```bash
cd backend
python test_aviationstack_key.py YOUR_API_KEY_HERE
```

### Step 2: Check AviationStack Dashboard

1. Visit [AviationStack Dashboard](https://aviationstack.com/dashboard)
2. Log in to your account
3. Check:
   - ✅ Is your API key **Active**?
   - ✅ Is it **Not Expired**?
   - ✅ What **Plan** are you on?

### Step 3: Test API Key Directly

Test your API key with curl:

```bash
curl "https://api.aviationstack.com/v1/flights?access_key=YOUR_API_KEY&limit=1&flight_date=2025-01-15"
```

If this returns 403, your API key is invalid or your plan doesn't support the flights endpoint.

## Free Tier Limitations

**Important**: AviationStack's free tier may have restrictions:
- Limited API calls per month
- May not include access to all endpoints
- Some endpoints require paid plans

### Check Your Plan

1. Go to [AviationStack Dashboard](https://aviationstack.com/dashboard)
2. Check your current plan
3. Review what endpoints are included

## Getting a Valid API Key

### Option 1: Use Existing Account

1. Go to [AviationStack Dashboard](https://aviationstack.com/dashboard)
2. Log in
3. Copy your API key
4. Update in Admin Portal → API Keys

### Option 2: Sign Up for New Account

1. Visit [AviationStack Sign Up](https://aviationstack.com/signup)
2. Create a free account
3. Get your API key from the dashboard
4. Add it in Admin Portal → API Keys

### Option 3: Upgrade Plan (If Needed)

If free tier doesn't work:
1. Check [AviationStack Pricing](https://aviationstack.com/pricing)
2. Upgrade to a plan that includes flights endpoint
3. Update your API key

## Alternative: Use Different API

If AviationStack doesn't work for your needs, consider:
- **Amadeus API** - Free tier available
- **FlightAPI** - Commercial pricing
- **Skyscanner API** - Limited free access

## Testing Your Setup

### Method 1: Use Test Script

```bash
cd backend
python test_aviationstack_key.py YOUR_API_KEY
```

### Method 2: Test in Admin Portal

1. Go to **Admin Portal → External Flights**
2. Enter:
   - Origin: `BOM` (Mumbai)
   - Destination: `DXB` (Dubai)
   - Date: (optional, leave empty for today)
3. Click **Search Flights**

### Method 3: Check Backend Logs

Look for these log messages:
- `API key loaded from KeyManager` ✅
- `API key loaded from environment variable` ✅
- `Aviationstack API 403 Forbidden` ❌

## Common Issues & Solutions

### Issue: "API key not configured"
**Solution**: Add API key in Admin Portal → API Keys

### Issue: "403 Forbidden"
**Solution**: 
- Verify API key is valid
- Check your plan includes flights endpoint
- Try getting a new API key

### Issue: "401 Unauthorized"
**Solution**: API key is completely invalid - get a new one

### Issue: "429 Too Many Requests"
**Solution**: Wait a few minutes, you've hit rate limit

## Still Having Issues?

1. **Check AviationStack Status**: [Status Page](https://status.aviationstack.com/)
2. **Review Documentation**: [API Docs](https://aviationstack.com/documentation)
3. **Contact Support**: AviationStack support team

## Notes

- API keys are stored encrypted in the database
- Keys are loaded dynamically (no restart needed after update)
- Free tier may have daily/monthly limits
- Some endpoints require paid plans

