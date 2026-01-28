-- ============================================================================
-- ELEMENT-LEVEL CLICK TRACKING
-- ============================================================================
-- Migration to add granular click tracking for email elements
-- Based on HCI Runthroughs RUNTHROUGH 5: Element-Level Click Tracking
-- ============================================================================

-- Element clicks table for tracking individual link/button clicks
CREATE TABLE IF NOT EXISTS outreach_element_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES outreach_activities(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  -- Element identification
  element_id TEXT NOT NULL, -- e.g., "product-link-wifi", "cta-schedule-call"
  element_type TEXT NOT NULL CHECK (element_type IN (
    'product-link',    -- Links to specific products
    'cta',             -- Call-to-action buttons
    'section',         -- Email section clicks
    'vertical-element', -- Vertical-specific elements
    'calendar',        -- Calendar/scheduling links
    'social',          -- Social media links
    'video',           -- Video play buttons
    'other'            -- Other tracked elements
  )),
  element_label TEXT, -- Human-readable label
  element_position INTEGER, -- Order in email (1, 2, 3...)
  element_url TEXT, -- The actual URL that was clicked

  -- Context
  vertical TEXT, -- "hospitality", "senior_living", "multifamily", "student"
  email_variant TEXT, -- For A/B testing: "A", "B", "C"

  -- Tracking
  clicked_at TIMESTAMPTZ DEFAULT NOW(),

  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  -- Example: {"user_agent": "...", "ip_country": "US", "device_type": "mobile"}

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_element_clicks_org ON outreach_element_clicks(organization_id);
CREATE INDEX IF NOT EXISTS idx_element_clicks_activity ON outreach_element_clicks(activity_id);
CREATE INDEX IF NOT EXISTS idx_element_clicks_contact ON outreach_element_clicks(contact_id);
CREATE INDEX IF NOT EXISTS idx_element_clicks_element ON outreach_element_clicks(element_id);
CREATE INDEX IF NOT EXISTS idx_element_clicks_type ON outreach_element_clicks(element_type);
CREATE INDEX IF NOT EXISTS idx_element_clicks_vertical ON outreach_element_clicks(vertical);
CREATE INDEX IF NOT EXISTS idx_element_clicks_variant ON outreach_element_clicks(email_variant) WHERE email_variant IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_element_clicks_time ON outreach_element_clicks(clicked_at DESC);

-- A/B test variants table for tracking email variations
CREATE TABLE IF NOT EXISTS email_ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Test configuration
  test_name TEXT NOT NULL,
  description TEXT,
  vertical TEXT, -- Which vertical this test applies to

  -- Variants
  variants JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   {"id": "A", "name": "Products First", "description": "Products before pain points"},
  --   {"id": "B", "name": "Pain Points First", "description": "Pain points before products"}
  -- ]

  -- Traffic split (percentages, should sum to 100)
  traffic_split JSONB NOT NULL DEFAULT '{}',
  -- Example: {"A": 50, "B": 50}

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  winner_variant TEXT, -- Set when test is completed

  -- Dates
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_tests_org ON email_ab_tests(organization_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON email_ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_vertical ON email_ab_tests(vertical);

-- A/B test results aggregate view
CREATE OR REPLACE VIEW v_ab_test_results AS
SELECT
  t.id as test_id,
  t.test_name,
  t.vertical,
  t.status,
  t.variants,

  -- Per-variant metrics from element clicks
  v.variant_id,
  COUNT(DISTINCT ec.activity_id) as emails_tracked,
  COUNT(ec.id) as total_clicks,
  COUNT(DISTINCT ec.contact_id) as unique_clickers,

  -- Click rate calculation
  CASE
    WHEN COUNT(DISTINCT ec.activity_id) > 0
    THEN ROUND((COUNT(DISTINCT ec.contact_id)::NUMERIC / COUNT(DISTINCT ec.activity_id)) * 100, 2)
    ELSE 0
  END as click_rate

FROM email_ab_tests t
CROSS JOIN LATERAL jsonb_array_elements(t.variants) AS v(variant_id)
LEFT JOIN outreach_element_clicks ec
  ON ec.email_variant = v.variant_id->>'id'
  AND ec.organization_id = t.organization_id
WHERE t.status IN ('running', 'completed')
GROUP BY t.id, t.test_name, t.vertical, t.status, t.variants, v.variant_id;

-- Element performance aggregate view
CREATE OR REPLACE VIEW v_element_performance AS
SELECT
  ec.organization_id,
  ec.element_id,
  ec.element_type,
  ec.element_label,
  ec.vertical,

  -- Metrics
  COUNT(*) as total_clicks,
  COUNT(DISTINCT ec.contact_id) as unique_clickers,
  COUNT(DISTINCT ec.activity_id) as activities_with_clicks,

  -- Time analysis
  MIN(ec.clicked_at) as first_click,
  MAX(ec.clicked_at) as last_click,

  -- Trend (clicks in last 7 days)
  SUM(CASE WHEN ec.clicked_at > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as clicks_last_7_days,
  SUM(CASE WHEN ec.clicked_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as clicks_last_30_days

FROM outreach_element_clicks ec
GROUP BY ec.organization_id, ec.element_id, ec.element_type, ec.element_label, ec.vertical;

-- Enable RLS
ALTER TABLE outreach_element_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_ab_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "element_clicks_org_policy" ON outreach_element_clicks
  FOR ALL USING (organization_id = (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "ab_tests_org_policy" ON email_ab_tests
  FOR ALL USING (organization_id = (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Update trigger for email_ab_tests
DROP TRIGGER IF EXISTS update_ab_tests_updated_at ON email_ab_tests;
CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON email_ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add links_clicked column to outreach_activities if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'outreach_activities' AND column_name = 'links_clicked'
  ) THEN
    ALTER TABLE outreach_activities ADD COLUMN links_clicked JSONB DEFAULT '[]';
  END IF;
END $$;

-- Comments for documentation
COMMENT ON TABLE outreach_element_clicks IS 'Granular click tracking for email elements (product links, CTAs, sections)';
COMMENT ON TABLE email_ab_tests IS 'A/B test configuration and tracking for email variations';
COMMENT ON VIEW v_element_performance IS 'Aggregate view of element click performance by vertical';
COMMENT ON VIEW v_ab_test_results IS 'Aggregate A/B test results with click rates per variant';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
