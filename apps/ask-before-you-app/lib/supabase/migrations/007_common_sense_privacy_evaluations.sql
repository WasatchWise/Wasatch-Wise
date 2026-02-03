-- ============================================================================
-- Common Sense Media privacy evaluations (scraped / imported from CSV)
-- Table matches privacy.csv columns: evaluation URL, thumbnail, title,
-- updated-date, tier icon, tier label (Warning/Pass/Fail/Seal), tier score.
-- ============================================================================

CREATE TABLE IF NOT EXISTS common_sense_privacy_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_url text NOT NULL UNIQUE,
  thumbnail_url text,
  title text NOT NULL,
  updated_date_raw text,
  tier_icon_url text,
  tier_label text NOT NULL,
  tier_score text,
  source text DEFAULT 'common_sense_media',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_common_sense_eval_title ON common_sense_privacy_evaluations(title);
CREATE INDEX IF NOT EXISTS idx_common_sense_eval_tier ON common_sense_privacy_evaluations(tier_label);
CREATE INDEX IF NOT EXISTS idx_common_sense_eval_source ON common_sense_privacy_evaluations(source);

COMMENT ON TABLE common_sense_privacy_evaluations IS 'Common Sense Media privacy evaluations; imported from scraped CSV (privacy.csv).';
