/**
 * Advanced Consequence Question Templates
 * Based on Prospect Theory, Loss Aversion (2:1 ratio), and NEPQ Transition Stage methodology
 *
 * Purpose: Create "emotional gap" between current state and desired future
 * - Visualize future pain if problems continue
 * - Quantify cost of inaction (not benefits of action)
 * - Link to identity/status (professional reputation)
 * - Activate System 1 emotional commitment BEFORE presenting solution
 */

import type { SelfMonitorProfile, IdentityDimension } from './behavioral-scoring'

// =============================================================================
// TYPES
// =============================================================================

export type QuestionCategory =
  | 'code_compliance' // ERCES, fire alarm, inspection risk
  | 'timeline_delay' // Opening date, CO delays
  | 'financial_exposure' // Cost overruns, change orders
  | 'reputation_damage' // Reviews, brand perception
  | 'career_risk' // Personal professional consequences
  | 'operational_failure' // System downtime, guest complaints
  | 'competitive_disadvantage' // Falling behind market
  | 'staff_impact' // Team stress, turnover

export type ProjectVertical =
  | 'hospitality'
  | 'senior_living'
  | 'multifamily'
  | 'student_housing'
  | 'commercial'

export interface ConsequenceQuestion {
  id: string
  category: QuestionCategory
  question: string
  followUp: string
  identityTrigger: string // Links to self-concept
  lossFrame: string // The loss being activated
  neurochemicalTarget: 'dopamine' | 'cortisol' | 'serotonin'
  intensity: 'soft' | 'medium' | 'hard'
  verticals: ProjectVertical[]
  selfMonitorAlignment: SelfMonitorProfile | 'both'
  projectStages: string[]
}

export interface ConsequenceSequence {
  name: string
  description: string
  questions: ConsequenceQuestion[]
  buildStrategy: string // How to escalate through the sequence
  exitCriteria: string // When emotional commitment is achieved
}

// =============================================================================
// CONSEQUENCE QUESTION LIBRARY
// =============================================================================

