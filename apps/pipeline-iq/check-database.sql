-- Check what tables exist in your database

-- 1. List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check if subscription tables exist
SELECT COUNT(*) as subscription_tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('subscription_plans', 'usage_tracking');

-- 3. Check if core tables exist
SELECT COUNT(*) as core_tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('organizations', 'users');
