import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Health check endpoint for monitoring
 */
export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {};

  // Check Supabase connection
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('clients').select('count').limit(1);
    checks.database = error
      ? { status: 'error', message: error.message }
      : { status: 'ok' };
  } catch (error) {
    checks.database = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ANTHROPIC_API_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
  checks.environment = missingEnvVars.length
    ? { status: 'error', message: `Missing: ${missingEnvVars.join(', ')}` }
    : { status: 'ok' };

  const allHealthy = Object.values(checks).every((check) => check.status === 'ok');
  const statusCode = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: statusCode }
  );
}
