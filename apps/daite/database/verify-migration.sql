-- ============================================================================
-- Verify Migration Results
-- Run this after completing the migration to check your data
-- ============================================================================

-- Check users migration
SELECT 
    'Users Migration' as check_type,
    COUNT(*) as total_rows,
    COUNT(DISTINCT id) as unique_ids,
    COUNT(DISTINCT email) as unique_emails
FROM public.users;

-- Show sample user data
SELECT 
    id,
    email,
    pseudonym,
    account_status,
    created_at
FROM public.users
LIMIT 5;

-- Check cyraino_agents migration
SELECT 
    'CYRAiNO Agents Migration' as check_type,
    COUNT(*) as total_rows,
    COUNT(DISTINCT id) as unique_ids,
    COUNT(DISTINCT user_id) as unique_users
FROM public.cyraino_agents;

-- Show sample agent data with personality traits
SELECT 
    ca.id,
    ca.user_id,
    ca.name,
    ca.personality_traits->>'personality_summary' as personality_summary,
    ca.personality_traits->'communication_style' as communication_style,
    ca.personality_traits->>'humor' as humor,
    ca.personality_traits->>'empathy' as empathy,
    ca.personality_traits->>'directness' as directness,
    ca.created_at,
    ca.updated_at
FROM public.cyraino_agents ca
LIMIT 5;

-- Verify your specific agent "CY-Sarah" migrated correctly
SELECT 
    ca.id,
    ca.name,
    ca.personality_traits->>'personality_summary' as personality_summary,
    ca.personality_traits->'communication_style' as communication_style,
    CASE 
        WHEN ca.personality_traits->>'personality_summary' LIKE '%SAHM%' 
        THEN '✅ Personality summary preserved'
        ELSE '⚠️ Personality summary may be missing'
    END as verification
FROM public.cyraino_agents ca
WHERE ca.name = 'CY-Sarah'
   OR ca.name LIKE '%Sarah%';

-- Compare old vs new data counts
SELECT 
    'old_cyraino_agents' as source,
    COUNT(*) as row_count
FROM old_cyraino_agents
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'old_cyraino_agents')

UNION ALL

SELECT 
    'new cyraino_agents' as source,
    COUNT(*) as row_count
FROM public.cyraino_agents

UNION ALL

SELECT 
    'old_daite_users' as source,
    COUNT(*) as row_count
FROM old_daite_users
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'old_daite_users')

UNION ALL

SELECT 
    'new users' as source,
    COUNT(*) as row_count
FROM public.users;

-- Check for any missing data
SELECT 
    'Missing Data Check' as check_type,
    (SELECT COUNT(*) FROM old_cyraino_agents WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'old_cyraino_agents')) 
    - 
    (SELECT COUNT(*) FROM public.cyraino_agents) as agents_missing,
    (SELECT COUNT(*) FROM old_daite_users WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'old_daite_users'))
    -
    (SELECT COUNT(*) FROM public.users) as users_missing;

