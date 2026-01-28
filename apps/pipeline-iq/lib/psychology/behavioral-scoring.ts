/**
 * Behavioral Psychology Scoring System
 * Based on Dual-Process Theory, Prospect Theory, Self-Congruity Theory, and Neuroselling
 *
 * Reverse-engineers high-conversion leads using cognitive science principles
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type SelfMonitorProfile = 'high' | 'low' | 'unknown'
export type IdentityDimension = 'actual' | 'ideal' | 'social' | 'ideal_social'
export type LossFrameIntensity = 'dormant' | 'activated' | 'acute'
export type NeurochemicalState = 'optimal' | 'suboptimal' | 'blocked'

export interface IdentityThreatScore {
  total: number // 0-100
  roleWeight: number // Based on decision-maker level
  visibilityWeight: number // Public/branded project visibility
  careerRiskWeight: number // Personal reputation on the line
  identityDimension: IdentityDimension // Which self-concept is at play
  triggers: string[] // Specific identity triggers to use
}

export interface LossFrameScore {
  total: number // 0-100
  stageWeight: number // Pre-construction = higher
  codeRiskWeight: number // ERCES, fire alarm requirements
  timelinePressureWeight: number // Committed opening dates
  financialExposureWeight: number // Project value at risk
  lossMultiplier: number // Prospect Theory 2:1 ratio application
  consequenceQuestions: string[] // Tailored consequence questions
}

export interface SelfMonitorAssessment {
  profile: SelfMonitorProfile
  confidence: number // 0-100
  indicators: string[]
  recommendedFraming: 'prestige' | 'reliability' | 'balanced'
  valuePropsToLead: string[]
  avoidPatterns: string[]
}

export interface NeurochemicalProfile {
  dopamineState: 'seeking' | 'satisfied' | 'depleted'
  oxytocinLevel: 'high_trust' | 'building' | 'low_trust'
  cortisolLevel: 'calm' | 'elevated' | 'fight_flight'
  serotoninNeed: 'status_assured' | 'status_threatened' | 'neutral'
  optimalApproach: string[]
  warningSignals: string[]
}

export interface CognitiveLoadAssessment {
  intrinsicLoad: 'low' | 'medium' | 'high' // Complexity of decision
  extraneousLoad: 'optimized' | 'acceptable' | 'overloaded'
  germaneLoad: 'high' | 'medium' | 'low' // Productive processing
  decisionFatigueRisk: number // 0-100
  simplificationNeeded: boolean
  recommendations: string[]
}

export interface PsychologyScore {
  conversionProbability: number // 0-100
  identityThreat: IdentityThreatScore
  lossFrame: LossFrameScore
  selfMonitor: SelfMonitorAssessment
  neurochemical: NeurochemicalProfile
  cognitiveLoad: CognitiveLoadAssessment
  priorityRank: 'A' | 'B' | 'C' | 'D'
  recommendedNEPQFocus: string
  keyInsight: string
}

// =============================================================================
// ROLE & TITLE MAPPINGS
// =============================================================================

const ROLE_IDENTITY_WEIGHTS: Record<string, { weight: number; dimension: IdentityDimension }> = {
  // Highest identity stake - their reputation IS the project
  'owner': { weight: 95, dimension: 'ideal_social' },
  'principal': { weight: 95, dimension: 'ideal_social' },
  'ceo': { weight: 90, dimension: 'ideal_social' },
  'president': { weight: 90, dimension: 'ideal_social' },
  'managing partner': { weight: 90, dimension: 'ideal' },
  'developer': { weight: 85, dimension: 'ideal_social' },

  // High identity stake - career tied to project success
  'vp': { weight: 80, dimension: 'ideal' },
  'vice president': { weight: 80, dimension: 'ideal' },
  'director': { weight: 75, dimension: 'ideal' },
  'general manager': { weight: 75, dimension: 'ideal' },
  'senior director': { weight: 75, dimension: 'ideal' },

  // Medium identity stake - professional reputation
  'project manager': { weight: 65, dimension: 'social' },
  'construction manager': { weight: 65, dimension: 'social' },
  'it director': { weight: 60, dimension: 'actual' },
  'facilities manager': { weight: 55, dimension: 'actual' },

  // Lower identity stake - functional focus
  'engineer': { weight: 45, dimension: 'actual' },
  'coordinator': { weight: 40, dimension: 'actual' },
  'assistant': { weight: 30, dimension: 'actual' },
}

const DECISION_LEVEL_WEIGHTS: Record<string, number> = {
  'decision_maker': 30,
  'influencer': 20,
  'evaluator': 15,
  'end_user': 10,
  'gatekeeper': 5,
}

const PROJECT_TYPE_VISIBILITY: Record<string, number> = {
  // Branded/franchised = highest visibility (failure is public)
  'hotel': 85,
  'resort': 90,
  'marriott': 95,
  'hilton': 95,
  'hyatt': 95,

  // Large residential = high visibility
  'multifamily': 70,
  'apartment': 70,
  'luxury': 80,
  'high-rise': 75,

  // Care facilities = reputation critical
  'senior_living': 80,
  'assisted_living': 80,
  'memory_care': 85,

  // Student housing = moderate
  'student_housing': 65,
  'dormitory': 60,

  // Commercial = variable
  'office': 55,
  'retail': 50,
}

// =============================================================================
// PROJECT STAGE LOSS FRAME MAPPINGS
// =============================================================================

const STAGE_LOSS_WEIGHTS: Record<string, number> = {
  // Highest urgency - decisions have immediate consequences
  'construction': 95,
  'fit_out': 90,
  'pre_construction': 85,

  // High urgency - commitments being made
  'design': 70,
  'permitting': 75,

  // Medium urgency - still time but clock ticking
  'planning': 55,
  'entitlement': 50,

  // Lower urgency - more theoretical
  'concept': 35,
  'operating': 40, // Retrofit urgency varies
  'renovation': 60,
}

const CODE_RISK_FACTORS: Record<string, number> = {
  'erces': 35,
  'public_safety_das': 35,
  'fire_alarm': 30,
  'fire alarm': 30,
  'cellular_das': 25,
  'life_safety': 30,
  'ada_compliance': 20,
  'network_infrastructure': 15,
}

// =============================================================================
// SELF-MONITOR DETECTION LOGIC
// =============================================================================

const HIGH_SELF_MONITOR_INDICATORS = {
  titles: ['vp', 'vice president', 'director', 'chief', 'head of', 'senior'],
  behaviors: ['references competitors', 'mentions awards', 'talks about reputation', 'concerned with perception'],
  projectTypes: ['luxury', 'boutique', 'flagship', 'signature', 'branded'],
  questions: ['how will this look', 'what will others think', 'industry standard', 'best in class'],
}

const LOW_SELF_MONITOR_INDICATORS = {
  titles: ['engineer', 'manager', 'coordinator', 'specialist', 'technician'],
  behaviors: ['asks for specs', 'wants data', 'mentions reliability', 'concerned with function'],
  projectTypes: ['affordable', 'value', 'standard', 'basic'],
  questions: ['how does it work', 'what are the specs', 'reliability', 'uptime'],
}

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

/**
 * Calculate Identity Threat Score
 * Higher score = stronger identity-based motivation to act
 */
