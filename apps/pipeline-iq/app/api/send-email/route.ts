import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import * as sgMail from '@sendgrid/mail'
import { sendEmailSchema, validateRequest } from '@/lib/api/validation'
import {
  createErrorResponse,
  generateRequestId,
  ValidationError,
  NotFoundError,
} from '@/lib/api/errors'
import { emailRateLimit, getRateLimitHeaders, getClientIp } from '@/lib/api/rate-limit'
import { logger, createTimer } from '@/lib/logger'
import { getOrganizationConfig, getEmailSignature } from '@/lib/config/organization'

function maskEmail(email: string | null | undefined) {
  if (!email) return null
  const at = email.indexOf('@')
  if (at <= 1) return '***'
  return `${email.slice(0, 1)}***${email.slice(at)}`
}

function getVerifiedSenderEmail(orgConfig: any) {
  // Prefer explicit SendGrid From env (should be a verified Sender Identity / domain)
  return (
    process.env.SENDGRID_FROM_EMAIL ||
    orgConfig?.email?.senderEmail ||
    orgConfig?.email?.replyToEmail ||
    process.env.GMAIL_USER ||
    'noreply@pipelineiq.net'
  )
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

// ============================================
// POST /api/send-email - Send email to contact(s)
// ============================================

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const timer = createTimer()
  try {
    // Check if email is configured (SendGrid or Gmail)
    if (!SENDGRID_API_KEY && !process.env.GMAIL_USER) {
      logger.warn('Email sending attempted but not configured', { requestId })
      return NextResponse.json(
        {
          error: 'Email sending is not configured',
          message: 'Please configure SENDGRID_API_KEY or GMAIL credentials',
          requestId,
        },
        { status: 503 }
      )
    }

    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimitResult = emailRateLimit(clientIp)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Email sending is limited to 50 emails per minute',
          retryAfter: rateLimitResult.retryAfter,
          requestId,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new ValidationError('Invalid JSON in request body')
    }

    const validation = validateRequest(sendEmailSchema, body)

    if (!validation.success) {
      throw new ValidationError(validation.error, validation.details)
    }

    const { contactIds, subject, message, projectId } = validation.data

    logger.info('Sending emails', {
      requestId,
      contactCount: contactIds.length,
      hasProject: !!projectId,
    })

    const supabase = await createServerSupabaseClient()
    const organizationId = process.env.ORGANIZATION_ID

    if (!organizationId) {
      throw new ValidationError('Organization ID not configured')
    }

    // Get organization config for email signature
    const orgConfig = await getOrganizationConfig(organizationId)

    // Get contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .in('id', contactIds)

    if (contactsError) {
      logger.error('Failed to fetch contacts', { requestId, error: contactsError.message })
      throw contactsError
    }

    if (!contacts || contacts.length === 0) {
      throw new NotFoundError('Contacts')
    }

    timer.log('Contacts fetched', { count: contacts.length })

    // Get sender email (from org config or env)
    const senderEmail = getVerifiedSenderEmail(orgConfig)

    // Track results
    const results: Array<{
      contact_id: string
      contact_name: string
      email?: string
      status: 'sent' | 'failed'
      error?: string
      activity_id?: string | null
    }> = []

    let sent = 0
    let failed = 0

    // Process each contact
    for (const contact of contacts) {
      const contactName = `${contact.first_name} ${contact.last_name}`

      // Validate email address
      if (!contact.email || !EMAIL_REGEX.test(contact.email)) {
        failed++
        results.push({
          contact_id: contact.id,
          contact_name: contactName,
          email: contact.email || undefined,
          status: 'failed',
          error: contact.email ? 'Invalid email format' : 'No email address',
        })
        logger.warn('Skipping contact with invalid email', {
          requestId,
          contactId: contact.id,
          email: maskEmail(contact.email),
        })
        continue
      }

      let activityId: string | null = null

      try {
        // Personalize message
        const personalizedMessage = message
          .replace(/\{\{first_name\}\}/g, contact.first_name || '')
          .replace(/\{\{last_name\}\}/g, contact.last_name || '')
          .replace(/\{\{full_name\}\}/g, contactName)
          .replace(/\{\{title\}\}/g, contact.title || '')

        const isHtmlDocument = /<!doctype html>|<html[\s>]/i.test(personalizedMessage)

        // Build email HTML
        const htmlContent = isHtmlDocument
          ? personalizedMessage
          : `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${personalizedMessage.replace(/\n/g, '<br>')}
              ${getEmailSignature(orgConfig)}
            </div>
          `

        const textContent = isHtmlDocument
          ? personalizedMessage.replace(/<[^>]*>/g, '').replace(/\s{2,}/g, ' ').trim()
          : personalizedMessage

        // Create an outreach activity FIRST so webhook tracking can match by id.
        // (Falls back to minimal columns if schema doesn't support extended fields.)
        try {
          const { data: activity, error: activityError } = await (supabase as any)
            .from('outreach_activities')
            .insert({
              organization_id: organizationId,
              contact_id: contact.id,
              project_id: projectId || null,
              activity_type: 'email',
              subject,
              message_body: personalizedMessage,
              status: 'sent',
              metadata: { manual: true, workflow: 'send-email' },
            })
            .select('id')
            .single()

          if (activityError) {
            const { data: retry, error: retryError } = await (supabase as any)
              .from('outreach_activities')
              .insert({
                organization_id: organizationId,
                contact_id: contact.id,
                project_id: projectId || null,
                activity_type: 'email',
                activity_date: new Date().toISOString(),
              })
              .select('id')
              .single()
            if (!retryError && retry?.id) activityId = retry.id
          } else if (activity?.id) {
            activityId = activity.id
          }
        } catch {
          // don't block sending if tracking insert fails
        }
        // Send email via SendGrid
        await sgMail.send({
          to: contact.email,
          from: {
            email: senderEmail,
            name: `${orgConfig.email.senderName} - ${orgConfig.branding.companyName}`
          },
          replyTo: orgConfig.email.replyToEmail,
          subject: subject,
          text: textContent,
          html: htmlContent,
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true }
          },
          // No PII here; enables webhook -> outreach_activities matching
          customArgs: activityId
            ? {
                activity_id: activityId,
                queue_id: activityId,
                contact_id: contact.id,
                project_id: projectId || '',
                workflow: 'send-email',
              }
            : {
                contact_id: contact.id,
                project_id: projectId || '',
                workflow: 'send-email',
              },
        })

        // Log activity - use a separate try/catch to not fail the whole operation
        try {
          // Avoid double-insert if we already created the activity above.
          if (!activityId) {
            await supabase.from('outreach_activities').insert({
              organization_id: organizationId,
              contact_id: contact.id,
              project_id: projectId || null,
              activity_type: 'email',
              activity_date: new Date().toISOString(),
            })
          }

          // Update contact - use atomic increment via RPC or raw SQL if available
          // For now, we fetch and update (with a warning about race conditions)
          await supabase
            .from('contacts')
            .update({
              contact_count: (contact.contact_count || 0) + 1,
              last_contacted: new Date().toISOString(),
              response_status: 'contacted',
            })
            .eq('id', contact.id)
        } catch (dbError) {
          // Log but don't fail - email was sent successfully
          logger.warn('Failed to log email activity', {
            requestId,
            contactId: contact.id,
            error: dbError instanceof Error ? dbError.message : 'Unknown error',
          })
        }

        sent++
        results.push({
          contact_id: contact.id,
          contact_name: contactName,
          email: contact.email,
          status: 'sent',
          activity_id: activityId || undefined,
        })

        logger.debug('Email sent successfully', {
          requestId,
          contactId: contact.id,
          email: maskEmail(contact.email),
        })
      } catch (error) {
        failed++
        const anyErr = error as any
        const statusCode =
          anyErr?.code || anyErr?.statusCode || anyErr?.response?.statusCode || anyErr?.response?.status || null
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const isForbidden =
          statusCode === 403 || (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('forbidden'))
        const friendlyError = isForbidden
          ? 'SendGrid rejected the request (403). Verify your SendGrid Sender Identity / authenticated domain and set a verified From address (SENDGRID_FROM_EMAIL).'
          : errorMessage
        results.push({
          contact_id: contact.id,
          contact_name: contactName,
          email: contact.email,
          status: 'failed',
          error: friendlyError,
          activity_id: activityId || undefined,
        })

        logger.error('Failed to send email', {
          requestId,
          contactId: contact.id,
          email: maskEmail(contact.email),
          error: errorMessage,
          statusCode,
          isForbidden,
        })
      }
    }

    timer.log('Emails processed', { sent, failed })

    logger.info('Email batch complete', {
      requestId,
      sent,
      failed,
      total: contacts.length,
    })

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: contacts.length,
      results,
      requestId,
    })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// GET /api/send-email - Get email templates
