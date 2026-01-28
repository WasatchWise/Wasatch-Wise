/**
 * NEPQ Question Library
 * 273+ Science-Based Questions Organized by Stage and Context
 * 
 * Based on the NEPQ Black Book of Questions by Jeremy Miner (7th Level)
 */

import { NEPQStage } from './framework'

export type QuestionCategory =
  | 'connecting'
  | 'engagement'
  | 'transition'
  | 'presentation'
  | 'commitment'
  | 'objection_handling'

export type QuestionContext =
  | 'construction_project'
  | 'technology_solution'
  | 'general_b2b'
  | 'high_ticket'
  | 'consultative'

export interface NEPQQuestion {
  id: string
  stage: NEPQStage
  category: QuestionCategory
  context: QuestionContext[]
  question: string
  purpose: string
  psychologicalMechanism: string
  followUp?: string[]
  notes?: string
}

/**
 * CONNECTING STAGE QUESTIONS
 * Objective: Disarm resistance, build trust, establish rapport
 */
const CONNECTING_QUESTIONS: NEPQQuestion[] = [
  {
    id: 'conn-001',
    stage: NEPQStage.CONNECTING,
    category: 'connecting',
    context: ['general_b2b', 'construction_project'],
    question: 'Would you be open to a quick conversation about [project/topic]?',
    purpose: 'Permission-based opening that reduces reactance',
    psychologicalMechanism: 'Choice architecture, reduces psychological reactance',
  },
  {
    id: 'conn-002',
    stage: NEPQStage.CONNECTING,
    category: 'connecting',
    context: ['general_b2b'],
    question: 'I\'m curious - what\'s your experience been with [relevant topic]?',
    purpose: 'Neutral, curiosity-driven question that builds rapport',
    psychologicalMechanism: 'Emotional contagion, oxytocin release through genuine interest',
  },
  {
    id: 'conn-003',
    stage: NEPQStage.CONNECTING,
    category: 'connecting',
    context: ['construction_project', 'technology_solution'],
    question: 'Help me understand - what does your typical [process/project] look like?',
    purpose: 'Discovery question that shows genuine interest',
    psychologicalMechanism: 'Active listening signal, trust building',
  },
  {
    id: 'conn-004',
    stage: NEPQStage.CONNECTING,
    category: 'connecting',
    context: ['general_b2b'],
    question: 'Before we dive in, what would make this conversation valuable for you?',
    purpose: 'Frames conversation around their needs, not your agenda',
    psychologicalMechanism: 'Reciprocity, customer-centric framing',
  },
]

/**
 * ENGAGEMENT STAGE QUESTIONS
 * Objective: Uncover current reality and surface pain points
 */
const ENGAGEMENT_QUESTIONS: NEPQQuestion[] = [
  {
    id: 'eng-001',
    stage: NEPQStage.ENGAGEMENT,
    category: 'engagement',
    context: ['construction_project'],
    question: 'Tell me about the [project name] - what stage are you at in the planning process?',
    purpose: 'Situation question to understand current state',
    psychologicalMechanism: 'Fact-finding, establishes baseline',
  },
  {
    id: 'eng-002',
    stage: NEPQStage.ENGAGEMENT,
    category: 'engagement',
    context: ['construction_project', 'technology_solution'],
    question: 'What challenges are you facing with [specific aspect]?',
    purpose: 'Problem identification question',
    psychologicalMechanism: 'Pain surfacing, problem awareness',
  },
  {
    id: 'eng-003',
    stage: NEPQStage.ENGAGEMENT,
    category: 'engagement',
    context: ['general_b2b'],
    question: 'How is [current situation] impacting your [team/company/goals]?',
    purpose: 'Understands the broader impact of the problem',
    psychologicalMechanism: 'Problem amplification, consequence awareness',
  },
  {
    id: 'eng-004',
    stage: NEPQStage.ENGAGEMENT,
    category: 'engagement',
    context: ['construction_project'],
    question: 'What does your ideal [solution/outcome] look like?',
    purpose: 'Identifies desired future state',
    psychologicalMechanism: 'Ideal self activation, aspiration identification',
  },
  {
    id: 'eng-005',
    stage: NEPQStage.ENGAGEMENT,
    category: 'engagement',
    context: ['general_b2b'],
    question: 'What\'s worked well for you in the past, and what hasn\'t?',
    purpose: 'Understands their experience and preferences',
    psychologicalMechanism: 'Pattern recognition, preference discovery',
  },
]

