import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * POST /api/projects/[id]/call
 * Records a call activity and allows adding notes/metadata
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { contact_id, notes, outcome, next_steps, metadata } = body
    
    const supabase = await createServerSupabaseClient()
    const projectId = params.id

    // Create call activity
    const { data: activity, error: activityError } = await supabase
      .from('outreach_activities')
      .insert({
        project_id: projectId,
        contact_id: contact_id || null,
        activity_type: 'call',
        status: 'completed',
        metadata: {
          notes,
          outcome, // 'interested', 'not_interested', 'callback', 'voicemail', etc.
          next_steps,
          ...metadata,
        },
      })
      .select()
      .single()

    if (activityError) {
      logger.error('Failed to create call activity', { error: activityError.message })
      return NextResponse.json({ error: 'Failed to record call' }, { status: 500 })
    }

    // Update project status based on outcome
    if (outcome === 'interested' || outcome === 'callback') {
      await supabase
        .from('projects')
        .update({ outreach_status: 'qualified' })
        .eq('id', projectId)
    } else if (outcome === 'not_interested') {
      // Maybe archive or mark as lost
    }

    // Update contact's last_contacted if contact_id provided
    if (contact_id) {
      await supabase
        .from('contacts')
        .update({ 
          last_contacted: new Date().toISOString(),
          response_status: outcome === 'interested' ? 'engaged' : 'responded',
        })
        .eq('id', contact_id)
    }

    return NextResponse.json({ success: true, activity })
  } catch (error) {
    logger.error('Call recording error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

