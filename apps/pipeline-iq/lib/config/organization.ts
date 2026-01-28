/**
 * Organization Configuration
 * Centralized configuration for organization-specific settings
 * Supports multi-tenant white-label deployments via subdomains
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { headers, cookies } from 'next/headers'

// ============================================
// Types
// ============================================

export interface OrganizationConfig {
  id: string
  name: string
  subdomain?: string  // e.g., 'groovetech' for groovetech.pipelineiq.com
  domain?: string     // Custom domain if any

  // Branding
  branding: {
    companyName: string
    tagline?: string
    primaryColor?: string
    logoUrl?: string
    googleReviewsRating?: string
    googleReviewsCount?: string
  }

  // Email Configuration
  email: {
    senderName: string
    senderEmail: string
    replyToEmail?: string
    signature: {
      name: string
      title?: string
      company: string
      email: string
      website?: string
      phone?: string
    }
  }

  // Sales Configuration
  sales: {
    primaryContact: string
    services: string[]
    valueProps: string[]
    targetTypes: string[]
  }

  // AI Configuration
  ai: {
    persona: string
    systemPrompt: string
  }

  // Global Assets (Smart Links)
  assets: {
    id: string
    name: string
    url: string
    type: 'pdf' | 'video' | 'link'
    verticals?: string[] // Optional: restrict to specific verticals (e.g., ['hotel'])
  }[]
}

// ============================================
// Organization Registry
// Maps org IDs to their configurations
// In production, this could be loaded from database on startup
// ============================================

export const ORGANIZATION_REGISTRY: Record<string, OrganizationConfig> = {}

// ============================================
// Default Groove Configuration
// ============================================

export const GROOVE_CONFIG: OrganizationConfig = {
  id: 'groove',
  name: 'Groove Technology Solutions',
  subdomain: 'groovetech',
  domain: 'getgrooven.com',

  branding: {
    companyName: 'Groove Technology Solutions',
    tagline: 'Property Technology Solutions - In-house from Beginning to End',
    primaryColor: '#0082CA', // Groove brand blue
    logoUrl: process.env.GROOVE_LOGO_URL || 'https://getgrooven.com/wp-content/uploads/2023/01/groove-logo.png',
    googleReviewsRating: '4.9',
    googleReviewsCount: '920+',
  },

  email: {
    senderName: 'Mike Sartain',
    senderEmail: 'msartain@getgrooven.com',
    replyToEmail: 'msartain@getgrooven.com',
    signature: {
      name: 'Mike Sartain',
      title: 'National Sales Executive',
      company: 'Groove Technology Solutions',
      email: 'msartain@getgrooven.com',
      website: 'https://getgrooven.com',
      phone: '801-396-6534',
    },
  },

  sales: {
    primaryContact: 'Mike Sartain',
    services: [
      'WiFi',
      'DirecTV',
      'Phone Systems',
      'Structured Cabling',
      'Access Control',
      'Smart Building Technology',
    ],
    valueProps: [
      'Save 20-30% on technology costs',
      'Improve reliability and guest satisfaction',
      'Simplify vendor management (one point of contact)',
      'Future-proof infrastructure',
    ],
    targetTypes: ['hotel', 'multifamily', 'senior_living', 'student_housing'],
  },

  ai: {
    persona: 'Mike Sartain',
    systemPrompt: `You are Mike Sartain, a charismatic sales expert at Wasatch Wise LLC. Your emails are known for being:
- Authentic and conversational (never robotic)
- Value-focused (what's in it for them)
- Brief but impactful
- Pattern-interrupting (stand out from boring vendor emails)
- Action-oriented with clear next steps

Groove provides: WiFi, DirecTV, Phone Systems, Structured Cabling, Access Control, and Smart Building Tech for hospitality, multifamily, senior living, and commercial properties.`,
  },

  assets: [
    {
      id: 'proposal-page',
      name: 'Smart Proposal',
      url: 'https://getgrooven.com/proposal', // In prod this should be full URL
      type: 'link',
    }
  ]
}

// ============================================
// Register Organizations
// ============================================

// Register Groove as the default/first organization
ORGANIZATION_REGISTRY['groove'] = GROOVE_CONFIG
ORGANIZATION_REGISTRY['groovetech'] = GROOVE_CONFIG // Also map by subdomain

// ============================================
// Configuration Cache
// ============================================

const configCache = new Map<string, { config: OrganizationConfig; expiry: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get organization ID from the current request context
 * Uses headers/cookies set by middleware
 */
export async function getOrganizationFromRequest(): Promise<string | null> {
  try {
    // Try headers first (set by middleware)
    const headersList = await headers()
    const orgFromHeader = headersList.get('x-organization-id')
    if (orgFromHeader) return orgFromHeader

    // Fall back to cookie
    const cookieStore = await cookies()
    const orgCookie = cookieStore.get('org-id')
    if (orgCookie?.value) return orgCookie.value

    // Fall back to env var (for backward compatibility)
    return process.env.ORGANIZATION_ID || null
  } catch {
    // headers() can throw outside of request context
    return process.env.ORGANIZATION_ID || null
  }
}

/**
 * Get organization configuration
 * Auto-detects org from request context if not specified
 */
