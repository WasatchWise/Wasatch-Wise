import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateABTestVariants } from '@/lib/ai/openai'
import { generateGrooveNEPQEmail } from '@/lib/groove/email-generation'
import {
  generatePersonalizedVideoMessage,
  shouldUseVideoOutreach,
  embedVideoInEmail,
} from '@/lib/ai/heygen'
import { researchContact } from '@/lib/ai/google'
import { campaignGenerationSchema, validateRequest } from '@/lib/api/validation'
import {
  createErrorResponse,
  generateRequestId,
  ValidationError,
  NotFoundError,
} from '@/lib/api/errors'
import { apiRateLimit, getRateLimitHeaders, getClientIp } from '@/lib/api/rate-limit'
import { logger, createTimer } from '@/lib/logger'
import { featureFlags } from '@/lib/config/env'
import { getOrganizationConfig } from '@/lib/config/organization'
import { NEPQStage } from '@/lib/nepq/framework'
import { trackUsage, checkFeatureAccess } from '@/lib/billing'
import { shouldBypassAllRestrictions } from '@/lib/permissions'
// NEW: Vertical Intelligence Integration
import {
  generateVerticalEmail,
  detectRoleFromTitle,
  calculateOptimalSendTime,
  type ProjectContext,
  type ContactContext,
  type SequenceContext,
} from '@/lib/nepq/vertical-email-generator'
import { detectVerticalFromProjectType, getVerticalIntelligence } from '@/lib/nepq/verticals'
import { extractNameFromEmail } from '@/lib/utils'
import { wrapEmailInHtml } from '@/lib/groove/email-html'

interface ProjectData {
  id: string
  project_name: string
  project_type?: string[]
  project_stage?: string
  project_value?: number
  city?: string
  state?: string
  units_count?: number
  amenities?: string[]
  description?: string
  raw_data: {
    original?: {
      contacts?: Array<{
        first_name?: string
        last_name?: string
        name?: string
        email?: string
        title?: string
      }>
    }
  } | null
  project_stakeholders?: unknown
  [key: string]: unknown
}

