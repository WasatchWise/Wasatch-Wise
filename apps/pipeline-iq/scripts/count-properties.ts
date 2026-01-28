
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function report() {
    // 1. Count Projects (High Priority)
    const { count: highPriorityCount, error: hpError } = await supabase
        .from('high_priority_projects')
        .select('*', { count: 'exact', head: true })

    // 2. Count Projects (All - if table exists)
    const { count: allProjectsCount, error: allError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

    // 3. Outreach Queue
    const { count: pendingEmails, error: pendingError } = await supabase
        .from('outreach_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    const { count: sentEmails, error: sentError } = await supabase
        .from('outreach_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent')

    console.log(`
📊 DATABASE COUNTS REPORT

🏨 High Priority Projects: ${highPriorityCount || 0}
🏗️  All Projects:          ${allProjectsCount || 0}
----------------------------------------
📨 Pending Emails (Queue): ${pendingEmails || 0}
✅ Sent Emails:            ${sentEmails || 0}
----------------------------------------
`)

    if (hpError) console.error("HP Error:", hpError.message)
    if (allError) console.error("All Error:", allError.message)
}

report()
