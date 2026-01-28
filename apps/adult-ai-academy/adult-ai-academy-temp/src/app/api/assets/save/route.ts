import { NextResponse } from 'next/server';
import { saveAssetToLibrary } from '@/lib/supabase/client';
import { assetSaveRequestSchema } from '@/lib/validation/api-schemas';
import { ZodError } from 'zod';
import { rateLimitMiddleware, RATE_LIMITS, getClientIP, checkRateLimit } from '@/lib/middleware/rate-limit';

export async function POST(request: Request) {
    // Apply rate limiting
    const rateLimitResponse = rateLimitMiddleware(request, RATE_LIMITS.assets);
    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    try {
        const body = await request.json();
        
        // Validate input with Zod schema
        const validationResult = assetSaveRequestSchema.safeParse(body);
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

        const assetData = validationResult.data;
        const result = await saveAssetToLibrary(assetData);
        
        // Add rate limit headers to response
        const ip = getClientIP(request);
        const rateLimit = checkRateLimit(ip, RATE_LIMITS.assets);
        return NextResponse.json(result, {
            headers: {
                'X-RateLimit-Limit': rateLimit.limit.toString(),
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            },
        });
    } catch (error) {
        console.error('Save API Error:', error);
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
