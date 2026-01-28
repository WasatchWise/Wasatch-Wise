import { NextResponse } from 'next/server';
import { tailorContentLive } from '@/lib/research/synthesis';
import { researchRequestSchema } from '@/lib/validation/api-schemas';
import { ZodError } from 'zod';
import { rateLimitMiddleware, RATE_LIMITS, getClientIP, checkRateLimit } from '@/lib/middleware/rate-limit';

export async function POST(request: Request) {
    // Apply rate limiting
    const rateLimitResponse = rateLimitMiddleware(request, RATE_LIMITS.research);
    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    try {
        const body = await request.json();
        
        // Validate input with Zod schema
        const validationResult = researchRequestSchema.safeParse(body);
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

        const { rawText, url, duration, mindsetOverride, templateId, preferredFormat } = validationResult.data;

        // In a real scenario, you'd add a scraping utility here if a URL is provided.
        // For now, we use the text provided.
        let textToTailor = rawText;

        if (!textToTailor && url) {
            textToTailor = `URL to research: ${url}`;
        }

        if (!textToTailor) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        const tailored = await tailorContentLive(textToTailor, duration || '30s', {
            mindsetOverride,
            templateId,
            preferredFormat
        });
        
        // Add rate limit headers to response
        const ip = getClientIP(request);
        const rateLimit = checkRateLimit(ip, RATE_LIMITS.research);
        return NextResponse.json(tailored, {
            headers: {
                'X-RateLimit-Limit': rateLimit.limit.toString(),
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            },
        });
    } catch (error) {
        console.error('Synthesis API Error:', error);
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Invalid request format', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json({ error: 'Synthesis failed' }, { status: 500 });
    }
}
