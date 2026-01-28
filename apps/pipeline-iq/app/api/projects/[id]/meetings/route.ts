import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  generateRequestId,
  NotFoundError,
} from '@/lib/api/errors'
import { logger } from '@/lib/logger'

// ============================================
// GET /api/projects/[id]/meetings - Get all meetings for project
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()

  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Invalid project ID', requestId },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: meetings, error } = await supabase
      .from('outreach_activities')
      .select('*')
      .eq('project_id', params.id)
      .eq('activity_type', 'meeting')
      .order('activity_date', { ascending: false })

    if (error) {
      logger.error('Failed to fetch meetings', {
        requestId,
        error: error.message,
      })
      throw error
    }

    return NextResponse.json(
      { meetings: meetings || [], requestId },
      { status: 200 }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}
