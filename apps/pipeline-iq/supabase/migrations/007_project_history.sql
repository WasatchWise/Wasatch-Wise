CREATE TABLE IF NOT EXISTS project_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES high_priority_projects(id) ON DELETE CASCADE,
    snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    project_stage TEXT,
    project_value NUMERIC,
    units_count INTEGER,
    groove_fit_score INTEGER,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Add index for fast lookups by project
CREATE INDEX IF NOT EXISTS idx_project_snapshots_project_id ON project_snapshots(project_id);
-- Add index for time-series analysis
CREATE INDEX IF NOT EXISTS idx_project_snapshots_date ON project_snapshots(snapshot_at);