export const CONSEQUENCE_QUESTIONS: ConsequenceQuestion[] = [
  // ---------------------------------------------------------------------------
  // CODE COMPLIANCE QUESTIONS (Highest urgency - failed inspections)
  // ---------------------------------------------------------------------------
  {
    id: 'cc_inspection_failure',
    category: 'code_compliance',
    question: "What happens to your opening timeline if the fire marshal flags the building for radio coverage issues two weeks before your ribbon cutting?",
    followUp: "How would you explain that delay to your investors and stakeholders?",
    identityTrigger: "Links to professional competence and planning ability",
    lossFrame: "Loss of control, public embarrassment, financial penalty",
    neurochemicalTarget: 'cortisol',
    intensity: 'hard',
    verticals: ['hospitality', 'senior_living', 'multifamily', 'commercial'],
    selfMonitorAlignment: 'both',
    projectStages: ['pre_construction', 'construction', 'fit_out'],
  },
  {
    id: 'cc_erces_oversight',
    category: 'code_compliance',
    question: "Have you seen projects where ERCES was overlooked until final inspection? What did that remediation cost in time and money?",
    followUp: "Who typically takes responsibility when that happens?",
    identityTrigger: "Fear of being the one who 'dropped the ball'",
    lossFrame: "Career risk, budget overrun, schedule slip",
    neurochemicalTarget: 'cortisol',
    intensity: 'medium',
    verticals: ['hospitality', 'senior_living', 'multifamily', 'commercial'],
    selfMonitorAlignment: 'low',
    projectStages: ['planning', 'design', 'pre_construction'],
  },
  {
    id: 'cc_retrofit_nightmare',
    category: 'code_compliance',
    question: "If you had to retrofit life safety systems after the building is occupied, what would that disruption cost you—not just money, but in resident or guest satisfaction?",
    followUp: "How does that compare to planning it correctly from the start?",
    identityTrigger: "Pride in doing things right the first time",
    lossFrame: "Disruption, complaints, operational chaos",
    neurochemicalTarget: 'cortisol',
    intensity: 'medium',
    verticals: ['hospitality', 'senior_living', 'multifamily'],
    selfMonitorAlignment: 'low',
    projectStages: ['design', 'pre_construction'],
  },

  // ---------------------------------------------------------------------------
  // TIMELINE DELAY QUESTIONS
  // ---------------------------------------------------------------------------
  {
    id: 'td_daily_cost',
    category: 'timeline_delay',
    question: "What's the cost per DAY of a delayed certificate of occupancy—not just lost revenue, but carrying costs, staff salaries, and investor confidence?",
    followUp: "If you had to put a number on it, what would you estimate?",
    identityTrigger: "Financial acumen, stakeholder management",
    lossFrame: "Compounding financial losses, broken commitments",
    neurochemicalTarget: 'dopamine', // Anticipation of avoiding loss
    intensity: 'hard',
    verticals: ['hospitality', 'multifamily', 'student_housing'],
    selfMonitorAlignment: 'both',
    projectStages: ['construction', 'fit_out'],
  },
  {
    id: 'td_opening_ripple',
    category: 'timeline_delay',
    question: "If technology delays your opening by even 2 weeks, what's the ripple effect on marketing, staffing schedules, and advance bookings?",
    followUp: "How difficult is it to re-coordinate all of those moving pieces?",
    identityTrigger: "Orchestrator, keeper of the plan",
    lossFrame: "Loss of control, cascading failures",
    neurochemicalTarget: 'cortisol',
    intensity: 'medium',
    verticals: ['hospitality', 'senior_living', 'student_housing'],
    selfMonitorAlignment: 'both',
    projectStages: ['pre_construction', 'construction'],
  },
  {
    id: 'td_stakeholder_promise',
    category: 'timeline_delay',
    question: "What commitments have been made to stakeholders about the opening date? What happens professionally if you miss it?",
    followUp: "How forgiving are they typically when timelines slip?",
    identityTrigger: "Reliability, keeping promises",
    lossFrame: "Broken trust, damaged relationships",
    neurochemicalTarget: 'serotonin',
    intensity: 'hard',
    verticals: ['hospitality', 'multifamily', 'commercial'],
    selfMonitorAlignment: 'high',
    projectStages: ['construction', 'fit_out'],
  },

  // ---------------------------------------------------------------------------
  // FINANCIAL EXPOSURE QUESTIONS
  // ---------------------------------------------------------------------------
  {
    id: 'fe_change_order_cascade',
    category: 'financial_exposure',
    question: "What typically happens to your budget when technology infrastructure becomes a change order instead of part of the original plan?",
    followUp: "What's the markup on rushed changes versus planned work?",
    identityTrigger: "Budget guardian, financial steward",
    lossFrame: "Budget overrun, loss of control over costs",
    neurochemicalTarget: 'dopamine',
    intensity: 'medium',
    verticals: ['hospitality', 'multifamily', 'senior_living', 'commercial'],
    selfMonitorAlignment: 'low',
    projectStages: ['planning', 'design'],
  },
  {
    id: 'fe_percentage_at_risk',
    category: 'financial_exposure',
    question: "On a project of this value, what percentage would you estimate is at risk if technology infrastructure isn't planned correctly?",
    followUp: "What would that translate to in actual dollars?",
    identityTrigger: "Risk manager, protector of investment",
    lossFrame: "Financial loss, wasted investment",
    neurochemicalTarget: 'cortisol',
    intensity: 'medium',
    verticals: ['hospitality', 'multifamily', 'commercial'],
    selfMonitorAlignment: 'low',
    projectStages: ['planning', 'design', 'pre_construction'],
  },
  {
    id: 'fe_vendor_finger_pointing',
    category: 'financial_exposure',
    question: "When you have multiple technology vendors and something goes wrong, who typically ends up paying for the finger-pointing and coordination failures?",
    followUp: "How much time do you spend managing vendors instead of managing the project?",
    identityTrigger: "Efficiency, smart operator",
    lossFrame: "Wasted time, hidden costs, frustration",
    neurochemicalTarget: 'dopamine',
    intensity: 'soft',
    verticals: ['hospitality', 'multifamily', 'senior_living', 'commercial'],
    selfMonitorAlignment: 'both',
    projectStages: ['planning', 'design', 'pre_construction', 'construction'],
  },

  // ---------------------------------------------------------------------------
  // REPUTATION DAMAGE QUESTIONS (High Self-Monitor Focus)
  // ---------------------------------------------------------------------------
  {
    id: 'rd_first_reviews',
    category: 'reputation_damage',
    question: "What happens to your TripAdvisor and Google reviews if guests experience Wi-Fi issues or connectivity problems in the first 90 days?",
    followUp: "How long does it take to recover from a wave of negative reviews?",
    identityTrigger: "Reputation, public perception, pride",
    lossFrame: "Permanent reputation damage, lost future bookings",
    neurochemicalTarget: 'serotonin',
    intensity: 'hard',
    verticals: ['hospitality'],
    selfMonitorAlignment: 'high',
    projectStages: ['pre_construction', 'construction', 'fit_out'],
  },
  {
    id: 'rd_brand_standards',
    category: 'reputation_damage',
    question: "How does the brand respond when a property opens with technology that doesn't meet their standards?",
    followUp: "What's at stake in terms of your relationship with the franchisor?",
    identityTrigger: "Brand steward, franchise relationship manager",
    lossFrame: "Brand relationship damage, franchise risk",
    neurochemicalTarget: 'serotonin',
    intensity: 'hard',
    verticals: ['hospitality'],
    selfMonitorAlignment: 'high',
    projectStages: ['design', 'pre_construction', 'construction'],
  },
  {
    id: 'rd_competitive_comparison',
    category: 'reputation_damage',
    question: "When prospective residents or guests compare your property to the competition, what role does technology play in their decision?",
    followUp: "What happens if you're seen as 'behind the times' compared to the new property down the street?",
    identityTrigger: "Market leader, innovator",
    lossFrame: "Competitive disadvantage, missed opportunities",
    neurochemicalTarget: 'dopamine',
    intensity: 'medium',
    verticals: ['hospitality', 'multifamily', 'student_housing'],
    selfMonitorAlignment: 'high',
    projectStages: ['planning', 'design', 'pre_construction'],
  },
  {
    id: 'rd_resident_satisfaction',
    category: 'reputation_damage',
    question: "What's the cost of a 1-star reduction in your online reviews because of connectivity or smart home complaints?",
    followUp: "How does that translate to occupancy rates and rent premiums?",
    identityTrigger: "Resident experience champion, property value maximizer",
    lossFrame: "Lower occupancy, reduced rent potential",
    neurochemicalTarget: 'dopamine',
    intensity: 'medium',
    verticals: ['multifamily', 'student_housing'],
    selfMonitorAlignment: 'high',
    projectStages: ['planning', 'design', 'pre_construction', 'construction'],
  },

  // ---------------------------------------------------------------------------
  // CAREER RISK QUESTIONS (Identity-Threat Focus)
  // ---------------------------------------------------------------------------
  {
    id: 'cr_who_takes_blame',
    category: 'career_risk',
    question: "If this project has technology issues at opening, who takes the hit professionally?",
    followUp: "How does that affect your future opportunities?",
    identityTrigger: "Self-preservation, career trajectory",
    lossFrame: "Career damage, reputation harm",
    neurochemicalTarget: 'cortisol',
    intensity: 'hard',
    verticals: ['hospitality', 'multifamily', 'senior_living', 'commercial'],
    selfMonitorAlignment: 'both',
    projectStages: ['design', 'pre_construction', 'construction'],
  },
  {
    id: 'cr_board_explanation',
    category: 'career_risk',
    question: "If costs overrun or the timeline slips because of technology coordination issues, how do you explain that to the board or ownership group?",
    followUp: "What's the perception of someone who let that happen?",
    identityTrigger: "Professional credibility, executive judgment",
    lossFrame: "Loss of credibility, damaged trust",
    neurochemicalTarget: 'serotonin',
    intensity: 'hard',
    verticals: ['hospitality', 'multifamily', 'commercial'],
    selfMonitorAlignment: 'high',
    projectStages: ['planning', 'design', 'pre_construction'],
  },
  {
    id: 'cr_success_credit',
    category: 'career_risk',
    question: "Who gets credit if this goes perfectly? And who takes the blame if it doesn't?",
    followUp: "How would you feel if you were seen as the reason it succeeded—or the reason it failed?",
    identityTrigger: "Legacy, professional identity",
    lossFrame: "Missed opportunity for recognition OR blame for failure",
    neurochemicalTarget: 'serotonin',
    intensity: 'hard',
    verticals: ['hospitality', 'multifamily', 'senior_living', 'commercial'],
    selfMonitorAlignment: 'high',
    projectStages: ['planning', 'design', 'pre_construction', 'construction'],
  },

  // ---------------------------------------------------------------------------
  // OPERATIONAL FAILURE QUESTIONS
  // ---------------------------------------------------------------------------
  {
    id: 'of_guest_lifetime_value',
    category: 'operational_failure',
    question: "How do you quantify the lifetime value of a guest who has a negative technology experience versus one who doesn't?",
    followUp: "What's the cost of losing that guest forever?",
    identityTrigger: "Customer experience owner, revenue driver",
    lossFrame: "Lost lifetime customer value, negative word-of-mouth",
    neurochemicalTarget: 'dopamine',
    intensity: 'medium',
    verticals: ['hospitality'],
    selfMonitorAlignment: 'both',
    projectStages: ['pre_construction', 'construction', 'fit_out'],
  },
  {
    id: 'of_senior_safety',
    category: 'operational_failure',
    question: "What's at stake if a fall isn't detected quickly because the monitoring system wasn't properly integrated?",
    followUp: "How would families react if they learned cellular coverage for emergency calls was spotty in their loved one's room?",
    identityTrigger: "Caregiver, protector, safety steward",
    lossFrame: "Catastrophic harm, liability, moral failure",
    neurochemicalTarget: 'cortisol',
    intensity: 'hard',
    verticals: ['senior_living'],
    selfMonitorAlignment: 'both',
    projectStages: ['design', 'pre_construction', 'construction'],
  },
  {
    id: 'of_leasing_impact',
    category: 'operational_failure',
    question: "How many prospective residents would you lose if self-guided tours weren't working smoothly during your lease-up period?",
    followUp: "What's the cost per empty unit per month during that critical window?",
    identityTrigger: "Revenue driver, lease-up champion",
    lossFrame: "Lost revenue, slower stabilization",
    neurochemicalTarget: 'dopamine',
    intensity: 'medium',
    verticals: ['multifamily', 'student_housing'],
    selfMonitorAlignment: 'both',
    projectStages: ['pre_construction', 'construction', 'fit_out'],
  },

  // ---------------------------------------------------------------------------
  // COMPETITIVE DISADVANTAGE QUESTIONS
  // ---------------------------------------------------------------------------
  {
    id: 'cd_market_expectations',
    category: 'competitive_disadvantage',
    question: "What are prospective residents or guests expecting in terms of technology these days? What happens if you don't meet those baseline expectations?",
    followUp: "How quickly are those expectations evolving?",
    identityTrigger: "Market awareness, relevance",
    lossFrame: "Falling behind, irrelevance",
    neurochemicalTarget: 'dopamine',
    intensity: 'soft',
    verticals: ['hospitality', 'multifamily', 'student_housing'],
    selfMonitorAlignment: 'high',
    projectStages: ['planning', 'design'],
  },
  {
    id: 'cd_new_property_comparison',
    category: 'competitive_disadvantage',
    question: "If a new property opens nearby with integrated smart building technology and yours doesn't have it, how does that affect your competitive position?",
    followUp: "How long would it take to catch up, and at what cost?",
    identityTrigger: "Competitive edge, market leader",
    lossFrame: "Lost market position, racing from behind",
    neurochemicalTarget: 'dopamine',
    intensity: 'medium',
    verticals: ['hospitality', 'multifamily', 'student_housing'],
    selfMonitorAlignment: 'high',
    projectStages: ['planning', 'design', 'pre_construction'],
  },

  // ---------------------------------------------------------------------------
  // STAFF IMPACT QUESTIONS
  // ---------------------------------------------------------------------------
  {
    id: 'si_team_stress',
    category: 'staff_impact',
    question: "How does it affect your team when they're constantly fielding complaints about technology issues?",
    followUp: "What does that do to morale and turnover?",
    identityTrigger: "Team leader, culture builder",
    lossFrame: "Staff burnout, turnover costs",
    neurochemicalTarget: 'serotonin',
    intensity: 'soft',
    verticals: ['hospitality', 'multifamily', 'senior_living'],
    selfMonitorAlignment: 'both',
    projectStages: ['operating', 'renovation'],
  },
  {
    id: 'si_vendor_management',
    category: 'staff_impact',
    question: "How much of your team's time is spent coordinating between different technology vendors instead of focusing on residents or guests?",
    followUp: "What would they be able to accomplish if that burden was lifted?",
    identityTrigger: "Efficiency driver, team enabler",
    lossFrame: "Wasted human potential, opportunity cost",
    neurochemicalTarget: 'dopamine',
    intensity: 'soft',
    verticals: ['hospitality', 'multifamily', 'senior_living'],
    selfMonitorAlignment: 'low',
    projectStages: ['operating', 'renovation'],
  },
]

