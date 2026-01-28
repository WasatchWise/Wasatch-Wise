-- ============================================================================
-- SDPC Registry Schema Migration
-- Aligns with SDPC Registry Support Manager role requirements
-- Version: 1.0
-- Date: 2026-01-22
-- ============================================================================

-- Drop existing vendors table if needed to recreate with full schema
-- (Skip this if vendors table already has the structure you want)
-- DROP TABLE IF EXISTS vendors CASCADE;

-- ============================================================================
-- Core Vendor Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website text,
  vendor_type text CHECK (vendor_type IN ('EdTech', 'SaaS', 'Platform', 'Content Provider', 'Assessment', 'LMS', 'Other')),
  sdpc_member boolean DEFAULT false,
  compliance_status text DEFAULT 'pending' CHECK (compliance_status IN ('active', 'pending', 'expired', 'non-compliant', 'under_review')),
  
  -- Contact Information
  primary_contact_email text,
  primary_contact_name text,
  phone text,
  
  -- Compliance Documentation
  data_practices_url text,
  privacy_policy_url text,
  terms_of_service_url text,
  security_documentation_url text,
  
  -- Assessment Tracking
  last_assessment_date date,
  next_review_date date,
  risk_tier text CHECK (risk_tier IN ('Low', 'Medium', 'High', 'Critical')),
  
  -- Metadata
  notes text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS vendor_type text,
  ADD COLUMN IF NOT EXISTS sdpc_member boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS compliance_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS primary_contact_email text,
  ADD COLUMN IF NOT EXISTS primary_contact_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS data_practices_url text,
  ADD COLUMN IF NOT EXISTS privacy_policy_url text,
  ADD COLUMN IF NOT EXISTS terms_of_service_url text,
  ADD COLUMN IF NOT EXISTS security_documentation_url text,
  ADD COLUMN IF NOT EXISTS last_assessment_date date,
  ADD COLUMN IF NOT EXISTS next_review_date date,
  ADD COLUMN IF NOT EXISTS risk_tier text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================================================
-- Data Use Agreements (DPAs/DUAs/FERPA Agreements)
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_use_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Agreement Details
  agreement_type text NOT NULL CHECK (agreement_type IN ('DPA', 'FERPA', 'State-specific', 'SDPC Standard', 'Custom', 'Addendum')),
  agreement_name text,
  signed_date date,
  effective_date date,
  expiration_date date,
  
  -- Document Storage
  document_url text, -- Link to Supabase Storage or external
  document_storage_path text, -- Path in Supabase Storage
  
  -- Status Management
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'terminated', 'under_review', 'renewal_required')),
  renewal_required boolean DEFAULT true,
  auto_renew boolean DEFAULT false,
  renewal_notice_days int DEFAULT 60, -- Days before expiration to send notice
  
  -- Signatories
  district_signatory_name text,
  district_signatory_title text,
  district_signatory_email text,
  vendor_signatory_name text,
  vendor_signatory_title text,
  
  -- Compliance & Tracking
  compliance_verified boolean DEFAULT false,
  compliance_verification_date date,
  compliance_verified_by uuid, -- Reference to user_profiles if exists
  
  -- Notes
  notes text,
  internal_notes text, -- Private notes not shared with vendor
  
  -- Audit Trail
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (expiration_date IS NULL OR effective_date IS NULL OR expiration_date > effective_date),
  CONSTRAINT unique_district_vendor_agreement UNIQUE (district_id, vendor_id, agreement_type, effective_date)
);

-- ============================================================================
-- AI Tool Assessments
-- ============================================================================

