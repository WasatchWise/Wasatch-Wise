-- ==========================================
-- THE RING AT FULLMER LEGACY CENTER
-- Row Level Security Policies
-- ==========================================

-- Helper function to get user's profile id from auth.uid()
CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user is staff/admin at a site
CREATE OR REPLACE FUNCTION public.is_site_staff(check_site_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_memberships sm
    JOIN public.user_profiles up ON sm.user_id = up.id
    WHERE up.auth_user_id = auth.uid()
      AND sm.site_id = check_site_id
      AND sm.role IN ('staff', 'admin')
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user is admin at a site
CREATE OR REPLACE FUNCTION public.is_site_admin(check_site_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_memberships sm
    JOIN public.user_profiles up ON sm.user_id = up.id
    WHERE up.auth_user_id = auth.uid()
      AND sm.site_id = check_site_id
      AND sm.role = 'admin'
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user is member of a site
CREATE OR REPLACE FUNCTION public.is_site_member(check_site_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_memberships sm
    JOIN public.user_profiles up ON sm.user_id = up.id
    WHERE up.auth_user_id = auth.uid()
      AND sm.site_id = check_site_id
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ==========================================
-- SITES
-- ==========================================
-- All authenticated users can view active sites
CREATE POLICY "Anyone can view active sites"
  ON public.sites FOR SELECT
  USING (is_active = true);

-- Only admins can modify sites
CREATE POLICY "Admins can manage their sites"
  ON public.sites FOR ALL
  USING (public.is_site_admin(id));

-- ==========================================
-- USER PROFILES
-- ==========================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth_user_id = auth.uid());

-- Site members can view other members' profiles
CREATE POLICY "Site members can view other profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.site_memberships sm1
      JOIN public.site_memberships sm2 ON sm1.site_id = sm2.site_id
      JOIN public.user_profiles up ON sm1.user_id = up.id
      WHERE up.auth_user_id = auth.uid()
        AND sm2.user_id = user_profiles.id
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth_user_id = auth.uid());

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

-- ==========================================
-- SITE MEMBERSHIPS
-- ==========================================
-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON public.site_memberships FOR SELECT
  USING (user_id = public.get_user_profile_id());

-- Site staff can view all memberships for their site
CREATE POLICY "Staff can view site memberships"
  ON public.site_memberships FOR SELECT
  USING (public.is_site_staff(site_id));

-- Site admins can manage memberships
CREATE POLICY "Admins can manage site memberships"
  ON public.site_memberships FOR ALL
  USING (public.is_site_admin(site_id));

-- ==========================================
-- RINGS & PILLARS (Reference data - public read)
-- ==========================================
CREATE POLICY "Anyone can view rings"
  ON public.rings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view pillars"
  ON public.pillars FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- QUESTS
-- ==========================================
-- Site members can view active quests
CREATE POLICY "Site members can view quests"
  ON public.quests FOR SELECT
  USING (
    is_active = true
    AND public.is_site_member(site_id)
  );

-- Staff can view all quests for their site
CREATE POLICY "Staff can view all site quests"
  ON public.quests FOR SELECT
  USING (public.is_site_staff(site_id));

-- Staff can manage quests
CREATE POLICY "Staff can manage quests"
  ON public.quests FOR ALL
  USING (public.is_site_staff(site_id));

-- ==========================================
-- QUEST VERSIONS
-- ==========================================
CREATE POLICY "Site members can view quest versions"
  ON public.quest_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_versions.quest_id
        AND public.is_site_member(q.site_id)
    )
  );

CREATE POLICY "Staff can manage quest versions"
  ON public.quest_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_versions.quest_id
        AND public.is_site_staff(q.site_id)
    )
  );

-- ==========================================
-- QUEST RINGS
-- ==========================================
CREATE POLICY "Site members can view quest rings"
  ON public.quest_rings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_rings.quest_id
        AND public.is_site_member(q.site_id)
    )
  );

CREATE POLICY "Staff can manage quest rings"
  ON public.quest_rings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_rings.quest_id
        AND public.is_site_staff(q.site_id)
    )
  );

-- ==========================================
-- QUEST STEPS
-- ==========================================
CREATE POLICY "Site members can view quest steps"
  ON public.quest_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_steps.quest_id
        AND public.is_site_member(q.site_id)
    )
  );

CREATE POLICY "Staff can manage quest steps"
  ON public.quest_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_steps.quest_id
        AND public.is_site_staff(q.site_id)
    )
  );

-- ==========================================
-- QUEST PARTICIPATION
-- ==========================================
-- Users can view their own participation
CREATE POLICY "Users can view own participation"
  ON public.quest_participation FOR SELECT
  USING (user_id = public.get_user_profile_id());

