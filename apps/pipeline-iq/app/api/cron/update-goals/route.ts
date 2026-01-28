import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// ============================================
// POST /api/cron/update-goals - Update all active goal progress
// Can be called by Vercel Cron, GitHub Actions, or external cron service
// ============================================

export async function POST(request: NextRequest) {
  const requestId = `cron-${Date.now()}`
  const startTime = Date.now()

  try {
    // Optional: Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron request', { requestId })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('Starting goal progress update cron job', { requestId })

    const supabase = await createServerSupabaseClient()
    const orgId = process.env.ORGANIZATION_ID

    // Get all active goals
    const { data: goals, error: goalsError } = await (supabase as any)
      .from('goals')
      .select('id')
      .eq('organization_id', orgId)
      .eq('status', 'active')

    if (goalsError) {
      logger.error('Failed to fetch goals', { requestId, error: goalsError.message })
      throw goalsError
    }

    if (!goals || goals.length === 0) {
      logger.info('No active goals to update', { requestId })
      return NextResponse.json({
        success: true,
        updated: 0,
        message: 'No active goals found',
        requestId,
      })
    }

    // Update progress for each goal
    let updated = 0
    let errors = 0

    for (const goal of goals) {
      try {
        const { error: updateError } = await (supabase as any).rpc('update_goal_progress', {
          p_goal_id: goal.id,
        })

        if (updateError) {
          logger.error('Failed to update goal progress', {
            requestId,
            goalId: goal.id,
            error: updateError.message,
          })
          errors++
        } else {
          updated++
        }
      } catch (error: any) {
        logger.error('Error updating goal', {
          requestId,
          goalId: goal.id,
          error: error.message,
        })
        errors++
      }
    }

    const duration = Date.now() - startTime

    logger.info('Goal progress update cron job completed', {
      requestId,
      total: goals.length,
      updated,
      errors,
      duration,
    })

    return NextResponse.json({
      success: true,
      total: goals.length,
      updated,
      errors,
      duration,
      requestId,
    })
  } catch (error: any) {
    logger.error('Goal progress update cron job failed', {
      requestId,
      error: error.message,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        requestId,
      },
      { status: 500 }
    )
  }
}

// Also support GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request)
}

