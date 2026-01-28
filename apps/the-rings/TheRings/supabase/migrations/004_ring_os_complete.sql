-- ============================================================================
-- MIGRATION 004: Ring OS Complete Schema
-- The full data architecture for The Rings Operating System
-- ============================================================================

-- ============================================================================
-- SECTION 1: FAMILY & ACCOUNT MANAGEMENT
-- ============================================================================

-- Family relationships (parent/guardian ↔ youth)
CREATE TABLE IF NOT EXISTS public.family_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  youth_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('parent', 'guardian', 'foster', 'grandparent', 'other')),

  -- Verification
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by UUID REFERENCES public.user_profiles(id), -- staff who verified

  -- Parent visibility permissions
  can_view_messages BOOLEAN DEFAULT true,
  can_view_location BOOLEAN DEFAULT true,
  can_view_artifacts BOOLEAN DEFAULT true,
  can_view_progress BOOLEAN DEFAULT true,

  -- Status
  is_primary BOOLEAN DEFAULT false, -- primary guardian
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(parent_id, youth_id)
);

CREATE INDEX idx_family_links_parent ON public.family_links(parent_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_family_links_youth ON public.family_links(youth_id) WHERE revoked_at IS NULL;

-- Account claiming (parent creates → youth claims)
CREATE TABLE IF NOT EXISTS public.account_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who created and for whom
  created_by UUID NOT NULL REFERENCES public.user_profiles(id),
  youth_profile_id UUID NOT NULL REFERENCES public.user_profiles(id),

  -- Claim mechanism
  claim_code TEXT NOT NULL UNIQUE, -- 6-char alphanumeric
  claim_qr_payload TEXT, -- full QR data

  -- Status
  claimed_at TIMESTAMPTZ,
  claimed_device_info JSONB, -- browser/device fingerprint
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_account_claims_code ON public.account_claims(claim_code) WHERE claimed_at IS NULL;

-- Staff invitations
CREATE TABLE IF NOT EXISTS public.staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Invitation details
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.user_profiles(id),
  site_id UUID NOT NULL REFERENCES public.sites(id),
  role public.site_role DEFAULT 'staff',

  -- Claim mechanism
  token TEXT NOT NULL UNIQUE,

  -- Status
  claimed_at TIMESTAMPTZ,
  claimed_by UUID REFERENCES public.user_profiles(id),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_invitations_token ON public.staff_invitations(token) WHERE claimed_at IS NULL;
CREATE INDEX idx_staff_invitations_email ON public.staff_invitations(email);

-- ============================================================================
-- SECTION 2: COMMUNICATION SYSTEM
-- ============================================================================

-- Communication channels
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,

  -- Identity
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Type
  channel_type TEXT NOT NULL CHECK (channel_type IN (
    'announcement',  -- broadcast only
    'team',          -- staff team
    'pillar',        -- pillar-specific
    'crew',          -- quest crew
    'dm',            -- direct message
    'family'         -- parent-youth
  )),

  -- Associations
  pillar_id UUID REFERENCES public.pillars(id),
  quest_id UUID REFERENCES public.quests(id),

  -- Settings
  is_moderated BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(site_id, slug)
);

CREATE INDEX idx_channels_site ON public.channels(site_id);
CREATE INDEX idx_channels_type ON public.channels(channel_type);

-- Channel membership
CREATE TABLE IF NOT EXISTS public.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Role in channel
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),

  -- Preferences
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ,

  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(channel_id, user_id)
);

CREATE INDEX idx_channel_members_user ON public.channel_members(user_id);
CREATE INDEX idx_channel_members_channel ON public.channel_members(channel_id);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.user_profiles(id),

  -- Content
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file', 'system')),
  attachments JSONB DEFAULT '[]',

  -- Threading
  reply_to_id UUID REFERENCES public.messages(id),

  -- Safety
  requires_parent_visibility BOOLEAN DEFAULT false,
  parent_viewed_at TIMESTAMPTZ,

  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  flagged_by UUID REFERENCES public.user_profiles(id),
  flagged_reason TEXT,
  is_hidden BOOLEAN DEFAULT false,

  -- Status
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_channel ON public.messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_parent_pending ON public.messages(requires_parent_visibility)
  WHERE requires_parent_visibility = true AND parent_viewed_at IS NULL;

