-- ==========================================
-- FEEDBACK & CONTACT SUBMISSIONS
-- ==========================================
-- Allows visitors to submit feedback, questions, or suggestions

CREATE TABLE public.feedback_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  category       TEXT NOT NULL, -- 'general', 'question', 'suggestion', 'board', 'partnership', 'other'
  message        TEXT NOT NULL,
  user_id        UUID REFERENCES public.user_profiles (id), -- Optional: if logged in user
  ip_address     TEXT, -- For spam prevention
  status         TEXT NOT NULL DEFAULT 'new', -- 'new', 'reviewed', 'responded', 'archived'
  reviewed_by    UUID REFERENCES public.user_profiles (id),
  reviewed_at    TIMESTAMPTZ,
  notes          TEXT, -- Internal notes about the submission
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX feedback_submissions_category_idx ON public.feedback_submissions (category);
CREATE INDEX feedback_submissions_status_idx ON public.feedback_submissions (status);
CREATE INDEX feedback_submissions_created_at_idx ON public.feedback_submissions (created_at DESC);
CREATE INDEX feedback_submissions_user_id_idx ON public.feedback_submissions (user_id);

-- Enable RLS
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (submit feedback)
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback_submissions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can view feedback
CREATE POLICY "Admins can view feedback"
  ON public.feedback_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.site_memberships sm
      WHERE sm.user_id = auth.uid()
      AND sm.role = 'admin'
    )
  );

-- Policy: Only admins can update feedback
CREATE POLICY "Admins can update feedback"
  ON public.feedback_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.site_memberships sm
      WHERE sm.user_id = auth.uid()
      AND sm.role = 'admin'
    )
  );

COMMENT ON TABLE public.feedback_submissions IS 'Public feedback, questions, and suggestions from visitors';
COMMENT ON COLUMN public.feedback_submissions.category IS 'Type of submission: general, question, suggestion, board, partnership, other';
COMMENT ON COLUMN public.feedback_submissions.status IS 'Workflow status: new, reviewed, responded, archived';

