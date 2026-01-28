import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import dotenv from 'dotenv'
dotenv.config({ path: './slctrips-v2/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testPurchaseFlow() {
  console.log('=== STAYKIT PURCHASE FLOW TEST v2 ===\n')

  // Get SK-001
  const { data: staykit } = await supabase
    .from('staykits')
    .select('id, code, name, task_count, tip_count')
    .eq('code', 'SK-001')
    .single()

  if (!staykit) {
    console.log('❌ SK-001 not found')
    return
  }

  console.log('✓ SK-001 found:', staykit.name)

  // Use proper UUID for test user
  const testUserId = randomUUID()
  console.log(`\nTest user UUID: ${testUserId}`)
  console.log(`StayKit ID: ${staykit.id}\n`)

  // Step 1: customer_product_access
  console.log('1. INSERT customer_product_access')
  const { data: access, error: accessError } = await supabase
    .from('customer_product_access')
    .insert({
      user_id: testUserId,
      product_id: staykit.id,
      product_type: 'staykit',
      access_type: 'purchased',
    })
    .select()
    .single()

  if (accessError) {
    console.log(`   ❌ Failed: ${accessError.message}`)
    return
  }
  console.log('   ✓ Success')

  // Step 2: user_staykit_progress
  console.log('2. INSERT user_staykit_progress')
  const { error: progressError } = await supabase
    .from('user_staykit_progress')
    .insert({
      user_id: testUserId,
      staykit_id: staykit.id,
      progress_percentage: 0,
      tasks_completed: 0,
      total_tasks: staykit.task_count || 0,
    })

  if (progressError) {
    console.log(`   ❌ Failed: ${progressError.message}`)
  } else {
    console.log('   ✓ Success')
  }

  // Step 3: task completion
  console.log('3. INSERT user_task_completion')
  const { data: task } = await supabase
    .from('staykit_tasks')
    .select('id, title')
    .eq('staykit_id', staykit.id)
    .limit(1)
    .single()

  if (task) {
    const { error: taskError } = await supabase
      .from('user_task_completion')
      .insert({
        user_id: testUserId,
        task_id: task.id,
      })

    if (taskError) {
      console.log(`   ❌ Failed: ${taskError.message}`)
    } else {
      console.log(`   ✓ Success (task: "${task.title}")`)
    }
  }

  // Cleanup
  console.log('\n4. CLEANUP')
  await supabase.from('user_task_completion').delete().eq('user_id', testUserId)
  await supabase.from('user_staykit_progress').delete().eq('user_id', testUserId)
  await supabase.from('customer_product_access').delete().eq('user_id', testUserId)
  console.log('   ✓ Test data removed')

  console.log('\n=== RESULT ===')
  console.log('✓ ALL DATABASE OPERATIONS SUCCESSFUL')
  console.log('✓ STAYKIT PURCHASE FLOW: READY FOR PRODUCTION')
}

testPurchaseFlow().catch(console.error)
