
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load env
const isGitHubActions = !!process.env.GITHUB_ACTIONS
const isCI = !!process.env.CI
if (!isGitHubActions && !isCI) {
    config({ path: '.env.local' })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function main() {
    console.log("🕰️  Checking Project History Tracking...")

    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Missing required environment variables")
        return
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if table exists by trying to select from it
    const { count, error } = await supabase
        .from('project_snapshots')
        .select('*', { count: 'exact', head: true })

    if (error) {
        console.log("❌ History table check failed.")
        console.log(`   Error: ${error.message}`)
        if (error.message.includes('relation "project_snapshots" does not exist')) {
            console.log("\n⚠️  MIGRATION REQUIRED: The 'project_snapshots' table does not exist.")
            console.log("   Please run the migration 'supabase/migrations/007_project_history.sql' to enable history tracking.")
        }
    } else {
        console.log("✅ History table 'project_snapshots' exists.")
        console.log(`   Current snapshots count: ${count}`)
    }
}

main()
