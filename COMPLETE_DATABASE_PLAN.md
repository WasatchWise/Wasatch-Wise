# Complete Database Analysis & Implementation Plan

## Current State Analysis

### Database Connection
- **Your Project:** `hwxpcekddtfubmnkwutl.supabase.co`
- **MCP Tool Connected To:** Different project (travel platform)
- **Status:** Need to verify actual database state

### Codebase Expectations

Your codebase references these tables:

#### 1. **WasatchWise Base Tables** (from `lib/supabase/schema.sql`)
- `clients` - Client/lead management
- `projects` - Project tracking  
- `cognitive_audits` - Audit results
- `quiz_results` - Quiz submissions
- `email_captures` - Lead capture (exists but different structure)
- `ai_content_log` - AI usage tracking
- `heygen_videos` - Video generation logs
- `blog_posts` - Content management
- `case_studies` - Marketing content
- `tiktok_content` - Social media tracking

#### 2. **DAROS Tables** (from `lib/supabase/daros-schema.sql`)
- `districts` - District master data
- `artifacts` - Generated outputs
- `controls` - Privacy-by-design checklist
- `district_controls` - Implementation status
- `stakeholder_matrix` - Bob's framework
- `interventions` - Change management
- `vendors` - Master vendor list
- `district_vendors` - Usage mapping
- `briefing_sessions` - Session tracking
- `adoption_plans` - 30/60/90 plans

---

## Implementation Strategy

### Phase 1: Base WasatchWise Schema
**Priority: CRITICAL** - Your code already expects these tables

Apply `lib/supabase/schema.sql` which creates:
1. `clients` - For lead/client management
2. `projects` - For project tracking
3. `cognitive_audits` - For audit results
4. `quiz_results` - For quiz submissions (used by `/ai-readiness-quiz`)
5. `email_captures` - **NEEDS MIGRATION** (exists but different structure)
6. `ai_content_log` - For AI usage tracking (used by Claude/HeyGen)
7. `heygen_videos` - For video logs
8. `blog_posts` - For content
9. `case_studies` - For marketing
10. `tiktok_content` - For social tracking

**Migration for `email_captures`:**
```sql
-- Option 1: Add missing columns to existing table
ALTER TABLE email_captures 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS organization TEXT,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS lead_magnet TEXT,
ADD COLUMN IF NOT EXISTS converted_to_client BOOLEAN DEFAULT false;

-- Option 2: Create new table, migrate later
CREATE TABLE email_captures_wasatchwise (...);
```

### Phase 2: DAROS Schema
**Priority: HIGH** - Core consultation platform

Apply `lib/supabase/daros-schema.sql` which creates:
1. `districts` - District master data
2. `artifacts` - All generated outputs
3. `controls` - Privacy checklist (with seed data)
4. `district_controls` - Implementation tracking
5. `stakeholder_matrix` - Bob's framework
6. `interventions` - Change management
7. `vendors` / `district_vendors` - Vendor risk
8. `briefing_sessions` - 60-minute sessions
9. `adoption_plans` - 30/60/90 plans

---

## Migration Script

### Complete Migration (Safe - Checks First)

