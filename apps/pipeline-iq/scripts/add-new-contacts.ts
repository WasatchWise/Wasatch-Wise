/**
 * Add New ConstructionWire Contacts to Outreach Queue
 * 
 * These are fresh leads from the last 10 days - high priority!
 * 
 * Run: npx tsx scripts/add-new-contacts.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// New contacts from ConstructionWire (last 10 days)
const NEW_CONTACTS = [
    {
        name: 'Tom Hunt',
        title: 'President',
        company: 'PHD Hotels, Inc.',
        email: 'thunt@phdhotels.com',
        phone: '334-705-0176',
        city: 'Opelika',
        state: 'AL',
        updated: '2026-01-15',
        vertical: 'Hospitality',
        priority: 95, // President = high priority
    },
    {
        name: 'Cathy Garofalo',
        title: 'General Manager',
        company: 'PHD Hotels, Inc.',
        email: null, // No email provided
        phone: '334-705-0176',
        city: 'Opelika',
        state: 'AL',
        updated: '2026-01-15',
        vertical: 'Hospitality',
        priority: 75,
    },
    {
        name: 'Dilip Patel',
        title: 'President',
        company: 'DP Hotels',
        email: 'dilip.patel@dphotelsgroup.com',
        phone: '954-874-1800',
        city: 'Dania Beach',
        state: 'FL',
        updated: '2026-01-12',
        vertical: 'Hospitality',
        priority: 95,
    },
    {
        name: 'Prakash Sundaram',
        title: 'Senior Vice President',
        company: 'Total Management Systems Inc./Sundaram Builders, Inc.',
        email: 'prakashr@tmsinn.com',
        phone: '505-831-4200',
        city: 'Albuquerque',
        state: 'NM',
        updated: '2026-01-12',
        vertical: 'Hospitality',
        priority: 90,
    },
    {
        name: 'Ketan Patel',
        title: 'Vice President of Development',
        company: 'Rainmaker Hospitality LLC',
        email: 'k.patel@rainmakerhospitality.com',
        phone: '859-368-0087',
        city: 'Lexington',
        state: 'KY',
        updated: '2026-01-08',
        vertical: 'Hospitality',
        priority: 90,
    },
    {
        name: 'Rao Yalamanchili',
        title: 'President',
        company: 'Positive Investments',
        email: 'rao@positiveinvestments.com',
        phone: '626-321-4800',
        city: 'Arcadia',
        state: 'CA',
        updated: '2026-01-07',
        vertical: 'Hospitality',
        priority: 95,
    },
]

/**
 * Generate NEPQ email for a hospitality contact
 */
function generateNEPQEmail(contact: typeof NEW_CONTACTS[0]): { subject: string; body: string } {
    const firstName = contact.name.split(' ')[0]
    const isPresident = contact.title.toLowerCase().includes('president')
    const isVP = contact.title.toLowerCase().includes('vp') || contact.title.toLowerCase().includes('vice president')
    
    // Subject line - curiosity-driven
    const subject = `Quick question about ${contact.company}`
    
    // Build NEPQ email
    const hook = `Hi ${firstName},

I'm not sure if this is relevant to you right now, but I noticed ${contact.company} in ${contact.city}, ${contact.state} and wanted to reach out.`

    const problem = isPresident 
        ? `As President, you're probably juggling a lot of vendor relationships for technology infrastructure - WiFi, TV, phones, access control. Most hotel owners I talk to describe it as "vendor sprawl" - too many hands in the pot, nobody owns the outcome.`
        : isVP
        ? `In your role overseeing development, you've probably seen how technology coordination becomes a headache - especially when you're managing multiple vendors for WiFi, TV, phones, and access control.`
        : `We find most hotel operators dread the technology piece - coordinating separate vendors for TV, Wi-Fi, and Phones is a nightmare that creates gaps in accountability.`

    const solution = `Groove simplifies this by bringing it all "under one roof." We handle the entire hospitality technology stack (DirecTV, Internet, Phone Systems, Access Control) so you have one partner, one point of contact.`

    const assetLink = `I've put together a quick Groove overview that answers the most common questions: what we do, who we serve, why teams pick us, and what happens next.

Check it out here: https://pipelineiq.net/groove-in-45-seconds?vertical=hospitality

This way you can see if we're relevant before we even talk.`

    const cta = `If it's worth a look, happy to do a quick 10 minutes to see if we can help avoid headaches later. If not, no worries.

Best,
Mike

Reply to this email or reach me at msartain@getgrooven.com / 801-396-6534.`

    const body = `${hook}

${problem}

${solution}

${assetLink}

${cta}`

    return { subject, body }
}

