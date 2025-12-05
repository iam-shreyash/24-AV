# 24-AV Database Design (PostgreSQL)

## Overview
This document provides a comprehensive overview of the 24-AV platform's PostgreSQL database schema. The system supports a multi-role aviation charter booking platform with passengers, vendors, and administrators.

---

## Database Schema Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ PK id           │
│    email        │◄──────────┐
│    password     │           │
│    full_name    │           │
│    role         │           │
│    is_active    │           │
│    created_at   │           │
│    updated_at   │           │
└────────┬────────┘           │
         │                    │
         │ 1:1                │
         ▼                    │
┌─────────────────┐           │
│    Vendors      │           │
├─────────────────┤           │
│ PK id           │           │
│ FK user_id      │───────────┘
│    company_name │
│    license_no   │
│    tax_id       │
│    contact_info │
│    bank_details │
│    approval_*   │
│    documents    │
│    total_earnings│
│    created_at   │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│     Planes      │
├─────────────────┤
│ PK id           │
│ FK vendor_id    │
│    model        │
│    registration │
│    seat_capacity│
│    amenities    │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│    Flights      │
├─────────────────┤
│ PK id           │
│ FK vendor_id    │
│ FK plane_id     │
│    origin       │
│    destination  │
│    departure_time│
│    arrival_time │
│    flight_type  │
│    base_price   │
│    is_full_charter│
│    created_at   │
└────────┬────────┘
         │ 1:N
         ├──────────────┐
         ▼              ▼
┌─────────────────┐  ┌─────────────────┐
│ SeatInventory   │  │    Bookings     │
├─────────────────┤  ├─────────────────┤
│ PK id           │  │ PK id           │
│ FK flight_id    │  │ FK flight_id    │
│    seat_number  │  │ FK passenger_id │
│    class_type   │  │ FK seat_id      │
│    price        │  │    total_amount │
│    is_available │  │    status       │
└─────────────────┘  │    booked_at    │
                     │    passenger_*  │
                     └────────┬────────┘
                              │ 1:1
                              ├──────────────┐
                              ▼              ▼
                     ┌─────────────────┐  ┌─────────────────┐
                     │    Payments     │  │    Reviews      │
                     ├─────────────────┤  ├─────────────────┤
                     │ PK id           │  │ PK id           │
                     │ FK booking_id   │  │ FK booking_id   │
                     │    provider     │  │    rating       │
                     │    provider_ref │  │    comment      │
                     │    amount       │  │    created_at   │
                     │    currency     │  └─────────────────┘
                     │    status       │
                     │    processed_at │
                     │    refund_ref   │
                     └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   AdminLogs     │  │VendorNotifications│ │ OtpVerification │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ PK id           │  │ PK id           │  │ PK id           │
│ FK admin_id     │  │ FK vendor_id    │  │    mobile_number│
│    action       │  │ FK booking_id   │  │    otp_code     │
│    meta         │  │    type         │  │    is_verified  │
│    created_at   │  │    message      │  │    expires_at   │
└─────────────────┘  │    is_read      │  │    created_at   │
                     │    created_at   │  │    verified_at  │
                     └─────────────────┘  └─────────────────┘

┌─────────────────┐
│    ApiKeys      │
├─────────────────┤
│ PK id           │
│    key_name     │
│    encrypted_val│
│    description  │
│    is_active    │
│ FK updated_by   │
│    created_at   │
│    updated_at   │
└─────────────────┘
```

---

## Entity Details

### 1. **Users** (`users`)
Core authentication and user management table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED | User email (login credential) |
| `hashed_password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `full_name` | VARCHAR(255) | NULL | User's full name |
| `role` | ENUM | NOT NULL | User role: `admin`, `vendor`, `passenger` |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Relationships:**
- 1:1 with `Vendors` (if role = vendor)
- 1:N with `Bookings` (as passenger)
- 1:N with `AdminLogs` (if role = admin)

**Indexes:**
- Primary Key: `id`
- Unique Index: `email`

---

