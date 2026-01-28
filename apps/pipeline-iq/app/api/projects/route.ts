import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import {
  projectFiltersSchema,
  createProjectSchema,
  validateSearchParams,
  validateRequest,
} from '@/lib/api/validation'
import {
  createErrorResponse,
  generateRequestId,
  NotFoundError,
  ValidationError,
} from '@/lib/api/errors'
import { apiRateLimit, getRateLimitHeaders, getClientIp } from '@/lib/api/rate-limit'
import { logger, createTimer } from '@/lib/logger'
import { calculateGrooveScore, calculateTimingScore, calculateTotalScore } from '@/lib/utils/scoring'

export const dynamic = 'force-dynamic'

// ============================================
// GET /api/projects - Fetch projects with filters
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

    // Validate query parameters
    const validation = validateSearchParams(
      projectFiltersSchema,
      request.nextUrl.searchParams
    )

    if (!validation.success) {
      throw new ValidationError(validation.error, validation.details)
    }

    const { id, stage, type, state, minScore, maxScore, search, limit, offset } = validation.data

    logger.info('Fetching projects', {
      requestId,
      filters: { id, stage, type, state, minScore, maxScore, search, limit, offset },
    })

    const supabase = await createServerSupabaseClient()

    // First get total count with same filters (but no limit/offset)
    let countQuery = supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    // Apply filters to count query
    if (id) countQuery = countQuery.eq('id', id)
    if (stage) countQuery = countQuery.eq('project_stage', stage)
    if (type) countQuery = countQuery.contains('project_type', [type])
    if (state) countQuery = countQuery.eq('state', state)
    if (minScore !== undefined) countQuery = countQuery.gte('total_score', minScore)
    if (maxScore !== undefined) countQuery = countQuery.lte('total_score', maxScore)
    if (search) {
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&')
      countQuery = countQuery.or(
        `project_name.ilike.%${sanitizedSearch}%,city.ilike.%${sanitizedSearch}%`
      )
    }

    const { count: total } = await countQuery

    // Now get paginated data
    const pageOffset = offset ?? 0
    const pageLimit = limit ?? 50

    let query = supabase
      .from('projects')
      .select('*')
      .order('total_score', { ascending: false, nullsFirst: false })
      .range(pageOffset, pageOffset + pageLimit - 1)

    // Apply filters
    if (id) query = query.eq('id', id)
    if (stage) query = query.eq('project_stage', stage)
    if (type) query = query.contains('project_type', [type])
    if (state) query = query.eq('state', state)
    if (minScore !== undefined) query = query.gte('total_score', minScore)
    if (maxScore !== undefined) query = query.lte('total_score', maxScore)

    // Safe search - use parameterized query
    if (search) {
      // Escape special characters for safe pattern matching
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&')
      query = query.or(
        `project_name.ilike.%${sanitizedSearch}%,city.ilike.%${sanitizedSearch}%`
      )
    }

    const { data, error } = await query

    if (error) {
      logger.error('Database query failed', { requestId, error: error.message })
      throw error
    }

    timer.log('Projects fetched', { count: data?.length || 0, total })

    return NextResponse.json(
      {
        projects: data || [],
        count: data?.length || 0,
        total: total || 0,
        offset: pageOffset,
        limit: pageLimit,
        hasMore: (pageOffset + (data?.length || 0)) < (total || 0),
        requestId
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// POST /api/projects - Create a new project
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

    const validation = validateRequest(createProjectSchema, body)

    if (!validation.success) {
      throw new ValidationError(validation.error, validation.details)
    }

    logger.info('Creating project', {
      requestId,
      projectName: validation.data.project_name,
    })

    const supabase = await createServerSupabaseClient()

    // Calculate scores for the project
    const grooveFitScore = calculateGrooveScore({
      project_type: validation.data.project_type || [],
      project_stage: validation.data.project_stage || '',
      project_value: validation.data.project_value || 0,
      project_size_sqft: validation.data.square_footage ?? undefined,
      units_count: validation.data.units_count ?? undefined,
      services_needed: [],
      decision_timeline: undefined,
      city: validation.data.city ?? undefined,
      state: validation.data.state ?? undefined,
      estimated_start_date: validation.data.estimated_start_date ?? undefined,
    })

    const timingScore = calculateTimingScore({
      project_type: validation.data.project_type || [],
      project_stage: validation.data.project_stage || '',
      project_value: validation.data.project_value || 0,
      project_size_sqft: validation.data.square_footage ?? undefined,
      units_count: validation.data.units_count ?? undefined,
      services_needed: [],
      decision_timeline: undefined,
      city: validation.data.city ?? undefined,
      state: validation.data.state ?? undefined,
      estimated_start_date: validation.data.estimated_start_date ?? undefined,
    })

    const totalScore = calculateTotalScore(grooveFitScore, 0, timingScore)

    // Determine priority level based on score
    const priorityLevel = grooveFitScore >= 80 ? 'hot' : grooveFitScore >= 60 ? 'warm' : 'cold'

    // Map 'source' field to 'data_source' for database compatibility
    const { source, ...restData } = validation.data
    const dataSource = source || 'manual_entry'

    // Add organization_id from env and generate cw_project_id
    // Ensure required fields have defaults
    const projectData = {
      ...restData,
      organization_id: process.env.ORGANIZATION_ID,
      cw_project_id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      city: validation.data.city || 'Unknown',
      state: validation.data.state || 'Unknown',
      data_source: dataSource,
      groove_fit_score: grooveFitScore,
      timing_score: timingScore,
      total_score: totalScore,
      priority_level: priorityLevel,
      outreach_status: 'new',
    } as Database['public']['Tables']['projects']['Insert']

    const { data, error } = await (supabase as any)
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      logger.error('Failed to create project', { requestId, error: error.message })
      throw error
    }

    if (!data) {
      throw new NotFoundError('Project')
    }

    logger.info('Project created', { requestId, projectId: data.id })

    return NextResponse.json(
      { project: data, requestId },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}
