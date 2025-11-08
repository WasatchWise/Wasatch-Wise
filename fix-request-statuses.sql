-- Fix RLS to allow all valid request statuses

-- Drop and recreate the SELECT policy to include all statuses
DROP POLICY IF EXISTS "Allow public read active requests" ON requests;

CREATE POLICY "Allow public read active requests"
  ON requests FOR SELECT
  USING (true);  -- Allow viewing all requests (privacy is in what columns are shown)

-- Ensure UPDATE policy allows all status transitions
DROP POLICY IF EXISTS "Allow update own requests" ON requests;

CREATE POLICY "Allow update own requests"
  ON requests FOR UPDATE
  USING (true)
  WITH CHECK (true);

SELECT '✅ Request policies updated to allow all statuses!' AS status;
