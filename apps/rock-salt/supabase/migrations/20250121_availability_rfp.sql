-- Availability and RFP System for Bands and Venues
-- Created: 2025-01-21

-- ============================================
-- BAND AVAILABILITY
-- Bands mark dates they're available to play
-- ============================================
CREATE TABLE IF NOT EXISTS public.band_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id uuid REFERENCES public.bands(id) ON DELETE CASCADE NOT NULL,

  -- Date range
  start_date date NOT NULL,
  end_date date NOT NULL,

  -- Details
  notes text,
  preferred_venue_types text[], -- ['club', 'bar', 'theater', 'festival']
  willing_to_travel boolean DEFAULT true,
  max_travel_miles integer,

  -- Compensation preferences
  min_guarantee integer, -- minimum pay in dollars
  door_deal_ok boolean DEFAULT true,

  -- Status
  is_booked boolean DEFAULT false,

  -- Metadata
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- ============================================
-- VENUE OPEN SLOTS
-- Venues mark dates they need bands
-- ============================================
CREATE TABLE IF NOT EXISTS public.venue_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,

  -- Date/time
  slot_date date NOT NULL,
  load_in_time time,
  set_time time,
  set_length_minutes integer, -- e.g., 45, 60, 90

  -- Details
  title text, -- e.g., "Friday Night Rock Show", "Open Mic Host"
  description text,
  preferred_genres text[],

  -- Compensation
  compensation_type text CHECK (compensation_type IN ('guarantee', 'door_split', 'tips_only', 'negotiable')),
  guarantee_amount integer,
  door_split_percentage integer, -- e.g., 80 for 80% to band

  -- Requirements
  expected_draw integer, -- how many people venue expects band to bring
  backline_provided boolean DEFAULT false,
  sound_engineer_provided boolean DEFAULT true,
  age_restriction text CHECK (age_restriction IN ('all_ages', '18+', '21+')),

  -- Status
  status text DEFAULT 'open' CHECK (status IN ('open', 'pending', 'booked', 'cancelled')),
  booked_band_id uuid REFERENCES public.bands(id) ON DELETE SET NULL,

  -- Metadata
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- BOOKING OPPORTUNITIES (RFP System)
-- Either bands or venues can post opportunities
-- ============================================
CREATE TABLE IF NOT EXISTS public.booking_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who posted it
  posted_by_type text NOT NULL CHECK (posted_by_type IN ('band', 'venue')),
  band_id uuid REFERENCES public.bands(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,

  -- Basic info
  title text NOT NULL,
  description text,

  -- Date range they're looking for
  date_flexible boolean DEFAULT false,
  specific_date date,
  date_range_start date,
  date_range_end date,

  -- For band-posted (looking for venue)
  preferred_cities text[],
  preferred_venue_types text[],
  expected_draw integer,

  -- For venue-posted (looking for band)
  preferred_genres text[],
  compensation_details text,

  -- Status
  status text DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled', 'expired')),
  expires_at timestamptz,

  -- Metadata
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure either band_id or venue_id is set based on type
  CONSTRAINT valid_poster CHECK (
    (posted_by_type = 'band' AND band_id IS NOT NULL AND venue_id IS NULL) OR
    (posted_by_type = 'venue' AND venue_id IS NOT NULL AND band_id IS NULL)
  )
);

-- ============================================
-- OPPORTUNITY APPLICATIONS
-- Responses to booking opportunities
-- ============================================
CREATE TABLE IF NOT EXISTS public.opportunity_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES public.booking_opportunities(id) ON DELETE CASCADE NOT NULL,

  -- Who's applying
  applicant_type text NOT NULL CHECK (applicant_type IN ('band', 'venue')),
  band_id uuid REFERENCES public.bands(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,

  -- Application details
  message text,
  proposed_date date,
  proposed_compensation text,

  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),

  -- Response
  response_message text,
  responded_at timestamptz,

  -- Metadata
  applied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),

  -- Ensure correct applicant type (opposite of poster)
  CONSTRAINT valid_applicant CHECK (
    (applicant_type = 'band' AND band_id IS NOT NULL AND venue_id IS NULL) OR
    (applicant_type = 'venue' AND venue_id IS NOT NULL AND band_id IS NULL)
  ),

  -- Prevent duplicate applications
  UNIQUE(opportunity_id, band_id),
  UNIQUE(opportunity_id, venue_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.band_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;

-- BAND AVAILABILITY POLICIES
-- Anyone can view (for discovery)
CREATE POLICY "Anyone can view band availability"
  ON public.band_availability FOR SELECT
  USING (true);

-- Band owners can manage their availability
CREATE POLICY "Band owners can insert availability"
  ON public.band_availability FOR INSERT
  WITH CHECK (
    band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
  );

CREATE POLICY "Band owners can update availability"
  ON public.band_availability FOR UPDATE
  USING (band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid()))
  WITH CHECK (band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid()));

CREATE POLICY "Band owners can delete availability"
  ON public.band_availability FOR DELETE
  USING (band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid()));

