import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUsageSummary, checkFeatureAccess } from '@/lib/billing'
import { createErrorResponse, generateRequestId, AuthorizationError } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

interface OrgWithPlan {
  id: string
  name: string | null
  subscription_plan_id: string | null
  subscription_status: string | null
  subscription_plans: {
    id: string
    name: string
    display_name: string
    features: Record<string, boolean>
    limits: Record<string, number>
  } | null
}

/**
 * GET /api/billing/usage - Get usage stats for current organization
 */
export async function GET(request: NextRequest) {
    const requestId = generateRequestId()

    try {
        const supabase = await createServerSupabaseClient()
        const organizationId =
            request.headers.get('x-organization-id') || process.env.ORGANIZATION_ID

        if (!organizationId) {
            throw new AuthorizationError('Organization ID required')
        }

        logger.info('Fetching usage stats', { requestId, organizationId })

        // Get current month usage summary
        const usage = await getUsageSummary(organizationId)

        // Get organization's plan and limits
        const { data: org, error } = await supabase
            .from('organizations')
            .select(`
        id,
        name,
        subscription_plan_id,
        subscription_status,
        subscription_plans (
          id,
          name,
          display_name,
          features,
          limits
        )
      `)
            .eq('id', organizationId)
            .single()

        if (error) {
            logger.error('Failed to fetch organization', { requestId, error: error.message })
            throw error
        }

        const typedOrg = org as OrgWithPlan | null
        const plan = typedOrg?.subscription_plans

        // Calculate usage percentages
        const usageWithLimits: Record<string, {
            count: number
            cost: number
            limit: number | null
            percentage: number | null
        }> = {}

        const featureTypes = [
            'ai_email_generation',
            'ai_enrichment',
            'video_generation',
            'email_sent',
            'api_call',
            'project_scraped',
        ]

        for (const feature of featureTypes) {
            const featureUsage = usage?.[feature] || { count: 0, cost: 0 }
            const limit = plan?.limits?.[feature] || null

            usageWithLimits[feature] = {
                count: featureUsage.count,
                cost: featureUsage.cost,
                limit,
                percentage: limit ? Math.round((featureUsage.count / limit) * 100) : null,
            }
        }

        // Calculate total spend
        const totalSpendCents = Object.values(usage || {}).reduce(
            (sum, { cost }) => sum + (cost || 0),
            0
        )

        return NextResponse.json({
            organization: {
                id: typedOrg?.id,
                name: typedOrg?.name,
                plan: plan?.display_name || 'Free',
                planId: plan?.id || null,
                status: typedOrg?.subscription_status || 'active',
            },
            usage: usageWithLimits,
            totalSpendCents,
            billingPeriod: {
                start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
            },
            requestId,
        })
    } catch (error) {
        return createErrorResponse(error, requestId)
    }
}
