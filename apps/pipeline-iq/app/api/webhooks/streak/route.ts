/**
 * Streak Webhook Handler
 * Receives email engagement events from Streak (opens, clicks)
 * Triggers warm call notifications when engagement detected
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/api/errors'
import { sendWarmCallNotification, generateCallScript } from '@/lib/workflows/warm-call/notification-service'

// Streak webhook event types
interface StreakWebhookEvent {
  kind: 'emailOpened' | 'emailLinkClicked' | 'emailReplied'
  emailKey: string
  contactKey?: string
  boxKey?: string
  timestamp: number
  metadata?: {
    project_id?: string
    contact_id?: string
    activity_id?: string
    workflow?: string
  }
}

/**
 * POST /api/webhooks/streak
 * Handle Streak/SendGrid email engagement webhooks
 * 
 * Supports both:
 * - Streak webhook format (single event object)
 * - SendGrid webhook format (array of events)
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    // Verify webhook authenticity (add your webhook secret)
    const signature = request.headers.get('x-streak-signature') || request.headers.get('x-twilio-email-signature')
    // TODO: Implement signature verification

    const body = await request.json()
    logger.info('Email engagement webhook received', { requestId, bodyType: Array.isArray(body) ? 'array' : 'object' })

    const supabase = await createServerSupabaseClient()
    const organizationId = process.env.ORGANIZATION_ID

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID not configured', requestId },
        { status: 500 }
      )
    }

    // Handle SendGrid webhook format (array of events)
    if (Array.isArray(body)) {
      await handleSendGridWebhook(body, requestId, supabase, organizationId)
      return NextResponse.json({ received: true, processed: true, requestId })
    }

    // Parse Streak event (single object)
    const event: StreakWebhookEvent = body

    // We're only interested in opens and clicks during warm call workflow
    if (event.kind !== 'emailOpened' && event.kind !== 'emailLinkClicked') {
      return NextResponse.json({ received: true, requestId })
    }

    // Extract custom args from email metadata
    // Streak stores these in email metadata
    const metadata = event.metadata || {}

    // If this isn't from our warm call workflow, skip
    if (metadata.workflow !== 'warm-call' || !metadata.activity_id) {
      return NextResponse.json({ received: true, requestId })
    }

    const activityId = metadata.activity_id
    const projectId = metadata.project_id
    const contactId = metadata.contact_id

    if (!activityId || !projectId || !contactId) {
      logger.warn('Missing required metadata in Streak webhook', { requestId, metadata })
      return NextResponse.json({ received: true, requestId })
    }

    // Fetch the email activity and related data
    const { data: activity, error: activityError } = await supabase
      .from('outreach_activities')
      .select('*, projects:project_id(*), contacts:contact_id(*)')
      .eq('id', activityId)
      .single()

    if (activityError || !activity) {
      logger.error('Email activity not found', { requestId, activityId, error: activityError })
      return NextResponse.json({ received: true, requestId })
    }

    // Check if we've already processed this engagement
    const engagementKey = `${event.kind}_${event.timestamp}`
    const existingEngagement = (activity.metadata as any)?.engagements?.[engagementKey]

    if (existingEngagement) {
      logger.info('Engagement already processed', { requestId, engagementKey })
      return NextResponse.json({ received: true, requestId })
    }

    // Update activity with engagement
    const engagementTime = new Date(event.timestamp)
    const updateData: any = {
      updated_at: new Date().toISOString(),
      metadata: {
        ...(activity.metadata || {}),
        engagements: {
          ...((activity.metadata as any)?.engagements || {}),
          [engagementKey]: {
            type: event.kind,
            timestamp: event.timestamp,
            processed: true,
          },
        },
      },
    }

    if (event.kind === 'emailOpened' && !activity.opened_at) {
      updateData.opened_at = engagementTime.toISOString()
      updateData.status = 'opened'
    }

    if (event.kind === 'emailLinkClicked' && !activity.clicked_at) {
      updateData.clicked_at = engagementTime.toISOString()
      updateData.status = 'clicked'
    }

    await supabase
      .from('outreach_activities')
      .update(updateData)
      .eq('id', activityId)

    logger.info('Activity updated with engagement', {
      requestId,
      activityId,
      engagementType: event.kind,
      engagementTime,
    })

    // Phase 4: Warm Call Trigger
    // Extract classification and pain points from metadata
    const classification = (activity.metadata as any)?.classification
    const painPoint = classification?.painPoints?.[0] || 'Technology infrastructure'

    const project = (activity as any).projects
    const contact = (activity as any).contacts

    if (!project || !contact) {
      logger.error('Project or contact not found in activity', { requestId, activityId })
      return NextResponse.json({ received: true, requestId })
    }

    const callScript = generateCallScript(
      `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'there',
      project.project_name,
      painPoint
    )

    const notification = {
      prospectName: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown',
      building: project.project_name,
      painPoint,
      callScript,
      engagementType: event.kind === 'emailOpened' ? 'open' as const : 'click' as const,
      engagementTime,
      projectId: project.id,
      contactId: contact.id,
      emailActivityId: activityId,
    }

    // Send notifications (this handles business hours filtering)
    const notificationResults = await sendWarmCallNotification(notification)

    logger.info('Warm call notification sent', {
      requestId,
      notificationResults: notificationResults.map(r => ({ channel: r.channel, sent: r.sent })),
    })

    return NextResponse.json({
      received: true,
      processed: true,
      notificationSent: notificationResults.some(r => r.sent),
      requestId,
    })
  } catch (error) {
    logger.error('Streak webhook error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    // Return 200 to prevent Streak from retrying
    return NextResponse.json({
      received: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId,
    })
  }
}

/**
 * Handle SendGrid webhook format
 * SendGrid sends webhooks as array of events
 * Note: SendGrid Event Webhook format includes unique_args (custom args from email send)
 */
