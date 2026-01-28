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
// POST /api/projects/[id]/close - Mark deal as won or lost
// ============================================

const closeSchema = z.object({
  outcome: z.enum(['won', 'lost']),
  services_sold: z.array(z.string()).optional(), // Required if won
  deal_value: z.number().optional(), // Required if won
  close_date: z.string().datetime(),
  commission: z.number().optional(), // Auto-calculated if not provided
  notes: z.string().optional().default(''),
  lost_reason: z.string().optional(), // Required if lost
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

    const validation = closeSchema.safeParse(body)
    if (!validation.success) {
      throw new ValidationError('Invalid close data', validation.error.errors)
    }

    const { outcome, services_sold, deal_value, close_date, commission, notes, lost_reason } = validation.data

    // Validate required fields based on outcome
    if (outcome === 'won') {
      if (!services_sold || services_sold.length === 0) {
        return NextResponse.json(
          { error: 'Services sold required when marking as won', requestId },
          { status: 400 }
        )
      }
      if (!deal_value || deal_value <= 0) {
        return NextResponse.json(
          { error: 'Deal value required when marking as won', requestId },
          { status: 400 }
        )
      }
    } else if (outcome === 'lost') {
      if (!lost_reason) {
        return NextResponse.json(
          { error: 'Lost reason required when marking as lost', requestId },
          { status: 400 }
        )
      }
    }

    const supabase = await createServerSupabaseClient()

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, outreach_status')
      .eq('id', params.id)
      .single()

    if (projectError || !project) {
      throw new NotFoundError('Project')
    }

    // NEPQ VALIDATION: Check if 'won' is allowed
    if (outcome === 'won') {
      const currentStage = NEPQ_GUARDRAILS.getStageFromStatus(project.outreach_status || 'new')
      const canAdvance = NEPQ_GUARDRAILS.canAdvanceStage(
        project.outreach_status || 'new',
        'won',
        {
          engagementScore: 100, // Assume high engagement if closing
          painIdentified: true,
          solutionPresented: true,
          commitmentSecured: true,
        }
      )

      if (!canAdvance.canAdvance) {
        return NextResponse.json(
          {
            error: 'Cannot mark as won',
            reason: canAdvance.reason || 'NEPQ stage requirements not met',
            currentStage,
            requestId,
          },
          { status: 403 }
        )
      }
    }

    // Calculate commission if not provided (won only)
    let calculatedCommission = commission
    if (outcome === 'won' && services_sold && !commission) {
      calculatedCommission = services_sold.length * 1000 // $1,000 per service
    }

    // Get organization ID
    const organizationId = process.env.ORGANIZATION_ID
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID not configured', requestId },
        { status: 500 }
      )
    }

    // Update project
    const updateData: any = {
      outreach_status: outcome,
      updated_at: new Date().toISOString(),
    }

    if (outcome === 'won') {
      updateData.actual_revenue = deal_value
      updateData.closed_at = close_date
      // Store services sold in metadata or new field
      updateData.services_needed = services_sold // Reusing existing field for now
    } else {
      updateData.outreach_status = 'lost'
      // Store lost reason in notes or metadata
    }

    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to update project', {
        requestId,
        error: updateError.message,
      })
      throw updateError
    }

    // Create close activity
    const { error: activityError } = await supabase
      .from('outreach_activities')
      .insert({
        organization_id: organizationId,
        project_id: params.id,
        activity_type: outcome === 'won' ? 'deal_won' : 'deal_lost',
        activity_date: close_date,
        metadata: {
          outcome,
          services_sold: services_sold || [],
          deal_value: deal_value || 0,
          commission: calculatedCommission || 0,
          lost_reason: lost_reason || '',
          notes: notes || '',
        },
      })

    if (activityError) {
      logger.error('Failed to create close activity', {
        requestId,
        error: activityError.message,
      })
      // Don't fail, but log
    }

    logger.info('Deal closed', {
      requestId,
      projectId: params.id,
      outcome,
      dealValue: deal_value || 0,
      commission: calculatedCommission || 0,
    })

    return NextResponse.json(
      {
        project: updatedProject,
        outcome,
        commission: calculatedCommission || 0,
        requestId,
      },
      { status: 200 }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

