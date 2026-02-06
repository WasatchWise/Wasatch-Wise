-- Utah Agreements: vendor/product DPA registry (Dynamic Menu CSV)
-- Idempotent: safe when table already exists (e.g. from CSV import with different schema).

-- 1) Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS utah_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text,
  product text,
  originator text,
  type text,
  status text,
  expiration_notes text,
  date_approved date,
  expires_on date,
  created_at timestamptz DEFAULT now()
);

-- 2) Add any missing columns if the table already existed (e.g. created by CSV import)
ALTER TABLE utah_agreements ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE utah_agreements ADD COLUMN IF NOT EXISTS product text;
ALTER TABLE utah_agreements ADD COLUMN IF NOT EXISTS originator text;
ALTER TABLE utah_agreements ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE utah_agreements ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE utah_agreements ADD COLUMN IF NOT EXISTS expiration_notes text;
ALTER TABLE utah_agreements ADD COLUMN IF NOT EXISTS date_approved date;
ALTER TABLE utah_agreements ADD COLUMN IF NOT EXISTS expires_on date;
ALTER TABLE utah_agreements ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3) Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_utah_agreements_company ON utah_agreements(company);
CREATE INDEX IF NOT EXISTS idx_utah_agreements_product ON utah_agreements(product);
CREATE INDEX IF NOT EXISTS idx_utah_agreements_originator ON utah_agreements(originator);
CREATE INDEX IF NOT EXISTS idx_utah_agreements_status ON utah_agreements(status);
CREATE INDEX IF NOT EXISTS idx_utah_agreements_expires_on ON utah_agreements(expires_on);

COMMENT ON TABLE utah_agreements IS 'Utah USPA Agreement Hub - vendor/product DPA registry (Dynamic Menu CSV)';

-- 4) RLS (idempotent)
ALTER TABLE utah_agreements ENABLE ROW LEVEL SECURITY;

-- 5) Policies (drop first so re-run doesn't fail)
DROP POLICY IF EXISTS "Allow read for anon and authenticated" ON utah_agreements;
CREATE POLICY "Allow read for anon and authenticated"
  ON utah_agreements FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role full access" ON utah_agreements;
CREATE POLICY "Service role full access"
  ON utah_agreements FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
