import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiter, getRateLimitKey } from '@/lib/utils/rate-limit';

/**
 * Robust middleware for security, rate limiting, and request validation
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';

  // Adult AI Academy domain: serve AAA marketing page at root (strip port if present)
  // Use host or x-forwarded-host (Vercel/proxies) for correct host-based rewrite
  const forwardedHost = request.headers.get('x-forwarded-host') ?? '';
  const effectiveHost = (host || forwardedHost).split(':')[0].toLowerCase();
  const isAdultAIAcademy =
    effectiveHost === 'www.adultaiacademy.com' || effectiveHost === 'adultaiacademy.com';
  if (isAdultAIAcademy && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/adult-ai-academy';
    return NextResponse.rewrite(url);
  }

  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // Set CORS headers
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      'http://localhost:3000',
      'https://wasatchwise.com',
      'https://www.wasatchwise.com',
    ].filter((url): url is string => typeof url === 'string' && url.length > 0);

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    // Rate limiting for API routes
    // Note: NextRequest doesn't expose IP directly, we'll extract from headers
    const rateLimitKey = getRateLimitKey({
      headers: request.headers,
      ip: undefined, // IP will be extracted from headers in getRateLimitKey
    });

    // Stricter limits for API routes
    const limit = pathname.includes('/api/ai/') ? 5 : 20; // Lower limit for AI endpoints
    const check = rateLimiter.check(rateLimitKey, limit, 60000);

    if (!check.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetTime: check.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': check.remaining.toString(),
            'X-RateLimit-Reset': check.resetTime.toString(),
            ...response.headers,
          },
        }
      );
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', check.remaining.toString());
    response.headers.set('X-RateLimit-Reset', check.resetTime.toString());

    return response;
  }

  // Security headers for all routes
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs unsafe-eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.heygen.com https://api.elevenlabs.io https://api.openai.com",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