export function calculateIdentityThreatScore(
  contact: {
    title?: string | null
    roleCategory?: string | null
    decisionLevel?: string | null
  },
  project: {
    projectType: string[]
    projectName: string
    projectValue: number
  }
): IdentityThreatScore {
  let roleWeight = 50 // Default
  let identityDimension: IdentityDimension = 'actual'

  // Calculate role weight from title
  if (contact.title) {
    const titleLower = contact.title.toLowerCase()
    for (const [role, config] of Object.entries(ROLE_IDENTITY_WEIGHTS)) {
      if (titleLower.includes(role)) {
        roleWeight = config.weight
        identityDimension = config.dimension
        break
      }
    }
  }

  // Boost from decision level
  if (contact.decisionLevel) {
    roleWeight += DECISION_LEVEL_WEIGHTS[contact.decisionLevel] || 0
  }

  // Calculate visibility weight from project type
  let visibilityWeight = 50
  for (const type of project.projectType) {
    const typeLower = type.toLowerCase()
    for (const [projectType, weight] of Object.entries(PROJECT_TYPE_VISIBILITY)) {
      if (typeLower.includes(projectType)) {
        visibilityWeight = Math.max(visibilityWeight, weight)
      }
    }
  }

  // Check for branded properties (higher visibility)
  const brandedPatterns = ['marriott', 'hilton', 'hyatt', 'ihg', 'wyndham', 'choice', 'four seasons', 'ritz']
  const nameLower = project.projectName.toLowerCase()
  if (brandedPatterns.some(brand => nameLower.includes(brand))) {
    visibilityWeight = Math.min(100, visibilityWeight + 15)
  }

  // Career risk based on project value
  let careerRiskWeight = 40
  if (project.projectValue >= 100000000) careerRiskWeight = 90
  else if (project.projectValue >= 50000000) careerRiskWeight = 80
  else if (project.projectValue >= 20000000) careerRiskWeight = 70
  else if (project.projectValue >= 10000000) careerRiskWeight = 60
  else if (project.projectValue >= 5000000) careerRiskWeight = 50

  // Total score (weighted average)
  const total = Math.round(
    (roleWeight * 0.4) +
    (visibilityWeight * 0.35) +
    (careerRiskWeight * 0.25)
  )

  // Generate identity triggers
  const triggers: string[] = []
  if (roleWeight >= 80) {
    triggers.push('Link decision to their legacy/reputation')
    triggers.push('Ask: "If this project has issues, who takes the hit?"')
  }
  if (visibilityWeight >= 75) {
    triggers.push('Emphasize how guests/residents will perceive the property')
    triggers.push('Reference competitor properties with superior technology')
  }
  if (careerRiskWeight >= 70) {
    triggers.push('Frame success as career-defining opportunity')
    triggers.push('Mention stakeholder expectations')
  }

  return {
    total: Math.min(100, total),
    roleWeight,
    visibilityWeight,
    careerRiskWeight,
    identityDimension,
    triggers,
  }
}

