-- ==========================================
-- THE RING AT FULLMER LEGACY CENTER
-- Initial Database Schema
-- ==========================================
-- This migration creates the complete database structure for The Ring system
-- Supports: multi-site replication, quest engine, portfolios, badges, ring activation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. SITES & MULTI-TENANCY
-- ==========================================

-- Sites table: Each Ring implementation (enables replication to other cities)
CREATE TABLE public.sites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE, -- 'south-jordan-flc', 'salt-lake-city', etc.
  name            TEXT NOT NULL,
  city            TEXT,
  state           TEXT,
  country         TEXT DEFAULT 'USA',
  timezone        TEXT DEFAULT 'America/Denver',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sites_slug_idx ON public.sites (slug);
CREATE INDEX sites_active_idx ON public.sites (is_active);

-- ==========================================
-- 2. USER PROFILES & AUTHENTICATION
-- ==========================================

-- User profiles: Extends Supabase auth.users
CREATE TABLE public.user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name    TEXT,
  first_name      TEXT,
  last_name       TEXT,
  pronouns        TEXT,
  date_of_birth   DATE,
  avatar_url      TEXT,
  champion_name   TEXT,      -- 'Wildfire', 'Lightning', etc.
  bio             TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX user_profiles_auth_user_id_idx ON public.user_profiles (auth_user_id);

-- Site roles enum
CREATE TYPE public.site_role AS ENUM (
  'youth',
  'staff',
  'mentor',
  'partner',
  'parent_guardian',
  'admin'
);

-- Site memberships: User's role at each site (supports multi-site participation)
CREATE TABLE public.site_memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         UUID NOT NULL REFERENCES public.sites (id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  role            public.site_role NOT NULL,
  is_primary_site BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, user_id)
);

CREATE INDEX site_memberships_site_role_idx ON public.site_memberships (site_id, role);
CREATE INDEX site_memberships_user_idx ON public.site_memberships (user_id);

-- ==========================================
-- 3. RINGS & PILLARS
-- ==========================================

-- Rings: The nine domains of The Ring system
CREATE TABLE public.rings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE, -- 'self', 'body', 'brain', 'bubble', 'scene', 'neighborhood', 'community', 'world', 'ether'
  name         TEXT NOT NULL,
  description  TEXT,
  sort_order   INT NOT NULL,         -- 1..9
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX rings_sort_order_idx ON public.rings (sort_order);

-- Pillars: The four program pillars
CREATE TABLE public.pillars (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE, -- 'wellness', 'technest', 'creative', 'civic'
  name         TEXT NOT NULL,
  description  TEXT,
  color_hex    TEXT,                 -- Optional, for UI theming
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 4. QUESTS & CURRICULUM
-- ==========================================

-- Quests: Core programmable unit (each curriculum file becomes one or more quests)
CREATE TABLE public.quests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id        UUID NOT NULL REFERENCES public.sites (id) ON DELETE CASCADE,
  pillar_id      UUID NOT NULL REFERENCES public.pillars (id),
  slug           TEXT NOT NULL,
  title          TEXT NOT NULL,
  short_summary  TEXT,
  description_md TEXT,               -- Markdown description for staff
  difficulty     INT,                -- 1..5 scale
  estimated_weeks INT,               -- Typical length
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_by     UUID REFERENCES public.user_profiles (id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, slug)
);

CREATE INDEX quests_site_pillar_idx ON public.quests (site_id, pillar_id);
CREATE INDEX quests_active_idx ON public.quests (is_active);

-- Quest versions: Enables quest evolution over time
CREATE TABLE public.quest_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id        UUID NOT NULL REFERENCES public.quests (id) ON DELETE CASCADE,
  version_number  INT NOT NULL,      -- 1, 2, 3...
  homago_config   JSONB NOT NULL,    -- Structure for Hanging Out / Messing Around / Geeking Out
  supplies_list   JSONB,             -- Materials needed
  mentor_profile  JSONB,             -- Ideal mentors, partner types
  is_current      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quest_id, version_number)
);

