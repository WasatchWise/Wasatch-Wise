-- Copy and paste ONLY these queries (one at a time or all together)

-- Query 1: Check Mike's God Mode
SELECT email, is_god_mode, admin_notes
FROM users
WHERE email = 'msartain@getgrooven.com';

-- Query 2: Check Groove's Organization Plan
SELECT
  o.name as org_name,
  sp.name as plan_name,
  sp.display_name as plan_display,
  o.subscription_status
FROM organizations o
LEFT JOIN subscription_plans sp ON o.subscription_plan_id = sp.id
WHERE o.id = '34249404-774f-4b80-b346-a2d9e6322584';

-- Query 3: Test Feature Access Function
SELECT * FROM check_feature_access(
  '34249404-774f-4b80-b346-a2d9e6322584'::uuid,
  'ai_enrichment'
);