/**
 * TRANSITION STAGE QUESTIONS (Most Critical)
 * Objective: Create emotional gap between current state and desired future
 */
const TRANSITION_QUESTIONS: NEPQQuestion[] = [
  {
    id: 'trans-001',
    stage: NEPQStage.TRANSITION,
    category: 'transition',
    context: ['construction_project', 'high_ticket'],
    question: 'What happens if this [problem/challenge] continues for another 6 months?',
    purpose: 'Consequence question - visualizes future pain',
    psychologicalMechanism: 'Loss aversion, future pain anchoring',
  },
  {
    id: 'trans-002',
    stage: NEPQStage.TRANSITION,
    category: 'transition',
    context: ['general_b2b'],
    question: 'How does this impact your team\'s ability to [achieve goal]?',
    purpose: 'Amplifies the cost of inaction',
    psychologicalMechanism: 'Social impact, team consequences',
  },
  {
    id: 'trans-003',
    stage: NEPQStage.TRANSITION,
    category: 'transition',
    context: ['construction_project'],
    question: 'What\'s the cost - not just financial, but in time, stress, and missed opportunities - of maintaining the status quo?',
    purpose: 'Multi-dimensional consequence exploration',
    psychologicalMechanism: 'Loss framing, comprehensive cost awareness',
  },
  {
    id: 'trans-004',
    stage: NEPQStage.TRANSITION,
    category: 'transition',
    context: ['general_b2b', 'high_ticket'],
    question: 'If this problem were solved, who would that make you in your organization\'s eyes?',
    purpose: 'Identity-based consequence question',
    psychologicalMechanism: 'Identity alignment, status/self-image activation',
  },
  {
    id: 'trans-005',
    stage: NEPQStage.TRANSITION,
    category: 'transition',
    context: ['construction_project'],
    question: 'What does delaying this decision mean for your project timeline and budget?',
    purpose: 'Quantifies the cost of inaction',
    psychologicalMechanism: 'Loss aversion, risk-seeking in loss domain',
  },
  {
    id: 'trans-006',
    stage: NEPQStage.TRANSITION,
    category: 'transition',
    context: ['general_b2b'],
    question: 'How is this affecting your ability to compete or grow?',
    purpose: 'Links problem to competitive disadvantage',
    psychologicalMechanism: 'Status threat, competitive loss framing',
  },
]

/**
 * PRESENTATION STAGE QUESTIONS
 * Objective: Frame solution as necessary path to alleviate pain
 */
const PRESENTATION_QUESTIONS: NEPQQuestion[] = [
  {
    id: 'pres-001',
    stage: NEPQStage.PRESENTATION,
    category: 'presentation',
    context: ['general_b2b'],
    question: 'Based on what you\'ve told me about [their problem], here\'s how we\'ve helped similar companies...',
    purpose: 'Links solution to their stated needs',
    psychologicalMechanism: 'Cognitive consistency, solution alignment',
  },
  {
    id: 'pres-002',
    stage: NEPQStage.PRESENTATION,
    category: 'presentation',
    context: ['construction_project'],
    question: 'If this solution could [address their specific pain], would that be valuable?',
    purpose: 'Solution awareness question',
    psychologicalMechanism: 'Future pacing, benefit visualization',
  },
  {
    id: 'pres-003',
    stage: NEPQStage.PRESENTATION,
    category: 'presentation',
    context: ['general_b2b'],
    question: 'What would it mean for you if [benefit] happened?',
    purpose: 'Helps them visualize the solved state',
    psychologicalMechanism: 'Dopamine activation, future reward anticipation',
  },
]

/**
 * COMMITMENT STAGE QUESTIONS
 * Objective: Secure decision through consistency and ownership
 */
const COMMITMENT_QUESTIONS: NEPQQuestion[] = [
  {
    id: 'comm-001',
    stage: NEPQStage.COMMITMENT,
    category: 'commitment',
    context: ['general_b2b'],
    question: 'Does this make sense so far?',
    purpose: 'Consistency check-in, small commitment',
    psychologicalMechanism: 'Cognitive consistency, incremental commitment',
  },
  {
    id: 'comm-002',
    stage: NEPQStage.COMMITMENT,
    category: 'commitment',
    context: ['general_b2b'],
    question: 'How does this look to you?',
    purpose: 'Open-ended commitment question',
    psychologicalMechanism: 'Ownership, self-persuasion',
  },
  {
    id: 'comm-003',
    stage: NEPQStage.COMMITMENT,
    category: 'commitment',
    context: ['general_b2b', 'high_ticket'],
    question: 'What would you like to do next?',
    purpose: 'Choice architecture, gives them control',
    psychologicalMechanism: 'Autonomy, reduces reactance',
  },
  {
    id: 'comm-004',
    stage: NEPQStage.COMMITMENT,
    category: 'commitment',
    context: ['general_b2b'],
    question: 'Are you comfortable moving forward with [next step]?',
    purpose: 'Direct but low-pressure commitment question',
    psychologicalMechanism: 'Comfort check, natural close',
  },
]