/**
 * Calculate Loss Frame Score
 * Based on Prospect Theory - losses felt 2-2.5x more than gains
 */
export function calculateLossFrameScore(
  project: {
    projectStage: string
    projectType: string[]
    projectValue: number
    estimatedCompletionDate?: string | null
    servicesNeeded?: string[]
  }
): LossFrameScore {
  // Stage weight
  const stageLower = project.projectStage.toLowerCase().replace(/[^a-z_]/g, '_')
  let stageWeight = STAGE_LOSS_WEIGHTS[stageLower] || 50

  // Code risk weight
  let codeRiskWeight = 0
  const services = project.servicesNeeded || []
  for (const service of services) {
    const serviceLower = service.toLowerCase()
    for (const [riskFactor, weight] of Object.entries(CODE_RISK_FACTORS)) {
      if (serviceLower.includes(riskFactor)) {
        codeRiskWeight += weight
      }
    }
  }
  codeRiskWeight = Math.min(100, codeRiskWeight)

  // If stage is pre_construction or construction and no ERCES mentioned, add it
  if (['pre_construction', 'construction', 'design'].includes(stageLower) && codeRiskWeight < 30) {
    codeRiskWeight += 20 // Likely needs ERCES even if not specified
  }

  // Timeline pressure
  let timelinePressureWeight = 50
  if (project.estimatedCompletionDate) {
    const completionDate = new Date(project.estimatedCompletionDate)
    const today = new Date()
    const monthsAway = (completionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)

    if (monthsAway <= 3) timelinePressureWeight = 95
    else if (monthsAway <= 6) timelinePressureWeight = 85
    else if (monthsAway <= 9) timelinePressureWeight = 75
    else if (monthsAway <= 12) timelinePressureWeight = 65
    else if (monthsAway <= 18) timelinePressureWeight = 50
    else timelinePressureWeight = 35
  }

  // Financial exposure
  let financialExposureWeight = 40
  const value = project.projectValue
  if (value >= 200000000) financialExposureWeight = 95
  else if (value >= 100000000) financialExposureWeight = 90
  else if (value >= 50000000) financialExposureWeight = 80
  else if (value >= 25000000) financialExposureWeight = 70
  else if (value >= 10000000) financialExposureWeight = 60
  else if (value >= 5000000) financialExposureWeight = 50

  // Calculate loss multiplier (Prospect Theory: losses 2-2.5x gains)
  const baseScore = (stageWeight * 0.3) + (codeRiskWeight * 0.25) +
                   (timelinePressureWeight * 0.25) + (financialExposureWeight * 0.2)
  const lossMultiplier = 2.0 + (baseScore / 100) * 0.5 // 2.0 - 2.5 range

  // Total with loss multiplier applied conceptually
  const total = Math.min(100, Math.round(baseScore * (lossMultiplier / 2)))

  // Generate consequence questions tailored to their situation
  const consequenceQuestions = generateConsequenceQuestions(
    project, stageWeight, codeRiskWeight, timelinePressureWeight
  )

  return {
    total,
    stageWeight,
    codeRiskWeight,
    timelinePressureWeight,
    financialExposureWeight,
    lossMultiplier,
    consequenceQuestions,
  }
}