### 2. **Vendors** (`vendors`)
Vendor profile and business information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique vendor identifier |
| `user_id` | INTEGER | FK → users.id, UNIQUE, CASCADE DELETE | Reference to user account |
| `company_name` | VARCHAR(255) | NOT NULL | Company/business name |
| `license_number` | VARCHAR(100) | NULL | Aviation license number |
| `business_registration_number` | VARCHAR(100) | NULL | Business registration ID |
| `tax_id` | VARCHAR(100) | NULL | Tax identification number |
| `contact_phone` | VARCHAR(20) | NULL | Primary contact phone |
| `business_address` | TEXT | NULL | Full business address |
| `city` | VARCHAR(100) | NULL | City |
| `state` | VARCHAR(100) | NULL | State/Province |
| `district` | VARCHAR(100) | NULL | District |
| `country` | VARCHAR(100) | NULL | Country |
| `zip_code` | VARCHAR(20) | NULL | Postal/ZIP code |
| `business_background` | VARCHAR(100) | NULL | Business category |
| `business_background_other` | VARCHAR(255) | NULL | Other business details |
| `owner_name` | VARCHAR(255) | NULL | Owner's full name |
| `phone` | VARCHAR(20) | NULL | Owner's phone |
| `website` | VARCHAR(255) | NULL | Company website URL |
| `years_in_business` | INTEGER | NULL | Years of operation |
| `number_of_aircraft` | INTEGER | NULL | Total aircraft owned |
| `description` | TEXT | NULL | Company description |
| `contact_person_name` | VARCHAR(255) | NULL | Contact person name |
| `contact_person_designation` | VARCHAR(100) | NULL | Contact person title |
| `contact_person_email` | VARCHAR(255) | NULL | Contact person email |
| `bank_account_number` | VARCHAR(50) | NULL | Bank account number |
| `bank_name` | VARCHAR(255) | NULL | Bank name |
| `bank_ifsc` | VARCHAR(20) | NULL | IFSC code (India) |
| `bank_branch` | VARCHAR(255) | NULL | Bank branch |
| `account_holder_name` | VARCHAR(255) | NULL | Account holder name |
| `certificate_of_incorporation_path` | VARCHAR(500) | NULL | Document file path |
| `gst_certificate_path` | VARCHAR(500) | NULL | GST certificate path |
| `owner_kyc_document_path` | VARCHAR(500) | NULL | KYC document path |
| `owner_kyc_address_proof_path` | VARCHAR(500) | NULL | Address proof path |
| `approval_status` | VARCHAR(50) | DEFAULT 'pending' | Status: `pending`, `approved`, `rejected` |
| `approval_notes` | TEXT | NULL | Admin approval notes |
| `approved_by` | INTEGER | FK → users.id, SET NULL | Admin who approved |
| `approved_at` | TIMESTAMP | NULL | Approval timestamp |
| `is_active` | BOOLEAN | DEFAULT TRUE | Vendor active status |
| `total_earnings` | NUMERIC(12,2) | DEFAULT 0 | Total revenue earned |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Registration timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Relationships:**
- N:1 with `Users` (user_id)
- 1:N with `Planes`
- 1:N with `Flights`
- 1:N with `VendorNotifications`

**Constraints:**
- UNIQUE: `user_id`
- Foreign Key: `user_id` → `users.id` (CASCADE DELETE)
- Foreign Key: `approved_by` → `users.id` (SET NULL)

---

### 3. **Planes** (`planes`)
Aircraft inventory managed by vendors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique plane identifier |
| `vendor_id` | INTEGER | FK → vendors.id, CASCADE DELETE | Owner vendor |
| `model` | VARCHAR(255) | NOT NULL | Aircraft model (e.g., "Cessna 172") |
| `registration_number` | VARCHAR(120) | NOT NULL | Aircraft registration/tail number |
| `seat_capacity` | INTEGER | NOT NULL | Total passenger seats |
| `amenities` | TEXT | NULL | JSON string with extended details:<br>- `aircraft_name`<br>- `manufacturer`<br>- `year_of_manufacture`<br>- `luggage_load_kg`<br>- `maximum_speed`<br>- `range_km`<br>- `wifi_available`<br>- `dining_service`<br>- `entertainment_system`<br>- `pet_onboard_allowed`<br>- `air_conditioning`<br>- `other_amenities`<br>- `aircraft_images` (array) |

**Relationships:**
- N:1 with `Vendors` (vendor_id)
- 1:N with `Flights`

**Constraints:**
- UNIQUE: (`vendor_id`, `registration_number`) - Prevents duplicate registration per vendor
- Foreign Key: `vendor_id` → `vendors.id` (CASCADE DELETE)

---

