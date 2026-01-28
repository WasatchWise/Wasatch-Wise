import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'
import { getOrganizationConfig, getEmailSignature } from '@/lib/config/organization'
import { sendEmailWithSendGrid } from '@/lib/utils/sendgrid'

const WARM_CALL_AUTO_SEND = (process.env.WARM_CALL_AUTO_SEND || 'false') === 'true'
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY
const MAX_CONTACTS_PER_RUN = Number(process.env.AUTO_OUTREACH_MAX_CONTACTS || 1000)
const AUTO_OUTREACH_COOLDOWN_DAYS = Number(process.env.AUTO_OUTREACH_COOLDOWN_DAYS || 7)
const AUTO_OUTREACH_OVERRIDE_DATE = process.env.AUTO_OUTREACH_OVERRIDE_DATE
const AUTO_OUTREACH_OVERRIDE_HOUR_UTC = process.env.AUTO_OUTREACH_OVERRIDE_HOUR_UTC
const AUTO_OUTREACH_OVERRIDE_ENABLED = (process.env.AUTO_OUTREACH_OVERRIDE_ENABLED || 'false') === 'true'

function isOverrideWindow(): boolean {
  if (!AUTO_OUTREACH_OVERRIDE_ENABLED || !AUTO_OUTREACH_OVERRIDE_DATE || !AUTO_OUTREACH_OVERRIDE_HOUR_UTC) {
    return false
  }

  const now = new Date()
  const [year, month, day] = AUTO_OUTREACH_OVERRIDE_DATE.split('-').map(Number)
  if (!year || !month || !day) return false
  const overrideHour = Number(AUTO_OUTREACH_OVERRIDE_HOUR_UTC)
  if (Number.isNaN(overrideHour)) return false

  return (
    now.getUTCFullYear() === year &&
    now.getUTCMonth() + 1 === month &&
    now.getUTCDate() === day &&
    now.getUTCHours() === overrideHour
  )
}

/**
 * POST /api/cron/auto-outreach - Automated initial outreach to new leads
 * Runs daily at 16:00 UTC to send initial emails to new contacts
 *
 * Cron schedule: 0 16 * * * (daily at 16:00 UTC / 9 AM MST)
 */
