-- ============================================================================
-- Check Migration Status
-- Run this to see what step you're on and what to do next
-- ============================================================================

DO $$
DECLARE
    old_tables_exist BOOLEAN;
    new_tables_exist BOOLEAN;
    migration_step TEXT;
BEGIN
    -- Check if old tables still exist (not renamed yet)
    old_tables_exist := EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('daite_users', 'cyraino_agents', 'vibe_checks')
    );
    
    -- Check if new tables exist (schema.sql was run)
    new_tables_exist := EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    );
    
    -- Determine current step
    IF old_tables_exist AND NOT new_tables_exist THEN
        migration_step := 'STEP 2';
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE '📍 CURRENT STATUS: Ready for Step 2';
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE '';
        RAISE NOTICE '✅ Old tables still exist (not renamed yet)';
        RAISE NOTICE '❌ New schema not created yet';
        RAISE NOTICE '';
        RAISE NOTICE '➡️  NEXT ACTION: Run Steps 1-2 from migrate-with-data.sql';
        RAISE NOTICE '   This will backup and rename your existing tables.';
        
    ELSIF NOT old_tables_exist AND NOT new_tables_exist THEN
        migration_step := 'STEP 3';
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE '📍 CURRENT STATUS: Ready for Step 3';
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE '';
        RAISE NOTICE '✅ Old tables renamed (Steps 1-2 completed)';
        RAISE NOTICE '❌ New schema not created yet';
        RAISE NOTICE '';
        RAISE NOTICE '➡️  NEXT ACTION: Run database/schema.sql (FULL FILE)';
        RAISE NOTICE '   This creates all 30+ new tables.';
        
    ELSIF NOT old_tables_exist AND new_tables_exist THEN
        migration_step := 'STEP 4';
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE '📍 CURRENT STATUS: Ready for Step 4';
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE '';
        RAISE NOTICE '✅ Old tables renamed';
        RAISE NOTICE '✅ New schema created';
        RAISE NOTICE '';
        RAISE NOTICE '➡️  NEXT ACTION: Run Step 4 from migrate-with-data.sql';
        RAISE NOTICE '   This migrates your data to the new tables.';
        
    ELSE
        migration_step := 'UNKNOWN';
        RAISE NOTICE '⚠️  Status unclear - both old and new tables exist';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Show which tables exist
SELECT 
    CASE 
        WHEN table_name LIKE 'old_%' THEN '🔄 Old (renamed)'
        WHEN table_name LIKE 'migration_backup_%' THEN '💾 Backup'
        ELSE '✅ Active'
    END as status,
    table_name,
    CASE 
        WHEN table_name = 'users' THEN (SELECT COUNT(*)::TEXT FROM users)
        WHEN table_name = 'cyraino_agents' THEN (SELECT COUNT(*)::TEXT FROM cyraino_agents)
        WHEN table_name = 'old_cyraino_agents' THEN (SELECT COUNT(*)::TEXT FROM old_cyraino_agents)
        WHEN table_name = 'old_daite_users' THEN (SELECT COUNT(*)::TEXT FROM old_daite_users)
        ELSE '-'
    END as row_count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND (
        table_name IN ('users', 'cyraino_agents', 'daite_users', 'vibe_checks')
        OR table_name LIKE 'old_%'
        OR table_name LIKE 'migration_backup_%'
    )
ORDER BY 
    CASE WHEN table_name LIKE 'old_%' THEN 1 WHEN table_name LIKE 'migration_backup_%' THEN 2 ELSE 0 END,
    table_name;

