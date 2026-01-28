/**
 * Enhanced Fetch Utilities
 * Fetch with timeouts, retries, and error handling
 */

import { logger } from '@/lib/logger'
import { ExternalServiceError } from './errors'

// ============================================
// Types
// ============================================

export interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  retryOn?: number[]
}

export interface FetchResult<T> {
  data: T | null
  error: Error | null
  status: number
  ok: boolean
}

// ============================================
// Constants
// ============================================

const DEFAULT_TIMEOUT = 10000 // 10 seconds
const DEFAULT_RETRIES = 3
const DEFAULT_RETRY_DELAY = 1000 // 1 second
const DEFAULT_RETRY_ON = [408, 429, 500, 502, 503, 504]

// ============================================
// Fetch with Timeout
// ============================================

/**
 * Fetch with timeout support
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms: ${url}`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// ============================================
// Fetch with Retry
// ============================================

/**
 * Fetch with automatic retry on failure
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    retryOn = DEFAULT_RETRY_ON,
    ...fetchOptions
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions)

      // Check if we should retry based on status code
      if (!response.ok && retryOn.includes(response.status) && attempt < retries) {
        logger.warn(`Fetch attempt ${attempt + 1} failed with status ${response.status}, retrying...`, {
          url,
          status: response.status,
        })
        await sleep(retryDelay * Math.pow(2, attempt)) // Exponential backoff
        continue
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < retries) {
        logger.warn(`Fetch attempt ${attempt + 1} failed, retrying...`, {
          url,
          error: lastError.message,
        })
        await sleep(retryDelay * Math.pow(2, attempt))
        continue
      }
    }
  }

  throw lastError || new Error(`Failed to fetch after ${retries} retries: ${url}`)
}

// ============================================
// Safe Fetch (Returns Result Object)
// ============================================

/**
 * Fetch that never throws - returns result object
 */
export async function safeFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  try {
    const response = await fetchWithRetry(url, options)
    const data = await response.json() as T

    return {
      data,
      error: null,
      status: response.status,
      ok: response.ok,
    }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))

    logger.error('Fetch failed', {
      url,
      error: errorObj.message,
    })

    return {
      data: null,
      error: errorObj,
      status: 0,
      ok: false,
    }
  }
}

// ============================================
// External API Helpers
// ============================================

/**
 * Fetch from Google API with error handling
 */
export async function fetchGoogleApi<T>(
  endpoint: string,
  apiKey: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const url = new URL(endpoint)
  url.searchParams.set('key', apiKey)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const result = await safeFetch<T>(url.toString(), {
    timeout: 15000,
    retries: 2,
  })

  if (!result.ok || !result.data) {
    logger.error('Google API request failed', {
      endpoint,
      error: result.error?.message,
      status: result.status,
    })
    return null
  }

  return result.data
}

/**
 * Fetch from OpenAI-compatible API with error handling
 */
export async function fetchOpenAI<T>(
  endpoint: string,
  apiKey: string,
  body: unknown
): Promise<T | null> {
  const result = await safeFetch<T>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    timeout: 60000, // OpenAI can be slow
    retries: 2,
  })

  if (!result.ok || !result.data) {
    logger.error('OpenAI API request failed', {
      endpoint,
      error: result.error?.message,
      status: result.status,
    })
    return null
  }

  return result.data
}

// ============================================
// Parallel Fetch with Graceful Degradation
// ============================================

/**
 * Execute multiple fetches in parallel, returning results even if some fail
 */
export async function fetchAllSettled<T>(
  requests: Array<() => Promise<T>>
): Promise<Array<{ success: true; data: T } | { success: false; error: Error }>> {
  const results = await Promise.allSettled(requests.map(fn => fn()))

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true as const, data: result.value }
    }
    return {
      success: false as const,
      error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
    }
  })
}

// ============================================
// Utilities
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a service-specific fetcher
 */
export function createServiceFetcher(serviceName: string) {
  return async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
    try {
      const response = await fetchWithRetry(url, options)

      if (!response.ok) {
        throw new ExternalServiceError(serviceName)
      }

      return await response.json() as T
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error
      throw new ExternalServiceError(serviceName, error instanceof Error ? error : undefined)
    }
  }
}
