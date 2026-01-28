-- ============================================================================
-- Check Structure of Existing Tables
-- Run this FIRST to see what columns your existing tables have
-- ============================================================================

-- Check daite_users structure
SELECT 
    'daite_users' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'daite_users'
ORDER BY ordinal_position;

-- Check cyraino_agents structure  
SELECT 
    'cyraino_agents' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'cyraino_agents'
ORDER BY ordinal_position;

-- Check user_connections structure
SELECT 
    'user_connections' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_connections'
ORDER BY ordinal_position;

-- Check all existing tables and their row counts
SELECT 
    t.table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count,
    CASE 
        WHEN t.table_name = 'daite_users' THEN (SELECT COUNT(*) FROM daite_users)
        WHEN t.table_name = 'cyraino_agents' THEN (SELECT COUNT(*) FROM cyraino_agents)
        WHEN t.table_name = 'vibe_checks' THEN (SELECT COUNT(*) FROM vibe_checks)
        WHEN t.table_name = 'user_connections' THEN (SELECT COUNT(*) FROM user_connections)
        WHEN t.table_name = 'agent_dialogues' THEN (SELECT COUNT(*) FROM agent_dialogues)
        WHEN t.table_name = 'planned_meetups' THEN (SELECT COUNT(*) FROM planned_meetups)
        WHEN t.table_name = 'user_traits' THEN (SELECT COUNT(*) FROM user_traits)
        WHEN t.table_name = 'token_transactions' THEN (SELECT COUNT(*) FROM token_transactions)
        WHEN t.table_name = 'connection_feedback' THEN (SELECT COUNT(*) FROM connection_feedback)
        ELSE 0
    END as row_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'migration_backup_%'
    AND table_name NOT LIKE 'old_%'
ORDER BY table_name;

-- Show sample data from daite_users (first row only, for structure reference)
SELECT * FROM daite_users LIMIT 1;

-- Show sample data from cyraino_agents (first row only)
SELECT * FROM cyraino_agents LIMIT 1;

