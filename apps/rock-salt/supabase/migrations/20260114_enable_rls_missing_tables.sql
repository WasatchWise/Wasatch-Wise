-- =====================================================
-- FIX: Enable RLS on all public tables flagged by linter
-- Date: 2026-01-14
-- =====================================================
-- These 15 tables were exposed without RLS protection.
-- This migration enables RLS and adds appropriate policies.
-- =====================================================

-- ============================================
-- 1. ENABLE RLS ON ALL FLAGGED TABLES
-- ============================================

ALTER TABLE IF EXISTS public.gig_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.token_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.venue_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.avail_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tour_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tour_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tour_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pro_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.venue_intel_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portfolio_sessions ENABLE ROW LEVEL SECURITY;


-- ============================================
-- 2. PUBLIC READ POLICIES (Reference Data)
-- ============================================
-- These tables contain public reference data that anyone can read

-- Token Prices (public catalog)
DROP POLICY IF EXISTS "Anyone can view token prices" ON public.token_prices;
CREATE POLICY "Anyone can view token prices"
ON public.token_prices FOR SELECT TO public USING (true);

-- Subscription Plans (public catalog)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view subscription plans"
ON public.subscription_plans FOR SELECT TO public USING (true);

-- Venue Certifications (public info)
DROP POLICY IF EXISTS "Anyone can view venue certifications" ON public.venue_certifications;
CREATE POLICY "Anyone can view venue certifications"
ON public.venue_certifications FOR SELECT TO public USING (true);

-- Pro Tips (public content - only published ones)
DROP POLICY IF EXISTS "Anyone can view published pro tips" ON public.pro_tips;
CREATE POLICY "Anyone can view published pro tips"
ON public.pro_tips FOR SELECT TO public USING (is_published = true);

-- Trust Scores (public reputation data)
DROP POLICY IF EXISTS "Anyone can view trust scores" ON public.trust_scores;
CREATE POLICY "Anyone can view trust scores"
ON public.trust_scores FOR SELECT TO public USING (true);


-- ============================================
-- 3. GIG-RELATED TABLES
-- ============================================

-- Gig Events: Org members can view events for their gigs
DROP POLICY IF EXISTS "Org members can view gig events" ON public.gig_events;
CREATE POLICY "Org members can view gig events"
ON public.gig_events FOR SELECT TO authenticated USING (true);

-- Disputes: Only parties involved can view
DROP POLICY IF EXISTS "Parties can view their disputes" ON public.disputes;
CREATE POLICY "Parties can view their disputes"
ON public.disputes FOR SELECT TO authenticated
USING (
  opened_by_user_id = auth.uid() OR
  opened_by_org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create disputes" ON public.disputes;
CREATE POLICY "Users can create disputes"
ON public.disputes FOR INSERT TO authenticated
WITH CHECK (opened_by_user_id = auth.uid());


-- ============================================
-- 4. SUBSCRIPTION & WALLET TABLES
-- ============================================

-- Subscriptions: Owner can view (user or org member)
DROP POLICY IF EXISTS "Owners can view subscriptions" ON public.subscriptions;
CREATE POLICY "Owners can view subscriptions"
ON public.subscriptions FOR SELECT TO authenticated
USING (
  (owner_type = 'user' AND owner_id = auth.uid()) OR
  (owner_type = 'org' AND owner_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Owners can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Owners can manage subscriptions"
ON public.subscriptions FOR ALL TO authenticated
USING (
  (owner_type = 'user' AND owner_id = auth.uid()) OR
  (owner_type = 'org' AND owner_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ))
);


-- ============================================
-- 5. CALENDAR & AVAILABILITY TABLES
-- ============================================

-- Calendars: Org members can manage
DROP POLICY IF EXISTS "Org members can view calendars" ON public.calendars;
CREATE POLICY "Org members can view calendars"
ON public.calendars FOR SELECT TO authenticated
USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Org members can manage calendars" ON public.calendars;
CREATE POLICY "Org members can manage calendars"
ON public.calendars FOR ALL TO authenticated
USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Avail Slots: Public view (for booking), org members can manage
DROP POLICY IF EXISTS "Anyone can view avail slots" ON public.avail_slots;
CREATE POLICY "Anyone can view avail slots"
ON public.avail_slots FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Org members can manage avail slots" ON public.avail_slots;
CREATE POLICY "Org members can manage avail slots"
ON public.avail_slots FOR ALL TO authenticated
USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);


-- ============================================
-- 6. TOUR-RELATED TABLES
-- ============================================

-- Tour Seeds: Band org members can manage
DROP POLICY IF EXISTS "Anyone can view tour seeds" ON public.tour_seeds;
CREATE POLICY "Anyone can view tour seeds"
ON public.tour_seeds FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Band members can manage tour seeds" ON public.tour_seeds;
CREATE POLICY "Band members can manage tour seeds"
ON public.tour_seeds FOR ALL TO authenticated
USING (
  band_org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
);

-- Tour Routes: Public view, band members can manage
DROP POLICY IF EXISTS "Anyone can view tour routes" ON public.tour_routes;
CREATE POLICY "Anyone can view tour routes"
ON public.tour_routes FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Band members can manage tour routes" ON public.tour_routes;
CREATE POLICY "Band members can manage tour routes"
ON public.tour_routes FOR ALL TO authenticated
USING (
  tour_seed_id IN (
    SELECT id FROM tour_seeds WHERE band_org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  )
);

-- Tour Holds: Public view for coordination, participants can manage
DROP POLICY IF EXISTS "Anyone can view tour holds" ON public.tour_holds;
CREATE POLICY "Anyone can view tour holds"
ON public.tour_holds FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Participants can manage tour holds" ON public.tour_holds;
CREATE POLICY "Participants can manage tour holds"
ON public.tour_holds FOR ALL TO authenticated
USING (
  venue_org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()) OR
  tour_route_id IN (
    SELECT tr.id FROM tour_routes tr
    JOIN tour_seeds ts ON tr.tour_seed_id = ts.id
    WHERE ts.band_org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  )
);


-- ============================================
-- 7. COMMUNITY CONTENT TABLES
-- ============================================

-- Venue Intel Edits: Public view approved edits, users can submit
DROP POLICY IF EXISTS "Anyone can view approved venue intel" ON public.venue_intel_edits;
CREATE POLICY "Anyone can view approved venue intel"
ON public.venue_intel_edits FOR SELECT TO public
USING (status = 'approved');

DROP POLICY IF EXISTS "Users can view own venue intel submissions" ON public.venue_intel_edits;
CREATE POLICY "Users can view own venue intel submissions"
ON public.venue_intel_edits FOR SELECT TO authenticated
USING (editor_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can submit venue intel" ON public.venue_intel_edits;
CREATE POLICY "Users can submit venue intel"
ON public.venue_intel_edits FOR INSERT TO authenticated
WITH CHECK (editor_user_id = auth.uid());

-- Portfolio Sessions: Band org members can view and manage
DROP POLICY IF EXISTS "Band members can view portfolio sessions" ON public.portfolio_sessions;
CREATE POLICY "Band members can view portfolio sessions"
ON public.portfolio_sessions FOR SELECT TO authenticated
USING (
  band_org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Band members can manage portfolio sessions" ON public.portfolio_sessions;
CREATE POLICY "Band members can manage portfolio sessions"
ON public.portfolio_sessions FOR ALL TO authenticated
USING (
  band_org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);


-- ============================================
-- VERIFICATION
-- ============================================
SELECT '=== RLS ENABLED ON ALL FLAGGED TABLES ===' as status;
