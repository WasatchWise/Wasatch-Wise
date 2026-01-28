-- WasatchWise Database Schema

-- Clients table
CREATE TABLE clients (
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
CREATE TABLE projects (
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
CREATE TABLE cognitive_audits (
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
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  organization_name TEXT,
  role TEXT,
  answers JSONB NOT NULL,
  score INTEGER,
  result_tier TEXT CHECK (result_tier IN ('red', 'yellow', 'green')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts table
CREATE TABLE blog_posts (
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
CREATE TABLE case_studies (
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

-- Email Captures table
CREATE TABLE email_captures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  organization TEXT,
  role TEXT,
  source TEXT,
  lead_magnet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_to_client BOOLEAN DEFAULT false
);

-- TikTok Content table
CREATE TABLE tiktok_content (
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

-- AI Generated Content Log
CREATE TABLE ai_content_log (
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
CREATE TABLE heygen_videos (
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

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_audits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for client portal)
CREATE POLICY "Clients can view their own data"
  ON clients
  FOR SELECT
  USING (auth.uid() = (metadata->>'user_id')::uuid);

-- Indexes for performance
CREATE INDEX idx_clients_email ON clients(contact_email);
CREATE INDEX idx_clients_stage ON clients(stage);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX idx_quiz_results_email ON quiz_results(email);
CREATE INDEX idx_tiktok_content_views ON tiktok_content(views DESC);

