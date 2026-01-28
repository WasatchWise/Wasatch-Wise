/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for database operations.
 * Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are not set. ' +
    'Database features will be unavailable. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
  )
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null
}

// Type definitions for database tables (will be generated from Supabase schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          pseudonym: string
          avatar_url: string | null
          is_verified: boolean
          is_active: boolean
          is_premium: boolean
          premium_tier: string | null
          created_at: string
          updated_at: string
          last_active_at: string
          onboarding_completed_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id: string
          email: string
          pseudonym: string
          avatar_url?: string | null
          is_verified?: boolean
          is_active?: boolean
          is_premium?: boolean
          premium_tier?: string | null
          created_at?: string
          updated_at?: string
          last_active_at?: string
          onboarding_completed_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          pseudonym?: string
          avatar_url?: string | null
          is_verified?: boolean
          is_active?: boolean
          is_premium?: boolean
          premium_tier?: string | null
          created_at?: string
          updated_at?: string
          last_active_at?: string
          onboarding_completed_at?: string | null
          deleted_at?: string | null
        }
      }
      // Add more table types as needed
      // See Supabase docs for generating types: https://supabase.com/docs/guides/api/generating-types
    }
  }
}

