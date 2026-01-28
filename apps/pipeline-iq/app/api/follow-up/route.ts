import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  createErrorResponse,
  generateRequestId,
  ValidationError,
} from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import { sendEmailWithSendGrid } from '@/lib/utils/sendgrid'

// ============================================
// Validation Schema
// ============================================

const sendFollowUpSchema = z.object({
  activityId: z.string().uuid(),
  followUpType: z.enum(['day_3', 'day_7', 'day_14', 'custom']).default('day_3'),
  customSubject: z.string().optional(),
  customMessage: z.string().optional(),
})

// Follow-up subject line templates
const FOLLOW_UP_SUBJECTS = {
  day_3: 'Re: Quick question about {projectName}',
  day_7: 'One more thought about {projectName}',
  day_14: 'Closing the loop - {projectName}',
  custom: '{customSubject}',
}

// Follow-up message templates
const FOLLOW_UP_MESSAGES = {
  day_3: `Hi {firstName},

Just wanted to float this back up in case it got buried.

I'd mentioned we might be able to help with {projectName} - especially around the technology infrastructure.

Worth a quick call?

Best,
Mike`,
  day_7: `Hi {firstName},

I know you're busy, so I'll keep this quick.

I've been thinking about {projectName} and have a few ideas that might save you time and money on the technology side.

If there's a better person to chat with about this, happy to be redirected.

Cheers,
Mike`,
  day_14: `Hi {firstName},

I'll assume the timing isn't right for {projectName}, but I wanted to reach out one last time.

If technology infrastructure becomes a priority down the road, I'm here. Just reply to this email.

Wishing you all the best,
Mike`,
  custom: '{customMessage}',
}

