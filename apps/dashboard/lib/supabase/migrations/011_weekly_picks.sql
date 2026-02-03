-- Weekly Picks Table – drives "This Week's Picks" on SLC Trips landing page
-- Written by n8n Utah Conditions Monitor; read by slctrips.com
-- Created: February 2, 2026

CREATE TABLE IF NOT EXISTS weekly_picks (
  id SERIAL PRIMARY KEY,
  mode VARCHAR(50) NOT NULL,
  content_angle TEXT NOT NULL,
  weather_temp INTEGER,
  weather_conditions VARCHAR(100),
  recommendations JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_weekly_picks_active ON weekly_picks(is_active, created_at DESC);

COMMENT ON TABLE weekly_picks IS 'Active “This Week''s Picks” from Utah Conditions Monitor; one row is_active=true at a time';
