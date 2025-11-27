-- Migration script to add passenger details fields to bookings table
-- Run this directly in your PostgreSQL database (using pgAdmin, psql, or any SQL client)

-- Check if columns already exist (optional - you can skip this check)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('passenger_name', 'passenger_email', 'passenger_phone');

-- Add new columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS passenger_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS passenger_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS passenger_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- Verify the columns were added
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('passenger_name', 'passenger_email', 'passenger_phone', 'emergency_contact_name', 'emergency_contact_phone', 'special_requests')
ORDER BY column_name;

