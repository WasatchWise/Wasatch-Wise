import { useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Hook that provides a type-safe Supabase client.
 * Returns null if supabase is not configured, allowing components to handle gracefully.
 * 
 * Usage:
 * ```tsx
 * const client = useSupabaseClient()
 * if (!client) return <div>Database not available</div>
 * // Now TypeScript knows client is non-null
 * const { data } = await client.from('table').select()
 * ```
 */
export function useSupabaseClient(): SupabaseClient | null {
  return useMemo(() => supabase, [])
}

