-- CRITICAL STAYKIT MIGRATION
-- Run this in Supabase SQL Editor BEFORE marketing launch
-- Last generated: 2025-11-16

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO staykits
-- ============================================================================
ALTER TABLE staykits ADD COLUMN IF NOT EXISTS task_count INTEGER DEFAULT 0;
ALTER TABLE staykits ADD COLUMN IF NOT EXISTS tip_count INTEGER DEFAULT 0;
ALTER TABLE staykits ADD COLUMN IF NOT EXISTS milestone_day_count INTEGER DEFAULT 0;

-- ============================================================================
-- 2. CREATE staykit_tips TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS staykit_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES staykit_tasks(id) ON DELETE CASCADE,
  tip_order INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  tip_type TEXT DEFAULT 'general',
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staykit_tips_task_id ON staykit_tips(task_id);

-- Enable RLS
ALTER TABLE staykit_tips ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "staykit_tips_public_read" ON staykit_tips
  FOR SELECT USING (true);

-- ============================================================================
-- 3. CREATE user_staykit_progress TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_staykit_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staykit_id UUID NOT NULL REFERENCES staykits(id) ON DELETE CASCADE,

  -- Progress tracking
  current_day INTEGER DEFAULT 1,
  tasks_completed INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,

  -- Timestamps
  access_granted_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(user_id, staykit_id)
);

CREATE INDEX IF NOT EXISTS idx_user_staykit_progress_user ON user_staykit_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_staykit_progress_staykit ON user_staykit_progress(staykit_id);

-- Enable RLS
ALTER TABLE user_staykit_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own progress
CREATE POLICY "user_staykit_progress_select_own" ON user_staykit_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_staykit_progress_insert_own" ON user_staykit_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_staykit_progress_update_own" ON user_staykit_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 4. CREATE user_task_completion TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_task_completion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES staykit_tasks(id) ON DELETE CASCADE,

  -- Completion details
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  photo_url TEXT,

  -- Unique constraint - user can only complete task once
  UNIQUE(user_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_user_task_completion_user ON user_task_completion(user_id);
CREATE INDEX IF NOT EXISTS idx_user_task_completion_task ON user_task_completion(task_id);

-- Enable RLS
ALTER TABLE user_task_completion ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own completions
CREATE POLICY "user_task_completion_select_own" ON user_task_completion
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_task_completion_insert_own" ON user_task_completion
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_task_completion_delete_own" ON user_task_completion
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 5. VERIFY customer_product_access HAS CORRECT COLUMNS
-- ============================================================================
-- This table should already exist from TripKit setup, but ensure it has staykit support

ALTER TABLE customer_product_access
  ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'tripkit';

-- Ensure RLS policies allow service role to insert (for webhook)
-- The service role key bypasses RLS, so this should work automatically

-- ============================================================================
-- 6. UPDATE SK-001 STATS (after seeding content)
-- ============================================================================
-- Run this AFTER seeding all 90 days of content:
/*
UPDATE staykits
SET
  task_count = (SELECT COUNT(*) FROM staykit_tasks WHERE day_id IN (SELECT id FROM staykit_days WHERE staykit_id = staykits.id)),
  tip_count = (SELECT COUNT(*) FROM staykit_tips WHERE task_id IN (SELECT id FROM staykit_tasks WHERE day_id IN (SELECT id FROM staykit_days WHERE staykit_id = staykits.id))),
  milestone_day_count = (SELECT COUNT(*) FROM staykit_days WHERE staykit_id = staykits.id)
WHERE code = 'SK-001';
*/

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this after applying migration to verify:
/*
SELECT
  'staykits' as table_name, COUNT(*) as rows
FROM staykits
UNION ALL
SELECT 'staykit_days', COUNT(*) FROM staykit_days
UNION ALL
SELECT 'staykit_tasks', COUNT(*) FROM staykit_tasks
UNION ALL
SELECT 'staykit_tips', COUNT(*) FROM staykit_tips
UNION ALL
SELECT 'user_staykit_progress', COUNT(*) FROM user_staykit_progress
UNION ALL
SELECT 'user_task_completion', COUNT(*) FROM user_task_completion
UNION ALL
SELECT 'customer_product_access', COUNT(*) FROM customer_product_access;
*/
