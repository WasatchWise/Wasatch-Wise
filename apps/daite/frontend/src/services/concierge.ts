import { supabase } from '@/lib/supabase'
import { model } from './gemini'

export interface ConciergeService {
  id: string
  name: string
  description: string
  service_type: string
  token_cost: number
  icon_name?: string
}

export interface ConciergeRequest {
  id: string
  service_id: string
  input_data: any
  context_data?: any
  output_data?: any
  status: string
}

/**
 * Get available concierge services
 */
export async function getConciergeServices(): Promise<ConciergeService[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('concierge_services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching concierge services:', error)
    return []
  }

  return data || []
}

/**
 * Request a concierge service
 */
export async function requestConciergeService(
  serviceId: string,
  inputData: any,
  contextData?: any
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Call the database function to process the request
    const { data: requestId, error } = await supabase.rpc('process_concierge_service', {
      p_user_id: user.id,
      p_service_id: serviceId,
      p_input_data: inputData,
      p_context_data: contextData || null
    })

    if (error) throw error

    return {
      success: true,
      requestId: requestId as string
    }
  } catch (error: any) {
    console.error('Error requesting concierge service:', error)
    return {
      success: false,
      error: error.message || 'Failed to request service'
    }
  }
}

/**
 * Process concierge service with AI
 */
export async function processConciergeService(
  requestId: string,
  serviceType: string,
  inputData: any,
  contextData?: any
): Promise<{ success: boolean; output?: any; error?: string }> {
  if (!model) {
    return { success: false, error: 'AI model not configured' }
  }

  try {
    let prompt = ''
    let outputFormat: any = {}

    // Build service-specific prompts
    switch (serviceType) {
      case 'profile_review':
        prompt = buildProfileReviewPrompt(inputData, contextData)
        outputFormat = {
          strengths: 'array of strings',
          improvements: 'array of strings',
          suggestions: 'array of strings',
          overall_score: 'number 0-100'
        }
        break

      case 'message_coaching':
        prompt = buildMessageCoachingPrompt(inputData, contextData)
        outputFormat = {
          improved_message: 'string',
          suggestions: 'array of strings',
          tone_analysis: 'object',
          why_it_works: 'string'
        }
        break

      case 'date_planning':
        prompt = buildDatePlanningPrompt(inputData, contextData)
        outputFormat = {
          suggestions: 'array of date ideas',
          recommended_venue: 'object',
          timing_suggestions: 'array of strings',
          conversation_starters: 'array of strings'
        }
        break

      case 'compatibility_deep_dive':
        prompt = buildCompatibilityDeepDivePrompt(inputData, contextData)
        outputFormat = {
          compatibility_breakdown: 'object',
          shared_values: 'array of strings',
          potential_challenges: 'array of strings',
          growth_opportunities: 'array of strings',
          connection_strengths: 'array of strings'
        }
        break

      case 'photo_review':
        prompt = buildPhotoReviewPrompt(inputData, contextData)
        outputFormat = {
          overall_rating: 'number 1-10',
          strengths: 'array of strings',
          suggestions: 'array of strings',
          best_for: 'string'
        }
        break

      case 'conversation_starter':
        prompt = buildConversationStarterPrompt(inputData, contextData)
        outputFormat = {
          starters: 'array of conversation starter objects with text and why',
          topics: 'array of strings',
          questions: 'array of strings'
        }
        break

      default:
        return { success: false, error: 'Unknown service type' }
    }

    // Call Gemini
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/)
    const jsonText = jsonMatch ? jsonMatch[1] : text
    const output = JSON.parse(jsonText.trim())

    // Update request with results
    if (supabase) {
      await supabase
        .from('concierge_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          output_data: output,
          ai_response: text
        })
        .eq('id', requestId)
    }

    return {
      success: true,
      output
    }
  } catch (error: any) {
    console.error('Error processing concierge service:', error)
    
    // Mark request as failed
    if (supabase) {
      await supabase
        .from('concierge_requests')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', requestId)
    }

    return {
      success: false,
      error: error.message || 'Failed to process service'
    }
  }
}

// Prompt builders for each service type
function buildProfileReviewPrompt(inputData: any, contextData?: any): string {
  return `
You are a profile optimization expert for DAiTE, a social connection platform. Review this user's profile and provide constructive, actionable feedback.

User Profile:
${JSON.stringify(inputData, null, 2)}

Provide feedback in JSON format:
{
  "strengths": ["What they're doing well"],
  "improvements": ["Specific areas to improve"],
  "suggestions": ["Actionable suggestions"],
  "overall_score": 85
}

Be encouraging, specific, and focus on helping them attract meaningful connections.
`
}

