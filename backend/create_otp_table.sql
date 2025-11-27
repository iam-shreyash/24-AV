-- Create OTP Verification Table
-- Run this SQL script in your PostgreSQL database to create the otp_verifications table

CREATE TABLE IF NOT EXISTS otp_verifications (
    id SERIAL PRIMARY KEY,
    mobile_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_otp_mobile_number ON otp_verifications(mobile_number);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);

-- Add comment
COMMENT ON TABLE otp_verifications IS 'Stores OTP codes for mobile number verification';

