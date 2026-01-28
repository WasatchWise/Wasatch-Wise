import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  generateRequestId,
  NotFoundError,
} from '@/lib/api/errors'
import { apiRateLimit, getRateLimitHeaders, getClientIp } from '@/lib/api/rate-limit'
import { logger } from '@/lib/logger'

// ============================================
// POST /api/goals/[id]/update-progress - Manually update goal progress
// ============================================

export async function POST(
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

    logger.info('Updating goal progress', { requestId, goalId: id })

    const supabase = await createServerSupabaseClient()

    // Check if goal exists
    const { data: goal, error: goalError } = await (supabase as any)
      .from('goals')
      .select('id')
      .eq('id', id)
      .single()

    if (goalError || !goal) {
      throw new NotFoundError('Goal')
    }

    // Call the update_goal_progress function
    const { error: functionError } = await (supabase as any).rpc('update_goal_progress', {
      p_goal_id: id,
    })

    if (functionError) {
      logger.error('Failed to update goal progress', { requestId, error: functionError.message })
      throw functionError
    }

    // Fetch updated goal data
    const { data: updatedGoal, error: fetchError } = await (supabase as any)
      .from('v_goals_dashboard')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      // Fallback to goals table if view doesn't exist
      const { data: fallbackGoal } = await (supabase as any)
        .from('goals')
        .select('*')
        .eq('id', id)
        .single()

      if (!fallbackGoal) {
        throw new NotFoundError('Goal')
      }

      logger.info('Goal progress updated', { requestId, goalId: id })

      return NextResponse.json(
        { goal: fallbackGoal, requestId },
        { headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    logger.info('Goal progress updated', { requestId, goalId: id })

    return NextResponse.json(
      { goal: updatedGoal, requestId },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

