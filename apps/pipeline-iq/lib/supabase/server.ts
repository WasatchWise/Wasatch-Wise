import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'
import { logger } from '@/lib/logger'

/**
 * Create Supabase client for server-side usage (API routes, Server Components)
 * Uses anon key with cookie-based session handling
 */
export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    )
  }

  const isProdBuild = process.env.NEXT_PHASE === 'phase-production-build'

  if (isProdBuild) {
    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get() {
          return undefined
        },
        set() {
          // no-op in build
        },
        remove() {
          // no-op in build
        },
      },
    })
  }

  let cookieStore: Awaited<ReturnType<typeof cookies>>
  try {
    cookieStore = await cookies()
  } catch (error: any) {
    throw error
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Cookie setting may fail in some contexts (e.g., after response sent)
          logger.debug('Cookie set failed (expected in some contexts)', { name })
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          logger.debug('Cookie remove failed (expected in some contexts)', { name })
        }
      },
    },
  })
}
