import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: './slctrips-v2/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixSchema() {
  console.log('=== STAYKIT SCHEMA FIXES ===\n')

  // 1. Check if staykit_tips table exists
  console.log('1. CHECKING staykit_tips TABLE')
  console.log('─'.repeat(50))

  const { error: checkTipsError } = await supabase
    .from('staykit_tips')
    .select('id')
    .limit(1)

  if (checkTipsError && checkTipsError.message.includes('does not exist')) {
    console.log('❌ staykit_tips table does not exist')
    console.log('   Creating table...')

    // We need to create this via SQL
    // For now, log the SQL that needs to be run
    console.log('\n   Run this SQL in Supabase SQL Editor:\n')
    console.log(`
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
    `.trim())
  } else {
    console.log('✓ staykit_tips table exists')
  }

  // 2. Check missing columns in staykits
  console.log('\n2. CHECKING MISSING COLUMNS IN staykits')
  console.log('─'.repeat(50))

  const { data: staykitSample } = await supabase
    .from('staykits')
    .select('*')
    .limit(1)

  if (staykitSample && staykitSample.length > 0) {
    const cols = Object.keys(staykitSample[0])
    const missingCols = []

    if (!cols.includes('task_count')) missingCols.push('task_count INTEGER DEFAULT 0')
    if (!cols.includes('tip_count')) missingCols.push('tip_count INTEGER DEFAULT 0')
    if (!cols.includes('milestone_day_count')) missingCols.push('milestone_day_count INTEGER DEFAULT 0')

    if (missingCols.length > 0) {
      console.log('❌ Missing columns:', missingCols.join(', '))
      console.log('\n   Run this SQL in Supabase SQL Editor:\n')
      missingCols.forEach(col => {
        const [name] = col.split(' ')
        console.log(`ALTER TABLE staykits ADD COLUMN IF NOT EXISTS ${col};`)
      })
    } else {
      console.log('✓ All required columns exist')
    }
  }

  // 3. Check RLS on key tables
  console.log('\n3. VERIFYING USER TABLES EXIST')
  console.log('─'.repeat(50))

  const userTables = [
    'user_staykit_progress',
    'user_task_completion'
  ]

  for (const table of userTables) {
    const { error } = await supabase.from(table).select('*').limit(1)
    if (error && error.message.includes('does not exist')) {
      console.log(`❌ ${table} does not exist`)
      console.log('   This table needs to be created. Check migrations.')
    } else {
      console.log(`✓ ${table} exists`)
    }
  }

  // 4. Check if SK-001 has content
  console.log('\n4. SK-001 CONTENT STATUS')
  console.log('─'.repeat(50))

  const { data: sk001 } = await supabase
    .from('staykits')
    .select('id, name, code, day_count')
    .eq('code', 'SK-001')
    .single()

  if (sk001) {
    console.log(`✓ SK-001 exists: "${sk001.name}"`)
    console.log(`  Expected days: ${sk001.day_count}`)

    const { count: actualDays } = await supabase
      .from('staykit_days')
      .select('*', { count: 'exact', head: true })
      .eq('staykit_id', sk001.id)

    console.log(`  Actual days seeded: ${actualDays || 0}`)

    if (!actualDays || actualDays === 0) {
      console.log('\n❌ CRITICAL: SK-001 has NO day content!')
      console.log('   You need to seed days/tasks for SK-001')
      console.log('   Run: node slctrips-v2/scripts/seed-sk001-new-resident.mjs')
    } else if (actualDays < sk001.day_count) {
      console.log(`\n⚠️  SK-001 has ${actualDays} days, expected ${sk001.day_count}`)
    }
  } else {
    console.log('❌ SK-001 not found - check code value is "SK-001"')
  }

  console.log('\n=== SCHEMA FIX SUMMARY ===')
  console.log('Run any SQL statements above in Supabase SQL Editor')
  console.log('Then re-run this script to verify fixes')
}

fixSchema().catch(console.error)
