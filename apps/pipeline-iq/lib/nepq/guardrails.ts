/**
 * NEPQ Guardrails - Single Source of Truth
 * 
 * This is the shared contract the whole system obeys.
 * Not copy templates. Decision constraints.
 * 
 * Answers:
 * - What the system is allowed to say
 * - What it must never say
 * - When it should advance
 * - When it should pause
 */

import { NEPQStage } from './framework'

// Stage order for numeric comparison (string enums don't support < > operators)
const STAGE_ORDER: Record<NEPQStage, number> = {
  [NEPQStage.CONNECTING]: 0,
  [NEPQStage.ENGAGEMENT]: 1,
  [NEPQStage.TRANSITION]: 2,
  [NEPQStage.PRESENTATION]: 3,
  [NEPQStage.COMMITMENT]: 4,
}

// ===========================================
// NEPQ STAGE → OUTREACH STATUS MAPPING
// ===========================================

/**
 * Maps NEPQ stages to outreach_status values
 * This prevents status drift and ensures NEPQ alignment
 */
export const NEPQ_STATUS_MAP: Record<NEPQStage, string[]> = {
  [NEPQStage.CONNECTING]: ['new', 'contacted'], // First contact, building trust
  [NEPQStage.ENGAGEMENT]: ['contacted', 'follow_up_needed'], // Discovering pain
  [NEPQStage.TRANSITION]: ['contacted', 'interested'], // Creating urgency, emotional gap
  [NEPQStage.PRESENTATION]: ['interested', 'proposal_sent'], // Solution framing
  [NEPQStage.COMMITMENT]: ['proposal_sent', 'negotiating', 'won'], // Securing decision
}

/**
 * Get current NEPQ stage from outreach_status
 */
export function getNEPQStageFromStatus(outreachStatus: string): NEPQStage {
  // Map status to stage
  if (['new', 'contacted'].includes(outreachStatus)) {
    return NEPQStage.CONNECTING
  }
  if (['follow_up_needed'].includes(outreachStatus)) {
    return NEPQStage.ENGAGEMENT
  }
  if (['interested'].includes(outreachStatus)) {
    return NEPQStage.TRANSITION
  }
  if (['proposal_sent'].includes(outreachStatus)) {
    return NEPQStage.PRESENTATION
  }
  if (['negotiating', 'won'].includes(outreachStatus)) {
    return NEPQStage.COMMITMENT
  }
  
  // Default to connecting for unknown statuses
  return NEPQStage.CONNECTING
}

/**
 * Check if status transition is NEPQ-valid
 * Prevents skipping stages
 */
export function isValidNEPQTransition(
  currentStatus: string,
  newStatus: string
): { valid: boolean; reason?: string } {
  const currentStage = getNEPQStageFromStatus(currentStatus)
  const newStage = getNEPQStageFromStatus(newStatus)
  const currentOrder = STAGE_ORDER[currentStage]
  const newOrder = STAGE_ORDER[newStage]

  // Can't go backwards (except to 'not_interested' or 'lost')
  if (newOrder < currentOrder && !['not_interested', 'lost'].includes(newStatus)) {
    return {
      valid: false,
      reason: `Cannot go backwards from ${currentStage} to ${newStage}. Current stage: ${currentStage}`,
    }
  }

  // Can't skip more than one stage
  const stageDiff = newOrder - currentOrder
  if (stageDiff > 1 && !['not_interested', 'lost'].includes(newStatus)) {
    return {
      valid: false,
      reason: `Cannot skip stages. Current: ${currentStage}, Attempted: ${newStage}`,
    }
  }
  
  return { valid: true }
}

// ===========================================
// NEPQ GUARDRAILS BY CONTEXT
// ===========================================

export interface NEPQGuardrails {
  // What is allowed
  allowedLanguage: string[]
  allowedActions: string[]
  
  // What is forbidden
  forbiddenLanguage: string[]
  forbiddenActions: string[]
  
  // When to advance
  advanceCriteria: {
    required: string[]
    optional: string[]
  }
  
  // When to pause
  pauseTriggers: string[]
  
  // Timing constraints
  minTimeInStage?: number // hours
  maxFollowUps?: number
  followUpDelay?: number // hours
}

/**
 * Get NEPQ guardrails for a specific stage
 */
