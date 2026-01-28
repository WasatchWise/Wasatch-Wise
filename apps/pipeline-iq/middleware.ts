import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================
// Subdomain-based Multi-tenant Routing
// ============================================

// Known subdomains mapped to organization IDs
// In production, this could be fetched from a database/cache
const SUBDOMAIN_TO_ORG: Record<string, string> = {
  groovetech: 'groove',
  groove: 'groove',
  // Add more clients as they onboard:
  // 'acme': 'acme-corp-id',
  // 'demo': 'demo-org-id',
}

// Subdomains that should NOT be treated as tenant subdomains
const RESERVED_SUBDOMAINS = ['www', 'api', 'app', 'admin', 'dashboard', 'staging', 'dev']

// Main domain (without subdomain)
const MAIN_DOMAIN = process.env.MAIN_DOMAIN || 'pipelineiq.net'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  const dashboardPaths = [
    '/dashboard',
    '/projects',
    '/contacts',
    '/campaigns',
    '/settings',
    '/hci-tests',
  ]

  if (dashboardPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    url.pathname = '/groove-in-45-seconds'
    return NextResponse.redirect(url)
  }

  // Extract subdomain (pass URL for local dev ?org= param)
  const subdomain = getSubdomain(hostname, request.nextUrl)

  // Get organization ID from subdomain
  const orgId = subdomain ? SUBDOMAIN_TO_ORG[subdomain.toLowerCase()] : null

  // Create response with org context
  const response = NextResponse.next()

  if (orgId) {
    // Set organization context in headers for server components
    response.headers.set('x-organization-id', orgId)
    response.headers.set('x-organization-subdomain', subdomain || '')

    // Set cookie for client components (httpOnly for security)
    response.cookies.set('org-id', orgId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    response.cookies.set('org-subdomain', subdomain || '', {
      httpOnly: false, // Allow client access for branding
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
  } else if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
    // Unknown subdomain - redirect to main site or show 404
    // For now, redirect to main domain
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(`https://${MAIN_DOMAIN}${url.pathname}`)
    }
  }

  return response
}

/**
 * Extract subdomain from hostname or query param (for local dev)
 * Examples:
 *   groovetech.pipelineiq.com -> groovetech
 *   www.pipelineiq.com -> www (reserved)
 *   pipelineiq.com -> null
 *   localhost:3000?org=groovetech -> groovetech (dev mode)
 */
function getSubdomain(hostname: string, url?: URL): string | null {
  // Remove port if present
  const host = hostname.split(':')[0]

  // Handle localhost - check for ?org= query param for dev testing
  if (host === 'localhost' || host === '127.0.0.1') {
    // Allow ?org=groovetech for local testing
    return url?.searchParams.get('org') || null
  }

  // Split by dots
  const parts = host.split('.')

  // Need at least 3 parts for a subdomain (sub.domain.tld)
  // Or 4 parts for (sub.domain.co.uk) style domains
  if (parts.length >= 3) {
    // Check if it's a known multi-part TLD
    const lastTwo = parts.slice(-2).join('.')
    const isMultiPartTld = ['co.uk', 'com.au', 'co.nz'].includes(lastTwo)

    if (isMultiPartTld && parts.length >= 4) {
      return parts[0]
    } else if (!isMultiPartTld) {
      return parts[0]
    }
  }

  return null
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
