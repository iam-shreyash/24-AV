# External Flight API Integration Guide

This document explains how to integrate third-party flight APIs to fetch global flight data and display it alongside vendor flights.

## Overview

The system supports fetching flights from external APIs (like Aviationstack, Amadeus, etc.) and merging them with internal vendor flights. This allows passengers to see:
- **Internal flights**: Flights created by vendors in your system
- **External flights**: Flights from global airlines via third-party APIs

## Supported APIs

### 1. Aviationstack (Currently Implemented)
- **Website**: https://aviationstack.com
- **Free Tier**: 100 requests/month
- **Pricing**: Starting from $9.99/month for 1,000 requests
- **Features**: Real-time flight status, schedules, airline routes, airports
- **API Documentation**: https://aviationstack.com/documentation

### 2. Other Options (Can be added)
- **Amadeus API**: Comprehensive travel API (requires partnership)
- **FlightAPI**: Real-time flight pricing data
- **AeroDataBox**: Affordable option for small businesses
- **Skyscanner API**: Flight search and pricing

## Setup Instructions

### Step 1: Get API Key

1. Sign up at https://aviationstack.com
2. Navigate to your dashboard
3. Copy your API key

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```env
# Enable external flight API integration
ENABLE_EXTERNAL_FLIGHT_API=true

# Your Aviationstack API key
AVIATIONSTACK_API_KEY=your_api_key_here
```

### Step 3: Install Dependencies

The required dependency (`httpx`) is already in `requirements.txt`. Install it:

```bash
pip install -r requirements.txt
```

### Step 4: Restart Server

Restart your FastAPI server for the changes to take effect.

## How It Works

### API Endpoint

The existing `GET /api/flights/` endpoint now supports external flights:

```bash
# Get all flights (internal + external)
GET /api/flights/

# Search with filters
GET /api/flights/?origin=Mumbai&destination=Dubai

# Exclude external flights (only internal vendor flights)
GET /api/flights/?include_external=false
```

### Query Parameters

- `origin` (optional): Filter by origin airport/city
- `destination` (optional): Filter by destination airport/city
- `include_return_legs` (optional, default: `true`): Include return leg flights
- `include_external` (optional, default: `true`): Include external API flights

### Response Format

The response includes both internal and external flights, with external flights marked:

```json
{
  "id": 0,  // External flights have id=0
  "origin": "Mumbai",
  "destination": "Dubai",
  "departure_time": "2024-12-20T10:00:00",
  "arrival_time": "2024-12-20T12:30:00",
  "base_price": 500.0,
  "flight_number": "AI-123",
  "is_external": true,  // Indicates external flight
  "source": "aviationstack",
  "airline": "Air India"
}
```

## Architecture

### Service Layer

The external API integration is handled by:
- `backend/app/services/external_flight_api.py`: Service for fetching from external APIs
- `backend/app/routers/flights.py`: Updated to merge internal and external flights

### Flow

1. User searches for flights via `GET /api/flights/`
2. Backend fetches:
   - Internal flights from database (vendor flights)
   - External flights from Aviationstack API (if enabled)
3. Results are merged and sorted by departure time
4. Combined results are returned to the frontend

## Customization

### Adding Other APIs

To add support for other flight APIs:

1. **Extend `ExternalFlightAPI` class** in `external_flight_api.py`:

```python
async def fetch_flights_amadeus(self, ...):
    # Implement Amadeus API integration
    pass
```

2. **Update the router** to call the new method

3. **Add configuration** in `config.py` and `.env`

### Price Estimation

Currently, Aviationstack doesn't provide pricing. The system uses a simple estimation function (`_estimate_price`). To get real prices:

1. **Integrate a pricing API** (FlightAPI, Amadeus Pricing API)
2. **Update `_estimate_price` method** to fetch real prices
3. **Consider caching** prices to reduce API calls

## Cost Management

### API Rate Limits

- **Aviationstack Free Tier**: 100 requests/month
- **Monitor usage** in Aviationstack dashboard
- **Implement caching** to reduce API calls

### Caching Strategy

Consider implementing caching for:
- Flight schedules (cache for 1-24 hours)
- Airport/city lookups (cache for longer periods)
- Price data (cache for shorter periods, e.g., 15 minutes)

Example caching implementation:

```python
from functools import lru_cache
from datetime import timedelta

@lru_cache(maxsize=100)
def get_cached_flights(origin, destination, date):
    # Cache flight data
    pass
```

## Testing

### Test External API Integration

1. **Enable the feature**:
   ```env
   ENABLE_EXTERNAL_FLIGHT_API=true
   AVIATIONSTACK_API_KEY=your_test_key
   ```

2. **Test the endpoint**:
   ```bash
   curl "http://localhost:8000/api/flights/?origin=Mumbai&destination=Dubai"
   ```

3. **Verify results** include both internal and external flights

### Test Without External API

Set `ENABLE_EXTERNAL_FLIGHT_API=false` to test with only internal flights.

## Troubleshooting

### External Flights Not Appearing

1. **Check API key**: Verify `AVIATIONSTACK_API_KEY` is set correctly
2. **Check enable flag**: Ensure `ENABLE_EXTERNAL_FLIGHT_API=true`
3. **Check API quota**: Verify you haven't exceeded rate limits
4. **Check logs**: Look for errors in server logs

### API Errors

- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Aviationstack API issue (temporary)

The system gracefully handles API errors and continues with internal flights only.

## Future Enhancements

1. **Multiple API Support**: Add Amadeus, Skyscanner, etc.
2. **Price Integration**: Integrate real-time pricing APIs
3. **Caching Layer**: Implement Redis caching for API responses
4. **Booking Integration**: Allow booking external flights
5. **Airline Filtering**: Filter by specific airlines
6. **Date Range Search**: Search flights for date ranges

## Support

For issues or questions:
- Check Aviationstack documentation: https://aviationstack.com/documentation
- Review server logs for detailed error messages
- Ensure environment variables are correctly set