export function getNEPQGuardrails(stage: NEPQStage): NEPQGuardrails {
  const guardrails: Record<NEPQStage, NEPQGuardrails> = {
    [NEPQStage.CONNECTING]: {
      allowedLanguage: [
        'curiosity-based questions',
        'permission requests',
        'neutral observations',
        'validation statements',
      ],
      allowedActions: [
        'ask permission to continue',
        'validate their situation',
        'show genuine curiosity',
        'build rapport',
      ],
      forbiddenLanguage: [
        'hard selling',
        'product features',
        'pricing',
        'closing language',
        'urgency pressure',
        'assumptive closes',
      ],
      forbiddenActions: [
        'pitch solutions',
        'mention pricing',
        'ask for commitment',
        'create false urgency',
      ],
      advanceCriteria: {
        required: ['response_received'],
        optional: ['engagement_score > 20'],
      },
      pauseTriggers: [
        'no response after 3 attempts',
        'explicit rejection',
      ],
      minTimeInStage: 0, // Can advance immediately on response
      maxFollowUps: 3,
      followUpDelay: 72, // 3 days
    },
    
    [NEPQStage.ENGAGEMENT]: {
      allowedLanguage: [
        'open-ended questions',
        'discovery questions',
        'situation questions',
        'problem questions',
      ],
      allowedActions: [
        'ask about current reality',
        'uncover challenges',
        'understand context',
        'listen actively',
      ],
      forbiddenLanguage: [
        'jumping to solutions',
        'feature lists',
        'assumptions',
        'interrupting',
      ],
      forbiddenActions: [
        'present solutions',
        'assume needs',
        'skip to presentation',
      ],
      advanceCriteria: {
        required: ['pain_identified', 'challenges_understood'],
        optional: ['engagement_score > 40'],
      },
      pauseTriggers: [
        'no engagement after 2 attempts',
        'explicit "not interested"',
      ],
      minTimeInStage: 24, // Must spend at least 1 day in discovery
      maxFollowUps: 2,
      followUpDelay: 48, // 2 days
    },
    
    [NEPQStage.TRANSITION]: {
      allowedLanguage: [
        'consequence questions',
        'implication questions',
        'future visualization',
        'cost of inaction',
      ],
      allowedActions: [
        'create emotional gap',
        'quantify consequences',
        'link to identity/status',
        'visualize future pain',
      ],
      forbiddenLanguage: [
        'being pushy',
        'false urgency',
        'manipulation',
        'fear mongering',
      ],
      forbiddenActions: [
        'create false deadlines',
        'manipulate emotions',
        'pressure tactics',
      ],
      advanceCriteria: {
        required: ['emotional_gap_created', 'consequences_acknowledged'],
        optional: ['engagement_score > 60'],
      },
      pauseTriggers: [
        'resistance increases',
        'explicit rejection',
      ],
      minTimeInStage: 48, // Must spend at least 2 days in transition
      maxFollowUps: 3,
      followUpDelay: 48, // 2 days
    },
    
    [NEPQStage.PRESENTATION]: {
      allowedLanguage: [
        'solution framing',
        'link to stated needs',
        'social proof',
        'authority statements',
      ],
      allowedActions: [
        'present solution',
        'link to their needs',
        'provide social proof',
        'show authority',
      ],
      forbiddenLanguage: [
        'feature lists',
        'generic benefits',
        'over-promising',
        'high pressure',
      ],
      forbiddenActions: [
        'dump features',
        'over-promise',
        'hard close',
      ],
      advanceCriteria: {
        required: ['solution_presented', 'needs_linked'],
        optional: ['engagement_score > 70'],
      },
      pauseTriggers: [
        'explicit rejection',
        'budget concerns',
      ],
      minTimeInStage: 24, // Must spend at least 1 day in presentation
      maxFollowUps: 2,
      followUpDelay: 72, // 3 days
    },
    
    [NEPQStage.COMMITMENT]: {
      allowedLanguage: [
        'consistency questions',
        'check-in questions',
        'choice architecture',
        'reinforcement',
      ],
      allowedActions: [
        'get small yeses',
        'provide options',
        'reinforce decision',
        'secure commitment',
      ],
      forbiddenLanguage: [
        'hard closes',
        'manipulation',
        'pressure tactics',
        'assumptive closes',
      ],
      forbiddenActions: [
        'manipulate',
        'pressure',
        'assume commitment',
      ],
      advanceCriteria: {
        required: ['commitment_secured'],
        optional: ['engagement_score > 80'],
      },
      pauseTriggers: [
        'explicit rejection',
        'budget constraints',
      ],
      minTimeInStage: 0, // Can close immediately
      maxFollowUps: 1,
      followUpDelay: 24, // 1 day
    },
  }
  
  return guardrails[stage]
}

// ===========================================
// NEPQ VALIDATION FUNCTIONS
// ===========================================

/**
 * Validate if content passes NEPQ guardrails
 */
export function validateNEPQContent(
  content: string,
  stage: NEPQStage
): { valid: boolean; violations: string[]; suggestions: string[] } {
  const guardrails = getNEPQGuardrails(stage)
  const violations: string[] = []
  const suggestions: string[] = []
  
  const contentLower = content.toLowerCase()
  
  // Check for forbidden language
  guardrails.forbiddenLanguage.forEach((forbidden) => {
    // Simple keyword check (can be enhanced with NLP)
    if (contentLower.includes(forbidden.toLowerCase())) {
      violations.push(`Contains forbidden language: "${forbidden}"`)
      suggestions.push(`Use stage-appropriate language from: ${guardrails.allowedLanguage.join(', ')}`)
    }
  })
  
  // Check for forbidden actions (in context)
  guardrails.forbiddenActions.forEach((forbidden) => {
    // This would need more sophisticated parsing
    // For now, just flag if content seems to be doing forbidden action
    if (forbidden.includes('pitch') && contentLower.includes('we offer') && contentLower.includes('features')) {
      violations.push(`Appears to be pitching features (forbidden in ${stage})`)
      suggestions.push('Focus on their needs, not your features')
    }
  })
  
  return {
    valid: violations.length === 0,
    violations,
    suggestions,
  }
}