// =============================================================================
// CONSEQUENCE SEQUENCES (Escalation Patterns)
// =============================================================================

export const CONSEQUENCE_SEQUENCES: ConsequenceSequence[] = [
  {
    name: 'The Code Compliance Cascade',
    description: 'For projects in construction/pre-construction with ERCES or life safety needs',
    buildStrategy: 'Start with general awareness, escalate to specific inspection failure, then personal accountability',
    exitCriteria: 'Prospect acknowledges specific risk and asks "so what do you recommend?"',
    questions: [
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'cc_erces_oversight')!,
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'cc_inspection_failure')!,
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'cr_who_takes_blame')!,
    ],
  },
  {
    name: 'The Timeline Pressure Squeeze',
    description: 'For projects with committed opening dates or stakeholder pressure',
    buildStrategy: 'Start with timeline ripple effects, quantify daily cost, then personal stakes',
    exitCriteria: 'Prospect verbalizes specific dollar amount at risk or expresses urgency',
    questions: [
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'td_opening_ripple')!,
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'td_daily_cost')!,
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'td_stakeholder_promise')!,
    ],
  },
  {
    name: 'The Reputation Play',
    description: 'For high self-monitors and branded/luxury properties',
    buildStrategy: 'Start with market comparison, move to review impact, finish with brand relationship',
    exitCriteria: 'Prospect mentions specific reputation concern or competitive threat',
    questions: [
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'rd_competitive_comparison')!,
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'rd_first_reviews')!,
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'rd_brand_standards')!,
    ],
  },
  {
    name: 'The Financial Reality Check',
    description: 'For low self-monitors focused on budget and efficiency',
    buildStrategy: 'Start with vendor coordination costs, move to change order risk, quantify exposure',
    exitCriteria: 'Prospect calculates or acknowledges specific financial risk',
    questions: [
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'fe_vendor_finger_pointing')!,
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'fe_change_order_cascade')!,
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'fe_percentage_at_risk')!,
    ],
  },
  {
    name: 'The Senior Living Safety Imperative',
    description: 'For senior living/memory care with life safety stakes',
    buildStrategy: 'Start with operational impact, escalate to safety consequences, then family reactions',
    exitCriteria: 'Prospect acknowledges moral/ethical dimension of safety technology',
    questions: [
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'of_senior_safety')!,
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'cc_inspection_failure')!,
      CONSEQUENCE_QUESTIONS.find(q => q.id === 'cr_who_takes_blame')!,
    ],
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get consequence questions tailored to a specific lead profile
 */
