-- Building-scoped revenue metrics for per-building attribution
-- Called by n8n Stripe webhook when metadata.building_id is present
-- Complements increment_daily_revenue (aggregate)

-- Generic function: upsert any metric by key, add amount (or set if new)
CREATE OR REPLACE FUNCTION upsert_revenue_metric(
  p_metric_key VARCHAR(100),
  p_amount_to_add NUMERIC,
  p_display_name VARCHAR(255) DEFAULT NULL,
  p_unit VARCHAR(50) DEFAULT 'USD',
  p_category VARCHAR(50) DEFAULT 'financial'
)
RETURNS void AS $$
BEGIN
  INSERT INTO city_metrics (metric_key, value, previous_value, trend, unit, category, display_name)
  VALUES (
    p_metric_key,
    p_amount_to_add,
    0,
    CASE WHEN p_amount_to_add > 0 THEN 'rising' WHEN p_amount_to_add < 0 THEN 'falling' ELSE 'stable' END,
    COALESCE(p_unit, 'USD'),
    COALESCE(p_category, 'financial'),
    COALESCE(p_display_name, p_metric_key)
  )
  ON CONFLICT (metric_key) DO UPDATE SET
    previous_value = city_metrics.value,
    value = city_metrics.value + p_amount_to_add,
    trend = CASE
      WHEN p_amount_to_add > 0 THEN 'rising'
      WHEN p_amount_to_add < 0 THEN 'falling'
      ELSE 'stable'
    END,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated and service role
GRANT EXECUTE ON FUNCTION upsert_revenue_metric(VARCHAR, NUMERIC, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_revenue_metric(VARCHAR, NUMERIC, VARCHAR, VARCHAR, VARCHAR) TO service_role;

-- Seed building-scoped revenue metrics (rows created on first Stripe payment with metadata)
-- These are optional - upsert_revenue_metric creates on first call
INSERT INTO city_metrics (metric_key, value, previous_value, trend, unit, category, display_name)
VALUES
  ('slctrips_revenue', 0, 0, 'stable', 'USD', 'financial', 'SLC Trips Revenue'),
  ('abya_revenue', 0, 0, 'stable', 'USD', 'financial', 'Ask Before You App Revenue'),
  ('rocksalt_revenue', 0, 0, 'stable', 'USD', 'financial', 'Rock Salt Revenue'),
  ('automation_mrr', 0, 0, 'stable', 'USD', 'financial', 'Automation Studio MRR'),
  ('pipelineiq_revenue', 0, 0, 'stable', 'USD', 'financial', 'Pipeline IQ Revenue')
ON CONFLICT (metric_key) DO NOTHING;
