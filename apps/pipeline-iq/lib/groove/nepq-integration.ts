/**
 * Groove-Specific NEPQ Integration
 * Combines NEPQ framework with Groove knowledge base
 */

import { NEPQStage, getStageFocus, determineNEPQStage } from '../nepq/framework'
import { getQuestionsByStage, QuestionContext } from '../nepq/questions'
import {
  GROOVE_PRODUCTS,
  GROOVE_VALUE_PROPOSITIONS,
  GROOVE_PAIN_POINTS,
  mapProjectToGrooveSolutions,
  getGrooveTalkingPoints,
  GROOVE_GUARANTEE,
  type GrooveIndustry,
  type ProjectStage,
} from './knowledge-base'

export interface GrooveNEPQContext {
  project: {
    projectName: string
    projectType: string[]
    projectStage: ProjectStage
    unitCount?: number
    amenities?: string[]
    description?: string
  }
  contact: {
    firstName?: string
    title?: string
    roleCategory?: string
    decisionLevel?: string
  }
  isFirstContact: boolean
  hasResponded: boolean
  engagementLevel: 'low' | 'medium' | 'high'
  painIdentified: boolean
  solutionPresented: boolean
}

export interface GrooveNEPQEmailStrategy {
  stage: NEPQStage
  stageFocus: ReturnType<typeof getStageFocus>
  recommendedQuestions: string[]
  groovValueProps: string[]
  painPointsToAddress: string[]
  productsToMention: string[]
  talkingPoints: string[]
  emailTone: 'connecting' | 'consultative' | 'consequence' | 'solution' | 'commitment'
  subjectLineApproach: string
  openingLine: string
  bodyStructure: string[]
  cta: string
}

/**
 * Generate NEPQ-aligned email strategy for Groove sales
 */
export function generateGrooveNEPQStrategy(
  context: GrooveNEPQContext
): GrooveNEPQEmailStrategy {
  const { project, contact, isFirstContact, hasResponded, engagementLevel, painIdentified, solutionPresented } = context

  // Determine NEPQ stage
  const stage = determineNEPQStage({
    isFirstContact,
    hasResponded,
    engagementLevel,
    painIdentified,
    solutionPresented,
  })

  const stageFocus = getStageFocus(stage)

  // Map project to Groove solutions
  const solutionMapping = mapProjectToGrooveSolutions({
    projectType: project.projectType,
    projectStage: project.projectStage,
    unitCount: project.unitCount,
    amenities: project.amenities,
  })

  // Get NEPQ questions for this stage
  const nepqContext: QuestionContext = 'construction_project' // Default for Groove
  const questions = getQuestionsByStage(stage, nepqContext)
  const recommendedQuestions = questions.slice(0, 3).map((q) => q.question)

  // Determine value props to lead with
  const valuePropsToLead = solutionMapping.valuePropsToLead.length > 0
    ? solutionMapping.valuePropsToLead
    : ['one_partner', 'groove_guarantee'] // Default

  const groovValueProps = valuePropsToLead.map((id) => {
    const prop = GROOVE_VALUE_PROPOSITIONS.find((p) => p.id === id)
    return prop ? prop.title : id
  })

  // Identify pain points to address
  const painPointsToAddress: string[] = []
  if (stage === NEPQStage.ENGAGEMENT || stage === NEPQStage.TRANSITION) {
    // Add relevant pain points based on project type
    if (project.projectType.some((t) => ['hotel', 'hospitality'].includes(t.toLowerCase()))) {
      painPointsToAddress.push('vendor_sprawl', 'resident_expectations')
    }
    if (project.projectType.some((t) => ['multifamily', 'apartment'].includes(t.toLowerCase()))) {
      painPointsToAddress.push('resident_expectations', 'staff_overload')
    }
    if (['planning', 'design', 'pre_construction'].includes(project.projectStage)) {
      painPointsToAddress.push('code_risk', 'capex_shock')
    }
  }

  // Products to mention (stage-appropriate)
  const productsToMention: string[] = []
  if (stage === NEPQStage.PRESENTATION || stage === NEPQStage.COMMITMENT) {
    productsToMention.push(...solutionMapping.recommendedProducts.slice(0, 3))
  } else if (stage === NEPQStage.TRANSITION) {
    // Mention products that solve the pain, but don't detail them
    productsToMention.push(...solutionMapping.recommendedProducts.slice(0, 2))
  }

  // Get talking points
  const talkingPoints = getGrooveTalkingPoints({
    industry: project.projectType[0] as GrooveIndustry,
    projectStage: project.projectStage,
    painPoint: painPointsToAddress[0] as keyof typeof GROOVE_PAIN_POINTS,
  })

  // Determine email tone
  const emailTone = getEmailToneForStage(stage)

  // Generate subject line approach
  const subjectLineApproach = generateSubjectLineApproach(stage, project, contact)

  // Generate opening line
  const openingLine = generateOpeningLine(stage, project, contact, isFirstContact)

  // Generate body structure
  const bodyStructure = generateBodyStructure(stage, context, solutionMapping)

  // Generate CTA
  const cta = generateCTA(stage, solutionMapping)

  return {
    stage,
    stageFocus,
    recommendedQuestions,
    groovValueProps,
    painPointsToAddress: painPointsToAddress.map((id) => GROOVE_PAIN_POINTS[id as keyof typeof GROOVE_PAIN_POINTS]?.title || id),
    productsToMention: productsToMention.map((id) => GROOVE_PRODUCTS[id]?.name || id),
    talkingPoints,
    emailTone,
    subjectLineApproach,
    openingLine,
    bodyStructure,
    cta,
  }
}

