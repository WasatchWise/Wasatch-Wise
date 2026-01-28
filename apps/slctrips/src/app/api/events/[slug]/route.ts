import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, context: { params: { slug: string } }) {
  try {
    const { slug } = context.params;
    const { data, error } = await supabaseServer
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    console.error('Event detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to load event' },
      { status: 500 }
    );
  }
}