### 4. **Flights** (`flights`)
Flight schedules created by vendors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique flight identifier |
| `vendor_id` | INTEGER | FK → vendors.id, CASCADE DELETE | Flight operator |
| `plane_id` | INTEGER | FK → planes.id, CASCADE DELETE | Aircraft used |
| `origin` | VARCHAR(120) | NOT NULL | Departure airport/city |
| `destination` | VARCHAR(120) | NOT NULL | Arrival airport/city |
| `departure_time` | TIMESTAMP | NOT NULL | Departure date & time (UTC) |
| `arrival_time` | TIMESTAMP | NOT NULL | Arrival date & time (UTC) |
| `flight_type` | ENUM | DEFAULT 'charter' | Type: `charter`, `return_leg` |
| `base_price` | NUMERIC(10,2) | NOT NULL | Base price per seat/charter |
| `is_full_charter_only` | BOOLEAN | DEFAULT FALSE | If TRUE, only full charter bookings allowed |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Flight creation timestamp |

**Extended Fields (stored in application layer):**
- `flight_number` - Flight identifier (e.g., "AV-1234")
- `total_seats_available` - Override aircraft capacity
- `allowed_luggage_kg` - Luggage allowance per passenger
- `special_amenities` - Array of amenities
- `notes_for_passengers` - Special instructions

**Relationships:**
- N:1 with `Vendors` (vendor_id)
- N:1 with `Planes` (plane_id)
- 1:N with `SeatInventory`
- 1:N with `Bookings`

**Constraints:**
- Foreign Key: `vendor_id` → `vendors.id` (CASCADE DELETE)
- Foreign Key: `plane_id` → `planes.id` (CASCADE DELETE)
- Check: `arrival_time > departure_time`

---

### 5. **SeatInventory** (`seat_inventory`)
Individual seat availability for per-seat bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique seat identifier |
| `flight_id` | INTEGER | FK → flights.id, CASCADE DELETE | Associated flight |
| `seat_number` | VARCHAR(20) | NOT NULL | Seat number (e.g., "1A", "12") |
| `class_type` | VARCHAR(50) | DEFAULT 'standard' | Seat class (e.g., "standard", "premium") |
| `price` | NUMERIC(10,2) | NOT NULL | Price for this seat |
| `is_available` | BOOLEAN | DEFAULT TRUE | Availability status |

**Relationships:**
- N:1 with `Flights` (flight_id)
- 1:N with `Bookings` (optional, for per-seat bookings)

**Constraints:**
- UNIQUE: (`flight_id`, `seat_number`) - Prevents duplicate seat numbers per flight
- Foreign Key: `flight_id` → `flights.id` (CASCADE DELETE)

**Notes:**
- Only created for flights where `is_full_charter_only = FALSE`
- Automatically generated when flight is created

---

### 6. **Bookings** (`bookings`)
Passenger flight reservations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique booking identifier |
| `flight_id` | INTEGER | FK → flights.id, CASCADE DELETE | Booked flight |
| `passenger_id` | INTEGER | FK → users.id, CASCADE DELETE | User who made booking |
| `seat_id` | INTEGER | FK → seat_inventory.id, NULL | Specific seat (NULL for full charter) |
| `total_amount` | NUMERIC(10,2) | NOT NULL | Total booking cost |
| `status` | ENUM | DEFAULT 'pending' | Status: `pending`, `confirmed`, `cancelled`, `refunded` |
| `booked_at` | TIMESTAMP | DEFAULT NOW() | Booking creation timestamp |
| `is_full_charter` | BOOLEAN | DEFAULT FALSE | TRUE if entire aircraft chartered |
| `passenger_name` | VARCHAR(255) | NULL | Passenger name (override) |
| `passenger_email` | VARCHAR(255) | NULL | Passenger email (override) |
| `passenger_phone` | VARCHAR(20) | NULL | Passenger phone (override) |
| `emergency_contact_name` | VARCHAR(255) | NULL | Emergency contact name |
| `emergency_contact_phone` | VARCHAR(20) | NULL | Emergency contact phone |
| `special_requests` | TEXT | NULL | Special requests/notes |

**Relationships:**
- N:1 with `Flights` (flight_id)
- N:1 with `Users` (passenger_id)
- N:1 with `SeatInventory` (seat_id, optional)
- 1:1 with `Payments`
- 1:1 with `Reviews`
- 1:N with `VendorNotifications`

