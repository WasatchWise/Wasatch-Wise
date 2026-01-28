-- Quick verification for Mike's God Mode and Groove's plan

-- 1. Check Mike's God Mode status
SELECT
  id,
  email,
  is_god_mode,
  admin_notes,
  created_at
FROM users
WHERE email = 'msartain@getgrooven.com';

-- 2. Check Groove Technologies plan
SELECT
  o.id,
  o.name as org_name,
  o.subscription_plan_id,
  sp.name as plan_name,
  sp.display_name as plan_display_name,
  o.subscription_status,
  o.subscription_started_at
FROM organizations o
LEFT JOIN subscription_plans sp ON o.subscription_plan_id = sp.id
WHERE o.id = '34249404-774f-4b80-b346-a2d9e6322584';

-- 3. Check all organizations and their plans
SELECT
  o.name as org_name,
  sp.name as plan_name,
  sp.display_name as plan_display,
  o.subscription_status
FROM organizations o
LEFT JOIN subscription_plans sp ON o.subscription_plan_id = sp.id
ORDER BY o.created_at DESC;

-- 4. Test the feature access function for Groove (should return allowed=true)
SELECT
  allowed,
  reason,
  current_usage,
  limit_value
FROM check_feature_access(
  '34249404-774f-4b80-b346-a2d9e6322584'::uuid,
  'ai_enrichment'
);
