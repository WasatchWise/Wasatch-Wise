-- Run these 3 queries to verify everything works

-- 1. Check Mike's God Mode (should return is_god_mode = true)
SELECT email, is_god_mode
FROM users
WHERE email = 'msartain@getgrooven.com';

-- 2. Check Groove's plan (should return plan = 'god_mode')
SELECT
  o.name as organization,
  sp.name as plan,
  sp.display_name
FROM organizations o
JOIN subscription_plans sp ON o.subscription_plan_id = sp.id
WHERE o.id = '34249404-774f-4b80-b346-a2d9e6322584';

-- 3. Test feature access function (should return allowed = true, reason = 'Unlimited usage')
SELECT *
FROM check_feature_access(
  '34249404-774f-4b80-b346-a2d9e6322584'::uuid,
  'ai_enrichment'
);