-- Communication authorizations (parent grants adult access to youth)
CREATE TABLE IF NOT EXISTS public.communication_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The authorization
  parent_id UUID NOT NULL REFERENCES public.user_profiles(id),
  youth_id UUID NOT NULL REFERENCES public.user_profiles(id),
  authorized_user_id UUID NOT NULL REFERENCES public.user_profiles(id), -- staff/partner

  -- Scope
  authorization_type TEXT DEFAULT 'message' CHECK (authorization_type IN (
    'message',     -- can send messages
    'view_only',   -- can view youth's progress
    'mentor'       -- full mentorship access
  )),

  -- Status
  authorized_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  UNIQUE(parent_id, youth_id, authorized_user_id)
);

CREATE INDEX idx_comm_auth_youth ON public.communication_authorizations(youth_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_comm_auth_user ON public.communication_authorizations(authorized_user_id) WHERE revoked_at IS NULL;

-- Announcements (broadcast messages)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  body_html TEXT,

  -- Targeting
  audience TEXT[] DEFAULT '{all}', -- ['all'], ['staff'], ['youth'], ['parents']
  pillar_ids UUID[],

  -- Scheduling
  publish_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Status
  is_pinned BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,

  created_by UUID NOT NULL REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_site ON public.announcements(site_id, publish_at DESC);

-- ============================================================================
-- SECTION 3: SCHEDULING & EVENTS
-- ============================================================================

-- Events (broader than sessions - includes classes, field trips, etc.)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,

  -- Identity
  title TEXT NOT NULL,
  description TEXT,

  -- Type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'session',       -- regular programming
    'class',         -- structured class
    'field_trip',    -- off-site
    'special_event', -- one-time event
    'meeting',       -- staff meeting
    'pd',            -- professional development
    'community'      -- community event
  )),

  -- Associations
  zone_id UUID REFERENCES public.zones(id),
  pillar_id UUID REFERENCES public.pillars(id),
  quest_id UUID REFERENCES public.quests(id),

  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'America/Denver',

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- iCal RRULE format
  parent_event_id UUID REFERENCES public.events(id), -- for recurring instances

  -- Capacity
  capacity_limit INT,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMPTZ,

  -- Visibility
  is_public BOOLEAN DEFAULT false,
  audience TEXT[] DEFAULT '{all}',

  -- Status
  is_cancelled BOOLEAN DEFAULT false,
  cancelled_reason TEXT,

  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_site_date ON public.events(site_id, starts_at);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_zone ON public.events(zone_id);

-- Event registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'registered' CHECK (status IN (
    'registered',
    'waitlisted',
    'cancelled',
    'attended',
    'no_show'
  )),

  -- Details
  registered_by UUID REFERENCES public.user_profiles(id), -- if parent registered youth
  notes TEXT,

  registered_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON public.event_registrations(user_id);

-- Zone bookings (room reservations)
CREATE TABLE IF NOT EXISTS public.zone_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,

  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,

  -- Details
  title TEXT,
  booked_by UUID NOT NULL REFERENCES public.user_profiles(id),

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_zone_bookings_zone ON public.zone_bookings(zone_id, starts_at);

-- Staff shifts
CREATE TABLE IF NOT EXISTS public.staff_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,

  -- Assignment
  zone_id UUID REFERENCES public.zones(id),
  role_during_shift TEXT, -- 'lead', 'support', etc.

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',
    'confirmed',
    'checked_in',
    'completed',
    'cancelled',
    'no_show'
  )),

  -- Actuals
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_shifts_user ON public.staff_shifts(user_id, starts_at);
CREATE INDEX idx_staff_shifts_site ON public.staff_shifts(site_id, starts_at);

-- ============================================================================
-- SECTION 4: STAFF OPERATIONS
-- ============================================================================