// ============================================

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    // Get organization config for personalized templates
    const organizationId = process.env.ORGANIZATION_ID
    const orgConfig = organizationId
      ? await getOrganizationConfig(organizationId)
      : null

    const companyName = orgConfig?.branding.companyName || 'Our Company'
    const services = orgConfig?.sales.services.join(', ') || 'our services'
    const senderName = orgConfig?.email.signature.name || 'Sales Team'

    const templates = [
      {
        id: 'intro',
        name: 'Introduction',
        subject: 'Quick question about {{project_name}}',
        message: `Hi {{first_name}},

I noticed your project {{project_name}} in {{city}}, {{state}} and wanted to reach out.

At ${companyName}, we specialize in providing ${services} specifically for hotels, multifamily, and senior living projects.

We've helped similar projects in your area reduce costs by 20-30% while improving reliability.

Would you be open to a quick 15-minute call to see if we might be a fit?

Best,
${senderName}
${companyName}`,
      },
      {
        id: 'follow_up',
        name: 'Follow Up',
        subject: 'Following up - {{project_name}}',
        message: `Hi {{first_name}},

Just wanted to follow up on my previous email about {{project_name}}.

I'd love to show you how we've helped similar {{project_type}} projects save money and improve their technology infrastructure.

Do you have 15 minutes this week for a quick call?

Thanks,
${senderName}`,
      },
      {
        id: 'value_prop',
        name: 'Value Proposition',
        subject: 'Save 20-30% on technology for {{project_name}}',
        message: `Hi {{first_name}},

Quick question: Have you already selected vendors for WiFi, TV, and phone systems for {{project_name}}?

We've worked with several {{project_type}} projects in {{state}} and consistently help them:

• Save 20-30% on technology costs
• Improve reliability and guest satisfaction
• Simplify vendor management (one point of contact)
• Future-proof their infrastructure

Would it make sense to hop on a quick call?

Best,
${senderName}
${companyName}`,
      },
    ]

    return NextResponse.json({ templates, requestId })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}
