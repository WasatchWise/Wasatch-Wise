import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  createErrorResponse,
  generateRequestId,
  NotFoundError,
  ValidationError,
} from '@/lib/api/errors'
import { apiRateLimit, getRateLimitHeaders, getClientIp } from '@/lib/api/rate-limit'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// Note: Goals tables are created in migration 010_goals.sql
// TypeScript types will be updated after running the migration

// ============================================
// Validation Schemas
// ============================================

const updateGoalSchema = z.object({
  goal_name: z.string().min(1).max(200).optional(),
  target_value: z.number().positive().optional(),
  current_value: z.number().min(0).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
  breakdown: z.record(z.unknown()).optional(),
  notes: z.string().max(1000).optional(),
})

// ============================================
// GET /api/goals/[id] - Get a specific goal
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id } = await params

  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimitResult = apiRateLimit(clientIp)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    logger.info('Fetching goal', { requestId, goalId: id })

    const supabase = await createServerSupabaseClient()

    // Try to get from view first for calculated metrics
    // Using any cast since goals table is added in migration 010
    const { data, error } = await (supabase as any)
      .from('v_goals_dashboard')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      // If view doesn't exist, fall back to table
      if (error.message.includes('does not exist')) {
        const { data: fallbackData, error: fallbackError } = await (supabase as any)
          .from('goals')
          .select('*')
          .eq('id', id)
          .single()

        if (fallbackError) {
          if (fallbackError.code === 'PGRST116') {
            throw new NotFoundError('Goal')
          }
          throw fallbackError
        }

        return NextResponse.json(
          { goal: fallbackData, requestId },
          { headers: getRateLimitHeaders(rateLimitResult) }
        )
      }

      if (error.code === 'PGRST116') {
        throw new NotFoundError('Goal')
      }
      throw error
    }

    // Also get progress history
    const { data: progressData } = await (supabase as any)
      .from('goal_progress')
      .select('*')
      .eq('goal_id', id)
      .order('snapshot_date', { ascending: false })
      .limit(30)

    // Also get active recommendations
    const { data: recommendationsData } = await (supabase as any)
      .from('goal_recommendations')
      .select('*')
      .eq('goal_id', id)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(10)

    return NextResponse.json(
      {
        goal: data,
        progress_history: progressData || [],
        recommendations: recommendationsData || [],
        requestId,
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// PATCH /api/goals/[id] - Update a goal
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id } = await params

  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimitResult = apiRateLimit(clientIp)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new ValidationError('Invalid JSON in request body')
    }

    const validation = updateGoalSchema.safeParse(body)
    if (!validation.success) {
      throw new ValidationError(
        validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      )
    }

    logger.info('Updating goal', { requestId, goalId: id, updates: Object.keys(validation.data) })

    const supabase = await createServerSupabaseClient()

    // Using any cast since goals table is added in migration 010
    const { data, error } = await (supabase as any)
      .from('goals')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Goal')
      }
      logger.error('Failed to update goal', { requestId, error: error.message })
      throw error
    }

    logger.info('Goal updated', { requestId, goalId: id })

    return NextResponse.json(
      { goal: data, requestId },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// DELETE /api/goals/[id] - Delete a goal
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id } = await params

  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimitResult = apiRateLimit(clientIp)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    logger.info('Deleting goal', { requestId, goalId: id })

    const supabase = await createServerSupabaseClient()

    // Using any cast since goals table is added in migration 010
    const { error } = await (supabase as any).from('goals').delete().eq('id', id)

    if (error) {
      logger.error('Failed to delete goal', { requestId, error: error.message })
      throw error
    }

    logger.info('Goal deleted', { requestId, goalId: id })

    return NextResponse.json(
      { success: true, requestId },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}
