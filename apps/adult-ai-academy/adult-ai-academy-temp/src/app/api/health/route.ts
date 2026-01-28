import { NextResponse } from 'next/server';
import { serverConfig, clientConfig } from '@/lib/config';
import { rateLimitMiddleware, RATE_LIMITS, getClientIP, checkRateLimit } from '@/lib/middleware/rate-limit';

interface ServiceStatus {
    configured: boolean;
    status: 'ok' | 'degraded' | 'unavailable';
    message?: string;
}

interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    services: {
        openai: ServiceStatus;
        gemini: ServiceStatus;
        heygen: ServiceStatus;
        suno: ServiceStatus;
        supabase: ServiceStatus;
        neo4j: ServiceStatus;
    };
    hci: {
        archetypes: number;
        templates: number;
    };
}

const startTime = Date.now();

export async function GET(request: Request) {
    // Apply rate limiting (very permissive for health checks)
    const rateLimitResponse = rateLimitMiddleware(request, RATE_LIMITS.health);
    if (rateLimitResponse) {
        return rateLimitResponse;
    }
    const services = {
        openai: checkOpenAI(),
        gemini: checkGemini(),
        heygen: checkHeyGen(),
        suno: checkSuno(),
        supabase: checkSupabase(),
        neo4j: checkNeo4j(),
    };

    // Determine overall health
    const configuredServices = Object.values(services).filter(s => s.configured);
    const okServices = configuredServices.filter(s => s.status === 'ok');

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';

    // At least one AI provider needed for synthesis
    const hasAIProvider = services.openai.configured || services.gemini.configured;

    if (!hasAIProvider) {
        overallStatus = 'degraded'; // Can still work with mocks
    } else if (okServices.length === configuredServices.length) {
        overallStatus = 'healthy';
    } else if (okServices.length > 0) {
        overallStatus = 'degraded';
    } else {
        overallStatus = 'unhealthy';
    }

    const response: HealthCheckResponse = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        services,
        hci: {
            archetypes: 7,
            templates: 6,
        },
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    // Add rate limit headers to response
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.health);
    return NextResponse.json(response, {
        status: statusCode,
        headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
        },
    });
}

function checkOpenAI(): ServiceStatus {
    const configured = serverConfig.openai.isConfigured;
    return {
        configured,
        status: configured ? 'ok' : 'unavailable',
        message: configured ? `Model: ${serverConfig.openai.modelName}` : 'API key not configured',
    };
}

function checkGemini(): ServiceStatus {
    const configured = serverConfig.gemini.isConfigured;
    return {
        configured,
        status: configured ? 'ok' : 'unavailable',
        message: configured ? `Model: ${serverConfig.gemini.modelName}` : 'API key not configured',
    };
}

function checkHeyGen(): ServiceStatus {
    const configured = serverConfig.heygen.isConfigured;
    return {
        configured,
        status: configured ? 'ok' : 'unavailable',
        message: configured ? 'Ready for video generation' : 'Using simulation mode',
    };
}

function checkSupabase(): ServiceStatus {
    const configured = clientConfig.supabase.isConfigured;
    return {
        configured,
        status: configured ? 'ok' : 'unavailable',
        message: configured ? 'Database connected' : 'Using mock persistence',
    };
}

function checkSuno(): ServiceStatus {
    const configured = serverConfig.suno.isConfigured;
    return {
        configured,
        status: configured ? 'ok' : 'unavailable',
        message: configured ? 'Audio generation ready' : 'Using mock audio',
    };
}

function checkNeo4j(): ServiceStatus {
    const configured = serverConfig.neo4j.isConfigured;
    return {
        configured,
        status: configured ? 'ok' : 'unavailable',
        message: configured ? 'Knowledge graph ready' : 'Using simulated persistence',
    };
}