**Constraints:**
- Foreign Key: `flight_id` → `flights.id` (CASCADE DELETE)
- Foreign Key: `passenger_id` → `users.id` (CASCADE DELETE)
- Foreign Key: `seat_id` → `seat_inventory.id` (NULL allowed)

**Business Logic:**
- If `is_full_charter = TRUE`, `seat_id` should be NULL
- If `is_full_charter = FALSE`, `seat_id` should reference a valid seat

---

### 7. **Payments** (`payments`)
Payment transaction records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique payment identifier |
| `booking_id` | INTEGER | FK → bookings.id, UNIQUE, CASCADE DELETE | Associated booking |
| `provider` | ENUM | NOT NULL | Provider: `stripe`, `razorpay`, `paypal` |
| `provider_reference` | VARCHAR(255) | NOT NULL | Payment gateway transaction ID |
| `amount` | NUMERIC(10,2) | NOT NULL | Payment amount |
| `currency` | VARCHAR(10) | DEFAULT 'USD' | Currency code (USD, INR, etc.) |
| `status` | VARCHAR(50) | DEFAULT 'pending' | Status: `pending`, `completed`, `failed`, `refunded` |
| `processed_at` | TIMESTAMP | DEFAULT NOW() | Payment processing timestamp |
| `refund_reference` | VARCHAR(255) | NULL | Refund transaction ID (if refunded) |

**Relationships:**
- 1:1 with `Bookings` (booking_id)

**Constraints:**
- UNIQUE: `booking_id` - One payment per booking
- Foreign Key: `booking_id` → `bookings.id` (CASCADE DELETE)

---

### 8. **Reviews** (`reviews`)
Flight/service reviews by passengers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique review identifier |
| `booking_id` | INTEGER | FK → bookings.id, CASCADE DELETE | Reviewed booking |
| `rating` | INTEGER | NOT NULL, CHECK (1-5) | Rating: 1 to 5 stars |
| `comment` | TEXT | NULL | Review text/comments |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Review submission timestamp |

**Relationships:**
- N:1 with `Bookings` (booking_id)

**Constraints:**
- Foreign Key: `booking_id` → `bookings.id` (CASCADE DELETE)
- Check: `rating >= 1 AND rating <= 5`

---

### 9. **AdminLogs** (`admin_logs`)
Audit trail for admin actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique log identifier |
| `admin_id` | INTEGER | FK → users.id, SET NULL | Admin who performed action |
| `action` | VARCHAR(255) | NOT NULL | Action description (e.g., "approved_vendor") |
| `meta` | TEXT | NULL | Additional metadata (JSON) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Action timestamp |

**Relationships:**
- N:1 with `Users` (admin_id)

**Constraints:**
- Foreign Key: `admin_id` → `users.id` (SET NULL on delete)

**Common Actions:**
- `approved_vendor`
- `rejected_vendor`
- `deleted_flight`
- `refunded_booking`

---

### 10. **VendorNotifications** (`vendor_notifications`)
Real-time notifications for vendors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique notification identifier |
| `vendor_id` | INTEGER | FK → vendors.id, CASCADE DELETE | Recipient vendor |
| `booking_id` | INTEGER | FK → bookings.id, CASCADE DELETE | Related booking |
| `notification_type` | VARCHAR(50) | DEFAULT 'new_booking' | Type: `new_booking`, `cancellation`, etc. |
| `message` | TEXT | NULL | Notification message |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Notification timestamp |

**Relationships:**
- N:1 with `Vendors` (vendor_id)
- N:1 with `Bookings` (booking_id)

**Constraints:**
- Foreign Key: `vendor_id` → `vendors.id` (CASCADE DELETE)
- Foreign Key: `booking_id` → `bookings.id` (CASCADE DELETE)

---

### 11. **OtpVerification** (`otp_verifications`)
OTP-based mobile verification (optional feature).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique OTP record identifier |
| `mobile_number` | VARCHAR(20) | NOT NULL, INDEXED | Phone number |
| `otp_code` | VARCHAR(10) | NOT NULL | OTP code (6 digits typically) |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Verification status |
| `expires_at` | TIMESTAMP | NOT NULL, INDEXED | OTP expiration time |
| `created_at` | TIMESTAMP | DEFAULT NOW() | OTP generation timestamp |
| `verified_at` | TIMESTAMP | NULL | Verification timestamp |