-- VENUE SLOTS POLICIES
-- Anyone can view open slots
CREATE POLICY "Anyone can view venue slots"
  ON public.venue_slots FOR SELECT
  USING (true);

-- Venue owners can manage their slots
CREATE POLICY "Venue owners can insert slots"
  ON public.venue_slots FOR INSERT
  WITH CHECK (
    venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid())
  );

CREATE POLICY "Venue owners can update slots"
  ON public.venue_slots FOR UPDATE
  USING (venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid()))
  WITH CHECK (venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid()));

CREATE POLICY "Venue owners can delete slots"
  ON public.venue_slots FOR DELETE
  USING (venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid()));

-- BOOKING OPPORTUNITIES POLICIES
-- Anyone can view open opportunities
CREATE POLICY "Anyone can view opportunities"
  ON public.booking_opportunities FOR SELECT
  USING (true);

-- Bands can post opportunities
CREATE POLICY "Bands can post opportunities"
  ON public.booking_opportunities FOR INSERT
  WITH CHECK (
    (posted_by_type = 'band' AND band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid()))
    OR
    (posted_by_type = 'venue' AND venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid()))
  );

-- Owners can update their opportunities
CREATE POLICY "Owners can update opportunities"
  ON public.booking_opportunities FOR UPDATE
  USING (
    (posted_by_type = 'band' AND band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid()))
    OR
    (posted_by_type = 'venue' AND venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid()))
  );

-- OPPORTUNITY APPLICATIONS POLICIES
-- Poster can view applications to their opportunities
CREATE POLICY "Poster can view applications"
  ON public.opportunity_applications FOR SELECT
  USING (
    opportunity_id IN (
      SELECT id FROM public.booking_opportunities
      WHERE (posted_by_type = 'band' AND band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid()))
         OR (posted_by_type = 'venue' AND venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid()))
    )
  );

-- Applicants can view their own applications
CREATE POLICY "Applicants can view own applications"
  ON public.opportunity_applications FOR SELECT
  USING (
    (applicant_type = 'band' AND band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid()))
    OR
    (applicant_type = 'venue' AND venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid()))
  );

-- Bands/venues can apply to opportunities
CREATE POLICY "Can apply to opportunities"
  ON public.opportunity_applications FOR INSERT
  WITH CHECK (
    (applicant_type = 'band' AND band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid()))
    OR
    (applicant_type = 'venue' AND venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid()))
  );

-- Applicants can update their applications (withdraw)
CREATE POLICY "Applicants can update own applications"
  ON public.opportunity_applications FOR UPDATE
  USING (
    (applicant_type = 'band' AND band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid()))
    OR
    (applicant_type = 'venue' AND venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid()))
  );

-- Poster can update applications (accept/decline)
CREATE POLICY "Poster can respond to applications"
  ON public.opportunity_applications FOR UPDATE
  USING (
    opportunity_id IN (
      SELECT id FROM public.booking_opportunities
      WHERE (posted_by_type = 'band' AND band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid()))
         OR (posted_by_type = 'venue' AND venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid()))
    )
  );

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS band_availability_band_id_idx ON public.band_availability(band_id);
CREATE INDEX IF NOT EXISTS band_availability_dates_idx ON public.band_availability(start_date, end_date);
CREATE INDEX IF NOT EXISTS band_availability_not_booked_idx ON public.band_availability(start_date) WHERE NOT is_booked;

CREATE INDEX IF NOT EXISTS venue_slots_venue_id_idx ON public.venue_slots(venue_id);
CREATE INDEX IF NOT EXISTS venue_slots_date_idx ON public.venue_slots(slot_date);
CREATE INDEX IF NOT EXISTS venue_slots_open_idx ON public.venue_slots(slot_date) WHERE status = 'open';

CREATE INDEX IF NOT EXISTS booking_opportunities_type_idx ON public.booking_opportunities(posted_by_type);
CREATE INDEX IF NOT EXISTS booking_opportunities_status_idx ON public.booking_opportunities(status);
CREATE INDEX IF NOT EXISTS booking_opportunities_dates_idx ON public.booking_opportunities(specific_date, date_range_start, date_range_end);

CREATE INDEX IF NOT EXISTS opportunity_applications_opportunity_idx ON public.opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS opportunity_applications_status_idx ON public.opportunity_applications(status);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER band_availability_updated_at
  BEFORE UPDATE ON public.band_availability
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER venue_slots_updated_at
  BEFORE UPDATE ON public.venue_slots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER booking_opportunities_updated_at
  BEFORE UPDATE ON public.booking_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.band_availability IS 'Date ranges when bands are available to play';
COMMENT ON TABLE public.venue_slots IS 'Specific dates/times venues need bands';
COMMENT ON TABLE public.booking_opportunities IS 'RFP-style postings from bands or venues looking for matches';
COMMENT ON TABLE public.opportunity_applications IS 'Applications/responses to booking opportunities';
