/**
 * Rate Limiting Infrastructure
 * In-memory rate limiting with configurable windows
 *
 * Note: For production at scale, consider using Redis-based rate limiting
 * (e.g., @upstash/ratelimit) for distributed deployments
 */

import { RateLimitError } from './errors'
import { logger } from '@/lib/logger'

// ============================================
// Types
// ============================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
  keyPrefix?: string    // Prefix for rate limit keys
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

// ============================================
// In-Memory Store
// ============================================

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 60000)
}

// ============================================
// Rate Limiter Implementation
// ============================================

/**
 * Check and update rate limit for a key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const { windowMs, maxRequests, keyPrefix = '' } = config
  const fullKey = `${keyPrefix}:${key}`
  const now = Date.now()

  // Get or create entry
  let entry = rateLimitStore.get(fullKey)

  // If entry doesn't exist or has expired, create new one
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(fullKey, entry)

  // Check if over limit
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)

    logger.warn('Rate limit exceeded', {
      key: fullKey,
      count: entry.count,
      limit: maxRequests,
      retryAfter,
    })

    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

// ============================================
// Pre-configured Rate Limiters
// ============================================

/**
 * Standard API rate limiter (100 requests per minute)
 */
export function apiRateLimit(key: string): RateLimitResult {
  return checkRateLimit(key, {
    windowMs: 60000,
    maxRequests: 100,
    keyPrefix: 'api',
  })
}

/**
 * Enrichment rate limiter (10 requests per minute - expensive)
 */
export function enrichmentRateLimit(key: string): RateLimitResult {
  return checkRateLimit(key, {
    windowMs: 60000,
    maxRequests: 10,
    keyPrefix: 'enrich',
  })
}

/**
 * Email sending rate limiter (50 emails per minute)
 */
export function emailRateLimit(key: string): RateLimitResult {
  return checkRateLimit(key, {
    windowMs: 60000,
    maxRequests: 50,
    keyPrefix: 'email',
  })
}

/**
 * Scraper rate limiter (5 scrapes per hour)
 */
export function scraperRateLimit(key: string): RateLimitResult {
  return checkRateLimit(key, {
    windowMs: 3600000,
    maxRequests: 5,
    keyPrefix: 'scrape',
  })
}

/**
 * Video generation rate limiter (3 videos per minute)
 */
export function videoRateLimit(key: string): RateLimitResult {
  return checkRateLimit(key, {
    windowMs: 60000,
    maxRequests: 3,
    keyPrefix: 'video',
  })
}

// ============================================
// Rate Limit Middleware Helper
// ============================================

/**
 * Apply rate limiting and throw if exceeded
 */
export function enforceRateLimit(
  key: string,
  config: RateLimitConfig
): void {
  const result = checkRateLimit(key, config)

  if (!result.allowed) {
    throw new RateLimitError(result.retryAfter)
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {}),
  }
}

// ============================================
// IP-based Rate Limiting Helper
// ============================================

/**
 * Extract IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a generic key
  return 'unknown'
}

/**
 * Rate limit by IP address
 */
export function ipRateLimit(request: Request, config: RateLimitConfig): RateLimitResult {
  const ip = getClientIp(request)
  return checkRateLimit(ip, config)
}
