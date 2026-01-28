-- WasatchWise Command & Control Database Schema
-- PostgreSQL 15+ with pgvector extension
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
-- ================================================================
-- TABLE: residents (The Customer/User Base)
-- ================================================================
CREATE TABLE public.residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- External CRM linkage
    company_entity_id VARCHAR(255) UNIQUE NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    -- 'customer', 'subscriber', 'trial'
    -- Gamification metrics
    ltv_score NUMERIC(10, 2) DEFAULT 0,
    -- Lifetime Value in USD
    engagement_score INTEGER DEFAULT 0,
    -- 0-100 computed metric
    churn_probability FLOAT DEFAULT 0,
    -- 0.0-1.0 ML prediction
    tier VARCHAR(20) DEFAULT 'Free',
    -- 'Free', 'Member', 'Gold', 'Platinum'
    -- Spatial positioning
    grid_x INTEGER NOT NULL DEFAULT 0,
    grid_y INTEGER NOT NULL DEFAULT 0,
    home_building_id UUID,
    -- Which "district" they live in
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Indexes
    CONSTRAINT residents_grid_unique UNIQUE (grid_x, grid_y)
);
CREATE INDEX idx_residents_ltv ON public.residents(ltv_score DESC);
CREATE INDEX idx_residents_churn ON public.residents(churn_probability DESC);
CREATE INDEX idx_residents_active ON public.residents(last_active DESC);
-- ================================================================
-- TABLE: city_metrics (Global Pulse / KPI Storage)
-- ================================================================
CREATE TABLE public.city_metrics (
    metric_key VARCHAR(100) PRIMARY KEY,
    -- Value storage
    value NUMERIC(15, 2) NOT NULL,
    previous_value NUMERIC(15, 2),
    trend VARCHAR(20) DEFAULT 'stable',
    -- 'rising', 'falling', 'stable', 'volatile'
    -- Contextual metadata
    unit VARCHAR(50),
    -- 'USD', 'milliseconds', 'percentage'
    category VARCHAR(50),
    -- 'financial', 'technical', 'engagement'
    critical_threshold NUMERIC(15, 2),
    -- Trigger alert if crossed
    -- Timestamps
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Description
    display_name VARCHAR(255),
    description TEXT
);
CREATE INDEX idx_metrics_category ON public.city_metrics(category);
-- Insert default metrics
INSERT INTO public.city_metrics (metric_key, value, unit, category, display_name)
VALUES (
        'system_voltage',
        100,
        'percentage',
        'technical',
        'Google Cloud Health'
    ),
    (
        'treasury_funds',
        0,
        'USD',
        'financial',
        'Available Capital'
    ),
    (
        'daily_revenue',
        0,
        'USD',
        'financial',
        'Revenue (24h)'
    ),
    (
        'active_residents',
        0,
        'count',
        'engagement',
        'Active Users'
    ),
    (
        'churn_rate',
        0,
        'percentage',
        'engagement',
        'Churn Risk'
    );
-- ================================================================
-- TABLE: building_registry (AI Executive Configuration)
-- ================================================================
CREATE TABLE public.building_registry (
    building_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Building metadata
    type VARCHAR(50) NOT NULL,
    -- 'capitol', 'bank', 'academy', etc.
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Spatial data
    grid_x INTEGER NOT NULL,
    grid_y INTEGER NOT NULL,
    footprint_width INTEGER DEFAULT 2,
    footprint_height INTEGER DEFAULT 2,
    -- AI Executive configuration
    agent_persona TEXT,
    -- System prompt for LangChain
    model_name VARCHAR(100) DEFAULT 'gpt-4',
    -- Which LLM to use
    data_access_scope JSONB,
    -- {"tables": ["transactions", "residents"]}
    vector_store_id VARCHAR(255),
    -- For RAG (pgvector collection)
    -- Visual state
    sprite_path VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Insert core buildings (using CTE to avoid duplicate key errors if re-run, or just INSERT IGNORE/ON CONFLICT)
INSERT INTO public.building_registry (
        type,
        display_name,
        grid_x,
        grid_y,
        footprint_width,
        footprint_height,
        agent_persona,
        sprite_path
    )
VALUES (
        'capitol',
        'WasatchWise Capitol',
        0,
        0,
        4,
        4,
        'You are the CEO of WasatchWise. Strategic, holistic, focused on sustainable growth.',
        '/sprites/buildings/capitol.png'
    ),
    (
        'bank',
        'The Treasury',
        -4,
        -4,
        2,
        2,
        'You are the CFO. Conservative, risk-averse, obsessed with ROI and cash flow.',
        '/sprites/buildings/bank.png'
    ),
    (
        'academy',
        'Adult AI Academy',
        4,
        -4,
        3,
        3,
        'You are the Dean of Education. Passionate about learning outcomes and student success.',
        '/sprites/buildings/academy.png'
    ),
    (
        'office',
        'Ask Before You App HQ',
        -4,
        4,
        2,
        2,
        'You are the Chief Compliance Officer. Detail-oriented, regulatory-focused.',
        '/sprites/buildings/office.png'
    ),
    (
        'venue',
        'Rock Salt Music Hall',
        4,
        4,
        3,
        3,
        'You are the Promoter. Energetic, viral growth focused, community-driven.',
        '/sprites/buildings/venue.png'
    ) ON CONFLICT DO NOTHING;
-- ================================================================
-- TABLE: email_log (Post Office Integration)
-- ================================================================
CREATE TABLE public.email_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- SendGrid metadata
    sendgrid_message_id VARCHAR(255),
    recipient_email VARCHAR(255) NOT NULL,
    resident_id UUID REFERENCES public.residents(id),
    -- Status tracking
    status VARCHAR(50) DEFAULT 'queued',
    -- 'queued', 'sent', 'delivered', 'bounced', 'opened'
    bounce_reason TEXT,
    -- Content
    subject VARCHAR(500),
    template_id VARCHAR(255),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_email_status ON public.email_log(status);
CREATE INDEX idx_email_resident ON public.email_log(resident_id);
-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================
-- Enable RLS on all tables
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_registry ENABLE ROW LEVEL SECURITY;
-- Note: We assume auth.role() = 'authenticated' is sufficient for the dashboard user (John/Admin)
-- If this is a public dashboard, we might need 'anon' access for read-only.
CREATE POLICY "Allow authenticated read access" ON public.residents FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON public.city_metrics FOR
SELECT USING (auth.role() = 'authenticated');