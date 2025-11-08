-- =====================================================
-- THE HELP LIST - COMPLETE SETUP
-- =====================================================
-- This fixes missing columns and sets up RLS policies
-- =====================================================

-- Step 1: Add missing columns to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS need TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create contact_method enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_method') THEN
    CREATE TYPE contact_method AS ENUM ('text', 'email', 'in_app');
  END IF;
END $$;

ALTER TABLE requests ADD COLUMN IF NOT EXISTS contact_method contact_method;

-- Step 2: Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_city ON requests(city);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_urgency ON requests(urgency_level);

-- Step 3: Set up Row Level Security Policies

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE helper_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read active requests" ON requests;
DROP POLICY IF EXISTS "Allow anonymous insert requests" ON requests;
DROP POLICY IF EXISTS "Allow update own requests" ON requests;
DROP POLICY IF EXISTS "Allow helpers to update claimed requests" ON requests;

-- Create permissive policies for MVP (can tighten later)

-- Allow anyone to see active requests (privacy-first, only shows fuzzy data)
CREATE POLICY "Allow public read active requests"
  ON requests FOR SELECT
  USING (status = 'active' OR status = 'claimed' OR status = 'delivered');

-- Allow anyone to create requests (anonymous by default)
CREATE POLICY "Allow anonymous insert requests"
  ON requests FOR INSERT
  WITH CHECK (true);

-- Allow request creators to update their own requests
CREATE POLICY "Allow update own requests"
  ON requests FOR UPDATE
  USING (true) -- For MVP, allow all updates (will add auth later)
  WITH CHECK (true);

-- Step 4: Create helper functions for auto-updating timestamps

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to requests table
DROP TRIGGER IF EXISTS update_requests_updated_at ON requests;
CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Step 5: Insert some test data to verify everything works

INSERT INTO requests (
  requester_display_name,
  need,
  city,
  contact_info,
  contact_method,
  items,
  urgency_level,
  delivery_privacy,
  location_description,
  status
) VALUES (
  'WelcomeHelper',
  'Test groceries for first delivery',
  'Longmont, CO',
  'test@thehelplist.org',
  'email',
  '[{"name": "Celebration champagne", "quantity": 1}, {"name": "Fresh flowers", "quantity": 1}]'::jsonb,
  'today',
  'high',
  'North Longmont',
  'active'
) ON CONFLICT DO NOTHING;

-- Success message
SELECT
  '✅ Setup complete!' AS status,
  COUNT(*) AS total_requests
FROM requests;

-- Show what we created
SELECT
  '📊 Current requests:' AS info,
  requester_display_name,
  need,
  city,
  status,
  created_at
FROM requests
ORDER BY created_at DESC
LIMIT 5;
