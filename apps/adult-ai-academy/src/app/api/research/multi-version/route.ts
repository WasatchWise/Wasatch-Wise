import { NextResponse } from 'next/server';
import { generateMultiVersion } from '@/lib/research/multi-version';
import { multiVersionRequestSchema } from '@/lib/validation/api-schemas';
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
        const validationResult = multiVersionRequestSchema.safeParse(body);
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

        const { rawText, url, duration, usePerformanceData, preferredFormat } = validationResult.data;

        // In a real scenario, you'd add a scraping utility here if a URL is provided.
        let textToTailor = rawText;

        if (!textToTailor && url) {
            textToTailor = `URL to research: ${url}`;
        }

        if (!textToTailor) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        const multiVersion = await generateMultiVersion(textToTailor, duration || '30s', {
            usePerformanceData,
            preferredFormat
        });

        // Add rate limit headers to response
        const ip = getClientIP(request);
        const rateLimit = checkRateLimit(ip, RATE_LIMITS.research);
        return NextResponse.json(multiVersion, {
            headers: {
                'X-RateLimit-Limit': rateLimit.limit.toString(),
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            },
        });
    } catch (error) {
        console.error('Multi-Version Generation API Error:', error);
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Invalid request format', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json({ 
            error: 'Multi-version generation failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

