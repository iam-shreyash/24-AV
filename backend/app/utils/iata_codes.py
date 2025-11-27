"""
IATA Code to City Name Mapping
Maps common IATA airport codes to their city/airport names for flexible search.
"""
from typing import Dict, List, Optional

# Common IATA codes and their corresponding city/airport names
IATA_TO_CITY: Dict[str, List[str]] = {
    # India
    "BOM": ["Mumbai", "Bombay", "Mumbai Airport", "Chhatrapati Shivaji Maharaj International Airport"],
    "DEL": ["Delhi", "New Delhi", "Delhi Airport", "Indira Gandhi International Airport"],
    "BLR": ["Bangalore", "Bengaluru", "Bangalore Airport", "Kempegowda International Airport"],
    "CCU": ["Kolkata", "Calcutta", "Kolkata Airport", "Netaji Subhas Chandra Bose International Airport"],
    "MAA": ["Chennai", "Madras", "Chennai Airport", "Chennai International Airport"],
    "HYD": ["Hyderabad", "Hyderabad Airport", "Rajiv Gandhi International Airport"],
    "AMD": ["Ahmedabad", "Ahmedabad Airport", "Sardar Vallabhbhai Patel International Airport"],
    "PNQ": ["Pune", "Pune Airport", "Pune International Airport"],
    "GOI": ["Goa", "Goa Airport", "Dabolim Airport"],
    "COK": ["Kochi", "Cochin", "Kochi Airport", "Cochin International Airport"],
    "IXC": ["Chandigarh", "Chandigarh Airport"],
    "JAI": ["Jaipur", "Jaipur Airport", "Jaipur International Airport"],
    "LKO": ["Lucknow", "Lucknow Airport", "Chaudhary Charan Singh International Airport"],
    "GAU": ["Guwahati", "Guwahati Airport", "Lokpriya Gopinath Bordoloi International Airport"],
    
    # UAE
    "DXB": ["Dubai", "Dubai Airport", "Dubai International Airport"],
    "AUH": ["Abu Dhabi", "Abu Dhabi Airport", "Abu Dhabi International Airport"],
    "SHJ": ["Sharjah", "Sharjah Airport", "Sharjah International Airport"],
    
    # Other Middle East
    "DOH": ["Doha", "Doha Airport", "Hamad International Airport"],
    "BAH": ["Bahrain", "Bahrain Airport", "Bahrain International Airport"],
    "KWI": ["Kuwait", "Kuwait Airport", "Kuwait International Airport"],
    "RUH": ["Riyadh", "Riyadh Airport", "King Khalid International Airport"],
    "JED": ["Jeddah", "Jeddah Airport", "King Abdulaziz International Airport"],
    
    # Asia
    "SIN": ["Singapore", "Singapore Airport", "Changi Airport"],
    "BKK": ["Bangkok", "Bangkok Airport", "Suvarnabhumi Airport"],
    "KUL": ["Kuala Lumpur", "Kuala Lumpur Airport", "Kuala Lumpur International Airport"],
    "HKG": ["Hong Kong", "Hong Kong Airport", "Hong Kong International Airport"],
    "NRT": ["Tokyo", "Tokyo Airport", "Narita Airport"],
    "ICN": ["Seoul", "Seoul Airport", "Incheon Airport"],
    
    # Europe
    "LHR": ["London", "London Airport", "Heathrow Airport"],
    "CDG": ["Paris", "Paris Airport", "Charles de Gaulle Airport"],
    "FRA": ["Frankfurt", "Frankfurt Airport", "Frankfurt am Main Airport"],
    "AMS": ["Amsterdam", "Amsterdam Airport", "Schiphol Airport"],
    
    # USA
    "JFK": ["New York", "New York Airport", "John F. Kennedy International Airport"],
    "LAX": ["Los Angeles", "Los Angeles Airport", "LAX Airport"],
    "SFO": ["San Francisco", "San Francisco Airport", "San Francisco International Airport"],
}

# Reverse mapping: city name to IATA codes
CITY_TO_IATA: Dict[str, str] = {}
for iata, cities in IATA_TO_CITY.items():
    for city in cities:
        CITY_TO_IATA[city.lower()] = iata


def get_city_names_for_iata(iata_code: str) -> List[str]:
    """
    Get all city/airport names for a given IATA code.
    
    Args:
        iata_code: IATA code (e.g., "BOM")
    
    Returns:
        List of city/airport names (e.g., ["Mumbai", "Bombay", ...])
    """
    iata_upper = iata_code.upper().strip()
    return IATA_TO_CITY.get(iata_upper, [iata_upper])  # Return the code itself if not found


def get_iata_for_city(city_name: str) -> Optional[str]:
    """
    Get IATA code for a given city name.
    
    Args:
        city_name: City or airport name (e.g., "Mumbai")
    
    Returns:
        IATA code (e.g., "BOM") or None if not found
    """
    city_lower = city_name.lower().strip()
    return CITY_TO_IATA.get(city_lower)


def expand_search_terms(search_term: str) -> List[str]:
    """
    Expand a search term to include both IATA code and city names.
    
    Args:
        search_term: User input (could be IATA code or city name)
    
    Returns:
        List of search terms to match against (includes original + IATA + city names)
    """
    if not search_term or not isinstance(search_term, str):
        return []
    
    search_upper = search_term.upper().strip()
    search_lower = search_term.lower().strip()
    
    if not search_upper:
        return []
    
    # Start with the original term
    terms = [search_term, search_upper, search_lower]
    
    # If it's an IATA code, add city names
    if search_upper in IATA_TO_CITY:
        terms.extend(IATA_TO_CITY[search_upper])
    
    # If it's a city name, add IATA code
    iata = get_iata_for_city(search_term)
    if iata:
        terms.append(iata)
        terms.append(iata.upper())
    
    # Remove duplicates while preserving order
    seen = set()
    unique_terms = []
    for term in terms:
        if term and isinstance(term, str):
            term_lower = term.lower()
            if term_lower not in seen:
                seen.add(term_lower)
                unique_terms.append(term)
    
    return unique_terms if unique_terms else [search_term]

