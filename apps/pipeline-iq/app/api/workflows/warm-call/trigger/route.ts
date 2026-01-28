/**
 * Warm Call Workflow Trigger
 * Main orchestration endpoint for the post-scrape warm call workflow
 * 
 * POST /api/workflows/warm-call/trigger
 * 
 * This endpoint is called automatically when a high-score property is identified
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { logger, createTimer } from '@/lib/logger'
import { generateRequestId } from '@/lib/api/errors'
import { classifyPropertyVertical } from '@/lib/workflows/warm-call/vertical-classifier'
import { generateNEPQEmail } from '@/lib/workflows/warm-call/nepq-email-generator'
import * as sgMail from '@sendgrid/mail'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

function buildTrackedAssetLink(options: {
  baseLink: string
  activityId?: string | null
  contactId?: string | null
  projectId?: string | null
  vertical?: string | null
  source?: string
}) {
  const { baseLink, activityId, contactId, projectId, vertical, source } = options
  try {
    const url = new URL(baseLink)
    if (activityId) url.searchParams.set('aid', activityId)
    if (contactId) url.searchParams.set('cid', contactId)
    if (projectId) url.searchParams.set('pid', projectId)
    if (vertical) url.searchParams.set('vertical', vertical)
    url.searchParams.set('src', source || 'warm-call')
    return url.toString()
  } catch {
    return baseLink
  }
}

function replaceAllLinks(content: string, fromLink: string, toLink: string): string {
  if (!content || !fromLink || fromLink === toLink) return content
  return content.split(fromLink).join(toLink)
}

interface WarmCallTriggerRequest {
  projectId: string
  contactId?: string // Optional - if provided, send immediately. Otherwise, find/create contact
  autoSend?: boolean // If false, generate draft only
}

/**
 * POST /api/workflows/warm-call/trigger
 * Trigger the warm call workflow for a high-score property
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const timer = createTimer()

  try {
    // Optional internal auth gate (recommended in production)
    const internalKey = process.env.INTERNAL_API_KEY
    if (internalKey) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${internalKey}`) {
        return NextResponse.json(
          { error: 'Unauthorized', requestId },
          { status: 401 }
        )
      }
    }

    const body: WarmCallTriggerRequest = await request.json()
    const { projectId, contactId, autoSend = false } = body

    logger.info('Warm call workflow triggered', { requestId, projectId, contactId, autoSend })

    // Use service role for automation reliability (bypasses RLS)
    const supabase = createServiceSupabaseClient()
    const organizationId = process.env.ORGANIZATION_ID

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID not configured', requestId },
        { status: 500 }
      )
    }

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('high_priority_projects')
      .select('*')
      .eq('id', projectId)
      .eq('organization_id', organizationId)
      .single()

    if (projectError || !project) {
      logger.error('Project not found', { requestId, projectId, error: projectError })
      return NextResponse.json(
        { error: 'Project not found', requestId },
        { status: 404 }
      )
    }

    timer.log('Project fetched', { projectName: project.project_name })

    // Phase 1: Contextual Classification
    const classification = classifyPropertyVertical(
      project.project_type || [],
      project.project_stage || undefined,
      project.project_value || undefined,
      project.units_count || undefined
    )

    logger.info('Property classified', {
      requestId,
      vertical: classification.vertical,
      painPoints: classification.painPoints,
    })

    timer.log('Classification complete')

    // Find or create contact
    let contact
    if (contactId) {
      const { data: existingContact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .eq('organization_id', organizationId)
        .single()

      if (contactError || !existingContact) {
        return NextResponse.json(
          { error: 'Contact not found', requestId },
          { status: 404 }
        )
      }
      contact = existingContact
    } else {
      // Find primary contact for this project
      const { data: stakeholders } = await supabase
        .from('project_stakeholders')
        .select('contact_id, contacts(*)')
        .eq('project_id', projectId)
        .eq('is_primary', true)
        .limit(1)
        .single()

      if (stakeholders && 'contacts' in stakeholders && stakeholders.contacts) {
        contact = Array.isArray(stakeholders.contacts) ? stakeholders.contacts[0] : stakeholders.contacts
      } else {
        // No contact found - workflow cannot continue
        return NextResponse.json(
          {
            error: 'No contact found for project',
            message: 'Please add a contact to the project first',
            requestId,
          },
          { status: 400 }
        )
      }
    }

    if (!contact || !contact.email) {
      return NextResponse.json(
        { error: 'Contact email required', requestId },
        { status: 400 }
      )
    }

    timer.log('Contact identified', { contactEmail: contact.email })

    // Phase 2: NEPQ Email Generation
    const projectContext = {
      projectName: project.project_name,
      projectTypes: project.project_type || [],
      projectStage: project.project_stage || '',
      projectValue: project.project_value || undefined,
      unitsCount: project.units_count || undefined,
      city: project.city || undefined,
      state: project.state || undefined,
      estimatedCompletionDate: project.estimated_completion_date || undefined,
    }

    const contactContext = {
      firstName: contact.first_name || '',
      lastName: contact.last_name || undefined,
      title: contact.title || undefined,
      email: contact.email,
      company: undefined, // Could fetch from companies table
    }

    let emailPayload = await generateNEPQEmail(
      projectContext,
      contactContext,
      classification,
      organizationId
    )

    timer.log('Email generated', { subject: emailPayload.subject })

    // Store email in database (outreach_activities)
    let emailActivity: any = null
    let activityError: any = null

    const activityPayload = {
      organization_id: organizationId,
      project_id: projectId,
      contact_id: contact.id,
      activity_type: 'email',
      subject: emailPayload.subject,
      message_body: emailPayload.body,
      status: autoSend ? 'sent' : 'draft',
      metadata: {
        workflow: 'warm-call',
        // Back-compat + convenience fields for webhook consumers
        vertical: classification.vertical,
        painPoints: classification.painPoints,
        painPoint: classification.painPoints?.[0] || null,
        grooveVertical: classification.grooveVertical,
        grooveBundle: classification.grooveBundle,
        verticalClassification: classification,
        assetLink: emailPayload.assetLink,
        classification: classification,
      },
    }

    ;({ data: emailActivity, error: activityError } = await supabase
      .from('outreach_activities')
      .insert(activityPayload)
      .select()
      .single())

    if (activityError) {
      logger.error('Failed to create email activity (full payload)', {
        requestId,
        error: activityError,
      })

      // Retry with minimal fields for older schemas.
      const minimalPayload = {
        organization_id: organizationId,
        project_id: projectId,
        contact_id: contact.id,
        activity_type: 'email',
        status: autoSend ? 'sent' : 'draft',
      }

      const { data: retryActivity, error: retryError } = await supabase
        .from('outreach_activities')
        .insert(minimalPayload)
        .select()
        .single()

      if (retryError) {
        activityError = retryError
        logger.error('Failed to create email activity (minimal payload)', {
          requestId,
          error: retryError,
        })
      } else {
        activityError = null
        emailActivity = retryActivity
      }
    }

    // Patch asset link with tracking params once activity id exists
    const trackedAssetLink = buildTrackedAssetLink({
      baseLink: emailPayload.assetLink,
      activityId: emailActivity?.id || null,
      contactId: contact.id,
      projectId,
      vertical: classification.grooveVertical || classification.vertical,
      source: 'warm-call'
    })

    if (emailActivity?.id && trackedAssetLink !== emailPayload.assetLink) {
      const updatedBody = replaceAllLinks(emailPayload.body, emailPayload.assetLink, trackedAssetLink)
      const updatedHtml = replaceAllLinks(emailPayload.html, emailPayload.assetLink, trackedAssetLink)

      await supabase
        .from('outreach_activities')
        .update({
          message_body: updatedBody,
          status: autoSend ? 'sent' : 'draft',
          metadata: {
            ...((emailActivity?.metadata as Record<string, unknown>) || {}),
            assetLink: trackedAssetLink
          } as any,
        })
        .eq('id', emailActivity.id)

      emailPayload.body = updatedBody
      emailPayload.html = updatedHtml
      emailPayload.assetLink = trackedAssetLink
    }

    // Update project with vertical classification
    const updatedRawData = {
      ...((project.raw_data as Record<string, unknown>) || {}),
      vertical_classification: classification,
      warm_call_workflow_triggered: new Date().toISOString(),
    }
    await supabase
      .from('high_priority_projects')
      .update({
        raw_data: updatedRawData as unknown as typeof project.raw_data,
      })
      .eq('id', projectId)

    // Send email if autoSend is true
    if (autoSend && SENDGRID_API_KEY) {
      try {
        const { getOrganizationConfig } = await import('@/lib/config/organization')
        const orgConfig = await getOrganizationConfig(organizationId)

        await sgMail.send({
          to: contact.email,
          from: {
            email: orgConfig.email.senderEmail,
            name: `${orgConfig.email.senderName} - ${orgConfig.branding.companyName}`,
          },
          replyTo: orgConfig.email.replyToEmail,
          subject: emailPayload.subject,
          text: emailPayload.body,
          html: emailPayload.html,
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true },
          },
          // Custom args are included in SendGrid webhook events
          // These allow us to identify which email activity triggered the engagement
          customArgs: {
            project_id: projectId,
            contact_id: contact.id,
            activity_id: emailActivity?.id || '',
            workflow: 'warm-call',
            pain_point: classification.painPoints?.[0] || '',
            groove_vertical: classification.grooveVertical || '',
            groove_bundle: classification.grooveBundle || '',
          },
          // Also add as unique args for webhook compatibility
          asm: undefined, // Not using unsubscribe groups for now
          categories: ['warm-call', 'auto-outreach', `project-${projectId}`, `contact-${contact.id}`],
        })

        logger.info('Email sent', { requestId, contactEmail: contact.email })

        // Update activity status
        if (emailActivity) {
          await supabase
            .from('outreach_activities')
            .update({ status: 'sent' })
            .eq('id', emailActivity.id)
        }

        // Update contact + project for the automated workflow
        await supabase
          .from('contacts')
          .update({
            contact_count: (contact.contact_count || 0) + 1,
            last_contacted: new Date().toISOString(),
            response_status: 'contacted',
          } as any)
          .eq('id', contact.id)

        await supabase
          .from('high_priority_projects')
          .update({ outreach_status: 'contacted' } as any)
          .eq('id', projectId)
          .eq('outreach_status', 'new')
      } catch (emailError) {
        logger.error('Failed to send email', {
          requestId,
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
        })
        // Continue - we still want to return the generated email
      }
    }

    timer.log('Workflow complete')

    return NextResponse.json({
      success: true,
      workflow: 'warm-call',
      phases: {
        classification: {
          vertical: classification.vertical,
          painPoints: classification.painPoints,
          grooveBundle: classification.grooveBundle,
        },
        email: {
          generated: true,
          sent: autoSend,
          subject: emailPayload.subject,
          activityId: emailActivity?.id,
          activityError: activityError?.message || null,
        },
      },
      requestId,
    })
  } catch (error) {
    logger.error('Warm call workflow error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      {
        error: 'Workflow execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    )
  }
}

