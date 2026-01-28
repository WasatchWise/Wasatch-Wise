import { NextResponse } from 'next/server';
import { runUnifiedProduction } from '@/lib/production/orchestrator';
import { productionRequestSchema } from '@/lib/validation/api-schemas';
import { ZodError } from 'zod';
import { rateLimitMiddleware, RATE_LIMITS, getClientIP, checkRateLimit } from '@/lib/middleware/rate-limit';

export async function POST(request: Request) {
    // Apply rate limiting (stricter for production endpoints)
    const rateLimitResponse = rateLimitMiddleware(request, RATE_LIMITS.production);
    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    try {
        const body = await request.json();
        
        // Validate input with Zod schema
        const validationResult = productionRequestSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
            }));
            return NextResponse.json(
                { error: 'Validation failed', details: errors },
                { status: 400 }
            );
        }

        const { rawText, duration } = validationResult.data;

        console.log(`Production API received request for duration ${duration}, triggering orchestrator...`);
        const result = await runUnifiedProduction(rawText, duration || '30s');

        if (result.status === 'failed') {
            return NextResponse.json({ error: 'Production batch failed.' }, { status: 500 });
        }

        // Add rate limit headers to response
        const ip = getClientIP(request);
        const rateLimit = checkRateLimit(ip, RATE_LIMITS.production);
        return NextResponse.json(result, {
            headers: {
                'X-RateLimit-Limit': rateLimit.limit.toString(),
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            },
        });
    } catch (error) {
        console.error('Production API Error:', error);
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Invalid request format', details: error.errors },
                { status: 400 }
            );
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
