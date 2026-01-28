import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: './slctrips-v2/.env.local' })

// Simulate what the frontend does - use anon key (public access)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // Using anon key like frontend
)

async function testPublicFetch() {
  console.log('=== TESTING PUBLIC STAYKIT FETCH ===\n')
  console.log('Using anon key (simulating frontend browser)\n')

  // This is what getAllStayKits() does
  const { data, error } = await supabase
    .from('staykits')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.log('❌ ERROR:', error.message)
    console.log('\nThis is why the catalog shows "Loading StayKits..."')
    console.log('The RLS policy is blocking public access.')
    console.log('\nFIX: Add a SELECT policy for public access:')
    console.log(`
CREATE POLICY "staykits_public_read" ON staykits
  FOR SELECT USING (status = 'active');
    `.trim())
    return
  }

  console.log(`✓ Fetched ${data?.length || 0} StayKits\n`)

  if (data && data.length > 0) {
    data.forEach(sk => {
      console.log(`${sk.code}: ${sk.name}`)
      console.log(`  Price: $${sk.price}`)
      console.log(`  Status: ${sk.status}`)
      console.log(`  Tasks: ${sk.task_count}`)
      console.log('')
    })
  } else {
    console.log('No StayKits returned. Check:')
    console.log('1. Are any StayKits marked as status="active"?')
    console.log('2. Is RLS enabled but no SELECT policy exists?')
  }
}

testPublicFetch().catch(console.error)