-- Documents (policies, onboarding, PD materials)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE, -- null for global

  -- Identity
  title TEXT NOT NULL,
  description TEXT,

  -- Type
  document_type TEXT NOT NULL CHECK (document_type IN (
    'policy',
    'handbook',
    'onboarding',
    'form',
    'pd_material',
    'resource',
    'template'
  )),

  -- Content source
  source_type TEXT NOT NULL CHECK (source_type IN (
    'google_drive',
    'youtube',
    'upload',
    'link',
    'markdown'
  )),
  source_url TEXT,
  source_id TEXT, -- Drive file ID, YouTube video ID
  storage_path TEXT, -- for uploads
  content_md TEXT, -- for markdown content

  -- Metadata
  file_type TEXT, -- 'pdf', 'doc', 'video', etc.
  duration_minutes INT, -- for videos

  -- Targeting
  required_for_roles public.site_role[],

  -- Status
  is_published BOOLEAN DEFAULT true,
  version INT DEFAULT 1,

  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_site ON public.documents(site_id);
CREATE INDEX idx_documents_type ON public.documents(document_type);

-- Document acknowledgments (staff confirms they read/watched)
CREATE TABLE IF NOT EXISTS public.document_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Acknowledgment
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  document_version INT NOT NULL,

  -- For quizzes/assessments
  score NUMERIC(5,2),
  passed BOOLEAN,

  UNIQUE(document_id, user_id, document_version)
);

CREATE INDEX idx_doc_ack_user ON public.document_acknowledgments(user_id);

-- Professional development modules
CREATE TABLE IF NOT EXISTS public.pd_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,

  -- Identity
  title TEXT NOT NULL,
  description TEXT,

  -- Structure
  category TEXT, -- 'safety', 'youth_development', 'program_specific'
  estimated_minutes INT,

  -- Requirements
  is_required BOOLEAN DEFAULT false,
  required_by_date DATE,
  recertification_months INT, -- re-take every X months

  -- Prerequisites
  prerequisite_ids UUID[],

  -- Content (ordered list of document IDs)
  content_document_ids UUID[],

  -- Status
  is_published BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pd_modules_site ON public.pd_modules(site_id);

-- PD completions
CREATE TABLE IF NOT EXISTS public.pd_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.pd_modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Progress
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Assessment
  score NUMERIC(5,2),
  passed BOOLEAN,
  attempts INT DEFAULT 1,

  -- Certification
  certificate_url TEXT,
  expires_at TIMESTAMPTZ,

  UNIQUE(module_id, user_id)
);

CREATE INDEX idx_pd_completions_user ON public.pd_completions(user_id);

-- Staff certifications (external certs like CPR, First Aid)
CREATE TABLE IF NOT EXISTS public.staff_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Certification
  name TEXT NOT NULL, -- 'CPR', 'First Aid', 'Food Handler'
  issuing_org TEXT,
  credential_id TEXT,

  -- Validity
  issued_at DATE,
  expires_at DATE,

  -- Verification
  document_path TEXT, -- uploaded certificate
  verified_by UUID REFERENCES public.user_profiles(id),
  verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_certs_user ON public.staff_certifications(user_id);
CREATE INDEX idx_staff_certs_expiring ON public.staff_certifications(expires_at) WHERE expires_at IS NOT NULL;

-- Time entries (for payroll)
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,

  -- Timing
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,

  -- Breaks
  break_minutes INT DEFAULT 0,

  -- Classification
  entry_type TEXT DEFAULT 'regular' CHECK (entry_type IN (
    'regular',
    'overtime',
    'pd',
    'meeting',
    'event'
  )),

  -- Associations
  shift_id UUID REFERENCES public.staff_shifts(id),

  -- Approval
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'rejected',
    'exported'
  )),
  approved_by UUID REFERENCES public.user_profiles(id),
  approved_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_user ON public.time_entries(user_id, clock_in);
CREATE INDEX idx_time_entries_status ON public.time_entries(status) WHERE status = 'pending';

