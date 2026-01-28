-- Initial Database Schema for PipelineIQ
-- Run this FIRST before the premium features migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  size_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user', -- user, admin, owner
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. High Priority Projects Table
CREATE TABLE IF NOT EXISTS high_priority_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Project Details
  project_name TEXT NOT NULL,
  project_type TEXT[] DEFAULT '{}',
  project_stage TEXT,
  project_value BIGINT,
  units_count INTEGER,
  square_footage INTEGER,

  -- Location
  city TEXT,
  state TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Timeline
  estimated_start_date DATE,
  estimated_completion_date DATE,

  -- Key Players
  developer_name TEXT,
  architect_name TEXT,
  general_contractor TEXT,

  -- Scoring & Status
  groove_fit_score INTEGER DEFAULT 0,
  priority_level TEXT DEFAULT 'cold', -- hot, warm, cold
  outreach_status TEXT DEFAULT 'new', -- new, contacted, engaged, qualified, closed, lost

  -- Enrichment Data
  raw_data JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_type TEXT, -- developer, architect, contractor, owner
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  employee_count INTEGER,
  annual_revenue BIGINT,
  specialties TEXT[],
  portfolio_size INTEGER,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

  -- Contact Info
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  title TEXT,

  -- Classification
  role_category TEXT, -- decision_maker, influencer, gatekeeper, user
  decision_level TEXT, -- executive, director, manager, individual

  -- Engagement
  contact_count INTEGER DEFAULT 0,
  last_contact_date TIMESTAMPTZ,
  response_status TEXT DEFAULT 'not_contacted', -- not_contacted, no_response, responded, engaged, qualified

  -- Data
  linkedin_url TEXT,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Project Stakeholders (Many-to-Many)
CREATE TABLE IF NOT EXISTS project_stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES high_priority_projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  role_in_project TEXT, -- owner, developer, architect, contractor, consultant
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, contact_id)
);

-- 7. Outreach Campaigns Table
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'email', -- email, video, call, linkedin
  status TEXT DEFAULT 'draft', -- draft, scheduled, active, completed, paused
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  created_by TEXT,
  scheduled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Outreach Activities Table
CREATE TABLE IF NOT EXISTS outreach_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE SET NULL,
  project_id UUID REFERENCES high_priority_projects(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  activity_type TEXT NOT NULL, -- email, call, meeting, video, linkedin
  subject TEXT,
  message_body TEXT,
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, replied, bounced

  -- Email Tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,

  -- Video Tracking
  video_id TEXT,
  video_url TEXT,
  video_viewed BOOLEAN DEFAULT false,
  video_watch_time INTEGER, -- seconds

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Scrape Logs Table
CREATE TABLE IF NOT EXISTS scrape_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- construction_wire, dodge, buildzoom, etc
  projects_found INTEGER DEFAULT 0,
  projects_inserted INTEGER DEFAULT 0,
  projects_updated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running', -- running, success, partial_success, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Pipeline Metrics Table
CREATE TABLE IF NOT EXISTS pipeline_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metric_date DATE DEFAULT CURRENT_DATE,

  -- Pipeline Metrics
  total_projects INTEGER DEFAULT 0,
  hot_leads INTEGER DEFAULT 0,
  warm_leads INTEGER DEFAULT 0,
  cold_leads INTEGER DEFAULT 0,
  total_pipeline_value BIGINT DEFAULT 0,

  -- Outreach Metrics
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,
  videos_sent INTEGER DEFAULT 0,
  videos_viewed INTEGER DEFAULT 0,

  -- Conversion Metrics
  meetings_booked INTEGER DEFAULT 0,
  proposals_sent INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  revenue_generated BIGINT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_projects_org ON high_priority_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_score ON high_priority_projects(groove_fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON high_priority_projects(outreach_status);
CREATE INDEX IF NOT EXISTS idx_projects_location ON high_priority_projects(state, city);

CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

CREATE INDEX IF NOT EXISTS idx_companies_org ON companies(organization_id);

CREATE INDEX IF NOT EXISTS idx_activities_campaign ON outreach_activities(campaign_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON outreach_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON outreach_activities(created_at DESC);

-- Insert Groove Technologies Organization
INSERT INTO organizations (id, name, domain, industry, size_range) VALUES
('34249404-774f-4b80-b346-a2d9e6322584', 'Groove Technologies', 'getgrooven.com', 'Construction Technology', '10-50')
ON CONFLICT (id) DO NOTHING;

-- Insert Mike Sartain User
INSERT INTO users (email, full_name, organization_id, role) VALUES
('msartain@getgrooven.com', 'Mike Sartain', '34249404-774f-4b80-b346-a2d9e6322584', 'owner')
ON CONFLICT (email) DO NOTHING;

-- Add sample project (Marriott)
INSERT INTO high_priority_projects (
  organization_id,
  project_name,
  project_type,
  project_stage,
  project_value,
  units_count,
  city,
  state,
  groove_fit_score,
  priority_level,
  outreach_status
) VALUES (
  '34249404-774f-4b80-b346-a2d9e6322584',
  'Marriott Hotel & Conference Center',
  ARRAY['hotel'],
  'pre-construction',
  125000000,
  300,
  'Austin',
  'TX',
  85,
  'hot',
  'new'
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE high_priority_projects IS 'Construction projects qualified for Groove outreach';
COMMENT ON TABLE contacts IS 'Decision makers and influencers at construction companies';
COMMENT ON TABLE outreach_campaigns IS 'Marketing and sales campaigns targeting projects';