-- Staff can view all participation at their site
CREATE POLICY "Staff can view site participation"
  ON public.quest_participation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_participation.quest_id
        AND public.is_site_staff(q.site_id)
    )
  );

-- Staff can manage participation
CREATE POLICY "Staff can manage participation"
  ON public.quest_participation FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_participation.quest_id
        AND public.is_site_staff(q.site_id)
    )
  );

-- Users can update their own participation status
CREATE POLICY "Users can update own participation"
  ON public.quest_participation FOR UPDATE
  USING (user_id = public.get_user_profile_id());

-- ==========================================
-- QUEST PROGRESS EVENTS
-- ==========================================
-- Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON public.quest_progress_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quest_participation qp
      WHERE qp.id = quest_progress_events.quest_participation_id
        AND qp.user_id = public.get_user_profile_id()
    )
  );

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON public.quest_progress_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quest_participation qp
      WHERE qp.id = quest_progress_events.quest_participation_id
        AND qp.user_id = public.get_user_profile_id()
    )
  );

-- Staff can view all progress at their site
CREATE POLICY "Staff can view site progress"
  ON public.quest_progress_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quest_participation qp
      JOIN public.quests q ON qp.quest_id = q.id
      WHERE qp.id = quest_progress_events.quest_participation_id
        AND public.is_site_staff(q.site_id)
    )
  );

-- ==========================================
-- PORTFOLIOS
-- ==========================================
-- Users can view their own portfolio
CREATE POLICY "Users can view own portfolio"
  ON public.portfolios FOR SELECT
  USING (user_id = public.get_user_profile_id());

-- Anyone can view public portfolios
CREATE POLICY "Anyone can view public portfolios"
  ON public.portfolios FOR SELECT
  USING (is_public = true);

-- Staff can view all portfolios at their site
CREATE POLICY "Staff can view site portfolios"
  ON public.portfolios FOR SELECT
  USING (public.is_site_staff(site_id));

-- Users can manage their own portfolio
CREATE POLICY "Users can manage own portfolio"
  ON public.portfolios FOR ALL
  USING (user_id = public.get_user_profile_id());

-- ==========================================
-- ARTIFACTS
-- ==========================================
-- Users can manage artifacts in their portfolio
CREATE POLICY "Users can manage own artifacts"
  ON public.artifacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = artifacts.portfolio_id
        AND p.user_id = public.get_user_profile_id()
    )
  );

-- Anyone can view artifacts in public portfolios
CREATE POLICY "Anyone can view public portfolio artifacts"
  ON public.artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = artifacts.portfolio_id
        AND p.is_public = true
    )
  );

-- Staff can view all artifacts at their site
CREATE POLICY "Staff can view site artifacts"
  ON public.artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = artifacts.portfolio_id
        AND public.is_site_staff(p.site_id)
    )
  );

-- ==========================================
-- BADGES
-- ==========================================
-- All authenticated users can view badges
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  TO authenticated
  USING (true);

-- Staff can manage badges for their site
CREATE POLICY "Staff can manage site badges"
  ON public.badges FOR ALL
  USING (site_id IS NULL OR public.is_site_staff(site_id));

-- ==========================================
-- USER BADGES
-- ==========================================
-- Users can view their own badges
CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (user_id = public.get_user_profile_id());

-- Staff can manage user badges
CREATE POLICY "Staff can manage user badges"
  ON public.user_badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.site_memberships sm
      WHERE sm.user_id = user_badges.user_id
        AND public.is_site_staff(sm.site_id)
    )
  );

-- ==========================================
-- RING ACTIVATION SNAPSHOTS
-- ==========================================
-- Users can view their own activation
CREATE POLICY "Users can view own activation"
  ON public.ring_activation_snapshots FOR SELECT
  USING (user_id = public.get_user_profile_id());

-- Staff can view all activations at their site
CREATE POLICY "Staff can view site activations"
  ON public.ring_activation_snapshots FOR SELECT
  USING (public.is_site_staff(site_id));

-- Staff can manage activations (for recalculation)
CREATE POLICY "Staff can manage site activations"
  ON public.ring_activation_snapshots FOR ALL
  USING (public.is_site_staff(site_id));

-- ==========================================
-- SESSIONS
-- ==========================================
-- Site members can view sessions
CREATE POLICY "Site members can view sessions"
  ON public.sessions FOR SELECT
  USING (public.is_site_member(site_id));

-- Staff can manage sessions
CREATE POLICY "Staff can manage sessions"
  ON public.sessions FOR ALL
  USING (public.is_site_staff(site_id));