function getEmailToneForStage(stage: NEPQStage): GrooveNEPQEmailStrategy['emailTone'] {
  switch (stage) {
    case NEPQStage.CONNECTING:
      return 'connecting'
    case NEPQStage.ENGAGEMENT:
      return 'consultative'
    case NEPQStage.TRANSITION:
      return 'consequence'
    case NEPQStage.PRESENTATION:
      return 'solution'
    case NEPQStage.COMMITMENT:
      return 'commitment'
    default:
      return 'consultative'
  }
}

function generateSubjectLineApproach(
  stage: NEPQStage,
  project: GrooveNEPQContext['project'],
  contact: GrooveNEPQContext['contact']
): string {
  switch (stage) {
    case NEPQStage.CONNECTING:
      return `Quick question about ${project.projectName}`
    case NEPQStage.ENGAGEMENT:
      return `Curious about your ${project.projectType[0]} project`
    case NEPQStage.TRANSITION:
      return `The cost of waiting on ${project.projectName}`
    case NEPQStage.PRESENTATION:
      return `How we've helped similar ${project.projectType[0]} properties`
    case NEPQStage.COMMITMENT:
      return `Next steps for ${project.projectName}`
    default:
      return `Quick question about ${project.projectName}`
  }
}

function generateOpeningLine(
  stage: NEPQStage,
  project: GrooveNEPQContext['project'],
  contact: GrooveNEPQContext['contact'],
  isFirstContact: boolean
): string {
  const name = contact.firstName ? `Hi ${contact.firstName},` : 'Hi there,'

  switch (stage) {
    case NEPQStage.CONNECTING:
      return `${name} I noticed ${project.projectName} is in ${project.projectStage}. Would you be open to a quick conversation about the technology infrastructure?`
    case NEPQStage.ENGAGEMENT:
      return `${name} I'm curious - what challenges are you facing with the technology stack for ${project.projectName}?`
    case NEPQStage.TRANSITION:
      return `${name} What happens if the technology infrastructure decisions for ${project.projectName} get delayed?`
    case NEPQStage.PRESENTATION:
      return `${name} Based on what you've shared about ${project.projectName}, here's how we've helped similar properties...`
    case NEPQStage.COMMITMENT:
      return `${name} How does moving forward with the technology solution for ${project.projectName} look to you?`
    default:
      return `${name} I'd love to learn more about ${project.projectName}.`
  }
}

function generateBodyStructure(
  stage: NEPQStage,
  context: GrooveNEPQContext,
  solutionMapping: ReturnType<typeof mapProjectToGrooveSolutions>
): string[] {
  const structure: string[] = []

  switch (stage) {
    case NEPQStage.CONNECTING:
      structure.push(
        'Neutral opening that doesn\'t sound like sales',
        'Show genuine curiosity about their project',
        'Mention Groove\'s specialization in their industry',
        'Low-pressure permission-based approach'
      )
      break

    case NEPQStage.ENGAGEMENT:
      structure.push(
        'Ask discovery questions about current challenges',
        'Understand their technology needs and pain points',
        'Listen for vendor sprawl, code concerns, or resident expectations',
        'Show understanding of their industry-specific needs'
      )
      break

    case NEPQStage.TRANSITION:
      structure.push(
        'Highlight the cost of inaction (delayed openings, code failures)',
        'Visualize future pain if problems continue',
        'Link to identity/status (professional reputation, project success)',
        'Create urgency through loss framing (not gain framing)'
      )
      break

    case NEPQStage.PRESENTATION:
      structure.push(
        'Link solution to their stated needs',
        'Mention relevant Groove products (2-3 max)',
        'Include social proof (awards, similar projects)',
        'Emphasize "one partner" value proposition',
        'Reference Groove Guarantee for risk mitigation'
      )
      break

    case NEPQStage.COMMITMENT:
      structure.push(
        'Use consistency check-ins ("Does this make sense?")',
        'Provide options (choice architecture)',
        'Reinforce their decision with Groove Guarantee',
        'Low-friction CTA (not high-pressure close)'
      )
      break
  }

  return structure
}

