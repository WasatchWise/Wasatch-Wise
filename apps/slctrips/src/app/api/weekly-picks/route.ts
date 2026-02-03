import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/weekly-picks
 * Returns the active "This Week's Picks" from Utah Conditions Monitor (n8n).
 * Used by the landing page to show weather-aware recommendations.
 *
 * Reads from weekly_picks table (same Supabase as dashboard/n8n).
 * If DASHBOARD_SUPABASE_URL is set, uses that; otherwise uses app Supabase.
 */
export async function GET() {
  const url =
    process.env.DASHBOARD_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.DASHBOARD_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: 'Supabase not configured for weekly_picks' },
      { status: 503 }
    );
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from('weekly_picks')
    .select('id, mode, content_angle, weather_temp, weather_conditions, recommendations, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[weekly-picks] Supabase error:', error.message);
    return NextResponse.json(
      { error: 'Failed to load weekly picks' },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(null, { status: 200 });
  }

  return NextResponse.json({
    headline: data.content_angle,
    mode: data.mode,
    weather: {
      temp: data.weather_temp,
      conditions: data.weather_conditions ?? '',
    },
    recommendations: (data.recommendations as { name: string; type: string; link: string }[]) ?? [],
    createdAt: data.created_at,
  });
}