/**
 * Generate tailored consequence questions based on loss frame analysis
 */
function generateConsequenceQuestions(
  project: { projectStage: string; projectType: string[]; projectValue: number },
  stageWeight: number,
  codeRiskWeight: number,
  timelineWeight: number
): string[] {
  const questions: string[] = []

  // Stage-based questions
  if (stageWeight >= 80) {
    questions.push(
      "What happens to your opening timeline if the fire marshal flags the building for radio coverage issues two weeks before ribbon cutting?"
    )
    questions.push(
      "What's the cost per DAY of a delayed certificate of occupancy—not just revenue, but carrying costs, staff salaries, investor confidence?"
    )
  } else if (stageWeight >= 60) {
    questions.push(
      "How would it impact your project if you had to retrofit infrastructure after drywall is up?"
    )
    questions.push(
      "What's the cost of a change order at this stage versus planning it now?"
    )
  }

  // Code risk questions
  if (codeRiskWeight >= 50) {
    questions.push(
      "Have you had projects where ERCES or fire alarm issues caused inspection failures? What did that cost you?"
    )
    questions.push(
      "Who takes the hit professionally if the building fails its final life safety inspection?"
    )
  }

  // Timeline pressure questions
  if (timelineWeight >= 75) {
    questions.push(
      "What commitments have been made to stakeholders about the opening date? What happens if you miss it?"
    )
    questions.push(
      "If technology delays your opening by even 2 weeks, what's the ripple effect on marketing, staffing, and bookings?"
    )
  }

  // Value-based questions
  if (project.projectValue >= 50000000) {
    questions.push(
      "On a $" + (project.projectValue / 1000000).toFixed(0) + "M project, what percentage would you estimate is at risk if technology infrastructure isn't right?"
    )
  }

  // Project type specific
  const projectTypeLower = project.projectType.join(' ').toLowerCase()
  if (projectTypeLower.includes('hotel') || projectTypeLower.includes('hospitality')) {
    questions.push(
      "What happens to your TripAdvisor and Google reviews if guests experience Wi-Fi issues in the first 90 days?"
    )
    questions.push(
      "How do you quantify the lifetime value of a guest who has a negative technology experience versus one who doesn't?"
    )
  } else if (projectTypeLower.includes('senior') || projectTypeLower.includes('assisted')) {
    questions.push(
      "What's at stake if a fall isn't detected because the monitoring system wasn't properly integrated?"
    )
    questions.push(
      "How would families react if cellular coverage for emergency calls was spotty in their loved one's room?"
    )
  } else if (projectTypeLower.includes('multifamily') || projectTypeLower.includes('apartment')) {
    questions.push(
      "What's the cost of a 1-star reduction in your online reviews because of Wi-Fi complaints?"
    )
    questions.push(
      "How many prospective residents would you lose if self-guided tours weren't working smoothly?"
    )
  }

  return questions.slice(0, 5) // Return top 5 most relevant
}

/**
 * Assess Self-Monitoring Profile (HSM vs LSM)
 */