function generateCTA(stage: NEPQStage, solutionMapping: ReturnType<typeof mapProjectToGrooveSolutions>): string {
  switch (stage) {
    case NEPQStage.CONNECTING:
      return 'Would you be open to a 15-minute conversation this week?'
    case NEPQStage.ENGAGEMENT:
      return 'I\'d love to learn more about your specific challenges. When would be a good time to connect?'
    case NEPQStage.TRANSITION:
      return 'What would need to be true for you to feel comfortable moving forward with a solution?'
    case NEPQStage.PRESENTATION:
      return 'Would you like to see how we\'ve helped similar properties? I can share a quick case study.'
    case NEPQStage.COMMITMENT:
      return 'What would you like to do next? I can send over a proposal or we can schedule a deeper dive.'
    default:
      return 'I\'d love to connect and learn more about your project.'
  }
}

/**
 * Get Groove-specific objection handling based on NEPQ principles
 */
export function getGrooveObjectionHandling(
  objection: string,
  stage: NEPQStage
): {
  validation: string
  exploration: string
  reframe: string
  valueProp: string
} {
  const objectionLower = objection.toLowerCase()

  // Price/Cost objection
  if (objectionLower.includes('price') || objectionLower.includes('cost') || objectionLower.includes('expensive')) {
    return {
      validation: 'I appreciate you sharing that. Cost is always an important consideration.',
      exploration: 'Help me understand - what specifically concerns you about the investment?',
      reframe: 'What\'s the cost - not just financial, but in time, stress, and missed opportunities - of maintaining the status quo?',
      valueProp: 'The Groove Guarantee ensures On Budget - the number you sign is the number you pay, with no surprise change orders.',
    }
  }

  // Timing/Not ready
  if (objectionLower.includes('not ready') || objectionLower.includes('too early') || objectionLower.includes('later')) {
    return {
      validation: 'I understand timing is important.',
      exploration: 'What would need to be true for you to feel ready to move forward?',
      reframe: 'What happens if this decision gets delayed? How does that impact your project timeline and budget?',
      valueProp: 'Many buildings fail occupancy due to missing ERCES - starting early ensures code compliance from day one.',
    }
  }

  // Vendor/Trust concerns
  if (objectionLower.includes('vendor') || objectionLower.includes('trust') || objectionLower.includes('burned')) {
    return {
      validation: 'I completely understand - you\'ve probably been burned by vendors who disappear after install.',
      exploration: 'What specifically went wrong with previous integrators?',
      reframe: 'What if you had one partner who guaranteed On Time, On Scope, On Budget, On Going - with a $500 make-good if we drop the ball?',
      valueProp: 'The Groove Guarantee: On Time, On Scope, On Budget, On Going. If we fail and it\'s our fault, we make it right with a $500 gift card.',
    }
  }

  // Already have solution
  if (objectionLower.includes('already have') || objectionLower.includes('working with')) {
    return {
      validation: 'I appreciate you sharing that.',
      exploration: 'How is that working for you? What challenges are you still facing?',
      reframe: 'What would it mean if you could consolidate multiple vendors into one partner?',
      valueProp: 'One partner, one throat to choke - eliminates vendor coordination headaches and reduces complexity.',
    }
  }

  // Default
  return {
    validation: 'I appreciate you sharing that. Help me understand - what specifically concerns you?',
    exploration: 'What would need to be true for you to feel comfortable with this solution?',
    reframe: 'Is [objection] the only thing holding you back, or are there other concerns?',
    valueProp: 'Based on what you\'ve told me, here\'s how we\'ve helped similar properties address this exact concern.',
  }
}

