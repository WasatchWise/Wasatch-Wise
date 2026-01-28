
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
const organizationId = process.env.ORGANIZATION_ID

async function main() {
    console.log("🧪 Testing Warm Call Workflow Data Availability...")

    if (!supabaseUrl || !supabaseKey || !organizationId) {
        console.error("❌ Missing required environment variables (SUPABASE_URL, KEY, ORGANIZATION_ID)")
        return
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Check high_priority_projects count
    const { count, error: countError } = await supabase
        .from('high_priority_projects')
        .select('*', { count: 'exact', head: true })

    if (countError) {
        console.error("❌ Error checking high_priority_projects:", countError.message)
        return
    }

    console.log(`✅ high_priority_projects count: ${count}`)

    if (count === 0) {
        console.log("⚠️  No projects found to test.")
        return
    }

    // 2. Fetch one project to verify data quality
    const { data: project } = await supabase
        .from('high_priority_projects')
        .select('*')
        .limit(1)
        .single()

    if (project) {
        console.log(`\n📋 Sample Project:`)
        console.log(`   Name: ${project.project_name}`)
        console.log(`   City: ${project.city}`)
        console.log(`   State: ${project.state}`)
        console.log(`   Type: ${project.project_type}`)
        console.log(`   Stage: ${project.project_stage}`)
        console.log(`   CW ID: ${project.cw_project_id}`)
        console.log(`   Raw Data: ${project.raw_data ? 'Present' : 'Missing'}`)
    }

    console.log("\n✅ Data is ready for Warm Call Workflow.")
    console.log("   To test the full workflow (email generation), ensure the Next.js app is running")
    console.log("   and POST to /api/workflows/warm-call/trigger with this project ID.")
}

main()
