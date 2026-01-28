/**
 * Groove-Specific Email Generation with NEPQ Integration
 * Combines OpenAI with NEPQ framework and Groove knowledge base
 */

import { generatePersonalizedEmail, type PersonalizedEmail } from '../ai/openai'
import { generateGrooveNEPQStrategy, type GrooveNEPQContext } from './nepq-integration'
import { GROOVE_PRODUCTS, GROOVE_VALUE_PROPOSITIONS, GROOVE_GUARANTEE } from './knowledge-base'
import { NEPQStage } from '../nepq/framework'
import { validateNEPQLanguage, calculateNEPQAlignmentScore } from '../nepq/framework'

export interface GrooveEmailParams {
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
    amenities?: string[]
    description?: string
  }
  company?: { company_name?: string }
  previousInteractions?: unknown[]
  nepqContext?: {
    isFirstContact: boolean
    hasResponded: boolean
    engagementLevel: 'low' | 'medium' | 'high'
    painIdentified: boolean
    solutionPresented: boolean
  }
}

export interface GrooveNEPQEmail extends PersonalizedEmail {
  nepqStage: NEPQStage
  nepqAlignmentScore: number
  groovValueProps: string[]
  painPointsAddressed: string[]
  productsMentioned: string[]
  languageValidation: {
    isValid: boolean
    issues: string[]
    suggestions: string[]
  }
}

/**
 * Generate NEPQ-aligned email for Groove sales
 */
export async function generateGrooveNEPQEmail(
  params: GrooveEmailParams
): Promise<GrooveNEPQEmail> {
  const { contact, project, company, previousInteractions, nepqContext } = params

  // Build NEPQ context
  const context: GrooveNEPQContext = {
    project: {
      projectName: project.project_name,
      projectType: project.project_type || [],
      projectStage: (project.project_stage as any) || 'planning',
      unitCount: project.units_count,
      amenities: project.amenities,
      description: project.description,
    },
    contact: {
      firstName: contact.first_name,
      title: contact.title,
      roleCategory: contact.role_category,
      decisionLevel: contact.decision_level,
    },
    isFirstContact: nepqContext?.isFirstContact ?? (previousInteractions?.length === 0),
    hasResponded: nepqContext?.hasResponded ?? false,
    engagementLevel: nepqContext?.engagementLevel ?? 'low',
    painIdentified: nepqContext?.painIdentified ?? false,
    solutionPresented: nepqContext?.solutionPresented ?? false,
  }

  // Generate NEPQ strategy
  const strategy = generateGrooveNEPQStrategy(context)

  // Build enhanced prompt with NEPQ guidance
  const nepqPrompt = buildNEPQEmailPrompt(strategy, params)

  // Generate base email using OpenAI
  const baseEmail = await generatePersonalizedEmail({
    contact,
    project,
    company,
    previousInteractions,
    template: nepqPrompt.template,
  })

  // Enhance with NEPQ-specific elements
  const enhancedEmail = enhanceEmailWithNEPQ(baseEmail, strategy, context)

  // Validate NEPQ language
  const languageValidation = validateNEPQLanguage(enhancedEmail.body, strategy.stage)

  // Calculate NEPQ alignment score
  const nepqAlignmentScore = calculateNEPQAlignmentScore(enhancedEmail.body, strategy.stage)

  return {
    ...enhancedEmail,
    nepqStage: strategy.stage,
    nepqAlignmentScore,
    groovValueProps: strategy.groovValueProps,
    painPointsAddressed: strategy.painPointsToAddress,
    productsMentioned: strategy.productsToMention,
    languageValidation,
  }
}

