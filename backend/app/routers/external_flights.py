"""
External Flights API Router
Allows admins to search and view flights from external APIs (AviationStack, Amadeus)
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..services.external_flight_api import get_external_flight_api


router = APIRouter()


@router.get("/search")
async def search_external_flights(
    origin: Optional[str] = Query(None, description="Origin airport code (e.g., BOM, DEL)"),
    destination: Optional[str] = Query(None, description="Destination airport code (e.g., DXB, JFK)"),
    date: Optional[str] = Query(None, description="Flight date in YYYY-MM-DD format"),
    limit: int = Query(50, ge=1, le=250, description="Maximum number of results"),
    provider: Optional[str] = Query("auto", description="API provider: 'amadeus', 'aviationstack', or 'auto' (default)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """
    Search for flights from external APIs (Amadeus or AviationStack).
    Admin only endpoint for testing and viewing external flight data.
    
    Provider selection:
    - 'auto': Try Amadeus first (free tier), fallback to AviationStack
    - 'amadeus': Use Amadeus API only
    - 'aviationstack': Use AviationStack API only
    """
    external_api = get_external_flight_api()
    
    if not external_api.is_enabled():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="External flight API is not enabled. Set ENABLE_EXTERNAL_FLIGHT_API=true and add API credentials (AMADEUS_API_KEY/SECRET or AVIATIONSTACK_API_KEY)"
        )
    
    import logging
    logger = logging.getLogger(__name__)
    
    flights = []
    source = None
    error = None
    
    # Determine which provider to use
    use_amadeus = provider.lower() in ["amadeus", "auto"]
    use_aviationstack = provider.lower() in ["aviationstack", "auto"]
    
    # Try Amadeus first (if enabled and auto/amadeus selected)
    if use_amadeus:
        try:
            api_key, api_secret = external_api._get_amadeus_credentials()
            if api_key and api_secret:
                flights = await external_api.fetch_flights_amadeus(
                    origin=origin,
                    destination=destination,
                    date=date,
                    limit=limit
                )
                source = "amadeus"
                logger.info(f"Successfully fetched {len(flights)} flights from Amadeus")
        except Exception as e:
            error = str(e)
            logger.warning(f"Amadeus API failed: {e}")
            if provider.lower() == "amadeus":
                # If explicitly requested Amadeus, raise the error
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error fetching flights from Amadeus: {error}"
                )
            # Otherwise, try AviationStack as fallback
    
    # Try AviationStack if no flights from Amadeus and it's enabled
    if not flights and use_aviationstack:
        try:
            api_key = external_api._get_api_key()
            if api_key:
                flights = await external_api.fetch_flights_aviationstack(
                    origin=origin,
                    destination=destination,
                    date=date,
                    limit=limit
                )
                source = "aviationstack"
                logger.info(f"Successfully fetched {len(flights)} flights from AviationStack")
        except Exception as e:
            if not error:
                error = str(e)
            logger.warning(f"AviationStack API failed: {e}")
    
    # If no flights and we have errors, raise exception
    if not flights:
        if error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching external flights: {error}"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No API credentials configured. Please add AMADEUS_API_KEY/SECRET or AVIATIONSTACK_API_KEY"
            )
    
    return {
        "count": len(flights),
        "flights": flights,
        "source": source,
        "query": {
            "origin": origin,
            "destination": destination,
            "date": date
        }
    }


@router.get("/status")
def get_external_api_status(
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Check if external flight API is enabled and configured"""
    external_api = get_external_flight_api()
    aviationstack_key = external_api._get_api_key()
    amadeus_key, amadeus_secret = external_api._get_amadeus_credentials()
    
    # Determine available providers
    has_aviationstack = bool(aviationstack_key)
    has_amadeus = bool(amadeus_key and amadeus_secret)
    
    providers = []
    if has_amadeus:
        providers.append("amadeus")
    if has_aviationstack:
        providers.append("aviationstack")
    
    return {
        "enabled": external_api.is_enabled(),
        "has_aviationstack": has_aviationstack,
        "has_amadeus": has_amadeus,
        "providers": providers,
        "recommended": "amadeus" if has_amadeus else ("aviationstack" if has_aviationstack else None)
    }

