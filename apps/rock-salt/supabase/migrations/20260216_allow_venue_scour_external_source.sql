-- Allow external_source values: n8n (pipeline), venue_scour (Rock Salt venue scour / 24tix import)
-- Created: 2026-02-10

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_external_source_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_external_source_check
  CHECK (external_source IS NULL OR external_source IN (
    'bandsintown', 'songkick', 'manual', 'n8n', 'venue_scour'
  ));

COMMENT ON COLUMN public.events.external_source IS 'Source of the event data: bandsintown, songkick, manual, n8n, venue_scour';
