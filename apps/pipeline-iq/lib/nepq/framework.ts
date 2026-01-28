/**
 * NEPQ Framework Implementation
 * Neuro-Emotional Persuasion Questioning (NEPQ) - 5 Stage Architecture
 * 
 * Based on Jeremy Miner's NEPQ methodology and 7th Level Communications
 */

export enum NEPQStage {
  CONNECTING = 'connecting',
  ENGAGEMENT = 'engagement',
  TRANSITION = 'transition',
  PRESENTATION = 'presentation',
  COMMITMENT = 'commitment',
}

export interface NEPQStageConfig {
  stage: NEPQStage
  objective: string
  keyQuestionTypes: string[]
  psychologicalOutcome: string
  neurochemicalTarget: 'oxytocin' | 'dopamine' | 'cortisol' | 'serotonin' | 'none'
  systemTarget: 'system1' | 'system2' | 'both'
  duration: string // Percentage of conversation time
}

export const NEPQ_STAGES: Record<NEPQStage, NEPQStageConfig> = {
  [NEPQStage.CONNECTING]: {
    stage: NEPQStage.CONNECTING,
    objective: 'Disarm resistance, build trust, establish rapport',
    keyQuestionTypes: ['neutralizing', 'rapport', 'permission'],
    psychologicalOutcome: 'Resistance lowered, receptivity maximized',
    neurochemicalTarget: 'oxytocin',
    systemTarget: 'system1',
    duration: '10%',
  },
  [NEPQStage.ENGAGEMENT]: {
    stage: NEPQStage.ENGAGEMENT,
    objective: 'Uncover current reality and surface pain points',
    keyQuestionTypes: ['situation', 'problem', 'discovery'],
    psychologicalOutcome: 'Clear articulation of current reality and surface pain',
    neurochemicalTarget: 'none',
    systemTarget: 'system1',
    duration: '35%', // 85% total for engagement + transition
  },
  [NEPQStage.TRANSITION]: {
    stage: NEPQStage.TRANSITION,
    objective: 'Create emotional gap between current state and desired future',
    keyQuestionTypes: ['consequence', 'implication', 'solution_awareness'],
    psychologicalOutcome: 'Prospect recognizes deep, negative costs of inaction; emotional anchoring',
    neurochemicalTarget: 'dopamine', // Anticipation of relief
    systemTarget: 'system1',
    duration: '50%', // Critical stage - most time spent here
  },
  [NEPQStage.PRESENTATION]: {
    stage: NEPQStage.PRESENTATION,
    objective: 'Frame solution as necessary path to alleviate pain',
    keyQuestionTypes: ['solution_awareness', 'authority', 'social_proof'],
    psychologicalOutcome: 'Solution framed as self-determined necessary path',
    neurochemicalTarget: 'serotonin', // Certainty and status assurance
    systemTarget: 'system2',
    duration: '3%',
  },
  [NEPQStage.COMMITMENT]: {
    stage: NEPQStage.COMMITMENT,
    objective: 'Secure decision through consistency and ownership',
    keyQuestionTypes: ['consistency', 'check_in', 'commitment'],
    psychologicalOutcome: 'Prospect self-persuades, feeling alignment between solution and need',
    neurochemicalTarget: 'serotonin', // Final certainty
    systemTarget: 'both',
    duration: '2%',
  },
}

/**
 * Determine which NEPQ stage to use based on context
 */
export function determineNEPQStage(context: {
  isFirstContact: boolean
  hasResponded: boolean
  engagementLevel: 'low' | 'medium' | 'high'
  painIdentified: boolean
  solutionPresented: boolean
}): NEPQStage {
  const { isFirstContact, hasResponded, engagementLevel, painIdentified, solutionPresented } = context

  // First contact - start with connecting
  if (isFirstContact) {
    return NEPQStage.CONNECTING
  }

  // No response yet - focus on engagement/transition
  if (!hasResponded) {
    if (!painIdentified) {
      return NEPQStage.ENGAGEMENT
    }
    return NEPQStage.TRANSITION
  }

  // They responded - move to presentation/commitment
  if (hasResponded && !solutionPresented) {
    return NEPQStage.PRESENTATION
  }

  if (solutionPresented) {
    return NEPQStage.COMMITMENT
  }

  // Default to transition (most critical stage)
  return NEPQStage.TRANSITION
}

/**
 * Get the strategic focus for a given NEPQ stage
 */
