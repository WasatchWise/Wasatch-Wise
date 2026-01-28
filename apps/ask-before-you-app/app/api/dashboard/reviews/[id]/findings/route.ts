import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Create Supabase client inside function to avoid build-time errors
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { id } = await params;
    const body = await req.json();
    const { finding_type, severity, title, description, recommendation, evidence } = body;

    if (!finding_type || !severity || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('review_findings')
      .insert({
        review_id: id,
        finding_type,
        severity,
        title,
        description,
        recommendation: recommendation || null,
        evidence: evidence || null,
      });

    if (error) {
      console.error('Error adding finding:', error);
      return NextResponse.json(
        { error: 'Failed to add finding' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Finding creation error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