// ============================================
// POST /api/follow-up - Send follow-up email
// ============================================

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new ValidationError('Invalid JSON in request body')
    }

    const validation = sendFollowUpSchema.safeParse(body)
    if (!validation.success) {
      throw new ValidationError(
        validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      )
    }

    const { activityId, followUpType, customSubject, customMessage } = validation.data

    logger.info('Sending follow-up email', {
      requestId,
      activityId,
      followUpType,
    })

    const supabase = await createServerSupabaseClient()
    const orgId = process.env.ORGANIZATION_ID

    // Get the original activity with contact and project info
    const { data: activity, error: activityError } = await (supabase as any)
      .from('outreach_activities')
      .select(`
        *,
        contact:contacts(*),
        project:projects(*)
      `)
      .eq('id', activityId)
      .single()

    if (activityError || !activity) {
      throw new ValidationError('Activity not found')
    }

    const contact = activity.contact
    const project = activity.project

    if (!contact?.email) {
      throw new ValidationError('Contact has no email address')
    }

    // Build personalized subject and message
    const firstName = contact.first_name || 'there'
    const projectName = project?.project_name || 'your project'

    let subject = FOLLOW_UP_SUBJECTS[followUpType]
      .replace('{projectName}', projectName)
      .replace('{customSubject}', customSubject || '')

    let message = FOLLOW_UP_MESSAGES[followUpType]
      .replace(/{firstName}/g, firstName)
      .replace(/{projectName}/g, projectName)
      .replace('{customMessage}', customMessage || '')

    // Send the follow-up email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${message.replace(/\n/g, '<br>')}
        <br><br>
        <div style="color: #666; font-size: 12px;">
          --<br>
          Mike Sartain<br>
          Groove Technologies<br>
          msartain@getgrooven.com
        </div>
      </div>
    `

    const success = await sendEmailWithSendGrid({
      to: contact.email,
      subject,
      html: htmlContent,
      text: message,
    })

    if (!success) {
      throw new Error('Failed to send email via SendGrid')
    }

    // Create new activity record for follow-up
    const { error: insertError } = await (supabase as any)
      .from('outreach_activities')
      .insert({
        organization_id: orgId,
        contact_id: contact.id,
        project_id: project?.id || null,
        activity_type: 'email',
        status: 'sent',
        activity_date: new Date().toISOString(),
        metadata: {
          followUpType,
          originalActivityId: activityId,
          subject,
        },
      })

    if (insertError) {
      logger.warn('Failed to log follow-up activity', { requestId, error: insertError.message })
    }

    // Update contact's contact_count
    await (supabase as any)
      .from('contacts')
      .update({
        contact_count: (contact.contact_count || 0) + 1,
        last_contacted: new Date().toISOString(),
      })
      .eq('id', contact.id)

    logger.info('Follow-up email sent successfully', {
      requestId,
      activityId,
      contactEmail: contact.email,
      followUpType,
    })

    return NextResponse.json({
      success: true,
      message: 'Follow-up email sent successfully',
      requestId,
    })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// GET /api/follow-up - Get activities needing follow-up
// ============================================

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    const supabase = await createServerSupabaseClient()
    const orgId = process.env.ORGANIZATION_ID

    const { searchParams } = new URL(request.url)
    const daysOld = parseInt(searchParams.get('daysOld') || '3')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Calculate the cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // Get activities that need follow-up:
    // - Status is 'sent' or 'delivered' (not opened)
    // - Created more than X days ago
    // - Haven't been followed up on already
    const baseSelect = `
        id,
        status,
        created_at,
        contact:contacts(
          id,
          first_name,
          last_name,
          email,
          title,
          contact_count
        ),
        project:projects(
          id,
          project_name,
          city,
          state,
          project_value
        )
      `

    const selectWithMetadata = `
        id,
        status,
        created_at,
        metadata,
        contact:contacts(
          id,
          first_name,
          last_name,
          email,
          title,
          contact_count
        ),
        project:projects(
          id,
          project_name,
          city,
          state,
          project_value
        )
      `

    const runQuery = async (select: string, opts?: { skipOpenedAtFilter?: boolean }) => {
      let q = (supabase as any)
        .from('outreach_activities')
        .select(select)
        .eq('organization_id', orgId)
        .eq('activity_type', 'email')
        .in('status', ['sent', 'delivered'])
        .lt('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: true })
        .limit(limit)

      if (!opts?.skipOpenedAtFilter) {
        q = q.is('opened_at', null)
      }

      return await q
    }

    let activities: any[] | null = null
    let error: any = null
    ;({ data: activities, error } = await runQuery(selectWithMetadata))

    if (error) {
      if (typeof error.message === 'string' && error.message.includes('metadata') && error.message.includes('does not exist')) {
        // Backwards-compat: older DBs may not have outreach_activities.metadata yet.
        ;({ data: activities, error } = await runQuery(baseSelect))
      } else if (typeof error.message === 'string' && error.message.includes('opened_at') && error.message.includes('does not exist')) {
        // Backwards-compat: older DBs may not have outreach_activities.opened_at yet.
        ;({ data: activities, error } = await runQuery(selectWithMetadata, { skipOpenedAtFilter: true }))
      }
    }

    if (error) {
      logger.warn('Failed to fetch follow-up queue', { requestId, error: error.message })
      return NextResponse.json({ queue: [], total: 0, requestId }, { status: 200 })
    }

    // Calculate days since sent for each activity
    const queue = (activities || []).map((activity: any) => {
      const sentDate = new Date(activity.created_at)
      const now = new Date()
      const daysSinceSent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24))

      // Determine recommended follow-up type
      let recommendedFollowUp = 'day_3'
      if (daysSinceSent >= 14) {
        recommendedFollowUp = 'day_14'
      } else if (daysSinceSent >= 7) {
        recommendedFollowUp = 'day_7'
      }

      return {
        ...activity,
        daysSinceSent,
        recommendedFollowUp,
      }
    })

    return NextResponse.json({
      queue,
      total: queue.length,
      requestId,
    })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}