// ============================================
// POST /api/campaigns/generate - AI-powered campaign generation
// ============================================

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const timer = createTimer()

  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimitResult = apiRateLimit(clientIp)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
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

    const validation = validateRequest(campaignGenerationSchema, body)

    if (!validation.success) {
      throw new ValidationError(validation.error, validation.details)
    }

    const { projectIds, useAI, useVideo, generateVariants } = validation.data

    logger.info('Generating campaign', {
      requestId,
      projectCount: projectIds.length,
      useAI,
      useVideo,
      generateVariants,
    })

    // Check feature flags
    if (useAI && !featureFlags.aiEnrichment) {
      logger.warn('AI campaign generation attempted but not configured', { requestId })
      return NextResponse.json(
        {
          error: 'AI features are not configured',
          message: 'Please configure OPENAI_API_KEY',
          requestId,
        },
        { status: 503 }
      )
    }

    if (useVideo && !featureFlags.videoGeneration) {
      logger.warn('Video generation attempted but not configured', { requestId })
      return NextResponse.json(
        {
          error: 'Video generation is not configured',
          message: 'Please configure HEYGEN_API_KEY',
          requestId,
        },
        { status: 503 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const organizationId = process.env.ORGANIZATION_ID

    if (!organizationId) {
      throw new ValidationError('Organization ID not configured')
    }

    // Get user from session (if available)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if Mike should bypass all restrictions
    const bypassRestrictions = await shouldBypassAllRestrictions(user?.id, organizationId)

    if (!bypassRestrictions) {
      // Check feature access for regular users
      if (useAI) {
        const aiAccess = await checkFeatureAccess(organizationId, 'ai_email_generation', user?.id)
        if (!aiAccess.allowed) {
          return NextResponse.json(
            {
              error: 'AI email generation not available',
              reason: aiAccess.reason,
              requestId,
            },
            { status: 403 }
          )
        }
      }

      if (useVideo) {
        const videoAccess = await checkFeatureAccess(organizationId, 'video_generation', user?.id)
        if (!videoAccess.allowed) {
          return NextResponse.json(
            {
              error: 'Video generation not available',
              reason: videoAccess.reason,
              requestId,
            },
            { status: 403 }
          )
        }
      }
    } else {
      logger.info('Mike\'s access - bypassing all restrictions for campaign generation', {
        requestId,
        userId: user?.id,
        organizationId,
      })
    }

    // Get organization config
    const orgConfig = await getOrganizationConfig(organizationId)

    // Fetch projects with contacts
    // QUERY CHANGED: 'high_priority_projects' -> 'projects'
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds)

    if (error) {
      logger.error('Failed to fetch projects', { requestId, error: error.message })
      throw error
    }

    if (!projects || projects.length === 0) {
      throw new NotFoundError('Projects')
    }

    const typedProjects = projects as ProjectData[]
    timer.log('Projects fetched', { count: typedProjects.length })

    // Generate campaign messages
    const campaignMessages: Array<{
      project_id: string
      contact_id: string
      company_id?: string
      contact_email: string
      contact_name: string
      subject: string
      body: string
      best_send_time?: string
      follow_up_days?: number
      has_video?: boolean
      video_id?: string
      variants?: unknown
      video?: unknown
      research_insights?: unknown
      recommended_send_time?: string
      // NEW: Vertical Intelligence Metadata
      vertical_intelligence?: {
        vertical: string
        role: string | null
        psychology?: {
          targetFear: string
          wedgeQuestion: string | null
        }
        cheatCode: string
        optimalSendTime: Date | null
      }
    }> = []

    for (const project of typedProjects) {
      // Logic updated to handle raw_data contacts from scraper
      let contacts: any[] = []

      // 1. Try raw_data (from scraper)
      if (project.raw_data?.original?.contacts) {
        contacts = project.raw_data.original.contacts.map((c: any, index: number) => {
          const extracted = extractNameFromEmail(c.email)
          return {
            id: `raw-${index}-${Date.now()}`, // Temporary ID for raw contacts
            first_name: c.first_name || c.name?.split(' ')[0] || extracted?.firstName || 'There',
            last_name: c.last_name || c.name?.split(' ').slice(1).join(' ') || extracted?.lastName || '',
            email: c.email,
            title: c.title,
            contact_count: 0 // New contact
          }
        })
      }

      // 2. Try regular stakeholders (from CSV/manual) if no raw contacts
      if (contacts.length === 0 && project.project_stakeholders) {
        // This requires fetching stakeholders if we were using the old query, 
        // but we simplified to select('*') on projects which doesn't join stakeholders by default in this schema usually?
        // Actually the project table setup implies contacts might not be joined unless requested.
        // But since we know the scraper puts them in raw_data, we focus on that.
        // If we need to support legacy, we'd need to fetch stakeholders separately or join them.
        // For now, let's assume raw_data is the source of truth for scraped projects.
      }

      for (const contact of contacts) {
        // Skip contacts without email
        if (!contact.email) {
          logger.debug('Skipping contact without email', {
            requestId,
            projectId: project.id,
          })
          continue
        }

        // Try to get company name from project data (raw contacts don't have company_id yet)
        let companyName: string = 'Unknown'
        if (project.developer_name) {
          companyName = String(project.developer_name)
        } else if (project.general_contractor) {
          companyName = String(project.general_contractor)
        } else if (project.architect_name) {
          companyName = String(project.architect_name)
        } else if (contact.company_id) {
          // If contact has a company_id (from saved contacts), fetch it
          const { data: companyData } = await supabase
            .from('companies')
            .select('company_name')
            .eq('id', contact.company_id)
            .single()
          if (companyData?.company_name) {
            companyName = companyData.company_name
          }
        }

        const company = { company_name: companyName }

        // AI-powered personalization with NEPQ framework
        let emailData: {
          subject: string
          body: string
          best_send_time?: string
          follow_up_days?: number
          variants?: unknown
          research_insights?: unknown
          has_video?: boolean
          video_id?: string
          // NEPQ metadata
          nepqStage?: NEPQStage
          nepqAlignmentScore?: number
          groovValueProps?: string[]
          painPointsAddressed?: string[]
          // Vertical intelligence metadata
          verticalIntelligence?: {
            vertical: string
            role: string | null
            psychology: {
              targetFear: string
              wedgeQuestion: string | null
            }
            cheatCode: string
            optimalSendTime: Date
          }
        }

        if (useAI) {
          try {
            // Research the contact (Google + Gemini)
            const contactResearch = await researchContact(contact, company).catch(err => {
              logger.warn('Contact research failed', {
                requestId,
                contactId: contact.id,
                error: err.message,
              })
              return null
            })

            // NEW: Use Vertical Intelligence for psychology-driven emails
            const projectContext: ProjectContext = {
              projectName: project.project_name,
              projectTypes: project.project_type || [],
              projectStage: project.project_stage || 'planning',
              projectValue: project.project_value,
              unitsCount: project.units_count,
              city: project.city,
              state: project.state,
            }

            const contactContext: ContactContext = {
              firstName: contact.first_name || 'there',
              lastName: contact.last_name,
              title: contact.title,
              email: contact.email,
              company: company.company_name,
              role: contact.title ? (detectRoleFromTitle(contact.title) ?? undefined) : undefined,
            }

            const sequenceContext: SequenceContext = {
              sequencePosition: contact.contact_count || 0,
              engagementLevel: 'none',
            }

            // Generate vertical-aware email
            const verticalEmail = generateVerticalEmail(
              projectContext,
              contactContext,
              sequenceContext,
              {} // nearby context - could be enhanced with actual nearby projects
            )

            // Get vertical intelligence for metadata
            const vertical = detectVerticalFromProjectType(project.project_type || [])
            const verticalIntel = getVerticalIntelligence(vertical) // Used for cheatCode and market reality
            const optimalSendTime = calculateOptimalSendTime(
              verticalEmail.role,
              vertical,
              project.state || 'TX'
            )

            // Determine NEPQ context based on contact history
            const isFirstContact = (contact.contact_count || 0) === 0
            const nepqContext = {
              isFirstContact,
              hasResponded: false,
              engagementLevel: 'low' as const,
              painIdentified: false,
              solutionPresented: false,
            }

            // Generate NEPQ-aligned email with Groove knowledge base (enhanced with vertical data)
            const nepqEmail = await generateGrooveNEPQEmail({
              contact,
              project,
              company,
              previousInteractions: contact.contact_count > 0 ? [] : undefined,
              nepqContext,
            })

            // Use vertical intelligence email as primary, with NEPQ metadata
            emailData = {
              subject: verticalEmail.subject,
              body: verticalEmail.body,
              best_send_time: verticalEmail.timing.bestSendTime,
              follow_up_days: 4, // Based on vertical sequence config
              nepqStage: nepqEmail.nepqStage,
              nepqAlignmentScore: nepqEmail.nepqAlignmentScore,
              groovValueProps: nepqEmail.groovValueProps,
              painPointsAddressed: nepqEmail.painPointsAddressed,
              // Store vertical intelligence for tracking
              verticalIntelligence: {
                vertical: verticalEmail.vertical,
                role: verticalEmail.role,
                psychology: verticalEmail.psychology,
                cheatCode: verticalEmail.metadata.verticalCheatCode,
                optimalSendTime,
              },
            }

            logger.info('Vertical + NEPQ email generated', {
              requestId,
              contactId: contact.id,
              vertical: verticalEmail.vertical,
              role: verticalEmail.role,
              nepqStage: nepqEmail.nepqStage,
              targetFear: verticalEmail.psychology.targetFear?.substring(0, 50),
            })

            // Track AI email generation usage
            await trackUsage(organizationId, 'ai_email_generation', 1, {
              projectId: project.id,
              contactId: contact.id,
              nepqStage: nepqEmail.nepqStage,
              alignmentScore: nepqEmail.nepqAlignmentScore,
            })

            // Generate A/B test variants if requested
            if (generateVariants && emailData.subject && emailData.body) {
              try {
                const variants = await generateABTestVariants({
                  subject: emailData.subject,
                  body: emailData.body,
                })
                emailData.variants = variants
              } catch (err) {
                logger.warn('A/B variant generation failed', {
                  requestId,
                  contactId: contact.id,
                  error: err instanceof Error ? err.message : 'Unknown error',
                })
              }
            }

            // Add contact research insights
            if (contactResearch) {
              emailData.research_insights = contactResearch
            }
          } catch (err) {
            logger.error('AI email generation failed, using template', {
              requestId,
              contactId: contact.id,
              error: err instanceof Error ? err.message : 'Unknown error',
            })

            // Fall back to template
            emailData = {
              subject: `Quick question about ${project.project_name}`,
              body: getBaseTemplate(project.project_type?.[0], orgConfig),
              best_send_time: 'morning',
              follow_up_days: 3,
            }
          }
        } else {
          // Use template without AI
          emailData = {
            subject: `Quick question about ${project.project_name}`,
            body: getBaseTemplate(project.project_type?.[0], orgConfig),
            best_send_time: 'morning',
            follow_up_days: 3,
          }
        }

        // HeyGen Video Generation
        let videoData: {
          video_id?: string
          video_url?: string
          thumbnail_url?: string
        } | undefined

        if (useVideo && shouldUseVideoOutreach(project, contact)) {
          try {
            videoData = await generatePersonalizedVideoMessage({
              contactName: `${contact.first_name} ${contact.last_name}`,
              contactTitle: contact.title || 'Decision Maker',
              projectName: project.project_name,
              projectType: project.project_type?.[0] || 'project',
              location: `${project.city || ''}, ${project.state || ''}`,
              projectValue: project.project_value || 0,
              keyBenefit: getKeyBenefit(project, orgConfig),
              callToAction: 'Let me show you how we can make this easier',
            })

            // Enhance email with video
            if (videoData?.video_url) {
              emailData.body = await embedVideoInEmail(
                videoData.video_url,
                videoData.thumbnail_url || '',
                contact.first_name || ''
              )
              emailData.has_video = true
              emailData.video_id = videoData.video_id

              // Track video generation usage
              await trackUsage(organizationId, 'video_generation', 1, {
                projectId: project.id,
                contactId: contact.id,
                videoId: videoData.video_id,
              })
            }
          } catch (videoError) {
            logger.warn('Video generation failed', {
              requestId,
              contactId: contact.id,
              error: videoError instanceof Error ? videoError.message : 'Unknown error',
            })
            // Continue without video
          }
        }

        // Replace common placeholders before HTML wrapping
        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
        emailData.body = (emailData.body || '')
          .replace(/\{\{first_name\}\}/g, contact.first_name || '')
          .replace(/\{\{last_name\}\}/g, contact.last_name || '')
          .replace(/\{\{full_name\}\}/g, fullName)
          .replace(/\{\{project_name\}\}/g, project.project_name || '')
          .replace(/\{\{city\}\}/g, project.city || '')
          .replace(/\{\{state\}\}/g, project.state || '')

        campaignMessages.push({
          project_id: project.id,
          contact_id: contact.id,
          company_id: undefined,
          contact_email: contact.email,
          contact_name: `${contact.first_name} ${contact.last_name}`,
          subject: emailData.subject || '',
          body: emailData.body || '',
          best_send_time: emailData.best_send_time,
          follow_up_days: emailData.follow_up_days,
          has_video: emailData.has_video,
          video_id: emailData.video_id,
          variants: emailData.variants,
          video: videoData,
          research_insights: emailData.research_insights,
          recommended_send_time: emailData.best_send_time,
          // NEW: Include vertical intelligence metadata
          vertical_intelligence: (emailData as any).verticalIntelligence,
        })

        // Wrap body in HTML for the final message
        const lastMsg = campaignMessages[campaignMessages.length - 1]
        if (lastMsg) {
          lastMsg.body = wrapEmailInHtml(lastMsg.body, {
            name: orgConfig.email.signature.name,
            title: orgConfig.email.signature.title || '',
            company: orgConfig.email.signature.company,
            phone: orgConfig.email.signature.phone || '801-396-6534',
            email: orgConfig.email.signature.email,
            website: orgConfig.email.signature.website || orgConfig.domain || 'getgrooven.com',
          })
        }
      }
    }

    timer.log('Campaign messages generated', { count: campaignMessages.length })

    // Create campaign record (user already retrieved above)
    const { data: campaign, error: campaignError } = await supabase
      .from('outreach_campaigns')
      .insert({
        campaign_name: `AI Campaign - ${new Date().toLocaleDateString()}`,
        campaign_type: 'email',
        total_recipients: campaignMessages.length,
        status: 'draft',
        organization_id: organizationId,
        created_by: user?.id || 'system',
      })
      .select()
      .single()

    if (campaignError) {
      logger.error('Failed to create campaign', { requestId, error: campaignError.message })
      throw campaignError
    }

    logger.info('Campaign created', {
      requestId,
      campaignId: campaign.id,
      messageCount: campaignMessages.length,
      withVideo: campaignMessages.filter(m => m.has_video).length,
      withVariants: campaignMessages.filter(m => m.variants).length,
    })

    // Calculate vertical distribution
    const verticalDistribution: Record<string, number> = {}
    for (const msg of campaignMessages) {
      const v = msg.vertical_intelligence?.vertical || 'unknown'
      verticalDistribution[v] = (verticalDistribution[v] || 0) + 1
    }

    // --------------------------------------------------------
    // SMART ASSET INJECTION
    // --------------------------------------------------------
    const assets = orgConfig.assets || []
    if (assets.length > 0) {
      // For MVP, we just take the first available asset. 
      // Future: Match asset.verticals to vertical_intelligence.vertical
      const smartAsset = assets[0]

      for (const msg of campaignMessages) {
        // Don't append if it's already a video email (too busy)
        if (msg.has_video) continue

        // Append "P.S." with the smart link
        // We use a clean text format that wraps nicely
        const psText = `\n\nP.S. See our ${smartAsset.name}: ${smartAsset.url}`

        // Append to body (before HTML wrapping if needed, but here body is raw text mostly validation dependent)
        // The generator returns 'body' string.
        msg.body += psText
      }
    }

    return NextResponse.json({
      success: true,
      campaign_id: campaign.id,
      messages: campaignMessages,
      stats: {
        total_messages: campaignMessages.length,
        with_video: campaignMessages.filter(m => m.has_video).length,
        with_variants: campaignMessages.filter(m => m.variants).length,
        with_vertical_intelligence: campaignMessages.filter(m => m.vertical_intelligence).length,
        vertical_distribution: verticalDistribution,
        estimated_send_time: calculateEstimatedSendTime(campaignMessages),
      },
      requestId,
    })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// Helper Functions
// ============================================

function getBaseTemplate(projectType: string | undefined, orgConfig: Awaited<ReturnType<typeof getOrganizationConfig>>): string {
  const senderName = orgConfig.email.signature.name

  const templates: Record<string, string> = {
    hotel: `Hey {{first_name}},

Quick question about {{project_name}} - what if your hotel could have the same technology that just helped Rangers Village win "Property of the Year"?

We just wrapped up a similar hotel in {{state}}, and the developer told us: "${orgConfig.branding.companyName} didn't just install our technology - they helped us deliver a noticeably better guest experience because the smart features just worked."

Worth a quick call?

${senderName}`,

    multifamily: `{{first_name}},

Saw the {{project_name}} project coming together in {{city}}.

Here's what caught my eye: we're already working with 3 other multifamily projects within 10 miles of you.

They're all getting the same technology package that's improving day-one satisfaction and reducing support headaches.

Want to see the numbers?

${senderName}`,

    senior_living: `Hey {{first_name}},

Senior living + technology = resident satisfaction through the roof.

{{project_name}} could be the first in {{city}} to offer gigabit fiber to every unit, smart health monitoring, and family video connectivity.

15 minutes to show you what we did for a similar project?

${senderName}`,
  }

  return templates[projectType || 'hotel'] || templates.hotel
}

function getKeyBenefit(project: { project_type?: string[] }, orgConfig: Awaited<ReturnType<typeof getOrganizationConfig>>): string {
  const projectType = project.project_type?.[0] || 'hotel'

  const benefits: Record<string, string> = {
    hotel: 'Properties with our technology package see higher guest satisfaction and fewer tech-related complaints',
    multifamily: 'Residents experience fewer tech issues and higher day-one satisfaction with our integrated technology',
    senior_living: 'Families choose facilities with our video connectivity and smart monitoring 3x more often',
  }

  return benefits[projectType] || `Our clients close deals faster with integrated technology from ${orgConfig.branding.companyName}`
}

function calculateEstimatedSendTime(messages: Array<{ has_video?: boolean }>): number {
  // Estimate time to send all messages (accounting for rate limits, video processing, etc.)
  const emailTime = messages.length * 2 // 2 seconds per email
  const videoCount = messages.filter(m => m.has_video).length
  const videoTime = videoCount * 60 // 60 seconds per video to process

  return emailTime + videoTime
}
