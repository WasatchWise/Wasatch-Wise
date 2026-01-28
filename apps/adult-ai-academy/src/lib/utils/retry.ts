/**
 * Retry utility with exponential backoff for external API calls.
 * Handles rate limits, temporary failures, and network errors.
 */

export interface RetryOptions {
    /** Maximum number of retry attempts (default: 3) */
    maxRetries?: number;
    /** Initial delay in milliseconds (default: 1000) */
    initialDelayMs?: number;
    /** Maximum delay in milliseconds (default: 30000) */
    maxDelayMs?: number;
    /** Multiplier for exponential backoff (default: 2) */
    backoffMultiplier?: number;
    /** Function to determine if an error should be retried (default: retries on all errors) */
    shouldRetry?: (error: unknown, attempt: number) => boolean;
    /** Optional logger function (default: console.log) */
    logger?: (message: string) => void;
}

/**
 * Default shouldRetry function that retries on rate limits and temporary failures.
 */
function defaultShouldRetry(error: unknown, attempt: number): boolean {
    // Always retry on first attempts
    if (attempt === 1) return true;

    // Check for rate limit errors
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        // Rate limit indicators
        if (
            message.includes('rate limit') ||
            message.includes('429') ||
            message.includes('too many requests') ||
            message.includes('quota exceeded')
        ) {
            return true;
        }

        // Temporary failures (5xx errors)
        if (
            message.includes('500') ||
            message.includes('502') ||
            message.includes('503') ||
            message.includes('504') ||
            message.includes('service unavailable') ||
            message.includes('bad gateway') ||
            message.includes('gateway timeout')
        ) {
            return true;
        }

        // Network errors
        if (
            message.includes('network') ||
            message.includes('timeout') ||
            message.includes('econnreset') ||
            message.includes('enotfound')
        ) {
            return true;
        }
    }

    // Don't retry on 4xx client errors (except 429) or unknown errors after first attempt
    return false;
}

/**
 * Calculates delay with exponential backoff and jitter.
 */
function calculateDelay(
    attempt: number,
    initialDelayMs: number,
    maxDelayMs: number,
    backoffMultiplier: number
): number {
    const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);
    // Add jitter (random 0-25% of delay) to prevent thundering herd
    const jitter = exponentialDelay * 0.25 * Math.random();
    return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * Sleeps for the specified number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries a function with exponential backoff.
 * 
 * @param fn Function to retry (can be async)
 * @param options Retry configuration options
 * @returns Promise resolving to the function's return value
 * @throws The last error if all retries are exhausted
 * 
 * @example
 * ```ts
 * const result = await retryWithBackoff(
 *   () => fetch('https://api.example.com/data'),
 *   { maxRetries: 3, initialDelayMs: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelayMs = 1000,
        maxDelayMs = 30000,
        backoffMultiplier = 2,
        shouldRetry = defaultShouldRetry,
        logger = console.log,
    } = options;

    let lastError: unknown;
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            attempt++;

            // Check if we should retry
            if (attempt > maxRetries || !shouldRetry(error, attempt)) {
                logger(`Retry exhausted after ${attempt} attempts. Last error: ${error instanceof Error ? error.message : String(error)}`);
                throw error;
            }

            // Calculate delay and wait before retrying
            const delay = calculateDelay(attempt, initialDelayMs, maxDelayMs, backoffMultiplier);
            logger(`Attempt ${attempt} failed. Retrying in ${Math.round(delay)}ms... (${error instanceof Error ? error.message : String(error)})`);
            await sleep(delay);
        }
    }

    // Should never reach here, but TypeScript needs this
    throw lastError;
}

/**
 * Retry configuration presets for different API types.
 */
export const retryPresets = {
    /** Conservative retries for critical operations (OpenAI, Gemini) */
    critical: {
        maxRetries: 5,
        initialDelayMs: 1000,
        maxDelayMs: 30000,
        backoffMultiplier: 2,
    } as RetryOptions,

    /** Standard retries for most operations */
    standard: {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 20000,
        backoffMultiplier: 2,
    } as RetryOptions,

    /** Aggressive retries for non-critical operations */
    fast: {
        maxRetries: 2,
        initialDelayMs: 500,
        maxDelayMs: 5000,
        backoffMultiplier: 1.5,
    } as RetryOptions,
};

