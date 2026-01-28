
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debug() {
    // Count total
    const { count: total, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

    console.log('Total projects:', total)

    // Count with raw_data
    const { count: withRaw, error: rawError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .not('raw_data', 'is', null)

    console.log('Projects with raw_data:', withRaw)

    // Get one with raw_data
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .not('raw_data', 'is', null)
        .limit(1)

    if (projects && projects.length > 0) {
        const p = projects[0]
        console.log('Project with raw_data:', p.project_name)
        // console.log('Raw Data:', JSON.stringify(p.raw_data, null, 2))
        if (p.raw_data && p.raw_data.original && p.raw_data.original.contacts) {
            console.log('Contacts length:', p.raw_data.original.contacts.length)
        } else {
            console.log('No contacts in raw_data.original')
        }
        console.log('stakeholder_count in raw_data:', p.raw_data.stakeholder_count)
    }
}

debug()
