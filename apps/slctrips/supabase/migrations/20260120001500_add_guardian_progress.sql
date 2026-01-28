-- Guardian progress tracking tables (county-based)
CREATE TABLE IF NOT EXISTS public.user_guardian_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  county TEXT NOT NULL,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
  discovered_at TIMESTAMPTZ,
  interaction_count INTEGER NOT NULL DEFAULT 0,
  stewardship_score NUMERIC(4, 2) NOT NULL DEFAULT 0,
  consent_of_place NUMERIC(4, 2) NOT NULL DEFAULT 0,
  badges_earned JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, county)
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
  county TEXT,
  badge_id TEXT NOT NULL,
  unlock_method TEXT,
  location_lat NUMERIC(9, 6),
  location_lng NUMERIC(9, 6),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_guardian_progress_user_idx
  ON public.user_guardian_progress (user_id);
CREATE INDEX IF NOT EXISTS user_guardian_progress_county_idx
  ON public.user_guardian_progress (county);
CREATE INDEX IF NOT EXISTS user_badges_user_idx
  ON public.user_badges (user_id);
CREATE INDEX IF NOT EXISTS user_badges_badge_idx
  ON public.user_badges (badge_id);

-- Auto-update updated_at on updates (function exists in this project)
DROP TRIGGER IF EXISTS user_guardian_progress_set_updated_at ON public.user_guardian_progress;
CREATE TRIGGER user_guardian_progress_set_updated_at
  BEFORE UPDATE ON public.user_guardian_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.user_guardian_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own progress
DROP POLICY IF EXISTS "Users can read their guardian progress" ON public.user_guardian_progress;
CREATE POLICY "Users can read their guardian progress"
  ON public.user_guardian_progress
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert their guardian progress" ON public.user_guardian_progress;
CREATE POLICY "Users can upsert their guardian progress"
  ON public.user_guardian_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can read/write their own badges
DROP POLICY IF EXISTS "Users can read their badges" ON public.user_badges;
CREATE POLICY "Users can read their badges"
  ON public.user_badges
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their badges" ON public.user_badges;
CREATE POLICY "Users can insert their badges"
  ON public.user_badges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
