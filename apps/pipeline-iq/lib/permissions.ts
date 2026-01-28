/**
 * Feature Gating & Permissions System
 * Controls access to premium features based on subscription plan
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'

export type FeatureType =
  | 'ai_enrichment'
  | 'ai_email_generation'
  | 'video_generation'
  | 'api_access'
  | 'custom_branding'
  | 'priority_support'
  | 'admin_panel'
  | 'view_all_orgs'

export interface FeatureAccessResult {
  allowed: boolean
  reason?: string
  currentUsage?: number
  limit?: number
  upgradeUrl?: string
  upgradePlan?: string
}

export interface PlanFeatures {
  ai_enrichment: boolean
  ai_email_generation: boolean
  video_generation: boolean
  api_access: boolean
  custom_branding: boolean
  priority_support: boolean
  admin_panel?: boolean
  view_all_orgs?: boolean
  override_limits?: boolean
}

export interface PlanLimits {
  projects: number | null
  users: number | null
  ai_enrichments: number | null
  videos: number | null
  emails: number | null
  api_calls: number | null
}

/**
 * Check if an organization has access to a feature
 */
export async function checkFeatureAccess(
  organizationId: string,
  feature: FeatureType,
  userId?: string | null
): Promise<FeatureAccessResult> {
  // Check if Mike should bypass all restrictions FIRST
  const bypassRestrictions = await shouldBypassAllRestrictions(userId, organizationId)
  
  if (bypassRestrictions) {
    return {
      allowed: true,
      reason: 'Mike\'s access - unlimited',
      currentUsage: 0,
      limit: undefined,
    }
  }

  const supabase = await createServerSupabaseClient()

  // Get organization with subscription plan
  const { data: org, error } = await supabase
    .from('organizations')
    .select(`
      id,
      subscription_plan:subscription_plans (
        name,
        display_name,
        features,
        limits
      )
    `)
    .eq('id', organizationId)
    .single()

  if (error || !org || !org.subscription_plan) {
    return {
      allowed: false,
      reason: 'No active subscription found',
      upgradeUrl: '/settings/billing'
    }
  }

  const plan = org.subscription_plan as any
  const features = plan.features as PlanFeatures
  const limits = plan.limits as PlanLimits

  // Check if feature is included in plan
  if (!features[feature]) {
    // Determine which plan includes this feature
    const upgradePlan = getUpgradePlanForFeature(feature)

    return {
      allowed: false,
      reason: `${feature.replace(/_/g, ' ')} is not available in your ${plan.display_name} plan`,
      upgradeUrl: '/settings/billing',
      upgradePlan
    }
  }

  // If feature is enabled, check usage limits
  const limitKey = mapFeatureToLimitKey(feature)
  if (limitKey) {
    const limit = limits[limitKey]

    // null = unlimited
    if (limit === null) {
      return { allowed: true }
    }

    // Check current month's usage
    const { data: usage } = await supabase
      .from('current_month_usage')
      .select('usage_count')
      .eq('organization_id', organizationId)
      .eq('feature_type', feature)
      .single()

    const currentUsage = usage?.usage_count || 0

    if (currentUsage >= limit) {
      return {
        allowed: false,
        reason: `Monthly limit reached (${currentUsage}/${limit})`,
        currentUsage,
        limit,
        upgradeUrl: '/settings/billing',
        upgradePlan: plan.name === 'pro' ? 'premium' : 'enterprise'
      }
    }

    return {
      allowed: true,
      currentUsage,
      limit
    }
  }

  return { allowed: true }
}

/**
 * Track usage of a feature
 */
export async function trackFeatureUsage(
  organizationId: string,
  userId: string | null,
  feature: FeatureType,
  count: number = 1,
  costCents: number = 0,
  metadata?: any
) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('usage_tracking').insert({
    organization_id: organizationId,
    user_id: userId,
    feature_type: feature,
    count,
    cost_cents: costCents,
    metadata: metadata || {}
  })

  if (error) {
    console.error('Failed to track usage:', error)
  }
}

/**
 * Check if user is Mike (has full access, no restrictions)
 */
export async function isGodMode(userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()

  const { data: user } = await supabase
    .from('users')
    .select('is_god_mode, email')
    .eq('id', userId)
    .single()

  // Mike's email or god_mode flag
  return user?.is_god_mode === true || user?.email === 'msartain@getgrooven.com'
}

/**
 * Check if organization is Mike's organization (Groove Technologies)
 * This bypasses ALL access controls
 */
export async function isMikesOrganization(organizationId: string): Promise<boolean> {
  // Groove Technologies organization ID
  const GROOVE_ORG_ID = '34249404-774f-4b80-b346-a2d9e6322584'
  return organizationId === GROOVE_ORG_ID
}

/**
 * Check if current user/org should bypass all restrictions (Mike's access)
 * This is the main function to use - it checks everything
 */
export async function shouldBypassAllRestrictions(
  userId?: string | null,
  organizationId?: string | null
): Promise<boolean> {
  // Check if organization is Mike's
  if (organizationId && await isMikesOrganization(organizationId)) {
    return true
  }

  // Check if user is Mike
  if (userId && await isGodMode(userId)) {
    return true
  }

  // Check if organization has god mode plan
  if (organizationId && await isOrganizationGodMode(organizationId)) {
    return true
  }

  return false
}

