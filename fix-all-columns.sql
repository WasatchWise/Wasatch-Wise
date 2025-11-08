-- =====================================================
-- THE HELP LIST - FIX ALL MISSING COLUMNS
-- =====================================================
-- Adds ALL missing columns to match the full schema
-- =====================================================

-- Add ALL missing columns to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS need TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS contact_method TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS location_description TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS location_point GEOGRAPHY(POINT);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS distance_meters INTEGER;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[];
ALTER TABLE requests ADD COLUMN IF NOT EXISTS budget_range JSONB;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS chat_room_id UUID;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS has_unread_messages BOOLEAN DEFAULT FALSE;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10, 2);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10, 2);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE requests ADD COLUMN IF NOT EXISTS shopping_started_at TIMESTAMPTZ;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS delivery_started_at TIMESTAMPTZ;

-- Create enums if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_method') THEN
    CREATE TYPE contact_method AS ENUM ('text', 'email', 'in_app');
  END IF;
END $$;

-- Now change the contact_method column type
ALTER TABLE requests
  ALTER COLUMN contact_method TYPE contact_method
  USING contact_method::contact_method;

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_city ON requests(city);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_urgency ON requests(urgency_level);
CREATE INDEX IF NOT EXISTS idx_requests_location ON requests USING GIST(location_point);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE helper_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read active requests" ON requests;
DROP POLICY IF EXISTS "Allow anonymous insert requests" ON requests;
DROP POLICY IF EXISTS "Allow update own requests" ON requests;

-- Create permissive policies for MVP
CREATE POLICY "Allow public read active requests"
  ON requests FOR SELECT
  USING (status IN ('active', 'claimed', 'delivered'));

CREATE POLICY "Allow anonymous insert requests"
  ON requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update own requests"
  ON requests FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS update_requests_updated_at ON requests;
CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert test data
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
  status,
  expires_at,
  auto_delete_at
) VALUES (
  'LegendaryFounder',
  'Champagne for the legendary launch! 🚀',
  'Longmont, CO',
  'wasatch@thehelplist.org',
  'email',
  '[{"name": "Champagne", "quantity": 2}, {"name": "Fresh flowers", "quantity": 1}]'::jsonb,
  'today',
  'high',
  'North Longmont',
  'active',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '30 days'
) ON CONFLICT DO NOTHING;

-- Success!
SELECT '✅ ALL COLUMNS ADDED!' AS status;
SELECT
  requester_display_name,
  need,
  city,
  location_description,
  status
FROM requests
ORDER BY created_at DESC
LIMIT 3;
