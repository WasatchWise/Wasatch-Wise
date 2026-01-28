-- ============================================================================
-- Complete Step 2: Backup and Rename Existing Tables
-- Run this BEFORE running schema.sql
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- STEP 1: Backup existing data
-- ============================================================================
DO $$
BEGIN
    -- Backup daite_users if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daite_users') THEN
        DROP TABLE IF EXISTS migration_backup_daite_users;
        CREATE TABLE migration_backup_daite_users AS SELECT * FROM daite_users;
        RAISE NOTICE '✅ Backed up daite_users';
    END IF;
    
    -- Backup cyraino_agents if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cyraino_agents') THEN
        DROP TABLE IF EXISTS migration_backup_cyraino_agents;
        CREATE TABLE migration_backup_cyraino_agents AS SELECT * FROM cyraino_agents;
        RAISE NOTICE '✅ Backed up cyraino_agents';
    END IF;
    
    -- Backup other tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_connections') THEN
        DROP TABLE IF EXISTS migration_backup_user_connections;
        CREATE TABLE migration_backup_user_connections AS SELECT * FROM user_connections;
        RAISE NOTICE '✅ Backed up user_connections';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agent_dialogues') THEN
        DROP TABLE IF EXISTS migration_backup_agent_dialogues;
        CREATE TABLE migration_backup_agent_dialogues AS SELECT * FROM agent_dialogues;
        RAISE NOTICE '✅ Backed up agent_dialogues';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vibe_checks') THEN
        DROP TABLE IF EXISTS migration_backup_vibe_checks;
        CREATE TABLE migration_backup_vibe_checks AS SELECT * FROM vibe_checks;
        RAISE NOTICE '✅ Backed up vibe_checks';
    END IF;
END $$;

-- STEP 2: Rename existing tables
-- ============================================================================
DO $$
DECLARE
    rename_count INTEGER := 0;
BEGIN
    -- Rename daite_users
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daite_users') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_daite_users') THEN
        ALTER TABLE public.daite_users RENAME TO old_daite_users;
        RAISE NOTICE '✅ Renamed: daite_users → old_daite_users';
        rename_count := rename_count + 1;
    END IF;
    
    -- Rename cyraino_agents
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cyraino_agents') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_cyraino_agents') THEN
        ALTER TABLE public.cyraino_agents RENAME TO old_cyraino_agents;
        RAISE NOTICE '✅ Renamed: cyraino_agents → old_cyraino_agents';
        rename_count := rename_count + 1;
    END IF;
    
    -- Rename vibe_checks
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vibe_checks') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_vibe_checks') THEN
        ALTER TABLE public.vibe_checks RENAME TO old_vibe_checks;
        RAISE NOTICE '✅ Renamed: vibe_checks → old_vibe_checks';
        rename_count := rename_count + 1;
    END IF;
    
    -- Rename user_connections
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_connections') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_user_connections') THEN
        ALTER TABLE public.user_connections RENAME TO old_user_connections;
        RAISE NOTICE '✅ Renamed: user_connections → old_user_connections';
        rename_count := rename_count + 1;
    END IF;
    
    -- Rename agent_dialogues
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agent_dialogues') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_agent_dialogues') THEN
        ALTER TABLE public.agent_dialogues RENAME TO old_agent_dialogues;
        RAISE NOTICE '✅ Renamed: agent_dialogues → old_agent_dialogues';
        rename_count := rename_count + 1;
    END IF;
    
    -- Rename other tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'planned_meetups') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_planned_meetups') THEN
        ALTER TABLE public.planned_meetups RENAME TO old_planned_meetups;
        rename_count := rename_count + 1;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_traits') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_user_traits') THEN
        ALTER TABLE public.user_traits RENAME TO old_user_traits;
        rename_count := rename_count + 1;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'token_transactions') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_token_transactions') THEN
        ALTER TABLE public.token_transactions RENAME TO old_token_transactions;
        rename_count := rename_count + 1;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'connection_feedback') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_connection_feedback') THEN
        ALTER TABLE public.connection_feedback RENAME TO old_connection_feedback;
        rename_count := rename_count + 1;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ Step 2 Complete: Renamed % table(s)', rename_count;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '➡️  NEXT: Run database/schema.sql to create new tables';
    RAISE NOTICE '';
END $$;

-- Verify what was renamed
SELECT 
    table_name,
    CASE 
        WHEN table_name LIKE 'old_%' THEN '🔄 Renamed'
        WHEN table_name LIKE 'migration_backup_%' THEN '💾 Backup'
        WHEN table_name IN ('cyraino_agents', 'daite_users', 'vibe_checks') THEN '⚠️  Still needs rename!'
        ELSE '📋 Other'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND (
        table_name LIKE 'old_%'
        OR table_name LIKE 'migration_backup_%'
        OR table_name IN ('cyraino_agents', 'daite_users', 'vibe_checks', 'user_connections', 'agent_dialogues')
    )
ORDER BY table_name;

