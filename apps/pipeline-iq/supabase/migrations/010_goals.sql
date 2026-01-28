-- ============================================================================
-- GOALS & PROGRESS TRACKING
-- ============================================================================
-- Migration to add goal setting and progress tracking functionality
-- Based on HCI Runthroughs RUNTHROUGH 9: Goal Setting & Progress Tracking
-- ============================================================================

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Goals table for tracking revenue, deals, services, and other targets
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Goal Definition
  goal_name TEXT NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN (
    'revenue',           -- Revenue target in dollars
    'deals_closed',      -- Number of deals closed
    'services_sold',     -- Number of specific services sold
    'pipeline_value',    -- Total pipeline value target
    'meetings_booked',   -- Number of meetings scheduled
    'emails_sent',       -- Outreach volume target
    'custom'             -- Custom metric
  )),

  -- Target & Progress
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,

  -- Time Period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Breakdown (optional - by vertical, service type, etc.)
  breakdown JSONB DEFAULT '{}',
  -- Example: {"by_vertical": {"hospitality": 200000, "multifamily": 300000}}
  -- Example: {"by_service": {"wifi": 10, "access_control": 8}}

  -- Service-specific tracking (for services_sold goal type)
  service_type TEXT, -- wifi, access_control, cabling, security, tv, smart_home

  -- Vertical-specific tracking
  vertical TEXT, -- hospitality, senior_living, multifamily, student

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),

  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_goals_org ON goals(organization_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_dates ON goals(start_date, end_date);

-- Goal progress snapshots (for tracking progress over time)
CREATE TABLE IF NOT EXISTS goal_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,

  -- Snapshot data
  snapshot_date DATE DEFAULT CURRENT_DATE,
  current_value NUMERIC NOT NULL,
  target_value NUMERIC NOT NULL,

  -- Calculated metrics
  progress_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN target_value > 0
      THEN LEAST(100, (current_value / target_value) * 100)
      ELSE 0
    END
  ) STORED,

  -- Pace tracking
  days_elapsed INTEGER,
  days_remaining INTEGER,
  daily_run_rate NUMERIC, -- Amount per day needed to hit goal
  projected_final_value NUMERIC, -- At current pace, where will we end up?

  -- Status indicator
  pace_status TEXT CHECK (pace_status IN ('ahead', 'on_track', 'behind', 'at_risk')),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One snapshot per goal per day
  UNIQUE(goal_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_goal_progress_goal ON goal_progress(goal_id, snapshot_date DESC);

-- Goal recommendations (AI-generated optimization suggestions)
CREATE TABLE IF NOT EXISTS goal_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,

  -- Recommendation content
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN (
    'focus_vertical',    -- Recommend focusing on a specific vertical
    'focus_projects',    -- Recommend specific projects to prioritize
    'outreach_tactic',   -- Suggest email/call timing or approach
    'subject_line',      -- Suggest subject line optimization
    'pain_point',        -- Recommend pain points to emphasize
    'contact_target',    -- Recommend contacts to reach out to
    'general'            -- General strategic recommendation
  )),

  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Structured data for actionable recommendations
  action_data JSONB DEFAULT '{}',
  -- Example for focus_projects: {"project_ids": ["uuid1", "uuid2"], "total_value": 180000}
  -- Example for subject_line: {"template": "Quick question about {projectName}", "open_rate": 0.48}

  -- Priority and impact
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  estimated_impact NUMERIC, -- Estimated revenue/deals if followed

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'completed')),
  dismissed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goal_recommendations_goal ON goal_recommendations(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_recommendations_active ON goal_recommendations(status) WHERE status = 'active';

-- View for goal dashboard with calculated metrics
CREATE OR REPLACE VIEW v_goals_dashboard AS
SELECT
  g.*,

  -- Progress calculation
  CASE WHEN g.target_value > 0
    THEN ROUND((g.current_value / g.target_value) * 100, 1)
    ELSE 0
  END as progress_percentage,

  -- Time calculations
  g.end_date - g.start_date as total_days,
  CURRENT_DATE - g.start_date as days_elapsed,
  g.end_date - CURRENT_DATE as days_remaining,

  -- Gap analysis
  g.target_value - g.current_value as gap_to_target,

  -- Pace calculations
  CASE
    WHEN (CURRENT_DATE - g.start_date) > 0
    THEN ROUND(g.current_value / (CURRENT_DATE - g.start_date), 2)
    ELSE 0
  END as current_daily_rate,

  CASE
    WHEN (g.end_date - CURRENT_DATE) > 0
    THEN ROUND((g.target_value - g.current_value) / (g.end_date - CURRENT_DATE), 2)
    ELSE 0
  END as required_daily_rate,

  -- Projected final value at current pace
  CASE
    WHEN (CURRENT_DATE - g.start_date) > 0
    THEN ROUND(
      g.current_value +
      (g.current_value / NULLIF(CURRENT_DATE - g.start_date, 0)) * (g.end_date - CURRENT_DATE)
    , 0)
    ELSE g.current_value
  END as projected_final_value,

  -- Pace status
  CASE
    WHEN g.current_value >= g.target_value THEN 'completed'
    WHEN (CURRENT_DATE - g.start_date) <= 0 THEN 'not_started'
    WHEN (g.current_value / NULLIF(CURRENT_DATE - g.start_date, 0)) * (g.end_date - g.start_date) >= g.target_value * 1.1 THEN 'ahead'
    WHEN (g.current_value / NULLIF(CURRENT_DATE - g.start_date, 0)) * (g.end_date - g.start_date) >= g.target_value * 0.9 THEN 'on_track'
    WHEN (g.current_value / NULLIF(CURRENT_DATE - g.start_date, 0)) * (g.end_date - g.start_date) >= g.target_value * 0.7 THEN 'behind'
    ELSE 'at_risk'
  END as pace_status,

  -- Active recommendations count
  (SELECT COUNT(*) FROM goal_recommendations gr WHERE gr.goal_id = g.id AND gr.status = 'active') as active_recommendations

FROM goals g
WHERE g.status = 'active';

-- Function to update goal progress from actual data
CREATE OR REPLACE FUNCTION update_goal_progress(p_goal_id UUID)
RETURNS VOID AS $$
DECLARE
  v_goal RECORD;
  v_current_value NUMERIC;
BEGIN
  -- Get goal details
  SELECT * INTO v_goal FROM goals WHERE id = p_goal_id;

  IF v_goal IS NULL THEN
    RAISE EXCEPTION 'Goal not found: %', p_goal_id;
  END IF;

  -- Calculate current value based on goal type
  CASE v_goal.goal_type
    WHEN 'revenue' THEN
      SELECT COALESCE(SUM(actual_revenue), 0) INTO v_current_value
      FROM high_priority_projects
      WHERE organization_id = v_goal.organization_id
        AND closed_at BETWEEN v_goal.start_date AND v_goal.end_date
        AND outreach_status = 'closed'
        AND (v_goal.vertical IS NULL OR project_type @> ARRAY[v_goal.vertical]);

    WHEN 'deals_closed' THEN
      SELECT COUNT(*) INTO v_current_value
      FROM high_priority_projects
      WHERE organization_id = v_goal.organization_id
        AND closed_at BETWEEN v_goal.start_date AND v_goal.end_date
        AND outreach_status = 'closed'
        AND (v_goal.vertical IS NULL OR project_type @> ARRAY[v_goal.vertical]);

    WHEN 'pipeline_value' THEN
      SELECT COALESCE(SUM(project_value), 0) INTO v_current_value
      FROM high_priority_projects
      WHERE organization_id = v_goal.organization_id
        AND status = 'active'
        AND outreach_status IN ('qualified', 'engaged');

    WHEN 'meetings_booked' THEN
      SELECT COUNT(*) INTO v_current_value
      FROM outreach_activities
      WHERE organization_id = v_goal.organization_id
        AND activity_type = 'meeting'
        AND created_at BETWEEN v_goal.start_date AND v_goal.end_date;

    WHEN 'emails_sent' THEN
      SELECT COUNT(*) INTO v_current_value
      FROM outreach_activities
      WHERE organization_id = v_goal.organization_id
        AND activity_type = 'email'
        AND status IN ('sent', 'delivered', 'opened', 'clicked', 'replied')
        AND created_at BETWEEN v_goal.start_date AND v_goal.end_date;

    ELSE
      -- For custom and services_sold, keep existing value (manual update)
      v_current_value := v_goal.current_value;
  END CASE;

  -- Update goal current value
  UPDATE goals
  SET current_value = v_current_value, updated_at = NOW()
  WHERE id = p_goal_id;

  -- Insert progress snapshot
  INSERT INTO goal_progress (
    goal_id,
    snapshot_date,
    current_value,
    target_value,
    days_elapsed,
    days_remaining,
    daily_run_rate,
    projected_final_value,
    pace_status
  )
  VALUES (
    p_goal_id,
    CURRENT_DATE,
    v_current_value,
    v_goal.target_value,
    CURRENT_DATE - v_goal.start_date,
    v_goal.end_date - CURRENT_DATE,
    CASE
      WHEN (v_goal.end_date - CURRENT_DATE) > 0
      THEN (v_goal.target_value - v_current_value) / (v_goal.end_date - CURRENT_DATE)
      ELSE 0
    END,
    CASE
      WHEN (CURRENT_DATE - v_goal.start_date) > 0
      THEN v_current_value + (v_current_value / (CURRENT_DATE - v_goal.start_date)) * (v_goal.end_date - CURRENT_DATE)
      ELSE v_current_value
    END,
    CASE
      WHEN v_current_value >= v_goal.target_value THEN 'ahead'
      WHEN (CURRENT_DATE - v_goal.start_date) <= 0 THEN 'on_track'
      WHEN (v_current_value / NULLIF(CURRENT_DATE - v_goal.start_date, 0)) * (v_goal.end_date - v_goal.start_date) >= v_goal.target_value * 0.9 THEN 'on_track'
      WHEN (v_current_value / NULLIF(CURRENT_DATE - v_goal.start_date, 0)) * (v_goal.end_date - v_goal.start_date) >= v_goal.target_value * 0.7 THEN 'behind'
      ELSE 'at_risk'
    END
  )
  ON CONFLICT (goal_id, snapshot_date)
  DO UPDATE SET
    current_value = EXCLUDED.current_value,
    target_value = EXCLUDED.target_value,
    days_elapsed = EXCLUDED.days_elapsed,
    days_remaining = EXCLUDED.days_remaining,
    daily_run_rate = EXCLUDED.daily_run_rate,
    projected_final_value = EXCLUDED.projected_final_value,
    pace_status = EXCLUDED.pace_status;

END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goals
CREATE POLICY "goals_org_policy" ON goals
  FOR ALL USING (organization_id = (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "goal_progress_org_policy" ON goal_progress
  FOR ALL USING (goal_id IN (
    SELECT id FROM goals WHERE organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "goal_recommendations_org_policy" ON goal_recommendations
  FOR ALL USING (goal_id IN (
    SELECT id FROM goals WHERE organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

-- Add trigger to update updated_at
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE goals IS 'Goal setting and progress tracking for revenue, deals, services, etc.';
COMMENT ON TABLE goal_progress IS 'Daily snapshots of goal progress for trend analysis';
COMMENT ON TABLE goal_recommendations IS 'AI-generated recommendations to help achieve goals';
COMMENT ON VIEW v_goals_dashboard IS 'Dashboard view with calculated goal metrics and pace status';
COMMENT ON FUNCTION update_goal_progress IS 'Updates goal current_value from actual data and creates progress snapshot';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
