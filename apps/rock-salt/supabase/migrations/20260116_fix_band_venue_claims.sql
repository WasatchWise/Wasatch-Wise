-- Fix band/venue claim + creation authorization
-- Ensures authenticated users can claim unclaimed records and manage their own,
-- while admins retain full control.

-- =====================
-- Bands
-- =====================
ALTER TABLE public.bands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bands authenticated update claim or own" ON public.bands;
DROP POLICY IF EXISTS "Bands owners can claim" ON public.bands;
DROP POLICY IF EXISTS "Bands owners can update claimed" ON public.bands;
DROP POLICY IF EXISTS "Bands owners can insert" ON public.bands;
DROP POLICY IF EXISTS "Bands admins manage" ON public.bands;

CREATE POLICY "Bands owners can claim"
  ON public.bands FOR UPDATE
  TO authenticated
  USING (claimed_by IS NULL)
  WITH CHECK (claimed_by = auth.uid());

CREATE POLICY "Bands owners can update claimed"
  ON public.bands FOR UPDATE
  TO authenticated
  USING (claimed_by = auth.uid())
  WITH CHECK (claimed_by = auth.uid());

CREATE POLICY "Bands owners can insert"
  ON public.bands FOR INSERT
  TO authenticated
  WITH CHECK (claimed_by = auth.uid());

CREATE POLICY "Bands admins manage"
  ON public.bands FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- =====================
-- Venues
-- =====================
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Venue owners can update their venues" ON public.venues;
DROP POLICY IF EXISTS "Venues owners can claim" ON public.venues;
DROP POLICY IF EXISTS "Venues owners can update claimed" ON public.venues;
DROP POLICY IF EXISTS "Venues owners can insert" ON public.venues;
DROP POLICY IF EXISTS "Venues admins manage" ON public.venues;

CREATE POLICY "Venues owners can claim"
  ON public.venues FOR UPDATE
  TO authenticated
  USING (claimed_by IS NULL)
  WITH CHECK (claimed_by = auth.uid());

CREATE POLICY "Venues owners can update claimed"
  ON public.venues FOR UPDATE
  TO authenticated
  USING (claimed_by = auth.uid())
  WITH CHECK (claimed_by = auth.uid());

CREATE POLICY "Venues owners can insert"
  ON public.venues FOR INSERT
  TO authenticated
  WITH CHECK (claimed_by = auth.uid());

CREATE POLICY "Venues admins manage"
  ON public.venues FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