/**
 * Check if action is allowed in current NEPQ stage
 */
export function isActionAllowed(
  action: string,
  stage: NEPQStage
): { allowed: boolean; reason?: string } {
  const guardrails = getNEPQGuardrails(stage)
  
  // Check if action is explicitly forbidden
  if (guardrails.forbiddenActions.some((forbidden) => action.toLowerCase().includes(forbidden.toLowerCase()))) {
    return {
      allowed: false,
      reason: `Action "${action}" is forbidden in ${stage} stage`,
    }
  }
  
  // Check if action is explicitly allowed
  if (guardrails.allowedActions.some((allowed) => action.toLowerCase().includes(allowed.toLowerCase()))) {
    return { allowed: true }
  }
  
  // Default: allow if not explicitly forbidden
  return { allowed: true }
}

/**
 * Check if status transition is NEPQ-valid
 * Used when updating outreach_status
 */
export function canAdvanceStage(
  currentStatus: string,
  newStatus: string,
  context: {
    engagementScore?: number
    painIdentified?: boolean
    solutionPresented?: boolean
    commitmentSecured?: boolean
  }
): { canAdvance: boolean; reason?: string; requiredActions?: string[] } {
  // Check basic transition validity
  const transitionCheck = isValidNEPQTransition(currentStatus, newStatus)
  if (!transitionCheck.valid) {
    return {
      canAdvance: false,
      reason: transitionCheck.reason,
    }
  }
  
  const currentStage = getNEPQStageFromStatus(currentStatus)
  const guardrails = getNEPQGuardrails(currentStage)
  
  // Check if advance criteria are met
  const missingRequired: string[] = []
  
  guardrails.advanceCriteria.required.forEach((criteria) => {
    if (criteria === 'response_received' && !context.engagementScore) {
      missingRequired.push('response_received')
    }
    if (criteria === 'pain_identified' && !context.painIdentified) {
      missingRequired.push('pain_identified')
    }
    if (criteria === 'solution_presented' && !context.solutionPresented) {
      missingRequired.push('solution_presented')
    }
    if (criteria === 'commitment_secured' && !context.commitmentSecured) {
      missingRequired.push('commitment_secured')
    }
  })
  
  if (missingRequired.length > 0) {
    return {
      canAdvance: false,
      reason: `Cannot advance: missing required criteria: ${missingRequired.join(', ')}`,
      requiredActions: missingRequired,
    }
  }
  
  return { canAdvance: true }
}

// ===========================================
// NEPQ TIMING RULES
// ===========================================

/**
 * Get follow-up timing based on NEPQ stage and engagement
 */
export function getNEPQFollowUpTiming(
  stage: NEPQStage,
  engagementLevel: 'none' | 'low' | 'medium' | 'high'
): { delayHours: number; maxAttempts: number } {
  const guardrails = getNEPQGuardrails(stage)
  
  // Adjust delay based on engagement
  let delayHours = guardrails.followUpDelay || 72
  
  if (engagementLevel === 'high') {
    delayHours = Math.max(24, delayHours / 2) // Faster for high engagement
  } else if (engagementLevel === 'none') {
    delayHours = delayHours * 1.5 // Slower for no engagement
  }
  
  return {
    delayHours,
    maxAttempts: guardrails.maxFollowUps || 3,
  }
}

/**
 * Check if it's time to pause/stop following up
 */
export function shouldPauseFollowUp(
  stage: NEPQStage,
  attemptCount: number,
  lastResponseDate?: Date
): { shouldPause: boolean; reason?: string } {
  const guardrails = getNEPQGuardrails(stage)
  
  // Check max attempts
  if (attemptCount >= (guardrails.maxFollowUps || 3)) {
    return {
      shouldPause: true,
      reason: `Reached maximum follow-ups (${guardrails.maxFollowUps}) for ${stage} stage`,
    }
  }
  
  // Check pause triggers (would need more context)
  // This is a placeholder for more sophisticated logic
  
  return { shouldPause: false }
}

// ===========================================
// EXPORT SINGLE CONFIG OBJECT
// ===========================================

/**
 * Single NEPQ Guardrail Config
 * This is what the whole system references
 */
export const NEPQ_GUARDRAILS = {
  getGuardrails: getNEPQGuardrails,
  validateContent: validateNEPQContent,
  isActionAllowed: isActionAllowed,
  canAdvanceStage: canAdvanceStage,
  getFollowUpTiming: getNEPQFollowUpTiming,
  shouldPauseFollowUp: shouldPauseFollowUp,
  getStageFromStatus: getNEPQStageFromStatus,
  isValidTransition: isValidNEPQTransition,
  statusMap: NEPQ_STATUS_MAP,
} as const

