from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Enum as SqlEnum,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class UserRole(str, Enum):
    ADMIN = "admin"
    VENDOR = "vendor"
    PASSENGER = "passenger"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    vendor: Mapped["Vendor"] = relationship(
        "Vendor",
        back_populates="user", 
        uselist=False,
        primaryjoin="User.id == Vendor.user_id"
    )


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    license_number: Mapped[str | None] = mapped_column(String(100))
    business_registration_number: Mapped[str | None] = mapped_column(String(100))
    tax_id: Mapped[str | None] = mapped_column(String(100))
    contact_phone: Mapped[str | None] = mapped_column(String(20))
    business_address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(100))
    district: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str | None] = mapped_column(String(100))
    zip_code: Mapped[str | None] = mapped_column(String(20))
    business_background: Mapped[str | None] = mapped_column(String(100))
    business_background_other: Mapped[str | None] = mapped_column(String(255))
    owner_name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20))
    website: Mapped[str | None] = mapped_column(String(255))
    years_in_business: Mapped[int | None] = mapped_column(Integer)
    number_of_aircraft: Mapped[int | None] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)
    # Contact person details
    contact_person_name: Mapped[str | None] = mapped_column(String(255))
    contact_person_designation: Mapped[str | None] = mapped_column(String(100))
    contact_person_email: Mapped[str | None] = mapped_column(String(255))
    # Bank details
    bank_account_number: Mapped[str | None] = mapped_column(String(50))
    bank_name: Mapped[str | None] = mapped_column(String(255))
    bank_ifsc: Mapped[str | None] = mapped_column(String(20))
    bank_branch: Mapped[str | None] = mapped_column(String(255))
    account_holder_name: Mapped[str | None] = mapped_column(String(255))
    # Document file paths
    certificate_of_incorporation_path: Mapped[str | None] = mapped_column(String(500))
    gst_certificate_path: Mapped[str | None] = mapped_column(String(500))
    owner_kyc_document_path: Mapped[str | None] = mapped_column(String(500))
    owner_kyc_address_proof_path: Mapped[str | None] = mapped_column(String(500))
    approval_status: Mapped[str] = mapped_column(String(50), default="pending")
    approval_notes: Mapped[str | None] = mapped_column(Text)
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    total_earnings: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped[User] = relationship(
        back_populates="vendor",
        foreign_keys=[user_id]
    )
    planes: Mapped[list["Plane"]] = relationship(back_populates="vendor")
    flights: Mapped[list["Flight"]] = relationship(back_populates="vendor")


class Plane(Base):
    __tablename__ = "planes"

    id: Mapped[int] = mapped_column(primary_key=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendors.id", ondelete="CASCADE"))
    model: Mapped[str] = mapped_column(String(255), nullable=False)
    registration_number: Mapped[str] = mapped_column(String(120), nullable=False)
    seat_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    amenities: Mapped[str | None] = mapped_column(Text)

    vendor: Mapped[Vendor] = relationship(back_populates="planes")
    flights: Mapped[list["Flight"]] = relationship(back_populates="plane")

    __table_args__ = (UniqueConstraint("vendor_id", "registration_number"),)


class FlightType(str, Enum):
    CHARTER = "charter"
    RETURN_LEG = "return_leg"


class Flight(Base):
    __tablename__ = "flights"

    id: Mapped[int] = mapped_column(primary_key=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendors.id", ondelete="CASCADE"))
    plane_id: Mapped[int] = mapped_column(ForeignKey("planes.id", ondelete="CASCADE"))
    origin: Mapped[str] = mapped_column(String(120), nullable=False)
    destination: Mapped[str] = mapped_column(String(120), nullable=False)
    departure_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    arrival_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    flight_type: Mapped[FlightType] = mapped_column(SqlEnum(FlightType), default=FlightType.CHARTER)
    base_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    is_full_charter_only: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vendor: Mapped[Vendor] = relationship(back_populates="flights")
    plane: Mapped[Plane] = relationship(back_populates="flights")
    seats: Mapped[list["SeatInventory"]] = relationship(back_populates="flight")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="flight")


class SeatInventory(Base):
    __tablename__ = "seat_inventory"

    id: Mapped[int] = mapped_column(primary_key=True)
    flight_id: Mapped[int] = mapped_column(ForeignKey("flights.id", ondelete="CASCADE"))
    seat_number: Mapped[str] = mapped_column(String(20), nullable=False)
    class_type: Mapped[str] = mapped_column(String(50), default="standard")
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

    flight: Mapped[Flight] = relationship(back_populates="seats")

    __table_args__ = (
        UniqueConstraint("flight_id", "seat_number", name="uq_flight_seat"),
    )


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    flight_id: Mapped[int] = mapped_column(ForeignKey("flights.id", ondelete="CASCADE"))
    passenger_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    seat_id: Mapped[int | None] = mapped_column(ForeignKey("seat_inventory.id"))
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[BookingStatus] = mapped_column(SqlEnum(BookingStatus), default=BookingStatus.PENDING)
    booked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_full_charter: Mapped[bool] = mapped_column(Boolean, default=False)
    # Additional passenger information (for bookings made on behalf of others)
    passenger_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    passenger_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    passenger_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    emergency_contact_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)

    flight: Mapped[Flight] = relationship(back_populates="bookings")
    passenger: Mapped[User] = relationship()
    seat: Mapped[SeatInventory | None] = relationship()
    payment: Mapped["Payment"] = relationship(back_populates="booking", uselist=False)


class PaymentProvider(str, Enum):
    STRIPE = "stripe"
    RAZORPAY = "razorpay"
    PAYPAL = "paypal"


class VendorNotification(Base):
    __tablename__ = "vendor_notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendors.id", ondelete="CASCADE"))
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"))
    notification_type: Mapped[str] = mapped_column(String(50), default="new_booking")
    message: Mapped[str | None] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vendor: Mapped[Vendor] = relationship()
    booking: Mapped[Booking] = relationship()


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), unique=True)
    provider: Mapped[PaymentProvider] = mapped_column(SqlEnum(PaymentProvider), nullable=False)
    provider_reference: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    status: Mapped[str] = mapped_column(String(50), default="pending")
    processed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    refund_reference: Mapped[str | None] = mapped_column(String(255))

    booking: Mapped[Booking] = relationship(back_populates="payment")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"))
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (CheckConstraint("rating >= 1 AND rating <= 5", name="ck_rating_range"),)


class AdminLog(Base):
    __tablename__ = "admin_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    meta: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# OTP Model - Modular implementation (can be removed to disable OTP feature)
class OtpVerification(Base):
    __tablename__ = "otp_verifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    mobile_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    otp_code: Mapped[str] = mapped_column(String(10), nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[int] = mapped_column(primary_key=True)
    key_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    encrypted_value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    updated_by_user: Mapped[User | None] = relationship()