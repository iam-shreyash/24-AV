# 24-AV Private Plane CRM & Shared Charter Booking System
## Complete Technical Documentation

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Frontend (Web Application)](#frontend-web-application)
4. [Backend (API Server)](#backend-api-server)
5. [Database Architecture](#database-architecture)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Security](#authentication--security)
8. [Third-Party Integrations](#third-party-integrations)
9. [Environment Configuration](#environment-configuration)
10. [Deployment & Build Configuration](#deployment--build-configuration)

---

## 1. System Architecture

### Architecture Pattern
- **Frontend**: Single Page Application (SPA) with React + Vite
- **Backend**: RESTful API with FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based stateless authentication
- **File Storage**: Local file system (uploads directory)
- **Caching**: Redis (optional, for session management)

### Data Flow
```
User (Browser) 
  ↓ HTTP/HTTPS
Frontend (React SPA on Vite Dev Server / Static Files)
  ↓ Axios HTTP Client
Backend (FastAPI Server)
  ↓ SQLAlchemy ORM
PostgreSQL Database
```

### Role-Based Access Control (RBAC)
- **Admin**: Full system access, vendor approval, user management
- **Vendor**: Aircraft & flight management, booking notifications
- **Passenger**: Flight search, booking, ticket generation

---

## 2. Technology Stack

### Frontend Technologies
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Core Framework** | React | 18.2.0 | UI library |
| **Build Tool** | Vite | 5.2.0 | Fast dev server & bundler |
| **Language** | TypeScript | 5.4.5 | Type-safe JavaScript |
| **Routing** | React Router DOM | 6.23.0 | Client-side routing |
| **HTTP Client** | Axios | 1.7.0 | API communication |
| **Styling** | Tailwind CSS | 3.4.3 | Utility-first CSS |
| **UI Components** | Radix UI | Various | Accessible components |
| **Icons** | Lucide React | 0.554.0 | Icon library |
| **Icons** | Heroicons | 2.1.5 | Additional icons |
| **Forms** | React Hook Form | (via Radix) | Form management |
| **State Management** | React Context API | Built-in | Global state |
| **Internationalization** | i18next | 23.16.8 | Multi-language support |
| **Theme** | next-themes | 0.4.6 | Dark/light mode |
| **Animations** | tailwindcss-animate | 1.0.7 | CSS animations |
| **Utilities** | clsx, tailwind-merge | Latest | Class name utilities |

### Backend Technologies
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | FastAPI | 0.110.0 | Web framework |
| **Server** | Uvicorn | 0.29.0 | ASGI server |
| **ORM** | SQLAlchemy | 2.0.34+ | Database ORM |
| **Database Driver** | psycopg | 3.1.0+ | PostgreSQL driver |
| **Validation** | Pydantic | 2.9.0+ | Data validation |
| **Authentication** | python-jose | 3.3.0 | JWT handling |
| **Password Hashing** | bcrypt | 5.0.0 | Secure hashing |
| **Environment** | python-dotenv | 1.0.0 | Env variable management |
| **Migrations** | Alembic | 1.13.1 | Database migrations |
| **Payments** | Stripe | 9.9.0 | Payment processing |
| **Payments** | Razorpay | 1.4.1 | Indian payment gateway |
| **Notifications** | Firebase Admin | 6.5.0 | Push notifications |
| **Email** | email-validator | 2.3.0 | Email validation |
| **HTTP Client** | httpx | 0.27.0 | Async HTTP client |
| **PDF Generation** | ReportLab | 4.0.7 | Ticket PDFs |
| **QR Codes** | qrcode[pil] | 7.4.2+ | Boarding pass QR |
| **SMS** | Twilio | 8.0.0+ | OTP delivery |
| **Document** | python-docx | 1.1.0+ | DOCX generation |
| **Encryption** | cryptography | 41.0.0+ | API key encryption |
| **Caching** | redis | 5.0.3 | Session caching |

### Database
- **Primary Database**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0 (Declarative Base)
- **Connection**: psycopg3 (binary mode)
- **Migrations**: Alembic

---

## 3. Frontend (Web Application)

### Project Structure
```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts              # Axios instance with interceptors
│   ├── components/
│   │   ├── admin/                 # Admin dashboard components
│   │   ├── aircraft/              # Aircraft management
│   │   ├── auth/                  # Login, Register, AuthContext
│   │   ├── dashboard/             # Role-based dashboards
│   │   ├── flights/               # Flight search, booking
│   │   ├── ui/                    # Reusable UI components
│   │   └── vendor/                # Vendor application
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utility functions
│   ├── locales/                   # i18n translations
│   ├── types/                     # TypeScript types
│   ├── utils/                     # Helper functions
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── public/                        # Static assets
├── package.json                   # Dependencies
├── vite.config.ts                 # Vite configuration
├── tailwind.config.ts             # Tailwind configuration
└── tsconfig.json                  # TypeScript configuration
```

### Key Frontend Libraries

#### UI Component Libraries
- **@radix-ui/react-dialog**: Modal dialogs
- **@radix-ui/react-tabs**: Tab components
- **@radix-ui/react-toast**: Toast notifications
- **@radix-ui/react-slot**: Polymorphic components
- **@headlessui/react**: Accessible UI components

#### Form & Validation
- **react-phone-input-2**: International phone input
- Built-in HTML5 validation
- Custom validation logic in components

#### Styling & Theming
- **Tailwind CSS**: Utility-first CSS framework
- **tailwindcss-animate**: Animation utilities
- **class-variance-authority**: Component variants
- **next-themes**: Dark/light theme switching

#### Internationalization
- **i18next**: Core i18n library
- **react-i18next**: React bindings
- **i18next-browser-languagedetector**: Auto language detection
- Supported languages: English, Hindi, Arabic, Hebrew, Spanish, French, German, Japanese, Chinese

### API Client Configuration

**File**: `src/api/client.ts`

```typescript
- Base URL: /api (proxied to http://localhost:8000)
- Axios instance with:
  - Request interceptor: Adds JWT token from localStorage
  - Response interceptor: Handles 401 (token refresh), 403 (forbidden)
  - withCredentials: true (for cookies)
```

### Routing Structure

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | Home | Public | Landing page |
| `/login` | Login | Public | User login |
| `/register` | Register | Public | User registration |
| `/admin` | AdminLogin | Public | Admin login |
| `/dashboard/admin/*` | AdminDashboard | Admin | Admin portal |
| `/vendor/dashboard/*` | VendorDashboard | Vendor | Vendor portal |
| `/my-bookings` | PassengerDashboard | Passenger | Passenger bookings |
| `/search` | FlightSearch | Public | Flight search |
| `/fleet` | Fleet | Public | Aircraft fleet |
| `/support` | Support | Public | Support page |
| `/offers` | Offers | Public | Special offers |
| `/vendor/application` | VendorApplication | Public | Vendor signup |

### State Management
- **AuthContext**: Global authentication state (user, role, token)
- **ThemeProvider**: Dark/light mode state
- **Local State**: Component-level state with useState
- **URL State**: Query parameters for search filters

---

## 4. Backend (API Server)

### Project Structure
```
backend/
├── app/
│   ├── routers/
│   │   ├── __init__.py            # API router aggregation
│   │   ├── auth.py                # Authentication endpoints
│   │   ├── users.py               # User management
│   │   ├── vendors.py             # Vendor management
│   │   ├── aircraft.py            # Aircraft CRUD
│   │   ├── flights.py             # Flight management
│   │   ├── bookings.py            # Booking system
│   │   ├── payments.py            # Payment processing
│   │   ├── admin.py               # Admin operations
│   │   ├── api_keys.py            # API key management
│   │   ├── external_flights.py    # External flight APIs
│   │   ├── send_otp.py            # OTP sending
│   │   ├── verify_otp.py          # OTP verification
│   │   └── deleteVendor.py        # Vendor deletion
│   ├── services/
│   │   ├── external_flight_api.py # AviationStack/Amadeus
│   │   ├── key_encryption.py      # API key encryption
│   │   ├── key_manager.py         # Secure key storage
│   │   ├── otpService.py          # OTP generation/validation
│   │   └── ticket_generator.py    # PDF/DOCX tickets
│   ├── utils/
│   │   └── iata_codes.py          # Airport code expansion
│   ├── config.py                  # Settings management
│   ├── database.py                # Database connection
│   ├── dependencies.py            # FastAPI dependencies
│   ├── main.py                    # FastAPI app instance
│   ├── models.py                  # SQLAlchemy models
│   ├── schemas.py                 # Pydantic schemas
│   └── security.py                # JWT & password hashing
├── uploads/                       # File uploads
├── templates/                     # Email templates
├── .env                           # Environment variables
├── requirements.txt               # Python dependencies
└── run_server.py                  # Server startup script
```

### FastAPI Configuration

**File**: `app/main.py`

```python
- Title: "Private Plane CRM & Shared Charter API"
- Version: 0.1.0
- CORS: Enabled for localhost:5173, 5174, 3000 + wildcard
- Static Files: /uploads mounted
- Lifespan: KeyManager initialization on startup
```

### Middleware & Security
- **CORSMiddleware**: Cross-origin resource sharing
- **JWT Authentication**: Bearer token validation
- **Role-based Access**: Decorator-based permission checks
- **Password Hashing**: bcrypt with 72-byte limit
- **API Key Encryption**: Fernet encryption for sensitive keys

### Services

#### External Flight API Service
- **AviationStack**: Real-time flight data (free tier: 100 req/month)
- **Amadeus**: Flight search API (free tier available)
- Configurable via `ENABLE_EXTERNAL_FLIGHT_API` flag

#### OTP Service
- **Development Mode**: Logs OTP to console
- **Twilio**: SMS delivery (free trial: $15.50 credit)
- **MSG91**: India-focused SMS (free trial available)
- Configurable via `SMS_PROVIDER` environment variable

#### Ticket Generator
- **PDF**: ReportLab-based ticket generation
- **DOCX**: python-docx for Word documents
- **QR Codes**: Embedded boarding pass QR codes
- **Branding**: Customizable with company logo

#### Key Manager
- **Encryption**: Fernet symmetric encryption
- **Storage**: Database-backed secure key storage
- **Fallback**: Environment variables if DB unavailable
- **Supported Keys**: Stripe, Razorpay, PayPal, AviationStack, Firebase

---

## 5. Database Architecture

### Database Configuration
- **Database**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0 (Declarative Base)
- **Driver**: psycopg3 (binary mode)
- **Connection Pool**: Default SQLAlchemy pooling
- **Migrations**: Alembic for schema versioning

### Database Models

#### Core Models

**User Model**
```python
- id: Integer (PK)
- email: String(255) (Unique, Indexed)
- hashed_password: String(255)
- full_name: String(255)
- role: Enum(ADMIN, VENDOR, PASSENGER)
- is_active: Boolean
- created_at, updated_at: DateTime
- Relationship: vendor (One-to-One)
```

**Vendor Model**
```python
- id: Integer (PK)
- user_id: Integer (FK → users.id, Unique)
- company_name: String(255)
- license_number, business_registration_number, tax_id: String
- contact_phone, business_address, city, state, district, country, zip_code
- business_background, owner_name, phone, website
- years_in_business, number_of_aircraft: Integer
- description: Text
- contact_person_name, designation, email
- bank_account_number, bank_name, bank_ifsc, bank_branch, account_holder_name
- certificate_of_incorporation_path, gst_certificate_path, owner_kyc_document_path, owner_kyc_address_proof_path: String(500)
- approval_status: String(50) [pending, approved, rejected]
- approval_notes: Text
- approved_by: Integer (FK → users.id)
- approved_at: DateTime
- is_active: Boolean
- total_earnings: Numeric(12, 2)
- created_at, updated_at: DateTime
- Relationships: user, planes, flights
```

**Plane (Aircraft) Model**
```python
- id: Integer (PK)
- vendor_id: Integer (FK → vendors.id)
- model: String(255)
- registration_number: String(120)
- seat_capacity: Integer
- amenities: Text (JSON: aircraft_name, manufacturer, year, luggage_load_kg, max_speed, range_km, wifi, dining, entertainment, pet_allowed, AC, images)
- Unique Constraint: (vendor_id, registration_number)
- Relationships: vendor, flights
```

**Flight Model**
```python
- id: Integer (PK)
- vendor_id: Integer (FK → vendors.id)
- plane_id: Integer (FK → planes.id)
- origin, destination: String(120)
- departure_time, arrival_time: DateTime
- flight_type: Enum(CHARTER, RETURN_LEG)
- base_price: Numeric(10, 2)
- is_full_charter_only: Boolean
- created_at: DateTime
- Relationships: vendor, plane, seats, bookings
```

**SeatInventory Model**
```python
- id: Integer (PK)
- flight_id: Integer (FK → flights.id)
- seat_number: String(20)
- class_type: String(50) [standard]
- price: Numeric(10, 2)
- is_available: Boolean
- Unique Constraint: (flight_id, seat_number)
- Relationship: flight
```

**Booking Model**
```python
- id: Integer (PK)
- flight_id: Integer (FK → flights.id)
- passenger_id: Integer (FK → users.id)
- seat_id: Integer (FK → seat_inventory.id, Nullable)
- total_amount: Numeric(10, 2)
- status: Enum(PENDING, CONFIRMED, CANCELLED, REFUNDED)
- booked_at: DateTime
- is_full_charter: Boolean
- passenger_name, passenger_email, passenger_phone: String (for guest bookings)
- emergency_contact_name, emergency_contact_phone: String
- special_requests: Text
- Relationships: flight, passenger, seat, payment
```

**Payment Model**
```python
- id: Integer (PK)
- booking_id: Integer (FK → bookings.id, Unique)
- provider: Enum(STRIPE, RAZORPAY, PAYPAL)
- provider_reference: String(255)
- amount: Numeric(10, 2)
- currency: String(10) [USD, INR]
- status: String(50) [pending, completed, failed, refunded]
- processed_at: DateTime
- refund_reference: String(255, Nullable)
- Relationship: booking
```

**VendorNotification Model**
```python
- id: Integer (PK)
- vendor_id: Integer (FK → vendors.id)
- booking_id: Integer (FK → bookings.id)
- notification_type: String(50) [new_booking]
- message: Text
- is_read: Boolean
- created_at: DateTime
- Relationships: vendor, booking
```

**OtpVerification Model** (Modular)
```python
- id: Integer (PK)
- mobile_number: String(20) (Indexed)
- otp_code: String(10)
- is_verified: Boolean
- expires_at: DateTime (Indexed)
- created_at: DateTime
- verified_at: DateTime (Nullable)
```

**ApiKey Model**
```python
- id: Integer (PK)
- key_name: String(100) (Unique, Indexed)
- encrypted_value: Text
- description: String(255)
- is_active: Boolean
- updated_by: Integer (FK → users.id)
- created_at, updated_at: DateTime
- Relationship: updated_by_user
```

**Review Model**
```python
- id: Integer (PK)
- booking_id: Integer (FK → bookings.id)
- rating: Integer (1-5)
- comment: Text
- created_at: DateTime
- Constraint: rating >= 1 AND rating <= 5
```

**AdminLog Model**
```python
- id: Integer (PK)
- admin_id: Integer (FK → users.id)
- action: String(255)
- meta: Text (JSON)
- created_at: DateTime
```

### Database Relationships
```
User (1) ←→ (1) Vendor
Vendor (1) ←→ (N) Plane
Vendor (1) ←→ (N) Flight
Plane (1) ←→ (N) Flight
Flight (1) ←→ (N) SeatInventory
Flight (1) ←→ (N) Booking
User (1) ←→ (N) Booking (as passenger)
Booking (1) ←→ (1) Payment
Booking (1) ←→ (1) SeatInventory
Vendor (1) ←→ (N) VendorNotification
Booking (1) ←→ (N) VendorNotification
```

---

## 6. API Endpoints

### Authentication APIs (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | User registration |
| POST | `/login` | Public | User login (returns JWT) |
| POST | `/send-otp` | Public | Send OTP to mobile |
| POST | `/verify-otp` | Public | Verify OTP code |

### User APIs (`/api/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/me` | Authenticated | Get current user |
| GET | `/` | Admin | List all users |
| PATCH | `/me` | Authenticated | Update own profile |
| PATCH | `/{user_id}` | Admin | Update user |
| PATCH | `/{user_id}/status` | Admin | Activate/deactivate user |
| DELETE | `/{user_id}` | Admin | Delete user |
| PATCH | `/{user_id}/reset-password` | Admin | Reset user password |

### Vendor APIs (`/api/vendors`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/application` | Vendor | Submit vendor application |
| GET | `/application` | Vendor | Get own application status |
| POST | `/` | Admin | Create vendor |
| GET | `/` | Admin | List all vendors |
| GET | `/pending` | Admin | List pending applications |
| PATCH | `/{vendor_id}/approve` | Admin | Approve/reject vendor |
| PATCH | `/{vendor_id}` | Admin/Vendor | Update vendor |
| PUT | `/{vendor_id}/deactivate` | Admin | Deactivate vendor |
| PUT | `/{vendor_id}/activate` | Admin | Activate vendor |
| GET | `/recent-bookings` | Vendor | Get recent bookings |
| GET | `/notifications` | Vendor | Get notifications |
| PATCH | `/notifications/{id}/read` | Vendor | Mark notification as read |
| GET | `/{vendor_id}/documents/{type}` | Admin/Vendor | Download vendor documents |

### Aircraft APIs (`/api/aircraft`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Vendor | Create aircraft (multipart/form-data) |
| GET | `/` | Vendor/Admin | List aircraft |
| GET | `/{aircraft_id}` | Vendor/Admin | Get aircraft details |
| PATCH | `/{aircraft_id}` | Vendor | Update aircraft (multipart/form-data) |
| GET | `/images/{filename}` | Public | Serve aircraft images |

### Flight APIs (`/api/flights`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Vendor/Admin | Create flight |
| GET | `/` | Public | Search flights (with filters) |
| GET | `/list/all` | Public | Get all flights (debug) |
| GET | `/vendor` | Vendor | Get vendor's flights |
| GET | `/admin/all` | Admin | Get all flights (admin) |
| GET | `/{flight_id}` | Public | Get flight details |
| PATCH | `/{flight_id}` | Vendor/Admin | Update flight |
| DELETE | `/{flight_id}` | Vendor/Admin | Delete flight |

### Booking APIs (`/api/bookings`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Passenger | Create booking |
| GET | `/` | Passenger | Get user's bookings |
| PATCH | `/{booking_id}` | Passenger/Admin | Update booking status |
| GET | `/{booking_id}/ticket` | Passenger | Download PDF ticket |
| GET | `/{booking_id}/ticket-docx` | Passenger | Download DOCX ticket |

### Payment APIs (`/api/payments`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/{booking_id}` | Passenger | Process payment |
| POST | `/{booking_id}/refund` | Admin | Refund payment |

### Admin APIs (`/api/admin`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/stats` | Admin | Dashboard statistics |
| GET | `/vendors` | Admin | List all vendors |
| DELETE | `/vendors/{vendor_id}` | Admin | Delete vendor (modular) |

### API Key APIs (`/api/api-keys`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin | List all API keys |
| GET | `/{key_name}` | Admin | Get API key metadata |
| GET | `/{key_name}/value` | Admin | Get decrypted key value |
| POST | `/` | Admin | Create/update API key |
| PATCH | `/{key_name}` | Admin | Update API key |
| DELETE | `/{key_name}` | Admin | Delete API key |
| POST | `/reload` | Admin | Reload keys from database |

### External Flight APIs (`/api/external-flights`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/search` | Public | Search external flights |
| GET | `/status` | Public | Check API status |

---

## 7. Authentication & Security

### JWT Authentication Flow

```
1. User Login (POST /api/auth/login)
   ↓
2. Backend validates credentials (bcrypt.checkpw)
   ↓
3. Generate JWT token (python-jose)
   - Payload: {sub: user_id, role: user_role, exp: expiry}
   - Algorithm: HS256
   - Secret: JWT_SECRET from .env
   ↓
4. Return token to frontend
   ↓
5. Frontend stores token in localStorage
   ↓
6. Subsequent requests include token in Authorization header
   - Header: "Authorization: Bearer <token>"
   ↓
7. Backend validates token (dependencies.py: get_current_user)
   ↓
8. Extract user_id and role from token
   ↓
9. Fetch user from database
   ↓
10. Inject user into route handler
```

### Token Refresh (Not Implemented)
- Current implementation: Single long-lived token (3600s = 1 hour)
- Frontend: Axios interceptor attempts refresh on 401 (placeholder)
- **Recommendation**: Implement refresh token mechanism for production

### Password Security
- **Hashing**: bcrypt with auto-generated salt
- **Rounds**: Default (10-12 rounds)
- **Limit**: 72-byte password limit (bcrypt constraint)
- **Validation**: Minimum 8 characters (frontend)

### Role-Based Access Control

**Implementation**: `dependencies.py`

```python
def require_role(allowed_roles: list[str]):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(403, "Insufficient permissions")
        return current_user
    return dependency
```

**Usage**:
```python
@router.get("/admin/stats")
def get_stats(current_user: User = Depends(require_role(["admin"]))):
    ...
```

### API Key Encryption

**Service**: `services/key_encryption.py`

```python
- Algorithm: Fernet (symmetric encryption)
- Key Derivation: PBKDF2HMAC with SHA256
- Salt: Derived from JWT_SECRET
- Storage: Encrypted values in api_keys table
- Decryption: On-demand via KeyManager.get()
```

### CORS Configuration

**File**: `app/main.py`

```python
allow_origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:5174",
    "http://localhost:3000",  # Alternative ports
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "*"  # Mobile app development
]
allow_credentials = True
allow_methods = ["*"]
allow_headers = ["*"]
```

---

## 8. Third-Party Integrations

### Payment Gateways

#### Stripe
- **Purpose**: International payments
- **SDK**: stripe==9.9.0
- **Configuration**: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
- **Features**: Card payments, refunds
- **Test Mode**: sk_test_* keys

#### Razorpay
- **Purpose**: Indian payments (UPI, cards, wallets)
- **SDK**: razorpay==1.4.1
- **Configuration**: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
- **Features**: Payment links, refunds
- **Test Mode**: rzp_test_* keys

#### PayPal
- **Purpose**: Alternative payment method
- **Configuration**: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
- **Status**: Configured but not fully implemented

### External Flight APIs

#### AviationStack
- **Purpose**: Real-time flight data
- **Website**: https://aviationstack.com
- **Free Tier**: 100 requests/month
- **Configuration**: AVIATIONSTACK_API_KEY
- **Features**: Flight search, schedules, routes

#### Amadeus (Planned)
- **Purpose**: Flight search and booking
- **Website**: https://developers.amadeus.com
- **Free Tier**: Available
- **Status**: Partial implementation

### SMS/OTP Services

#### Twilio
- **Purpose**: SMS delivery for OTP
- **SDK**: twilio==8.0.0+
- **Free Trial**: $15.50 credit (~1000 SMS)
- **Configuration**: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- **Activation**: Set SMS_PROVIDER=twilio

#### MSG91
- **Purpose**: India-focused SMS
- **Website**: https://msg91.com
- **Configuration**: MSG91_AUTH_KEY, MSG91_SENDER_ID, MSG91_TEMPLATE_ID
- **Activation**: Set SMS_PROVIDER=msg91

#### Development Mode
- **Activation**: Set SMS_PROVIDER=dev
- **Behavior**: Logs OTP to console instead of sending SMS

### Firebase
- **Purpose**: Push notifications (planned)
- **SDK**: firebase-admin==6.5.0
- **Configuration**: FIREBASE_CREDENTIALS_PATH (JSON file)
- **Features**: FCM for mobile notifications
- **Status**: Backend ready, frontend integration pending

### Redis
- **Purpose**: Session caching, rate limiting
- **SDK**: redis==5.0.3
- **Configuration**: REDIS_URL
- **Status**: Configured but optional

---

## 9. Environment Configuration

### Backend Environment Variables

**File**: `backend/.env`

```bash
# Database
DATABASE_URL=postgresql+psycopg://crm_user:password@localhost:5432/private_plane_crm

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=3600  # 1 hour

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# External APIs
AVIATIONSTACK_API_KEY=...
ENABLE_EXTERNAL_FLIGHT_API=false  # Set to true to enable

# OTP/SMS
SMS_PROVIDER=dev  # Options: dev, twilio, msg91
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
MSG91_AUTH_KEY=...
MSG91_SENDER_ID=OTPMSG
MSG91_TEMPLATE_ID=...

# Firebase
FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json

# Redis
REDIS_URL=redis://localhost:6379/0

# Admin Account
ADMIN_DEFAULT_EMAIL=admin@privateplane.app
ADMIN_DEFAULT_PASSWORD=ChangeMe123!
```

### Frontend Environment Variables

**File**: `frontend/.env` (Optional)

```bash
VITE_API_URL=http://localhost:8000/api
```

**Note**: Frontend uses Vite proxy configuration instead of direct API URL.

### Mobile App Configuration

**File**: Mobile app's `.env` or `config.ts`

```bash
# Android Emulator
API_BASE_URL=http://10.0.2.2:8000

# iOS Simulator
API_BASE_URL=http://localhost:8000

# Physical Device (same Wi-Fi)
API_BASE_URL=http://192.168.31.64:8000
```

---

## 10. Deployment & Build Configuration

### Frontend Build

**Development**:
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

**Production Build**:
```bash
npm run build  # Outputs to frontend/dist/
npm run preview  # Preview production build
```

**Deployment Platforms**:
- **Vercel**: Zero-config deployment
  - Connect GitHub repo
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment: Node.js 18+

- **Netlify**: Similar to Vercel
  - Build command: `npm run build`
  - Publish directory: `dist`

- **AWS S3 + CloudFront**: Static hosting
  - Upload `dist/` to S3 bucket
  - Configure CloudFront for CDN

### Backend Deployment

**Development**:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run_server.py  # Runs on http://localhost:8000
```

**Production**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Deployment Platforms**:

- **Render**:
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Environment: Python 3.11+
  - Add environment variables in dashboard

- **Railway**:
  - Automatically detects Python
  - Add `Procfile`: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Configure environment variables

- **AWS EC2**:
  - Install Python 3.11+, PostgreSQL
  - Use systemd service for auto-restart
  - Nginx reverse proxy
  - SSL with Let's Encrypt

- **Docker** (Recommended):
  ```dockerfile
  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```

### Database Deployment

**PostgreSQL Hosting**:
- **Render**: Free tier available (expires after 90 days)
- **Railway**: Free tier with credit
- **AWS RDS**: Production-grade, paid
- **DigitalOcean**: Managed PostgreSQL
- **Supabase**: PostgreSQL with built-in features

**Migration**:
```bash
# Run migrations
alembic upgrade head

# Create admin user
python create_admin.py

# Create test users
python create_test_users_postgres.py
```

### Environment-Specific Configuration

**Development**:
- `.env` file in backend/
- Vite proxy for API calls
- Hot reload enabled

**Staging**:
- `.env.staging` file
- Separate database
- Test payment keys

**Production**:
- Environment variables in hosting platform
- Production database with backups
- Live payment keys
- SSL/TLS enabled
- CORS restricted to production domain

---

## Additional Technical Components

### API Response Format

**Success Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "passenger",
  "created_at": "2024-12-05T10:00:00Z"
}
```

**Error Response**:
```json
{
  "detail": "Error message here"
}
```

**Validation Error**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Vendor Approval Workflow

```
1. User registers with role=VENDOR
   ↓
2. Vendor record created with approval_status="pending"
   ↓
3. Vendor submits application (POST /api/vendors/application)
   - Uploads documents (KYC, GST, incorporation certificate)
   - Fills business details
   ↓
4. Admin reviews application (GET /api/vendors/pending)
   ↓
5. Admin approves/rejects (PATCH /api/vendors/{id}/approve)
   - approval_status = "approved" or "rejected"
   - approval_notes added
   ↓
6. Vendor can access dashboard if approved
   - Can create aircraft and flights
   ↓
7. Admin can deactivate vendor anytime (PUT /api/vendors/{id}/deactivate)
```

### Booking & Payment Workflow

```
1. Passenger searches flights (GET /api/flights?origin=DEL&destination=BOM)
   ↓
2. Passenger selects flight and seats
   ↓
3. Create booking (POST /api/bookings)
   - Status: PENDING
   - Seats marked as unavailable
   ↓
4. Process payment (POST /api/payments/{booking_id})
   - Stripe/Razorpay integration
   - Payment provider returns reference
   ↓
5. Update booking status to CONFIRMED
   ↓
6. Generate ticket (GET /api/bookings/{id}/ticket)
   - PDF with QR code
   - Email sent to passenger
   ↓
7. Vendor receives notification
   - VendorNotification record created
   ↓
8. Passenger can cancel (PATCH /api/bookings/{id})
   - Status: CANCELLED
   - Refund initiated if applicable
```

### Push Notification Workflow (Planned)

```
1. Vendor creates flight
   ↓
2. Backend triggers notification to subscribed passengers
   ↓
3. Firebase Cloud Messaging (FCM)
   ↓
4. Mobile app receives notification
   ↓
5. User taps notification → Opens flight details
```

### File Upload Workflow

```
1. Frontend: User selects file (aircraft image, vendor document)
   ↓
2. Frontend: FormData with multipart/form-data
   ↓
3. Backend: FastAPI receives UploadFile
   ↓
4. Backend: Saves to uploads/ directory
   - Filename: {type}_{id}_{random_hash}.{ext}
   ↓
5. Backend: Stores relative path in database
   - Example: /uploads/aircraft_images/aircraft_10_exterior_abc123.jpg
   ↓
6. Frontend: Accesses via /uploads/{filename}
   - Proxied through Vite in dev
   - Served by FastAPI StaticFiles
```

---

## Testing Credentials

### Admin
- Email: `admin@test.com`
- Password: `Admin123!`

### Vendor
- Email: `vendor@test.com`
- Password: `Vendor123!`

### Passenger
- Email: `passenger@test.com`
- Password: `Pass123!`

---

## Development Commands

### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python run_server.py

# Create admin
python create_admin.py

# Create test users
python create_test_users_postgres.py

# Run migrations
alembic upgrade head

# Create migration
alembic revision --autogenerate -m "description"
```

### Frontend
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Performance Considerations

### Database Optimization
- **Indexes**: Created on frequently queried columns (email, user_id, flight_id)
- **Connection Pooling**: SQLAlchemy default pooling
- **Query Optimization**: Use of `joinedload` for relationships
- **Pagination**: Implemented for large result sets

### Frontend Optimization
- **Code Splitting**: React.lazy() for route-based splitting
- **Image Optimization**: Lazy loading for aircraft images
- **Caching**: Axios response caching (not implemented)
- **Minification**: Vite handles in production build

### Backend Optimization
- **Async Operations**: FastAPI async routes for I/O operations
- **Caching**: Redis for session data (optional)
- **Static Files**: Nginx for production static file serving
- **Workers**: Multiple Uvicorn workers for production

---

## Security Best Practices

### Implemented
✅ JWT-based authentication
✅ bcrypt password hashing
✅ CORS configuration
✅ SQL injection prevention (SQLAlchemy ORM)
✅ XSS prevention (React escapes by default)
✅ API key encryption
✅ Role-based access control
✅ Input validation (Pydantic)

### Recommended for Production
⚠️ HTTPS/TLS encryption
⚠️ Rate limiting (Redis + slowapi)
⚠️ CSRF protection for state-changing operations
⚠️ Content Security Policy (CSP) headers
⚠️ Refresh token mechanism
⚠️ Audit logging for sensitive operations
⚠️ Database backups
⚠️ Environment variable encryption
⚠️ API versioning
⚠️ Monitoring & alerting (Sentry, DataDog)

---

## Monitoring & Logging

### Backend Logging
- **Library**: Python `logging` module
- **Level**: INFO (configurable)
- **Output**: Console (stdout)
- **Format**: Timestamp, level, message
- **Production**: Integrate with CloudWatch, Papertrail, or Logtail

### Frontend Error Tracking
- **Recommendation**: Sentry for React
- **Features**: Error boundaries, source maps, user context

### Database Monitoring
- **PostgreSQL**: pg_stat_statements extension
- **Metrics**: Query performance, connection count
- **Tools**: pgAdmin, DataGrip, TablePlus

---

## Scalability Considerations

### Horizontal Scaling
- **Backend**: Multiple Uvicorn workers behind load balancer
- **Database**: Read replicas for read-heavy operations
- **Static Files**: CDN (CloudFront, Cloudflare)

### Vertical Scaling
- **Database**: Increase PostgreSQL resources (RAM, CPU)
- **Backend**: Increase server resources

### Caching Strategy
- **Redis**: Session data, frequently accessed data
- **CDN**: Static assets, images
- **Browser**: Cache-Control headers

---

## Future Enhancements

### Planned Features
- [ ] Real-time chat support (WebSockets)
- [ ] Email notifications (SendGrid, AWS SES)
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Loyalty program
- [ ] Mobile app (React Native / Flutter)
- [ ] AI-powered flight recommendations
- [ ] Dynamic pricing
- [ ] Seat map visualization
- [ ] In-flight services booking

### Technical Improvements
- [ ] GraphQL API (optional alternative to REST)
- [ ] Microservices architecture
- [ ] Event-driven architecture (Kafka, RabbitMQ)
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] Automated testing (pytest, Jest)
- [ ] API documentation (Swagger/OpenAPI auto-generated)
- [ ] Performance monitoring (APM)

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2024  
**Maintained By**: Development Team
