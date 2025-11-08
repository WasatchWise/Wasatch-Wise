-- Add missing columns to requests table for app compatibility

-- Add legacy/compatibility columns if they don't exist
ALTER TABLE requests
ADD COLUMN IF NOT EXISTS need TEXT;

ALTER TABLE requests
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE requests
ADD COLUMN IF NOT EXISTS contact_info TEXT;

-- Create contact_method type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_method') THEN
    CREATE TYPE contact_method AS ENUM ('text', 'email', 'in_app');
  END IF;
END $$;

ALTER TABLE requests
ADD COLUMN IF NOT EXISTS contact_method contact_method;

-- Add any other missing columns
ALTER TABLE requests
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_city ON requests(city);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);

-- Success message
SELECT 'Migration complete! All missing columns added.' AS status;
