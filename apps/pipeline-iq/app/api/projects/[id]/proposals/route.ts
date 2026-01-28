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
// POST /api/projects/[id]/proposals - Create proposal
// ============================================

const proposalSchema = z.object({
  services: z.array(z.string()).min(1),
  proposal_value: z.number().positive(),
  proposal_date: z.string().datetime(),
  notes: z.string().optional().default(''),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()

  try {
    // Validate project ID
    if (!params.id) {
      return NextResponse.json(
        { error: 'Invalid project ID', requestId },
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

    const validation = proposalSchema.safeParse(body)
    if (!validation.success) {
      throw new ValidationError('Invalid proposal data', validation.error.errors)
    }

    const { services, proposal_value, proposal_date, notes } = validation.data

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

    // NEPQ VALIDATION: Check if proposal is allowed
    const currentStage = NEPQ_GUARDRAILS.getStageFromStatus(project.outreach_status || 'new')
    
    // Can only send proposal if in TRANSITION or PRESENTATION stage
    const canAdvance = NEPQ_GUARDRAILS.canAdvanceStage(
      project.outreach_status || 'new',
      'proposal_sent',
      {
        engagementScore: project.engagement_score || 0,
        painIdentified: true, // Assume pain identified if proposal being sent
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

    // Validate proposal notes against NEPQ guardrails
    if (notes) {
      const nepqValidation = NEPQ_GUARDRAILS.validateContent(notes, currentStage)
      if (!nepqValidation.valid && nepqValidation.violations.length > 0) {
        // Warn but don't block - proposal notes might be more detailed
        logger.warn('Proposal notes have NEPQ violations', {
          requestId,
          violations: nepqValidation.violations,
        })
      }
    }

    // Get organization ID
    const organizationId = process.env.ORGANIZATION_ID
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID not configured', requestId },
        { status: 500 }
      )
    }

    // Create proposal activity
    const { data: proposal, error: proposalError } = await supabase
      .from('outreach_activities')
      .insert({
        organization_id: organizationId,
        project_id: params.id,
        activity_type: 'proposal',
        activity_date: proposal_date,
        metadata: {
          services,
          proposal_value,
          proposal_date,
          notes: notes || '',
          nepq_stage: currentStage,
        },
      })
      .select()
      .single()

    if (proposalError) {
      logger.error('Failed to create proposal', {
        requestId,
        error: proposalError.message,
      })
      throw proposalError
    }

    // Update project status to 'proposal_sent'
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        outreach_status: 'proposal_sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      logger.error('Failed to update project status', {
        requestId,
        error: updateError.message,
      })
      // Don't fail, but log
    }

    logger.info('Proposal created', {
      requestId,
      projectId: params.id,
      services: services.length,
      proposalValue: proposal_value,
      nepqStage: currentStage,
    })

    return NextResponse.json(
      {
        proposal,
        project_status: 'proposal_sent',
        nepq_stage: NEPQ_GUARDRAILS.getStageFromStatus('proposal_sent'),
        requestId,
      },
      { status: 201 }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// GET /api/projects/[id]/proposals - Get all proposals for project
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()

  try {
    const supabase = await createServerSupabaseClient()

    const { data: proposals, error } = await supabase
      .from('outreach_activities')
      .select('*')
      .eq('project_id', params.id)
      .eq('activity_type', 'proposal')
      .order('activity_date', { ascending: false })

    if (error) {
      logger.error('Failed to fetch proposals', {
        requestId,
        error: error.message,
      })
      throw error
    }

    return NextResponse.json(
      { proposals: proposals || [], requestId },
      { status: 200 }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