```sql
-- ============================================
-- WASATCHWISE BASE SCHEMA
-- ============================================

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  type TEXT CHECK (type IN ('K-12 District', 'Higher Ed', 'EdTech', 'State Agency')),
  location TEXT,
  district_size INTEGER,
  contact_name TEXT,
  contact_email TEXT UNIQUE,
  contact_phone TEXT,
  contact_role TEXT,
  lead_source TEXT,
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'won', 'lost')),
  deal_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
  deliverables JSONB DEFAULT '[]'::jsonb,
  invoice_amount DECIMAL(10,2),
  invoice_status TEXT DEFAULT 'pending' CHECK (invoice_status IN ('pending', 'paid', 'overdue')),
  case_study_permission BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cognitive Audits table
CREATE TABLE IF NOT EXISTS cognitive_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  admin_risk_score INTEGER CHECK (admin_risk_score BETWEEN 0 AND 100),
  teacher_burnout_score INTEGER CHECK (teacher_burnout_score BETWEEN 0 AND 100),
  parent_trust_score INTEGER CHECK (parent_trust_score BETWEEN 0 AND 100),
  overall_readiness TEXT CHECK (overall_readiness IN ('critical', 'at_risk', 'moderate', 'ai_ready')),
  recommendations JSONB DEFAULT '[]'::jsonb,
  audit_date DATE DEFAULT CURRENT_DATE,
  auditor_notes TEXT,
  generated_report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  organization_name TEXT,
  role TEXT,
  answers JSONB NOT NULL,
  score INTEGER,
  result_tier TEXT CHECK (result_tier IN ('red', 'yellow', 'green')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update email_captures to match WasatchWise structure
DO $$ 
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'email_captures' AND column_name = 'name') THEN
    ALTER TABLE email_captures ADD COLUMN name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'email_captures' AND column_name = 'organization') THEN
    ALTER TABLE email_captures ADD COLUMN organization TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'email_captures' AND column_name = 'role') THEN
    ALTER TABLE email_captures ADD COLUMN role TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'email_captures' AND column_name = 'lead_magnet') THEN
    ALTER TABLE email_captures ADD COLUMN lead_magnet TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'email_captures' AND column_name = 'converted_to_client') THEN
    ALTER TABLE email_captures ADD COLUMN converted_to_client BOOLEAN DEFAULT false;
  END IF;
END $$;

-- AI Generated Content Log
CREATE TABLE IF NOT EXISTS ai_content_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT,
  input_prompt TEXT,
  output_text TEXT,
  model TEXT DEFAULT 'claude-3-5-sonnet',
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),
  client_id UUID REFERENCES clients(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HeyGen Video Log
CREATE TABLE IF NOT EXISTS heygen_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id TEXT UNIQUE,
  avatar_id TEXT,
  script TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  client_id UUID REFERENCES clients(id),
  usage_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'John Lyman',
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER,
  is_published BOOLEAN DEFAULT false
);

-- Case Studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_type TEXT,
  district_size INTEGER,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  results JSONB NOT NULL,
  testimonial_text TEXT,
  testimonial_video_url TEXT,
  featured_image_url TEXT,
  published_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false
);

-- TikTok Content table
CREATE TABLE IF NOT EXISTS tiktok_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id TEXT UNIQUE,
  caption TEXT,
  url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  posted_at TIMESTAMPTZ,
  leads_generated INTEGER DEFAULT 0,
  content_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(contact_email);
CREATE INDEX IF NOT EXISTS idx_clients_stage ON clients(stage);
CREATE INDEX IF NOT EXISTS idx_quiz_results_email ON quiz_results(email);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_content_views ON tiktok_content(views DESC);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_audits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DAROS SCHEMA (Consultation Platform)
-- ============================================

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  size_band TEXT CHECK (size_band IN ('small', 'medium', 'large', 'mega')),
  contacts JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artifacts table
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
  url TEXT,
  content JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Controls table
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
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- District Controls
CREATE TABLE IF NOT EXISTS district_controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'partial', 'complete', 'not_applicable')),
  evidence_url TEXT,
  owner_role TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, control_id)
);

-- Stakeholder Matrix
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

-- Interventions
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

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  website TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- District Vendors
CREATE TABLE IF NOT EXISTS district_vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  contract_url TEXT,
  data_types TEXT[],
  ai_usage_level TEXT CHECK (ai_usage_level IN ('none', 'embedded', 'teacher_used', 'student_facing')),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, vendor_id)
);

-- Briefing Sessions
CREATE TABLE IF NOT EXISTS briefing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  facilitator TEXT,
  participants JSONB,
  agenda_items JSONB DEFAULT '[]'::jsonb,
  outcomes JSONB DEFAULT '{}'::jsonb,
  artifacts_generated UUID[],
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adoption Plans
CREATE TABLE IF NOT EXISTS adoption_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  plan_type TEXT DEFAULT '30_60_90' CHECK (plan_type IN ('30_60_90', 'custom')),
  phases JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAROS Indexes
CREATE INDEX IF NOT EXISTS idx_artifacts_district ON artifacts(district_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
CREATE INDEX IF NOT EXISTS idx_district_controls_district ON district_controls(district_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_matrix_district ON stakeholder_matrix(district_id);
CREATE INDEX IF NOT EXISTS idx_interventions_district ON interventions(district_id);
CREATE INDEX IF NOT EXISTS idx_district_vendors_district ON district_vendors(district_id);
CREATE INDEX IF NOT EXISTS idx_briefing_sessions_district ON briefing_sessions(district_id);

-- Seed default controls
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

-- Enable RLS for DAROS tables
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_plans ENABLE ROW LEVEL SECURITY;
```

---

## Execution Plan

### Step 1: Verify Database State
**You do this:**
1. Open Supabase Dashboard: https://supabase.com/dashboard/project/hwxpcekddtfubmnkwutl
2. Go to SQL Editor
3. Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
4. Share the list with me

### Step 2: Apply Migration
**I'll create:**
- Safe migration script (checks before creating)
- Handles `email_captures` migration
- Creates all WasatchWise + DAROS tables
- Seeds default controls

### Step 3: Test
**We verify:**
- All tables created
- Indexes working
- RLS enabled
- Code can connect

### Step 4: Build
**Continue with:**
- UI components
- API endpoints
- Artifact generation
- PDF exports

---

## Risk Assessment

### Low Risk
- Creating new tables (clients, projects, etc.)
- Adding DAROS tables
- Creating indexes

### Medium Risk
- Modifying `email_captures` (if data exists)
- RLS policies (need testing)

### Mitigation
- Use `IF NOT EXISTS` for all CREATE statements
- Use `DO $$ BEGIN ... END $$` for conditional ALTERs
- Test on staging first (if available)

---

**Status:** Ready to apply once database state confirmed  
**Next Action:** You verify actual database, then I create safe migration
