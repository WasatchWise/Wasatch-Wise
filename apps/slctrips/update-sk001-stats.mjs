import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: './slctrips-v2/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateStats() {
  console.log('=== UPDATING SK-001 STATISTICS ===\n')

  // Get SK-001
  const { data: staykit } = await supabase
    .from('staykits')
    .select('id, code, name, day_count')
    .eq('code', 'SK-001')
    .single()

  if (!staykit) {
    console.log('❌ SK-001 not found')
    return
  }

  console.log(`StayKit: ${staykit.name}`)
  console.log(`Current day_count: ${staykit.day_count}\n`)

  // Count actual days
  const { count: dayCount } = await supabase
    .from('staykit_days')
    .select('*', { count: 'exact', head: true })
    .eq('staykit_id', staykit.id)

  console.log(`Actual milestone days: ${dayCount}`)

  // Count actual tasks
  const { data: days } = await supabase
    .from('staykit_days')
    .select('id')
    .eq('staykit_id', staykit.id)

  const dayIds = days.map(d => d.id)

  const { count: taskCount } = await supabase
    .from('staykit_tasks')
    .select('*', { count: 'exact', head: true })
    .in('day_id', dayIds)

  console.log(`Actual tasks: ${taskCount}`)

  // Count tips (should be 0 since table just created)
  const taskData = await supabase
    .from('staykit_tasks')
    .select('id')
    .in('day_id', dayIds)

  const taskIds = taskData.data?.map(t => t.id) || []

  const { count: tipCount } = await supabase
    .from('staykit_tips')
    .select('*', { count: 'exact', head: true })
    .in('task_id', taskIds)

  console.log(`Actual tips: ${tipCount}`)

  // Update SK-001 with actual stats
  console.log('\nUpdating SK-001 statistics...')

  const { error } = await supabase
    .from('staykits')
    .update({
      day_count: 90,  // Marketing: 90-day program
      milestone_day_count: dayCount,  // Actual milestone days with content
      task_count: taskCount,
      tip_count: tipCount || 0,
    })
    .eq('id', staykit.id)

  if (error) {
    console.log(`❌ Update failed: ${error.message}`)
  } else {
    console.log('✓ Statistics updated')
  }

  // Verify update
  const { data: updated } = await supabase
    .from('staykits')
    .select('day_count, milestone_day_count, task_count, tip_count')
    .eq('id', staykit.id)
    .single()

  console.log('\n=== UPDATED SK-001 STATS ===')
  console.log(`day_count: ${updated.day_count} (marketing: 90-day program)`)
  console.log(`milestone_day_count: ${updated.milestone_day_count} (actual content days)`)
  console.log(`task_count: ${updated.task_count}`)
  console.log(`tip_count: ${updated.tip_count}`)
}

updateStats().catch(console.error)
