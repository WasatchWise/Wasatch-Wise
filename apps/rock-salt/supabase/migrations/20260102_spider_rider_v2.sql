-- Spider Rider V2: State Machine, Versioning, and Contract Generation
-- Created: 2026-01-02

-- =====================================================
-- PART 1: Add state machine to spider_riders
-- =====================================================

-- Add status column (draft -> published -> archived)
ALTER TABLE public.spider_riders
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived'));

-- Add published_at timestamp for immutability tracking
ALTER TABLE public.spider_riders
ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Add parent_version_id for version chain tracking
ALTER TABLE public.spider_riders
ADD COLUMN IF NOT EXISTS parent_version_id uuid REFERENCES public.spider_riders(id);

-- Drop old is_active column if exists (replaced by status)
ALTER TABLE public.spider_riders
DROP COLUMN IF EXISTS is_active;

-- Add version_number for easier version tracking
ALTER TABLE public.spider_riders
ADD COLUMN IF NOT EXISTS version_number integer DEFAULT 1;

-- Indexes for status queries
CREATE INDEX IF NOT EXISTS spider_riders_status_idx ON public.spider_riders(status);
CREATE INDEX IF NOT EXISTS spider_riders_published_idx ON public.spider_riders(published_at DESC) WHERE status = 'published';

-- =====================================================
-- PART 2: Update RLS policies for status-based access
-- =====================================================

-- Drop old policy
DROP POLICY IF EXISTS "Anyone can view active spider riders" ON public.spider_riders;

-- Anyone can view published spider riders
DROP POLICY IF EXISTS "Anyone can view published spider riders" ON public.spider_riders;
CREATE POLICY "Anyone can view published spider riders"
  ON public.spider_riders FOR SELECT
  USING (status = 'published');

-- Band owners can view all their own riders (draft, published, archived)
DROP POLICY IF EXISTS "Bands can view their own spider riders" ON public.spider_riders;
CREATE POLICY "Bands can view their own spider riders"
  ON public.spider_riders FOR SELECT
  USING (
    band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
  );

-- Band owners can only update DRAFT riders
DROP POLICY IF EXISTS "Bands can manage their own spider riders" ON public.spider_riders;
DROP POLICY IF EXISTS "Bands can update their draft riders" ON public.spider_riders;
CREATE POLICY "Bands can update their draft riders"
  ON public.spider_riders FOR UPDATE
  USING (
    band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
    AND status = 'draft'
  );

DROP POLICY IF EXISTS "Bands can insert spider riders" ON public.spider_riders;
CREATE POLICY "Bands can insert spider riders"
  ON public.spider_riders FOR INSERT
  WITH CHECK (
    band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
  );

DROP POLICY IF EXISTS "Bands can delete their draft riders" ON public.spider_riders;
CREATE POLICY "Bands can delete their draft riders"
  ON public.spider_riders FOR DELETE
  USING (
    band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
    AND status = 'draft'
  );

