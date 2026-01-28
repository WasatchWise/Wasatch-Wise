-- ============================================================================
-- Migration Script: Preserve Existing Data and Migrate to New Schema
-- 
-- This script:
-- 1. Backs up existing data
-- 2. Renames conflicting tables
-- 3. Allows you to run the full schema.sql
-- 4. Migrates data from old structure to new structure
-- ============================================================================

-- STEP 1: Backup existing data into temporary tables
-- ============================================================================

-- Backup daite_users data
CREATE TABLE IF NOT EXISTS migration_backup_daite_users AS 
SELECT * FROM daite_users;

-- Backup cyraino_agents data
CREATE TABLE IF NOT EXISTS migration_backup_cyraino_agents AS 
SELECT * FROM cyraino_agents;

-- Backup other tables (these will fail silently if source tables don't exist)
CREATE TABLE IF NOT EXISTS migration_backup_user_connections AS
SELECT * FROM user_connections;

CREATE TABLE IF NOT EXISTS migration_backup_agent_dialogues AS
SELECT * FROM agent_dialogues;

CREATE TABLE IF NOT EXISTS migration_backup_planned_meetups AS
SELECT * FROM planned_meetups;

CREATE TABLE IF NOT EXISTS migration_backup_user_traits AS
SELECT * FROM user_traits;

CREATE TABLE IF NOT EXISTS migration_backup_token_transactions AS
SELECT * FROM token_transactions;

CREATE TABLE IF NOT EXISTS migration_backup_connection_feedback AS
SELECT * FROM connection_feedback;

-- STEP 2: Rename existing tables (so schema.sql can create new ones)
-- ============================================================================

ALTER TABLE IF EXISTS public.daite_users RENAME TO old_daite_users;
ALTER TABLE IF EXISTS public.user_connections RENAME TO old_user_connections;
ALTER TABLE IF EXISTS public.agent_dialogues RENAME TO old_agent_dialogues;
ALTER TABLE IF EXISTS public.cyraino_agents RENAME TO old_cyraino_agents;
ALTER TABLE IF EXISTS public.vibe_checks RENAME TO old_vibe_checks;
ALTER TABLE IF EXISTS public.planned_meetups RENAME TO old_planned_meetups;
ALTER TABLE IF EXISTS public.user_traits RENAME TO old_user_traits;
ALTER TABLE IF EXISTS public.token_transactions RENAME TO old_token_transactions;
ALTER TABLE IF EXISTS public.connection_feedback RENAME TO old_connection_feedback;

-- STEP 3: Now run the full schema.sql file
-- ============================================================================
-- Go to Supabase SQL Editor and paste/run database/schema.sql
-- Come back here after that's done, then continue with STEP 4

-- STEP 4: Migrate data from old tables to new tables
-- ============================================================================
-- ⚠️ IMPORTANT: Run this AFTER you've run schema.sql
-- Check that new tables exist before running this section!

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE EXCEPTION 
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' || E'\n' ||
            '❌ ERROR: New tables not found!' || E'\n' ||
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' || E'\n' ||
            '' || E'\n' ||
            'You are on Step 4, but Step 3 is not complete yet.' || E'\n' ||
            '' || E'\n' ||
            '➡️  NEXT ACTION:' || E'\n' ||
            '   1. Open database/schema.sql' || E'\n' ||
            '   2. Copy the ENTIRE file' || E'\n' ||
            '   3. Paste into Supabase SQL Editor' || E'\n' ||
            '   4. Run it to create all new tables' || E'\n' ||
            '   5. THEN come back and run Step 4' || E'\n' ||
            '' || E'\n' ||
            'Quick check: Run database/check-migration-status.sql to see your current step.';
    ELSE
        RAISE NOTICE '✅ New schema tables found - proceeding with migration...';
    END IF;
END $$;

-- Migrate users from daite_users to users
-- Based on your existing structure, we need to check columns first
DO $$
DECLARE
    user_count INTEGER;
    col_list TEXT;
BEGIN
    -- Check if old table exists and has data
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_daite_users') THEN
        -- Get count
        EXECUTE 'SELECT COUNT(*) FROM old_daite_users' INTO user_count;
        RAISE NOTICE 'Found % users to migrate', user_count;
        
        IF user_count > 0 THEN
            -- Check what columns exist in old table
            SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
            INTO col_list
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'old_daite_users';
            
            RAISE NOTICE 'Columns in old_daite_users: %', col_list;
            
            -- Try to migrate - handles common column name variations
            BEGIN
                -- Try with standard column names first
                INSERT INTO public.users (id, email, pseudonym, created_at, updated_at, last_active_at)
                SELECT 
                    id,
                    COALESCE(
                        email, 
                        (SELECT email FROM auth.users WHERE id = old_daite_users.id),
                        'user_' || substring(id::text from 1 for 8) || '@migrated.local'
                    ) as email,
                    COALESCE(pseudonym, username, display_name, 'User_' || substring(id::text from 1 for 8)) as pseudonym,
                    COALESCE(created_at, now()) as created_at,
                    COALESCE(updated_at, now()) as updated_at,
                    COALESCE(last_active_at, last_seen_at, now()) as last_active_at
                FROM old_daite_users
                ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    pseudonym = EXCLUDED.pseudonym,
                    updated_at = EXCLUDED.updated_at;
                
                RAISE NOTICE '✅ Migrated % users successfully', user_count;
            EXCEPTION WHEN others THEN
                RAISE NOTICE '❌ Error migrating users: %', SQLERRM;
                RAISE NOTICE 'Column mapping failed. Please check column names in old_daite_users.';
                RAISE NOTICE 'Existing columns: %', col_list;
            END;
        ELSE
            RAISE NOTICE 'No users to migrate';
        END IF;
    ELSE
        RAISE NOTICE 'old_daite_users table not found (may have been renamed)';
    END IF;
END $$;

-- Migrate cyraino_agents
-- Based on your data structure: id, user_id, name, personality_summary, communication_style, etc.
DO $$
DECLARE
    agent_count INTEGER;
    col_list TEXT;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_cyraino_agents') THEN
        -- Get count
        EXECUTE 'SELECT COUNT(*) FROM old_cyraino_agents' INTO agent_count;
        RAISE NOTICE 'Found % cyraino_agents to migrate', agent_count;
        
        IF agent_count > 0 THEN
            -- Check columns
            SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
            INTO col_list
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'old_cyraino_agents';
            
            RAISE NOTICE 'Columns in old_cyraino_agents: %', col_list;
            
            BEGIN
                -- Migrate with your actual structure
                -- Your structure: id, user_id, name, personality_summary, communication_style, embedding, last_trained, created_at
                INSERT INTO public.cyraino_agents (
                    id, 
                    user_id, 
                    name, 
                    personality_traits, 
                    agent_embedding,
                    created_at, 
                    updated_at
                )
                SELECT 
                    id,
                    user_id,
                    name,
                    -- Combine personality_summary and communication_style into personality_traits JSONB
                    jsonb_build_object(
                        'personality_summary', personality_summary,
                        'communication_style', communication_style,
                        'humor', COALESCE((communication_style->>'humor')::numeric, 0.5),
                        'empathy', COALESCE((communication_style->>'empathy')::numeric, 0.8),
                        'directness', COALESCE((communication_style->>'directness')::numeric, 0.6)
                    ) as personality_traits,
                    -- Map embedding to agent_embedding (will be null if not set, which is fine)
                    embedding as agent_embedding,
                    COALESCE(created_at, now()) as created_at,
                    COALESCE(last_trained, created_at, now()) as updated_at
                FROM old_cyraino_agents
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    personality_traits = EXCLUDED.personality_traits,
                    agent_embedding = EXCLUDED.agent_embedding,
                    updated_at = EXCLUDED.updated_at;
                
                RAISE NOTICE '✅ Migrated % cyraino_agents successfully', agent_count;
                RAISE NOTICE '   Preserved: personality_summary, communication_style (humor/empathy/directness)';
            EXCEPTION WHEN others THEN
                RAISE NOTICE '❌ Error migrating cyraino_agents: %', SQLERRM;
                RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
                RAISE NOTICE 'Column mapping failed. Existing columns: %', col_list;
                RAISE NOTICE 'Expected columns: id, user_id, name, personality_summary, communication_style, embedding, last_trained, created_at';
            END;
        ELSE
            RAISE NOTICE 'No agents to migrate';
        END IF;
    ELSE
        RAISE NOTICE 'old_cyraino_agents table not found';
    END IF;
END $$;

-- STEP 5: Verify migration
-- ============================================================================

-- Check what tables exist and show row counts
DO $$
DECLARE
    result_text TEXT := '';
BEGIN
    -- Check if new users table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.users' INTO result_text;
        RAISE NOTICE 'users table: % rows', result_text;
    ELSE
        RAISE NOTICE 'users table: NOT CREATED YET - Run schema.sql first!';
    END IF;
    
    -- Check if new cyraino_agents table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cyraino_agents') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.cyraino_agents' INTO result_text;
        RAISE NOTICE 'cyraino_agents table: % rows', result_text;
    ELSE
        RAISE NOTICE 'cyraino_agents table: NOT CREATED YET - Run schema.sql first!';
    END IF;
    
    -- Check backup tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_daite_users') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.old_daite_users' INTO result_text;
        RAISE NOTICE 'old_daite_users (backup): % rows', result_text;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_cyraino_agents') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.old_cyraino_agents' INTO result_text;
        RAISE NOTICE 'old_cyraino_agents (backup): % rows', result_text;
    END IF;
END $$;

-- Alternative: Query-based verification (only if tables exist)
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'users' THEN (SELECT COUNT(*)::TEXT FROM public.users)
        WHEN table_name = 'cyraino_agents' THEN (SELECT COUNT(*)::TEXT FROM public.cyraino_agents)
        WHEN table_name = 'old_daite_users' THEN (SELECT COUNT(*)::TEXT FROM public.old_daite_users)
        WHEN table_name = 'old_cyraino_agents' THEN (SELECT COUNT(*)::TEXT FROM public.old_cyraino_agents)
        ELSE '0'
    END as row_count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('users', 'cyraino_agents', 'old_daite_users', 'old_cyraino_agents')
    AND EXISTS (
        SELECT 1 FROM information_schema.tables t2 
        WHERE t2.table_schema = 'public' 
        AND t2.table_name = tables.table_name
    )
ORDER BY table_name;

-- STEP 6: Clean up old tables (ONLY after verifying migration worked!)
-- ============================================================================
-- Uncomment these when you're sure the migration worked:
/*
DROP TABLE IF EXISTS old_daite_users;
DROP TABLE IF EXISTS old_user_connections;
DROP TABLE IF EXISTS old_agent_dialogues;
DROP TABLE IF EXISTS old_cyraino_agents;
DROP TABLE IF EXISTS old_vibe_checks;
DROP TABLE IF EXISTS old_planned_meetups;
DROP TABLE IF EXISTS old_user_traits;
DROP TABLE IF EXISTS old_token_transactions;
DROP TABLE IF EXISTS old_connection_feedback;

-- Keep backups for a while
-- DROP TABLE IF EXISTS migration_backup_daite_users;
-- DROP TABLE IF EXISTS migration_backup_cyraino_agents;
*/

