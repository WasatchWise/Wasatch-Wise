-- ============================================================================
-- Enable Row Level Security (RLS) and Create Policies
-- This secures all active tables in the public schema
-- ============================================================================

-- ============================================================================
-- STEP 1: Enable RLS on All Active Tables
-- ============================================================================

-- User Data Tables
ALTER TABLE public.pseudonym_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendship_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountability_scores ENABLE ROW LEVEL SECURITY;

-- Safety Tables
ALTER TABLE public.safety_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_safety ENABLE ROW LEVEL SECURITY;

-- Dating/Events Tables
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_feedback ENABLE ROW LEVEL SECURITY;

-- Billing Tables
ALTER TABLE public.token_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Create RLS Policies for User Data Tables
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own pseudonym history" ON public.pseudonym_history;
DROP POLICY IF EXISTS "Users can insert own pseudonym history" ON public.pseudonym_history;
DROP POLICY IF EXISTS "Users can view own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can view assessment templates" ON public.assessments;
DROP POLICY IF EXISTS "Users can view own assessment results" ON public.user_assessments;
DROP POLICY IF EXISTS "Users can insert own assessment results" ON public.user_assessments;
DROP POLICY IF EXISTS "Users can view own saved discoveries" ON public.saved_discoveries;
DROP POLICY IF EXISTS "Users can save their own discoveries" ON public.saved_discoveries;
DROP POLICY IF EXISTS "Users can manage own message drafts" ON public.message_drafts;
DROP POLICY IF EXISTS "Users can manage own friendship settings" ON public.friendship_settings;
DROP POLICY IF EXISTS "Users can view own accountability scores" ON public.accountability_scores;
DROP POLICY IF EXISTS "Only service role can manage safety flags" ON public.safety_flags;
DROP POLICY IF EXISTS "Users can view own date safety" ON public.date_safety;
DROP POLICY IF EXISTS "Users can update own date safety" ON public.date_safety;
DROP POLICY IF EXISTS "Anyone can view venues" ON public.venues;
DROP POLICY IF EXISTS "Only service role can modify venues" ON public.venues;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Only service role can modify events" ON public.events;
DROP POLICY IF EXISTS "Users can view own planned dates" ON public.planned_dates;
DROP POLICY IF EXISTS "Users can create dates they're part of" ON public.planned_dates;
DROP POLICY IF EXISTS "Users can update own dates" ON public.planned_dates;
DROP POLICY IF EXISTS "Users can view feedback for own dates" ON public.date_feedback;
DROP POLICY IF EXISTS "Users can create feedback for own dates" ON public.date_feedback;
DROP POLICY IF EXISTS "Users can view own token purchases" ON public.token_purchases;
DROP POLICY IF EXISTS "Users can create own token purchases" ON public.token_purchases;
DROP POLICY IF EXISTS "Users can view own premium subscriptions" ON public.premium_subscriptions;
DROP POLICY IF EXISTS "Users can update own premium subscriptions" ON public.premium_subscriptions;

-- pseudonym_history: Users can only see their own pseudonym history
CREATE POLICY "Users can view own pseudonym history"
    ON public.pseudonym_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pseudonym history"
    ON public.pseudonym_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- assessments: Assessment templates are public (no user_id column - these are templates)
CREATE POLICY "Anyone can view assessment templates"
    ON public.assessments
    FOR SELECT
    USING (true); -- Assessment templates are public, no user_id

-- user_assessments: Users can read their own assessment results
CREATE POLICY "Users can view own assessment results"
    ON public.user_assessments
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessment results"
    ON public.user_assessments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- saved_discoveries: Users can only see discoveries they saved
-- Note: saved_discoveries table has user_id column
CREATE POLICY "Users can view own saved discoveries"
    ON public.saved_discoveries
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.discoveries d
            WHERE d.id = saved_discoveries.discovery_id
            AND (d.discoverer_user_id = auth.uid() OR d.discovered_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can save their own discoveries"
    ON public.saved_discoveries
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.discoveries d
            WHERE d.id = saved_discoveries.discovery_id
            AND d.discoverer_user_id = auth.uid()
        )
    );

