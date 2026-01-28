-- ============================================================================
-- Debug Migration Issues
-- Run this to see what went wrong
-- ============================================================================

-- Check if new tables have ANY data
SELECT 
    'users' as table_name,
    COUNT(*) as row_count
FROM public.users

UNION ALL

SELECT 
    'cyraino_agents' as table_name,
    COUNT(*) as row_count
FROM public.cyraino_agents;

-- Check old tables still have data
SELECT 
    'old_daite_users' as table_name,
    COUNT(*) as row_count
FROM old_daite_users

UNION ALL

SELECT 
    'old_cyraino_agents' as table_name,
    COUNT(*) as row_count
FROM old_cyraino_agents;

-- Check structure of old_daite_users to see what columns exist
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'old_daite_users'
ORDER BY ordinal_position;

-- Check structure of old_cyraino_agents
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'old_cyraino_agents'
ORDER BY ordinal_position;

-- Show actual data in old tables
SELECT 'old_daite_users data:' as info;
SELECT * FROM old_daite_users LIMIT 5;

SELECT 'old_cyraino_agents data:' as info;
SELECT * FROM old_cyraino_agents LIMIT 5;

-- Check if there are foreign key issues
-- Users table requires auth.users to exist
SELECT 
    'auth.users check' as check_type,
    COUNT(*) as auth_user_count
FROM auth.users;

-- Check if user IDs from old_daite_users exist in auth.users
SELECT 
    'Users in auth.users' as check_type,
    COUNT(*) as matching_users
FROM old_daite_users oud
WHERE EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = oud.id
);

-- Show user IDs that might not be in auth.users
SELECT 
    'Users NOT in auth.users' as check_type,
    id,
    email
FROM old_daite_users oud
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = oud.id
);

