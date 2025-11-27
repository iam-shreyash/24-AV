# AviationStack Plan Restrictions - Important Information

## Issue Identified

Your API key is **valid**, but you're getting a **403 Forbidden** error with the message:
> "Your current subscription plan does not support this API function."

## What This Means

✅ Your API key is **correct and active**  
❌ Your **Free tier plan** does **NOT** include access to the **Flights endpoint**

## AviationStack Plan Tiers

### Free Tier (Basic)
- ✅ Access to: Airports, Airlines, Aircraft Types, Cities, Countries
- ❌ **NO access to**: Flights, Routes, Flight Schedules
- Limited API calls per month

### Paid Plans
- ✅ Full access to all endpoints including Flights
- Higher API call limits
- Real-time flight data

## Solutions

### Option 1: Upgrade Your Plan (Recommended if you need flights)

1. Go to [AviationStack Pricing](https://aviationstack.com/pricing)
2. Choose a plan that includes Flights endpoint
3. Upgrade your account
4. Your existing API key will work with the upgraded plan

### Option 2: Use Alternative Free APIs

Consider these alternatives that offer free tier access to flights:

#### Amadeus API
- **Free tier**: 2,000 API calls/month
- **Flights endpoint**: ✅ Available on free tier
- **Sign up**: [Amadeus for Developers](https://developers.amadeus.com/)

#### FlightAPI
- **Free tier**: Limited calls
- **Flights endpoint**: ✅ Available
- **Sign up**: [FlightAPI](https://flightapi.io/)

### Option 3: Use Available Free Tier Endpoints

You can still use AviationStack for:
- ✅ Airport information
- ✅ Airline data
- ✅ Aircraft types
- ✅ City/Country data

But **NOT** for:
- ❌ Real-time flights
- ❌ Flight schedules
- ❌ Routes

## Testing Your Current Plan

To see what endpoints are available on your plan:

1. Go to [AviationStack Dashboard](https://aviationstack.com/dashboard)
2. Check your current plan/subscription
3. Review available endpoints
4. Check API documentation for your plan tier

## Current Status

- ✅ API Key: Valid and active
- ✅ API Connection: Working
- ❌ Flights Endpoint: Not available on your plan
- 💡 Solution: Upgrade plan or use alternative API

## Next Steps

1. **Decide**: Do you need real-time flight data?
   - If YES → Upgrade AviationStack plan OR switch to Amadeus/FlightAPI
   - If NO → Use AviationStack for other endpoints (airports, airlines, etc.)

2. **If upgrading**: 
   - Visit [AviationStack Pricing](https://aviationstack.com/pricing)
   - Choose appropriate plan
   - Your existing API key will work after upgrade

3. **If switching APIs**:
   - I can help integrate Amadeus or FlightAPI
   - Both offer free tier with flights endpoint
   - Similar integration process

## Questions?

- Check [AviationStack Documentation](https://aviationstack.com/documentation)
- Review [AviationStack Pricing](https://aviationstack.com/pricing)
- Contact AviationStack support if needed

