import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client for Next.js App Router server components
 * This client properly handles cookies and works with RLS policies
 * USE ONLY IN SERVER COMPONENTS (not API routes)
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  try {
    const cookieStore = cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch (err) {
            // If cookies() context is lost, return undefined
            console.error('Error accessing cookie:', err);
            return undefined;
          }
        },
        set() {
          // Server components can't set cookies
        },
        remove() {
          // Server components can't remove cookies
        },
      },
    });
  } catch (err) {
    // Fallback: create client without cookie support if cookies() fails
    // This can happen in generateMetadata or other edge cases
    console.error('Error creating Supabase client with cookies, using fallback:', err);
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
    });
  }
}