CREATE TABLE IF NOT EXISTS tool_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Tool Information
  tool_name text NOT NULL,
  tool_version text,
  tool_category text CHECK (tool_category IN ('LMS', 'AI Tutor', 'Assessment', 'Communication', 'Administrative', 'Content Creation', 'Analytics', 'Other')),
  tool_url text,
  ai_functionality boolean DEFAULT false,
  ai_features_description text,
  
  -- Data Collection & Privacy
  student_data_collected jsonb DEFAULT '[]'::jsonb, -- Array of PII types: ["name", "email", "grades", "behavior_data"]
  teacher_data_collected jsonb DEFAULT '[]'::jsonb,
  data_retention_days int,
  data_location text, -- 'US', 'EU', 'Global', 'Unknown'
  data_encryption_at_rest boolean,
  data_encryption_in_transit boolean,
  third_party_sharing boolean DEFAULT false,
  third_party_recipients jsonb DEFAULT '[]'::jsonb, -- List of third parties
  
  -- AI-Specific Concerns
  trains_on_student_data boolean DEFAULT false,
  data_used_for_model_improvement boolean DEFAULT false,
  algorithmic_bias_assessment boolean DEFAULT false,
  explainability_available boolean DEFAULT false,
  human_oversight_required boolean DEFAULT false,
  
  -- Risk Assessment
  risk_score int CHECK (risk_score BETWEEN 1 AND 10),
  risk_tier text CHECK (risk_tier IN ('Low', 'Medium', 'High', 'Critical')),
  risk_factors jsonb DEFAULT '[]'::jsonb, -- Specific risks identified
  compliance_gaps jsonb DEFAULT '[]'::jsonb, -- ["Missing DPA", "No FERPA compliance", etc.]
  mitigation_measures jsonb DEFAULT '[]'::jsonb,
  
  -- Assessment Workflow
  assessed_by uuid, -- Reference to user conducting assessment
  assessment_date date DEFAULT CURRENT_DATE,
  assessment_method text, -- 'Self-assessment', 'Vendor questionnaire', 'Third-party audit', 'SDPC template'
  next_review_date date,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'completed', 'approved', 'rejected', 'archived')),
  
  -- Approval Workflow
  approved_by uuid,
  approval_date date,
  approval_conditions text,
  usage_restrictions text,
  
  -- Documentation
  assessment_document_url text,
  notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Compliance Checks & Audits
-- ============================================================================