-- PTO requests
CREATE TABLE IF NOT EXISTS public.pto_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Request
  pto_type TEXT NOT NULL CHECK (pto_type IN (
    'vacation',
    'sick',
    'personal',
    'bereavement',
    'jury_duty',
    'other'
  )),
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  hours_requested NUMERIC(5,2),

  notes TEXT,

  -- Approval
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'denied',
    'cancelled'
  )),
  reviewed_by UUID REFERENCES public.user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pto_requests_user ON public.pto_requests(user_id);
CREATE INDEX idx_pto_requests_status ON public.pto_requests(status) WHERE status = 'pending';

-- ============================================================================
-- SECTION 5: DONOR MANAGEMENT
-- ============================================================================

-- Donors
CREATE TABLE IF NOT EXISTS public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- May or may not have a user account
  user_id UUID REFERENCES public.user_profiles(id),

  -- Contact info (if no user account)
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,

  -- Organization (if giving on behalf of)
  organization_name TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',

  -- Preferences
  is_anonymous BOOLEAN DEFAULT false,
  communication_preference TEXT DEFAULT 'email' CHECK (communication_preference IN ('email', 'mail', 'none')),

  -- Stripe
  stripe_customer_id TEXT UNIQUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donors_email ON public.donors(email);
CREATE INDEX idx_donors_stripe ON public.donors(stripe_customer_id);

-- Donations
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.donors(id),
  site_id UUID REFERENCES public.sites(id), -- null for org-wide

  -- Amount
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',

  -- Type
  donation_type TEXT DEFAULT 'one_time' CHECK (donation_type IN (
    'one_time',
    'recurring',
    'pledge',
    'in_kind'
  )),

  -- Designation
  designation TEXT, -- 'general', 'scholarships', 'equipment', etc.
  campaign_name TEXT,

  -- Payment
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  payment_method TEXT, -- 'card', 'ach', 'check'

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'completed',
    'failed',
    'refunded',
    'cancelled'
  )),

  -- For pledges
  pledge_frequency TEXT, -- 'monthly', 'quarterly', 'annual'
  pledge_end_date DATE,

  -- Recognition
  is_anonymous BOOLEAN DEFAULT false,
  recognition_name TEXT, -- how they want to be listed

  -- Notes
  donor_notes TEXT,
  internal_notes TEXT,

  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_donor ON public.donations(donor_id);
CREATE INDEX idx_donations_site ON public.donations(site_id);
CREATE INDEX idx_donations_date ON public.donations(completed_at DESC);

-- Recurring donations
CREATE TABLE IF NOT EXISTS public.recurring_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.donors(id),
  site_id UUID REFERENCES public.sites(id),

  -- Amount
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',

  -- Schedule
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'annual')),
  day_of_month INT, -- 1-28

  -- Stripe
  stripe_subscription_id TEXT UNIQUE,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'failed')),

  -- Tracking
  next_charge_date DATE,
  last_charge_date DATE,
  total_donated_cents INT DEFAULT 0,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_recurring_donations_donor ON public.recurring_donations(donor_id);
CREATE INDEX idx_recurring_donations_status ON public.recurring_donations(status);

-- ============================================================================
-- SECTION 6: NOTIFICATIONS
-- ============================================================================

-- Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Channels
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,

  -- Types
  announcements BOOLEAN DEFAULT true,
  messages BOOLEAN DEFAULT true,
  event_reminders BOOLEAN DEFAULT true,
  quest_updates BOOLEAN DEFAULT true,
  badge_awards BOOLEAN DEFAULT true,

  -- Digest
  digest_frequency TEXT DEFAULT 'instant' CHECK (digest_frequency IN ('instant', 'daily', 'weekly', 'none')),

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Type
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'announcement',
    'message',
    'event_reminder',
    'quest_update',
    'badge_award',
    'system',
    'parent_alert'
  )),

  -- Link
  action_url TEXT,

  -- Associations
  related_id UUID, -- message_id, event_id, etc.
  related_type TEXT,

  -- Status
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Delivery
  email_sent_at TIMESTAMPTZ,
  push_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE read_at IS NULL;

