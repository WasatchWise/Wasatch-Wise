'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

export interface DashboardStats {
    pipelineVolume: number
    emailsSent: number
    replyRate: number
    recentActivity: ActivityItem[]
}

export interface ActivityItem {
    id: string
    type: string
    projectName: string
    description: string
    date: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
    noStore() // specific: ensure fresh data
    const supabase = await createServerSupabaseClient()

    // 1. Pipeline Volume (Total Active Projects)
    // We'll count everything in high_priority_projects for now
    const { count: pipelineVolume } = await supabase
        .from('high_priority_projects')
        .select('*', { count: 'exact', head: true })

    // 2. Emails Sent (Total Activities of type 'email' or 'call')
    // Using outreach_activities as the source of truth
    const { count: emailsSent } = await supabase
        .from('outreach_activities')
        .select('*', { count: 'exact', head: true })

    // 3. Reply Rate (Mocked for now, or calculated from campaign stats)
    // Real calculation would be: (responses / emails_sent) * 100
    // For now, let's just use a placeholder or 0 if no data
    const replyRate = 0 // pending real data

    // 4. Recent Activity
    const { data: activities } = await supabase
        .from('outreach_activities')
        .select(`
      id,
      activity_type,
      created_at,
      metadata,
      project_id,
      high_priority_projects (
        project_name
      )
    `)
        .order('created_at', { ascending: false })
        .limit(10)

    const recentActivity: ActivityItem[] = (activities || []).map((a: any) => ({
        id: a.id,
        type: a.activity_type,
        projectName: a.high_priority_projects?.project_name || 'Unknown Project',
        description: formatActivityDescription(a),
        date: a.created_at
    }))

    return {
        pipelineVolume: pipelineVolume || 0,
        emailsSent: emailsSent || 0,
        replyRate,
        recentActivity
    }
}

function formatActivityDescription(activity: any): string {
    const type = activity.activity_type
    const meta = activity.metadata || {}

    if (type === 'email_sent') return `Sent email: ${meta.subject || 'Outreach'}`
    if (type === 'call') return `Logged call: ${meta.outcome || 'No outcome'}`
    if (type === 'enrichment') return `Enriched project data`

    return `Performed ${type}`
}