CREATE TABLE IF NOT EXISTS compliance_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  tool_assessment_id uuid REFERENCES tool_assessments(id) ON DELETE SET NULL,
  dua_id uuid REFERENCES data_use_agreements(id) ON DELETE SET NULL,
  
  -- Check Details
  check_type text NOT NULL CHECK (check_type IN ('Annual Review', 'Incident Response', 'Random Audit', 'Vendor Onboarding', 'DPA Renewal', 'User Complaint', 'Regulatory Requirement', 'Self-Assessment')),
  check_date date DEFAULT CURRENT_DATE,
  
  -- Results
  passed boolean,
  score int CHECK (score BETWEEN 0 AND 100),
  findings jsonb DEFAULT '[]'::jsonb, -- Structured findings with severity levels
  issues_found jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  
  -- Remediation
  remediation_required boolean DEFAULT false,
  remediation_notes text,
  remediation_deadline date,
  remediation_completed boolean DEFAULT false,
  remediation_completion_date date,
  
  -- Follow-up
  next_review_date date,
  escalation_required boolean DEFAULT false,
  escalated_to text, -- 'Legal', 'Superintendent', 'Board', etc.
  
  -- Auditor Information
  checked_by uuid, -- Reference to user conducting check
  checked_by_name text,
  checked_by_title text,
  
  -- Documentation
  check_document_url text,
  evidence_urls jsonb DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Personalized Video Management (HeyGen Integration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS personalized_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES districts(id) ON DELETE SET NULL,
  
  -- Recipient Information
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_role text, -- 'Superintendent', 'Tech Director', 'Principal', etc.
  
  -- Video Details
  video_type text NOT NULL CHECK (video_type IN ('onboarding', 'milestone', 'explanation', 'celebration', 'training', 'update', 'alert')),
  trigger_event text, -- 'signup', 'week_4_complete', 'audit_booked', 'dpa_expiring', etc.
  topic text, -- 'FERPA Compliance', 'Tool Assessment', etc.
  script_content text NOT NULL,
  
  -- HeyGen Integration
  heygen_video_id text,
  heygen_video_url text,
  heygen_thumbnail_url text,
  heygen_avatar_id text, -- Which avatar was used
  duration_seconds int,
  
  -- Delivery Tracking
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'sent', 'failed', 'cancelled')),
  generation_started_at timestamptz,
  generation_completed_at timestamptz,
  sent_at timestamptz,
  delivery_method text DEFAULT 'email', -- 'email', 'portal', 'both'
  
  -- Engagement Tracking
  viewed_at timestamptz,
  view_count int DEFAULT 0,
  last_viewed_at timestamptz,
  average_watch_percentage int, -- 0-100
  
  -- Error Handling
  error_message text,
  retry_count int DEFAULT 0,
  
  -- Metadata
  template_used text, -- Reference to video_templates.template_name
  personalization_data jsonb DEFAULT '{}'::jsonb, -- Variables used
  cost_usd numeric(10,4),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Video Templates Library
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text UNIQUE NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('onboarding', 'milestone', 'explanation', 'celebration', 'training', 'update', 'alert')),
  
  -- Script Template
  script_template text NOT NULL, -- With {{variable}} placeholders
  required_variables text[] DEFAULT ARRAY[]::text[], -- ['contact_name', 'district_name', etc.]
  optional_variables text[] DEFAULT ARRAY[]::text[],
  
  -- Visual Settings
  thumbnail_url text,
  avatar_preference text, -- 'professional', 'casual', 'educational'
  background_type text,
  
  -- Metadata
  estimated_duration int, -- seconds
  use_count int DEFAULT 0,
  last_used_at timestamptz,
  active boolean DEFAULT true,
  category text,
  tags text[],
  notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Support Interactions & Escalations
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES districts(id) ON DELETE SET NULL,
  
  -- User Information
  user_email text NOT NULL,
  user_name text,
  user_role text,
  
  -- Conversation Tracking
  level int DEFAULT 1 CHECK (level BETWEEN 1 AND 4), -- 1=Text(WiseBot), 2=Voice, 3=Video, 4=Live Call
  escalation_path text[] DEFAULT ARRAY['text']::text[], -- Track progression
  escalation_reason text,
  escalated_at timestamptz,
  
  -- Topic Classification
  topic_category text CHECK (topic_category IN ('FERPA', 'COPPA', 'State Law', 'Policy', 'Technical', 'Training', 'Vendor Assessment', 'DPA Review', 'Incident Response', 'General', 'Other')),
  topic_tags text[],
  urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  
  -- Conversation Data
  wisebot_conversation jsonb DEFAULT '[]'::jsonb, -- Array of {role, content, timestamp}
  voice_response_url text,
  video_response_id uuid REFERENCES personalized_videos(id),
  call_scheduled_at timestamptz,
  call_completed_at timestamptz,
  call_duration_minutes int,
  
  -- Resolution Tracking
  resolved boolean DEFAULT false,
  resolution_level int, -- Which level resolved it
  resolution_method text, -- 'self-service', 'automated_response', 'video_explanation', 'live_support'
  resolution_notes text,
  resolution_time_minutes int, -- Time to resolution
  
  -- Satisfaction
  satisfaction_score int CHECK (satisfaction_score BETWEEN 1 AND 5),
  satisfaction_comment text,
  feedback_received_at timestamptz,
  
  -- Follow-up
  follow_up_required boolean DEFAULT false,
  follow_up_scheduled_at timestamptz,
  follow_up_completed boolean DEFAULT false,
  
  -- Internal Notes
  internal_notes text,
  assigned_to uuid, -- If escalated to human
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Knowledge Base (WiseBot Training Data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  category text NOT NULL CHECK (category IN ('FERPA', 'COPPA', 'State Law', 'Policy', 'Tool Evaluation', 'Process', 'Best Practice', 'FAQ', 'Troubleshooting', 'Training')),
  question text NOT NULL,
  answer text NOT NULL,
  answer_html text, -- Rich text version if needed
  
  -- Context & References
  related_policy text,
  related_urls jsonb DEFAULT '[]'::jsonb, -- [{"title": "...", "url": "..."}]
  legal_citations text[],
  
  -- Search & Discovery
  tags text[] DEFAULT ARRAY[]::text[],
  keywords text[] DEFAULT ARRAY[]::text[],
  search_vector tsvector, -- For full-text search
  
  -- Usage Analytics
  view_count int DEFAULT 0,
  helpful_count int DEFAULT 0,
  not_helpful_count int DEFAULT 0,
  last_viewed_at timestamptz,
  
  -- Content Management
  active boolean DEFAULT true,
  priority int DEFAULT 0, -- Higher = show first
  confidence_level text CHECK (confidence_level IN ('high', 'medium', 'low')),
  requires_review boolean DEFAULT false,
  reviewed_at timestamptz,
  reviewed_by uuid,
  
  -- Versioning
  version int DEFAULT 1,
  previous_version_id uuid REFERENCES knowledge_base(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Data Use Agreements
CREATE INDEX IF NOT EXISTS idx_dua_district ON data_use_agreements(district_id);
CREATE INDEX IF NOT EXISTS idx_dua_vendor ON data_use_agreements(vendor_id);
CREATE INDEX IF NOT EXISTS idx_dua_expiration ON data_use_agreements(expiration_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_dua_status ON data_use_agreements(status);
CREATE INDEX IF NOT EXISTS idx_dua_renewal_required ON data_use_agreements(renewal_required, expiration_date) WHERE status = 'active';

-- Tool Assessments
CREATE INDEX IF NOT EXISTS idx_tool_assessments_district ON tool_assessments(district_id);
CREATE INDEX IF NOT EXISTS idx_tool_assessments_vendor ON tool_assessments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_tool_assessments_risk ON tool_assessments(risk_tier);
CREATE INDEX IF NOT EXISTS idx_tool_assessments_status ON tool_assessments(status);
CREATE INDEX IF NOT EXISTS idx_tool_assessments_ai ON tool_assessments(ai_functionality) WHERE ai_functionality = true;

-- Compliance Checks
CREATE INDEX IF NOT EXISTS idx_compliance_checks_district ON compliance_checks(district_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_vendor ON compliance_checks(vendor_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_date ON compliance_checks(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_remediation ON compliance_checks(remediation_required) WHERE remediation_required = true;

-- Personalized Videos
CREATE INDEX IF NOT EXISTS idx_personalized_videos_district ON personalized_videos(district_id);
CREATE INDEX IF NOT EXISTS idx_personalized_videos_status ON personalized_videos(status);
CREATE INDEX IF NOT EXISTS idx_personalized_videos_type ON personalized_videos(video_type);
CREATE INDEX IF NOT EXISTS idx_personalized_videos_email ON personalized_videos(contact_email);

-- Support Interactions
CREATE INDEX IF NOT EXISTS idx_support_interactions_district ON support_interactions(district_id);
CREATE INDEX IF NOT EXISTS idx_support_interactions_resolved ON support_interactions(resolved);
CREATE INDEX IF NOT EXISTS idx_support_interactions_level ON support_interactions(level);
CREATE INDEX IF NOT EXISTS idx_support_interactions_category ON support_interactions(topic_category);
CREATE INDEX IF NOT EXISTS idx_support_interactions_email ON support_interactions(user_email);

-- Knowledge Base
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search ON knowledge_base USING GIN(search_vector);

-- Vendors
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(compliance_status);
CREATE INDEX IF NOT EXISTS idx_vendors_sdpc ON vendors(sdpc_member) WHERE sdpc_member = true;
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(vendor_type);

-- ============================================================================
-- TRIGGERS for Auto-Update
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dua_updated_at ON data_use_agreements;
CREATE TRIGGER update_dua_updated_at BEFORE UPDATE ON data_use_agreements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tool_assessments_updated_at ON tool_assessments;
CREATE TRIGGER update_tool_assessments_updated_at BEFORE UPDATE ON tool_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_checks_updated_at ON compliance_checks;
CREATE TRIGGER update_compliance_checks_updated_at BEFORE UPDATE ON compliance_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personalized_videos_updated_at ON personalized_videos;
CREATE TRIGGER update_personalized_videos_updated_at BEFORE UPDATE ON personalized_videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_templates_updated_at ON video_templates;
CREATE TRIGGER update_video_templates_updated_at BEFORE UPDATE ON video_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_interactions_updated_at ON support_interactions;
CREATE TRIGGER update_support_interactions_updated_at BEFORE UPDATE ON support_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Full-Text Search Setup for Knowledge Base
-- ============================================================================

CREATE OR REPLACE FUNCTION knowledge_base_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.question, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.answer, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS knowledge_base_search_vector_trigger ON knowledge_base;
CREATE TRIGGER knowledge_base_search_vector_trigger
    BEFORE INSERT OR UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION knowledge_base_search_vector_update();

-- ============================================================================
-- COMMENTS for Documentation
-- ============================================================================

COMMENT ON TABLE vendors IS 'Vendor registry for AI tools and EdTech services used by districts';
COMMENT ON TABLE data_use_agreements IS 'Data Privacy Agreements, DPAs, and FERPA agreements between districts and vendors';
COMMENT ON TABLE tool_assessments IS 'Risk assessments and compliance reviews of specific tools/services';
COMMENT ON TABLE compliance_checks IS 'Periodic compliance audits and checks for vendors and agreements';
COMMENT ON TABLE personalized_videos IS 'HeyGen-generated personalized videos for onboarding and support';
COMMENT ON TABLE video_templates IS 'Reusable templates for generating personalized videos';
COMMENT ON TABLE support_interactions IS 'WiseBot and escalated support conversations with tracking';
COMMENT ON TABLE knowledge_base IS 'Q&A content for WiseBot and self-service help center';

-- ============================================================================
-- RLS Policies (Basic - Expand per requirements)
-- ============================================================================

ALTER TABLE data_use_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_interactions ENABLE ROW LEVEL SECURITY;

-- Example: Districts can only see their own data (adjust based on auth strategy)
-- CREATE POLICY "Districts can view own DUAs" ON data_use_agreements
--     FOR SELECT
--     USING (district_id = auth.uid()::uuid); -- Adjust based on your auth setup

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
