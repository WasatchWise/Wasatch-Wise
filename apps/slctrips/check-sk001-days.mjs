import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: './slctrips-v2/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkDays() {
  console.log('=== SK-001 CONTENT AUDIT ===\n')

  const { data: sk001 } = await supabase
    .from('staykits')
    .select('id, name, code, day_count, price')
    .eq('code', 'SK-001')
    .single()

  if (!sk001) {
    console.log('SK-001 not found')
    return
  }

  console.log(`StayKit: ${sk001.name}`)
  console.log(`Code: ${sk001.code}`)
  console.log(`Price: $${sk001.price}`)
  console.log(`Expected days: ${sk001.day_count}\n`)

  // Get all days
  const { data: days } = await supabase
    .from('staykit_days')
    .select(`
      id,
      day_number,
      title,
      description
    `)
    .eq('staykit_id', sk001.id)
    .order('day_number', { ascending: true })

  console.log(`Days seeded: ${days?.length || 0}\n`)

  if (days && days.length > 0) {
    console.log('Day breakdown:')
    days.forEach(day => {
      console.log(`  Day ${day.day_number}: ${day.title}`)
    })

    // Get task counts per day
    console.log('\nTask counts:')
    for (const day of days) {
      const { count } = await supabase
        .from('staykit_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('day_id', day.id)

      console.log(`  Day ${day.day_number}: ${count} tasks`)
    }

    // Total tasks
    const totalTasks = await supabase
      .from('staykit_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('staykit_id', sk001.id)

    console.log(`\nTotal tasks for SK-001: ${totalTasks.count}`)
  }

  // Check if this is sellable
  console.log('\n=== SELLABILITY CHECK ===')
  const minDays = 7
  const minTasks = 20

  if (!days || days.length < minDays) {
    console.log(`❌ Only ${days?.length || 0} days (need at least ${minDays})`)
  } else {
    console.log(`✓ Has ${days.length} days`)
  }

  const { count: taskCount } = await supabase
    .from('staykit_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('staykit_id', sk001.id)

  if (!taskCount || taskCount < minTasks) {
    console.log(`❌ Only ${taskCount || 0} tasks (need at least ${minTasks})`)
  } else {
    console.log(`✓ Has ${taskCount} tasks`)
  }

  console.log('\nRECOMMENDATION:')
  if (days && days.length >= 7 && taskCount && taskCount >= 20) {
    console.log('✓ SK-001 has enough content to sell')
    console.log('  Consider updating day_count and marketing to match actual content')
  } else {
    console.log('⚠️  Need more content before selling')
    console.log('  Run: node slctrips-v2/scripts/expand-sk001-to-90day.mjs')
  }
}

checkDays().catch(console.error)
