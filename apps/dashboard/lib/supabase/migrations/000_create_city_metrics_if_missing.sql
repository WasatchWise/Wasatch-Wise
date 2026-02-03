-- Bootstrap: create city_metrics if it doesn't exist (e.g. project has no command-control schema yet)
-- Run this once in Supabase SQL Editor before 001–009 if you get "relation city_metrics does not exist"

CREATE TABLE IF NOT EXISTS public.city_metrics (
    metric_key VARCHAR(100) PRIMARY KEY,
    value NUMERIC(15, 2) NOT NULL,
    previous_value NUMERIC(15, 2),
    trend VARCHAR(20) DEFAULT 'stable',
    unit VARCHAR(50),
    category VARCHAR(50),
    critical_threshold NUMERIC(15, 2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    display_name VARCHAR(255),
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_metrics_category ON public.city_metrics(category);

-- RLS: enable and allow authenticated read (dashboard); service_role bypasses for n8n writes
ALTER TABLE public.city_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access" ON public.city_metrics
FOR SELECT USING (auth.role() = 'authenticated');
