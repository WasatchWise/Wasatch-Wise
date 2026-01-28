/**
 * Timeout utilities for API calls
 */

/**
 * Create a promise that rejects after a timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Timeout configuration for different services
 */
export const API_TIMEOUTS = {
  claude: 30000, // 30 seconds
  heygen: 120000, // 2 minutes (video generation takes time)
  elevenlabs: 15000, // 15 seconds
  supabase: 10000, // 10 seconds
  resend: 10000, // 10 seconds
  default: 15000, // 15 seconds
} as const;
