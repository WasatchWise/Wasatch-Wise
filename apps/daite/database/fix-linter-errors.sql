-- ============================================================================
-- Fix Supabase Linter Errors - Move Legacy Tables to Archive
-- This will resolve all 14 "RLS Disabled" errors from legacy tables
-- ============================================================================

-- Create archive schema
CREATE SCHEMA IF NOT EXISTS archive;

-- Move all legacy/backup tables to archive schema
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
    RAISE NOTICE 'Fixing linter errors by archiving legacy tables...';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    FOREACH table_name IN ARRAY tables_to_archive
    LOOP
        DECLARE
            tbl_exists BOOLEAN;
            tbl_name TEXT := table_name; -- Local copy to avoid ambiguity
        BEGIN
            -- Check if table exists using EXECUTE to avoid variable/column ambiguity
            EXECUTE format(
                'SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = ''public'' 
                    AND table_name = %L
                )', tbl_name
            ) INTO tbl_exists;
            
            IF tbl_exists THEN
                BEGIN
                    EXECUTE format('ALTER TABLE public.%I SET SCHEMA archive', tbl_name);
                    RAISE NOTICE '✅ Moved % to archive', tbl_name;
                    moved_count := moved_count + 1;
                EXCEPTION WHEN others THEN
                    RAISE NOTICE '❌ Error moving %: %', tbl_name, SQLERRM;
                END;
            END IF;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ Moved % table(s) to archive schema', moved_count;
    RAISE NOTICE '   All linter errors should now be resolved!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Verify: Should show no legacy tables in public schema
SELECT 
    CASE 
        WHEN table_name LIKE 'old_%' THEN '⚠️  Still in public (should be archived)'
        WHEN table_name LIKE 'migration_backup_%' THEN '⚠️  Still in public (should be archived)'
        ELSE '✅ Active table'
    END as status,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND (table_name LIKE 'old_%' OR table_name LIKE 'migration_backup_%')
ORDER BY table_name;

-- Show what was archived
SELECT 
    'archive.' || table_name as archived_table,
    '✅ Archived' as status
FROM information_schema.tables
WHERE table_schema = 'archive'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