export function getConsequenceQuestionsForLead(
  project: {
    projectType: string[]
    projectStage: string
    projectValue: number
    servicesNeeded?: string[]
  },
  contact: {
    selfMonitorProfile: SelfMonitorProfile
    identityDimension: IdentityDimension
  },
  maxQuestions: number = 5
): ConsequenceQuestion[] {
  const projectTypeLower = project.projectType.join(' ').toLowerCase()
  const stageLower = project.projectStage.toLowerCase().replace(/[^a-z_]/g, '_')

  // Determine vertical
  let vertical: ProjectVertical = 'commercial'
  if (projectTypeLower.includes('hotel') || projectTypeLower.includes('hospitality') || projectTypeLower.includes('resort')) {
    vertical = 'hospitality'
  } else if (projectTypeLower.includes('senior') || projectTypeLower.includes('assisted') || projectTypeLower.includes('memory')) {
    vertical = 'senior_living'
  } else if (projectTypeLower.includes('multifamily') || projectTypeLower.includes('apartment')) {
    vertical = 'multifamily'
  } else if (projectTypeLower.includes('student') || projectTypeLower.includes('dorm')) {
    vertical = 'student_housing'
  }

  // Filter questions by relevance
  const relevantQuestions = CONSEQUENCE_QUESTIONS.filter(q => {
    // Check vertical match
    if (!q.verticals.includes(vertical)) return false

    // Check stage match
    if (!q.projectStages.includes(stageLower)) return false

    // Check self-monitor alignment
    if (q.selfMonitorAlignment !== 'both' && q.selfMonitorAlignment !== contact.selfMonitorProfile) {
      return false
    }

    return true
  })

  // Sort by intensity and relevance
  const sorted = relevantQuestions.sort((a, b) => {
    // Prioritize harder questions for high-value projects
    const intensityScore = { soft: 1, medium: 2, hard: 3 }

    if (project.projectValue >= 50000000) {
      return intensityScore[b.intensity] - intensityScore[a.intensity]
    }

    // For smaller projects, start softer
    return intensityScore[a.intensity] - intensityScore[b.intensity]
  })

  return sorted.slice(0, maxQuestions)
}

