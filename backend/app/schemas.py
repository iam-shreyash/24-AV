from datetime import datetime
from typing import Annotated, Any, Optional, Union

from pydantic import BaseModel, EmailStr, Field, PositiveInt

from .models import BookingStatus, FlightType, PaymentProvider, UserRole

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    role: UserRole


class TokenPayload(BaseModel):
    sub: int
    role: UserRole
    exp: int


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: Annotated[str, Field(min_length=8)]
    role: UserRole


class UserRead(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class VendorBase(BaseModel):
    company_name: str
    license_number: str | None = None
    business_registration_number: str | None = None
    tax_id: str | None = None
    contact_phone: str | None = None
    business_address: str | None = None
    city: str | None = None
    state: str | None = None
    district: str | None = None
    country: str | None = None
    zip_code: str | None = None
    business_background: str | None = None
    business_background_other: str | None = None
    owner_name: str | None = None
    phone: str | None = None
    website: str | None = None
    years_in_business: int | None = None
    number_of_aircraft: int | None = None
    description: str | None = None
    # Contact person details
    contact_person_name: str | None = None
    contact_person_designation: str | None = None
    contact_person_email: str | None = None
    # Bank details
    bank_account_number: str | None = None
    bank_name: str | None = None
    bank_ifsc: str | None = None
    bank_branch: str | None = None
    account_holder_name: str | None = None


class VendorCreate(VendorBase):
    pass


class VendorApplicationUpdate(VendorBase):
    """Schema for vendor application submission"""
    pass


class VendorRead(VendorBase):
    id: int
    user_id: int
    approval_status: str
    approval_notes: str | None = None
    certificate_of_incorporation_path: str | None = None
    gst_certificate_path: str | None = None
    owner_kyc_document_path: str | None = None
    owner_kyc_address_proof_path: str | None = None
    is_active: bool
    total_earnings: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VendorApprovalRequest(BaseModel):
    approval_status: str  # "approved" or "rejected"
    approval_notes: str | None = None


class PlaneBase(BaseModel):
    model: str
    registration_number: str
    seat_capacity: PositiveInt

class PlaneCreate(PlaneBase):
    # Extended fields (stored in amenities as JSON or separate fields)
    aircraft_name: str | None = None
    manufacturer: str | None = None
    model_number: str | None = None
    year_of_manufacture: int | None = None
    luggage_load_kg: float | None = None
    maximum_speed: float | None = None
    speed_unit: str | None = None  # "km/h" or "knots"
    range_km: float | None = None
    wifi_available: bool = False
    wifi_type: str | None = None  # "KA-Band", "Satellite", etc.
    dining_service: bool = False
    entertainment_system: bool = False
    pet_onboard_allowed: bool = False
    air_conditioning: bool = False
    other_amenities: list[str] = []


class PlaneRead(PlaneBase):
    id: int
    vendor_id: int | None = None
    # Include extended fields if needed
    aircraft_name: str | None = None
    manufacturer: str | None = None
    model_number: str | None = None
    year_of_manufacture: int | None = None
    luggage_load_kg: float | None = None
    maximum_speed: float | None = None
    speed_unit: str | None = None
    range_km: float | None = None
    wifi_available: bool = False
    wifi_type: str | None = None
    dining_service: bool = False
    entertainment_system: bool = False
    pet_onboard_allowed: bool = False
    air_conditioning: bool = False
    other_amenities: list[str] = []
    aircraft_images: list[str] = []

    class Config:
        from_attributes = True


class FlightBase(BaseModel):
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    flight_type: FlightType = FlightType.CHARTER
    base_price: float
    is_full_charter_only: bool = False


class FlightCreate(FlightBase):
    plane_id: int
    flight_number: str | None = None
    total_seats_available: int | None = None  # Override aircraft capacity if needed
    captain_name: str | None = None
    co_pilot_name: str | None = None
    attendant_names: list[str] = []
    emergency_crew_contact: str | None = None
    allowed_luggage_kg: float | None = None
    special_amenities: list[str] = []
    notes_for_passengers: str | None = None


class FlightUpdate(BaseModel):
    """Schema for updating flight information"""
    origin: str | None = None
    destination: str | None = None
    departure_time: datetime | None = None
    arrival_time: datetime | None = None
    flight_type: FlightType | None = None
    base_price: float | None = None
    is_full_charter_only: bool | None = None
    flight_number: str | None = None
    total_seats_available: int | None = None
    captain_name: str | None = None
    co_pilot_name: str | None = None
    attendant_names: list[str] | None = None
    emergency_crew_contact: str | None = None
    allowed_luggage_kg: float | None = None
    special_amenities: list[str] | None = None
    notes_for_passengers: str | None = None


class FlightRead(FlightBase):
    id: int
    vendor_id: int
    available_seats: int | None = None  # Number of available seats
    plane_id: int
    flight_number: str | None = None
    total_seats_available: int | None = None
    captain_name: str | None = None
    co_pilot_name: str | None = None
    attendant_names: list[str] = []
    emergency_crew_contact: str | None = None
    allowed_luggage_kg: float | None = None
    special_amenities: list[str] = []
    notes_for_passengers: str | None = None
    # Optional fields for external flights
    is_external: bool = False
    source: str | None = None
    airline: str | None = None
    # Aircraft details for passenger display
    flight_name: str | None = None  # Aircraft name/flight name
    manufacturer: str | None = None  # Aircraft manufacturer
    model: str | None = None  # Aircraft model
    aircraft_images: list[str] = []  # Array of aircraft image URLs

    class Config:
        from_attributes = True


class SeatBase(BaseModel):
    seat_number: str
    class_type: str = "standard"
    price: float


class SeatRead(SeatBase):
    id: int
    is_available: bool

    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    flight_id: int
    seat_id: int | None = None
    is_full_charter: bool = False
    quantity: int = 1  # Number of tickets to book
    # Additional passenger information (optional, defaults to logged-in user)
    passenger_name: str | None = None
    passenger_email: str | None = None
    passenger_phone: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    special_requests: str | None = None


class BookingRead(BaseModel):
    id: int
    flight_id: int
    passenger_id: int
    seat_id: int | None
    total_amount: float
    status: BookingStatus
    booked_at: datetime
    passenger_name: str | None = None
    passenger_email: str | None = None
    passenger_phone: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    special_requests: str | None = None

    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    provider: PaymentProvider
    amount: float
    currency: str = "USD"
    metadata: dict[str, Any] | None = None


class VendorNotificationRead(BaseModel):
    id: int
    vendor_id: int
    booking_id: int
    notification_type: str
    message: Optional[str] = None
    is_read: bool
    created_at: datetime
    booking: Optional["BookingRead"] = None

    class Config:
        from_attributes = True


class PaymentRead(BaseModel):
    id: int
    provider: PaymentProvider
    provider_reference: str
    amount: float
    currency: str
    status: str
    processed_at: datetime

    class Config:
        from_attributes = True


# API Key Management Schemas
class ApiKeyBase(BaseModel):
    key_name: str
    description: str | None = None
    is_active: bool = True


class ApiKeyCreate(ApiKeyBase):
    value: str  # Plaintext value that will be encrypted


class ApiKeyUpdate(BaseModel):
    value: str | None = None
    description: str | None = None
    is_active: bool | None = None


class ApiKeyRead(ApiKeyBase):
    id: int
    updated_by: int | None = None
    created_at: datetime
    updated_at: datetime
    # Note: value is never returned for security

    class Config:
        from_attributes = True

