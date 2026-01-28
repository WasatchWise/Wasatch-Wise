import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createErrorResponse, generateRequestId } from '@/lib/api/errors'
import { getScoreDrivers } from '@/lib/utils/scoring'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const requestId = generateRequestId()

    try {
        const supabase = await createServerSupabaseClient()
        const orgId = process.env.ORGANIZATION_ID

        if (!orgId) {
            return NextResponse.json({ error: 'Organization ID not configured' }, { status: 500 })
        }

        // Pagination Params
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = 10
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1 // Supabase is inclusive

        // 1. Fetch "Fresh Sure Bets" (High Score, New)
        // Projects that are high value and haven't been contacted
        const { data: sureBets } = await supabase
            .from('projects')
            .select('*')
            .eq('organization_id', orgId)
            // .eq('outreach_status', 'new') // "new" might be null or different string, relying on score mainly
            // To be safe, we want things that are NOT 'contacted', 'negotiation', 'closed' etc.
            // But for now sticking to audit finding: 'new' is fine if data is clean.
            .eq('outreach_status', 'new')
            .gte('total_score', 80)
            .order('total_score', { ascending: false })
            .range(from, to)

        // 2. Fetch "Hot Leads" (Opened Emails)
        const { data: hotLeads } = await supabase
            .from('outreach_activities')
            .select(`
                *,
                contact:contacts(first_name, last_name, email),
                project:projects(id, project_name, project_value, project_type, project_stage)
            `)
            .eq('organization_id', orgId)
            .eq('activity_type', 'email')
            .not('opened_at', 'is', null) // Has been opened
            .order('opened_at', { ascending: false })
            .range(from, to)

        // 3. Fetch "Due Tasks" (Snoozed/Bumped Projects)
        // Projects where next_contact_date is today or in the past
        const now = new Date().toISOString()
        const { data: dueTasks } = await supabase
            .from('projects')
            .select('*')
            .eq('organization_id', orgId)
            .lte('next_contact_date', now)
            .order('next_contact_date', { ascending: true }) // Oldest due date first
            .range(from, to)

        // 4. Fetch "No Reply" (Stale Emails) - Formerly "Follow Ups"
        // Emails sent > 3 days ago, no open, no reply
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - 3)

        const { data: noReplies } = await supabase
            .from('outreach_activities')
            .select(`
                *,
                contact:contacts(first_name, last_name, email),
                project:projects(id, project_name, project_value, project_type, project_stage)
            `)
            .eq('organization_id', orgId)
            .eq('activity_type', 'email')
            .eq('status', 'sent')
            .lt('created_at', cutoffDate.toISOString())
            .is('opened_at', null)
            .order('created_at', { ascending: true })
            .range(from, to)

        // 5. Transform into "Feed Items"
        const feed = []

        // Sure Bets
        for (const project of (sureBets || [])) {
            feed.push({
                id: `project-${project.id}`,
                type: 'sure_bet',
                score: project.total_score || 0,
                title: project.project_name,
                subtitle: `${project.city || 'Unknown'}, ${project.state || ''}`,
                drivers: getScoreDrivers(project as any), // Type mismatch: getScoreDrivers expects specific object shape, projects Row is compatible enough or we cast
                action: 'Draft Email',
                data: { projectId: project.id }
            })
        }

        // Hot Leads
        for (const activity of (hotLeads || [])) {
            // @ts-ignore - Supabase specific join types are tricky to infer automatically
            const contactName = activity.contact?.first_name
                // @ts-ignore
                ? `${activity.contact.first_name} ${activity.contact.last_name || ''}`
                : 'Contact'
            // @ts-ignore
            const projectName = activity.project?.project_name || 'Project'

            // Determine engagement level
            const hasClicked = !!activity.clicked_at
            const actionVerb = hasClicked ? 'clicked a link in' : 'opened'
            const score = hasClicked ? 110 : 100 // Boost score for clicks

            feed.push({
                id: `hot-${activity.id}`,
                type: 'hot_lead',
                score: score,
                title: `${contactName} ${actionVerb} your email`,
                subtitle: `Project: ${projectName}`,
                drivers: hasClicked ? ['Link Click', 'High Intent'] : ['Opened Email', 'Hot Lead'],
                action: 'Log Call',
                data: { activityId: activity.id, projectId: activity.project_id }
            })
        }

        // Due Tasks (NEW)
        for (const project of (dueTasks || [])) {
            feed.push({
                id: `due-${project.id}`,
                type: 'follow_up', // Using "follow_up" ID for the UI logic (Badge: Follow Up)
                score: 95, // Very high priority
                title: `Follow Up Due: ${project.project_name}`,
                subtitle: `Scheduled for ${new Date(project.next_contact_date!).toLocaleDateString()}`,
                drivers: ['Scheduled Task', 'Due Now'],
                action: 'Log Call',
                data: { projectId: project.id }
            })
        }

        // No Reply (Stale)
        for (const activity of (noReplies || [])) {
            // @ts-ignore
            const contactName = activity.contact?.first_name
                // @ts-ignore
                ? `${activity.contact.first_name} ${activity.contact.last_name || ''}`
                : 'Contact'
            // @ts-ignore
            const projectName = activity.project?.project_name || 'Project'

            feed.push({
                id: `noreply-${activity.id}`,
                type: 'at_risk', // New type we'll handle in UI
                score: 60,
                title: `No Reply: ${projectName}`,
                subtitle: `Sent to ${contactName} 3+ days ago`,
                drivers: ['No Reply', 'Stale'],
                action: 'Bump', // This will open the Bump Modal
                data: { activityId: activity.id, projectId: activity.project_id }
            })
        }

        // Sort by Score
        feed.sort((a, b) => b.score - a.score)

        return NextResponse.json({
            feed,
            count: feed.length,
            nextPage: feed.length >= pageSize ? page + 1 : null, // Heuristic: if we got full page, assumes more coming
            requestId
        })

    } catch (error) {
        return createErrorResponse(error, requestId)
    }
}
