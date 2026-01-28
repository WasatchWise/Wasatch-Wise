import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkContactData() {
    console.log('Checking projects with contacts in raw_data...\n')

    const { data, error } = await supabase
        .from('projects')
        .select('project_name, raw_data')
        .limit(5)

    if (error) {
        console.log('Error:', error.message)
        return
    }

    data?.forEach((p: any) => {
        console.log(`\nProject: ${p.project_name}`)
        const contacts = p.raw_data?.original?.contacts || []
        console.log(`  Contacts: ${contacts.length}`)
        contacts.forEach((c: any, i: number) => {
            console.log(`    [${i + 1}] Name: ${c.first_name} ${c.last_name}`)
            console.log(`        Email: ${c.email || 'NONE'}`)
            console.log(`        Phone: ${c.phone || 'NONE'}`)
        })
    })
}

checkContactData()
