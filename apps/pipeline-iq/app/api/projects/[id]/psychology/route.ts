import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  generateRequestId,
  NotFoundError,
} from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import {
  calculatePsychologyScore,
  getConsequenceQuestionsForLead,
  getOptimalSequence,
} from '@/lib/psychology'

// ============================================
// GET /api/projects/[id]/psychology
// Calculate behavioral psychology score for a project/lead
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id: projectId } = await params

  try {
    logger.info('Calculating psychology score', { requestId, projectId })

    const supabase = await createServerSupabaseClient()

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      throw new NotFoundError('Project')
    }

    // Fetch primary contact for this project (if exists)
    const { data: stakeholder } = await supabase
      .from('project_stakeholders')
      .select(`
        *,
        contacts (*)
      `)
      .eq('project_id', projectId)
      .eq('is_primary', true)
      .single()

    const contact = stakeholder?.contacts || null

    // Fetch engagement history
    const { data: activities } = await supabase
      .from('outreach_activities')
      .select('*')
      .eq('project_id', projectId)
      .order('activity_date', { ascending: false })
      .limit(10)

    // Calculate response count and sentiment
    const responseCount = activities?.filter(a =>
      a.activity_type === 'response' || a.response_text
    ).length || 0

    const lastActivity = activities?.[0]
    const lastResponseSentiment = lastActivity?.sentiment as 'positive' | 'neutral' | 'negative' | null
    const hasObjected = activities?.some(a =>
      a.sentiment === 'negative' ||
      (a.response_text?.toLowerCase().includes('not interested') ||
       a.response_text?.toLowerCase().includes('no thanks'))
    ) || false

    // Calculate days since last contact
    let daysSinceLastContact: number | undefined
    if (lastActivity?.activity_date) {
      const lastDate = new Date(lastActivity.activity_date)
      const today = new Date()
      daysSinceLastContact = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Determine timing context
    const now = new Date()
    const dayOfWeek = now.getDay()
    const hour = now.getHours()
    const timeOfDay: 'morning' | 'afternoon' | 'evening' =
      hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    const month = now.getMonth()
    const endOfQuarter = [2, 5, 8, 11].includes(month) && now.getDate() > 20

    // Calculate comprehensive psychology score
    const psychologyScore = calculatePsychologyScore(
      {
        title: contact?.title || null,
        roleCategory: contact?.role_category || null,
        decisionLevel: contact?.decision_level || null,
        contactCount: contact?.contact_count || 0,
        lastResponseSentiment,
        hasObjected,
      },
      {
        projectName: project.project_name,
        projectType: project.project_type || [],
        projectStage: project.project_stage || 'planning',
        projectValue: project.project_value || 0,
        estimatedCompletionDate: project.estimated_completion_date,
        servicesNeeded: project.services_needed || [],
      },
      {
        responseCount,
        daysSinceLastContact,
      },
      {
        dayOfWeek,
        timeOfDay,
        endOfQuarter,
      }
    )

    // Get tailored consequence questions
    const consequenceQuestions = getConsequenceQuestionsForLead(
      {
        projectType: project.project_type || [],
        projectStage: project.project_stage || 'planning',
        projectValue: project.project_value || 0,
        servicesNeeded: project.services_needed || [],
      },
      {
        selfMonitorProfile: psychologyScore.selfMonitor.profile,
        identityDimension: psychologyScore.identityThreat.identityDimension,
      },
      5
    )

    // Get optimal consequence sequence
    const optimalSequence = getOptimalSequence(
      {
        projectType: project.project_type || [],
        projectStage: project.project_stage || 'planning',
        servicesNeeded: project.services_needed || [],
      },
      {
        selfMonitorProfile: psychologyScore.selfMonitor.profile,
      }
    )

    logger.info('Psychology score calculated', {
      requestId,
      projectId,
      conversionProbability: psychologyScore.conversionProbability,
      priorityRank: psychologyScore.priorityRank,
    })

    return NextResponse.json({
      requestId,
      projectId,
      projectName: project.project_name,
      psychologyScore,
      consequenceQuestions: consequenceQuestions.map(q => ({
        id: q.id,
        category: q.category,
        question: q.question,
        followUp: q.followUp,
        intensity: q.intensity,
      })),
      optimalSequence: optimalSequence ? {
        name: optimalSequence.name,
        description: optimalSequence.description,
        buildStrategy: optimalSequence.buildStrategy,
        exitCriteria: optimalSequence.exitCriteria,
        questionCount: optimalSequence.questions.length,
      } : null,
      contact: contact ? {
        id: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        title: contact.title,
        roleCategory: contact.role_category,
      } : null,
    })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// POST /api/projects/[id]/psychology
// Calculate psychology score with custom contact data
// (for when contact isn't in database yet)
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id: projectId } = await params

  try {
    let body: {
      contact?: {
        title?: string
        roleCategory?: string
        decisionLevel?: string
      }
      conversationSignals?: {
        mentionedCompetitors?: boolean
        askedForSpecs?: boolean
        focusedOnImage?: boolean
        focusedOnFunction?: boolean
      }
    } = {}

    try {
      body = await request.json()
    } catch {
      // Empty body is acceptable
    }

    logger.info('Calculating psychology score with custom contact', {
      requestId,
      projectId,
      hasContact: !!body.contact,
    })

    const supabase = await createServerSupabaseClient()

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      throw new NotFoundError('Project')
    }

    // Use provided contact data or defaults
    const contactData = body.contact || {}

    // Determine timing context
    const now = new Date()
    const dayOfWeek = now.getDay()
    const hour = now.getHours()
    const timeOfDay: 'morning' | 'afternoon' | 'evening' =
      hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    const month = now.getMonth()
    const endOfQuarter = [2, 5, 8, 11].includes(month) && now.getDate() > 20

    // Calculate psychology score
    const psychologyScore = calculatePsychologyScore(
      {
        title: contactData.title || null,
        roleCategory: contactData.roleCategory || null,
        decisionLevel: contactData.decisionLevel || null,
        contactCount: 0,
        lastResponseSentiment: null,
        hasObjected: false,
      },
      {
        projectName: project.project_name,
        projectType: project.project_type || [],
        projectStage: project.project_stage || 'planning',
        projectValue: project.project_value || 0,
        estimatedCompletionDate: project.estimated_completion_date,
        servicesNeeded: project.services_needed || [],
      },
      {
        responseCount: 0,
        daysSinceLastContact: undefined,
      },
      {
        dayOfWeek,
        timeOfDay,
        endOfQuarter,
      }
    )

    // Get tailored consequence questions
    const consequenceQuestions = getConsequenceQuestionsForLead(
      {
        projectType: project.project_type || [],
        projectStage: project.project_stage || 'planning',
        projectValue: project.project_value || 0,
        servicesNeeded: project.services_needed || [],
      },
      {
        selfMonitorProfile: psychologyScore.selfMonitor.profile,
        identityDimension: psychologyScore.identityThreat.identityDimension,
      },
      5
    )

    // Get optimal consequence sequence
    const optimalSequence = getOptimalSequence(
      {
        projectType: project.project_type || [],
        projectStage: project.project_stage || 'planning',
        servicesNeeded: project.services_needed || [],
      },
      {
        selfMonitorProfile: psychologyScore.selfMonitor.profile,
      }
    )

    return NextResponse.json({
      requestId,
      projectId,
      projectName: project.project_name,
      psychologyScore,
      consequenceQuestions: consequenceQuestions.map(q => ({
        id: q.id,
        category: q.category,
        question: q.question,
        followUp: q.followUp,
        intensity: q.intensity,
      })),
      optimalSequence: optimalSequence ? {
        name: optimalSequence.name,
        description: optimalSequence.description,
        buildStrategy: optimalSequence.buildStrategy,
        exitCriteria: optimalSequence.exitCriteria,
      } : null,
    })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}
