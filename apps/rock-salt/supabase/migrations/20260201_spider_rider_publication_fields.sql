-- Spider Rider Publication: rider_code, PDF storage, SHA-256 hash
-- Created: 2026-02-01
-- Phase 1: Post-publication PDF and contract verification

-- =====================================================
-- PART 1: Add publication fields to spider_riders
-- =====================================================

ALTER TABLE public.spider_riders
ADD COLUMN IF NOT EXISTS rider_code text,
ADD COLUMN IF NOT EXISTS pdf_storage_path text,
ADD COLUMN IF NOT EXISTS pdf_url text,
ADD COLUMN IF NOT EXISTS sha256_hash text;

-- Unique constraint on rider_code (after backfill)
CREATE UNIQUE INDEX IF NOT EXISTS spider_riders_rider_code_idx
  ON public.spider_riders(rider_code) WHERE rider_code IS NOT NULL;

-- =====================================================
-- PART 2: Function to generate rider code (SR-2026-BAND-001)
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_spider_rider_code(
  p_band_id uuid,
  p_published_at timestamptz DEFAULT now()
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_band_slug text;
  v_year text;
  v_slug_upper text;
  v_sequence int;
  v_code text;
BEGIN
  -- Get band slug
  SELECT COALESCE(NULLIF(TRIM(b.slug), ''), 'band') INTO v_band_slug
  FROM bands b WHERE b.id = p_band_id;

  -- Sanitize: uppercase, replace non-alphanumeric with nothing, truncate
  v_slug_upper := UPPER(regexp_replace(v_band_slug, '[^a-zA-Z0-9]', '', 'g'));
  IF LENGTH(v_slug_upper) = 0 THEN
    v_slug_upper := 'BAND';
  ELSIF LENGTH(v_slug_upper) > 12 THEN
    v_slug_upper := LEFT(v_slug_upper, 12);
  END IF;

  v_year := EXTRACT(YEAR FROM p_published_at)::text;

  -- Next sequence for this band in this year (published riders only)
  SELECT COALESCE(MAX(
    CASE
      WHEN rider_code ~ '^SR-[0-9]{4}-[A-Z0-9]+-([0-9]+)$'
      THEN (regexp_match(rider_code, '-([0-9]+)$'))[1]::int
      ELSE 0
    END
  ), 0) + 1
  INTO v_sequence
  FROM spider_riders
  WHERE band_id = p_band_id
    AND status = 'published'
    AND EXTRACT(YEAR FROM published_at) = EXTRACT(YEAR FROM p_published_at)
    AND rider_code IS NOT NULL;

  v_code := 'SR-' || v_year || '-' || v_slug_upper || '-' || LPAD(v_sequence::text, 3, '0');
  RETURN v_code;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_spider_rider_code(uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_spider_rider_code(uuid, timestamptz) TO service_role;

COMMENT ON FUNCTION public.generate_spider_rider_code IS 'Generate unique rider code like SR-2026-STARMY-001';

-- =====================================================
-- PART 3: Ensure contracts bucket exists (for rider PDFs)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  false,
  5242880, -- 5MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;