export function assessSelfMonitorProfile(
  contact: {
    title?: string | null
    roleCategory?: string | null
  },
  project: {
    projectType: string[]
    projectName: string
  },
  conversationSignals?: {
    mentionedCompetitors?: boolean
    askedForSpecs?: boolean
    focusedOnImage?: boolean
    focusedOnFunction?: boolean
  }
): SelfMonitorAssessment {
  let hsmScore = 0
  let lsmScore = 0
  const indicators: string[] = []

  // Title analysis
  if (contact.title) {
    const titleLower = contact.title.toLowerCase()

    for (const indicator of HIGH_SELF_MONITOR_INDICATORS.titles) {
      if (titleLower.includes(indicator)) {
        hsmScore += 15
        indicators.push(`Title suggests HSM: ${indicator}`)
      }
    }

    for (const indicator of LOW_SELF_MONITOR_INDICATORS.titles) {
      if (titleLower.includes(indicator)) {
        lsmScore += 15
        indicators.push(`Title suggests LSM: ${indicator}`)
      }
    }
  }

  // Project type analysis
  const projectStr = project.projectType.join(' ').toLowerCase() + ' ' + project.projectName.toLowerCase()

  for (const indicator of HIGH_SELF_MONITOR_INDICATORS.projectTypes) {
    if (projectStr.includes(indicator)) {
      hsmScore += 10
      indicators.push(`Project type suggests HSM: ${indicator}`)
    }
  }

  for (const indicator of LOW_SELF_MONITOR_INDICATORS.projectTypes) {
    if (projectStr.includes(indicator)) {
      lsmScore += 10
      indicators.push(`Project type suggests LSM: ${indicator}`)
    }
  }

  // Conversation signals (if available)
  if (conversationSignals) {
    if (conversationSignals.mentionedCompetitors) {
      hsmScore += 20
      indicators.push('Mentioned competitors (HSM indicator)')
    }
    if (conversationSignals.focusedOnImage) {
      hsmScore += 25
      indicators.push('Focused on image/perception (HSM indicator)')
    }
    if (conversationSignals.askedForSpecs) {
      lsmScore += 20
      indicators.push('Asked for technical specs (LSM indicator)')
    }
    if (conversationSignals.focusedOnFunction) {
      lsmScore += 25
      indicators.push('Focused on function/reliability (LSM indicator)')
    }
  }

  // Determine profile
  let profile: SelfMonitorProfile = 'unknown'
  let confidence = 0
  let recommendedFraming: SelfMonitorAssessment['recommendedFraming'] = 'balanced'

  const totalScore = hsmScore + lsmScore
  if (totalScore > 0) {
    if (hsmScore > lsmScore * 1.5) {
      profile = 'high'
      confidence = Math.min(90, Math.round((hsmScore / totalScore) * 100))
      recommendedFraming = 'prestige'
    } else if (lsmScore > hsmScore * 1.5) {
      profile = 'low'
      confidence = Math.min(90, Math.round((lsmScore / totalScore) * 100))
      recommendedFraming = 'reliability'
    } else {
      profile = 'unknown'
      confidence = 50
      recommendedFraming = 'balanced'
    }
  }

  // Value props based on profile
  const valuePropsToLead = profile === 'high'
    ? ['Smart Building Innovation', 'Industry-Leading Technology', 'Competitive Advantage', 'Award-Winning Partner']
    : profile === 'low'
    ? ['Groove Guarantee', 'Proven Reliability', 'Single Point of Accountability', '24/7 Support']
    : ['One Partner Solution', 'Groove Guarantee', 'Future-Ready Design']

  // Avoid patterns
  const avoidPatterns = profile === 'high'
    ? ['Overly technical specs early', 'Focus on cost savings', 'Commodity language']
    : profile === 'low'
    ? ['Prestige language', 'Status appeals', 'Vague benefits']
    : ['Extreme positions either way']

  return {
    profile,
    confidence,
    indicators,
    recommendedFraming,
    valuePropsToLead,
    avoidPatterns,
  }
}

/**
 * Assess Neurochemical State and Optimal Approach
 */
