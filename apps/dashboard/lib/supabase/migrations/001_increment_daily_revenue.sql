-- Function to increment daily_revenue gauge
-- Called by n8n Stripe webhook workflow

CREATE OR REPLACE FUNCTION increment_daily_revenue(amount_to_add NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE city_metrics
  SET
    previous_value = value,
    value = value + amount_to_add,
    trend = CASE
      WHEN amount_to_add > 0 THEN 'rising'
      WHEN amount_to_add < 0 THEN 'falling'
      ELSE 'stable'
    END,
    last_updated = NOW()
  WHERE metric_key = 'daily_revenue';

  -- If row doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO city_metrics (metric_key, value, previous_value, trend, unit, category, display_name)
    VALUES ('daily_revenue', amount_to_add, 0, 'rising', 'USD', 'financial', 'Revenue (24h)');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated and service role
GRANT EXECUTE ON FUNCTION increment_daily_revenue(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_daily_revenue(NUMERIC) TO service_role;
