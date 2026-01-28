-- Migration 013: Add missing columns and tables
-- Fixes: outreach_activities.opened_at and scrape_logs table

-- ============================================
-- 1. Add opened_at to outreach_activities
-- ============================================

ALTER TABLE outreach_activities
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS message_body TEXT,
  ADD COLUMN IF NOT EXISTS video_viewed BOOLEAN DEFAULT false;

-- Index for querying opened emails
CREATE INDEX IF NOT EXISTS idx_activities_opened ON outreach_activities(opened_at DESC) WHERE opened_at IS NOT NULL;

-- ============================================
-- 2. Create scrape_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS scrape_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'construction_wire',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'partial_success', 'failed')),
  projects_found INTEGER DEFAULT 0,
  projects_inserted INTEGER DEFAULT 0,
  projects_updated INTEGER DEFAULT 0,
  error_message TEXT,
  duration_seconds DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for recent scrapes
CREATE INDEX IF NOT EXISTS idx_scrape_logs_recent ON scrape_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_source ON scrape_logs(source, status);

-- ============================================
-- 3. RLS for scrape_logs
-- ============================================

ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access to scrape_logs" ON scrape_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow users to view their org's scrape logs
CREATE POLICY "Users can view own org scrape logs" ON scrape_logs
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
    OR
    organization_id = (SELECT (current_setting('request.jwt.claims', true)::json->>'organization_id')::uuid)
  );
