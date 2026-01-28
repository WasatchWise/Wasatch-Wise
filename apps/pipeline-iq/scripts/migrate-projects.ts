
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const isGitHubActions = !!process.env.GITHUB_ACTIONS
const isCI = !!process.env.CI

if (!isGitHubActions && !isCI) {
    config({ path: '.env.local' })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('🔄 Migrating data from projects to high_priority_projects...')

    try {
        // 1. Fetch all rows from projects that have CW IDs (based on user description)
        // or just fetch all
        const { data: projects, error: fetchError } = await supabase
            .from('projects')
            .select('*')

        if (fetchError) {
            throw new Error(`Error fetching projects: ${fetchError.message}`)
        }

        if (!projects || projects.length === 0) {
            console.log('⚠️ No projects found to migrate.')
            return
        }

        console.log(`✅ Found ${projects.length} projects to migrate.`)

        let migratedCount = 0
        let errorCount = 0

        // 2. Insert into high_priority_projects
        for (const project of projects) {
            // Prepare data object, removing 'id' to let new table generate it, or keeping it if we want to preserve IDs (usually better to let new table generate if unrelated)
            // However, if we want to "move" them, we might just copy fields.
            // We need to match the fields used in the scraper.

            // Filter out system fields or fields that might not match if not careful
            const { id, created_at, updated_at, ...projectData } = project

            // Ensure required fields have values
            if (!projectData.city) projectData.city = 'Unknown'
            if (!projectData.state) projectData.state = 'XX' // Use a placeholder state code that validates (2 chars)
            if (!projectData.project_stage) projectData.project_stage = 'Planning' // Default stage if missing

            // Insert
            const { error: insertError } = await supabase
                .from('high_priority_projects')
                .upsert(projectData, { onConflict: 'cw_project_id' }) // Assuming cw_project_id helps identify uniqueness

            if (insertError) {
                console.error(`❌ Failed to migrate project ${project.project_name}: ${insertError.message}`)
                errorCount++
            } else {
                console.log(`   ✅ Migrated: ${project.project_name}`)
                migratedCount++
            }
        }

        console.log(`\nMigration Summary:`)
        console.log(`Total: ${projects.length}`)
        console.log(`Migrated: ${migratedCount}`)
        console.log(`Errors: ${errorCount}`)

        if (errorCount === 0 && migratedCount > 0) {
            console.log('\n🗑️  You may want to verify data and then delete rows from "projects" manually or uncomment the delete code.')
            // Uncomment to enable deletion
            /*
            const { error: deleteError } = await supabase
                .from('projects')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
            
            if (deleteError) {
                 console.error(`Error deleting from projects: ${deleteError.message}`)
            } else {
                 console.log('✅ Deleted old data from projects table')
            }
            */
        }

    } catch (error: any) {
        console.error(`Migration failed: ${error.message}`)
        process.exit(1)
    }
}

main()
