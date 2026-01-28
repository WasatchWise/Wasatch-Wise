
import { createClient } from '@supabase/supabase-js'
import { classifyProject } from '../lib/utils/classification'
import { generateNEPQEmail } from '../lib/utils/email-generator'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

console.log("🔄 BACKFILL: Loading existing projects into Outreach Queue...\n")

async function backfill() {
    // 1. Fetch proper projects (Score > 60)
    const { data: projects, error } = await supabase
        .from('high_priority_projects')
        .select('*')
        .gte('groove_fit_score', 60)

    if (error) {
        console.error("❌ DB Error:", error)
        return
    }

    console.log(`🔍 Found ${projects.length} potential projects (Score >= 60).`)

    let queued = 0
    let skipped = 0

    for (const project of projects) {
        // Check if already in queue
        const { count } = await supabase
            .from('outreach_queue')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)

        if (count && count > 0) {
            skipped++
            continue
        }

        // Extract Contact
        // raw_data jsonb structure varies, we need to be careful
        const raw = project.raw_data as any
        // Try to find ANY contact with an email
        // Check 'original.contacts' or just 'contacts' if flattened?
        // Based on previous scrapes, it's often in raw_data.original.contacts or raw_data.contacts

        // Normalize contact finding
        let contacts = raw?.original?.contacts || raw?.contacts || []
        if (typeof contacts === 'string') {
            // sometimes it's a string in legacy data?
            contacts = []
        }

        const validContact = contacts.find((c: any) => c.email && c.email.includes('@'))

        if (validContact) {
            // Classify
            const types = project.project_type || [] // project_type is typically string[] or string
            const typeArray = Array.isArray(types) ? types : [types]

            const classification = classifyProject(typeArray)

            // Generate Email
            const nepq = generateNEPQEmail({
                project_name: project.project_name,
                city: project.city,
                state: project.state,
                classification
            })

            // Insert
            const { error: insertError } = await supabase
                .from('outreach_queue')
                .insert({
                    project_id: project.id,
                    recipient_email: validContact.email,
                    recipient_name: validContact.name || validContact.first_name || 'Partner',
                    email_subject: nepq.subject,
                    email_body: nepq.body,
                    priority_score: project.groove_fit_score,
                    vertical: classification.vertical,
                    metadata: { project_name: project.project_name, source: 'backfill' }
                })

            if (!insertError) {
                console.log(`   ✅ Queued: ${project.project_name} -> ${validContact.email}`)
                queued++
            } else {
                console.error(`   ❌ Insert Failed: ${insertError.message}`)
            }

        } else {
            // console.log(`   ⚠️ No Email Contact: ${project.project_name}`)
            skipped++
        }
    }

    console.log(`\n==================================`)
    console.log(`🏁 BACKFILL COMPLETE`)
    console.log(`✅ Newly Queued: ${queued}`)
    console.log(`⏭️ Skipped (Dupes/No Email): ${skipped}`)
    console.log(`==================================`)
}

backfill()
