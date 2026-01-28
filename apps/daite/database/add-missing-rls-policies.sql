-- ============================================================================
-- Add Missing RLS Policies
-- These tables have RLS enabled but no policies (currently blocking all access)
-- ============================================================================

-- ============================================================================
-- CYRAiNO Agent Tables
-- ============================================================================

-- cyraino_agents: Users can only access their own agent
DROP POLICY IF EXISTS "Users can manage own cyraino agent" ON public.cyraino_agents;
CREATE POLICY "Users can manage own cyraino agent"
    ON public.cyraino_agents
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- agent_memory: Users can only access memory for their own agent
DROP POLICY IF EXISTS "Users can manage own agent memory" ON public.agent_memory;
CREATE POLICY "Users can manage own agent memory"
    ON public.agent_memory
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.cyraino_agents ca
            WHERE ca.id = agent_memory.agent_id
            AND ca.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cyraino_agents ca
            WHERE ca.id = agent_memory.agent_id
            AND ca.user_id = auth.uid()
        )
    );

-- agent_learning_logs: Users can only access learning logs for their own agent
DROP POLICY IF EXISTS "Users can view own agent learning logs" ON public.agent_learning_logs;
CREATE POLICY "Users can view own agent learning logs"
    ON public.agent_learning_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cyraino_agents ca
            WHERE ca.id = agent_learning_logs.agent_id
            AND ca.user_id = auth.uid()
        )
    );

-- agent_conversations: Users can only see conversations involving their agent
DROP POLICY IF EXISTS "Users can view own agent conversations" ON public.agent_conversations;
CREATE POLICY "Users can view own agent conversations"
    ON public.agent_conversations
    FOR SELECT
    USING (
        user_1_id = auth.uid() 
        OR user_2_id = auth.uid()
    );

-- ============================================================================
-- Matching & Discovery Tables
-- ============================================================================

-- vibe_checks: Users can only see their own vibe checks
DROP POLICY IF EXISTS "Users can manage own vibe checks" ON public.vibe_checks;
CREATE POLICY "Users can manage own vibe checks"
    ON public.vibe_checks
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- discoveries: Users can see discoveries they created or were discovered by
DROP POLICY IF EXISTS "Users can view own discoveries" ON public.discoveries;
CREATE POLICY "Users can view own discoveries"
    ON public.discoveries
    FOR SELECT
    USING (
        discoverer_user_id = auth.uid() 
        OR discovered_user_id = auth.uid()
    );

CREATE POLICY "Users can update own discoveries"
    ON public.discoveries
    FOR UPDATE
    USING (discoverer_user_id = auth.uid())
    WITH CHECK (discoverer_user_id = auth.uid());

-- ============================================================================
-- User Profile Tables
-- ============================================================================

-- user_settings: Users can only manage their own settings
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings"
    ON public.user_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_neurodivergent_profile: Users can only manage their own ND profile
DROP POLICY IF EXISTS "Users can manage own ND profile" ON public.user_neurodivergent_profile;
CREATE POLICY "Users can manage own ND profile"
    ON public.user_neurodivergent_profile
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_photos: Users can only manage their own photos
DROP POLICY IF EXISTS "Users can manage own photos" ON public.user_photos;
CREATE POLICY "Users can manage own photos"
    ON public.user_photos
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- photo_reveals: Users can see reveals for photos they can view
-- This is more complex - users can see reveals based on reveal_level and their relationship
DROP POLICY IF EXISTS "Users can view photo reveals" ON public.photo_reveals;
CREATE POLICY "Users can view photo reveals"
    ON public.photo_reveals
    FOR SELECT
    USING (
        viewer_user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_photos up
            WHERE up.id = photo_reveals.photo_id
            AND up.user_id = auth.uid()
        )
    );

-- ============================================================================
-- Messaging Tables
-- ============================================================================

-- conversations: Users can only see conversations they're part of
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
    ON public.conversations
    FOR SELECT
    USING (
        user_1_id = auth.uid() 
        OR user_2_id = auth.uid()
    );

CREATE POLICY "Users can update own conversations"
    ON public.conversations
    FOR UPDATE
    USING (
        user_1_id = auth.uid() 
        OR user_2_id = auth.uid()
    )
    WITH CHECK (
        user_1_id = auth.uid() 
        OR user_2_id = auth.uid()
    );

-- ============================================================================
-- Safety & Verification Tables
-- ============================================================================

-- verifications: Users can only see their own verifications
DROP POLICY IF EXISTS "Users can view own verifications" ON public.verifications;
CREATE POLICY "Users can view own verifications"
    ON public.verifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verifications"
    ON public.verifications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- reports: Users can only see reports they created
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports"
    ON public.reports
    FOR SELECT
    USING (auth.uid() = reporter_user_id);

CREATE POLICY "Users can create reports"
    ON public.reports
    FOR INSERT
    WITH CHECK (auth.uid() = reporter_user_id);

-- ============================================================================
-- Token Economy
-- ============================================================================

-- token_transactions: Users can only see their own transactions
DROP POLICY IF EXISTS "Users can view own token transactions" ON public.token_transactions;
CREATE POLICY "Users can view own token transactions"
    ON public.token_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================================
-- Verification: Check all tables now have policies
-- ============================================================================

SELECT 
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) 
     FROM pg_policies 
     WHERE schemaname = 'public' 
     AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename NOT LIKE 'old_%'
    AND tablename NOT LIKE 'migration_backup_%'
    AND rowsecurity = true
ORDER BY policy_count, tablename;

