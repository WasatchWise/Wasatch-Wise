-- Ensure claim columns exist for bands/venues (safe in all envs)

ALTER TABLE public.bands
  ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.bands
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

-- Indexes for claim lookups
CREATE INDEX IF NOT EXISTS bands_claimed_by_idx ON public.bands(claimed_by);
CREATE INDEX IF NOT EXISTS venues_claimed_by_idx ON public.venues(claimed_by);

COMMENT ON COLUMN public.bands.claimed_by IS 'User who has claimed/owns this band page';
COMMENT ON COLUMN public.venues.claimed_by IS 'Venue owner/manager user ID';
