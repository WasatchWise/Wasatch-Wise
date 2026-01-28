import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function findContactsWithEmails() {
    console.log('Looking for contacts with email addresses...\n')

    const { data, error } = await supabase
        .from('projects')
        .select('project_name, raw_data')
        .order('updated_at', { ascending: false })
        .limit(20)

    if (error) {
        console.log('Error:', error.message)
        return
    }

    let emailCount = 0
    let phoneCount = 0

    data?.forEach((p: any) => {
        const contacts = p.raw_data?.original?.contacts || []
        const withEmails = contacts.filter((c: any) => c.email && c.email.includes('@'))
        const withPhones = contacts.filter((c: any) => c.phone)

        if (withEmails.length > 0) {
            console.log(`\n✅ ${p.project_name}`)
            withEmails.forEach((c: any) => {
                console.log(`   📧 ${c.first_name} ${c.last_name}: ${c.email}`)
                emailCount++
            })
        }
        phoneCount += withPhones.length
    })

    console.log(`\n\n📊 Summary: ${emailCount} contacts with emails, ${phoneCount} contacts with phones`)
}

findContactsWithEmails()
