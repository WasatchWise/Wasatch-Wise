/**
 * API Error Handling Utilities
 * Standardized error responses and error classes
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger } from '@/lib/logger'

// ============================================
// Error Classes
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter })
    this.name = 'RateLimitError'
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, originalError?: Error) {
    super(`External service error: ${service}`, 502, 'EXTERNAL_SERVICE_ERROR', {
      service,
      originalMessage: originalError?.message,
    })
    this.name = 'ExternalServiceError'
  }
}

// ============================================
// Error Response Helpers
// ============================================

export interface ErrorResponse {
  error: string
  code?: string
  details?: unknown
  requestId?: string
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  requestId?: string
): NextResponse<ErrorResponse> {
  // Handle known error types
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        requestId,
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
        requestId,
      },
      { status: 400 }
    )
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Log unexpected errors
    logger.error('Unhandled API error', {
      error: error.message,
      stack: error.stack,
      requestId,
    })

    // Don't expose internal error details in production
    const message =
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message

    return NextResponse.json(
      {
        error: message,
        code: 'INTERNAL_ERROR',
        requestId,
      },
      { status: 500 }
    )
  }

  // Handle unknown error types
  logger.error('Unknown error type', { error, requestId })

  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      requestId,
    },
    { status: 500 }
  )
}

/**
 * Wrap an API handler with error handling
 */
export function withErrorHandling<T>(
  handler: (requestId: string) => Promise<NextResponse<T>>
): () => Promise<NextResponse<T | ErrorResponse>> {
  return async () => {
    const requestId = generateRequestId()

    try {
      return await handler(requestId)
    } catch (error) {
      return createErrorResponse(error, requestId)
    }
  }
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// ============================================
// Safe JSON Parsing
// ============================================

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T = unknown>(
  json: string | null | undefined,
  fallback: T
): T {
  if (!json) return fallback

  try {
    return JSON.parse(json) as T
  } catch {
    logger.warn('Failed to parse JSON', { json: json.substring(0, 100) })
    return fallback
  }
}

/**
 * Safely parse request body JSON
 */
export async function safeParseBody<T = unknown>(
  request: Request,
  fallback: T
): Promise<T> {
  try {
    const text = await request.text()
    if (!text) return fallback
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}
