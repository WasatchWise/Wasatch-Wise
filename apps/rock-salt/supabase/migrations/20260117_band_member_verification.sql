-- Add verification columns to band_members for crowdsourced genealogy
-- When a band is claimed, the owner can add/verify members

-- Add columns for tracking who added and verified memberships
ALTER TABLE band_members
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS added_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS verified_by UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verification_count INT DEFAULT 0;

-- Add index for lookup by who added
CREATE INDEX IF NOT EXISTS idx_band_members_added_by ON band_members(added_by);

-- RLS policies for band_members
-- Anyone can read band members
DROP POLICY IF EXISTS "Anyone can view band members" ON band_members;
CREATE POLICY "Anyone can view band members" ON band_members
  FOR SELECT USING (true);

-- Band owners can insert members for their bands
DROP POLICY IF EXISTS "Band owners can add members" ON band_members;
CREATE POLICY "Band owners can add members" ON band_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bands
      WHERE bands.id = band_members.band_id
      AND bands.claimed_by = auth.uid()
    )
  );

-- Band owners can update members for their bands
DROP POLICY IF EXISTS "Band owners can update members" ON band_members;
CREATE POLICY "Band owners can update members" ON band_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM bands
      WHERE bands.id = band_members.band_id
      AND bands.claimed_by = auth.uid()
    )
  );

-- Band owners can delete members from their bands
DROP POLICY IF EXISTS "Band owners can delete members" ON band_members;
CREATE POLICY "Band owners can delete members" ON band_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM bands
      WHERE bands.id = band_members.band_id
      AND bands.claimed_by = auth.uid()
    )
  );

-- Function to verify a band membership (any logged-in user can vouch)
CREATE OR REPLACE FUNCTION verify_band_membership(
  p_band_id UUID,
  p_musician_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_current_verified_by UUID[];
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get current verified_by array
  SELECT verified_by INTO v_current_verified_by
  FROM band_members
  WHERE band_id = p_band_id AND musician_id = p_musician_id;

  -- Check if user already verified
  IF v_user_id = ANY(v_current_verified_by) THEN
    RETURN TRUE; -- Already verified
  END IF;

  -- Add user to verified_by array and increment count
  UPDATE band_members
  SET
    verified_by = array_append(verified_by, v_user_id),
    verification_count = verification_count + 1
  WHERE band_id = p_band_id AND musician_id = p_musician_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION verify_band_membership TO authenticated;

COMMENT ON COLUMN band_members.added_by IS 'User who added this membership';
COMMENT ON COLUMN band_members.verified_by IS 'Array of user IDs who have vouched for this connection';
COMMENT ON COLUMN band_members.verification_count IS 'Number of users who have verified this membership';
