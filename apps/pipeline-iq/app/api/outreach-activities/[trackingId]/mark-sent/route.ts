import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * POST /api/outreach-activities/[trackingId]/mark-sent
 * Marks an email as sent by Mike (human in the loop)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const trackingId = params.trackingId

    // Find the outreach activity by tracking_id in metadata
    const { data: activities, error: findError } = await supabase
      .from('outreach_activities')
      .select('*')
      .contains('metadata', { tracking_id: trackingId })

    if (findError || !activities || activities.length === 0) {
      logger.error('Activity not found', { trackingId })
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const activity = activities[0]

    // Update status to 'sent' and set sent timestamp
    const { error: updateError } = await supabase
      .from('outreach_activities')
      .update({
        status: 'sent',
        created_at: new Date().toISOString(), // This marks when it was sent
      })
      .eq('id', activity.id)

    if (updateError) {
      logger.error('Failed to update activity', { error: updateError.message })
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    // Also update project status to 'contacted' if it's still 'new'
    if (activity.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('outreach_status')
        .eq('id', activity.project_id)
        .single()

      if (project && project.outreach_status === 'new') {
        await supabase
          .from('projects')
          .update({ outreach_status: 'contacted' })
          .eq('id', activity.project_id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Mark sent error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