function buildMessageCoachingPrompt(inputData: any, contextData?: any): string {
  const message = inputData.message || ''
  const matchContext = contextData?.match || {}

  return `
You are a communication coach for DAiTE. Help improve this message to be more authentic, engaging, and likely to lead to meaningful connection.

Original Message:
"${message}"

Match Context:
${JSON.stringify(matchContext, null, 2)}

Provide an improved version and explain why it works better. Format as JSON:
{
  "improved_message": "The improved message text",
  "suggestions": ["Why this works better", "What changed"],
  "tone_analysis": {
    "warmth": "high",
    "authenticity": "high",
    "engagement": "high"
  },
  "why_it_works": "Brief explanation of why this version is better"
}

Focus on authenticity, warmth, and creating genuine connection.
`
}

function buildDatePlanningPrompt(inputData: any, contextData?: any): string {
  const match = contextData?.match || {}
  const preferences = inputData.preferences || {}

  return `
You are a date planning assistant for DAiTE. Help plan a meaningful gathering between two people.

Match Information:
${JSON.stringify(match, null, 2)}

User Preferences:
${JSON.stringify(preferences, null, 2)}

Suggest date ideas that:
- Align with both people's interests
- Create opportunities for genuine connection
- Are appropriate for the relationship stage
- Consider accessibility and comfort

Format as JSON:
{
  "suggestions": [
    {
      "title": "Date idea name",
      "description": "Why this works",
      "venue_suggestions": ["Venue ideas"],
      "duration": "2-3 hours",
      "why_perfect": "Why this fits them"
    }
  ],
  "recommended_venue": {
    "name": "Best option",
    "why": "Why this venue"
  },
  "timing_suggestions": ["Best times for this date"],
  "conversation_starters": ["Topics to discuss"]
}
`
}

function buildCompatibilityDeepDivePrompt(inputData: any, contextData?: any): string {
  const match = contextData?.match || {}
  const discovery = contextData?.discovery || {}

  return `
You are a relationship compatibility analyst for DAiTE. Provide a deep dive into why two people connect.

Match Information:
${JSON.stringify(match, null, 2)}

Discovery Data:
${JSON.stringify(discovery, null, 2)}

Provide a comprehensive compatibility analysis. Format as JSON:
{
  "compatibility_breakdown": {
    "values": 90,
    "lifestyle": 85,
    "communication": 88,
    "goals": 87
  },
  "shared_values": ["List of shared values"],
  "potential_challenges": ["Honest assessment of potential challenges"],
  "growth_opportunities": ["How they can grow together"],
  "connection_strengths": ["What makes this connection special"]
}

Be honest, insightful, and help them understand both the strengths and areas to navigate.
`
}

function buildPhotoReviewPrompt(inputData: any, contextData?: any): string {
  const photoUrl = inputData.photo_url || ''
  const photoPrompt = inputData.prompt || ''

  return `
You are a profile photo consultant for DAiTE. Review this photo and provide feedback.

Photo Context:
- Prompt: "${photoPrompt}"
- URL: ${photoUrl}

Provide feedback in JSON format:
{
  "overall_rating": 8,
  "strengths": ["What works well about this photo"],
  "suggestions": ["How to improve or what to consider"],
  "best_for": "primary photo / secondary photo / not recommended"
}

Focus on authenticity, clarity, and how well it represents the person.
`
}

function buildConversationStarterPrompt(inputData: any, contextData?: any): string {
  const match = contextData?.match || {}
  const discovery = contextData?.discovery || {}

  return `
You are a conversation coach for DAiTE. Generate personalized conversation starters for two people who just matched.

Match Information:
${JSON.stringify(match, null, 2)}

Discovery Insights:
${JSON.stringify(discovery, null, 2)}

Create conversation starters that:
- Reference their shared connection/narrative
- Are authentic and warm
- Open doors to deeper conversation
- Feel natural, not forced

Format as JSON:
{
  "starters": [
    {
      "text": "The conversation starter",
      "why": "Why this works well"
    }
  ],
  "topics": ["Topics they might enjoy discussing"],
  "questions": ["Thoughtful questions to ask"]
}
`
}

