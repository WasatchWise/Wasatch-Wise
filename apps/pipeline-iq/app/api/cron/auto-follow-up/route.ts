import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  generateRequestId,
  UnauthorizedError,
} from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import { sendEmailWithSendGrid } from '@/lib/utils/sendgrid'
import { wrapEmailInHtml } from '@/lib/groove/email-html'

// Signature config — must match groove_send.py SIGNATURE dict
const FOLLOW_UP_SIGNATURE = {
  name: 'Mike Sartain',
  title: 'National Sales Executive',
  company: 'Groove Technology Solutions',
  phone: '801-396-6534',
  email: 'msartain@getgrooven.com',
  website: 'getgrooven.com',
}

// Follow-up schedule: day 3, day 7, day 14
const FOLLOW_UP_SCHEDULE = [
  { day: 3, type: 'day_3' },
  { day: 7, type: 'day_7' },
  { day: 14, type: 'day_14' },
]

// Follow-up subject line templates
const FOLLOW_UP_SUBJECTS = {
  day_3: 'Re: Quick question about {projectName}',
  day_7: 'One more thought about {projectName}',
  day_14: 'Closing the loop - {projectName}',
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
}

// ============================================
// POST /api/cron/auto-follow-up - Automated follow-up job
// ============================================

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      throw new UnauthorizedError('Invalid cron secret')
    }

    logger.info('Starting auto follow-up job', { requestId })

    const supabase = await createServerSupabaseClient()
    const orgId = process.env.ORGANIZATION_ID

    const now = new Date()
    const results = {
      day_3: { processed: 0, sent: 0, errors: 0 },
      day_7: { processed: 0, sent: 0, errors: 0 },
      day_14: { processed: 0, sent: 0, errors: 0 },
    }

    // Process each follow-up tier
    for (const schedule of FOLLOW_UP_SCHEDULE) {
      const cutoffDate = new Date(now)
      cutoffDate.setDate(cutoffDate.getDate() - schedule.day)

      // Get the day before for the range
      const dayBefore = new Date(cutoffDate)
      dayBefore.setDate(dayBefore.getDate() - 1)

      // Get activities that are exactly at this day mark
      // Only get activities that haven't been opened and haven't had follow-ups
      const { data: activities, error } = await (supabase as any)
        .from('outreach_activities')
        .select(`
          id,
          status,
          created_at,
          contact_id,
          project_id,
          metadata,
          contact:contacts(
            id,
            first_name,
            last_name,
            email,
            contact_count
          ),
          project:high_priority_projects(
            id,
            project_name,
            city,
            state,
            outreach_status
          )
        `)
        .eq('organization_id', orgId)
        .eq('activity_type', 'email')
        .in('status', ['sent', 'delivered'])
        .is('opened_at', null)
        .gte('created_at', dayBefore.toISOString())
        .lt('created_at', cutoffDate.toISOString())
        .limit(50)

      if (error) {
        logger.warn(`Failed to fetch ${schedule.type} follow-ups`, {
          requestId,
          error: error.message,
        })
        continue
      }

      if (!activities || activities.length === 0) {
        continue
      }

      // Filter out activities that already have follow-ups at this tier
      const eligibleActivities = []
      for (const activity of activities) {
        // Check if a follow-up was already sent for this tier
        const { data: existingFollowUp } = await (supabase as any)
          .from('outreach_activities')
          .select('id')
          .eq('contact_id', activity.contact_id)
          .eq('project_id', activity.project_id)
          .contains('metadata', { followUpType: schedule.type })
          .single()

        if (!existingFollowUp) {
          eligibleActivities.push(activity)
        }
      }

      results[schedule.type as keyof typeof results].processed = eligibleActivities.length

      // Send follow-ups
      for (const activity of eligibleActivities) {
        const contact = activity.contact
        const project = activity.project

        // Skip if project is already archived or closed
        if (project?.outreach_status === 'archived' || project?.outreach_status === 'closed') {
          continue
        }

        if (!contact?.email) {
          results[schedule.type as keyof typeof results].errors++
          continue
        }

        try {
          const firstName = contact.first_name || 'there'
          const projectName = project?.project_name || 'your project'

          const subject = FOLLOW_UP_SUBJECTS[schedule.type as keyof typeof FOLLOW_UP_SUBJECTS]
            .replace('{projectName}', projectName)

          const message = FOLLOW_UP_MESSAGES[schedule.type as keyof typeof FOLLOW_UP_MESSAGES]
            .replace(/{firstName}/g, firstName)
            .replace(/{projectName}/g, projectName)

          // Use the branded Groove template (same as groove_send.py)
          // DO NOT replace with bare inline HTML — see PREFLIGHT.md Golden Rule
          const bodyHtml = message
            .split('\n\n')
            .filter(p => p.trim() && !p.startsWith('Best,') && !p.startsWith('Cheers,') && !p.startsWith('Wishing'))
            .map(p => `<p style="margin-bottom: 12px;">${p.replace(/\n/g, '<br>')}</p>`)
            .join('')
          const htmlContent = wrapEmailInHtml(bodyHtml, FOLLOW_UP_SIGNATURE)

          const success = await sendEmailWithSendGrid({
            to: contact.email,
            subject,
            html: htmlContent,
            text: message,
          })

          if (success) {
            // Create follow-up activity record
            await (supabase as any)
              .from('outreach_activities')
              .insert({
                organization_id: orgId,
                contact_id: contact.id,
                project_id: project?.id || null,
                activity_type: 'email',
                status: 'sent',
                activity_date: new Date().toISOString(),
                metadata: {
                  followUpType: schedule.type,
                  originalActivityId: activity.id,
                  automated: true,
                  subject,
                },
              })

            // Update contact's contact_count
            await (supabase as any)
              .from('contacts')
              .update({
                contact_count: (contact.contact_count || 0) + 1,
                last_contacted: new Date().toISOString(),
              })
              .eq('id', contact.id)

            results[schedule.type as keyof typeof results].sent++
          } else {
            results[schedule.type as keyof typeof results].errors++
          }
        } catch (error) {
          logger.error(`Failed to send ${schedule.type} follow-up`, {
            requestId,
            activityId: activity.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          results[schedule.type as keyof typeof results].errors++
        }
      }
    }

    const totalSent = results.day_3.sent + results.day_7.sent + results.day_14.sent
    const totalErrors = results.day_3.errors + results.day_7.errors + results.day_14.errors

    logger.info('Auto follow-up job completed', {
      requestId,
      results,
      totalSent,
      totalErrors,
    })

    return NextResponse.json({
      success: true,
      message: `Sent ${totalSent} follow-up emails`,
      results,
      requestId,
    })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// GET endpoint for status check
export async function GET() {
  return NextResponse.json({
    name: 'Auto Follow-Up Cron Job',
    description: 'Automatically sends follow-up emails on day 3, 7, and 14 for unopened emails',
    schedule: FOLLOW_UP_SCHEDULE,
    status: 'ready',
  })
}
