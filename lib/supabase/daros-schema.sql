-- DAROS (District AI Readiness OS) Schema Extension
-- Extends base WasatchWise schema with consultation firm infrastructure

-- Districts table (extends clients concept)
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  size_band TEXT CHECK (size_band IN ('small', 'medium', 'large', 'mega')),
  contacts JSONB DEFAULT '{}'::jsonb, -- {superintendent: {...}, it_director: {...}, etc}
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artifacts table (all generated outputs)
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'stakeholder_matrix',
    'controls_checklist',
    'adoption_plan',
    'board_one_pager',
    'training_deck',
    'vendor_map',
    'risk_assessment',
    'policy_draft'
  )),
  title TEXT NOT NULL,
  url TEXT, -- Storage URL (Supabase Storage or external)
  content JSONB, -- Structured content for regeneration
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID -- User ID if auth is added
);

-- Controls table (privacy-by-design checklist items)
CREATE TABLE IF NOT EXISTS controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL CHECK (domain IN (
    'policy',
    'training',
    'vendor_management',
    'data_protection',
    'incident_response',
    'monitoring',
    'governance'
  )),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT, -- e.g., 'FERPA', 'COPPA', 'State Privacy Law'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- District Controls (implementation status)
CREATE TABLE IF NOT EXISTS district_controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'partial', 'complete', 'not_applicable')),
  evidence_url TEXT, -- Link to policy doc, screenshot, etc.
  owner_role TEXT, -- e.g., 'IT Director', 'Superintendent', 'Legal Counsel'
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, control_id)
);

-- Stakeholder Matrix (Bob's framework)
CREATE TABLE IF NOT EXISTS stakeholder_matrix (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  stakeholder TEXT NOT NULL CHECK (stakeholder IN ('admin', 'teachers', 'parents', 'students', 'board')),
  outcome_level TEXT NOT NULL CHECK (outcome_level IN ('home_run', 'triple', 'double', 'single', 'miss')),
  uptake_score INTEGER CHECK (uptake_score BETWEEN 0 AND 100),
  resistance_score INTEGER CHECK (resistance_score BETWEEN 0 AND 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, stakeholder)
);

-- Interventions (change management actions)
CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  stakeholder TEXT NOT NULL CHECK (stakeholder IN ('admin', 'teachers', 'parents', 'students', 'board', 'all')),
  type TEXT NOT NULL CHECK (type IN ('training', 'communication', 'policy', 'vendor_change', 'process', 'tool')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  owner_role TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors table (master list)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT, -- e.g., 'LMS', 'SIS', 'Assessment', 'AI Tool'
  website TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- District Vendors (usage mapping)
CREATE TABLE IF NOT EXISTS district_vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  contract_url TEXT,
  data_types TEXT[], -- e.g., ['student_pii', 'behavioral', 'location']
  ai_usage_level TEXT CHECK (ai_usage_level IN ('none', 'embedded', 'teacher_used', 'student_facing')),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, vendor_id)
);

-- Briefing Sessions (60-minute sessions)
CREATE TABLE IF NOT EXISTS briefing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  facilitator TEXT, -- Consultant name
  participants JSONB, -- [{name, role, email}]
  agenda_items JSONB DEFAULT '[]'::jsonb,
  outcomes JSONB DEFAULT '{}'::jsonb,
  artifacts_generated UUID[], -- Array of artifact IDs
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adoption Plans (30/60/90 day plans)
CREATE TABLE IF NOT EXISTS adoption_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  plan_type TEXT DEFAULT '30_60_90' CHECK (plan_type IN ('30_60_90', 'custom')),
  phases JSONB NOT NULL, -- [{days: 30, goals: [...], interventions: [...]}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artifacts_district ON artifacts(district_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
CREATE INDEX IF NOT EXISTS idx_district_controls_district ON district_controls(district_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_matrix_district ON stakeholder_matrix(district_id);
CREATE INDEX IF NOT EXISTS idx_interventions_district ON interventions(district_id);
CREATE INDEX IF NOT EXISTS idx_district_vendors_district ON district_vendors(district_id);
CREATE INDEX IF NOT EXISTS idx_briefing_sessions_district ON briefing_sessions(district_id);

-- Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_plans ENABLE ROW LEVEL SECURITY;

-- Seed default controls (privacy-by-design foundation)
INSERT INTO controls (domain, title, description, priority, category) VALUES
('policy', 'GenAI Use Policy for Staff', 'Board-approved policy governing staff use of generative AI tools', 'high', 'FERPA'),
('policy', 'Student Data Privacy Policy', 'Policy covering student PII handling in AI tools', 'critical', 'FERPA'),
('training', 'Admin AI Governance Training', '60-minute training for district leadership', 'high', 'Governance'),
('training', 'Teacher Practical AI Session', '45-minute hands-on training for educators', 'medium', 'Adoption'),
('vendor_management', 'Vendor AI Risk Assessment', 'Process for evaluating AI features in edtech tools', 'high', 'COPPA'),
('data_protection', 'Data Minimization Controls', 'Technical controls limiting data collection to necessary minimum', 'critical', 'Privacy by Design'),
('monitoring', 'AI Usage Inventory', 'Regular tracking of AI tools in use across district', 'medium', 'Governance'),
('incident_response', 'AI Incident Response Plan', 'Protocol for handling AI-related data incidents', 'high', 'FERPA')
ON CONFLICT DO NOTHING;
