-- Create show submissions table for direct band-to-venue communication
-- Created: 2025-01-03

CREATE TABLE IF NOT EXISTS public.show_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id uuid REFERENCES public.bands(id) ON DELETE CASCADE NOT NULL,
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  
  -- Submission details
  proposed_date date,
  proposed_time time,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'counter_offer')),
  
  -- Response from venue
  venue_response text,
  counter_date date,
  counter_time time,
  
  -- Metadata
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  responded_at timestamptz
);

-- Enable RLS
ALTER TABLE public.show_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Bands can view their own submissions
CREATE POLICY "Bands can view their submissions"
  ON public.show_submissions FOR SELECT
  USING (
    band_id IN (
      SELECT id FROM public.bands WHERE claimed_by = auth.uid()
    )
  );

-- Venues can view submissions to their venue
CREATE POLICY "Venues can view submissions to their venue"
  ON public.show_submissions FOR SELECT
  USING (
    venue_id IN (
      SELECT id FROM public.venues WHERE claimed_by = auth.uid()
    )
  );

-- Bands can create submissions
CREATE POLICY "Bands can create submissions"
  ON public.show_submissions FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT id FROM public.bands WHERE claimed_by = auth.uid()
    )
  );

-- Venues can update submissions (respond)
CREATE POLICY "Venues can respond to submissions"
  ON public.show_submissions FOR UPDATE
  USING (
    venue_id IN (
      SELECT id FROM public.venues WHERE claimed_by = auth.uid()
    )
  )
  WITH CHECK (
    venue_id IN (
      SELECT id FROM public.venues WHERE claimed_by = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS show_submissions_band_id_idx ON public.show_submissions(band_id);
CREATE INDEX IF NOT EXISTS show_submissions_venue_id_idx ON public.show_submissions(venue_id);
CREATE INDEX IF NOT EXISTS show_submissions_status_idx ON public.show_submissions(status);
CREATE INDEX IF NOT EXISTS show_submissions_created_at_idx ON public.show_submissions(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER show_submissions_updated_at
  BEFORE UPDATE ON public.show_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Comments
COMMENT ON TABLE public.show_submissions IS 'Direct show submissions from bands to venues';
COMMENT ON COLUMN public.show_submissions.status IS 'pending, accepted, declined, or counter_offer';
COMMENT ON COLUMN public.show_submissions.counter_date IS 'Venue counter-offer date if status is counter_offer';

