/**
 * Rate limiting utilities
 *
 * NOTE: This implementation uses in-memory storage which works for single-instance
 * deployments. For serverless/edge environments (Vercel, Cloudflare Workers),
 * consider using Redis, Upstash, or a similar distributed store for production.
 *
 * For Vercel deployment, recommended alternatives:
 * - @upstash/ratelimit (Redis-based, serverless-friendly)
 * - Vercel KV with custom rate limiting logic
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  [key: string]: RateLimitRecord;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Start cleanup interval in non-edge environments
    if (typeof setInterval !== 'undefined' && typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier (IP, user ID, etc.)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status, remaining requests, and reset time
   */
  check(
    key: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
  ): RateLimitResult {
    const now = Date.now();
    const record = this.store[key];

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs,
      };
    }

    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: limit - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    for (const key in this.store) {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    }
  }

  /**
   * Stop the cleanup interval (useful for testing)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Get rate limit key from request
 */
export function getRateLimitKey(req: {
  headers: Headers | Record<string, string | string[] | undefined>;
  ip?: string;
}): string {
  // Try to get IP from various headers
  let forwarded: string | string[] | undefined;
  let realIp: string | string[] | undefined;
  
  if (req.headers instanceof Headers) {
    forwarded = req.headers.get('x-forwarded-for') || undefined;
    realIp = req.headers.get('x-real-ip') || undefined;
  } else {
    forwarded = req.headers['x-forwarded-for'];
    realIp = req.headers['x-real-ip'];
  }
  
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === 'string'
    ? forwarded.split(',')[0]
    : typeof realIp === 'string'
    ? realIp
    : req.ip || 'unknown';

  return ip;
}
