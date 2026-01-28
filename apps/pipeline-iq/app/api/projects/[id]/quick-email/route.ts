import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateVerticalEmail } from '@/lib/nepq/vertical-email-generator'
import { logger } from '@/lib/logger'
import { getOrganizationConfig } from '@/lib/config/organization'

/**
 * GET /api/projects/[id]/quick-email
 * Generates a NEPQ email for a single project and returns it ready for Gmail compose
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const projectId = params.id

    // Fetch project
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !projects) {
      logger.error('Failed to fetch project', { error: projectError?.message })
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const project = projects as any

    // Get contacts from project
    const contacts = project.raw_data?.original?.contacts || []
    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts found for this project' }, { status: 400 })
    }

    // Use first contact (or let user choose)
    const contact = contacts[0]
    const contactName = contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'there'
    const contactEmail = contact.email
    const contactTitle = contact.title || ''

    if (!contactEmail) {
      return NextResponse.json({ error: 'Contact email not found' }, { status: 400 })
    }

    // Get organization config for email signature
    const orgConfig = await getOrganizationConfig()

    // Generate NEPQ email using vertical intelligence
    const emailResult = generateVerticalEmail(
      {
        projectName: project.project_name,
        projectTypes: project.project_type || [],
        projectStage: project.project_stage || '',
        projectValue: project.project_value,
        unitsCount: project.units_count,
        city: project.city,
        state: project.state,
        estimatedCompletionDate: project.estimated_completion_date,
      },
      {
        firstName: contact.first_name || contactName.split(' ')[0] || 'there',
        lastName: contact.last_name || contactName.split(' ').slice(1).join(' ') || '',
        title: contactTitle,
        email: contactEmail,
        company: project.developer_name || project.architect_name || '',
      },
      {
        sequencePosition: 0,
        engagementLevel: 'none',
      }
    )

    // Create tracking ID for this email (must be before it's used)
    const trackingId = `email_${projectId}_${Date.now()}`

    // Build email body with signature and tracking pixel
    const emailSignature = `
${orgConfig.email.signature.name}${orgConfig.email.signature.title ? `, ${orgConfig.email.signature.title}` : ''}
${orgConfig.email.signature.company}
${orgConfig.email.signature.email}${orgConfig.email.signature.website ? ` | ${orgConfig.email.signature.website}` : ''}`.trim()

    // Add tracking pixel to email body (invisible 1x1 image)
    // Get base URL from environment or construct from request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-domain.com')
    const trackingPixelUrl = `${baseUrl}/api/email/track?tracking_id=${trackingId}&event=open`
    
    const fullBody = `${emailResult.body}

---
${emailSignature}

<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />`

    // Store email activity in database (pending status)
    const { error: activityError } = await supabase
      .from('outreach_activities')
      .insert({
        project_id: projectId,
        activity_type: 'email',
        subject: emailResult.subject,
        message_body: fullBody,
        status: 'pending', // Will be updated to 'sent' when Mike sends it
        metadata: {
          tracking_id: trackingId,
          contact_email: contactEmail,
          contact_name: contactName,
          vertical: emailResult.vertical,
          role: emailResult.role,
          psychology: emailResult.psychology,
        },
      })

    if (activityError) {
      logger.error('Failed to create outreach activity', { error: activityError.message })
    }

    // Return email data ready for Gmail compose
    return NextResponse.json({
      to: contactEmail,
      subject: emailResult.subject,
      body: fullBody,
      trackingId,
      contact: {
        name: contactName,
        email: contactEmail,
        title: contactTitle,
      },
      project: {
        id: projectId,
        name: project.project_name,
      },
      // Gmail compose URL
      gmailUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}&su=${encodeURIComponent(emailResult.subject)}&body=${encodeURIComponent(fullBody)}`,
    })
  } catch (error) {
    logger.error('Quick email generation error', { error })
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 })
  }
}

