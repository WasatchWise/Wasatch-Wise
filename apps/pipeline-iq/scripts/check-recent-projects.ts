import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkRecentProjects() {
    console.log('Checking recently updated projects...\n')

    const { data, error } = await supabase
        .from('projects')
        .select('project_name, city, state, raw_data, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5)

    if (error) {
        console.log('Error:', error.message)
        return
    }

    data?.forEach((p: any) => {
        console.log(`\nProject: ${p.project_name}`)
        console.log(`  Updated: ${p.updated_at}`)
        console.log(`  City: ${p.city}, State: ${p.state}`)

        const contacts = p.raw_data?.original?.contacts || []
        console.log(`  Contacts in raw_data.original.contacts: ${contacts.length}`)

        contacts.slice(0, 3).forEach((c: any, i: number) => {
            console.log(`    [${i + 1}] ${c.first_name || 'N/A'} ${c.last_name || 'N/A'}`)
            console.log(`        Email: ${c.email || 'NONE'}`)
            console.log(`        Phone: ${c.phone || 'NONE'}`)
        })
    })
}

checkRecentProjects()
