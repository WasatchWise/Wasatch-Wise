/**
 * Quick script to check database connection and schema status
 * Run with: npx tsx scripts/check-database.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })
// Also try .env as fallback
config({ path: resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required:')
  console.log('  - NEXT_PUBLIC_SUPABASE_URL')
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabase() {
  console.log('🔍 Checking DAiTE Database Status...\n')
  console.log('Supabase URL:', supabaseUrl?.substring(0, 30) + '...')
  console.log('')

  try {
    // Check core tables
    const tables = [
      'users',
      'user_profiles',
      'cyraino_agents',
      'agent_conversations',
      'matches',
      'discoveries',
      'vibe_checks',
      'messages',
      'conversations',
      'token_balances',
      'user_photos',
      'venues',
    ]

    console.log('📊 Checking Tables:\n')
    const tableStatus: Record<string, boolean> = {}

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })
        tableStatus[table] = !error
        console.log(`  ${tableStatus[table] ? '✅' : '❌'} ${table}`)
        if (error) {
          console.log(`     Error: ${error.message}`)
        }
      } catch (err) {
        tableStatus[table] = false
        console.log(`  ❌ ${table} - ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    const existingTables = Object.values(tableStatus).filter(Boolean).length
    const totalTables = tables.length

    console.log('\n' + '='.repeat(50))
    console.log(`📈 Status: ${existingTables}/${totalTables} tables found`)
    console.log('='.repeat(50) + '\n')

    if (existingTables === 0) {
      console.log('⚠️  Database schema has not been applied yet.')
      console.log('\n📝 To set up the database:')
      console.log('   1. Go to https://app.supabase.com')
      console.log('   2. Open SQL Editor')
      console.log('   3. Copy contents from: database/schema.sql')
      console.log('   4. Execute the schema\n')
    } else if (existingTables < totalTables) {
      console.log('⚠️  Some tables are missing. Schema may be incomplete.')
      console.log('   Review database/schema.sql and ensure all tables are created.\n')
    } else {
      console.log('✅ Database schema appears to be complete!')
      
      // Check for extensions
      console.log('\n🔌 Checking Extensions:\n')
      try {
        const { data: extensions, error: extError } = await supabase
          .rpc('check_extensions')
        
        if (extError) {
          console.log('   (Could not check extensions - this is okay)')
        } else {
          console.log('   Extensions check skipped (requires direct DB access)')
        }
      } catch (err) {
        console.log('   (Could not check extensions - this is okay)')
      }
      
      console.log('\n✨ Database is ready for use!')
    }

    // Check RLS policies
    console.log('\n🔒 Row Level Security:')
    console.log('   (RLS policies should be enabled - check Supabase dashboard)')
    
  } catch (error) {
    console.error('\n❌ Error checking database:', error)
    process.exit(1)
  }
}

checkDatabase()

