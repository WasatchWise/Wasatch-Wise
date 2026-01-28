import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

function parseNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();
    const city = searchParams.get('city')?.trim();
    const state = searchParams.get('state')?.trim();
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Math.min(parseNumber(searchParams.get('limit'), 50), 100);
    const offset = Math.max(parseNumber(searchParams.get('offset'), 0), 0);

    let query = supabaseServer
      .from('events')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (state) {
      query = query.ilike('state', `%${state}%`);
    }
    if (from) {
      query = query.gte('start_at', from);
    }
    if (to) {
      query = query.lte('start_at', to);
    }

    const { data, error, count } = await query
      .order('start_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      events: data || [],
      count: count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Failed to load events' },
      { status: 500 }
    );
  }
}
