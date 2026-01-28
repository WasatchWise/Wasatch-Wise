-- ============================================================================
-- Fix Tables and Continue Migration
-- This handles the case where tables weren't renamed in Step 2
-- ============================================================================

-- First, check what exists
DO $$
DECLARE
    tables_to_rename TEXT[] := ARRAY[
        'daite_users',
        'cyraino_agents',
        'vibe_checks',
        'user_connections',
        'agent_dialogues',
        'planned_meetups',
        'user_traits',
        'token_transactions',
        'connection_feedback'
    ];
    table_name TEXT;
    renamed_count INTEGER := 0;
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Checking existing tables...';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    FOREACH table_name IN ARRAY tables_to_rename
    LOOP
        -- Check if table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            -- Check if it's already renamed
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'old_' || table_name
            ) THEN
                -- Rename it
                BEGIN
                    EXECUTE format('ALTER TABLE public.%I RENAME TO old_%I', table_name, table_name);
                    RAISE NOTICE '✅ Renamed: % → old_%', table_name, table_name;
                    renamed_count := renamed_count + 1;
                EXCEPTION WHEN others THEN
                    RAISE NOTICE '⚠️  Could not rename %: %', table_name, SQLERRM;
                END;
            ELSE
                RAISE NOTICE '⏭️  Already renamed: % (old_% exists)', table_name, table_name;
            END IF;
        ELSE
            RAISE NOTICE 'ℹ️  Table does not exist: %', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Renamed % table(s). You can now run schema.sql', renamed_count;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Show current state
SELECT 
    CASE 
        WHEN table_name LIKE 'old_%' THEN '🔄 Renamed (old)'
        WHEN table_name IN ('users', 'cyraino_agents', 'user_profiles') THEN '✅ New (from schema.sql)'
        WHEN table_name IN ('daite_users', 'cyraino_agents', 'vibe_checks') THEN '⚠️  Needs rename'
        ELSE '📋 Other'
    END as status,
    table_name,
    (SELECT COUNT(*)::TEXT FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND (
        table_name IN (
            'users', 'cyraino_agents', 'daite_users', 'vibe_checks',
            'old_cyraino_agents', 'old_daite_users', 'user_profiles'
        )
        OR table_name LIKE 'old_%'
    )
ORDER BY 
    CASE 
        WHEN table_name LIKE 'old_%' THEN 1
        WHEN table_name IN ('users', 'cyraino_agents', 'user_profiles') THEN 2
        ELSE 0
    END,
    table_name;