export function assessNeurochemicalProfile(
  engagementHistory: {
    responseCount: number
    lastResponseSentiment?: 'positive' | 'neutral' | 'negative' | null
    daysSinceLastContact?: number
    hasObjected?: boolean
  },
  projectContext: {
    projectStage: string
    timelineUrgent: boolean
  }
): NeurochemicalProfile {
  let dopamineState: NeurochemicalProfile['dopamineState'] = 'seeking'
  let oxytocinLevel: NeurochemicalProfile['oxytocinLevel'] = 'building'
  let cortisolLevel: NeurochemicalProfile['cortisolLevel'] = 'calm'
  let serotoninNeed: NeurochemicalProfile['serotoninNeed'] = 'neutral'

  const optimalApproach: string[] = []
  const warningSignals: string[] = []

  // Dopamine assessment
  if (engagementHistory.responseCount === 0) {
    dopamineState = 'seeking'
    optimalApproach.push('Create anticipation with future-pacing')
    optimalApproach.push('Offer novel insights they haven\'t heard')
  } else if (engagementHistory.responseCount >= 3) {
    dopamineState = 'satisfied'
    optimalApproach.push('Maintain momentum with small wins')
  }

  // Oxytocin assessment
  if (engagementHistory.responseCount >= 2 && engagementHistory.lastResponseSentiment === 'positive') {
    oxytocinLevel = 'high_trust'
    optimalApproach.push('Leverage established rapport')
  } else if (engagementHistory.hasObjected) {
    oxytocinLevel = 'low_trust'
    warningSignals.push('Trust needs rebuilding - validate concerns first')
    optimalApproach.push('Lead with empathy and validation')
  }

  // Cortisol assessment
  if (projectContext.timelineUrgent) {
    cortisolLevel = 'elevated'
    warningSignals.push('High stress environment - avoid adding pressure')
    optimalApproach.push('Use calm, neutral tone')
    optimalApproach.push('Offer to simplify their decision')
  }
  if (engagementHistory.hasObjected && engagementHistory.lastResponseSentiment === 'negative') {
    cortisolLevel = 'fight_flight'
    warningSignals.push('CRITICAL: Prospect in defensive mode - pause and de-escalate')
    optimalApproach.push('Take a step back, validate, and reduce pace')
  }

  // Serotonin assessment (status/certainty needs)
  if (['construction', 'fit_out', 'pre_construction'].includes(projectContext.projectStage.toLowerCase())) {
    serotoninNeed = 'status_threatened'
    optimalApproach.push('Provide strong social proof')
    optimalApproach.push('Emphasize Groove Guarantee for certainty')
  }

  return {
    dopamineState,
    oxytocinLevel,
    cortisolLevel,
    serotoninNeed,
    optimalApproach,
    warningSignals,
  }
}

/**
 * Assess Cognitive Load and Decision Fatigue Risk
 */