export function getStageFocus(stage: NEPQStage): {
  primaryGoal: string
  keyTactics: string[]
  languagePatterns: string[]
  avoid: string[]
} {
  const focuses: Record<NEPQStage, ReturnType<typeof getStageFocus>> = {
    [NEPQStage.CONNECTING]: {
      primaryGoal: 'Lower resistance and build trust',
      keyTactics: [
        'Use neutral, non-salesy language',
        'Ask permission-based questions',
        'Validate their current situation',
        'Show genuine curiosity',
      ],
      languagePatterns: [
        'Would you be open to...',
        "I'm curious about...",
        'Help me understand...',
        "What's your experience with...",
      ],
      avoid: [
        'Hard selling',
        'Product features',
        'Pricing',
        'Closing language',
      ],
    },
    [NEPQStage.ENGAGEMENT]: {
      primaryGoal: 'Discover pain and current reality',
      keyTactics: [
        'Ask open-ended questions',
        'Listen actively (85% of time)',
        'Uncover specific challenges',
        'Understand their context',
      ],
      languagePatterns: [
        'Tell me about...',
        'What challenges are you facing...',
        'How is that impacting...',
        'What does that look like for you...',
      ],
      avoid: [
        'Jumping to solutions',
        'Interrupting',
        'Assuming needs',
        'Feature dumping',
      ],
    },
    [NEPQStage.TRANSITION]: {
      primaryGoal: 'Create emotional gap and urgency',
      keyTactics: [
        'Use consequence questions',
        'Visualize future pain',
        'Quantify cost of inaction',
        'Link to identity/status',
      ],
      languagePatterns: [
        'What happens if this continues...',
        'How does that impact your team...',
        "What's the cost of waiting...",
        'Who does this affect...',
      ],
      avoid: [
        'Being pushy',
        'Creating false urgency',
        'Manipulation',
        'Fear mongering',
      ],
    },
    [NEPQStage.PRESENTATION]: {
      primaryGoal: 'Present solution as natural answer',
      keyTactics: [
        'Link to their stated needs',
        'Use social proof',
        'Show authority',
        'Provide logical justification',
      ],
      languagePatterns: [
        'Based on what you told me...',
        'Similar projects have...',
        "Here's how we've helped...",
        'This directly addresses...',
      ],
      avoid: [
        'Feature lists',
        'Generic benefits',
        'Over-promising',
        'High pressure',
      ],
    },
    [NEPQStage.COMMITMENT]: {
      primaryGoal: 'Secure natural commitment',
      keyTactics: [
        'Use consistency questions',
        'Get small yeses',
        'Provide options (choice architecture)',
        'Reinforce their decision',
      ],
      languagePatterns: [
        'Does this make sense?',
        'How does this look to you?',
        'What would you like to do next?',
        'Are you comfortable with...',
      ],
      avoid: [
        'Hard closes',
        'Manipulation',
        'Pressure tactics',
        'Assumptive closes',
      ],
    },
  }

  return focuses[stage]
}

/**
 * Check if language aligns with NEPQ principles
 */
export function validateNEPQLanguage(text: string, stage: NEPQStage): {
  isValid: boolean
  issues: string[]
  suggestions: string[]
} {
  const focus = getStageFocus(stage)
  const issues: string[] = []
  const suggestions: string[] = []

  // Check for avoided patterns
  focus.avoid.forEach((avoidPattern) => {
    if (text.toLowerCase().includes(avoidPattern.toLowerCase())) {
      issues.push(`Contains avoided pattern: "${avoidPattern}"`)
      suggestions.push(`Consider using stage-appropriate language from: ${focus.languagePatterns.join(', ')}`)
    }
  })

  // Check for appropriate patterns
  const hasAppropriatePattern = focus.languagePatterns.some((pattern) =>
    text.toLowerCase().includes(pattern.toLowerCase())
  )

  if (!hasAppropriatePattern && stage !== NEPQStage.PRESENTATION) {
    issues.push('Missing stage-appropriate language patterns')
    suggestions.push(`Consider using: ${focus.languagePatterns.join(', ')}`)
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  }
}

/**
 * Calculate NEPQ alignment score for content
 */
export function calculateNEPQAlignmentScore(
  content: string,
  stage: NEPQStage
): number {
  const validation = validateNEPQLanguage(content, stage)
  const focus = getStageFocus(stage)

  let score = 100

  // Deduct for issues
  score -= validation.issues.length * 20

  // Bonus for appropriate patterns
  const appropriatePatternCount = focus.languagePatterns.filter((pattern) =>
    content.toLowerCase().includes(pattern.toLowerCase())
  ).length
  score += appropriatePatternCount * 5

  // Check for neutral, low-pressure tone
  const highPressureWords = ['must', 'urgent', 'limited time', 'act now', 'don\'t miss']
  const hasHighPressure = highPressureWords.some((word) =>
    content.toLowerCase().includes(word)
  )
  if (hasHighPressure && stage !== NEPQStage.TRANSITION) {
    score -= 15
  }

  return Math.max(0, Math.min(100, score))
}