/**
 * Get the optimal consequence sequence for a lead
 */
export function getOptimalSequence(
  project: {
    projectType: string[]
    projectStage: string
    servicesNeeded?: string[]
  },
  contact: {
    selfMonitorProfile: SelfMonitorProfile
  }
): ConsequenceSequence | null {
  const projectTypeLower = project.projectType.join(' ').toLowerCase()
  const stageLower = project.projectStage.toLowerCase()
  const services = (project.servicesNeeded || []).join(' ').toLowerCase()

  // Senior living gets safety imperative
  if (projectTypeLower.includes('senior') || projectTypeLower.includes('assisted')) {
    return CONSEQUENCE_SEQUENCES.find(s => s.name === 'The Senior Living Safety Imperative')!
  }

  // Code compliance risk present
  if (services.includes('erces') || services.includes('fire') || services.includes('das')) {
    if (['construction', 'pre_construction', 'fit_out'].includes(stageLower)) {
      return CONSEQUENCE_SEQUENCES.find(s => s.name === 'The Code Compliance Cascade')!
    }
  }

  // High self-monitor gets reputation play
  if (contact.selfMonitorProfile === 'high') {
    if (projectTypeLower.includes('hotel') || projectTypeLower.includes('luxury')) {
      return CONSEQUENCE_SEQUENCES.find(s => s.name === 'The Reputation Play')!
    }
  }

  // Low self-monitor gets financial reality
  if (contact.selfMonitorProfile === 'low') {
    return CONSEQUENCE_SEQUENCES.find(s => s.name === 'The Financial Reality Check')!
  }

  // Default to timeline pressure for construction stage
  if (['construction', 'fit_out'].includes(stageLower)) {
    return CONSEQUENCE_SEQUENCES.find(s => s.name === 'The Timeline Pressure Squeeze')!
  }

  // Fallback
  return CONSEQUENCE_SEQUENCES.find(s => s.name === 'The Financial Reality Check')!
}

/**
 * Format a consequence question with project-specific details
 */
export function formatConsequenceQuestion(
  question: ConsequenceQuestion,
  project: {
    projectName: string
    projectValue: number
    city?: string
    estimatedCompletionDate?: string | null
  }
): { main: string; followUp: string } {
  let main = question.question
  let followUp = question.followUp

  // Replace placeholders if any
  main = main.replace(/\[PROJECT_NAME\]/g, project.projectName)
  main = main.replace(/\[VALUE\]/g, `$${(project.projectValue / 1000000).toFixed(0)}M`)
  main = main.replace(/\[CITY\]/g, project.city || 'your market')

  if (project.estimatedCompletionDate) {
    const date = new Date(project.estimatedCompletionDate)
    main = main.replace(/\[COMPLETION_DATE\]/g, date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
  }

  followUp = followUp.replace(/\[PROJECT_NAME\]/g, project.projectName)

  return { main, followUp }
}

// =============================================================================
// EXPORTS
// =============================================================================

const consequenceQuestions = {
  CONSEQUENCE_QUESTIONS,
  CONSEQUENCE_SEQUENCES,
  getConsequenceQuestionsForLead,
  getOptimalSequence,
  formatConsequenceQuestion,
}

export default consequenceQuestions
