-- ============================================================================
-- MIGRATION 003: Incursor Layer (Gemini 3.0 Integration)
-- Adds NFC zones, session tracking, AI-analyzed artifacts, and cyclone metrics
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ZONES (Physical Space → Digital Ring Mapping)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,

  -- Identity
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Ring Mapping
  pillar_id UUID REFERENCES public.pillars(id),
  primary_ring_id UUID REFERENCES public.rings(id),
  secondary_rings UUID[] DEFAULT '{}',

  -- Physical
  nfc_tag_uid TEXT UNIQUE,
  capacity_limit INT DEFAULT 50,

  -- State
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(site_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_zones_site ON public.zones(site_id);
CREATE INDEX IF NOT EXISTS idx_zones_slug ON public.zones(slug);
CREATE INDEX IF NOT EXISTS idx_zones_nfc ON public.zones(nfc_tag_uid) WHERE nfc_tag_uid IS NOT NULL;

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ENHANCE sessions TABLE (Add Tap-In Logic)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES public.zones(id);
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS auto_closed BOOLEAN DEFAULT false;

-- Add tap_in to session_type enum
DO $$ BEGIN
  ALTER TYPE public.session_type ADD VALUE IF NOT EXISTS 'tap_in';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ENHANCE artifacts TABLE (Add AI Analysis Fields)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.sessions(id);
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES public.zones(id);
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS user_caption TEXT;

-- AI Analysis Fields
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS ai_analyzed BOOLEAN DEFAULT false;
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS ai_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS ai_rings_detected UUID[] DEFAULT '{}';
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS ai_professional_summary TEXT;
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS ai_encouragement TEXT;
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS ai_suggested_quest_id UUID REFERENCES public.quests(id);

CREATE INDEX IF NOT EXISTS idx_artifacts_ai_pending ON public.artifacts(ai_analyzed) WHERE ai_analyzed = false;
CREATE INDEX IF NOT EXISTS idx_artifacts_zone ON public.artifacts(zone_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. CYCLONE METRICS (Fast Read Layer for Gamification)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cyclone_metrics (
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,

  -- Ring Levels (0-100 scale)
  level_self INT DEFAULT 0 CHECK (level_self BETWEEN 0 AND 100),
  level_body INT DEFAULT 0 CHECK (level_body BETWEEN 0 AND 100),
  level_brain INT DEFAULT 0 CHECK (level_brain BETWEEN 0 AND 100),
  level_bubble INT DEFAULT 0 CHECK (level_bubble BETWEEN 0 AND 100),
  level_scene INT DEFAULT 0 CHECK (level_scene BETWEEN 0 AND 100),
  level_neighborhood INT DEFAULT 0 CHECK (level_neighborhood BETWEEN 0 AND 100),
  level_community INT DEFAULT 0 CHECK (level_community BETWEEN 0 AND 100),
  level_world INT DEFAULT 0 CHECK (level_world BETWEEN 0 AND 100),
  level_ether INT DEFAULT 0 CHECK (level_ether BETWEEN 0 AND 100),

  -- Aggregates
  total_xp INT DEFAULT 0,
  total_artifacts INT DEFAULT 0,
  total_sessions INT DEFAULT 0,

  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cyclone_metrics_xp ON public.cyclone_metrics(total_xp DESC);

ALTER TABLE public.cyclone_metrics ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS Policies for New Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- Zones: Site members can view
CREATE POLICY "Site members can view zones"
  ON public.zones FOR SELECT
  USING (public.is_site_member(site_id));

CREATE POLICY "Staff can manage zones"
  ON public.zones FOR ALL
  USING (public.is_site_staff(site_id));

-- Cyclone metrics: Users can view own, staff can view all
CREATE POLICY "Users can view own cyclone"
  ON public.cyclone_metrics FOR SELECT
  USING (user_id = public.get_user_profile_id());

CREATE POLICY "Staff can view site cyclones"
  ON public.cyclone_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.site_memberships sm
      WHERE sm.user_id = cyclone_metrics.user_id
        AND public.is_site_staff(sm.site_id)
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. FUNCTION: Calculate Ring Level
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.calculate_ring_level(
  p_user_id UUID,
  p_ring_slug TEXT
) RETURNS INT AS $$
DECLARE
  v_ring_id UUID;
  v_quest_points INT := 0;
  v_artifact_points INT := 0;
  v_session_points INT := 0;
  v_badge_points INT := 0;
  v_total_points INT := 0;
BEGIN
  -- Get ring ID
  SELECT id INTO v_ring_id FROM public.rings WHERE slug = p_ring_slug;
  IF v_ring_id IS NULL THEN RETURN 0; END IF;

  -- Quest completions (30 XP each)
  SELECT COALESCE(COUNT(*), 0) * 30 INTO v_quest_points
  FROM public.quest_participation qp
  JOIN public.quest_rings qr ON qp.quest_id = qr.quest_id
  WHERE qp.user_id = p_user_id
    AND qr.ring_id = v_ring_id
    AND qp.status = 'completed';

  -- Artifacts tagged with this ring (10 XP each)
  SELECT COALESCE(COUNT(*), 0) * 10 INTO v_artifact_points
  FROM public.artifacts a
  JOIN public.portfolios p ON a.portfolio_id = p.id
  WHERE p.user_id = p_user_id
    AND v_ring_id = ANY(a.ai_rings_detected);

  -- Sessions in zones linked to this ring (5 XP each)
  SELECT COALESCE(COUNT(*), 0) * 5 INTO v_session_points
  FROM public.session_attendance sa
  JOIN public.sessions s ON sa.session_id = s.id
  JOIN public.zones z ON s.zone_id = z.id
  WHERE sa.user_id = p_user_id
    AND (z.primary_ring_id = v_ring_id OR v_ring_id = ANY(z.secondary_rings));

  -- Badges (20 XP each)
  SELECT COALESCE(COUNT(*), 0) * 20 INTO v_badge_points
  FROM public.user_badges ub
  JOIN public.badges b ON ub.badge_id = b.id
  WHERE ub.user_id = p_user_id
    AND b.ring_id = v_ring_id;

  v_total_points := v_quest_points + v_artifact_points + v_session_points + v_badge_points;

  -- Convert to level (0-100, sqrt curve)
  RETURN LEAST(100, FLOOR(SQRT(v_total_points)));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FUNCTION: Refresh Cyclone Metrics for User
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.refresh_user_cyclone(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.cyclone_metrics (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.cyclone_metrics SET
    level_self = public.calculate_ring_level(p_user_id, 'self'),
    level_body = public.calculate_ring_level(p_user_id, 'body'),
    level_brain = public.calculate_ring_level(p_user_id, 'brain'),
    level_bubble = public.calculate_ring_level(p_user_id, 'bubble'),
    level_scene = public.calculate_ring_level(p_user_id, 'scene'),
    level_neighborhood = public.calculate_ring_level(p_user_id, 'neighborhood'),
    level_community = public.calculate_ring_level(p_user_id, 'community'),
    level_world = public.calculate_ring_level(p_user_id, 'world'),
    level_ether = public.calculate_ring_level(p_user_id, 'ether'),
    total_artifacts = (SELECT COUNT(*) FROM public.artifacts a JOIN public.portfolios p ON a.portfolio_id = p.id WHERE p.user_id = p_user_id),
    total_sessions = (SELECT COUNT(*) FROM public.session_attendance WHERE user_id = p_user_id),
    last_updated = NOW()
  WHERE user_id = p_user_id;

  UPDATE public.cyclone_metrics SET
    total_xp = level_self + level_body + level_brain + level_bubble + level_scene +
               level_neighborhood + level_community + level_world + level_ether
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. PRIVACY: Close Stale Sessions (Ghost Protocol)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.close_stale_sessions()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  WITH updated AS (
    UPDATE public.sessions
    SET
      ends_at = NOW(),
      auto_closed = true
    WHERE session_type = 'tap_in'
      AND ends_at IS NULL
      AND starts_at < NOW() - INTERVAL '4 hours'
    RETURNING id
  )
  SELECT COUNT(*)::INT INTO v_count FROM updated;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Updated_at Trigger for Zones
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER update_zones_updated_at
  BEFORE UPDATE ON public.zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
