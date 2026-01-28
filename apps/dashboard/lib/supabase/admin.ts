import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client using service role key.
 * This bypasses Row Level Security (RLS) for admin operations.
 * 
 * ⚠️ SECURITY: Only use this in server-side code, never expose to client!
 * 
 * Updated: env var configured in Vercel
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Debug: Log environment variable presence (server-side only, won't expose values)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Admin Client] Env check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
    });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Vercel environment variables.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