function buildNEPQEmailPrompt(
  strategy: ReturnType<typeof generateGrooveNEPQStrategy>,
  params: GrooveEmailParams
): { template: string } {
  const { project, contact } = params
  const stage = strategy.stage

  let template = ''

  // Stage-specific template structure
  switch (stage) {
    case NEPQStage.CONNECTING:
      template = `Subject: ${strategy.subjectLineApproach}

${strategy.openingLine}

I noticed ${project.project_name} is in ${project.project_stage}. Groove specializes in ${project.project_type?.[0] || 'property'} technology solutions, and I'm curious about your approach to the technology infrastructure.

Would you be open to a quick 15-minute conversation this week to discuss your technology needs?

Best,
[Your Name]`
      break

    case NEPQStage.ENGAGEMENT:
      template = `Subject: ${strategy.subjectLineApproach}

${strategy.openingLine}

I'm curious - what challenges are you facing with the technology stack for ${project.project_name}? 

Many ${project.project_type?.[0] || 'property'} owners struggle with:
- Vendor sprawl and coordination headaches
- Code compliance and inspection risks
- Meeting resident/guest technology expectations

I'd love to learn more about your specific situation. When would be a good time to connect?

Best,
[Your Name]`
      break

    case NEPQStage.TRANSITION:
      template = `Subject: ${strategy.subjectLineApproach}

${strategy.openingLine}

What's the cost - not just financial, but in time, stress, and missed opportunities - of delaying technology infrastructure decisions for ${project.project_name}?

Many properties face:
- Failed occupancy permits due to missing ERCES
- Delayed openings impacting revenue
- Competitive disadvantage from outdated technology

If this problem were solved, who would that make you in your organization's eyes?

I'd love to show you how we've helped similar properties avoid these pitfalls. Would you be open to a quick conversation?

Best,
[Your Name]`
      break

    case NEPQStage.PRESENTATION:
      template = `Subject: ${strategy.subjectLineApproach}

${strategy.openingLine}

Based on what you've shared about ${project.project_name}, here's how Groove can help:

${strategy.productsToMention.slice(0, 2).map((product) => `- ${product}`).join('\n')}

Our approach:
- One partner for your entire technology stack (${strategy.groovValueProps[0] || 'One Partner'})
- The Groove Guarantee: On Time, On Scope, On Budget, On Going - with a $500 make-good if we drop the ball
- Deep expertise in ${project.project_type?.[0] || 'property'} technology (AT&T Dealer of the Year, multiple DIRECTV awards)

Would you like to see how we've helped similar properties? I can share a quick case study.

Best,
[Your Name]`
      break

    case NEPQStage.COMMITMENT:
      template = `Subject: ${strategy.subjectLineApproach}

${strategy.openingLine}

Does this approach make sense for ${project.project_name}?

The Groove Guarantee ensures:
- On Time: We commit to the agreed schedule
- On Scope: What we promise is what you get, no surprise change orders
- On Budget: The number you sign is the number you pay
- On Going: Long-term support after install

If we fail and it's our fault, we make it right with a $500 gift card.

What would you like to do next? I can send over a proposal or we can schedule a deeper dive.

Best,
[Your Name]`
      break
  }

  return { template }
}

function enhanceEmailWithNEPQ(
  baseEmail: PersonalizedEmail,
  strategy: ReturnType<typeof generateGrooveNEPQStrategy>,
  context: GrooveNEPQContext
): PersonalizedEmail {
  // Use strategy's subject line if better
  const subject = strategy.subjectLineApproach.length < 60
    ? strategy.subjectLineApproach
    : baseEmail.subject

  // Enhance body with NEPQ elements if needed
  let body = baseEmail.body

  // Add Groove Guarantee mention in presentation/commitment stages
  if (strategy.stage === NEPQStage.PRESENTATION || strategy.stage === NEPQStage.COMMITMENT) {
    if (!body.toLowerCase().includes('guarantee')) {
      body += `\n\nThe Groove Guarantee: On Time, On Scope, On Budget, On Going - with a $500 make-good if we drop the ball.`
    }
  }

  // Ensure CTA aligns with NEPQ stage
  const cta = strategy.cta
  if (!body.includes(cta.split('?')[0])) {
    body = body.replace(/Would you like to.*\?/i, cta)
  }

  return {
    ...baseEmail,
    subject,
    body,
  }
}

/**
 * Generate A/B test variants using NEPQ principles
 */
export async function generateGrooveNEPQVariants(
  originalEmail: GrooveNEPQEmail
): Promise<{
  variantA: GrooveNEPQEmail
  variantB: GrooveNEPQEmail
  testDescription: string
}> {
  const { nepqStage, body, subject } = originalEmail

  // Variant A: More direct/urgent (if in transition stage)
  // Variant B: More consultative/educational (if in engagement stage)

  let variantA: Partial<GrooveNEPQEmail> = { ...originalEmail }
  let variantB: Partial<GrooveNEPQEmail> = { ...originalEmail }
  let testDescription = ''

  if (nepqStage === NEPQStage.TRANSITION) {
    // Variant A: Loss-focused (consequence)
    variantA.subject = `The cost of waiting on ${originalEmail.subject.split(' ').pop()}`
    variantA.body = body.replace(/would you like/i, 'what happens if you don\'t')
    testDescription = 'Testing loss aversion (consequence) vs. consultative approach'

    // Variant B: More consultative
    variantB.subject = `Curious about your technology approach`
    variantB.body = body.replace(/what happens/i, 'help me understand')
  } else if (nepqStage === NEPQStage.PRESENTATION) {
    // Variant A: Social proof focused
    variantA.subject = `How we helped similar ${originalEmail.subject.split(' ').pop()}`
    variantA.body = body + '\n\nWe\'ve helped [similar property] achieve [result].'
    testDescription = 'Testing social proof vs. feature-focused approach'

    // Variant B: Feature/benefit focused
    variantB.subject = `Technology solution for ${originalEmail.subject.split(' ').pop()}`
    variantB.body = body.replace(/we\'ve helped/i, 'our solution includes')
  } else {
    // Default: Tone variation
    variantA.subject = subject
    variantA.body = body
    variantB.subject = subject.replace(/Quick/i, 'Question about')
    variantB.body = body.replace(/I\'d love/i, 'I\'m curious if')
    testDescription = 'Testing tone variation (direct vs. consultative)'
  }

  return {
    variantA: variantA as GrooveNEPQEmail,
    variantB: variantB as GrooveNEPQEmail,
    testDescription,
  }
}

