import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createErrorResponse, generateRequestId } from '@/lib/api/errors'
import { apiRateLimit, getRateLimitHeaders, getClientIp } from '@/lib/api/rate-limit'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ============================================
// GET /api/notifications - Fetch recent notifications
// ============================================

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimitResult = apiRateLimit(clientIp)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get user session to ensure RLS filtering
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized', requestId }, { status: 401 })
    }

    const notifications: Array<{
      id: string
      title: string
      message: string
      time: string
      type: string
      read: boolean
      created_at: string
    }> = []

    // Get recent projects (last 24 hours) - new projects from scrapes
    const oneDayAgo = new Date()
    oneDayAgo.setHours(oneDayAgo.getHours() - 24)

    const { data: recentProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id, project_name, city, state, created_at')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (!projectsError && recentProjects) {
      // Group projects by hour to avoid spam
      const projectGroups = new Map<string, typeof recentProjects>()
      recentProjects.forEach((project) => {
        const createdAt = project.created_at || new Date().toISOString()
        const hour = new Date(createdAt).toISOString().slice(0, 13) // Group by hour
        if (!projectGroups.has(hour)) {
          projectGroups.set(hour, [])
        }
        projectGroups.get(hour)!.push(project)
      })

      projectGroups.forEach((projects, hour) => {
        if (projects.length === 1) {
          const project = projects[0]
          const createdAt = project.created_at || new Date().toISOString()
          notifications.push({
            id: `project-${project.id}`,
            title: 'New project added',
            message: `${project.project_name}${project.city ? ` in ${project.city}, ${project.state}` : ''} was added to your pipeline`,
            time: formatRelativeTime(createdAt),
            type: 'project',
            read: false,
            created_at: createdAt,
          })
        } else {
          const createdAt = projects[0].created_at || new Date().toISOString()
          notifications.push({
            id: `projects-${hour}`,
            title: `${projects.length} new projects added`,
            message: `${projects.length} projects were added to your pipeline`,
            time: formatRelativeTime(createdAt),
            type: 'project',
            read: false,
            created_at: createdAt,
          })
        }
      })
    }

    // Get recent scrape logs (last 24 hours)
    const { data: scrapeLogs, error: scrapeError } = await supabase
      .from('scrape_logs')
      .select('id, source, projects_inserted, status, created_at')
      .gte('created_at', oneDayAgo.toISOString())
      .in('status', ['success', 'partial_success'])
      .order('created_at', { ascending: false })
      .limit(5)

    if (!scrapeError && scrapeLogs) {
      scrapeLogs.forEach((log) => {
        const projectsInserted = log.projects_inserted || 0
        if (projectsInserted > 0) {
          const createdAt = log.created_at || new Date().toISOString()
          notifications.push({
            id: `scrape-${log.id}`,
            title: 'Scrape completed',
            message: `Found ${projectsInserted} new project${projectsInserted > 1 ? 's' : ''} from ${log.source}`,
            time: formatRelativeTime(createdAt),
            type: 'scrape',
            read: false,
            created_at: createdAt,
          })
        }
      })
    }

    // Get recent completed campaigns (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: campaigns, error: campaignsError } = await supabase
      .from('outreach_campaigns')
      .select('id, campaign_name, campaign_type, emails_sent, status, updated_at')
      .eq('status', 'completed')
      .gte('updated_at', sevenDaysAgo.toISOString())
      .order('updated_at', { ascending: false })
      .limit(5)

    if (!campaignsError && campaigns) {
      campaigns.forEach((campaign) => {
        const sentCount = campaign.emails_sent || 0
        notifications.push({
          id: `campaign-${campaign.id}`,
          title: 'Campaign completed',
          message: `${campaign.campaign_name} finished sending to ${sentCount} recipient${sentCount !== 1 ? 's' : ''}`,
          time: formatRelativeTime(campaign.updated_at || new Date().toISOString()),
          type: 'campaign',
          read: false,
          created_at: campaign.updated_at || new Date().toISOString(),
        })
      })
    }

    // Get recent activity logs (last 24 hours)
    const { data: activities, error: activitiesError } = await supabase
      .from('activity_logs')
      .select('id, action, details, created_at')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (!activitiesError && activities) {
      activities.forEach((activity) => {
        // Filter relevant actions for notifications
        const relevantActions = ['project_enriched', 'contact_found', 'email_sent', 'video_sent']
        if (relevantActions.includes(activity.action)) {
          const details = activity.details as any
          let message = ''
          let title = ''

          switch (activity.action) {
            case 'project_enriched':
              title = 'Project enriched'
              message = details?.project_name
                ? `${details.project_name} has been enriched with additional data`
                : 'A project has been enriched with additional data'
              break
            case 'contact_found':
              title = 'New contact found'
              message = details?.name
                ? `Found contact: ${details.name}`
                : 'A new contact was discovered'
              break
            case 'email_sent':
              title = 'Email sent'
              message = details?.to ? `Email sent to ${details.to}` : 'An email was sent'
              break
            case 'video_sent':
              title = 'Video sent'
              message = details?.to ? `Video sent to ${details.to}` : 'A video was sent'
              break
            default:
              return // Skip if not a relevant action
          }

          notifications.push({
            id: `activity-${activity.id}`,
            title,
            message,
            time: formatRelativeTime(activity.created_at || new Date().toISOString()),
            type: 'activity',
            read: false,
            created_at: activity.created_at || new Date().toISOString(),
          })
        }
      })
    }

    // Sort by created_at descending
    notifications.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Limit to most recent 20 notifications
    const limitedNotifications = notifications.slice(0, 20)

    return NextResponse.json(
      {
        notifications: limitedNotifications,
        unreadCount: limitedNotifications.filter((n) => !n.read).length,
        requestId,
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    logger.error('Failed to fetch notifications', { requestId, error })
    return createErrorResponse(error, requestId)
  }
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

