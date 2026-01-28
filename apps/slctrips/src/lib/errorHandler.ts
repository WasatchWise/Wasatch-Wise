/**
 * Centralized Error Handler
 * Provides consistent error handling, logging, and user-friendly messages
 */

import * as Sentry from '@sentry/nextjs';
import { ERROR_MESSAGES } from './constants';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context?: ErrorContext;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Handle errors with consistent logging and user-friendly messages
 */
export function handleError(
  error: unknown,
  context?: ErrorContext
): string {
  // Log error details
  console.error('Error occurred:', {
    error,
    context,
    timestamp: new Date().toISOString(),
  });

  // Send to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    logToErrorTracking(error, context);
  }

  // Return user-friendly message
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Map common error types to user-friendly messages
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ERROR_MESSAGES.NETWORK;
    }
    if (error.message.includes('not found') || error.message.includes('404')) {
      return ERROR_MESSAGES.NOT_FOUND;
    }
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return ERROR_MESSAGES.FORBIDDEN;
    }

    // Return the error message in development
    if (process.env.NODE_ENV === 'development') {
      return error.message;
    }
  }

  return ERROR_MESSAGES.GENERIC;
}

/**
 * Log error to tracking service (Sentry)
 */
function logToErrorTracking(error: unknown, context?: ErrorContext): void {
  // Only send to Sentry in production to avoid noise
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  try {
    // Sentry is imported at the top level

    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: {
          ...context,
          timestamp: new Date().toISOString(),
        },
        tags: {
          component: context?.component,
          action: context?.action,
        },
        user: context?.userId ? { id: context.userId } : undefined,
      });
    } else {
      // For non-Error objects, capture as a message
      Sentry.captureMessage(
        `Non-error exception: ${JSON.stringify(error)}`,
        {
          level: 'error',
          extra: {
            error,
            ...context,
            timestamp: new Date().toISOString(),
          },
        }
      );
    }
  } catch (sentryError) {
    // Fallback if Sentry fails - log to console in production
    console.error('Failed to send error to Sentry:', sentryError);
    console.error('Original error:', error);
  }
}

/**
 * Wrapper for async functions with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    const errorMessage = handleError(error, context);
    return { error: errorMessage };
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: ErrorContext
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        if (process.env.NODE_ENV === 'development') {
          console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
            context,
            error: error instanceof Error ? error.message : error,
          });
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new AppError(
    `Failed after ${maxRetries} attempts`,
    'MAX_RETRIES_EXCEEDED',
    500,
    context
  );
}

/**
 * Validation error helper
 */
export function createValidationError(
  field: string,
  message: string
): AppError {
  return new AppError(
    message,
    'VALIDATION_ERROR',
    400,
    { component: 'validation', metadata: { field } }
  );
}

/**
 * API error helper
 */
export function createApiError(
  message: string,
  statusCode: number = 500
): AppError {
  return new AppError(
    message,
    'API_ERROR',
    statusCode,
    { component: 'api' }
  );
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch') ||
      error.message.toLowerCase().includes('connection');
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof AppError && error.code === 'VALIDATION_ERROR';
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: unknown): {
  title: string;
  message: string;
  canRetry: boolean;
} {
  if (error instanceof AppError) {
    return {
      title: error.code.replace(/_/g, ' ').toLowerCase(),
      message: error.message,
      canRetry: error.code !== 'VALIDATION_ERROR',
    };
  }

  if (isNetworkError(error)) {
    return {
      title: 'Connection Error',
      message: ERROR_MESSAGES.NETWORK,
      canRetry: true,
    };
  }

  return {
    title: 'Error',
    message: handleError(error),
    canRetry: true,
  };
}

export default {
  handleError,
  withErrorHandling,
  retryWithBackoff,
  createValidationError,
  createApiError,
  isNetworkError,
  isValidationError,
  formatErrorForDisplay,
  AppError,
};
