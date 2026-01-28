-- ============================================================================
-- Cleanup Legacy/Backup Tables
-- 
-- OPTIONS:
-- 1. Move to archive schema (RECOMMENDED - Keeps Data, Removes from Public)
-- 2. Enable RLS temporarily (if you want to keep in public but secure them)
-- 3. Drop tables (permanent deletion - only if you're 100% sure)
-- 
-- ⚠️  WARNING: Only run this AFTER you've verified your migration worked!
-- ============================================================================

-- ============================================================================
-- OPTION 1: Move to Archive Schema (RECOMMENDED - Keeps Data, Fixes Linter Errors)
-- ============================================================================

-- Create archive schema
CREATE SCHEMA IF NOT EXISTS archive;

-- Move old tables to archive
DO $$
DECLARE
    tables_to_archive TEXT[] := ARRAY[
        'old_daite_users',
        'old_cyraino_agents',
        'old_user_traits',
        'old_vibe_checks',
        'old_user_connections',
        'old_agent_dialogues',
        'old_planned_meetups',
        'old_token_transactions',
        'old_connection_feedback',
        'migration_backup_daite_users',
        'migration_backup_cyraino_agents',
        'migration_backup_user_connections',
        'migration_backup_agent_dialogues',
        'migration_backup_vibe_checks'
    ];
    table_name TEXT;
    moved_count INTEGER := 0;
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Moving legacy tables to archive schema...';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    FOREACH table_name IN ARRAY tables_to_archive
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            BEGIN
                EXECUTE format('ALTER TABLE public.%I SET SCHEMA archive', table_name);
                RAISE NOTICE '✅ Moved % to archive schema', table_name;
                moved_count := moved_count + 1;
            EXCEPTION WHEN others THEN
                RAISE NOTICE '⚠️  Error moving %: %', table_name, SQLERRM;
            END;
        ELSE
            RAISE NOTICE '⏭️  % does not exist (already moved or never existed)', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ Moved % table(s) to archive schema', moved_count;
    RAISE NOTICE '   These tables are no longer in public schema - linter errors fixed!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================================================
-- OPTION 2: Enable RLS on Legacy Tables (Alternative - Keeps in Public)
-- ============================================================================
-- Uncomment if you prefer to keep tables in public but secure them
/*
DO $$
DECLARE
    tables_to_secure TEXT[] := ARRAY[
        'old_daite_users',
        'old_cyraino_agents',
        'old_user_traits',
        'old_vibe_checks',
        'old_user_connections',
        'old_agent_dialogues',
        'old_planned_meetups',
        'old_token_transactions',
        'old_connection_feedback',
        'migration_backup_daite_users',
        'migration_backup_cyraino_agents',
        'migration_backup_user_connections',
        'migration_backup_agent_dialogues',
        'migration_backup_vibe_checks'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY tables_to_secure
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
            -- Block all access (these are archived tables)
            EXECUTE format('CREATE POLICY "Block all access" ON public.%I FOR ALL USING (false) WITH CHECK (false)', table_name);
            RAISE NOTICE '✅ Enabled RLS on %', table_name;
        END IF;
    END LOOP;
END $$;
*/

-- ============================================================================
-- OPTION 2: Drop Tables (PERMANENT - Only if you're sure!)
-- ============================================================================

-- Uncomment these only if you want to permanently delete the tables
/*
DROP TABLE IF EXISTS public.old_daite_users CASCADE;
DROP TABLE IF EXISTS public.old_cyraino_agents CASCADE;
DROP TABLE IF EXISTS public.old_user_traits CASCADE;
DROP TABLE IF EXISTS public.old_vibe_checks CASCADE;
DROP TABLE IF EXISTS public.old_user_connections CASCADE;
DROP TABLE IF EXISTS public.old_agent_dialogues CASCADE;
DROP TABLE IF EXISTS public.old_planned_meetups CASCADE;
DROP TABLE IF EXISTS public.old_token_transactions CASCADE;
DROP TABLE IF EXISTS public.old_connection_feedback CASCADE;

DROP TABLE IF EXISTS public.migration_backup_daite_users CASCADE;
DROP TABLE IF EXISTS public.migration_backup_cyraino_agents CASCADE;
DROP TABLE IF EXISTS public.migration_backup_user_connections CASCADE;
DROP TABLE IF EXISTS public.migration_backup_agent_dialogues CASCADE;
DROP TABLE IF EXISTS public.migration_backup_vibe_checks CASCADE;
*/

-- ============================================================================
-- Verify Cleanup
-- ============================================================================

-- Check remaining tables in public schema
SELECT 
    table_name,
    CASE 
        WHEN table_name LIKE 'old_%' THEN '⚠️  Still in public (should be archived)'
        WHEN table_name LIKE 'migration_backup_%' THEN '⚠️  Still in public (should be archived)'
        ELSE '✅ Active table'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name LIKE 'old_%' OR table_name LIKE 'migration_backup_%' THEN 0
        ELSE 1
    END,
    table_name;

-- Check archive schema (if using Option 1)
SELECT 
    'archive.' || table_name as archived_table,
    (SELECT COUNT(*)::TEXT 
     FROM information_schema.columns 
     WHERE table_schema = 'archive' 
     AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'archive'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

