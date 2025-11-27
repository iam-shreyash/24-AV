-- Migration script to add document path columns to vendors table

-- Add certificate_of_incorporation_path column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendors' AND column_name = 'certificate_of_incorporation_path'
    ) THEN
        ALTER TABLE vendors ADD COLUMN certificate_of_incorporation_path VARCHAR(500);
    END IF;
END $$;

-- Add gst_certificate_path column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendors' AND column_name = 'gst_certificate_path'
    ) THEN
        ALTER TABLE vendors ADD COLUMN gst_certificate_path VARCHAR(500);
    END IF;
END $$;

-- Add owner_kyc_document_path column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendors' AND column_name = 'owner_kyc_document_path'
    ) THEN
        ALTER TABLE vendors ADD COLUMN owner_kyc_document_path VARCHAR(500);
    END IF;
END $$;

-- Add owner_kyc_address_proof_path column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendors' AND column_name = 'owner_kyc_address_proof_path'
    ) THEN
        ALTER TABLE vendors ADD COLUMN owner_kyc_address_proof_path VARCHAR(500);
    END IF;
END $$;

