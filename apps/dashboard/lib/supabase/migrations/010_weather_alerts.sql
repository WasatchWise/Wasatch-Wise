-- Weather Alerts Table for Utah Conditions Engine
-- Logs weather conditions, air quality, and activity recommendations
-- Created: February 2, 2026

CREATE TABLE IF NOT EXISTS weather_alerts (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  mode VARCHAR(50) NOT NULL,
  temp INTEGER,
  conditions VARCHAR(100),
  aqi INTEGER,
  content_angle TEXT,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying recent alerts
CREATE INDEX idx_weather_alerts_timestamp ON weather_alerts(timestamp DESC);
CREATE INDEX idx_weather_alerts_mode ON weather_alerts(mode);
CREATE INDEX idx_weather_alerts_urgency ON weather_alerts((recommendations->>'urgency'));

-- Add comment
COMMENT ON TABLE weather_alerts IS 'Utah Conditions Monitor - Weather, air quality, and activity recommendations logged every 6 hours';

-- Sample query to get latest alert
-- SELECT * FROM weather_alerts ORDER BY timestamp DESC LIMIT 1;

-- Sample query to get all powder day alerts
-- SELECT * FROM weather_alerts WHERE mode = 'POWDER_DAY' ORDER BY timestamp DESC;

-- Sample query to get high urgency alerts from last 7 days
-- SELECT * FROM weather_alerts 
-- WHERE timestamp > NOW() - INTERVAL '7 days' 
-- AND (mode IN ('POWDER_DAY', 'EXTREME_HEAT', 'HAZARD'))
-- ORDER BY timestamp DESC;