CREATE INDEX quest_versions_current_idx ON public.quest_versions (quest_id) WHERE is_current = true;

-- Quest -> Rings mapping: Which rings this quest activates
CREATE TABLE public.quest_rings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id     UUID NOT NULL REFERENCES public.quests (id) ON DELETE CASCADE,
  ring_id      UUID NOT NULL REFERENCES public.rings (id),
  weight       NUMERIC(4,2) NOT NULL DEFAULT 1.0, -- How strongly this quest hits the ring
  UNIQUE (quest_id, ring_id)
);

CREATE INDEX quest_rings_quest_idx ON public.quest_rings (quest_id);
CREATE INDEX quest_rings_ring_idx ON public.quest_rings (ring_id);

-- Quest steps: Individual steps within a quest
CREATE TABLE public.quest_steps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id       UUID NOT NULL REFERENCES public.quests (id) ON DELETE CASCADE,
  sort_order     INT NOT NULL,
  title          TEXT NOT NULL,
  description_md TEXT,
  ring_id        UUID REFERENCES public.rings (id), -- Optional ring emphasis for this step
  homago_phase   TEXT, -- 'hanging_out' | 'messing_around' | 'geeking_out'
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quest_id, sort_order)
);

CREATE INDEX quest_steps_quest_idx ON public.quest_steps (quest_id);

-- Quest status enum
CREATE TYPE public.quest_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'dropped'
);

-- Quest participation: Youth enrollment in quests (crew-level)
CREATE TABLE public.quest_participation (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id       UUID NOT NULL REFERENCES public.quests (id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  crew_name      TEXT,                    -- "Fire Crew A", "Cyborg Crew"
  status         public.quest_status NOT NULL DEFAULT 'in_progress',
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quest_id, user_id)
);

CREATE INDEX quest_participation_user_idx ON public.quest_participation (user_id);
CREATE INDEX quest_participation_quest_idx ON public.quest_participation (quest_id);

-- Quest progress events: Fine-grained progress tracking
CREATE TABLE public.quest_progress_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_participation_id UUID NOT NULL REFERENCES public.quest_participation (id) ON DELETE CASCADE,
  quest_step_id   UUID REFERENCES public.quest_steps (id),
  event_type      TEXT NOT NULL,   -- 'step_completed', 'artifact_created', 'reflection_submitted'
  payload         JSONB,           -- Arbitrary details
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX quest_progress_events_participation_idx ON public.quest_progress_events (quest_participation_id);

-- ==========================================
-- 5. PORTFOLIOS & ARTIFACTS
-- ==========================================

-- Portfolios: Champion's Portfolio per youth per site
CREATE TABLE public.portfolios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id        UUID NOT NULL REFERENCES public.sites (id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  public_slug    TEXT NOT NULL,   -- For share URL like /p/wildfire
  mission_stmt   TEXT,
  values         TEXT[],          -- Simple array of core values
  color_palette  JSONB,           -- Brand colors for this youth
  is_public      BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, user_id)
);

CREATE UNIQUE INDEX portfolios_public_slug_idx ON public.portfolios (site_id, public_slug);
CREATE INDEX portfolios_user_idx ON public.portfolios (user_id);

-- Artifact types enum
CREATE TYPE public.artifact_type AS ENUM (
  'image',
  'video',
  'audio',
  'document',
  'link',
  'code',
  'other'
);

-- Artifacts: Portfolio content (videos, docs, screenshots, photos, audio)
CREATE TABLE public.artifacts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id   UUID NOT NULL REFERENCES public.portfolios (id) ON DELETE CASCADE,
  quest_id       UUID REFERENCES public.quests (id),
  ring_id        UUID REFERENCES public.rings (id),
  title          TEXT NOT NULL,
  description_md TEXT,
  type           public.artifact_type NOT NULL,
  storage_path   TEXT,            -- Supabase storage key
  external_url   TEXT,            -- Or external link
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX artifacts_portfolio_idx ON public.artifacts (portfolio_id);
CREATE INDEX artifacts_quest_idx ON public.artifacts (quest_id);

