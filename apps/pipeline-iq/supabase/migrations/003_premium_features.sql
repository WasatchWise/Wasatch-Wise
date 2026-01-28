-- Premium Features & Billing System
-- Run this migration to add subscription tiers and usage tracking

-- 1. Subscription Plans Table
-- Drop and recreate to ensure clean state
DROP TABLE IF EXISTS subscription_plans CASCADE;

CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY, -- Using TEXT to match common pattern
  name TEXT NOT NULL UNIQUE, -- 'free', 'pro', 'premium', 'enterprise', 'god_mode'
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0, -- in cents
  price_yearly INTEGER, -- annual pricing
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add subscription fields to organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS subscription_plan_id TEXT REFERENCES subscription_plans(id),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active', -- active, past_due, canceled, trialing
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Usage Tracking Table
-- Drop and recreate to ensure clean state
DROP TABLE IF EXISTS usage_tracking CASCADE;

CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  feature_type TEXT NOT NULL, -- 'ai_enrichment', 'video_generation', 'email_sent', 'api_call'
  count INTEGER DEFAULT 1,
  cost_cents INTEGER DEFAULT 0, -- track actual costs
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_org_feature ON usage_tracking(organization_id, feature_type);
CREATE INDEX IF NOT EXISTS idx_usage_created_at ON usage_tracking(created_at);
-- Simplified index without function - queries will still be fast
CREATE INDEX IF NOT EXISTS idx_usage_org_date ON usage_tracking(organization_id, created_at);

-- 5. Monthly usage summary view
CREATE OR REPLACE VIEW monthly_usage AS
SELECT
  organization_id,
  feature_type,
  DATE_TRUNC('month', created_at) AS month,
  SUM(count) AS total_usage,
  SUM(cost_cents) AS total_cost_cents
FROM usage_tracking
GROUP BY organization_id, feature_type, DATE_TRUNC('month', created_at);

-- 6. Current month usage view (for quick limit checks)
CREATE OR REPLACE VIEW current_month_usage AS
SELECT
  organization_id,
  feature_type,
  SUM(count) AS usage_count,
  SUM(cost_cents) AS total_cost
FROM usage_tracking
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY organization_id, feature_type;

-- 7. Add god mode flag to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_god_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 8. Insert default subscription plans
INSERT INTO subscription_plans (id, name, display_name, description, price_monthly, price_yearly, features, limits, sort_order) VALUES
(
  'plan_free',
  'free',
  'Starter',
  'Get started with basic features',
  0,
  0,
  '{"ai_enrichment": false, "ai_email_generation": false, "video_generation": false, "api_access": false, "custom_branding": false, "priority_support": false}',
  '{"projects": 100, "users": 1, "ai_enrichments": 0, "videos": 0, "emails": 100, "api_calls": 0}',
  1
),
(
  'plan_pro',
  'pro',
  'Professional',
  'AI-powered sales intelligence',
  9900, -- $99.00
  95040, -- $950/year (20% discount)
  '{"ai_enrichment": true, "ai_email_generation": true, "video_generation": false, "api_access": true, "custom_branding": false, "priority_support": false}',
  '{"projects": 1000, "users": 5, "ai_enrichments": 500, "videos": 0, "emails": 5000, "api_calls": 1000}',
  2
),
(
  'plan_premium',
  'premium',
  'Premium',
  'Everything + AI video outreach',
  29900, -- $299.00
  287040, -- $2,870/year (20% discount)
  '{"ai_enrichment": true, "ai_email_generation": true, "video_generation": true, "api_access": true, "custom_branding": false, "priority_support": true}',
  '{"projects": 5000, "users": 15, "ai_enrichments": 2500, "videos": 50, "emails": 25000, "api_calls": 10000}',
  3
),
(
  'plan_enterprise',
  'enterprise',
  'Enterprise',
  'Unlimited everything + white-label',
  150000, -- $1,500+ (starting price)
  NULL, -- custom pricing
  '{"ai_enrichment": true, "ai_email_generation": true, "video_generation": true, "api_access": true, "custom_branding": true, "priority_support": true, "dedicated_support": true}',
  '{"projects": null, "users": null, "ai_enrichments": null, "videos": null, "emails": null, "api_calls": null}',
  4
),
(
  'plan_god_mode',
  'god_mode',
  'God Mode',
  'Founder/Admin - Unlimited Everything',
  0, -- Free for admins
  0,
  '{"ai_enrichment": true, "ai_email_generation": true, "video_generation": true, "api_access": true, "custom_branding": true, "priority_support": true, "admin_panel": true, "view_all_orgs": true, "override_limits": true}',
  '{"projects": null, "users": null, "ai_enrichments": null, "videos": null, "emails": null, "api_calls": null}',
  99
)
ON CONFLICT (name) DO NOTHING;