**Indexes:**
- Index: `mobile_number`
- Index: `expires_at`

**Notes:**
- Modular feature - can be removed if not needed
- OTPs typically expire after 5-10 minutes

---

### 12. **ApiKeys** (`api_keys`)
Encrypted storage for third-party API credentials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique key identifier |
| `key_name` | VARCHAR(100) | UNIQUE, NOT NULL, INDEXED | Key identifier (e.g., "STRIPE_SECRET") |
| `encrypted_value` | TEXT | NOT NULL | AES-256 encrypted API key value |
| `description` | VARCHAR(255) | NULL | Key description/purpose |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `updated_by` | INTEGER | FK → users.id, SET NULL | Last admin who updated |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Relationships:**
- N:1 with `Users` (updated_by)

**Constraints:**
- UNIQUE: `key_name`
- Foreign Key: `updated_by` → `users.id` (SET NULL)

**Common Keys:**
- `STRIPE_SECRET_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `AVIATIONSTACK_API_KEY`
- `AMADEUS_API_KEY`
- `AMADEUS_API_SECRET`

---

## Enumerations

### UserRole
```sql
'admin' | 'vendor' | 'passenger'
```

### FlightType
```sql
'charter' | 'return_leg'
```

### BookingStatus
```sql
'pending' | 'confirmed' | 'cancelled' | 'refunded'
```

### PaymentProvider
```sql
'stripe' | 'razorpay' | 'paypal'
```

---

## Key Relationships Summary

1. **User → Vendor**: 1:1 (One user can be one vendor)
2. **Vendor → Planes**: 1:N (One vendor owns multiple aircraft)
3. **Vendor → Flights**: 1:N (One vendor creates multiple flights)
4. **Plane → Flights**: 1:N (One aircraft used for multiple flights)
5. **Flight → SeatInventory**: 1:N (One flight has multiple seats)
6. **Flight → Bookings**: 1:N (One flight has multiple bookings)
7. **User → Bookings**: 1:N (One passenger makes multiple bookings)
8. **Booking → Payment**: 1:1 (One booking has one payment)
9. **Booking → Review**: 1:1 (One booking can have one review)
10. **Vendor → VendorNotifications**: 1:N (One vendor receives multiple notifications)

---

## Indexes Strategy

### Primary Indexes
- All `id` columns are primary keys with auto-increment
- All foreign keys are automatically indexed

### Additional Indexes
- `users.email` - UNIQUE index for fast login lookups
- `otp_verifications.mobile_number` - For OTP verification queries
- `otp_verifications.expires_at` - For cleanup of expired OTPs
- `api_keys.key_name` - UNIQUE index for key retrieval

### Composite Indexes (via UNIQUE constraints)
- `planes(vendor_id, registration_number)` - Prevents duplicate registrations
- `seat_inventory(flight_id, seat_number)` - Prevents duplicate seats

---

## Data Integrity Rules

### Cascade Deletes
When a parent record is deleted, related child records are automatically deleted:
- Delete User → Delete Vendor, Bookings
- Delete Vendor → Delete Planes, Flights, Notifications
- Delete Plane → Delete Flights
- Delete Flight → Delete SeatInventory, Bookings
- Delete Booking → Delete Payment, Review, Notifications

### Set NULL
When a parent record is deleted, foreign key is set to NULL:
- Delete Admin User → AdminLogs.admin_id = NULL
- Delete Approver → Vendors.approved_by = NULL
- Delete Updater → ApiKeys.updated_by = NULL

---

## Business Logic Constraints

### Flight Creation
- `arrival_time` must be > `departure_time`
- If `is_full_charter_only = TRUE`, no seat inventory is created
- If `is_full_charter_only = FALSE`, seat inventory is auto-generated based on `plane.seat_capacity`

### Booking Validation
- If `is_full_charter = TRUE`, `seat_id` must be NULL
- If `is_full_charter = FALSE`, `seat_id` must reference a valid, available seat
- Cannot book a seat that's already booked (`is_available = FALSE`)
- Cannot delete a flight with confirmed bookings (vendor restriction, admin can override)

### Vendor Approval
- New vendors start with `approval_status = 'pending'`
- Only admins can change `approval_status` to `'approved'` or `'rejected'`
- Vendors cannot create flights until `approval_status = 'approved'`

### Payment Flow
1. Booking created with `status = 'pending'`
2. Payment initiated with `status = 'pending'`
3. On successful payment: `payment.status = 'completed'`, `booking.status = 'confirmed'`
4. On failed payment: `payment.status = 'failed'`, booking remains `'pending'`
5. On refund: `payment.status = 'refunded'`, `booking.status = 'refunded'`

### Review Constraints
- Rating must be between 1 and 5 (inclusive)
- Reviews can only be created for bookings with `status = 'confirmed'`

---

## Security Considerations

### Password Storage
- Passwords are hashed using **bcrypt** with salt rounds = 12
- Never store plaintext passwords
- Password reset requires email verification

### API Key Encryption
- All API keys stored in `api_keys` table are encrypted using **AES-256**
- Encryption key stored in environment variables (`.env`)
- Keys are decrypted only when needed in application memory

### JWT Tokens
- Access tokens expire after 30 minutes
- Refresh tokens expire after 7 days
- Tokens include: `user_id`, `role`, `exp` (expiration)

### Role-Based Access Control (RBAC)
- **Admin**: Full access to all resources
- **Vendor**: Access to own planes, flights, bookings, earnings
- **Passenger**: Access to own bookings, reviews

---

## Performance Optimization

### Query Optimization
- Use indexed columns in WHERE clauses
- Avoid N+1 queries using SQLAlchemy `joinedload()` or `selectinload()`
- Paginate large result sets (flights, bookings)

### Caching Strategy
- Cache frequently accessed data (flight search results, vendor details)
- Use Redis for session storage and caching
- Invalidate cache on data updates

### Database Maintenance
- Regular VACUUM ANALYZE on PostgreSQL
- Monitor slow queries using `pg_stat_statements`
- Archive old bookings/logs to separate tables

---

## Migration Strategy

### Initial Setup
```bash
# Create all tables
alembic upgrade head
```

### Adding New Columns
```bash
# Generate migration
alembic revision --autogenerate -m "Add new column"

