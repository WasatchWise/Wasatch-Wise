-- TDD Schema Migration: "Mario 1-1" Lead Magnet
-- Aligns database with Technical Design Document requirements
-- Run this AFTER base schema and DAROS schema

-- ============================================
-- 1. USER PROFILES (Auth Integration)
-- ============================================

-- Link Supabase Auth users to Clients (Multi-tenant)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'teacher', 'parent', 'student')),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast client lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_client ON user_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- 2. UNIFIED AUDITS TABLE (Lead Magnet)
-- ============================================

-- TDD: Single audits table for "Mario 1-1" quiz
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  submitted_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  answers JSONB NOT NULL, -- Flexible schema for quiz iterations
  score_compliance INT CHECK (score_compliance BETWEEN 0 AND 100),
  score_safety INT CHECK (score_safety BETWEEN 0 AND 100),
  score_fluency INT CHECK (score_fluency BETWEEN 0 AND 100),
  status TEXT DEFAULT 'pending_analysis' CHECK (status IN (
    'pending_analysis',
    'analyzing',
    'report_generated',
    'email_sent',
    'completed'
  )),
  ai_report_url TEXT, -- Link to generated PDF
  ai_analysis JSONB, -- Claude's JSON response
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audits_client ON audits(client_id);
CREATE INDEX IF NOT EXISTS idx_audits_submitted_by ON audits(submitted_by);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_created ON audits(created_at DESC);

-- ============================================
-- 3. AI LOGS (Compliance Trail)
-- ============================================

-- TDD: Every AI generation logged for liability protection
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  feature_used TEXT NOT NULL, -- 'quiz_generator', 'ask_dan', 'proposal_writer'
  prompt_snapshot TEXT, -- What we sent Claude
  response_snapshot TEXT, -- What Claude sent back (truncated if needed)
  model_version TEXT DEFAULT 'claude-3-5-sonnet',
  tokens_used INT,
  cost_usd DECIMAL(10,4),
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for compliance queries
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_feature ON ai_logs(feature_used);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_logs(created_at DESC);

-- ============================================
-- 4. CLIENTS TABLE UPDATES
-- ============================================

-- Add domain field for auto-grouping users
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS domain TEXT UNIQUE;

-- Add subscription tier
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' 
CHECK (subscription_tier IN ('free', 'audit', 'retainer'));

-- Index for domain lookups
CREATE INDEX IF NOT EXISTS idx_clients_domain ON clients(domain) WHERE domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(subscription_tier);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can only see audits from their client
CREATE POLICY "View own district audits"
ON audits
FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
  OR submitted_by = auth.uid()
);

-- Policy: Users can create audits for their client
CREATE POLICY "Create audits for own district"
ON audits
FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
  OR submitted_by = auth.uid()
);

-- Policy: Users can only see their own AI logs
CREATE POLICY "View own AI logs"
ON ai_logs
FOR SELECT
USING (user_id = auth.uid());

-- Policy: System can create AI logs (via service role)
CREATE POLICY "System can create AI logs"
ON ai_logs
FOR INSERT
WITH CHECK (true); -- Service role bypasses RLS

-- ============================================
-- 6. MIGRATION: Quiz Results → Audits
-- ============================================

-- Migrate existing quiz_results to audits table
-- Note: Run this AFTER creating audits table
INSERT INTO audits (
  answers,
  score_compliance,
  status,
  created_at
)
SELECT 
  answers,
  score as score_compliance,
  CASE 
    WHEN result_tier = 'green' THEN 'completed'
    WHEN result_tier = 'yellow' THEN 'report_generated'
    ELSE 'pending_analysis'
  END as status,
  created_at
FROM quiz_results
WHERE NOT EXISTS (
  SELECT 1 FROM audits WHERE audits.created_at = quiz_results.created_at
);

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function: Get client_id from user's email domain
CREATE OR REPLACE FUNCTION get_client_from_domain(user_email TEXT)
RETURNS UUID AS $$
DECLARE
  client_domain TEXT;
  client_uuid UUID;
BEGIN
  -- Extract domain from email
  client_domain := substring(user_email from '@(.+)$');
  
  -- Find client by domain
  SELECT id INTO client_uuid
  FROM clients
  WHERE domain = client_domain
  LIMIT 1;
  
  RETURN client_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at
BEFORE UPDATE ON audits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('user_profiles', 'audits', 'ai_logs')
-- ORDER BY table_name;

-- Check RLS enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('user_profiles', 'audits', 'ai_logs');

-- Check policies exist
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE tablename IN ('user_profiles', 'audits', 'ai_logs')
-- ORDER BY tablename, policyname;