-- ==========================================
-- SESSION ATTENDANCE
-- ==========================================
-- Users can view their own attendance
CREATE POLICY "Users can view own attendance"
  ON public.session_attendance FOR SELECT
  USING (user_id = public.get_user_profile_id());

-- Staff can view all attendance at their site
CREATE POLICY "Staff can view site attendance"
  ON public.session_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_attendance.session_id
        AND public.is_site_staff(s.site_id)
    )
  );

-- Staff can manage attendance
CREATE POLICY "Staff can manage attendance"
  ON public.session_attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_attendance.session_id
        AND public.is_site_staff(s.site_id)
    )
  );

-- ==========================================
-- PARTNER ORGS
-- ==========================================
-- Site members can view partners
CREATE POLICY "Site members can view partners"
  ON public.partner_orgs FOR SELECT
  USING (public.is_site_member(site_id));

-- Staff can manage partners
CREATE POLICY "Staff can manage partners"
  ON public.partner_orgs FOR ALL
  USING (public.is_site_staff(site_id));

-- ==========================================
-- PARTNER LOCATIONS
-- ==========================================
CREATE POLICY "Site members can view partner locations"
  ON public.partner_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_orgs po
      WHERE po.id = partner_locations.partner_org_id
        AND public.is_site_member(po.site_id)
    )
  );

CREATE POLICY "Staff can manage partner locations"
  ON public.partner_locations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_orgs po
      WHERE po.id = partner_locations.partner_org_id
        AND public.is_site_staff(po.site_id)
    )
  );

-- ==========================================
-- PARTNER MEMBERS
-- ==========================================
CREATE POLICY "Site members can view partner members"
  ON public.partner_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_orgs po
      WHERE po.id = partner_members.partner_org_id
        AND public.is_site_member(po.site_id)
    )
  );

CREATE POLICY "Staff can manage partner members"
  ON public.partner_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_orgs po
      WHERE po.id = partner_members.partner_org_id
        AND public.is_site_staff(po.site_id)
    )
  );

-- ==========================================
-- SERVICE ACTIVITIES
-- ==========================================
CREATE POLICY "Site members can view service activities"
  ON public.service_activities FOR SELECT
  USING (public.is_site_member(site_id));

CREATE POLICY "Staff can manage service activities"
  ON public.service_activities FOR ALL
  USING (public.is_site_staff(site_id));

-- ==========================================
-- SERVICE LOGS
-- ==========================================
-- Users can view their own service logs
CREATE POLICY "Users can view own service logs"
  ON public.service_logs FOR SELECT
  USING (user_id = public.get_user_profile_id());

-- Users can insert their own service logs
CREATE POLICY "Users can insert own service logs"
  ON public.service_logs FOR INSERT
  WITH CHECK (user_id = public.get_user_profile_id());

-- Staff can view and manage all service logs at their site
CREATE POLICY "Staff can manage site service logs"
  ON public.service_logs FOR ALL
  USING (public.is_site_staff(site_id));

-- ==========================================
-- ENDORSEMENTS
-- ==========================================
-- Anyone can view endorsements on public portfolios
CREATE POLICY "Anyone can view public endorsements"
  ON public.endorsements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = endorsements.portfolio_id
        AND p.is_public = true
    )
  );

-- Users can view endorsements on their own portfolio
CREATE POLICY "Users can view own endorsements"
  ON public.endorsements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = endorsements.portfolio_id
        AND p.user_id = public.get_user_profile_id()
    )
  );

-- Staff can manage endorsements
CREATE POLICY "Staff can manage endorsements"
  ON public.endorsements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = endorsements.portfolio_id
        AND public.is_site_staff(p.site_id)
    )
  );

-- ==========================================
-- SITE CONFIG
-- ==========================================
-- Staff can view site config
CREATE POLICY "Staff can view site config"
  ON public.site_config FOR SELECT
  USING (public.is_site_staff(site_id));

-- Admins can manage site config
CREATE POLICY "Admins can manage site config"
  ON public.site_config FOR ALL
  USING (public.is_site_admin(site_id));

-- ==========================================
-- ACTIVITY EVENTS
-- ==========================================
-- Users can view their own events
CREATE POLICY "Users can view own events"
  ON public.activity_events FOR SELECT
  USING (user_id = public.get_user_profile_id());

-- Users can insert their own events
CREATE POLICY "Users can insert own events"
  ON public.activity_events FOR INSERT
  WITH CHECK (user_id = public.get_user_profile_id());

-- Staff can view all events at their site
CREATE POLICY "Staff can view site events"
  ON public.activity_events FOR SELECT
  USING (public.is_site_staff(site_id));
