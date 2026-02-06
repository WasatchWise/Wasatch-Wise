-- App review requests (free "suggest an app" form on /request)
-- Not paid app_reviews; these are community suggestions for prioritization.

CREATE TABLE IF NOT EXISTS app_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  role text,
  organization text,
  app_name text NOT NULL,
  app_url text,
  reason text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_requests_created_at ON app_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_requests_email ON app_requests(email);

COMMENT ON TABLE app_requests IS 'Free "suggest an app for review" submissions from /request (Ask Before You App)';

-- RLS: allow anonymous insert for form submission; service role for read/update/delete
ALTER TABLE app_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit app request" ON app_requests;
CREATE POLICY "Anyone can submit app request"
  ON app_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage app requests" ON app_requests;
CREATE POLICY "Service role can manage app requests"
  ON app_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
