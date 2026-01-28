-- Migration 002: Align schema with application types
-- This migration updates the schema to match types/database.types.ts

-- Drop old tables/views if they exist (clean slate)
DROP TABLE IF EXISTS project_stakeholders CASCADE;
DROP TABLE IF EXISTS outreach_activities CASCADE;
DROP TABLE IF EXISTS outreach_campaigns CASCADE;
DROP TABLE IF EXISTS scrape_logs CASCADE;
DROP VIEW IF EXISTS pipeline_metrics CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP VIEW IF EXISTS high_priority_projects CASCADE;

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cw_company_id TEXT,
  company_name TEXT NOT NULL,
  company_type TEXT,
  website TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  revenue_range TEXT,
  employee_count_range TEXT,
  is_target_customer BOOLEAN DEFAULT false,
  customer_tier TEXT,
  annual_project_volume BIGINT,
  last_contacted TIMESTAMPTZ,
  relationship_status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cw_contact_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  role_category TEXT,
  decision_level TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  linkedin_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  last_contacted TIMESTAMPTZ,
  contact_count INTEGER DEFAULT 0,
  response_status TEXT DEFAULT 'not_contacted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create high_priority_projects table (matches TypeScript types)
CREATE TABLE high_priority_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_to TEXT,
  cw_project_id TEXT UNIQUE NOT NULL,

  -- Project details
  project_name TEXT NOT NULL,
  project_type TEXT[] DEFAULT '{}',
  project_stage TEXT,
  project_value BIGINT,
  project_size_sqft BIGINT,
  units_count INTEGER,

  -- Location
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT,
  county TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Timeline
  estimated_start_date DATE,
  estimated_completion_date DATE,
  bid_date DATE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  -- Services and decision factors
  services_needed TEXT[] DEFAULT '{}',
  decision_timeline TEXT,
  competitor_mentioned TEXT,

  -- Scoring (multi-dimensional)
  groove_fit_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  timing_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,

  -- Status
  priority_level TEXT DEFAULT 'cold',
  outreach_status TEXT DEFAULT 'new',

  -- Metadata
  data_source TEXT DEFAULT 'construction_wire',
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}',
  notes TEXT,

  -- Aggregated data
  decision_makers INTEGER DEFAULT 0,
  companies JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_stakeholders table
CREATE TABLE project_stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES high_priority_projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  role_in_project TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, contact_id)
);

-- Create outreach_campaigns table
CREATE TABLE outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'email',
  target_project_types TEXT[],
  target_project_stages TEXT[],
  target_states TEXT[],
  email_template_id TEXT,
  total_recipients INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  scheduled_date TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create outreach_activities table
CREATE TABLE outreach_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE SET NULL,
  project_id UUID REFERENCES high_priority_projects(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  user_id UUID,
  activity_type TEXT NOT NULL,
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  email_message_id TEXT,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  response_text TEXT,
  sentiment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_projects_org CASCADE;
DROP INDEX IF EXISTS idx_projects_cw_id CASCADE;
DROP INDEX IF EXISTS idx_projects_score CASCADE;
DROP INDEX IF EXISTS idx_projects_total_score CASCADE;
DROP INDEX IF EXISTS idx_projects_status CASCADE;
DROP INDEX IF EXISTS idx_projects_location CASCADE;
DROP INDEX IF EXISTS idx_contacts_org CASCADE;
DROP INDEX IF EXISTS idx_contacts_email CASCADE;
DROP INDEX IF EXISTS idx_companies_org CASCADE;
DROP INDEX IF EXISTS idx_activities_campaign CASCADE;
DROP INDEX IF EXISTS idx_activities_contact CASCADE;
DROP INDEX IF EXISTS idx_activities_project CASCADE;

-- Create indexes for performance
CREATE INDEX idx_projects_org ON high_priority_projects(organization_id);
CREATE INDEX idx_projects_cw_id ON high_priority_projects(cw_project_id);
CREATE INDEX idx_projects_score ON high_priority_projects(groove_fit_score DESC);
CREATE INDEX idx_projects_total_score ON high_priority_projects(total_score DESC);
CREATE INDEX idx_projects_status ON high_priority_projects(outreach_status);
CREATE INDEX idx_projects_location ON high_priority_projects(state, city);

CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);

CREATE INDEX idx_companies_org ON companies(organization_id);

CREATE INDEX idx_activities_campaign ON outreach_activities(campaign_id);
CREATE INDEX idx_activities_contact ON outreach_activities(contact_id);
CREATE INDEX idx_activities_project ON outreach_activities(project_id);

-- Create pipeline_metrics view
CREATE OR REPLACE VIEW pipeline_metrics AS
SELECT
  organization_id,
  project_stage,
  COUNT(*) as project_count,
  SUM(project_value) as total_value,
  AVG(groove_fit_score) as avg_score,
  AVG(total_score) as avg_total_score
FROM high_priority_projects
GROUP BY organization_id, project_stage;

-- Insert sample Marriott project for testing
INSERT INTO high_priority_projects (
  organization_id,
  cw_project_id,
  project_name,
  project_type,
  project_stage,
  project_value,
  units_count,
  project_size_sqft,
  city,
  state,
  address,
  groove_fit_score,
  engagement_score,
  timing_score,
  total_score,
  priority_level,
  outreach_status,
  services_needed,
  data_source
) VALUES (
  '34249404-774f-4b80-b346-a2d9e6322584',
  'CW-2025-MARRIOTT-SLC-001',
  'Marriott Hotel Downtown Salt Lake City',
  ARRAY['hotel'],
  'pre-construction',
  8500000,
  150,
  75000,
  'Salt Lake City',
  'UT',
  '123 Main Street, Salt Lake City, UT 84101',
  95,
  90,
  85,
  270,
  'hot',
  'new',
  ARRAY['wifi', 'directv', 'phone_systems', 'structured_cabling', 'access_control'],
  'construction_wire'
) ON CONFLICT (cw_project_id) DO NOTHING;

COMMENT ON TABLE high_priority_projects IS 'Construction projects qualified for outreach';
COMMENT ON TABLE contacts IS 'Decision makers and influencers';
COMMENT ON TABLE companies IS 'Companies involved in construction projects';
COMMENT ON TABLE outreach_campaigns IS 'Email and outreach campaigns';
