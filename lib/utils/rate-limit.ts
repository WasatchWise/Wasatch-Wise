/**
 * Rate limiting utilities
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier (IP, user ID, etc.)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limited, false otherwise
   */
  check(
    key: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
  ): { allowed: boolean; remaining: number; resetTime: number } {
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
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const key in this.store) {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

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
