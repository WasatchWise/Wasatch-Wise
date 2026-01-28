import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

let supabaseAdminInstance: SupabaseClient<Database> | null = null

/**
 * Get or create the admin Supabase client
 * Uses service role key - bypasses RLS
 * WARNING: Only use server-side for admin operations
 */
function getSupabaseAdmin(): SupabaseClient<Database> {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  supabaseAdminInstance = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdminInstance
}

/**
 * Admin client - bypasses RLS
 * Use with caution - only for server-side admin operations
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient<Database>]
  },
})

/**
 * Create service client (alias for compatibility)
 */
export const createServiceSupabaseClient = () => getSupabaseAdmin()
