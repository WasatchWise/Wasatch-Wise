-- Migration: Create educator_submissions table
-- Purpose: Store teacher-generated implementation ideas for TK-000
-- Date: 2025-10-29

CREATE TABLE IF NOT EXISTS public.educator_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Submitter Information
  name TEXT,
  email TEXT NOT NULL,

  -- Implementation Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  grade_level TEXT DEFAULT '4th Grade',
  duration TEXT,
  category TEXT DEFAULT 'Other',

  -- Status & Review
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  admin_notes TEXT,

  -- Metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_educator_submissions_status ON public.educator_submissions(status);
CREATE INDEX IF NOT EXISTS idx_educator_submissions_email ON public.educator_submissions(email);
CREATE INDEX IF NOT EXISTS idx_educator_submissions_created_at ON public.educator_submissions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.educator_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (submit)
CREATE POLICY "Anyone can submit educator implementations"
  ON public.educator_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Only approved submissions are publicly readable
CREATE POLICY "Only approved submissions are public"
  ON public.educator_submissions
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Policy: Service role can do anything (for admin review)
CREATE POLICY "Service role has full access"
  ON public.educator_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_educator_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_educator_submissions_timestamp ON public.educator_submissions;
CREATE TRIGGER update_educator_submissions_timestamp
  BEFORE UPDATE ON public.educator_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_educator_submissions_updated_at();

-- Grant permissions
GRANT SELECT ON public.educator_submissions TO anon, authenticated;
GRANT INSERT ON public.educator_submissions TO anon, authenticated;
GRANT ALL ON public.educator_submissions TO service_role;

-- Comment on table
COMMENT ON TABLE public.educator_submissions IS 'Stores teacher-generated implementation ideas for TK-000 educational resource';
