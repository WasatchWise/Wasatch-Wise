import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  createErrorResponse,
  generateRequestId,
  ValidationError,
} from '@/lib/api/errors'
import { apiRateLimit, getRateLimitHeaders, getClientIp } from '@/lib/api/rate-limit'
import { logger, createTimer } from '@/lib/logger'

// Note: Goals tables are created in migration 010_goals.sql
// TypeScript types will be updated after running the migration

// ============================================
// Validation Schemas
// ============================================

const goalFiltersSchema = z.object({
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
  type: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const createGoalSchema = z.object({
  goal_name: z.string().min(1).max(200),
  goal_type: z.enum([
    'revenue',
    'deals_closed',
    'services_sold',
    'pipeline_value',
    'meetings_booked',
    'emails_sent',
    'custom',
  ]),
  target_value: z.number().positive(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  breakdown: z.record(z.unknown()).optional(),
  service_type: z.string().optional(),
  vertical: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

// ============================================
// GET /api/goals - Fetch goals with optional filters
// ============================================

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const timer = createTimer()

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

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    const validation = goalFiltersSchema.safeParse(params)
    if (!validation.success) {
      throw new ValidationError(
        validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      )
    }

    const { status, type, limit } = validation.data

    logger.info('Fetching goals', {
      requestId,
      filters: { status, type, limit },
    })

    const supabase = await createServerSupabaseClient()

    // Query the dashboard view for calculated metrics
    // Using any cast since goals table is added in migration 010
    let query = (supabase as any)
      .from('v_goals_dashboard')
      .select('*')
      .order('end_date', { ascending: true })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }
    if (type) {
      query = query.eq('goal_type', type)
    }

    const { data, error } = await query

    if (error) {
      // If view doesn't exist, fall back to goals table
      if (error.message.includes('does not exist')) {
        const fallbackQuery = (supabase as any)
          .from('goals')
          .select('*')
          .order('end_date', { ascending: true })
          .limit(limit)

        if (status) {
          fallbackQuery.eq('status', status)
        }
        if (type) {
          fallbackQuery.eq('goal_type', type)
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery

        if (fallbackError) {
          logger.error('Database query failed', { requestId, error: fallbackError.message })
          throw fallbackError
        }

        timer.log('Goals fetched (fallback)', { count: fallbackData?.length || 0 })

        return NextResponse.json(
          { goals: fallbackData || [], count: fallbackData?.length || 0, requestId },
          { headers: getRateLimitHeaders(rateLimitResult) }
        )
      }

      logger.error('Database query failed', { requestId, error: error.message })
      throw error
    }

    timer.log('Goals fetched', { count: data?.length || 0 })

    return NextResponse.json(
      { goals: data || [], count: data?.length || 0, requestId },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// POST /api/goals - Create a new goal
// ============================================

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

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

    const validation = createGoalSchema.safeParse(body)
    if (!validation.success) {
      throw new ValidationError(
        validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      )
    }

    // Validate date range
    const startDate = new Date(validation.data.start_date)
    const endDate = new Date(validation.data.end_date)
    if (endDate <= startDate) {
      throw new ValidationError('End date must be after start date')
    }

    logger.info('Creating goal', {
      requestId,
      goalName: validation.data.goal_name,
      goalType: validation.data.goal_type,
    })

    const supabase = await createServerSupabaseClient()

    // Add organization_id from env
    const goalData = {
      ...validation.data,
      organization_id: process.env.ORGANIZATION_ID,
      current_value: 0,
      status: 'active',
    }

    // Using any cast since goals table is added in migration 010
    const { data, error } = await (supabase as any).from('goals').insert(goalData).select().single()

    if (error) {
      logger.error('Failed to create goal', { requestId, error: error.message })
      throw error
    }

    logger.info('Goal created', { requestId, goalId: data.id })

    return NextResponse.json(
      { goal: data, requestId },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}
