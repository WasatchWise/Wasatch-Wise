-- Fix for check_feature_access function type mismatch
-- Run this to update the function without re-running the entire migration

DROP FUNCTION IF EXISTS check_feature_access(UUID, TEXT);

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
    RETURN QUERY SELECT true, 'Unlimited usage'::TEXT, NULL::INTEGER, NULL::INTEGER;
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
