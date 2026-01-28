-- Ask Before You App - App Review System
-- Migration: 006_ask_before_you_app.sql

-- App Review Submissions
CREATE TABLE IF NOT EXISTS app_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text,
  customer_role text, -- parent, teacher, tech_coordinator
  app_name text NOT NULL,
  app_url text,
  app_category text, -- educational, productivity, communication, etc.
  review_tier text NOT NULL CHECK (review_tier IN ('basic', 'standard', 'premium')),
  price_paid_cents integer NOT NULL, -- Store in cents (4900 = $49)
  stripe_payment_intent_id text UNIQUE,
  stripe_customer_id text,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_progress', 'reviewing', 'completed', 'cancelled')),
  submitted_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Review Findings (the actual review data)
CREATE TABLE IF NOT EXISTS review_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES app_reviews(id) ON DELETE CASCADE NOT NULL,
  finding_type text NOT NULL CHECK (finding_type IN ('privacy', 'compliance', 'ai_detection', 'bias', 'security', 'data_practices')),
  severity text CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title text NOT NULL,
  description text NOT NULL,
  evidence text, -- URLs, screenshots, policy quotes
  recommendation text,
  created_at timestamptz DEFAULT now()
);

-- Review Reports (generated PDFs)
CREATE TABLE IF NOT EXISTS review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES app_reviews(id) ON DELETE CASCADE NOT NULL UNIQUE,
  report_url text, -- URL to generated PDF in storage
  report_version integer DEFAULT 1,
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Review Notes (internal notes during review process)
CREATE TABLE IF NOT EXISTS review_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES app_reviews(id) ON DELETE CASCADE NOT NULL,
  note_text text NOT NULL,
  created_by text, -- email or system
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_reviews_customer_email ON app_reviews(customer_email);
CREATE INDEX IF NOT EXISTS idx_app_reviews_status ON app_reviews(status);
CREATE INDEX IF NOT EXISTS idx_app_reviews_stripe_payment_intent ON app_reviews(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_review_findings_review_id ON review_findings(review_id);
CREATE INDEX IF NOT EXISTS idx_review_findings_type ON review_findings(finding_type);
CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_app_reviews_updated_at ON app_reviews;
CREATE TRIGGER update_app_reviews_updated_at
  BEFORE UPDATE ON app_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_notes ENABLE ROW LEVEL SECURITY;

-- Public can create reviews (after payment)
DROP POLICY IF EXISTS "Anyone can create app reviews" ON app_reviews;
CREATE POLICY "Anyone can create app reviews"
  ON app_reviews FOR INSERT
  WITH CHECK (true);

-- Users can read their own reviews
DROP POLICY IF EXISTS "Users can read their own reviews" ON app_reviews;
CREATE POLICY "Users can read their own reviews"
  ON app_reviews FOR SELECT
  USING (customer_email = (auth.jwt()->>'email') OR customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Service role can manage all reviews
DROP POLICY IF EXISTS "Service role can manage all reviews" ON app_reviews;
CREATE POLICY "Service role can manage all reviews"
  ON app_reviews FOR ALL
  USING (auth.role() = 'service_role');

-- Review findings: Users can read findings for their reviews
DROP POLICY IF EXISTS "Users can read findings for their reviews" ON review_findings;
CREATE POLICY "Users can read findings for their reviews"
  ON review_findings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_reviews
      WHERE app_reviews.id = review_findings.review_id
      AND (app_reviews.customer_email = (auth.jwt()->>'email') OR auth.role() = 'service_role')
    )
  );

-- Service role can manage all findings
DROP POLICY IF EXISTS "Service role can manage all findings" ON review_findings;
CREATE POLICY "Service role can manage all findings"
  ON review_findings FOR ALL
  USING (auth.role() = 'service_role');

-- Review reports: Users can read reports for their reviews
DROP POLICY IF EXISTS "Users can read reports for their reviews" ON review_reports;
CREATE POLICY "Users can read reports for their reviews"
  ON review_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_reviews
      WHERE app_reviews.id = review_reports.review_id
      AND (app_reviews.customer_email = (auth.jwt()->>'email') OR auth.role() = 'service_role')
    )
  );

-- Service role can manage all reports
DROP POLICY IF EXISTS "Service role can manage all reports" ON review_reports;
CREATE POLICY "Service role can manage all reports"
  ON review_reports FOR ALL
  USING (auth.role() = 'service_role');

-- Review notes: Service role only (internal notes)
DROP POLICY IF EXISTS "Service role can manage review notes" ON review_notes;
CREATE POLICY "Service role can manage review notes"
  ON review_notes FOR ALL
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE app_reviews IS 'App review submissions from Ask Before You App';
COMMENT ON TABLE review_findings IS 'Individual findings from app reviews (privacy, compliance, AI, bias, etc.)';
COMMENT ON TABLE review_reports IS 'Generated PDF reports for completed reviews';
COMMENT ON TABLE review_notes IS 'Internal notes during review process';
