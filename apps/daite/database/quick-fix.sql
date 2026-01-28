-- ============================================================================
-- Quick Fix: Rename Existing Tables, Then Run Full Schema
-- ============================================================================
-- This preserves your existing data while allowing the full schema to run
-- ============================================================================

-- STEP 1: Rename existing tables to backup names
-- Run these one at a time, checking each works

DO $$
BEGIN
    -- Rename existing tables if they exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daite_users') THEN
        ALTER TABLE public.daite_users RENAME TO daite_users_backup;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_connections') THEN
        ALTER TABLE public.user_connections RENAME TO user_connections_backup;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agent_dialogues') THEN
        ALTER TABLE public.agent_dialogues RENAME TO agent_dialogues_backup;
    END IF;
    
    -- cyraino_agents, vibe_checks - these match the new schema, so we can keep them
    -- But we need to check if they have the right structure
    
END $$;

-- STEP 2: After running this, go run the full schema.sql
-- Then come back and migrate data if needed

-- STEP 3: Migrate data from backup tables (if needed)
/*
-- Example: If you want to migrate daite_users to users
INSERT INTO public.users (id, email, pseudonym, created_at)
SELECT id, email, pseudonym, created_at
FROM public.daite_users_backup
ON CONFLICT (id) DO NOTHING;

-- Then drop backup tables when ready
-- DROP TABLE IF EXISTS public.daite_users_backup;
*/

