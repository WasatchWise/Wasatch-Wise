/**
 * OpenAI Integration
 * GPT-4 powered analysis and content generation
 */

import OpenAI from 'openai'
import { logger } from '@/lib/logger'
import { safeJsonParse } from '@/lib/api/errors'
import { getOrganizationConfig } from '@/lib/config/organization'

// Lazy-initialize OpenAI client
let openaiClient: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

// ============================================
// Safe OpenAI Call Wrapper
// ============================================

interface OpenAICallOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

async function safeOpenAICall<T>(
  systemPrompt: string,
  userPrompt: string,
  options: OpenAICallOptions = {},
  fallback: T
): Promise<T> {
  const {
    model = 'gpt-4-turbo-preview',
    temperature = 0.7,
    maxTokens = 2000,
    jsonMode = true,
  } = options

  try {
    const openai = getOpenAI()

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      temperature,
      max_tokens: maxTokens,
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      logger.warn('Empty response from OpenAI')
      return fallback
    }

    if (jsonMode) {
      return safeJsonParse<T>(content, fallback)
    }

    return content as unknown as T
  } catch (error) {
    logger.error('OpenAI API call failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return fallback
  }
}

// ============================================
// Project Analysis
// ============================================

export interface ProjectAnalysis {
  decision_factors: string[]
  technology_needs: string[]
  objections: string[]
  positioning: string
  competitive_advantages: string[]
  outreach_strategy: string
}

export async function analyzeProjectDescription(
  description: string,
  projectData: {
    project_name: string
    project_type?: string[]
    project_stage?: string
    project_value?: number
    city?: string
    state?: string
  }
): Promise<ProjectAnalysis | null> {
  const prompt = `Analyze this construction project and extract key insights:

Project: ${projectData.project_name}
Type: ${projectData.project_type?.join(', ') || 'Unknown'}
Stage: ${projectData.project_stage || 'Unknown'}
Value: $${projectData.project_value?.toLocaleString() || 'Unknown'}
Location: ${projectData.city || 'Unknown'}, ${projectData.state || 'Unknown'}

Description: ${description}

Extract:
1. Key decision factors (timeline, budget constraints, priorities)
2. Technology needs (WiFi, TV, security, automation, etc.)
3. Potential objections or concerns
4. Best approach to position services
5. Competitive advantages to highlight
6. Optimal outreach timing and strategy

Format as JSON with keys: decision_factors, technology_needs, objections, positioning, competitive_advantages, outreach_strategy`

  const systemPrompt =
    'You are an expert construction technology sales strategist specializing in hospitality, multifamily, and senior living projects. Always respond with valid JSON.'

  return safeOpenAICall<ProjectAnalysis | null>(systemPrompt, prompt, { temperature: 0.7 }, null)
}

// ============================================
// Email Generation
// ============================================

export interface PersonalizedEmail {
  subject: string
  body: string
  best_send_time: string
  follow_up_days: number
}

export async function generatePersonalizedEmail(params: {
  contact: {
    first_name?: string
    last_name?: string
    title?: string
    role_category?: string
    decision_level?: string
  }
  project: {
    project_name: string
    project_type?: string[]
    project_stage?: string
    project_value?: number
    city?: string
    state?: string
    units_count?: number
  }
  template: string
  company?: { company_name?: string }
  previousInteractions?: unknown[]
}): Promise<PersonalizedEmail> {
  const { contact, project, template, company, previousInteractions } = params

  // Get organization config for personalization
  const orgConfig = await getOrganizationConfig()

  const prompt = `Generate a highly personalized sales email using NEPQ (Neuro-Emotional Persuasion Questioning) principles:

CONTACT:
- Name: ${contact.first_name || ''} ${contact.last_name || ''}
- Title: ${contact.title || 'Unknown'}
- Role: ${contact.role_category || 'Unknown'}
- Decision Level: ${contact.decision_level || 'Unknown'}
- Company: ${company?.company_name || 'Unknown'}

PROJECT:
- Name: ${project.project_name}
- Type: ${project.project_type?.join(', ') || 'Unknown'}
- Stage: ${project.project_stage || 'Unknown'}
- Value: $${project.project_value?.toLocaleString() || 'Unknown'}
- Location: ${project.city || 'Unknown'}, ${project.state || 'Unknown'}
- Units: ${project.units_count || 'N/A'}

TEMPLATE BASE:
${template}

CONTEXT:
${previousInteractions?.length ? `Previous interactions: ${previousInteractions.length} touchpoints` : 'First contact'}

NEPQ REQUIREMENTS (Critical):
1. Use neutral, low-pressure language (avoid "must", "urgent", "act now" unless appropriate)
2. Ask permission-based questions ("Would you be open to...")
3. Focus on their pain points and challenges, not product features
4. Use loss framing for urgency (cost of inaction) rather than gain framing
5. Include discovery questions to understand their situation
6. Build trust through empathy and validation
7. Keep it conversational and under 200 words
8. Use consultative tone, not salesy

BEHAVIORAL ECONOMICS PRINCIPLES:
- Loss Aversion: Frame inaction as a loss
- Social Proof: Mention similar project successes
- Authority: Reference expertise and awards
- Scarcity: Only if genuine (timing, opportunity)
- Reciprocity: Provide value first (insights, questions)

Return JSON with:
- subject: Email subject line (under 60 chars, compelling, non-salesy)
- body: Email body (personalized, authentic, NEPQ-aligned)
- best_send_time: Recommended time to send (morning/afternoon/evening)
- follow_up_days: Suggested days until follow-up`

  const systemPrompt = orgConfig.ai.systemPrompt

  return safeOpenAICall<PersonalizedEmail>(
    systemPrompt,
    prompt,
    { temperature: 0.8 },
    {
      subject: `Quick question about ${project.project_name}`,
      body: template,
      best_send_time: 'morning',
      follow_up_days: 3,
    }
  )
}

