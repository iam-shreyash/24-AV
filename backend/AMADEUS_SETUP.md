# Amadeus API Setup Guide

## Why Amadeus?

✅ **Free Tier Available**: 2,000 API calls per month  
✅ **Flights Endpoint Included**: Real-time flight search on free tier  
✅ **Reliable**: Used by major travel companies  
✅ **No Credit Card Required**: For free tier

## Step 1: Create Amadeus Account

1. **Visit**: [Amadeus for Developers](https://developers.amadeus.com/)
2. **Sign Up**: Click "Get Started" or "Sign Up"
3. **Activate**: Check your email and activate your account
4. **Log In**: Go to [Amadeus Dashboard](https://developers.amadeus.com/my-apps)

## Step 2: Create Application

1. **Go to Dashboard**: [My Self-Service Workspace](https://developers.amadeus.com/my-apps)
2. **Create App**: Click "Create New App"
3. **Fill Details**:
   - App Name: "PracCRM Flight Search" (or any name)
   - Description: "Flight search integration"
   - Category: "Travel"
4. **Save**: Click "Create"

## Step 3: Get API Credentials

After creating the app, you'll see:
- **API Key** (Client ID)
- **API Secret** (Client Secret)

**Important**: Copy both values immediately - the secret is only shown once!

## Step 4: Add Credentials to Admin Portal

1. **Go to**: Admin Portal → API Keys
2. **Add AMADEUS_API_KEY**:
   - Key Name: `AMADEUS_API_KEY`
   - Value: Your API Key (Client ID) from Amadeus
   - Description: "Amadeus API Key (Client ID)"
   - Type: Text
3. **Add AMADEUS_API_SECRET**:
   - Key Name: `AMADEUS_API_SECRET`
   - Value: Your API Secret from Amadeus
   - Description: "Amadeus API Secret"
   - Type: Password
4. **Save Both**

## Step 5: Enable External Flight API

Make sure in your `backend/.env` file:

```env
ENABLE_EXTERNAL_FLIGHT_API=true
```

## Step 6: Test

1. **Go to**: Admin Portal → External Flights
2. **Enter Search**:
   - Origin: `BOM` (Mumbai)
   - Destination: `DXB` (Dubai)
   - Date: (optional, defaults to tomorrow)
3. **Click**: Search Flights

You should see flights from Amadeus! 🎉

## Free Tier Limits

- **2,000 API calls per month**
- **Flights endpoint**: ✅ Available
- **Real-time data**: ✅ Available
- **No credit card**: ✅ Required for free tier

## API Endpoints Available (Free Tier)

- ✅ Flight Offers Search
- ✅ Flight Price Analysis
- ✅ Airport Information
- ✅ Airline Information
- ✅ Hotel Search (limited)

## Troubleshooting

### "Amadeus API credentials not configured"
- ✅ Check that both `AMADEUS_API_KEY` and `AMADEUS_API_SECRET` are added
- ✅ Verify they're saved in Admin Portal → API Keys
- ✅ Check for typos in the key names

### "Failed to authenticate with Amadeus API"
- ✅ Verify your API Key and Secret are correct
- ✅ Check that you copied the full secret (it's long)
- ✅ Make sure you're using the Test environment credentials (not Production)

### "No flights found"
- ✅ Try different airport codes (BOM, DEL, DXB, JFK, etc.)
- ✅ Try different dates (use future dates)
- ✅ Check if the route has flights available

### Rate Limit Exceeded
- ✅ Free tier: 2,000 calls/month
- ✅ Wait until next month or upgrade plan
- ✅ Check usage in Amadeus dashboard

## Test vs Production

**Test Environment** (Free tier):
- Base URL: `https://test.api.amadeus.com`
- Use for development and testing
- Limited data but fully functional

**Production Environment** (Paid):
- Base URL: `https://api.amadeus.com`
- Requires paid plan
- Full production data

**Our integration uses Test environment by default** (perfect for free tier!)

## Next Steps

1. ✅ Add credentials to Admin Portal
2. ✅ Test flight search
3. ✅ Monitor usage in Amadeus dashboard
4. ✅ Consider upgrading if you need more calls

## Support

- **Amadeus Docs**: [API Documentation](https://developers.amadeus.com/self-service)
- **Quick Start**: [Amadeus Quick Start](https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/quick-start/)
- **Dashboard**: [My Apps](https://developers.amadeus.com/my-apps)

## Comparison: Amadeus vs AviationStack

| Feature | Amadeus (Free) | AviationStack (Free) |
|---------|---------------|---------------------|
| Flights Endpoint | ✅ Yes | ❌ No (paid only) |
| Monthly Calls | 2,000 | Limited |
| Real-time Data | ✅ Yes | ❌ No |
| Credit Card | ❌ Not required | ❌ Not required |
| Setup | Easy | Easy |

**Recommendation**: Use Amadeus for free tier flight search! 🚀

