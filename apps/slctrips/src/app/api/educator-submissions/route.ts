import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

/**
 * POST /api/educator-submissions
 *
 * Handles educator implementation idea submissions for TK-000.
 * Stores teacher-generated content to share with other educators.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      title,
      description,
      gradeLevel,
      duration,
      category
    } = body;

    // Validation
    if (!email || !title || !description) {
      return NextResponse.json(
        { message: 'Email, title, and description are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get request metadata
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert into database
    const { data, error } = await supabase
      .from('educator_submissions')
      .insert([
        {
          name: name || null,
          email: email.toLowerCase().trim(),
          title: title.trim(),
          description: description.trim(),
          grade_level: gradeLevel || '4th Grade',
          duration: duration || null,
          category: category || 'Other',
          status: 'pending', // Will be reviewed before publishing
          metadata: {
            ip,
            userAgent,
            submittedAt: new Date().toISOString()
          }
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);

      // Check if table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json(
          {
            message: 'Submission system not yet configured. Please try again later.',
            note: 'Database table needs to be created. See migration file needed.'
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { message: 'Failed to save submission. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Submission received successfully',
        id: data.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Educator submission error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/educator-submissions
 *
 * Returns approved educator submissions for display on the resources page.
 * Only returns submissions with status='approved'.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('educator_submissions')
      .select('id, title, description, grade_level, duration, category, name, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Database error:', error);

      // If table doesn't exist yet, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ submissions: [] }, { status: 200 });
      }

      return NextResponse.json(
        { message: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ submissions: data || [] }, { status: 200 });

  } catch (error) {
    console.error('Fetch submissions error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
