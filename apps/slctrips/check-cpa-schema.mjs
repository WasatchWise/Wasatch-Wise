import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: './slctrips-v2/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSchema() {
  console.log('=== customer_product_access SCHEMA ===\n')

  // Get any row to see columns
  const { data, error } = await supabase
    .from('customer_product_access')
    .select('*')
    .limit(1)

  if (error) {
    console.log('Error:', error.message)
    return
  }

  if (data && data.length > 0) {
    console.log('Existing columns:')
    Object.keys(data[0]).forEach(col => console.log(`  - ${col}`))
  } else {
    console.log('Table is empty. Trying to insert with minimal columns...')

    // Try inserting with just the essential columns
    const testData = {
      user_id: 'test-schema-check',
      product_id: 'test-product',
      product_type: 'staykit',
    }

    const { data: insertData, error: insertError } = await supabase
      .from('customer_product_access')
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      console.log('Insert error:', insertError.message)
      console.log('\nLikely missing columns. Need to add:')
      console.log('  - access_type')
      console.log('  - access_granted_at')
    } else {
      console.log('Insert succeeded. Columns:')
      Object.keys(insertData).forEach(col => console.log(`  - ${col}`))

      // Clean up
      await supabase.from('customer_product_access').delete().eq('user_id', 'test-schema-check')
    }
  }

  console.log('\n=== REQUIRED SQL TO ADD MISSING COLUMNS ===')
  console.log(`
ALTER TABLE customer_product_access
  ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'purchased',
  ADD COLUMN IF NOT EXISTS access_granted_at TIMESTAMPTZ DEFAULT NOW();
  `.trim())
}

checkSchema().catch(console.error)