-- ==========================================
-- 6. BADGES & ACHIEVEMENTS
-- ==========================================

-- Badges: Badge catalog (3 Minute Warrior, Varsity Ready, Cyborg Builder, etc.)
CREATE TABLE public.badges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id        UUID REFERENCES public.sites (id) ON DELETE SET NULL, -- Some badges may be global
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  description    TEXT,
  icon_url       TEXT,
  ring_id        UUID REFERENCES public.rings (id),
  pillar_id      UUID REFERENCES public.pillars (id),
  min_quest_count INT,               -- Optional criteria hint
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX badges_site_idx ON public.badges (site_id);

-- User badges: Badge awards
CREATE TABLE public.user_badges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  badge_id       UUID NOT NULL REFERENCES public.badges (id) ON DELETE CASCADE,
  quest_id       UUID REFERENCES public.quests (id),
  awarded_by     UUID REFERENCES public.user_profiles (id), -- Mentor or system
  awarded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  note           TEXT,
  UNIQUE (user_id, badge_id, quest_id)
);

CREATE INDEX user_badges_user_idx ON public.user_badges (user_id);

-- ==========================================
-- 7. RING ACTIVATION & SCORING
-- ==========================================

-- Ring activation snapshots: Cyclone visualization data
CREATE TABLE public.ring_activation_snapshots (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  site_id        UUID NOT NULL REFERENCES public.sites (id) ON DELETE CASCADE,
  ring_id        UUID NOT NULL REFERENCES public.rings (id),
  score          NUMERIC(5,2) NOT NULL DEFAULT 0, -- Weighted sum from quests, badges
  level          INT NOT NULL DEFAULT 0,          -- Discrete level for UI "lit up" status
  computed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, site_id, ring_id)
);

CREATE INDEX ring_activation_user_idx ON public.ring_activation_snapshots (user_id, site_id);

-- ==========================================
-- 8. SESSIONS & ATTENDANCE
-- ==========================================

-- Session types enum
CREATE TYPE public.session_type AS ENUM (
  'open_dropin',
  'quest_block',
  'class_like',
  'event',
  'field_trip'
);

-- Sessions: Daily program activities
CREATE TABLE public.sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id        UUID NOT NULL REFERENCES public.sites (id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  session_type   public.session_type NOT NULL,
  pillar_id      UUID REFERENCES public.pillars (id),
  quest_id       UUID REFERENCES public.quests (id),
  location_label TEXT,      -- "Podium Rings", "Creator's Lounge", "Senior Center"
  starts_at      TIMESTAMPTZ NOT NULL,
  ends_at        TIMESTAMPTZ NOT NULL,
  created_by     UUID REFERENCES public.user_profiles (id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sessions_site_date_idx ON public.sessions (site_id, starts_at);

-- Attendance status enum
CREATE TYPE public.attendance_status AS ENUM (
  'present',
  'late',
  'left_early',
  'no_show'
);

-- Session attendance
CREATE TABLE public.session_attendance (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL REFERENCES public.sessions (id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  status         public.attendance_status NOT NULL DEFAULT 'present',
  check_in_at    TIMESTAMPTZ,
  check_out_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_id)
);

CREATE INDEX session_attendance_user_idx ON public.session_attendance (user_id);
CREATE INDEX session_attendance_session_idx ON public.session_attendance (session_id);

-- ==========================================
-- 9. PARTNERS & LOCATIONS
-- ==========================================

-- Partner organizations: Senior Center, Fire Station, Rec Center, etc.
CREATE TABLE public.partner_orgs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id        UUID NOT NULL REFERENCES public.sites (id) ON DELETE CASCADE,
  slug           TEXT NOT NULL,
  name           TEXT NOT NULL,
  org_type       TEXT,              -- 'senior_center', 'fire_station', 'rec_center', etc.
  description    TEXT,
  website_url    TEXT,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, slug)
);

