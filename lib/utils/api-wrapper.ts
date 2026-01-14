import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from './errors';
import { logger } from './logger';
import { sanitizeString } from './sanitize';

/**
 * Wrapper for API route handlers with error handling, logging, and validation
 */
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      logger.error('API route error', error, {
        path: req.nextUrl.pathname,
        method: req.method,
      });

      const errorResponse = formatErrorResponse(error);
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }
  };
}

/**
 * Validate request body
 */
export function validateRequestBody<T>(
  body: unknown,
  validator: (data: unknown) => data is T
): T {
  if (!validator(body)) {
    throw new Error('Invalid request body');
  }
  return body;
}

/**
 * Sanitize request body strings
 */
export function sanitizeRequestBody<T extends Record<string, unknown>>(
  body: T
): T {
  const sanitized = { ...body };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key] as string) as T[Extract<
        keyof T,
        string
      >];
    }
  }
  return sanitized;
}
