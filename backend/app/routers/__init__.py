from fastapi import APIRouter

from . import aircraft, auth, bookings, flights, payments, users, vendors, admin, api_keys, external_flights
from . import deleteVendor
from . import send_otp, verify_otp

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(vendors.router, prefix="/vendors", tags=["vendors"])
api_router.include_router(aircraft.router, prefix="/aircraft", tags=["aircraft"])
api_router.include_router(flights.router, prefix="/flights", tags=["flights"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(api_keys.router, prefix="/api-keys", tags=["api-keys"])
api_router.include_router(external_flights.router, prefix="/external-flights", tags=["external-flights"])
# Modular delete vendor endpoint - can be removed along with DeleteVendorButton.tsx
api_router.include_router(deleteVendor.router, prefix="/admin/vendors", tags=["admin"])
# Modular OTP endpoints - can be removed along with MobileOtpVerification.tsx and otpService.py
api_router.include_router(send_otp.router, prefix="/auth", tags=["auth"])
api_router.include_router(verify_otp.router, prefix="/auth", tags=["auth"])

