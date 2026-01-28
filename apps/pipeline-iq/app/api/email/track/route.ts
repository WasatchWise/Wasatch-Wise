import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/email/track?tracking_id=xxx&event=open|click
 * Email tracking pixel/webhook endpoint
 * Used to track when emails are opened or clicked
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingId = searchParams.get('tracking_id')
    const event = searchParams.get('event') || 'open' // 'open' or 'click'

    if (!trackingId) {
      // Return 1x1 transparent pixel for email opens
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      )
      return new NextResponse(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    }

    const supabase = await createServerSupabaseClient()

    // Find the outreach activity by tracking_id
    const { data: activities, error: findError } = await supabase
      .from('outreach_activities')
      .select('*')
      .contains('metadata', { tracking_id: trackingId })

    if (findError || !activities || activities.length === 0) {
      logger.warn('Tracking activity not found', { trackingId })
      // Still return pixel so email doesn't break
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      )
      return new NextResponse(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    }

    const activity = activities[0]

    // Update activity based on event
    if (event === 'open' && !activity.opened_at) {
      await supabase
        .from('outreach_activities')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString(),
        })
        .eq('id', activity.id)

      logger.info('Email opened', { trackingId, activityId: activity.id })
    } else if (event === 'click' && !activity.clicked_at) {
      await supabase
        .from('outreach_activities')
        .update({
          status: 'clicked',
          clicked_at: new Date().toISOString(),
        })
        .eq('id', activity.id)

      logger.info('Email clicked', { trackingId, activityId: activity.id })
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    logger.error('Email tracking error', { error })
    // Still return pixel on error
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
      },
    })
  }
}