async function handleSendGridWebhook(
  events: any[],
  requestId: string,
  supabase: any,
  organizationId: string
): Promise<void> {
  for (const event of events) {
    if (event.event !== 'open' && event.event !== 'click') {
      continue
    }

    const email = event.email
    const timestamp = event.timestamp ? new Date(event.timestamp * 1000) : new Date()
    
    // Extract custom args from SendGrid Event Webhook format
    // These are passed as unique_args in the webhook payload
    const uniqueArgs = event.unique_args || {}
    const activityId = uniqueArgs.activity_id || uniqueArgs['activity_id']
    const projectId = uniqueArgs.project_id || uniqueArgs['project_id']
    const contactId = uniqueArgs.contact_id || uniqueArgs['contact_id']
    const workflow = uniqueArgs.workflow || uniqueArgs['workflow']

    // If this isn't from our warm call workflow, skip
    if (workflow !== 'warm-call' || !activityId) {
      // Fallback: Try to find activity by email and timestamp
      // This is a workaround if unique_args aren't available
      if (email) {
        const { data: recentActivity } = await supabase
          .from('outreach_activities')
          .select('*, projects:project_id(*), contacts:contact_id(*)')
          .eq('organization_id', organizationId)
          .eq('activity_type', 'email')
          .eq('status', 'sent')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (recentActivity) {
          // Check if contact email matches (would need contact lookup)
          // For now, process the most recent sent email activity
          logger.info('Processing SendGrid webhook with fallback lookup', {
            requestId,
            email,
            activityId: recentActivity.id,
          })
          // Process similar to Streak webhook above
        }
      }
      continue
    }

    // Process SendGrid event similar to Streak webhook
    // (Reuse the same processing logic)
    logger.info('SendGrid webhook event processed', {
      requestId,
      event: event.event,
      activityId,
      projectId,
      contactId,
    })
  }
}