// ============================================
// A/B Test Variants
// ============================================

export interface ABTestVariants {
  variantA: { subject: string; body: string; approach_description: string }
  variantB: { subject: string; body: string; approach_description: string }
}

export async function generateABTestVariants(originalEmail: {
  subject: string
  body: string
}): Promise<ABTestVariants | null> {
  const prompt = `Generate 2 alternative versions of this sales email for A/B testing:

ORIGINAL:
Subject: ${originalEmail.subject}
Body: ${originalEmail.body}

Create 2 variants that test different approaches:
- Variant A: More direct/urgent approach
- Variant B: More consultative/educational approach

Each variant should feel natural and test a meaningfully different angle.

Return JSON: { variantA: { subject, body, approach_description }, variantB: { subject, body, approach_description } }`

  const systemPrompt =
    'You are an expert email marketer specializing in B2B construction technology sales. Always respond with valid JSON.'

  return safeOpenAICall<ABTestVariants | null>(
    systemPrompt,
    prompt,
    { temperature: 0.9 },
    null
  )
}

// ============================================
// Sentiment Analysis
// ============================================

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  interest_level: 'high' | 'medium' | 'low'
  buying_signals: string[]
  objections: string[]
  next_action: string
  urgency: 'high' | 'medium' | 'low'
}

export async function analyzeSentiment(emailText: string): Promise<SentimentAnalysis | null> {
  const systemPrompt =
    'Analyze the sentiment and buying signals in this email response. Return JSON with: sentiment (positive/neutral/negative), interest_level (high/medium/low), buying_signals (array), objections (array), next_action (string), urgency (high/medium/low)'

  return safeOpenAICall<SentimentAnalysis | null>(
    systemPrompt,
    emailText,
    { model: 'gpt-3.5-turbo', temperature: 0.3 },
    null
  )
}

// ============================================
// Project Insights
// ============================================

export interface ProjectInsights {
  competitive_landscape: string
  key_stakeholders: string[]
  technology_packages: string[]
  close_probability: number
  revenue_opportunity: number
  strategic_approach: string[]
  risk_factors: string[]
}

export async function generateProjectInsights(project: unknown): Promise<ProjectInsights | null> {
  const prompt = `Analyze this construction project and provide strategic insights:

${JSON.stringify(project, null, 2)}

Provide:
1. Competitive landscape analysis
2. Key stakeholders we should target
3. Potential technology packages to pitch
4. Estimated close probability (0-100)
5. Revenue opportunity ($)
6. Strategic approach recommendations
7. Risk factors

Return as JSON with keys: competitive_landscape, key_stakeholders, technology_packages, close_probability, revenue_opportunity, strategic_approach, risk_factors`

  const systemPrompt =
    'You are a senior sales strategist with 20 years experience closing technology deals in construction projects. Always respond with valid JSON.'

  return safeOpenAICall<ProjectInsights | null>(
    systemPrompt,
    prompt,
    { temperature: 0.6 },
    null
  )
}

// ============================================
// Action Items Extraction
// ============================================

export interface ActionItems {
  action_items: Array<{ task: string; priority: string; due_date?: string }>
  key_decisions: string[]
  next_steps: string[]
  blockers: string[]
  opportunities: string[]
}

export async function extractActionItems(
  conversationHistory: unknown[]
): Promise<ActionItems | null> {
  const prompt = `Review this conversation and extract action items:

${JSON.stringify(conversationHistory, null, 2)}

Return JSON with:
- action_items: Array of specific tasks with priority and due date
- key_decisions: Important decisions made
- next_steps: Recommended next actions
- blockers: Any obstacles mentioned
- opportunities: New opportunities identified`

  const systemPrompt =
    'You are an AI assistant that helps sales teams stay organized and never miss opportunities. Always respond with valid JSON.'

  return safeOpenAICall<ActionItems | null>(
    systemPrompt,
    prompt,
    { temperature: 0.4 },
    null
  )
}