-- =====================================================
-- PART 3: Generated contracts table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.generated_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  spider_rider_id uuid REFERENCES public.spider_riders(id) NOT NULL,
  acceptance_id uuid REFERENCES public.spider_rider_acceptances(id) NOT NULL,
  booking_request_id uuid REFERENCES public.booking_requests(id),
  band_id uuid REFERENCES public.bands(id) NOT NULL,
  venue_id uuid REFERENCES public.venues(id) NOT NULL,

  -- Contract details
  event_date date NOT NULL,
  agreed_guarantee decimal(10,2) NOT NULL,

  -- PDF and verification
  contract_hash text NOT NULL,  -- SHA-256 of contract content
  pdf_storage_path text,        -- Supabase Storage path
  pdf_url text,                 -- Public URL if applicable

  -- Signing status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'band_signed', 'venue_signed', 'fully_signed', 'voided')),
  band_signed_at timestamptz,
  band_signed_ip text,
  venue_signed_at timestamptz,
  venue_signed_ip text,

  -- Audit trail
  generated_at timestamptz DEFAULT now(),
  generated_by uuid REFERENCES auth.users(id),
  voided_at timestamptz,
  voided_reason text,

  -- Prevent duplicate contracts
  UNIQUE(spider_rider_id, acceptance_id, event_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS generated_contracts_band_id_idx ON public.generated_contracts(band_id);
CREATE INDEX IF NOT EXISTS generated_contracts_venue_id_idx ON public.generated_contracts(venue_id);
CREATE INDEX IF NOT EXISTS generated_contracts_event_date_idx ON public.generated_contracts(event_date);
CREATE INDEX IF NOT EXISTS generated_contracts_status_idx ON public.generated_contracts(status);
CREATE INDEX IF NOT EXISTS generated_contracts_hash_idx ON public.generated_contracts(contract_hash);

-- Enable RLS
ALTER TABLE public.generated_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Band owners can view their contracts" ON public.generated_contracts;
CREATE POLICY "Band owners can view their contracts"
  ON public.generated_contracts FOR SELECT
  USING (
    band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
  );

DROP POLICY IF EXISTS "Venue owners can view their contracts" ON public.generated_contracts;
CREATE POLICY "Venue owners can view their contracts"
  ON public.generated_contracts FOR SELECT
  USING (
    venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage all contracts" ON public.generated_contracts;
CREATE POLICY "Admins can manage all contracts"
  ON public.generated_contracts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- =====================================================
-- PART 4: Publish spider rider function
-- =====================================================
CREATE OR REPLACE FUNCTION public.publish_spider_rider(p_rider_id uuid)
RETURNS void AS $$
DECLARE
  v_band_id uuid;
  v_current_status text;
  v_user_id uuid;
BEGIN
  -- Get the rider and verify ownership
  SELECT sr.band_id, sr.status, b.claimed_by
  INTO v_band_id, v_current_status, v_user_id
  FROM public.spider_riders sr
  JOIN public.bands b ON b.id = sr.band_id
  WHERE sr.id = p_rider_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Spider Rider not found';
  END IF;

  -- Verify ownership
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to publish this rider';
  END IF;

  -- Can only publish drafts
  IF v_current_status != 'draft' THEN
    RAISE EXCEPTION 'Can only publish draft riders. Current status: %', v_current_status;
  END IF;

  -- Archive any existing published riders for this band
  UPDATE public.spider_riders
  SET status = 'archived'
  WHERE band_id = v_band_id
    AND status = 'published'
    AND id != p_rider_id;

  -- Publish the new rider (makes it immutable)
  UPDATE public.spider_riders
  SET
    status = 'published',
    published_at = now(),
    updated_at = now()
  WHERE id = p_rider_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.publish_spider_rider TO authenticated;

-- =====================================================
-- PART 5: Create new version from existing rider
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_spider_rider_version(p_source_rider_id uuid)
RETURNS uuid AS $$
DECLARE
  v_new_rider_id uuid;
  v_source_rider public.spider_riders;
  v_user_id uuid;
  v_next_version integer;
BEGIN
  -- Get source rider
  SELECT *
  INTO v_source_rider
  FROM public.spider_riders
  WHERE id = p_source_rider_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source Spider Rider not found';
  END IF;

  -- Verify ownership
  SELECT claimed_by INTO v_user_id
  FROM public.bands
  WHERE id = v_source_rider.band_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to copy this rider';
  END IF;

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_next_version
  FROM public.spider_riders
  WHERE band_id = v_source_rider.band_id;

  -- Create new draft version
  INSERT INTO public.spider_riders (
    band_id,
    version,
    version_number,
    status,
    parent_version_id,
    -- Financial
    guarantee_min,
    guarantee_max,
    door_split_percentage,
    notes_financial,
    -- Technical
    min_stage_width_feet,
    min_stage_depth_feet,
    min_input_channels,
    requires_house_drums,
    stage_plot_url,
    input_list_url,
    notes_technical,
    -- Hospitality
    green_room_requirements,
    meal_buyout_amount,
    drink_tickets_count,
    guest_list_allocation,
    notes_hospitality,
    -- Business
    merch_split_to_venue_percentage,
    age_restriction,
    notes_business
  )
  VALUES (
    v_source_rider.band_id,
    'v' || v_next_version,
    v_next_version,
    'draft',
    p_source_rider_id,
    -- Financial
    v_source_rider.guarantee_min,
    v_source_rider.guarantee_max,
    v_source_rider.door_split_percentage,
    v_source_rider.notes_financial,
    -- Technical
    v_source_rider.min_stage_width_feet,
    v_source_rider.min_stage_depth_feet,
    v_source_rider.min_input_channels,
    v_source_rider.requires_house_drums,
    v_source_rider.stage_plot_url,
    v_source_rider.input_list_url,
    v_source_rider.notes_technical,
    -- Hospitality
    v_source_rider.green_room_requirements,
    v_source_rider.meal_buyout_amount,
    v_source_rider.drink_tickets_count,
    v_source_rider.guest_list_allocation,
    v_source_rider.notes_hospitality,
    -- Business
    v_source_rider.merch_split_to_venue_percentage,
    v_source_rider.age_restriction,
    v_source_rider.notes_business
  )
  RETURNING id INTO v_new_rider_id;

  RETURN v_new_rider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_spider_rider_version TO authenticated;

-- =====================================================
-- PART 6: Archive a spider rider
-- =====================================================
CREATE OR REPLACE FUNCTION public.archive_spider_rider(p_rider_id uuid)
RETURNS void AS $$
DECLARE
  v_band_id uuid;
  v_user_id uuid;
  v_status text;
BEGIN
  -- Get rider and verify ownership
  SELECT sr.band_id, sr.status, b.claimed_by
  INTO v_band_id, v_status, v_user_id
  FROM public.spider_riders sr
  JOIN public.bands b ON b.id = sr.band_id
  WHERE sr.id = p_rider_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Spider Rider not found';
  END IF;

  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to archive this rider';
  END IF;

  -- Can archive draft or published
  IF v_status = 'archived' THEN
    RAISE EXCEPTION 'Rider is already archived';
  END IF;

  UPDATE public.spider_riders
  SET
    status = 'archived',
    updated_at = now()
  WHERE id = p_rider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.archive_spider_rider TO authenticated;

-- =====================================================
-- PART 7: Generate contract function
-- =====================================================
CREATE OR REPLACE FUNCTION public.generate_contract(
  p_spider_rider_id uuid,
  p_acceptance_id uuid,
  p_event_date date,
  p_agreed_guarantee decimal,
  p_contract_hash text,
  p_pdf_storage_path text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_contract_id uuid;
  v_band_id uuid;
  v_venue_id uuid;
  v_booking_request_id uuid;
BEGIN
  -- Get rider's band
  SELECT band_id INTO v_band_id
  FROM public.spider_riders
  WHERE id = p_spider_rider_id AND status = 'published';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Published Spider Rider not found';
  END IF;

  -- Get acceptance's venue
  SELECT venue_id INTO v_venue_id
  FROM public.spider_rider_acceptances
  WHERE id = p_acceptance_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active acceptance not found';
  END IF;

  -- Find associated booking request if exists
  SELECT id INTO v_booking_request_id
  FROM public.booking_requests
  WHERE spider_rider_id = p_spider_rider_id
    AND venue_id = v_venue_id
    AND requested_date = p_event_date
  LIMIT 1;

  -- Create contract
  INSERT INTO public.generated_contracts (
    spider_rider_id,
    acceptance_id,
    booking_request_id,
    band_id,
    venue_id,
    event_date,
    agreed_guarantee,
    contract_hash,
    pdf_storage_path,
    generated_by
  )
  VALUES (
    p_spider_rider_id,
    p_acceptance_id,
    v_booking_request_id,
    v_band_id,
    v_venue_id,
    p_event_date,
    p_agreed_guarantee,
    p_contract_hash,
    p_pdf_storage_path,
    auth.uid()
  )
  RETURNING id INTO v_contract_id;

  RETURN v_contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.generate_contract TO authenticated;

-- =====================================================
-- PART 8: Sign contract functions
-- =====================================================
CREATE OR REPLACE FUNCTION public.sign_contract_as_band(
  p_contract_id uuid,
  p_ip_address text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_band_id uuid;
  v_user_id uuid;
BEGIN
  -- Get contract and verify band ownership
  SELECT gc.band_id, b.claimed_by
  INTO v_band_id, v_user_id
  FROM public.generated_contracts gc
  JOIN public.bands b ON b.id = gc.band_id
  WHERE gc.id = p_contract_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract not found';
  END IF;

  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to sign this contract';
  END IF;

  UPDATE public.generated_contracts
  SET
    band_signed_at = now(),
    band_signed_ip = p_ip_address,
    status = CASE
      WHEN venue_signed_at IS NOT NULL THEN 'fully_signed'
      ELSE 'band_signed'
    END
  WHERE id = p_contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.sign_contract_as_venue(
  p_contract_id uuid,
  p_ip_address text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_venue_id uuid;
  v_user_id uuid;
BEGIN
  -- Get contract and verify venue ownership
  SELECT gc.venue_id, v.claimed_by
  INTO v_venue_id, v_user_id
  FROM public.generated_contracts gc
  JOIN public.venues v ON v.id = gc.venue_id
  WHERE gc.id = p_contract_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract not found';
  END IF;

  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to sign this contract';
  END IF;

  UPDATE public.generated_contracts
  SET
    venue_signed_at = now(),
    venue_signed_ip = p_ip_address,
    status = CASE
      WHEN band_signed_at IS NOT NULL THEN 'fully_signed'
      ELSE 'venue_signed'
    END
  WHERE id = p_contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.sign_contract_as_band TO authenticated;
GRANT EXECUTE ON FUNCTION public.sign_contract_as_venue TO authenticated;

-- =====================================================
-- PART 9: Get band's current published rider
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_band_published_rider(p_band_id uuid)
RETURNS SETOF public.spider_riders AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.spider_riders
  WHERE band_id = p_band_id
    AND status = 'published'
  ORDER BY published_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.get_band_published_rider TO anon;
GRANT EXECUTE ON FUNCTION public.get_band_published_rider TO authenticated;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE public.generated_contracts IS 'Signed contracts between bands and venues based on spider rider terms';
COMMENT ON FUNCTION public.publish_spider_rider IS 'Publish a draft spider rider - archives previous and makes immutable';
COMMENT ON FUNCTION public.create_spider_rider_version IS 'Create a new draft version from an existing spider rider';
COMMENT ON FUNCTION public.archive_spider_rider IS 'Archive a spider rider (remove from public listing)';
COMMENT ON FUNCTION public.generate_contract IS 'Generate a contract between band and venue';
COMMENT ON FUNCTION public.sign_contract_as_band IS 'Band signs a contract';
COMMENT ON FUNCTION public.sign_contract_as_venue IS 'Venue signs a contract';
