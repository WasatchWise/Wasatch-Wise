/**
 * Quick script to verify environment variables are set correctly
 * Run with: npx tsx scripts/verify-env.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })
// Also try .env as fallback
config({ path: resolve(process.cwd(), '.env') })

console.log('🔍 Verifying DAiTE Environment Configuration...\n')

// Check required environment variables
const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'NEXT_PUBLIC_GEMINI_API_KEY': process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
}

let allGood = true

console.log('📋 Environment Variables Status:\n')

for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    // Mask sensitive values
    const displayValue = key.includes('KEY') 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
      : value
    
    // Validate Supabase URL format
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
      if (value.startsWith('https://') && value.includes('.supabase.co')) {
        console.log(`  ✅ ${key}`)
        console.log(`     Value: ${displayValue}`)
      } else {
        console.log(`  ⚠️  ${key} - Format may be incorrect`)
        console.log(`     Value: ${displayValue}`)
        console.log(`     Expected: https://{project-ref}.supabase.co`)
        allGood = false
      }
    } else {
      console.log(`  ✅ ${key}`)
      console.log(`     Value: ${displayValue}`)
    }
  } else {
    console.log(`  ❌ ${key} - NOT SET`)
    allGood = false
  }
  console.log('')
}

if (allGood) {
  console.log('✅ All environment variables are set correctly!')
  console.log('\n🚀 Next steps:')
  console.log('   1. Test database connection: npx tsx scripts/check-database.ts')
  console.log('   2. Start dev server: npm run dev')
  console.log('   3. Test authentication flow')
} else {
  console.log('⚠️  Some environment variables are missing or incorrect.')
  console.log('\n📝 Please check your .env.local file in the frontend directory.')
  console.log('   Required variables:')
  console.log('   - NEXT_PUBLIC_SUPABASE_URL=https://{project-ref}.supabase.co')
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  console.log('   - NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key (optional for now)')
}

process.exit(allGood ? 0 : 1)

