import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database.types'
import { enrichProjectLocation, findDeveloperVideos, findLocalCompetitors } from '@/lib/ai/google'
import { analyzeProjectDescription, generateProjectInsights } from '@/lib/ai/openai'
import {
  checkFeatureAccess,
  trackFeatureUsage,
  calculateEnrichmentCost,
  shouldBypassAllRestrictions,
} from '@/lib/permissions'
import {
  createErrorResponse,
  generateRequestId,
  NotFoundError,
  AuthorizationError,
} from '@/lib/api/errors'
import { enrichmentRateLimit, getRateLimitHeaders, getClientIp } from '@/lib/api/rate-limit'
import { logger, createTimer } from '@/lib/logger'
import { uuidSchema } from '@/lib/api/validation'
import { featureFlags } from '@/lib/config/env'

// ============================================
// POST /api/projects/[id]/enrich - AI-powered enrichment
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  const timer = createTimer()

  try {
    // Validate project ID
    const idValidation = uuidSchema.safeParse(params.id)
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid project ID format', requestId },
        { status: 400 }
      )
    }

    // Check if AI features are available
    if (!featureFlags.aiEnrichment) {
      logger.warn('AI enrichment attempted but not configured', { requestId })
      return NextResponse.json(
        {
          error: 'AI enrichment is not configured',
          message: 'Please configure OPENAI_API_KEY and GOOGLE_PLACES_API_KEY',
          requestId,
        },
        { status: 503 }
      )
    }

    // Rate limiting based on IP and organization
    const clientIp = getClientIp(request)
    const rateLimitResult = enrichmentRateLimit(clientIp)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Enrichment is limited to 10 requests per minute',
          retryAfter: rateLimitResult.retryAfter,
          requestId,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get organization ID from headers or env
    const organizationId =
      request.headers.get('x-organization-id') || process.env.ORGANIZATION_ID

    if (!organizationId) {
      throw new AuthorizationError('Organization ID required')
    }

    // Get user from session (if available)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if Mike should bypass all restrictions
    const bypassRestrictions = await shouldBypassAllRestrictions(user?.id, organizationId)

    if (bypassRestrictions) {
      logger.info('Mike\'s access - bypassing all restrictions for enrichment', { 
        requestId, 
        userId: user?.id,
        organizationId
      })
      // Mike has full access - skip all feature checks
    } else {
      // Check feature access for regular users
      const access = await checkFeatureAccess(organizationId, 'ai_enrichment', user?.id)

      if (!access.allowed) {
        return NextResponse.json(
          {
            error: 'Feature not available',
            reason: access.reason,
            currentUsage: access.currentUsage,
            limit: access.limit,
            upgradeUrl: access.upgradeUrl,
            upgradePlan: access.upgradePlan,
            message:
              access.upgradePlan === 'pro'
                ? 'Upgrade to Pro to unlock AI enrichment'
                : 'Increase your AI enrichment limit',
            requestId,
          },
          { status: 403 }
        )
      }
    }

    // Fetch project
    logger.info('Fetching project for enrichment', { requestId, projectId: params.id })

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      logger.error('Failed to fetch project', { requestId, error: error.message })
      throw error
    }

    if (!project) {
      throw new NotFoundError('Project')
    }

    timer.log('Project fetched, starting enrichment')

    // Convert null values to undefined for function compatibility
    const projectForEnrich = {
      project_name: project.project_name,
      project_type: project.project_type ?? undefined,
      project_stage: project.project_stage ?? undefined,
      project_value: project.project_value ?? undefined,
      city: project.city ?? undefined,
      state: project.state ?? undefined,
      address: project.address ?? undefined,
      zip: project.zip ?? undefined,
      latitude: project.latitude ?? undefined,
      longitude: project.longitude ?? undefined,
    }

    const rawData = project.raw_data as { description?: string } | null

    // Run AI enrichment in parallel for speed
    // Each function handles its own errors gracefully
    const enrichmentResults = await Promise.allSettled([
      // Google Places enrichment
      enrichProjectLocation(projectForEnrich),

      // YouTube research
      findDeveloperVideos({
        projectName: project.project_name,
        projectType: project.project_type?.[0],
        location: `${project.city}, ${project.state}`,
      }),

      // OpenAI project analysis
      rawData?.description
        ? analyzeProjectDescription(rawData.description, projectForEnrich)
        : Promise.resolve(null),

      // OpenAI strategic insights
      generateProjectInsights(projectForEnrich),

      // Local competitors
      project.latitude && project.longitude
        ? findLocalCompetitors(project.latitude, project.longitude)
        : Promise.resolve([]),
    ])

    // Extract results, using null for failures
    const [locationResult, videosResult, analysisResult, insightsResult, competitorsResult] =
      enrichmentResults

    const locationData =
      locationResult.status === 'fulfilled' ? locationResult.value : null
    const developerVideos =
      videosResult.status === 'fulfilled'
        ? videosResult.value
        : { videos: [], analysis: null }
    const projectAnalysis =
      analysisResult.status === 'fulfilled' ? analysisResult.value : null
    const aiInsights =
      insightsResult.status === 'fulfilled' ? insightsResult.value : null
    const competitors =
      competitorsResult.status === 'fulfilled' ? competitorsResult.value : []

    // Log any failures
    enrichmentResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        const services = ['location', 'videos', 'analysis', 'insights', 'competitors']
        logger.warn(`Enrichment service failed: ${services[index]}`, {
          requestId,
          error: result.reason?.message || 'Unknown error',
        })
      }
    })

    timer.log('Enrichment complete')

    // Build enriched data object
    const enrichedData = {
      location_data: locationData,
      developer_videos: developerVideos,
      ai_analysis: projectAnalysis,
      ai_insights: aiInsights,
      local_competitors: competitors,
      enriched_at: new Date().toISOString(),
      enrichment_request_id: requestId,
    }

    // Update project with enriched data
    const existingRawData = (project.raw_data ?? {}) as Record<string, unknown>
    const { data: updated, error: updateError } = await supabase
      .from('projects')
      .update({
        raw_data: {
          ...existingRawData,
          enrichment: enrichedData,
        } as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to update project with enrichment', {
        requestId,
        error: updateError.message,
      })
      throw updateError
    }

    // Track usage for billing/limits (skip if god mode)
    if (user && !bypassRestrictions) {
      await trackFeatureUsage(
        organizationId,
        user.id,
        'ai_enrichment',
        1,
        calculateEnrichmentCost(),
        { project_id: params.id, project_name: project.project_name }
      )
    }

    logger.info('Project enrichment complete', {
      requestId,
      projectId: params.id,
      hasLocation: !!locationData,
      hasVideos: (developerVideos?.videos?.length || 0) > 0,
      hasAnalysis: !!projectAnalysis,
      hasInsights: !!aiInsights,
      competitorsFound: competitors?.length || 0,
    })

    return NextResponse.json({
      success: true,
      project: updated,
      enrichment: enrichedData,
      requestId,
    })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// GET /api/projects/[id]/enrich - Get enrichment status
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()

  try {
    // Validate project ID
    const idValidation = uuidSchema.safeParse(params.id)
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid project ID format', requestId },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: project, error } = await supabase
      .from('projects')
      .select('id, project_name, raw_data')
      .eq('id', params.id)
      .single()

    if (error) {
      logger.error('Failed to fetch project', { requestId, error: error.message })
      throw error
    }

    if (!project) {
      throw new NotFoundError('Project')
    }

    const rawData = project.raw_data as { enrichment?: Record<string, unknown> } | null
    const enrichment = rawData?.enrichment as {
      enriched_at?: string
      location_data?: unknown
      developer_videos?: { videos?: unknown[] }
      ai_analysis?: unknown
      ai_insights?: unknown
      local_competitors?: unknown[]
    } | undefined

    return NextResponse.json({
      project_id: project.id,
      project_name: project.project_name,
      is_enriched: !!enrichment,
      enriched_at: enrichment?.enriched_at || null,
      has_location_data: !!enrichment?.location_data,
      has_videos: (enrichment?.developer_videos?.videos?.length || 0) > 0,
      has_ai_analysis: !!enrichment?.ai_analysis,
      has_ai_insights: !!enrichment?.ai_insights,
      competitors_found: enrichment?.local_competitors?.length || 0,
      requestId,
    })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}
