import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest) {
  const secret = process.env.TEST_LOGIN_SECRET;
  if (!secret) {
    return false;
  }
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
  const urlSecret = new URL(request.url).searchParams.get('secret');
  return token === secret || urlSecret === secret;
}

async function handleTestLogin(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const email = process.env.TEST_LOGIN_EMAIL;
    const password = process.env.TEST_LOGIN_PASSWORD;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase env not configured' }, { status: 500 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Test login env not configured' }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    });

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const shouldProvision = process.env.TEST_LOGIN_AUTO_CREATE === 'true';
      if (!shouldProvision) {
        return NextResponse.json({ error: 'Sign-in failed' }, { status: 401 });
      }

      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceRoleKey) {
        return NextResponse.json({ error: 'Service role key missing' }, { status: 500 });
      }

      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error: signUpError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { test_account: true },
      });

      if (signUpError) {
        return NextResponse.json({ error: 'Sign-up failed' }, { status: 401 });
      }

      const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
      if (retryError) {
        return NextResponse.json({ error: 'Sign-in failed' }, { status: 401 });
      }
    }

    return response;
  } catch (error) {
    console.error('Test login failed:', error);
    return NextResponse.json({ error: 'Test login failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleTestLogin(request);
}

export async function GET(request: NextRequest) {
  return handleTestLogin(request);
}
