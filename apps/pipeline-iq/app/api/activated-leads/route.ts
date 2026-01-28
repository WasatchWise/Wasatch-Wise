import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/activated-leads
 * Returns projects where emails have been opened (activated leads)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Find outreach activities where email was opened
    const { data: activities, error: activitiesError } = await supabase
      .from('outreach_activities')
      .select(`
        id,
        project_id,
        contact_id,
        subject,
        opened_at,
        clicked_at,
        metadata,
        project:projects(
          id,
          project_name,
          city,
          state,
          project_type,
          total_score,
          outreach_status
        ),
        contact:contacts(
          id,
          first_name,
          last_name,
          email,
          title,
          phone
        )
      `)
      .eq('activity_type', 'email')
      .eq('status', 'opened')
      .not('opened_at', 'is', null)
      .order('opened_at', { ascending: false })
      .limit(limit)

    if (activitiesError) {
      logger.error('Failed to fetch activated leads', { error: activitiesError.message })
      return NextResponse.json({ error: activitiesError.message }, { status: 500 })
    }

    // Format the response
    const activatedLeads = (activities || []).map((activity: any) => ({
      id: activity.id,
      project: activity.project,
      contact: activity.contact,
      subject: activity.subject,
      opened_at: activity.opened_at,
      clicked_at: activity.clicked_at,
      metadata: activity.metadata,
      // Generate call script
      callScript: generateCallScript(activity),
    }))

    return NextResponse.json({ 
      leads: activatedLeads,
      count: activatedLeads.length 
    })
  } catch (error) {
    logger.error('Activated leads API error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateCallScript(activity: any): string {
  const contactName = activity.contact 
    ? `${activity.contact.first_name || ''} ${activity.contact.last_name || ''}`.trim() || activity.contact.email
    : 'there'
  const projectName = activity.project?.project_name || 'your project'
  
  return `Hey ${contactName}, it's Mike with Wasatch Wise. I sent you a quick note earlier about ${projectName} and saw you had a chance to glance at it. I'm not sure if we're relevant yet, but wanted to ask - is this something you're actively working on, or is it more of a future consideration?`
}

