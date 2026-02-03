-- Amazon Associates revenue metrics (per-building attribution)
-- Used when reporting commission from Amazon reports by tracking ID.
-- Dashboard can query these for "Amazon Affiliate Revenue" view.

INSERT INTO city_metrics (metric_key, value, previous_value, trend, unit, category, display_name)
VALUES
  ('slctrips_amazon_revenue', 0, 0, 'stable', 'USD', 'financial', 'SLC Trips Amazon Revenue'),
  ('rocksalt_amazon_revenue', 0, 0, 'stable', 'USD', 'financial', 'Rock Salt Amazon Revenue'),
  ('academy_amazon_revenue', 0, 0, 'stable', 'USD', 'financial', 'Academy Amazon Revenue'),
  ('pipelineiq_amazon_revenue', 0, 0, 'stable', 'USD', 'financial', 'Pipeline IQ Amazon Revenue'),
  ('fanon_amazon_revenue', 0, 0, 'stable', 'USD', 'financial', 'Fanon Amazon Revenue')
ON CONFLICT (metric_key) DO NOTHING;
