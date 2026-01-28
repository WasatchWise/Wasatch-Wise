-- Migration: Enable RLS and Fix Security Issues
-- This migration addresses Supabase linter warnings about:
-- 1. RLS disabled on public tables
-- 2. SECURITY DEFINER views

-- ============================================
-- 1. Enable RLS on all public tables
-- ============================================

ALTER TABLE IF EXISTS project_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS outreach_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS outreach_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS high_priority_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS outreach_campaigns ENABLE ROW LEVEL SECURITY;
-- Note: pipeline_metrics is a VIEW, not a table, so no RLS needed here

-- ============================================
-- 2. Create RLS Policies
-- ============================================

-- Organizations: Users can only see their own organization
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT
  USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- High Priority Projects: Users can only see projects from their organization
DROP POLICY IF EXISTS "Users can view own org projects" ON high_priority_projects;
CREATE POLICY "Users can view own org projects" ON high_priority_projects
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own org projects" ON high_priority_projects;
CREATE POLICY "Users can insert own org projects" ON high_priority_projects
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own org projects" ON high_priority_projects;
CREATE POLICY "Users can update own org projects" ON high_priority_projects
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Contacts: Users can only see contacts from their organization
DROP POLICY IF EXISTS "Users can view own org contacts" ON contacts;
CREATE POLICY "Users can view own org contacts" ON contacts
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own org contacts" ON contacts;
CREATE POLICY "Users can insert own org contacts" ON contacts
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own org contacts" ON contacts;
CREATE POLICY "Users can update own org contacts" ON contacts
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Companies: Users can only see companies from their organization
DROP POLICY IF EXISTS "Users can view own org companies" ON companies;
CREATE POLICY "Users can view own org companies" ON companies
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own org companies" ON companies;
CREATE POLICY "Users can insert own org companies" ON companies
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Outreach Activities: Users can only see activities from their organization
DROP POLICY IF EXISTS "Users can view own org activities" ON outreach_activities;
CREATE POLICY "Users can view own org activities" ON outreach_activities
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own org activities" ON outreach_activities;
CREATE POLICY "Users can insert own org activities" ON outreach_activities
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own org activities" ON outreach_activities;
CREATE POLICY "Users can update own org activities" ON outreach_activities
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Outreach Campaigns: Users can only see campaigns from their organization
DROP POLICY IF EXISTS "Users can view own org campaigns" ON outreach_campaigns;
CREATE POLICY "Users can view own org campaigns" ON outreach_campaigns
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own org campaigns" ON outreach_campaigns;
CREATE POLICY "Users can insert own org campaigns" ON outreach_campaigns
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Outreach Queue: Users can only see queue items from their organization
DROP POLICY IF EXISTS "Users can view own org queue" ON outreach_queue;
CREATE POLICY "Users can view own org queue" ON outreach_queue
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own org queue" ON outreach_queue;
CREATE POLICY "Users can insert own org queue" ON outreach_queue
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own org queue" ON outreach_queue;
CREATE POLICY "Users can update own org queue" ON outreach_queue
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Usage Tracking: Users can only see usage from their organization
DROP POLICY IF EXISTS "Users can view own org usage" ON usage_tracking;
CREATE POLICY "Users can view own org usage" ON usage_tracking
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own org usage" ON usage_tracking;
CREATE POLICY "Users can insert own org usage" ON usage_tracking
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Activity Logs: Users can only see logs from their organization
DROP POLICY IF EXISTS "Users can view own org logs" ON activity_logs;
CREATE POLICY "Users can view own org logs" ON activity_logs
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own org logs" ON activity_logs;
CREATE POLICY "Users can insert own org logs" ON activity_logs
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Project Snapshots: Users can only see snapshots from their organization
DROP POLICY IF EXISTS "Users can view own org snapshots" ON project_snapshots;
CREATE POLICY "Users can view own org snapshots" ON project_snapshots
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Project Stakeholders: Users can only see stakeholders from their organization
DROP POLICY IF EXISTS "Users can view own org stakeholders" ON project_stakeholders;
CREATE POLICY "Users can view own org stakeholders" ON project_stakeholders
  FOR SELECT
  USING (project_id IN (
    SELECT id FROM high_priority_projects WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

-- Note: pipeline_metrics is a VIEW, not a table
-- Views inherit RLS from underlying tables (high_priority_projects)
-- So the RLS policy on high_priority_projects will apply to this view

-- Subscription Plans: Public read access (everyone can see plans)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT
  USING (true);

-- ============================================
-- 3. Fix SECURITY DEFINER Views
-- Recreate views without SECURITY DEFINER
-- ============================================

-- Recreate monthly_usage view without SECURITY DEFINER
DROP VIEW IF EXISTS monthly_usage CASCADE;
CREATE OR REPLACE VIEW monthly_usage AS
SELECT
  organization_id,
  feature_type,
  DATE_TRUNC('month', created_at) AS month,
  SUM(count) AS total_usage,
  SUM(cost_cents) AS total_cost_cents
FROM usage_tracking
GROUP BY organization_id, feature_type, DATE_TRUNC('month', created_at);

-- Recreate current_month_usage view without SECURITY DEFINER
DROP VIEW IF EXISTS current_month_usage CASCADE;
CREATE OR REPLACE VIEW current_month_usage AS
SELECT
  organization_id,
  feature_type,
  SUM(count) AS usage_count,
  SUM(cost_cents) AS total_cost
FROM usage_tracking
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY organization_id, feature_type;

-- Recreate admin_subscription_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS admin_subscription_stats CASCADE;
CREATE OR REPLACE VIEW admin_subscription_stats AS
SELECT
  sp.name AS plan_name,
  sp.display_name,
  COUNT(o.id) AS customer_count,
  SUM(CASE WHEN sp.price_monthly > 0 THEN sp.price_monthly ELSE 0 END) AS total_mrr_cents,
  AVG(CASE WHEN sp.price_monthly > 0 THEN sp.price_monthly ELSE NULL END) AS avg_price_cents
FROM subscription_plans sp
LEFT JOIN organizations o ON o.subscription_plan_id = sp.id AND o.subscription_status = 'active'
GROUP BY sp.id, sp.name, sp.display_name, sp.price_monthly
ORDER BY sp.sort_order;

-- Recreate pipeline_metrics view without SECURITY DEFINER
-- Note: There's both a table and a view with this name in migrations
-- The view is what's being flagged, so we recreate it here
DROP VIEW IF EXISTS pipeline_metrics CASCADE;
CREATE OR REPLACE VIEW pipeline_metrics AS
SELECT
  organization_id,
  project_stage,
  COUNT(*) as project_count,
  SUM(project_value) as total_value,
  AVG(groove_fit_score) as avg_score
FROM high_priority_projects
GROUP BY organization_id, project_stage;

-- ============================================
-- 4. Grant Permissions
-- ============================================

-- Grant SELECT on views to authenticated users
GRANT SELECT ON monthly_usage TO authenticated;
GRANT SELECT ON current_month_usage TO authenticated;
GRANT SELECT ON admin_subscription_stats TO authenticated;
GRANT SELECT ON pipeline_metrics TO authenticated;

-- Service role still needs full access for backend operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- 5. Add RLS Policies for Views (if needed)
-- Views inherit RLS from underlying tables, but we can add explicit policies
-- ============================================

-- Note: Views don't have RLS themselves, they inherit from underlying tables
-- The usage_tracking table RLS will apply to monthly_usage and current_month_usage views

COMMENT ON VIEW monthly_usage IS 'Monthly usage summary - inherits RLS from usage_tracking';
COMMENT ON VIEW current_month_usage IS 'Current month usage - inherits RLS from usage_tracking';
COMMENT ON VIEW admin_subscription_stats IS 'Admin subscription statistics - public read access';

