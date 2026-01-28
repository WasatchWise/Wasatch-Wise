import { NextRequest, NextResponse } from 'next/server';
/**
 * POST /api/daros/briefing/complete
 * Complete a briefing session and generate artifacts
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, outcomes, notes } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Import the completeBriefingSession function
    const { completeBriefingSession } = await import('@/lib/daros/briefing');
    const result = await completeBriefingSession(sessionId, outcomes || {}, notes);

    return NextResponse.json({
      session: result.session,
      artifacts: result.artifacts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to complete briefing session' },
      { status: 500 }
    );
  }
}
