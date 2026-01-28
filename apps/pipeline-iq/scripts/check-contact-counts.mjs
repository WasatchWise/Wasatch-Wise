
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
    const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })

    const { count: contactsWithEmail } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .not('email', 'is', null)

    const { count: projectLinks } = await supabase
        .from('project_stakeholders')
        .select('*', { count: 'exact', head: true })

    console.log('Contacts:', totalContacts)
    console.log('With Email:', contactsWithEmail)
    console.log('Linked to Projects:', projectLinks)
}

main()