CREATE INDEX partner_orgs_site_idx ON public.partner_orgs (site_id);

-- Partner locations: Physical locations (some partners have multiple)
CREATE TABLE public.partner_locations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_org_id UUID NOT NULL REFERENCES public.partner_orgs (id) ON DELETE CASCADE,
  label          TEXT NOT NULL,     -- 'Main building', 'Arena A', 'Field'
  address_line1  TEXT,
  address_line2  TEXT,
  city           TEXT,
  state          TEXT,
  postal_code    TEXT,
  latitude       NUMERIC(9,6),
  longitude      NUMERIC(9,6),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partner members: Users mapped to partner organizations
CREATE TABLE public.partner_members (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_org_id UUID NOT NULL REFERENCES public.partner_orgs (id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  title          TEXT,          -- 'Firefighter', 'Senior Center Director'
  is_primary     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (partner_org_id, user_id)
);

-- ==========================================
-- 10. SERVICE HOURS & CIVIC ACTIVITIES
-- ==========================================

-- Service activities: Disaster Response Crew, Shelter Squad, Wisdom Bridge, etc.
CREATE TABLE public.service_activities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id        UUID NOT NULL REFERENCES public.sites (id) ON DELETE CASCADE,
  slug           TEXT NOT NULL,
  name           TEXT NOT NULL,
  description    TEXT,
  partner_org_id  UUID REFERENCES public.partner_orgs (id),
  ring_id        UUID REFERENCES public.rings (id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, slug)
);

-- Service logs: Individual service hour entries
CREATE TABLE public.service_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  site_id        UUID NOT NULL REFERENCES public.sites (id) ON DELETE CASCADE,
  service_activity_id UUID NOT NULL REFERENCES public.service_activities (id) ON DELETE CASCADE,
  performed_at   TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  description    TEXT,
  verified_by    UUID REFERENCES public.user_profiles (id), -- Staff, partner
  verified_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX service_logs_user_idx ON public.service_logs (user_id, site_id);

-- ==========================================
-- 11. ENDORSEMENTS & FEEDBACK
-- ==========================================

-- Endorsements: Mentor/staff feedback for portfolios
CREATE TABLE public.endorsements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id   UUID NOT NULL REFERENCES public.portfolios (id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES public.user_profiles (id), -- Mentor or staff
  author_name    TEXT,       -- For external mentors not in system
  author_title   TEXT,
  body_md        TEXT NOT NULL,
  context        TEXT,       -- 'Fire Station mentor', 'Esports coach', etc.
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX endorsements_portfolio_idx ON public.endorsements (portfolio_id);

-- ==========================================
-- 12. ADMIN & CONFIGURATION
-- ==========================================

-- Site configuration: Feature flags and config per site
CREATE TABLE public.site_config (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id        UUID NOT NULL REFERENCES public.sites (id) ON DELETE CASCADE,
  key            TEXT NOT NULL,
  value          JSONB NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, key)
);

-- Activity events: Analytics and telemetry
CREATE TABLE public.activity_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id        UUID REFERENCES public.sites (id) ON DELETE SET NULL,
  user_id        UUID REFERENCES public.user_profiles (id) ON DELETE SET NULL,
  event_type     TEXT NOT NULL,        -- 'quest_started', 'session_checkin', etc.
  event_data     JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX activity_events_user_idx ON public.activity_events (user_id);
CREATE INDEX activity_events_site_idx ON public.activity_events (site_id);
CREATE INDEX activity_events_type_idx ON public.activity_events (event_type);

-- ==========================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Enable RLS on all tables
-- Policies will be added in a separate migration after initial setup

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_rings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_progress_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ring_activation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 14. UPDATED_AT TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON public.quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