export async function POST(request: NextRequest) {
  const requestId = `cron_outreach_${Date.now()}`

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron outreach attempt', { requestId })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('Starting automated outreach (Warm Call NEPQ)', { requestId, autoSend: WARM_CALL_AUTO_SEND })

    const supabase = createServiceSupabaseClient()
    const organizationId = process.env.ORGANIZATION_ID

    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'Organization ID not configured',
        requestId,
      }, { status: 500 })
    }

    // Get organization config (email is sent by warm-call workflow; config may be used later for reporting)
    await getOrganizationConfig(organizationId)

    // Find contacts that:
    // 1. Have email addresses
    // This is intentionally broad to maximize outreach volume.
    const { data: eligibleContacts, error: contactsError } = await supabase
      .from('contacts')
      .select(`
        *,
        project_stakeholders (
          project_id,
          is_primary
        )
      `)
      .not('email', 'is', null)
      .eq('organization_id', organizationId)
      .limit(MAX_CONTACTS_PER_RUN) // Default 500; adjustable via AUTO_OUTREACH_MAX_CONTACTS

    if (contactsError) {
      logger.error('Failed to fetch eligible contacts', { requestId, error: contactsError.message })
      return NextResponse.json({
        success: false,
        error: contactsError.message,
        requestId,
      }, { status: 500 })
    }

    if (!eligibleContacts || eligibleContacts.length === 0) {
      logger.info('No eligible contacts for outreach', { requestId })
      return NextResponse.json({
        success: true,
        message: 'No eligible contacts for outreach',
        sent: 0,
        requestId,
      })
    }

    // Build a contact -> project lookup (prefer primary), only for valid projects
    const { data: orgProjects, error: projectsError } = await supabase
      .from('high_priority_projects')
      .select('id')
      .eq('organization_id', organizationId)

    if (projectsError) {
      logger.error('Failed to fetch projects for outreach', { requestId, error: projectsError.message })
      return NextResponse.json({
        success: false,
        error: projectsError.message,
        requestId,
      }, { status: 500 })
    }

    const validProjectIds = new Set((orgProjects || []).map(p => p.id))

    const contactProjectMap = new Map<string, string>()
    for (const contact of eligibleContacts) {
      const stakeholders = contact.project_stakeholders || []
      const primary = stakeholders.find((ps: any) => ps.is_primary)
      const projectId = primary?.project_id || stakeholders[0]?.project_id || null
      if (projectId && validProjectIds.has(projectId)) {
        contactProjectMap.set(contact.id, projectId)
      }
    }

    const overrideRun = isOverrideWindow()
    const cutoffDate = new Date(Date.now() - AUTO_OUTREACH_COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
    const recentActivityContactIds = new Set<string>()
    const contactIds = eligibleContacts.map(contact => contact.id)
    const chunkSize = 200

    if (!overrideRun) {
      for (let i = 0; i < contactIds.length; i += chunkSize) {
        const chunk = contactIds.slice(i, i + chunkSize)
        const { data: recentActivities, error: recentError } = await supabase
          .from('outreach_activities')
          .select('contact_id')
          .in('contact_id', chunk)
          .eq('organization_id', organizationId)
          .eq('activity_type', 'email')
          .gte('created_at', cutoffDate.toISOString())

        if (recentError) {
          logger.error('Failed to fetch recent outreach activity', {
            requestId,
            error: recentError.message,
          })
          return NextResponse.json({
            success: false,
            error: recentError.message,
            requestId,
          }, { status: 500 })
        }

        for (const activity of recentActivities || []) {
          if (activity.contact_id) {
            recentActivityContactIds.add(activity.contact_id)
          }
        }
      }
    }

    // Track results
    let sent = 0
    let failed = 0
    const results: any[] = []

    const warmCallUrl = `${request.nextUrl.origin}/api/workflows/warm-call/trigger`

    const orgConfig = await getOrganizationConfig(organizationId)
    const senderName = orgConfig.email?.senderName || 'Groove'
    const companyName = orgConfig.branding?.companyName || 'Groove'
    const brandColor = orgConfig.branding?.primaryColor || '#0082CA'
    const senderEmail =
      orgConfig.email?.senderEmail ||
      process.env.SENDGRID_FROM_EMAIL ||
      'noreply@pipelineiq.net'
    const replyToEmail =
      orgConfig.email?.replyToEmail ||
      orgConfig.email?.senderEmail ||
      senderEmail
    const signature = getEmailSignature(orgConfig)
    const signatureEmail = orgConfig.email?.signature?.email || replyToEmail
    const signaturePhone = orgConfig.email?.signature?.phone
    const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pipelineiq.net'
    const overviewLink =
      process.env.GROOVE_45_SECONDS_LINK || `${baseAppUrl}/groove-in-45-seconds`

    // Process each contact
    for (const contact of eligibleContacts) {
      if (!contact.email) {
        continue
      }

      const contactName = `${contact.first_name} ${contact.last_name}`
      const contactProjectId = contactProjectMap.get(contact.id) || null
      const lastContacted = contact.last_contacted ? new Date(contact.last_contacted) : null

      if (!overrideRun) {
        if (contact.contact_count && contact.contact_count > 0) {
          continue
        }

        if (lastContacted && lastContacted >= cutoffDate) {
          continue
        }

        if (recentActivityContactIds.has(contact.id)) {
          continue
        }
      }

      try {
        if (contactProjectId) {
          // Trigger Warm Call workflow (NEPQ email generation + optional auto-send)
          const warmCallResp = await fetch(warmCallUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(INTERNAL_API_KEY ? { Authorization: `Bearer ${INTERNAL_API_KEY}` } : {}),
            },
            body: JSON.stringify({
              projectId: contactProjectId,
              contactId: contact.id,
              autoSend: WARM_CALL_AUTO_SEND,
            }),
          })

          const warmCallJson = await warmCallResp.json().catch(() => ({} as any))

          if (!warmCallResp.ok || !warmCallJson?.success) {
            throw new Error(warmCallJson?.message || warmCallJson?.error || 'Warm call workflow failed')
          }

          sent++
          results.push({
            contact_id: contact.id,
            contact_name: contactName,
            project_id: contactProjectId,
            status: 'sent',
            workflow: 'warm-call',
            autoSent: WARM_CALL_AUTO_SEND,
            activityId: warmCallJson?.phases?.email?.activityId || null,
          })
        } else {
          // Generic outreach for contacts without project linkage
          const subject = `Quick question, ${contact.first_name || ''}`.trim() || 'Quick question'
          const trackedLink = `${overviewLink}${overviewLink.includes('?') ? '&' : '?'}src=auto-outreach&cid=${contact.id}`
          const contactLine = `Reply to this email or reach me at ${signatureEmail}${signaturePhone ? ` / ${signaturePhone}` : ''}.`
          const bodyText = `Hi ${contact.first_name || 'there'},\n\nQuick question — are you involved in any upcoming hotel, multifamily, or senior living projects where technology infrastructure (WiFi, TV, phone) is being planned?\n\nWe help teams consolidate vendors and cut costs while improving reliability. If it makes sense, I can share a quick overview:\n${trackedLink}\n\n${contactLine}\n\nBest,\n${senderName}\n${companyName}`
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <p style="margin: 0 0 16px 0;">Hi ${contact.first_name || 'there'},</p>
              <p style="margin: 0 0 16px 0;">Quick question — are you involved in any upcoming hotel, multifamily, or senior living projects where technology infrastructure (WiFi, TV, phone) is being planned?</p>
              <p style="margin: 0 0 16px 0;">We help teams consolidate vendors and cut costs while improving reliability. If it makes sense, I can share a quick overview:</p>
              <div style="margin: 16px 0 20px 0;">
                <a href="${trackedLink}" target="_blank" style="display: inline-block; padding: 12px 22px; border-radius: 6px; background-color: ${brandColor}; color: #ffffff; text-decoration: none; font-weight: 600;">
                  ▶ View Groove Overview
                </a>
              </div>
              <p style="margin: 0 0 16px 0;">Reply to this email or reach me at ${signatureEmail}${signaturePhone ? ` / ${signaturePhone}` : ''}.</p>
              <p style="margin: 0 0 16px 0;">Best,<br>${senderName}<br>${companyName}</p>
              ${signature}
            </div>
          `

          // Create outreach activity for tracking
          const fullPayload = {
            organization_id: organizationId,
            project_id: null,
            contact_id: contact.id,
            activity_type: 'email',
            subject,
            message_body: bodyText,
            status: WARM_CALL_AUTO_SEND ? 'sent' : 'draft',
            metadata: { workflow: 'auto-outreach', generic: true },
          }

          let activity: any = null
          let activityError: any = null

          ;({ data: activity, error: activityError } = await supabase
            .from('outreach_activities')
            .insert(fullPayload)
            .select('id')
            .single())

          if (activityError) {
            const minimalPayload = {
              organization_id: organizationId,
              project_id: null,
              contact_id: contact.id,
              activity_type: 'email',
              status: WARM_CALL_AUTO_SEND ? 'sent' : 'draft',
            }

            const { data: retryActivity, error: retryError } = await supabase
              .from('outreach_activities')
              .insert(minimalPayload)
              .select('id')
              .single()

            if (retryError) {
              throw new Error(retryError.message || 'Failed to create outreach activity')
            }

            activity = retryActivity
          }

          if (WARM_CALL_AUTO_SEND) {
            const sentOk = await sendEmailWithSendGrid({
              to: contact.email,
              subject,
              html: htmlContent,
              from: { email: senderEmail, name: `${senderName} - ${companyName}` },
              replyTo: { email: replyToEmail, name: senderName },
              customArgs: {
                activity_id: activity.id,
                contact_id: contact.id,
                workflow: 'auto-outreach',
              },
              categories: ['auto-outreach'],
            })

            if (!sentOk) {
              throw new Error('SendGrid send failed')
            }
          }

          // Update contact engagement for generic outreach
          if (WARM_CALL_AUTO_SEND) {
            await supabase
              .from('contacts')
              .update({
                contact_count: (contact.contact_count || 0) + 1,
                last_contacted: new Date().toISOString(),
                response_status: 'contacted',
              })
              .eq('id', contact.id)
          }

          sent++
          results.push({
            contact_id: contact.id,
            contact_name: contactName,
            project_id: null,
            status: 'sent',
            workflow: 'auto-outreach-generic',
            autoSent: WARM_CALL_AUTO_SEND,
            activityId: activity.id,
          })
        }

        logger.debug('Auto-outreach email sent', {
          requestId,
          contactId: contact.id,
          projectId: contactProjectId,
        })

      } catch (error: any) {
        failed++
        results.push({
          contact_id: contact.id,
          contact_name: contactName,
          status: 'failed',
          error: error.message,
        })

        logger.error('Auto-outreach email failed', {
          requestId,
          contactId: contact.id,
          error: error.message,
        })
      }
    }

    logger.info('Auto-outreach completed', {
      requestId,
      sent,
      failed,
      total: eligibleContacts.length,
      overrideRun,
    })

    return NextResponse.json({
      success: true,
      message: 'Auto-outreach completed',
      sent,
      failed,
      total: eligibleContacts.length,
      results,
      requestId,
      overrideRun,
    })

  } catch (error: any) {
    logger.error('Cron outreach error', { requestId, error: error.message })
    return NextResponse.json({
      success: false,
      error: error.message,
      requestId,
    }, { status: 500 })
  }
}

// GET endpoint for status
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/cron/auto-outreach',
    description: 'Automated initial outreach to new leads (Warm Call NEPQ workflow)',
    schedule: '0 16 * * * (daily at 16:00 UTC)',
    method: 'POST',
    auth: 'Bearer CRON_SECRET required',
    limits: {
      maxContactsPerRun: MAX_CONTACTS_PER_RUN,
      cooldownDays: AUTO_OUTREACH_COOLDOWN_DAYS,
      overrideDate: AUTO_OUTREACH_OVERRIDE_DATE || null,
      overrideHourUtc: AUTO_OUTREACH_OVERRIDE_HOUR_UTC || null,
      overrideEnabled: AUTO_OUTREACH_OVERRIDE_ENABLED,
      priorityLevels: 'all',
      projectStatuses: 'all',
    }
  })
}