async function addNewContacts() {
    console.log('🆕 ADDING NEW CONSTRUCTIONWIRE CONTACTS')
    console.log('=======================================')
    console.log(`Date: ${new Date().toLocaleDateString()}`)
    console.log(`Contacts to add: ${NEW_CONTACTS.length}`)
    console.log('')

    // Filter to only contacts with emails
    const contactsWithEmail = NEW_CONTACTS.filter(c => c.email)
    const contactsWithoutEmail = NEW_CONTACTS.filter(c => !c.email)

    console.log(`📧 With email: ${contactsWithEmail.length}`)
    console.log(`❌ Without email: ${contactsWithoutEmail.length}`)
    if (contactsWithoutEmail.length > 0) {
        console.log(`   Skipping: ${contactsWithoutEmail.map(c => c.name).join(', ')}`)
    }
    console.log('')

    let addedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const contact of contactsWithEmail) {
        console.log(`📝 Processing: ${contact.name} (${contact.title})`)
        console.log(`   Company: ${contact.company}`)
        console.log(`   Email: ${contact.email}`)

        // Check if already in queue
        const { data: existing } = await supabase
            .from('outreach_queue')
            .select('id')
            .eq('recipient_email', contact.email)
            .eq('status', 'pending')
            .single()

        if (existing) {
            console.log(`   ⏭️ Already in queue - skipping`)
            skippedCount++
            continue
        }

        // Check if email is bounced
        const { data: bouncedContact } = await supabase
            .from('contacts')
            .select('metadata')
            .eq('email', contact.email)
            .single()

        if (bouncedContact?.metadata?.email_status === 'bounced') {
            console.log(`   ⚠️ Email is bounced - skipping`)
            skippedCount++
            continue
        }

        // Generate NEPQ email
        const { subject, body } = generateNEPQEmail(contact)

        // Add to queue
        const { error } = await supabase
            .from('outreach_queue')
            .insert({
                project_id: null, // No project linked - direct contact
                recipient_email: contact.email,
                recipient_name: contact.name,
                email_subject: subject,
                email_body: body,
                priority_score: contact.priority,
                vertical: contact.vertical,
                status: 'pending',
                metadata: {
                    source: 'constructionwire',
                    title: contact.title,
                    company: contact.company,
                    city: contact.city,
                    state: contact.state,
                    phone: contact.phone,
                    added_date: new Date().toISOString(),
                    cw_updated: contact.updated,
                }
            })

        if (error) {
            console.log(`   ❌ Error: ${error.message}`)
            errorCount++
        } else {
            console.log(`   ✅ Added to queue (priority: ${contact.priority})`)
            addedCount++
        }
        console.log('')
    }

    // Summary
    console.log('================================')
    console.log('📋 SUMMARY')
    console.log('================================')
    console.log(`✅ Added to queue: ${addedCount}`)
    console.log(`⏭️ Skipped (duplicate/bounced): ${skippedCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log('')

    // Show updated queue count
    const { count } = await supabase
        .from('outreach_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    console.log(`📦 Total pending in queue: ${count}`)
    console.log('')
    console.log('To send all pending emails:')
    console.log('   npx tsx scripts/dispatch-emails.ts')
}

addNewContacts()