export function assessCognitiveLoad(
  project: {
    projectValue: number
    projectType: string[]
    servicesNeeded?: string[]
  },
  contact: {
    title?: string | null
    contactCount?: number
  },
  timingContext?: {
    dayOfWeek?: number // 0 = Sunday
    timeOfDay?: 'morning' | 'afternoon' | 'evening'
    endOfQuarter?: boolean
  }
): CognitiveLoadAssessment {
  const recommendations: string[] = []

  // Intrinsic load (complexity of decision)
  let intrinsicLoad: CognitiveLoadAssessment['intrinsicLoad'] = 'medium'
  if (project.projectValue >= 50000000) {
    intrinsicLoad = 'high'
  } else if (project.projectValue < 10000000) {
    intrinsicLoad = 'low'
  }

  const servicesCount = project.servicesNeeded?.length || 0
  if (servicesCount >= 5) {
    intrinsicLoad = 'high'
    recommendations.push('Break solution into phases to reduce overwhelm')
  }

  // Decision fatigue risk
  let decisionFatigueRisk = 30 // Base

  if (timingContext) {
    // Friday afternoon = high fatigue
    if (timingContext.dayOfWeek === 5 && timingContext.timeOfDay === 'afternoon') {
      decisionFatigueRisk += 30
      recommendations.push('TIMING: Friday afternoon - expect low cognitive bandwidth')
    }
    // Monday morning = optimal
    if (timingContext.dayOfWeek === 1 && timingContext.timeOfDay === 'morning') {
      decisionFatigueRisk -= 20
    }
    // End of quarter = high stress
    if (timingContext.endOfQuarter) {
      decisionFatigueRisk += 25
      recommendations.push('End of quarter - simplify messaging and reduce choices')
    }
  }

  // High contact count = fatigue
  if (contact.contactCount && contact.contactCount >= 5) {
    decisionFatigueRisk += 20
    recommendations.push('Multiple touches - they may need a decisive moment, not more info')
  }

  // Extraneous load assessment
  let extraneousLoad: CognitiveLoadAssessment['extraneousLoad'] = 'acceptable'
  if (decisionFatigueRisk >= 60) {
    extraneousLoad = 'overloaded'
    recommendations.push('Use visuals over text')
    recommendations.push('Limit options to 2-3 max')
  }

  // Germane load (productive processing)
  let germaneLoad: CognitiveLoadAssessment['germaneLoad'] = 'medium'
  if (extraneousLoad === 'overloaded') {
    germaneLoad = 'low'
    recommendations.push('Focus on single key message, not multiple points')
  }

  return {
    intrinsicLoad,
    extraneousLoad,
    germaneLoad,
    decisionFatigueRisk: Math.min(100, decisionFatigueRisk),
    simplificationNeeded: decisionFatigueRisk >= 50,
    recommendations,
  }
}

// =============================================================================
// MASTER PSYCHOLOGY SCORE CALCULATOR
// =============================================================================

/**
 * Calculate comprehensive Psychology Score for a lead
 * This is the main function that combines all behavioral science insights
 */
export function calculatePsychologyScore(
  contact: {
    title?: string | null
    roleCategory?: string | null
    decisionLevel?: string | null
    contactCount?: number
    lastResponseSentiment?: 'positive' | 'neutral' | 'negative' | null
    hasObjected?: boolean
  },
  project: {
    projectName: string
    projectType: string[]
    projectStage: string
    projectValue: number
    estimatedCompletionDate?: string | null
    servicesNeeded?: string[]
  },
  engagementHistory?: {
    responseCount?: number
    daysSinceLastContact?: number
  },
  timingContext?: {
    dayOfWeek?: number
    timeOfDay?: 'morning' | 'afternoon' | 'evening'
    endOfQuarter?: boolean
  }
): PsychologyScore {
  // Calculate all component scores
  const identityThreat = calculateIdentityThreatScore(contact, project)

  const lossFrame = calculateLossFrameScore({
    projectStage: project.projectStage,
    projectType: project.projectType,
    projectValue: project.projectValue,
    estimatedCompletionDate: project.estimatedCompletionDate,
    servicesNeeded: project.servicesNeeded,
  })

  const selfMonitor = assessSelfMonitorProfile(contact, project)

  const neurochemical = assessNeurochemicalProfile(
    {
      responseCount: engagementHistory?.responseCount || 0,
      lastResponseSentiment: contact.lastResponseSentiment,
      daysSinceLastContact: engagementHistory?.daysSinceLastContact,
      hasObjected: contact.hasObjected,
    },
    {
      projectStage: project.projectStage,
      timelineUrgent: lossFrame.timelinePressureWeight >= 75,
    }
  )

  const cognitiveLoad = assessCognitiveLoad(project, contact, timingContext)

  // Calculate conversion probability
  // Weighted formula based on behavioral science research
  let conversionProbability = 0

  // Identity threat contributes 25%
  conversionProbability += identityThreat.total * 0.25

  // Loss frame contributes 35% (most powerful motivator per Prospect Theory)
  conversionProbability += lossFrame.total * 0.35

  // Self-monitor alignment contributes 15%
  if (selfMonitor.profile !== 'unknown') {
    conversionProbability += selfMonitor.confidence * 0.15
  } else {
    conversionProbability += 50 * 0.15 // Neutral when unknown
  }

  // Neurochemical state contributes 15%
  let neurochemicalScore = 50
  if (neurochemical.oxytocinLevel === 'high_trust') neurochemicalScore += 25
  if (neurochemical.cortisolLevel === 'calm') neurochemicalScore += 15
  if (neurochemical.cortisolLevel === 'fight_flight') neurochemicalScore -= 30
  conversionProbability += Math.max(0, Math.min(100, neurochemicalScore)) * 0.15

  // Cognitive load penalty (10% weight)
  const loadPenalty = cognitiveLoad.decisionFatigueRisk * 0.1
  conversionProbability -= loadPenalty

  conversionProbability = Math.max(0, Math.min(100, Math.round(conversionProbability)))

  // Determine priority rank
  let priorityRank: PsychologyScore['priorityRank'] = 'C'
  if (conversionProbability >= 75) priorityRank = 'A'
  else if (conversionProbability >= 55) priorityRank = 'B'
  else if (conversionProbability >= 35) priorityRank = 'C'
  else priorityRank = 'D'

  // Determine recommended NEPQ focus
  let recommendedNEPQFocus = 'TRANSITION' // Default - consequence questions
  if (identityThreat.total >= 80) {
    recommendedNEPQFocus = 'TRANSITION with Identity Threading'
  }
  if (neurochemical.cortisolLevel === 'fight_flight') {
    recommendedNEPQFocus = 'CONNECTING - Rebuild Trust First'
  }
  if (cognitiveLoad.simplificationNeeded) {
    recommendedNEPQFocus += ' (Simplified Approach)'
  }

  // Generate key insight
  const keyInsight = generateKeyInsight(identityThreat, lossFrame, selfMonitor, neurochemical)

  return {
    conversionProbability,
    identityThreat,
    lossFrame,
    selfMonitor,
    neurochemical,
    cognitiveLoad,
    priorityRank,
    recommendedNEPQFocus,
    keyInsight,
  }
}

