import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with service role key
 * USE ONLY IN SERVER-SIDE CODE (API routes, server components)
 * This client bypasses Row Level Security (RLS) policies
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceRoleKey && process.env.NODE_ENV === 'production') {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set in production');
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
