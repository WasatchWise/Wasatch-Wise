/**
 * Rate limiting middleware for API routes
 * Prevents DoS attacks and quota exhaustion
 * 
 * Uses in-memory storage (can be upgraded to Redis/Upstash for distributed systems)
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetAt: number;
    };
}

// In-memory store (clears on server restart)
// For production with multiple instances, use Redis/Upstash
const store: RateLimitStore = {};

// Cleanup old entries periodically (only in Node.js environment, not serverless)
// In serverless, entries will naturally expire as they're checked
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // Only run cleanup in development (serverless functions don't need this)
    if (typeof setInterval !== 'undefined') {
        setInterval(() => {
            const now = Date.now();
            for (const key in store) {
                if (store[key].resetAt < now) {
                    delete store[key];
                }
            }
        }, 5 * 60 * 1000);
    }
}

export interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Max requests per window
    identifier?: string;   // Custom identifier (defaults to IP)
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
    limit: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, API key, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const { windowMs, maxRequests } = config;
    const now = Date.now();
    const key = `${identifier}:${config.identifier || 'default'}`;

    // Get or create entry
    let entry = store[key];

    // Reset if window expired
    if (!entry || entry.resetAt < now) {
        entry = {
            count: 0,
            resetAt: now + windowMs,
        };
        store[key] = entry;
    }

    // Increment count
    entry.count += 1;

    const remaining = Math.max(0, maxRequests - entry.count);
    const success = entry.count <= maxRequests;

    return {
        success,
        remaining,
        resetAt: entry.resetAt,
        limit: maxRequests,
    };
}

/**
 * Get client IP address from request
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
    // Check various headers for IP (in order of preference)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    const cfIP = request.headers.get('cf-connecting-ip'); // Cloudflare
    if (cfIP) {
        return cfIP;
    }

    // Fallback (won't work in serverless, but good for local dev)
    return 'unknown';
}

/**
 * Default rate limit configurations per endpoint type
 */
export const RATE_LIMITS = {
    // Research endpoints (AI-heavy, more restrictive)
    research: {
        windowMs: 60 * 1000,      // 1 minute
        maxRequests: 10,          // 10 requests per minute
    },
    // Production endpoints (most expensive)
    production: {
        windowMs: 60 * 1000,      // 1 minute
        maxRequests: 5,            // 5 requests per minute
    },
    // Asset generation (moderate cost)
    assets: {
        windowMs: 60 * 1000,      // 1 minute
        maxRequests: 20,           // 20 requests per minute
    },
    // Health check (no cost, very permissive)
    health: {
        windowMs: 60 * 1000,       // 1 minute
        maxRequests: 100,           // 100 requests per minute
    },
    // Default (conservative)
    default: {
        windowMs: 60 * 1000,       // 1 minute
        maxRequests: 30,            // 30 requests per minute
    },
} as const;

/**
 * Rate limit middleware for Next.js API routes
 * Returns a Response with 429 status if rate limited, null if allowed
 */
export function rateLimitMiddleware(
    request: Request,
    config: RateLimitConfig
): Response | null {
    const ip = getClientIP(request);
    const result = checkRateLimit(ip, config);

    if (!result.success) {
        return new Response(
            JSON.stringify({
                error: 'Rate limit exceeded',
                message: `Too many requests. Limit: ${result.limit} per ${config.windowMs / 1000}s`,
                retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'X-RateLimit-Limit': result.limit.toString(),
                    'X-RateLimit-Remaining': result.remaining.toString(),
                    'X-RateLimit-Reset': result.resetAt.toString(),
                    'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
                },
            }
        );
    }

    // Add rate limit headers to successful responses
    return null; // null means proceed
}

