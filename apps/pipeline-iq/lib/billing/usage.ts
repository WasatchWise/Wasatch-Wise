/**
 * Usage Tracking & Limits
 * Tracks feature usage per organization and enforces tier limits
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { shouldBypassAllRestrictions } from '@/lib/permissions'

// Feature types for tracking
export type FeatureType =
    | 'ai_email_generation'
    | 'ai_enrichment'
    | 'video_generation'
    | 'email_sent'
    | 'api_call'
    | 'project_scraped'

// Usage tracking result
export interface UsageResult {
    success: boolean
    usageId?: string
    error?: string
}

// Feature access check result
export interface FeatureAccessResult {
    allowed: boolean
    reason: string
    currentUsage: number
    limit: number | null
}

// Cost estimates per feature (in cents)
const FEATURE_COSTS: Record<FeatureType, number> = {
    ai_email_generation: 2,    // ~$0.02 per AI email
    ai_enrichment: 5,          // ~$0.05 per enrichment
    video_generation: 100,     // ~$1.00 per video
    email_sent: 1,             // ~$0.01 per sent email
    api_call: 0,               // Free
    project_scraped: 0,        // Free
}

/**
 * Get Supabase client with service role (for server-side operations)
 */
function getServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables')
    }

    return createClient(supabaseUrl, supabaseServiceKey)
}

/**
 * Track usage of a feature
 * 
 * @param organizationId - The organization's UUID
 * @param featureType - Type of feature being used
 * @param count - Number of units used (default 1)
 * @param metadata - Optional additional data to track
 * @param userId - Optional user who triggered the usage
 */
export async function trackUsage(
    organizationId: string,
    featureType: FeatureType,
    count: number = 1,
    metadata?: Record<string, any>,
    userId?: string
): Promise<UsageResult> {
    try {
        const supabase = getServiceClient()
        const costCents = FEATURE_COSTS[featureType] * count

        const { data, error } = await supabase
            .from('usage_tracking')
            .insert({
                organization_id: organizationId,
                user_id: userId || null,
                feature_type: featureType,
                count,
                cost_cents: costCents,
                metadata: metadata || null,
            })
            .select('id')
            .single()

        if (error) {
            logger.error('Failed to track usage', { error, organizationId, featureType })
            return { success: false, error: error.message }
        }

        logger.info('Usage tracked', {
            organizationId,
            featureType,
            count,
            costCents,
            usageId: data.id
        })

        return { success: true, usageId: data.id }
    } catch (err: any) {
        logger.error('Exception tracking usage', { error: err.message })
        return { success: false, error: err.message }
    }
}

/**
 * Check if organization has access to a feature
 * Returns whether they can use it and current usage stats
 */
export async function checkFeatureAccess(
    organizationId: string,
    featureType: FeatureType,
    userId?: string | null
): Promise<FeatureAccessResult> {
    try {
        // Check if Mike should bypass all restrictions
        const bypassRestrictions = await shouldBypassAllRestrictions(userId, organizationId)
        
        if (bypassRestrictions) {
            logger.info('Mike\'s access - bypassing feature check', {
                organizationId,
                featureType,
                userId
            })
            return {
                allowed: true,
                reason: 'Mike\'s access - unlimited',
                currentUsage: 0,
                limit: null,
            }
        }

        const supabase = getServiceClient()

        // Get organization's subscription plan and limits
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select(`
        id,
        subscription_plan_id,
        subscription_plans (
          name,
          features,
          limits
        )
      `)
            .eq('id', organizationId)
            .single()

        if (orgError || !org) {
            logger.warn('Organization not found for access check', { organizationId })
            // Default to allowing access (graceful degradation)
            return { allowed: true, reason: 'Organization not found, allowing access', currentUsage: 0, limit: null }
        }

        const plan = org.subscription_plans as any
        if (!plan) {
            // No plan = free tier, use restrictive defaults
            return {
                allowed: false,
                reason: 'No subscription plan',
                currentUsage: 0,
                limit: 0
            }
        }

        // Map feature types to plan feature/limit keys
        const featureKey = mapFeatureToKey(featureType)

        // Check if feature is enabled in plan
        const features = plan.features || {}
        const featureEnabled = features[featureKey] === true

        if (!featureEnabled) {
            return {
                allowed: false,
                reason: `Feature '${featureType}' not included in ${plan.name} plan`,
                currentUsage: 0,
                limit: 0,
            }
        }

        // Get usage limit for this feature
        const limits = plan.limits || {}
        const limit = limits[featureKey]

        // null limit means unlimited
        if (limit === null || limit === undefined) {
            return {
                allowed: true,
                reason: 'Unlimited usage',
                currentUsage: 0,
                limit: null,
            }
        }

        // Get current month's usage
        const { data: usage } = await supabase
            .from('current_month_usage')
            .select('usage_count')
            .eq('organization_id', organizationId)
            .eq('feature_type', featureType)
            .single()

        const currentUsage = usage?.usage_count || 0

        if (currentUsage >= limit) {
            return {
                allowed: false,
                reason: `Monthly limit of ${limit} ${featureType} reached`,
                currentUsage,
                limit,
            }
        }

        return {
            allowed: true,
            reason: 'Within limits',
            currentUsage,
            limit,
        }
    } catch (err: any) {
        logger.error('Exception checking feature access', { error: err.message })
        // Default to allowing access (graceful degradation)
        return { allowed: true, reason: 'Error checking access, allowing', currentUsage: 0, limit: null }
    }
}

/**
 * Get usage summary for an organization
 */
export async function getUsageSummary(organizationId: string) {
    try {
        const supabase = getServiceClient()

        const { data, error } = await supabase
            .from('current_month_usage')
            .select('*')
            .eq('organization_id', organizationId)

        if (error) {
            logger.error('Failed to get usage summary', { error, organizationId })
            return null
        }

        // Convert to a more usable format
        const summary: Record<string, { count: number; cost: number }> = {}
        for (const row of data || []) {
            summary[row.feature_type] = {
                count: row.usage_count || 0,
                cost: row.total_cost || 0,
            }
        }

        return summary
    } catch (err: any) {
        logger.error('Exception getting usage summary', { error: err.message })
        return null
    }
}

/**
 * Map feature types to subscription plan keys
 */
function mapFeatureToKey(featureType: FeatureType): string {
    const mapping: Record<FeatureType, string> = {
        ai_email_generation: 'ai_email_generation',
        ai_enrichment: 'ai_enrichment',
        video_generation: 'video_generation',
        email_sent: 'emails',
        api_call: 'api_calls',
        project_scraped: 'projects',
    }
    return mapping[featureType] || featureType
}

/**
 * Wrapper to track and check access in one call
 * Use this before performing a billable action
 */
export async function canUseFeature(
    organizationId: string,
    featureType: FeatureType
): Promise<{ allowed: boolean; reason: string }> {
    const access = await checkFeatureAccess(organizationId, featureType)
    return { allowed: access.allowed, reason: access.reason }
}
