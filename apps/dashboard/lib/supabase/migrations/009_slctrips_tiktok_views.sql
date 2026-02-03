-- TikTok Views Sync: seed metric + RPC to SET value (not add)
-- n8n workflow: TikTok API or manual → set_metric_value('slctrips_tiktok_views', views)

-- RPC: set metric to absolute value (for views, followers, etc.)
CREATE OR REPLACE FUNCTION set_metric_value(
  p_metric_key VARCHAR(100),
  p_value NUMERIC,
  p_display_name VARCHAR(255) DEFAULT NULL,
  p_unit VARCHAR(50) DEFAULT 'count',
  p_category VARCHAR(50) DEFAULT 'engagement'
)
RETURNS void AS $$
BEGIN
  INSERT INTO city_metrics (metric_key, value, previous_value, trend, unit, category, display_name)
  VALUES (
    p_metric_key,
    p_value,
    COALESCE((SELECT value FROM city_metrics WHERE metric_key = p_metric_key), 0),
    'stable',
    COALESCE(p_unit, 'count'),
    COALESCE(p_category, 'engagement'),
    COALESCE(p_display_name, p_metric_key)
  )
  ON CONFLICT (metric_key) DO UPDATE SET
    previous_value = city_metrics.value,
    value = p_value,
    trend = CASE WHEN p_value > city_metrics.value THEN 'rising' WHEN p_value < city_metrics.value THEN 'falling' ELSE 'stable' END,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_metric_value(VARCHAR, NUMERIC, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION set_metric_value(VARCHAR, NUMERIC, VARCHAR, VARCHAR, VARCHAR) TO service_role;

-- Seed so dashboard shows the gauge even before first run
INSERT INTO city_metrics (metric_key, value, previous_value, trend, unit, category, display_name)
VALUES (
  'slctrips_tiktok_views',
  0,
  0,
  'stable',
  'count',
  'engagement',
  'SLC Trips TikTok Views'
)
ON CONFLICT (metric_key) DO NOTHING;
