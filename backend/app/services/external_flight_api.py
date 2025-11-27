"""
External Flight API Integration Service

This service integrates with third-party flight APIs to fetch global flight data.
Supports multiple providers: AviationStack and Amadeus.

Supported APIs:
- AviationStack (https://aviationstack.com) - Requires paid plan for flights
- Amadeus (https://developers.amadeus.com) - Free tier available with flights endpoint
"""

import os
import httpx
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)


class ExternalFlightAPI:
    """Service for fetching flights from external APIs"""
    
    def __init__(self):
        self.aviationstack_base_url = "https://api.aviationstack.com/v1"
        self.amadeus_base_url = "https://test.api.amadeus.com"  # Use test for free tier
        self.amadeus_token_url = "https://test.api.amadeus.com/v1/security/oauth2/token"
        self.enable_external_api = os.getenv("ENABLE_EXTERNAL_FLIGHT_API", "false").lower() == "true"
        self._amadeus_access_token = None
        self._amadeus_token_expiry = None
        logger.info(f"External Flight API initialized - Enabled: {self.enable_external_api}")
    
    def _get_api_key(self) -> str:
        """
        Dynamically fetch API key from KeyManager or environment.
        This ensures we always get the latest key if it was updated in the database.
        """
        try:
            from .key_manager import KeyManager
            api_key = KeyManager.get("AVIATIONSTACK_API_KEY")
            if api_key:
                logger.debug(f"API key loaded from KeyManager (length: {len(api_key)})")
                return api_key
            else:
                logger.debug("API key not found in KeyManager, trying environment variable")
        except Exception as e:
            logger.warning(f"KeyManager not available, using env var: {e}")
        
        # Fallback to environment variable
        env_key = os.getenv("AVIATIONSTACK_API_KEY", "")
        if env_key:
            logger.debug(f"API key loaded from environment variable (length: {len(env_key)})")
        else:
            logger.warning("API key not found in KeyManager or environment variable")
        return env_key
    
    def _get_amadeus_credentials(self) -> Tuple[str, str]:
        """
        Dynamically fetch Amadeus API credentials from KeyManager or environment.
        Returns tuple of (api_key, api_secret).
        """
        try:
            from .key_manager import KeyManager
            api_key = KeyManager.get("AMADEUS_API_KEY")
            api_secret = KeyManager.get("AMADEUS_API_SECRET")
            if api_key and api_secret:
                logger.debug(f"Amadeus credentials loaded from KeyManager")
                return (api_key, api_secret)
            else:
                logger.debug("Amadeus credentials not found in KeyManager, trying environment variables")
        except Exception as e:
            logger.warning(f"KeyManager not available, using env vars: {e}")
        
        # Fallback to environment variables
        env_key = os.getenv("AMADEUS_API_KEY", "")
        env_secret = os.getenv("AMADEUS_API_SECRET", "")
        if env_key and env_secret:
            logger.debug(f"Amadeus credentials loaded from environment variables")
        else:
            logger.warning("Amadeus credentials not found in KeyManager or environment variables")
        return (env_key, env_secret)
    
    async def _get_amadeus_token(self) -> str:
        """
        Get or refresh Amadeus OAuth2 access token.
        Uses cached token if still valid, otherwise fetches a new one.
        """
        # Check if we have a valid cached token
        if self._amadeus_access_token and self._amadeus_token_expiry:
            if datetime.utcnow() < self._amadeus_token_expiry:
                logger.debug("Using cached Amadeus access token")
                return self._amadeus_access_token
        
        # Get credentials
        api_key, api_secret = self._get_amadeus_credentials()
        if not api_key or not api_secret:
            raise Exception("Amadeus API credentials not configured")
        
        # Fetch new token
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.amadeus_token_url,
                    data={
                        "grant_type": "client_credentials",
                        "client_id": api_key,
                        "client_secret": api_secret
                    }
                )
                response.raise_for_status()
                token_data = response.json()
                
                access_token = token_data.get("access_token")
                expires_in = token_data.get("expires_in", 1800)  # Default 30 minutes
                
                if not access_token:
                    raise Exception("Failed to get access token from Amadeus")
                
                # Cache the token (expire 1 minute before actual expiry for safety)
                self._amadeus_access_token = access_token
                self._amadeus_token_expiry = datetime.utcnow() + timedelta(seconds=expires_in - 60)
                
                logger.info("Successfully obtained Amadeus access token")
                return access_token
                
        except httpx.HTTPStatusError as e:
            error_detail = "Unknown error"
            try:
                error_data = e.response.json()
                error_detail = error_data.get("error_description", str(e))
            except:
                error_detail = str(e)
            
            logger.error(f"Failed to get Amadeus token: {error_detail}")
            raise Exception(f"Failed to authenticate with Amadeus: {error_detail}")
        except Exception as e:
            logger.error(f"Error getting Amadeus token: {e}")
            raise
    
    def is_enabled(self) -> bool:
        """Check if external API integration is enabled and configured"""
        if not self.enable_external_api:
            logger.debug("External API is disabled (ENABLE_EXTERNAL_FLIGHT_API not set to true)")
            return False
        # Check if at least one API is configured
        aviationstack_key = self._get_api_key()
        amadeus_key, amadeus_secret = self._get_amadeus_credentials()
        has_aviationstack = bool(aviationstack_key)
        has_amadeus = bool(amadeus_key and amadeus_secret)
        
        logger.debug(f"API status - AviationStack: {has_aviationstack}, Amadeus: {has_amadeus}")
        return has_aviationstack or has_amadeus
    
    async def fetch_flights_aviationstack(
        self,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        date: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Fetch flights from Aviationstack API
        
        Args:
            origin: IATA code or city name (e.g., "Mumbai", "BOM")
            destination: IATA code or city name (e.g., "Dubai", "DXB")
            date: Date in YYYY-MM-DD format (optional, defaults to today)
            limit: Maximum number of results (default: 100)
        
        Returns:
            List of flight dictionaries
        """
        api_key = self._get_api_key()
        if not api_key:
            logger.warning("Aviationstack API key not configured")
            raise Exception("Aviationstack API key is not configured. Please add it via Admin Portal → API Keys")
        
        try:
            # Build API request parameters
            # Required: access_key
            # Optional: limit, dep_iata, arr_iata, flight_date
            params = {
                "access_key": api_key,
                "limit": min(limit, 100),  # Max 100 for non-professional plans
            }
            
            # Filter by departure airport (IATA code)
            if origin:
                params["dep_iata"] = origin.upper()[:3]  # Use first 3 chars as IATA code
            
            # Filter by arrival airport (IATA code)
            if destination:
                params["arr_iata"] = destination.upper()[:3]
            
            # Filter by flight date (YYYY-MM-DD format)
            if date:
                params["flight_date"] = date
            else:
                # Default to today if no date provided
                params["flight_date"] = datetime.utcnow().strftime("%Y-%m-%d")
            
            # Note: AviationStack API works best with at least one filter (origin/destination/date)
            if not origin and not destination:
                logger.warning("No origin or destination specified - API may return limited results")
            
            # Don't log the full API key, just the first/last few chars for debugging
            api_key_preview = f"{api_key[:4]}...{api_key[-4:]}" if len(api_key) > 8 else "***"
            safe_params = {k: v for k, v in params.items() if k != 'access_key'}
            logger.info(f"Fetching flights from Aviationstack - API key: {api_key_preview}, params: {safe_params}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.aviationstack_base_url}/flights",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                logger.info(f"Aviationstack API response status: {response.status_code}, data keys: {list(data.keys())}")
                
                if data.get("error"):
                    error_info = data.get("error", {})
                    error_msg = error_info.get("info", error_info.get("message", "Unknown error"))
                    logger.error(f"Aviationstack API error: {error_msg}")
                    raise Exception(f"Aviationstack API error: {error_msg}")
                
                flights = data.get("data", [])
                logger.info(f"Received {len(flights)} flights from Aviationstack")
                
                normalized = self._normalize_aviationstack_flights(flights)
                logger.info(f"Normalized to {len(normalized)} flights")
                
                return normalized
        
        except httpx.HTTPStatusError as e:
            error_detail = "Unknown error"
            status_code = e.response.status_code
            
            try:
                error_data = e.response.json()
                error_info = error_data.get("error", {})
                error_detail = error_info.get("info", error_info.get("message", str(e)))
            except:
                error_detail = str(e)
            
            # Provide specific guidance for common errors
            if status_code == 403:
                logger.error(f"Aviationstack API 403 Forbidden - {error_detail}")
                
                # Check if it's a subscription plan issue
                if "subscription plan" in error_detail.lower() or "does not support" in error_detail.lower():
                    raise Exception(
                        f"Aviationstack API Error: {error_detail}\n\n"
                        "Your current subscription plan (likely Free tier) does not include access to the Flights endpoint.\n\n"
                        "Solutions:\n"
                        "1. Upgrade your plan at https://aviationstack.com/pricing\n"
                        "2. Check which endpoints are available on your plan at https://aviationstack.com/dashboard\n"
                        "3. Consider using alternative APIs (Amadeus, FlightAPI) that offer free tier access to flights\n\n"
                        "Note: Free tier typically only includes basic endpoints like Airports, Airlines, etc."
                    )
                else:
                    raise Exception(
                        f"Aviationstack API returned 403 Forbidden: {error_detail}\n\n"
                        "This usually means:\n"
                        "1. The API key is invalid or expired\n"
                        "2. The API key doesn't have access to the flights endpoint\n"
                        "3. You're using a free tier that has restrictions\n\n"
                        "Please check your API key at https://aviationstack.com/dashboard"
                    )
            elif status_code == 401:
                logger.error(f"Aviationstack API 401 Unauthorized - Invalid API key")
                raise Exception(
                    "Aviationstack API returned 401 Unauthorized. Your API key is invalid.\n"
                    "Please check your API key at https://aviationstack.com/dashboard"
                )
            elif status_code == 429:
                logger.error(f"Aviationstack API 429 Too Many Requests - Rate limit exceeded")
                raise Exception(
                    "Aviationstack API rate limit exceeded. Please wait a moment and try again."
                )
            else:
                logger.error(f"HTTP error fetching flights from Aviationstack ({status_code}): {error_detail}")
                raise Exception(f"Aviationstack API HTTP error ({status_code}): {error_detail}")
        except httpx.HTTPError as e:
            logger.error(f"Network error fetching flights from Aviationstack: {e}")
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in Aviationstack API call: {e}", exc_info=True)
            raise
    
    def _normalize_aviationstack_flights(self, flights: List[Dict]) -> List[Dict[str, Any]]:
        """
        Normalize Aviationstack flight data to match our internal flight schema
        
        Args:
            flights: Raw flight data from Aviationstack API
        
        Returns:
            Normalized flight data
        """
        normalized = []
        
        for flight in flights:
            try:
                flight_info = flight.get("flight", {})
                departure = flight.get("departure", {})
                arrival = flight.get("arrival", {})
                airline = flight.get("airline", {})
                
                # Parse dates
                dep_time_str = departure.get("scheduled", "")
                arr_time_str = arrival.get("scheduled", "")
                
                if not dep_time_str or not arr_time_str:
                    continue
                
                try:
                    dep_time = datetime.fromisoformat(dep_time_str.replace("Z", "+00:00"))
                    arr_time = datetime.fromisoformat(arr_time_str.replace("Z", "+00:00"))
                except (ValueError, AttributeError):
                    continue
                
                # Only include future flights (allow flights up to 1 hour in the past to account for timezone differences)
                # Remove this filter if you want to see all flights regardless of time
                # if dep_time < datetime.utcnow() - timedelta(hours=1):
                #     continue
                
                # Calculate price (Aviationstack doesn't provide prices, so we estimate)
                # You can integrate with a pricing API or use a default calculation
                base_price = self._estimate_price(
                    departure.get("iata", ""),
                    arrival.get("iata", ""),
                    airline.get("name", "")
                )
                
                normalized_flight = {
                    "id": f"ext_{flight_info.get('number', 'unknown')}_{dep_time_str}",
                    "origin": departure.get("airport", departure.get("iata", "")),
                    "destination": arrival.get("airport", arrival.get("iata", "")),
                    "departure_time": dep_time.isoformat(),
                    "arrival_time": arr_time.isoformat(),
                    "base_price": base_price,
                    "flight_type": "charter",  # Default, can be enhanced
                    "flight_number": flight_info.get("number", ""),
                    "airline": airline.get("name", "Unknown"),
                    "aircraft": flight.get("aircraft", {}).get("registration", ""),
                    "is_external": True,  # Flag to indicate this is from external API
                    "source": "aviationstack"
                }
                
                normalized.append(normalized_flight)
            
            except Exception as e:
                logger.warning(f"Error normalizing flight data: {e}")
                continue
        
        return normalized
    
    def _estimate_price(self, origin: str, destination: str, airline: str) -> float:
        """
        Estimate flight price (since Aviationstack doesn't provide pricing)
        In production, you'd integrate with a pricing API like FlightAPI or Amadeus
        
        Args:
            origin: Origin airport code
            destination: Destination airport code
            airline: Airline name
        
        Returns:
            Estimated price in USD
        """
        # Simple estimation based on route (this is a placeholder)
        # In production, use a pricing API or more sophisticated calculation
        base_price = 500.0  # Default base price
        
        # You can add logic here to estimate based on distance, airline, etc.
        # For now, return a default price
        
        return base_price


    async def fetch_flights_amadeus(
        self,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        date: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Fetch flights from Amadeus API
        
        Args:
            origin: IATA code (e.g., "BOM", "DEL")
            destination: IATA code (e.g., "DXB", "JFK")
            date: Date in YYYY-MM-DD format (optional, defaults to tomorrow)
            limit: Maximum number of results (default: 10, max: 250)
        
        Returns:
            List of flight dictionaries
        """
        api_key, api_secret = self._get_amadeus_credentials()
        if not api_key or not api_secret:
            raise Exception("Amadeus API credentials not configured. Please add AMADEUS_API_KEY and AMADEUS_API_SECRET")
        
        if not origin or not destination:
            raise Exception("Amadeus API requires both origin and destination")
        
        try:
            # Get access token
            access_token = await self._get_amadeus_token()
            
            # Prepare date (default to tomorrow if not provided)
            if not date:
                tomorrow = datetime.utcnow() + timedelta(days=1)
                date = tomorrow.strftime("%Y-%m-%d")
            
            # Build request
            params = {
                "originLocationCode": origin.upper()[:3],
                "destinationLocationCode": destination.upper()[:3],
                "departureDate": date,
                "adults": 1,
                "max": min(limit, 250)  # Amadeus max is 250
            }
            
            logger.info(f"Fetching flights from Amadeus - origin: {origin}, destination: {destination}, date: {date}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.amadeus_base_url}/v2/shopping/flight-offers",
                    params=params,
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                response.raise_for_status()
                data = response.json()
                
                logger.info(f"Amadeus API response status: {response.status_code}, data keys: {list(data.keys())}")
                
                flights = data.get("data", [])
                logger.info(f"Received {len(flights)} flights from Amadeus")
                
                normalized = self._normalize_amadeus_flights(flights)
                logger.info(f"Normalized to {len(normalized)} flights")
                
                return normalized
                
        except httpx.HTTPStatusError as e:
            error_detail = "Unknown error"
            try:
                error_data = e.response.json()
                error_detail = error_data.get("errors", [{}])[0].get("detail", str(e))
            except:
                error_detail = str(e)
            
            logger.error(f"Amadeus API HTTP error: {error_detail}")
            raise Exception(f"Amadeus API error: {error_detail}")
        except httpx.HTTPError as e:
            logger.error(f"Network error fetching flights from Amadeus: {e}")
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in Amadeus API call: {e}", exc_info=True)
            raise
    
    def _normalize_amadeus_flights(self, flights: List[Dict]) -> List[Dict[str, Any]]:
        """
        Normalize Amadeus flight data to match our internal flight schema
        
        Args:
            flights: Raw flight data from Amadeus API
        
        Returns:
            Normalized flight data
        """
        normalized = []
        
        for flight_offer in flights:
            try:
                # Amadeus returns flight offers with itineraries
                itineraries = flight_offer.get("itineraries", [])
                if not itineraries:
                    continue
                
                # Get first itinerary (usually outbound)
                itinerary = itineraries[0]
                segments = itinerary.get("segments", [])
                if not segments:
                    continue
                
                # Get first and last segments for departure/arrival
                first_segment = segments[0]
                last_segment = segments[-1]
                
                # Parse dates
                dep_time_str = first_segment.get("departure", {}).get("at", "")
                arr_time_str = last_segment.get("arrival", {}).get("at", "")
                
                if not dep_time_str or not arr_time_str:
                    continue
                
                try:
                    dep_time = datetime.fromisoformat(dep_time_str.replace("Z", "+00:00"))
                    arr_time = datetime.fromisoformat(arr_time_str.replace("Z", "+00:00"))
                except (ValueError, AttributeError):
                    continue
                
                # Get pricing
                price_data = flight_offer.get("price", {})
                total_price = float(price_data.get("total", 0))
                currency = price_data.get("currency", "USD")
                
                # Convert to INR if needed (simple conversion, in production use proper exchange rate API)
                if currency != "INR":
                    # Rough conversion (1 USD ≈ 83 INR, adjust as needed)
                    if currency == "USD":
                        total_price = total_price * 83
                
                # Get flight number
                flight_number = first_segment.get("number", "")
                carrier = first_segment.get("carrierCode", "")
                
                normalized_flight = {
                    "id": f"amadeus_{flight_offer.get('id', 'unknown')}",
                    "origin": first_segment.get("departure", {}).get("iataCode", ""),
                    "destination": last_segment.get("arrival", {}).get("iataCode", ""),
                    "departure_time": dep_time.isoformat(),
                    "arrival_time": arr_time.isoformat(),
                    "base_price": round(total_price, 2),
                    "flight_type": "commercial",  # Amadeus returns commercial flights
                    "flight_number": flight_number,
                    "airline": carrier,
                    "aircraft": first_segment.get("aircraft", {}).get("code", ""),
                    "is_external": True,
                    "source": "amadeus",
                    "number_of_stops": len(segments) - 1,
                    "duration": itinerary.get("duration", "")
                }
                
                normalized.append(normalized_flight)
            
            except Exception as e:
                logger.warning(f"Error normalizing Amadeus flight data: {e}")
                continue
        
        return normalized


# Singleton instance
_external_flight_api = None


def get_external_flight_api() -> ExternalFlightAPI:
    """Get singleton instance of ExternalFlightAPI"""
    global _external_flight_api
    if _external_flight_api is None:
        _external_flight_api = ExternalFlightAPI()
    return _external_flight_api

