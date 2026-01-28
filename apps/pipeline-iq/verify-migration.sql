-- Verification Queries for Premium Features Migration
-- Run these in Supabase SQL Editor to verify everything is set up correctly

-- 1. Check all subscription plans were created
SELECT id, name, display_name, price_monthly, is_active
FROM subscription_plans
ORDER BY sort_order;

-- 2. Verify Mike Sartain has God Mode
SELECT id, email, is_god_mode, admin_notes
FROM users
WHERE email = 'msartain@getgrooven.com';

-- 3. Verify Groove Technologies has God Mode plan
SELECT
  o.id,
  o.name,
  sp.name as plan_name,
  sp.display_name as plan_display_name,
  o.subscription_status
FROM organizations o
LEFT JOIN subscription_plans sp ON o.subscription_plan_id = sp.id
WHERE o.id = '34249404-774f-4b80-b346-a2d9e6322584';

-- 4. Check organizations have subscription columns
SELECT
  id,
  name,
  subscription_plan_id,
  subscription_status,
  trial_ends_at,
  billing_cycle
FROM organizations
LIMIT 5;

-- 5. Test the check_feature_access function
SELECT * FROM check_feature_access(
  '34249404-774f-4b80-b346-a2d9e6322584'::uuid,
  'ai_enrichment'
);

-- 6. Verify views were created
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('monthly_usage', 'current_month_usage', 'admin_subscription_stats');

-- 7. Check indexes were created
SELECT
  indexname,
  tablename
FROM pg_indexes
WHERE tablename IN ('usage_tracking', 'subscription_plans')
ORDER BY tablename, indexname;
