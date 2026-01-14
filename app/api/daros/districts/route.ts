import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/daros/districts
 * List all districts
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ districts: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/daros/districts
 * Create a new district
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, state, size_band, contacts } = body;

    if (!name || !state) {
      return NextResponse.json(
        { error: 'Name and state are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('districts')
      .insert({
        name,
        state,
        size_band: size_band || 'medium',
        contacts: contacts || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ district: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create district' },
      { status: 500 }
    );
  }
}