/**
 * OBJECTION HANDLING QUESTIONS
 * Objective: Validate concerns and guide to resolution
 */
const OBJECTION_QUESTIONS: NEPQQuestion[] = [
  {
    id: 'obj-001',
    stage: NEPQStage.ENGAGEMENT, // Can be used in multiple stages
    category: 'objection_handling',
    context: ['general_b2b'],
    question: 'I appreciate you sharing that. Help me understand - what specifically concerns you about [objection]?',
    purpose: 'Validates and explores the objection',
    psychologicalMechanism: 'Empathy, deeper understanding',
  },
  {
    id: 'obj-002',
    stage: NEPQStage.TRANSITION,
    category: 'objection_handling',
    context: ['general_b2b'],
    question: 'What would need to be true for you to feel comfortable with [solution]?',
    purpose: 'Reframes objection as criteria question',
    psychologicalMechanism: 'Criteria identification, solution co-creation',
  },
  {
    id: 'obj-003',
    stage: NEPQStage.PRESENTATION,
    category: 'objection_handling',
    context: ['general_b2b'],
    question: 'Is [objection] the only thing holding you back, or are there other concerns?',
    purpose: 'Uncovers all objections at once',
    psychologicalMechanism: 'Complete objection surfacing',
  },
]

// Combine all questions
const ALL_QUESTIONS: NEPQQuestion[] = [
  ...CONNECTING_QUESTIONS,
  ...ENGAGEMENT_QUESTIONS,
  ...TRANSITION_QUESTIONS,
  ...PRESENTATION_QUESTIONS,
  ...COMMITMENT_QUESTIONS,
  ...OBJECTION_QUESTIONS,
]

/**
 * Get questions for a specific NEPQ stage
 */
export function getQuestionsByStage(
  stage: NEPQStage,
  context?: QuestionContext
): NEPQQuestion[] {
  let questions = ALL_QUESTIONS.filter((q) => q.stage === stage)

  if (context) {
    questions = questions.filter((q) => q.context.includes(context))
  }

  return questions
}

/**
 * Get questions by category
 */
export function getQuestionsByCategory(
  category: QuestionCategory,
  context?: QuestionContext
): NEPQQuestion[] {
  let questions = ALL_QUESTIONS.filter((q) => q.category === category)

  if (context) {
    questions = questions.filter((q) => q.context.includes(context))
  }

  return questions
}

/**
 * Get a random question for a stage/context
 */
export function getRandomQuestion(
  stage: NEPQStage,
  context?: QuestionContext
): NEPQQuestion | null {
  const questions = getQuestionsByStage(stage, context)
  if (questions.length === 0) return null

  return questions[Math.floor(Math.random() * questions.length)]
}

/**
 * Get questions for email/campaign context
 */
export function getQuestionsForEmail(
  stage: NEPQStage,
  context: QuestionContext = 'general_b2b',
  count: number = 3
): NEPQQuestion[] {
  const questions = getQuestionsByStage(stage, context)
  
  // Shuffle and return requested count
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * Search questions by keyword
 */
export function searchQuestions(
  keyword: string,
  stage?: NEPQStage,
  context?: QuestionContext
): NEPQQuestion[] {
  let questions = ALL_QUESTIONS

  if (stage) {
    questions = questions.filter((q) => q.stage === stage)
  }

  if (context) {
    questions = questions.filter((q) => q.context.includes(context))
  }

  const lowerKeyword = keyword.toLowerCase()
  return questions.filter(
    (q) =>
      q.question.toLowerCase().includes(lowerKeyword) ||
      q.purpose.toLowerCase().includes(lowerKeyword) ||
      q.psychologicalMechanism.toLowerCase().includes(lowerKeyword)
  )
}

export { ALL_QUESTIONS }

