import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  generateRequestId,
  UnauthorizedError,
} from '@/lib/api/errors'
import { logger } from '@/lib/logger'

// Archive threshold: 21 days with no engagement
const ARCHIVE_THRESHOLD_DAYS = 21
const MIN_CONTACT_ATTEMPTS = 3

// ============================================
// POST /api/cron/auto-archive - Auto-archive non-responsive leads
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

    logger.info('Starting auto-archive job', { requestId })

    const supabase = await createServerSupabaseClient()
    const orgId = process.env.ORGANIZATION_ID

    const now = new Date()
    const cutoffDate = new Date(now)
    cutoffDate.setDate(cutoffDate.getDate() - ARCHIVE_THRESHOLD_DAYS)

    const results = {
      processed: 0,
      archived: 0,
      skipped: 0,
      errors: 0,
    }

    // Find contacts that have:
    // - contact_count >= 3 (at least 3 attempts)
    // - last_contacted > 21 days ago
    // - response_status NOT in ('responded', 'engaged', 'qualified')
    const { data: contacts, error: contactsError } = await (supabase as any)
      .from('contacts')
      .select(`
        id,
        first_name,
        last_name,
        email,
        contact_count,
        response_status,
        last_contacted,
        company_id
      `)
      .eq('organization_id', orgId)
      .gte('contact_count', MIN_CONTACT_ATTEMPTS)
      .lt('last_contacted', cutoffDate.toISOString())
      .not('response_status', 'in', '(responded,engaged,qualified)')
      .limit(100)

    if (contactsError) {
      logger.error('Failed to fetch contacts for archiving', {
        requestId,
        error: contactsError.message,
      })
      throw contactsError
    }

    if (!contacts || contacts.length === 0) {
      logger.info('No contacts to archive', { requestId })
      return NextResponse.json({
        success: true,
        message: 'No contacts to archive',
        results,
        requestId,
      })
    }

    results.processed = contacts.length

    // Get all activities for these contacts to verify no opens
    const contactIds = contacts.map((c: any) => c.id)

    const { data: activities } = await (supabase as any)
      .from('outreach_activities')
      .select('contact_id, status, opened_at, clicked_at')
      .in('contact_id', contactIds)
      .eq('activity_type', 'email')

    // Build a map of contacts that have any engagement
    const engagedContacts = new Set<string>()
    if (activities) {
      for (const activity of activities) {
        if (
          activity.opened_at ||
          activity.clicked_at ||
          activity.status === 'opened' ||
          activity.status === 'clicked' ||
          activity.status === 'replied'
        ) {
          engagedContacts.add(activity.contact_id)
        }
      }
    }

    // Archive contacts that have no engagement
    for (const contact of contacts) {
      if (engagedContacts.has(contact.id)) {
        results.skipped++
        continue
      }

      try {
        // Update contact to no_response
        await (supabase as any)
          .from('contacts')
          .update({
            response_status: 'no_response',
          })
          .eq('id', contact.id)

        // Find and archive associated projects
        const { data: stakeholders } = await (supabase as any)
          .from('project_stakeholders')
          .select('project_id')
          .eq('contact_id', contact.id)

        if (stakeholders && stakeholders.length > 0) {
          const projectIds = stakeholders.map((s: any) => s.project_id)

          // Check if project has any other engaged contacts
          for (const projectId of projectIds) {
            const { data: projectStakeholders } = await (supabase as any)
              .from('project_stakeholders')
              .select(`
                contact:contacts(response_status)
              `)
              .eq('project_id', projectId)
              .not('contact_id', 'eq', contact.id)

            const hasEngagedContact = projectStakeholders?.some(
              (ps: any) =>
                ps.contact?.response_status &&
                ['responded', 'engaged', 'qualified'].includes(ps.contact.response_status)
            )

            // Only archive project if no other engaged contacts
            if (!hasEngagedContact) {
              await (supabase as any)
                .from('high_priority_projects')
                .update({
                  outreach_status: 'not_interested',
                  status: 'archived',
                })
                .eq('id', projectId)
                .in('outreach_status', ['new', 'contacted', 'warm'])
            }
          }
        }

        results.archived++
      } catch (error) {
        logger.error('Failed to archive contact', {
          requestId,
          contactId: contact.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        results.errors++
      }
    }

    logger.info('Auto-archive job completed', {
      requestId,
      results,
    })

    return NextResponse.json({
      success: true,
      message: `Archived ${results.archived} non-responsive contacts`,
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
    name: 'Auto-Archive Cron Job',
    description: `Automatically archives leads with ${MIN_CONTACT_ATTEMPTS}+ contact attempts and no engagement after ${ARCHIVE_THRESHOLD_DAYS} days`,
    threshold: {
      days: ARCHIVE_THRESHOLD_DAYS,
      minAttempts: MIN_CONTACT_ATTEMPTS,
    },
    status: 'ready',
  })
}
