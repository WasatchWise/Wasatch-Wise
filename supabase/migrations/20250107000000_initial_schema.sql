-- =====================================================
-- THE HELP LIST - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Privacy-First Mutual Aid Platform
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE privacy_level AS ENUM ('maximum', 'high', 'medium', 'low');
CREATE TYPE user_role AS ENUM ('requester', 'helper', 'both', 'sponsor', 'admin');
CREATE TYPE request_status AS ENUM ('draft', 'active', 'claimed', 'shopping', 'delivering', 'delivered', 'cancelled', 'expired');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected', 'expired');
CREATE TYPE urgency_level AS ENUM ('today', 'tomorrow', 'this_week', 'flexible');
CREATE TYPE contact_method AS ENUM ('text', 'email', 'in_app');
CREATE TYPE message_type AS ENUM ('text', 'system', 'location_reveal');

-- =====================================================
-- USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_seed TEXT,
  role user_role DEFAULT 'requester',
  verified_status verification_status DEFAULT 'unverified',

  -- Privacy settings (JSONB for flexibility)
  privacy_settings JSONB DEFAULT '{
    "anonymous_mode": true,
    "show_first_name": false,
    "share_stories": false,
    "allow_stats": true,
    "location_privacy": "high",
    "auto_delete_days": 30
  }'::jsonb,

  location_privacy privacy_level DEFAULT 'high',
  service_radius_meters INTEGER,
  member_since_month TEXT,
  total_requests_made INTEGER DEFAULT 0,
  total_helps_given INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Requester info (can be anonymous)
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_display_name TEXT NOT NULL,

  -- Request details
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {name, quantity, notes, category}
  item_count INTEGER GENERATED ALWAYS AS (jsonb_array_length(items)) STORED,
  dietary_restrictions TEXT[],
  budget_range JSONB, -- {min: number, max: number}
  urgency_level urgency_level DEFAULT 'flexible',

  -- Location (graduated disclosure)
  delivery_privacy privacy_level DEFAULT 'high',
  location_description TEXT,
  location_point GEOGRAPHY(POINT), -- For distance calculations
  distance_meters INTEGER, -- Calculated distance from helper

  -- Status
  status request_status DEFAULT 'draft',

  -- Helper info (if claimed)
  helper_id UUID REFERENCES users(id) ON DELETE SET NULL,
  helper_display_name TEXT,
  claimed_at TIMESTAMPTZ,

  -- Delivery tracking
  shopping_started_at TIMESTAMPTZ,
  delivery_started_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Financial (privacy-preserved)
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),

  -- Communication
  chat_room_id UUID,
  has_unread_messages BOOLEAN DEFAULT FALSE,

  -- Lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  auto_delete_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

  -- Privacy & consent
  share_story_consent BOOLEAN DEFAULT FALSE,

  -- Legacy/compatibility fields
  need TEXT, -- Simple text description
  city TEXT, -- Simple city name
  contact_info TEXT, -- Encrypted contact info
  contact_method contact_method
);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_display_name TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  encrypted_content TEXT, -- Client-side encrypted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- =====================================================
-- HELPER VERIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS helper_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  background_check_passed BOOLEAN,
  background_check_expires TIMESTAMPTZ,
  references_verified BOOLEAN DEFAULT FALSE,
  references_count INTEGER DEFAULT 0,
  training_completed TEXT[] DEFAULT '{}',
  onboarding_completed_at TIMESTAMPTZ,
  verification_status verification_status DEFAULT 'unverified',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- SUCCESS STORIES TABLE (Anonymized)
-- =====================================================

CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  story TEXT NOT NULL,
  month_year TEXT NOT NULL, -- "2024-11"
  general_area TEXT,
  helper_pseudonym TEXT NOT NULL,
  requester_pseudonym TEXT NOT NULL,
  hearts INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AGGREGATED ANALYTICS TABLE (Privacy-preserving)
-- =====================================================

CREATE TABLE IF NOT EXISTS aggregated_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  area_name TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  total_helpers_active INTEGER DEFAULT 0,
  total_requesters_served INTEGER DEFAULT 0,
  avg_response_time_hours DECIMAL(10, 2),
  avg_delivery_time_hours DECIMAL(10, 2),
  fulfillment_rate DECIMAL(5, 2),
  top_requested_items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_type, period_start, area_name)
);

-- =====================================================
-- PRIVACY CONSENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS privacy_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  granted BOOLEAN DEFAULT FALSE,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Requests indexes
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_urgency ON requests(urgency_level);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_helper_id ON requests(helper_id);
CREATE INDEX idx_requests_requester_id ON requests(requester_id);
CREATE INDEX idx_requests_expires_at ON requests(expires_at);
CREATE INDEX idx_requests_location ON requests USING GIST(location_point);

-- Messages indexes
CREATE INDEX idx_messages_request_id ON messages(request_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Users indexes
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE helper_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- ===== USERS POLICIES =====

-- Anyone can read public user info (filtered by safe columns)
CREATE POLICY "Public user profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users can insert their own profile (authenticated)
CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

-- ===== REQUESTS POLICIES =====

-- Anyone can view active requests (privacy-filtered)
CREATE POLICY "Active requests are publicly viewable"
  ON requests FOR SELECT
  USING (status = 'active' OR status = 'claimed' OR status = 'shopping' OR status = 'delivering');

-- Authenticated users can view their own requests
CREATE POLICY "Users can view their own requests"
  ON requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = helper_id);

-- Anyone can create a request (even anonymous via anon key)
CREATE POLICY "Anyone can create requests"
  ON requests FOR INSERT
  WITH CHECK (true);

-- Users can update their own requests
CREATE POLICY "Requesters can update their requests"
  ON requests FOR UPDATE
  USING (auth.uid() = requester_id);

-- Helpers can update requests they claimed
CREATE POLICY "Helpers can update claimed requests"
  ON requests FOR UPDATE
  USING (auth.uid() = helper_id);

-- ===== MESSAGES POLICIES =====

-- Users can view messages for their requests
CREATE POLICY "Users can view their request messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = messages.request_id
      AND (requests.requester_id = auth.uid() OR requests.helper_id = auth.uid())
    )
  );

-- Users can send messages for their requests
CREATE POLICY "Users can send messages for their requests"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = messages.request_id
      AND (requests.requester_id = auth.uid() OR requests.helper_id = auth.uid())
    )
  );

-- ===== SUCCESS STORIES POLICIES =====

-- Published stories are publicly viewable
CREATE POLICY "Published stories are viewable by everyone"
  ON success_stories FOR SELECT
  USING (published = true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-delete expired requests
CREATE OR REPLACE FUNCTION delete_expired_requests()
RETURNS void AS $$
BEGIN
  DELETE FROM requests WHERE auto_delete_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert a test request (can be run manually)
-- INSERT INTO requests (requester_display_name, need, city, items, urgency_level, delivery_privacy, location_description, status)
-- VALUES (
--   'KindNeighbor42',
--   'Groceries for a family of 4',
--   'Longmont',
--   '[{"name": "Milk", "quantity": 1, "notes": "1 gallon"}, {"name": "Bread", "quantity": 2, "notes": "Whole wheat"}]'::jsonb,
--   'today',
--   'high',
--   'North Longmont area',
--   'active'
-- );