-- ============================================================================
-- SECTION 7: ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pd_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pd_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pto_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 8: HELPER FUNCTIONS
-- ============================================================================

-- Check if user is parent of youth
CREATE OR REPLACE FUNCTION public.is_parent_of(check_youth_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_links fl
    JOIN public.user_profiles up ON fl.parent_id = up.id
    WHERE up.auth_user_id = auth.uid()
      AND fl.youth_id = check_youth_id
      AND fl.revoked_at IS NULL
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user has communication authorization for youth
CREATE OR REPLACE FUNCTION public.can_contact_youth(check_youth_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.communication_authorizations ca
    JOIN public.user_profiles up ON ca.authorized_user_id = up.id
    WHERE up.auth_user_id = auth.uid()
      AND ca.youth_id = check_youth_id
      AND ca.revoked_at IS NULL
      AND (ca.expires_at IS NULL OR ca.expires_at > NOW())
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Generate claim code
CREATE OR REPLACE FUNCTION public.generate_claim_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no confusing chars
  code TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 9: BASIC RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Family links: parents see their own, staff see their site
CREATE POLICY "Parents see own family links"
  ON public.family_links FOR SELECT
  USING (parent_id = public.get_user_profile_id() OR youth_id = public.get_user_profile_id());

CREATE POLICY "Staff manage family links"
  ON public.family_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.site_memberships sm
      JOIN public.user_profiles up ON sm.user_id = up.id
      JOIN public.site_memberships ysm ON ysm.site_id = sm.site_id
      WHERE up.auth_user_id = auth.uid()
        AND sm.role IN ('staff', 'admin')
        AND ysm.user_id = family_links.youth_id
    )
  );

-- Messages: channel members can read, safety rails on youth
CREATE POLICY "Channel members can read messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members cm
      WHERE cm.channel_id = messages.channel_id
        AND cm.user_id = public.get_user_profile_id()
    )
  );

CREATE POLICY "Users can send to their channels"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = public.get_user_profile_id()
    AND EXISTS (
      SELECT 1 FROM public.channel_members cm
      WHERE cm.channel_id = messages.channel_id
        AND cm.user_id = public.get_user_profile_id()
    )
  );

-- Notifications: users see their own
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = public.get_user_profile_id());

CREATE POLICY "Users manage own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = public.get_user_profile_id());

-- Events: site members see, staff manage
CREATE POLICY "Site members can view events"
  ON public.events FOR SELECT
  USING (public.is_site_member(site_id) OR is_public = true);

CREATE POLICY "Staff can manage events"
  ON public.events FOR ALL
  USING (public.is_site_staff(site_id));

-- Documents: based on role requirements
CREATE POLICY "Users can view relevant documents"
  ON public.documents FOR SELECT
  USING (
    is_published = true
    AND (
      site_id IS NULL
      OR public.is_site_member(site_id)
    )
  );

CREATE POLICY "Staff can manage documents"
  ON public.documents FOR ALL
  USING (
    site_id IS NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.site_memberships sm ON sm.user_id = up.id
      WHERE up.auth_user_id = auth.uid()
        AND sm.role IN ('admin')
    )
    OR public.is_site_admin(site_id)
  );

-- Time entries: users see own, admins see site
CREATE POLICY "Users see own time entries"
  ON public.time_entries FOR SELECT
  USING (user_id = public.get_user_profile_id());

CREATE POLICY "Users manage own time entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (user_id = public.get_user_profile_id());

CREATE POLICY "Admins manage site time entries"
  ON public.time_entries FOR ALL
  USING (public.is_site_admin(site_id));

-- Donations: donors see own, admins see all
CREATE POLICY "Donors see own donations"
  ON public.donations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.donors d
      JOIN public.user_profiles up ON d.user_id = up.id
      WHERE d.id = donations.donor_id
        AND up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage donations"
  ON public.donations FOR ALL
  USING (
    site_id IS NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.site_memberships sm ON sm.user_id = up.id
      WHERE up.auth_user_id = auth.uid()
        AND sm.role = 'admin'
    )
    OR public.is_site_admin(site_id)
  );