/**
 * Check if organization is on god mode plan
 */
export async function isOrganizationGodMode(organizationId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()

  const { data: org } = await supabase
    .from('organizations')
    .select(`subscription_plan:subscription_plans(name)`)
    .eq('id', organizationId)
    .single()

  return (org?.subscription_plan as any)?.name === 'god_mode'
}

/**
 * Get current usage for an organization
 */
export async function getCurrentUsage(
  organizationId: string
): Promise<Record<string, { usage: number; limit: number | null }>> {
  const supabase = await createServerSupabaseClient()

  // Get plan limits
  const { data: org } = await supabase
    .from('organizations')
    .select(`subscription_plan:subscription_plans(limits)`)
    .eq('id', organizationId)
    .single()

  if (!org) return {}

  const limits = (org.subscription_plan as any)?.limits as PlanLimits

  // Get current usage
  const { data: usageData } = await supabase
    .from('current_month_usage')
    .select('feature_type, usage_count')
    .eq('organization_id', organizationId)

  const usage: Record<string, { usage: number; limit: number | null }> = {}

  // Map usage data
  usageData?.forEach(item => {
    if (!item.feature_type) return
    const limitKey = mapFeatureToLimitKey(item.feature_type as FeatureType)
    if (limitKey) {
      usage[item.feature_type] = {
        usage: item.usage_count ?? 0,
        limit: limits[limitKey]
      }
    }
  })

  // Add features with no usage yet
  Object.keys(limits).forEach(key => {
    const featureType = mapLimitKeyToFeature(key)
    if (featureType && !usage[featureType]) {
      usage[featureType] = {
        usage: 0,
        limit: limits[key as keyof PlanLimits]
      }
    }
  })

  return usage
}

/**
 * Get subscription plan details
 */
export async function getSubscriptionPlan(organizationId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: org } = await supabase
    .from('organizations')
    .select(`
      subscription_plan:subscription_plans(
        name,
        display_name,
        description,
        price_monthly,
        price_yearly,
        features,
        limits
      ),
      subscription_status,
      billing_cycle,
      trial_ends_at
    `)
    .eq('id', organizationId)
    .single()

  return org
}

/**
 * Helper: Map feature type to limit key
 */
function mapFeatureToLimitKey(feature: FeatureType): keyof PlanLimits | null {
  const mapping: Record<string, keyof PlanLimits> = {
    'ai_enrichment': 'ai_enrichments',
    'video_generation': 'videos',
    'ai_email_generation': 'emails',
    'api_access': 'api_calls'
  }

  return mapping[feature] || null
}

/**
 * Helper: Map limit key to feature type
 */
function mapLimitKeyToFeature(limitKey: string): FeatureType | null {
  const mapping: Record<string, FeatureType> = {
    'ai_enrichments': 'ai_enrichment',
    'videos': 'video_generation',
    'emails': 'ai_email_generation',
    'api_calls': 'api_access'
  }

  return mapping[limitKey] || null
}

/**
 * Helper: Determine which plan includes a feature
 */
function getUpgradePlanForFeature(feature: FeatureType): string {
  const featurePlanMap: Record<FeatureType, string> = {
    'ai_enrichment': 'pro',
    'ai_email_generation': 'pro',
    'video_generation': 'premium',
    'api_access': 'pro',
    'custom_branding': 'enterprise',
    'priority_support': 'premium',
    'admin_panel': 'god_mode',
    'view_all_orgs': 'god_mode'
  }

  return featurePlanMap[feature] || 'pro'
}

/**
 * Middleware wrapper for API routes
 */
export function withFeatureGate(feature: FeatureType) {
  return async (
    organizationId: string,
    userId?: string
  ): Promise<{ allowed: boolean; response?: Response }> => {
    // Check if user is god mode - bypass all checks
    if (userId) {
      const godMode = await isGodMode(userId)
      if (godMode) {
        return { allowed: true }
      }
    }

    // Check if organization is god mode
    const orgGodMode = await isOrganizationGodMode(organizationId)
    if (orgGodMode) {
      return { allowed: true }
    }

    // Check feature access
    const access = await checkFeatureAccess(organizationId, feature)

    if (!access.allowed) {
      return {
        allowed: false,
        response: Response.json(
          {
            error: 'Feature not available',
            reason: access.reason,
            currentUsage: access.currentUsage,
            limit: access.limit,
            upgradeUrl: access.upgradeUrl,
            upgradePlan: access.upgradePlan
          },
          { status: 403 }
        )
      }
    }

    return { allowed: true }
  }
}

/**
 * Calculate cost of a video (for usage tracking)
 */
export function calculateVideoCost(durationSeconds: number): number {
  // HeyGen pricing: ~$0.12 per minute
  // Round up to nearest minute
  const minutes = Math.ceil(durationSeconds / 60)
  return minutes * 12 // 12 cents per minute
}

/**
 * Calculate cost of AI enrichment
 */
export function calculateEnrichmentCost(): number {
  // Average cost based on API usage:
  // - OpenAI GPT-4: ~$0.03
  // - Google Places: ~$0.01
  // - YouTube API: ~$0.005
  // Total: ~$0.045 per enrichment
  return 5 // 5 cents per enrichment
}
