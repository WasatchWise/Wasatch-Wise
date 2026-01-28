import { createBrowserClient } from '@supabase/ssr';

// IMPORTANT: These env vars MUST be set in Vercel production environment
// The NEXT_PUBLIC_ prefix makes them available at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);


