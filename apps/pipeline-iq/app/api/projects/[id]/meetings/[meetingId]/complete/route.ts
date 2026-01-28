import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  generateRequestId,
  NotFoundError,
  ValidationError,
} from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import { NEPQ_GUARDRAILS } from '@/lib/nepq/guardrails'
import { z } from 'zod'

// ============================================
// POST /api/projects/[id]/meetings/[meetingId]/complete - Record meeting outcome
// ============================================

const outcomeSchema = z.object({
  outcome: z.enum(['interested', 'proposal_sent', 'not_interested', 'follow_up_needed']),
  notes: z.string().optional().default(''),
  proposal_data: z.object({
    services: z.array(z.string()),
    proposal_value: z.number(),
    proposal_date: z.string().datetime(),
  }).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; meetingId: string } }
) {
  const requestId = generateRequestId()

  try {
    // Validate IDs
    if (!params.id || !params.meetingId) {
      return NextResponse.json(
        { error: 'Invalid project or meeting ID', requestId },
        { status: 400 }
      )
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new ValidationError('Invalid JSON in request body')
    }

    const validation = outcomeSchema.safeParse(body)
    if (!validation.success) {
      throw new ValidationError('Invalid outcome data', validation.error.errors)
    }

    const { outcome, notes, proposal_data } = validation.data

    const supabase = await createServerSupabaseClient()

    // Get project to check current status
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, outreach_status, engagement_score, raw_data')
      .eq('id', params.id)
      .single()

    if (projectError || !project) {
      throw new NotFoundError('Project')
    }

    // Get meeting to update
    const { data: meeting, error: meetingError } = await supabase
      .from('outreach_activities')
      .select('*')
      .eq('id', params.meetingId)
      .eq('project_id', params.id)
      .eq('activity_type', 'meeting')
      .single()

    if (meetingError || !meeting) {
      throw new NotFoundError('Meeting')
    }

    // NEPQ VALIDATION: Check if outcome is allowed
    const currentStage = NEPQ_GUARDRAILS.getStageFromStatus(project.outreach_status || 'new')
    
    let newStatus = project.outreach_status

    // Determine new status based on outcome
    if (outcome === 'interested') {
      newStatus = 'interested'
      // NEPQ: Can advance from ENGAGEMENT/TRANSITION to INTERESTED
      const canAdvance = NEPQ_GUARDRAILS.canAdvanceStage(
        project.outreach_status || 'new',
        'interested',
        {
          engagementScore: project.engagement_score || 0,
          painIdentified: true, // Assume pain identified if they're interested
        }
      )

      if (!canAdvance.canAdvance) {
        return NextResponse.json(
          {
            error: 'Cannot mark as interested',
            reason: canAdvance.reason || 'NEPQ stage requirements not met',
            requiredActions: canAdvance.requiredActions,
            currentStage,
            requestId,
          },
          { status: 403 }
        )
      }
    } else if (outcome === 'proposal_sent') {
      newStatus = 'proposal_sent'
      
      if (!proposal_data) {
        return NextResponse.json(
          { error: 'Proposal data required when outcome is proposal_sent', requestId },
          { status: 400 }
        )
      }

      // NEPQ: Can only send proposal if in TRANSITION or PRESENTATION stage
      const canAdvance = NEPQ_GUARDRAILS.canAdvanceStage(
        project.outreach_status || 'new',
        'proposal_sent',
        {
          engagementScore: project.engagement_score || 0,
          painIdentified: true,
          solutionPresented: false,
        }
      )

      if (!canAdvance.canAdvance) {
        return NextResponse.json(
          {
            error: 'Cannot send proposal',
            reason: canAdvance.reason || 'Discovery criteria not met',
            requiredActions: canAdvance.requiredActions,
            currentStage,
            requestId,
          },
          { status: 403 }
        )
      }

      // Create proposal activity
      const { error: proposalError } = await supabase
        .from('outreach_activities')
        .insert({
          organization_id: process.env.ORGANIZATION_ID,
          project_id: params.id,
          activity_type: 'proposal',
          activity_date: proposal_data.proposal_date,
          metadata: {
            services: proposal_data.services,
            proposal_value: proposal_data.proposal_value,
            proposal_date: proposal_data.proposal_date,
          },
        })

      if (proposalError) {
        logger.error('Failed to create proposal activity', {
          requestId,
          error: proposalError.message,
        })
      }
    } else if (outcome === 'not_interested') {
      newStatus = 'not_interested'
      // Always allowed (can exit at any stage)
    } else if (outcome === 'follow_up_needed') {
      newStatus = 'follow_up_needed'
      // Keeps conversation in current stage
    }

    // Update meeting with outcome
    const { error: updateMeetingError } = await supabase
      .from('outreach_activities')
      .update({
        metadata: {
          ...(meeting.metadata as any || {}),
          outcome,
          notes: notes || '',
          completed_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.meetingId)

    if (updateMeetingError) {
      logger.error('Failed to update meeting', {
        requestId,
        error: updateMeetingError.message,
      })
      throw updateMeetingError
    }

    // Update project status
    const { error: updateProjectError } = await supabase
      .from('projects')
      .update({
        outreach_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateProjectError) {
      logger.error('Failed to update project status', {
        requestId,
        error: updateProjectError.message,
      })
      // Don't fail, but log
    }

    logger.info('Meeting outcome recorded', {
      requestId,
      projectId: params.id,
      meetingId: params.meetingId,
      outcome,
      newStatus,
      nepqStage: currentStage,
    })

    return NextResponse.json(
      {
        meeting: { ...meeting, metadata: { ...(meeting.metadata as any || {}), outcome } },
        project_status: newStatus,
        nepq_stage: NEPQ_GUARDRAILS.getStageFromStatus(newStatus || 'new'),
        requestId,
      },
      { status: 200 }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

