import { NextResponse } from 'next/server';
import { generateImage, generateVideoSimulated } from '@/lib/assets/generation';
import { assetGenerationRequestSchema } from '@/lib/validation/api-schemas';
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
        const validationResult = assetGenerationRequestSchema.safeParse(body);
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

        const { prompt, type } = validationResult.data;

        let url = '';
        if (type === 'image') {
            url = await generateImage(prompt);
        } else if (type === 'video') {
            url = await generateVideoSimulated(prompt);
        } else {
            return NextResponse.json({ error: 'Invalid asset type' }, { status: 400 });
        }

        // Add rate limit headers to response
        const ip = getClientIP(request);
        const rateLimit = checkRateLimit(ip, RATE_LIMITS.assets);
        return NextResponse.json({ url }, {
            headers: {
                'X-RateLimit-Limit': rateLimit.limit.toString(),
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            },
        });
    } catch (error) {
        console.error('Asset Generation API Error:', error);
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