/**
 * Generate the single most important insight for this lead
 */
function generateKeyInsight(
  identity: IdentityThreatScore,
  loss: LossFrameScore,
  selfMonitor: SelfMonitorAssessment,
  neuro: NeurochemicalProfile
): string {
  // Priority order based on what will move the needle most

  if (neuro.cortisolLevel === 'fight_flight') {
    return 'CAUTION: Prospect is in defensive mode. Pause, validate, rebuild trust before proceeding.'
  }

  if (loss.codeRiskWeight >= 60 && loss.stageWeight >= 70) {
    return `HIGH LEVERAGE: Code compliance risk + active construction stage. Lead with "What happens if you fail final inspection?" Loss aversion multiplier: ${loss.lossMultiplier.toFixed(1)}x`
  }

  if (identity.total >= 80 && identity.identityDimension === 'ideal_social') {
    return `IDENTITY PLAY: Decision-maker\'s reputation is on the line. Frame success as legacy-defining. Ask: "Who gets credit if this goes perfectly? Who takes the blame if it doesn\'t?"`
  }

  if (selfMonitor.profile === 'high' && selfMonitor.confidence >= 70) {
    return `STATUS MOTIVATED: High self-monitor detected. Lead with prestige framing: "Most innovative property in the market" > "Reliable systems"`
  }

  if (selfMonitor.profile === 'low' && selfMonitor.confidence >= 70) {
    return `RELIABILITY MOTIVATED: Low self-monitor detected. Lead with Groove Guarantee and technical proof. Avoid status/prestige language.`
  }

  if (loss.timelinePressureWeight >= 80) {
    return `TIMELINE URGENCY: Opening date pressure is acute. Quantify cost per day of delay to activate loss aversion.`
  }

  if (identity.roleWeight >= 85) {
    return `SENIOR DECISION-MAKER: Their identity is tied to project success. Use "How would it look if..." questions to activate ideal self.`
  }

  return `STANDARD APPROACH: Focus on loss frame (${loss.total}/100) with consequence questions. Self-monitor profile: ${selfMonitor.profile}.`
}

// =============================================================================
// EXPORTS
// =============================================================================

const behavioralScoring = {
  calculatePsychologyScore,
  calculateIdentityThreatScore,
  calculateLossFrameScore,
  assessSelfMonitorProfile,
  assessNeurochemicalProfile,
  assessCognitiveLoad,
}

export default behavioralScoring