-- 9. Set Groove Technologies to god_mode
UPDATE organizations
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'god_mode')
WHERE id = '34249404-774f-4b80-b346-a2d9e6322584';

-- 10. Set Mike Sartain as god mode user
UPDATE users
SET is_god_mode = true
WHERE email = 'msartain@getgrooven.com';

-- 11. Set default free plan for organizations without subscription
UPDATE organizations
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'free')
WHERE subscription_plan_id IS NULL;

-- 12. Function to check feature access
CREATE OR REPLACE FUNCTION check_feature_access(
  p_organization_id UUID,
  p_feature_type TEXT
) RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  current_usage INTEGER,
  limit_value INTEGER
) AS $$
DECLARE
  v_plan_features JSONB;
  v_plan_limits JSONB;
  v_feature_enabled BOOLEAN;
  v_limit INTEGER;
  v_usage INTEGER;
BEGIN
  -- Get organization's plan features and limits
  SELECT sp.features, sp.limits
  INTO v_plan_features, v_plan_limits
  FROM organizations o
  JOIN subscription_plans sp ON o.subscription_plan_id = sp.id
  WHERE o.id = p_organization_id;

  -- Check if feature is enabled in plan
  v_feature_enabled := COALESCE((v_plan_features->p_feature_type)::BOOLEAN, false);

  IF NOT v_feature_enabled THEN
    RETURN QUERY SELECT false, 'Feature not included in your plan'::TEXT, 0::INTEGER, 0::INTEGER;
    RETURN;
  END IF;

  -- Get limit for this feature
  v_limit := (v_plan_limits->>p_feature_type)::INTEGER;

  -- NULL limit means unlimited
  IF v_limit IS NULL THEN
    RETURN QUERY SELECT true, 'Unlimited usage', NULL::INTEGER, NULL::INTEGER;
    RETURN;
  END IF;

  -- Get current month's usage
  SELECT COALESCE(SUM(count), 0)::INTEGER
  INTO v_usage
  FROM usage_tracking
  WHERE organization_id = p_organization_id
    AND feature_type = p_feature_type
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE);

  -- Check if under limit
  IF v_usage < v_limit THEN
    RETURN QUERY SELECT true, 'Within limits'::TEXT, v_usage::INTEGER, v_limit::INTEGER;
  ELSE
    RETURN QUERY SELECT false, 'Monthly limit reached'::TEXT, v_usage::INTEGER, v_limit::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 13. Function to track usage
CREATE OR REPLACE FUNCTION track_usage(
  p_organization_id UUID,
  p_user_id UUID,
  p_feature_type TEXT,
  p_count INTEGER DEFAULT 1,
  p_cost_cents INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO usage_tracking (
    organization_id,
    user_id,
    feature_type,
    count,
    cost_cents,
    metadata
  ) VALUES (
    p_organization_id,
    p_user_id,
    p_feature_type,
    p_count,
    p_cost_cents,
    p_metadata
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- 14. Create admin stats view
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

-- 15. Grant appropriate permissions
GRANT SELECT ON subscription_plans TO authenticated;
GRANT SELECT ON monthly_usage TO authenticated;
GRANT SELECT ON current_month_usage TO authenticated;
GRANT SELECT, INSERT ON usage_tracking TO authenticated;

-- God mode users can see everything
GRANT SELECT ON admin_subscription_stats TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

COMMENT ON TABLE subscription_plans IS 'Defines subscription tiers and their features';
COMMENT ON TABLE usage_tracking IS 'Tracks feature usage for billing and limits';
COMMENT ON VIEW current_month_usage IS 'Quick view of current month usage for limit checks';
COMMENT ON FUNCTION check_feature_access IS 'Checks if organization can use a feature';
COMMENT ON FUNCTION track_usage IS 'Records feature usage for an organization';