# Apply migration
alembic upgrade head
```

### Rollback
```bash
# Rollback last migration
alembic downgrade -1
```

---

## Sample Queries

### Get All Available Flights
```sql
SELECT f.*, p.model, v.company_name
FROM flights f
JOIN planes p ON f.plane_id = p.id
JOIN vendors v ON f.vendor_id = v.id
WHERE f.departure_time >= NOW()
  AND EXISTS (
    SELECT 1 FROM seat_inventory si
    WHERE si.flight_id = f.id AND si.is_available = TRUE
  )
ORDER BY f.departure_time ASC;
```

### Get Vendor Earnings
```sql
SELECT v.id, v.company_name, SUM(b.total_amount) as total_earnings
FROM vendors v
JOIN flights f ON v.id = f.vendor_id
JOIN bookings b ON f.id = b.flight_id
WHERE b.status = 'confirmed'
GROUP BY v.id, v.company_name;
```

### Get Passenger Booking History
```sql
SELECT b.*, f.origin, f.destination, f.departure_time, p.status as payment_status
FROM bookings b
JOIN flights f ON b.flight_id = f.id
LEFT JOIN payments p ON b.id = p.booking_id
WHERE b.passenger_id = :user_id
ORDER BY b.booked_at DESC;
```

---

## Backup & Recovery

### Backup Strategy
```bash
# Full database backup
pg_dump -U postgres -d 24av_db > backup_$(date +%Y%m%d).sql

# Backup specific tables
pg_dump -U postgres -d 24av_db -t users -t vendors > critical_tables.sql
```

### Restore
```bash
# Restore from backup
psql -U postgres -d 24av_db < backup_20231205.sql
```

### Automated Backups
- Daily automated backups at 2 AM UTC
- Retain backups for 30 days
- Store backups in AWS S3 or similar cloud storage

---

## Conclusion

This database design supports a scalable, secure, and efficient aviation charter booking platform. The schema is normalized to 3NF, includes proper constraints and indexes, and follows PostgreSQL best practices.

**Key Features:**
✅ Multi-role support (Admin, Vendor, Passenger)  
✅ Complete booking lifecycle (search → book → pay → review)  
✅ Vendor management with approval workflow  
✅ Secure payment integration  
✅ Audit logging for admin actions  
✅ Extensible design for future features  

For questions or modifications, refer to the SQLAlchemy models in `backend/app/models.py`.
