-- Venue sources for n8n / automated event ingestion
-- Each row = one URL to fetch (venue calendar, Bandsintown, Songkick, etc.)
-- Created: 2026-02-15

CREATE TABLE IF NOT EXISTS public.venue_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name text NOT NULL,
  city text DEFAULT 'Salt Lake City',
  state text DEFAULT 'UT',
  source_url text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
    'venue_site',
    'bandsintown',
    'songkick',
    'facebook',
    'instagram_link',
    'other'
  )),
  priority smallint DEFAULT 2 CHECK (priority >= 1 AND priority <= 3),
  active boolean DEFAULT true,
  last_fetched_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venue_sources_active_priority_idx
  ON public.venue_sources(active, priority)
  WHERE active = true;

COMMENT ON TABLE public.venue_sources IS 'URLs to scrape for events (n8n / cron). source_type = venue_site, bandsintown, songkick, facebook, etc.';
COMMENT ON COLUMN public.venue_sources.priority IS '1 = high, 2 = normal, 3 = low (fetch order)';

ALTER TABLE public.venue_sources ENABLE ROW LEVEL SECURITY;

-- Service role / backend can manage; public read optional
DO $$ BEGIN
  CREATE POLICY "Public read venue_sources"
    ON public.venue_sources FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow inserts/updates only via service role (no policy = only service role)
-- For app admin UI you'd add a policy for admin_users; for n8n we use service role.

CREATE TRIGGER trigger_venue_sources_updated_at
  BEFORE UPDATE ON public.venue_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Optional: store primary event link on events (for "More info" / source page)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS external_url text;
COMMENT ON COLUMN public.events.external_url IS 'Primary event page URL (tickets, venue, or Facebook event)';

-- Allow external_source = 'n8n' for pipeline-ingested events
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_external_source_check;
ALTER TABLE public.events ADD CONSTRAINT events_external_source_check
  CHECK (external_source IS NULL OR external_source IN ('bandsintown', 'songkick', 'manual', 'n8n'));
