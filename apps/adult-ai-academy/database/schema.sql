-- Adult AI Academy - Supabase Database Schema
-- This schema defines the tables used by the application

-- ===========================================
-- Table: production_batches
-- Stores production batch data from the orchestrator
-- ===========================================
CREATE TABLE IF NOT EXISTS production_batches (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    audit_score NUMERIC,
    audit_report JSONB,
    blackboard JSONB,
    synthesis JSONB,
    storyboard_results JSONB,
    heygen_video_id TEXT,
    template_id TEXT,
    detected_mindset TEXT CHECK (detected_mindset IN ('Optimist', 'Maybe', 'Unaware')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_batches_status ON production_batches(status);
CREATE INDEX IF NOT EXISTS idx_production_batches_created_at ON production_batches(created_at DESC);

-- ===========================================
-- Table: leads
-- CRM integration for lead tracking and propensity scoring
-- ===========================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    propensity_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_propensity_score ON leads(propensity_score DESC);

-- ===========================================
-- Table: produced_assets
-- Stores final produced content assets (videos, images, scripts)
-- ===========================================
CREATE TABLE IF NOT EXISTS produced_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    pillar TEXT NOT NULL,
    social_hook TEXT,
    nepq_trigger TEXT,
    video_script TEXT,
    veo_video_url TEXT,
    dalle_image_url TEXT,
    raw_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produced_assets_topic ON produced_assets(topic);
CREATE INDEX IF NOT EXISTS idx_produced_assets_pillar ON produced_assets(pillar);
CREATE INDEX IF NOT EXISTS idx_produced_assets_created_at ON produced_assets(created_at DESC);

-- ===========================================
-- Row Level Security (RLS) Policies
-- Adjust these based on your security requirements
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE produced_assets ENABLE ROW LEVEL SECURITY;

-- Example policies (customize based on your auth setup):
-- Allow authenticated users to read/write their own data
-- CREATE POLICY "Users can view own production batches" ON production_batches
--     FOR SELECT USING (auth.uid() = user_id);
-- 
-- CREATE POLICY "Users can insert own production batches" ON production_batches
--     FOR INSERT WITH CHECK (auth.uid() = user_id);