export async function getOrganizationConfig(
  organizationId?: string
): Promise<OrganizationConfig> {
  // Auto-detect org from request if not specified
  const orgId = organizationId || await getOrganizationFromRequest() || 'groove'

  // Check cache first
  const cached = configCache.get(orgId)
  if (cached && Date.now() < cached.expiry) {
    return cached.config
  }

  // Check registry for static configs
  if (ORGANIZATION_REGISTRY[orgId]) {
    const config = ORGANIZATION_REGISTRY[orgId]
    configCache.set(orgId, { config, expiry: Date.now() + CACHE_TTL })
    return config
  }

  // Try to fetch from database for dynamic orgs
  try {
    const supabase = await createServerSupabaseClient()
    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()

    if (error || !org) {
      logger.warn('Organization not found, using default config', { orgId })
      return GROOVE_CONFIG
    }

    // Build config from database
    // Future: add full org config to database schema
    const config: OrganizationConfig = {
      ...GROOVE_CONFIG,
      id: org.id,
      name: org.name || GROOVE_CONFIG.name,
      subdomain: org.subdomain || undefined,
      assets: GROOVE_CONFIG.assets, // Default assets for now
      // domain field not in DB schema yet, use default
    }

    configCache.set(orgId, { config, expiry: Date.now() + CACHE_TTL })
    return config
  } catch (error) {
    logger.error('Failed to fetch organization config', { error, orgId })
    return GROOVE_CONFIG
  }
}

/**
 * Clear config cache (call when org settings are updated)
 */
export function clearConfigCache(orgId?: string): void {
  if (orgId) {
    configCache.delete(orgId)
  } else {
    configCache.clear()
  }
}

// ============================================
// Template Helpers
// ============================================

/**
 * Get email signature HTML
 */
export function getEmailSignature(config: OrganizationConfig): string {
  const { signature } = config.email
  const socialLinks = [
    { label: 'Facebook', url: 'https://www.facebook.com/getgrooven' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/company/groove-tech-solutions/' },
    { label: 'X', url: 'https://x.com/getgrooven' },
    { label: 'YouTube', url: 'https://www.youtube.com/@groovetechnologysolutions6488' },
  ]

  const signatureHtml = `
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <div style="color: #333333; font-size: 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="vertical-align: top; padding-right: 16px;">
            <p style="margin: 0 0 6px 0;"><strong>${signature.name}</strong>${signature.title ? `<br>${signature.title}` : ''}</p>
            <p style="margin: 0 0 6px 0;">${signature.company}</p>
            <p style="margin: 0;">
              <a href="mailto:${signature.email}" style="color: #0D5B8F; text-decoration: none;">${signature.email}</a>
              ${signature.phone ? `<br>${signature.phone}` : ''}
              ${signature.website ? `<br><a href="${signature.website}" style="color: #0D5B8F; text-decoration: none;">${signature.website.replace('https://', '')}</a>` : ''}
            </p>
          </td>
          <td style="vertical-align: top; text-align: right;"></td>
        </tr>
      </table>
      <p style="margin: 12px 0 0 0; font-size: 11px; color: #666666;">
        ${socialLinks.map(link => `<a href="${link.url}" style="color: #0D5B8F; text-decoration: none; margin-right: 10px;">${link.label}</a>`).join('')}
      </p>
    </div>
  `.trim()

  // Safety: never allow images in the signature block
  return signatureHtml.replace(/<img[^>]*>/gi, '')
}

/**
 * Get services list for templates
 */
export function getServicesText(config: OrganizationConfig): string {
  return config.sales.services.join(', ')
}

/**
 * Get value propositions as bullet points
 */
export function getValuePropsHtml(config: OrganizationConfig): string {
  return config.sales.valueProps.map(vp => `<li>${vp}</li>`).join('\n')
}

// ============================================
// Scoring Configuration
// ============================================

export interface ScoringConfig {
  // Project type weights (which types are most valuable)
  typeWeights: Record<string, number>

  // Priority states (where the company operates)
  priorityStates: string[]

  // Priority cities
  priorityCities: string[]

  // Minimum project value to consider
  minProjectValue: number

  // Services to check for fit
  services: string[]
}

export const GROOVE_SCORING_CONFIG: ScoringConfig = {
  typeWeights: {
    hotel: 30,
    senior_living: 30,
    multifamily: 30,
    student_housing: 25,
    mixed_use: 20,
    office: 15,
    retail: 10,
    industrial: 5,
  },
  priorityStates: ['UT', 'CA', 'TX', 'FL', 'NY', 'IL', 'AZ', 'NV', 'CO', 'WA'],
  priorityCities: [
    'Salt Lake City',
    'Las Vegas',
    'Phoenix',
    'Austin',
    'Dallas',
    'Denver',
    'Los Angeles',
    'San Francisco',
  ],
  minProjectValue: 500000,
  services: ['WiFi', 'DirecTV', 'Phone', 'Cabling', 'Access Control', 'Smart Building'],
}

/**
 * Get scoring configuration for an organization
 */
export function getScoringConfig(organizationId?: string): ScoringConfig {
  // For now, always return Groove config
  // Future: fetch org-specific scoring config
  return GROOVE_SCORING_CONFIG
}
