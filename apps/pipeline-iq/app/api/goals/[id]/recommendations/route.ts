import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  generateRequestId,
  NotFoundError,
} from '@/lib/api/errors'
import { apiRateLimit, getRateLimitHeaders, getClientIp } from '@/lib/api/rate-limit'
import { logger } from '@/lib/logger'

// ============================================
// GET /api/goals/[id]/recommendations - Get NEPQ-powered goal recommendations
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id } = await params

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

    logger.info('Generating goal recommendations', { requestId, goalId: id })

    const supabase = await createServerSupabaseClient()
    const orgId = process.env.ORGANIZATION_ID

    // Get goal details
    let goalData: any = null

    const { data: goal, error: goalError } = await (supabase as any)
      .from('v_goals_dashboard')
      .select('*')
      .eq('id', id)
      .single()

    if (goalError || !goal) {
      // Fallback to goals table
      const { data: fallbackGoal } = await (supabase as any)
        .from('goals')
        .select('*')
        .eq('id', id)
        .single()

      if (!fallbackGoal) {
        throw new NotFoundError('Goal')
      }
      goalData = fallbackGoal
    } else {
      goalData = goal
    }

    // Calculate gap to target
    const gap = (goalData.target_value || 0) - (goalData.current_value || 0)
    const isBehind = goalData.pace_status === 'behind' || goalData.pace_status === 'at_risk'

    // Generate recommendations based on goal type
    const recommendations: any[] = []

    if (goalData.goal_type === 'revenue' && gap > 0) {
      // Get high-value projects in pipeline
      const { data: projects } = await (supabase as any)
        .from('projects')
        .select('id, project_name, project_value, outreach_status, project_type, city, state')
        .eq('organization_id', orgId)
        .in('outreach_status', ['qualified', 'engaged', 'contacted'])
        .gte('project_value', 50000)
        .order('project_value', { ascending: false })
        .limit(10)

      if (projects && projects.length > 0) {
        const totalValue = projects.reduce((sum: number, p: any) => sum + (p.project_value || 0), 0)
        recommendations.push({
          recommendation_type: 'focus_projects',
          title: 'Focus on High-Value Projects',
          description: `${projects.length} projects in pipeline worth ${formatCurrency(totalValue)} combined. All at "Qualified" or "Engaged" status.`,
          priority: 1,
          estimated_impact: totalValue * 0.3, // 30% close rate estimate
          action_data: {
            project_ids: projects.map((p: any) => p.id),
            total_value: totalValue,
            projects: projects.map((p: any) => ({
              id: p.id,
              name: p.project_name,
              value: p.project_value,
              status: p.outreach_status,
            })),
          },
        })
      }

      // Vertical strategy recommendation
      const { data: verticalStats } = await (supabase as any)
        .from('projects')
        .select('project_type, outreach_status, project_value')
        .eq('organization_id', orgId)
        .in('outreach_status', ['qualified', 'engaged'])

      if (verticalStats && verticalStats.length > 0) {
        const verticalCounts: Record<string, { count: number; value: number }> = {}
        verticalStats.forEach((p: any) => {
          const types = p.project_type || []
          types.forEach((type: string) => {
            if (!verticalCounts[type]) {
              verticalCounts[type] = { count: 0, value: 0 }
            }
            verticalCounts[type].count++
            verticalCounts[type].value += p.project_value || 0
          })
        })

        const topVertical = Object.entries(verticalCounts).sort(
          (a, b) => b[1].value - a[1].value
        )[0]

        if (topVertical) {
          recommendations.push({
            recommendation_type: 'focus_vertical',
            title: `Focus on ${topVertical[0]} Vertical`,
            description: `${topVertical[0]} has ${topVertical[1].count} qualified projects worth ${formatCurrency(topVertical[1].value)}. Focus 70% effort here for faster close.`,
            priority: 2,
            estimated_impact: topVertical[1].value * 0.4,
            action_data: {
              vertical: topVertical[0],
              project_count: topVertical[1].count,
              total_value: topVertical[1].value,
            },
          })
        }
      }
    }

    if (goalData.goal_type === 'deals_closed' && gap > 0) {
      // Get deals needed
      const dealsNeeded = Math.ceil(gap)
      
      // Find projects at qualified/engaged status
      const { data: pipelineProjects } = await (supabase as any)
        .from('projects')
        .select('id, project_name, project_value, outreach_status')
        .eq('organization_id', orgId)
        .in('outreach_status', ['qualified', 'engaged'])
        .order('project_value', { ascending: false })
        .limit(dealsNeeded * 3) // Need 3x pipeline for 33% close rate

      if (pipelineProjects && pipelineProjects.length > 0) {
        recommendations.push({
          recommendation_type: 'focus_projects',
          title: `Prioritize ${dealsNeeded} Deals from Pipeline`,
          description: `To close ${dealsNeeded} more deals, focus on ${pipelineProjects.length} projects currently at "Qualified" or "Engaged" status.`,
          priority: 1,
          estimated_impact: dealsNeeded,
          action_data: {
            deals_needed: dealsNeeded,
            project_ids: pipelineProjects.slice(0, dealsNeeded * 2).map((p: any) => p.id),
            projects: pipelineProjects.slice(0, 10).map((p: any) => ({
              id: p.id,
              name: p.project_name,
              value: p.project_value,
              status: p.outreach_status,
            })),
          },
        })
      }
    }

    if (goalData.goal_type === 'services_sold' && gap > 0 && goalData.service_type) {
      // Service-specific recommendations
      const serviceVerticalMap: Record<string, string> = {
        access_control: 'senior_living',
        wifi: 'hospitality',
        cabling: 'multifamily',
      }

      const recommendedVertical = serviceVerticalMap[goalData.service_type] || 'hospitality'

      recommendations.push({
        recommendation_type: 'focus_vertical',
        title: `Focus on ${recommendedVertical} for ${goalData.service_type}`,
        description: `${goalData.service_type} converts best in ${recommendedVertical} (estimated 38% close rate). Target projects in this vertical.`,
        priority: 1,
        estimated_impact: gap * 10000, // Estimated value per service
        action_data: {
          service_type: goalData.service_type,
          vertical: recommendedVertical,
          pain_point: goalData.service_type === 'access_control' ? 'resident safety' : 'move-in day',
        },
      })
    }

    // General outreach optimization
    if (isBehind) {
      // Get warm contacts
      const { data: warmContacts } = await (supabase as any)
        .from('outreach_activities')
        .select('id, contact_id, project_id, opened_at, clicked_at')
        .eq('organization_id', orgId)
        .eq('activity_type', 'email')
        .in('status', ['opened', 'clicked'])
        .not('opened_at', 'is', null)
        .order('opened_at', { ascending: false })
        .limit(20)

      if (warmContacts && warmContacts.length > 0) {
        recommendations.push({
          recommendation_type: 'contact_target',
          title: 'Follow Up with Warm Contacts',
          description: `${warmContacts.length} contacts have opened or clicked your emails. Follow up immediately while engagement is hot.`,
          priority: 3,
          estimated_impact: warmContacts.length * 0.2 * 50000, // 20% close rate, $50K avg deal
          action_data: {
            contact_count: warmContacts.length,
            contacts: warmContacts.map((c: any) => ({
              id: c.id,
              contact_id: c.contact_id,
              project_id: c.project_id,
              last_engaged: c.opened_at || c.clicked_at,
            })),
          },
        })
      }

      // Subject line optimization
      recommendations.push({
        recommendation_type: 'subject_line',
        title: 'Optimize Subject Lines',
        description: 'Use "Quick question about {propertyName} move-in day" pattern - shows 48% open rate vs 32% average.',
        priority: 4,
        estimated_impact: 0.16 * 100, // 16% improvement in open rate
        action_data: {
          template: 'Quick question about {propertyName} move-in day',
          expected_open_rate: 0.48,
          current_open_rate: 0.32,
        },
      })
    }

    // Reverse-engineer tactics from goal gap
    if (gap > 0 && goalData.goal_type === 'revenue') {
      const avgDealSize = 42000 // From HCI document example
      const dealsNeeded = Math.ceil(gap / avgDealSize)
      const pipelineNeeded = Math.ceil(dealsNeeded / 0.32) // 32% close rate
      const meetingsNeeded = Math.ceil(pipelineNeeded / 0.18) // 18% meeting-to-close
      const emailsNeeded = Math.ceil(meetingsNeeded / 0.12) // 12% response rate

      recommendations.push({
        recommendation_type: 'general',
        title: 'Tactical Breakdown to Hit Goal',
        description: `To close the ${formatCurrency(gap)} gap, you need: ${dealsNeeded} deals → ${pipelineNeeded} qualified projects → ${meetingsNeeded} meetings → ${emailsNeeded} emails sent.`,
        priority: 5,
        estimated_impact: gap,
        action_data: {
          gap_to_target: gap,
          deals_needed: dealsNeeded,
          pipeline_needed: pipelineNeeded,
          meetings_needed: meetingsNeeded,
          emails_needed: emailsNeeded,
        },
      })
    }

    // Save recommendations to database
    if (recommendations.length > 0) {
      const recommendationsToInsert = recommendations.map((rec) => ({
        goal_id: id,
        recommendation_type: rec.recommendation_type,
        title: rec.title,
        description: rec.description,
        action_data: rec.action_data,
        priority: rec.priority,
        estimated_impact: rec.estimated_impact,
        status: 'active',
      }))

      await (supabase as any).from('goal_recommendations').insert(recommendationsToInsert)
    }

    logger.info('Goal recommendations generated', {
      requestId,
      goalId: id,
      recommendationCount: recommendations.length,
    })

    return NextResponse.json(
      {
        recommendations: recommendations.sort((a, b) => a.priority - b.priority),
        goal: goalData,
        requestId,
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