-- message_drafts: Users can only access their own drafts
CREATE POLICY "Users can manage own message drafts"
    ON public.message_drafts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- friendship_settings: Users can manage their own settings
CREATE POLICY "Users can manage own friendship settings"
    ON public.friendship_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- accountability_scores: Users can view their own scores
CREATE POLICY "Users can view own accountability scores"
    ON public.accountability_scores
    FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 3: Create RLS Policies for Safety Tables
-- ============================================================================

-- safety_flags: Users cannot directly access (admin/system only)
-- These are managed by the system, so we restrict all access
CREATE POLICY "Only service role can manage safety flags"
    ON public.safety_flags
    FOR ALL
    USING (false) -- Regular users cannot access
    WITH CHECK (false);

-- Note: System/service role will need to bypass RLS or use service_role key

-- date_safety: Users can only see their own date safety data
CREATE POLICY "Users can view own date safety"
    ON public.date_safety
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.planned_dates pd
            WHERE pd.id = date_safety.date_id
            AND (pd.planned_by_user_id = auth.uid() OR pd.other_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can update own date safety"
    ON public.date_safety
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.planned_dates pd
            WHERE pd.id = date_safety.date_id
            AND (pd.planned_by_user_id = auth.uid() OR pd.other_user_id = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.planned_dates pd
            WHERE pd.id = date_safety.date_id
            AND (pd.planned_by_user_id = auth.uid() OR pd.other_user_id = auth.uid())
        )
    );

-- ============================================================================
-- STEP 4: Create RLS Policies for Dating/Events Tables
-- ============================================================================

-- venues: Public read access, but only system can modify
CREATE POLICY "Anyone can view venues"
    ON public.venues
    FOR SELECT
    USING (true); -- Venues are public information

CREATE POLICY "Only service role can modify venues"
    ON public.venues
    FOR ALL
    USING (false) -- Regular users cannot modify
    WITH CHECK (false);

-- events: Public read access, but only system can modify
CREATE POLICY "Anyone can view events"
    ON public.events
    FOR SELECT
    USING (true); -- Events are public information

CREATE POLICY "Only service role can modify events"
    ON public.events
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- planned_dates: Users can only see dates they're part of
CREATE POLICY "Users can view own planned dates"
    ON public.planned_dates
    FOR SELECT
    USING (
        planned_by_user_id = auth.uid() 
        OR other_user_id = auth.uid()
    );

CREATE POLICY "Users can create dates they're part of"
    ON public.planned_dates
    FOR INSERT
    WITH CHECK (planned_by_user_id = auth.uid());

CREATE POLICY "Users can update own dates"
    ON public.planned_dates
    FOR UPDATE
    USING (
        planned_by_user_id = auth.uid() 
        OR other_user_id = auth.uid()
    )
    WITH CHECK (
        planned_by_user_id = auth.uid() 
        OR other_user_id = auth.uid()
    );

-- date_feedback: Users can only see feedback for their dates
CREATE POLICY "Users can view feedback for own dates"
    ON public.date_feedback
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.planned_dates pd
            WHERE pd.id = date_feedback.date_id
            AND (pd.planned_by_user_id = auth.uid() OR pd.other_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create feedback for own dates"
    ON public.date_feedback
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.planned_dates pd
            WHERE pd.id = date_feedback.date_id
            AND (pd.planned_by_user_id = auth.uid() OR pd.other_user_id = auth.uid())
        )
    );

-- ============================================================================
-- STEP 5: Create RLS Policies for Billing Tables
-- ============================================================================

-- token_purchases: Users can only see their own purchases
CREATE POLICY "Users can view own token purchases"
    ON public.token_purchases
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own token purchases"
    ON public.token_purchases
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- premium_subscriptions: Users can only see their own subscriptions
CREATE POLICY "Users can view own premium subscriptions"
    ON public.premium_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own premium subscriptions"
    ON public.premium_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Verification: Check RLS Status
-- ============================================================================

-- This query will show which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) 
     FROM pg_policies 
     WHERE schemaname = t.schemaname 
     AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename NOT LIKE 'old_%'
    AND tablename NOT LIKE 'migration_backup_%'
ORDER BY tablename;

