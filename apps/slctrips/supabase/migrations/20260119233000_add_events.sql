-- Create events table for first-party events index
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'America/Denver',
  venue_name TEXT,
  venue_address TEXT,
  city TEXT,
  state TEXT,
  county TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  category TEXT,
  image_url TEXT,
  external_source TEXT,
  external_id TEXT,
  external_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist if table was created previously
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS venue_name TEXT,
  ADD COLUMN IF NOT EXISTS venue_address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS external_source TEXT,
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Backfill required fields for existing rows
UPDATE public.events
SET slug = COALESCE(slug, gen_random_uuid()::text),
    title = COALESCE(title, 'Untitled event'),
    start_at = COALESCE(start_at, NOW()),
    is_published = COALESCE(is_published, true),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE slug IS NULL
   OR title IS NULL
   OR start_at IS NULL
   OR is_published IS NULL
   OR created_at IS NULL
   OR updated_at IS NULL;

-- Enforce defaults and non-null constraints
ALTER TABLE public.events
  ALTER COLUMN slug SET DEFAULT gen_random_uuid()::text,
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN title SET DEFAULT 'Untitled event',
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN start_at SET DEFAULT NOW(),
  ALTER COLUMN start_at SET NOT NULL,
  ALTER COLUMN timezone SET DEFAULT 'America/Denver',
  ALTER COLUMN is_published SET DEFAULT true,
  ALTER COLUMN is_published SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS events_external_unique
  ON public.events (external_source, external_id);
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique
  ON public.events (slug);
CREATE INDEX IF NOT EXISTS events_start_at_idx ON public.events (start_at);
CREATE INDEX IF NOT EXISTS events_city_idx ON public.events (city);
CREATE INDEX IF NOT EXISTS events_state_idx ON public.events (state);
CREATE INDEX IF NOT EXISTS events_category_idx ON public.events (category);

-- Auto-update updated_at on updates (function exists in this project)
DROP TRIGGER IF EXISTS events_set_updated_at ON public.events;
CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can read published events
DROP POLICY IF EXISTS "Public can read published events" ON public.events;
CREATE POLICY "Public can read published events"
  ON public.events
  FOR SELECT
  USING (is_published = true);
