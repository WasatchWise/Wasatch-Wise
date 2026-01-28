import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: './slctrips-v2/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTables() {
  console.log('=== STAYKIT PRODUCTION READINESS CHECK ===\n')

  // Tables to verify
  const tables = [
    'staykits',
    'staykit_days',
    'staykit_tasks',
    'staykit_tips',
    'customer_product_access',
    'user_staykit_progress',
    'user_task_completion'
  ]

  console.log('1. TABLE EXISTENCE & ROW COUNTS')
  console.log('─'.repeat(50))

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`❌ ${table}: ERROR - ${error.message}`)
    } else {
      console.log(`✓ ${table}: ${count} rows`)
    }
  }

  console.log('\n2. SK001 CONTENT CHECK')
  console.log('─'.repeat(50))

  // Check SK001 specifically
  const { data: sk001, error: sk001Error } = await supabase
    .from('staykits')
    .select('*')
    .eq('code', 'SK001')
    .single()

  if (sk001Error) {
    console.log(`❌ SK001 not found: ${sk001Error.message}`)
  } else {
    console.log(`✓ SK001 exists: "${sk001.title}"`)
    console.log(`  - Price: $${sk001.price}`)
    console.log(`  - Duration: ${sk001.duration_days} days`)
    console.log(`  - Published: ${sk001.is_published}`)

    // Check days
    const { count: daysCount } = await supabase
      .from('staykit_days')
      .select('*', { count: 'exact', head: true })
      .eq('staykit_id', sk001.id)

    console.log(`  - Days seeded: ${daysCount}`)

    // Check tasks
    const { count: tasksCount } = await supabase
      .from('staykit_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('staykit_id', sk001.id)

    console.log(`  - Tasks seeded: ${tasksCount}`)

    // Check tips
    const { count: tipsCount } = await supabase
      .from('staykit_tips')
      .select('*', { count: 'exact', head: true })
      .eq('staykit_id', sk001.id)

    console.log(`  - Tips seeded: ${tipsCount}`)
  }

  console.log('\n3. RLS POLICY CHECK')
  console.log('─'.repeat(50))

  // Query pg_policies to check RLS
  const { data: policies, error: policyError } = await supabase
    .rpc('get_table_policies')
    .select('*')

  if (policyError) {
    console.log('Note: RLS policy query requires custom function.')
    console.log('Checking if tables are accessible with anon key...')

    // Try with anon key to test RLS
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: publicData, error: publicError } = await anonClient
      .from('staykits')
      .select('id, code, title, price')
      .eq('is_published', true)
      .limit(1)

    if (publicError) {
      console.log(`❌ Public access to staykits failed: ${publicError.message}`)
    } else {
      console.log(`✓ Public can read published staykits`)
    }
  }

  console.log('\n4. CHECKOUT FLOW COMPONENTS')
  console.log('─'.repeat(50))

  // Verify at least one staykit is purchasable
  const { data: purchasable } = await supabase
    .from('staykits')
    .select('code, title, price, is_published')
    .eq('is_published', true)

  if (purchasable && purchasable.length > 0) {
    console.log(`✓ ${purchasable.length} StayKit(s) available for purchase:`)
    purchasable.forEach(sk => {
      console.log(`  - ${sk.code}: ${sk.title} ($${sk.price})`)
    })
  } else {
    console.log('❌ No published StayKits available')
  }

  console.log('\n=== CHECK COMPLETE ===')
}

checkTables().catch(console.error)
