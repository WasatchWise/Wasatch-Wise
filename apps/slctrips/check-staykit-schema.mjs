import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: './slctrips-v2/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSchema() {
  console.log('=== STAYKIT SCHEMA & DATA AUDIT ===\n')

  // Get all staykits
  console.log('1. ALL STAYKITS IN DATABASE')
  console.log('─'.repeat(50))
  const { data: staykits, error } = await supabase
    .from('staykits')
    .select('*')

  if (error) {
    console.log('Error:', error.message)
  } else if (staykits.length === 0) {
    console.log('No StayKits found')
  } else {
    console.log('Found', staykits.length, 'StayKits:')
    staykits.forEach(sk => {
      console.log('\nStayKit Record:')
      console.log(JSON.stringify(sk, null, 2))
    })

    // Check column names
    if (staykits[0]) {
      console.log('\n2. ACTUAL COLUMN NAMES')
      console.log('─'.repeat(50))
      const columns = Object.keys(staykits[0])
      columns.forEach(col => console.log(`  - ${col}`))

      // Check if 'title' vs 'name' issue
      const hasTitle = columns.includes('title')
      const hasName = columns.includes('name')
      console.log(`\nHas 'title' column: ${hasTitle}`)
      console.log(`Has 'name' column: ${hasName}`)
    }
  }

  // Check what days exist
  console.log('\n3. STAYKIT DAYS SAMPLE')
  console.log('─'.repeat(50))
  const { data: days } = await supabase
    .from('staykit_days')
    .select('*')
    .limit(3)

  if (days && days.length > 0) {
    console.log('Sample day record:')
    console.log(JSON.stringify(days[0], null, 2))
  }

  // Check tasks
  console.log('\n4. STAYKIT TASKS SAMPLE')
  console.log('─'.repeat(50))
  const { data: tasks } = await supabase
    .from('staykit_tasks')
    .select('*')
    .limit(3)

  if (tasks && tasks.length > 0) {
    console.log('Sample task record:')
    console.log(JSON.stringify(tasks[0], null, 2))
  }

  // Check tips table existence
  console.log('\n5. STAYKIT TIPS TABLE')
  console.log('─'.repeat(50))
  const { data: tips, error: tipsError } = await supabase
    .from('staykit_tips')
    .select('*')
    .limit(1)

  if (tipsError) {
    console.log('Tips table error:', tipsError.message)
  } else {
    console.log('Tips table exists, rows:', tips?.length || 0)
  }
}

checkSchema().catch(console.error)
