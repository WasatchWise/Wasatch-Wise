/**
 * Vertical-Aware NEPQ Email Generator
 *
 * Uses deep vertical intelligence to generate highly personalized,
 * psychology-driven emails that speak to each role's fears and motivations.
 */

import {
  VerticalType,
  RoleType,
  VerticalIntelligence,
  RolePsychology,
  EmailTemplate,
  WedgeQuestion,
  PainMath,
  getVerticalIntelligence,
  detectVerticalFromProjectType,
  getRolePsychology,
  getWedgeQuestionsForRole,
  getEmailSequence,
  getTimingTriggers,
} from './verticals'

// ===========================================
// TYPES
// ===========================================

export interface ProjectContext {
  projectName: string
  projectTypes: string[]
  projectStage: string
  projectValue?: number
  unitsCount?: number
  city?: string
  state?: string
  estimatedCompletionDate?: string
}

export interface ContactContext {
  firstName: string
  lastName?: string
  title?: string
  email: string
  company?: string
  role?: RoleType
}

export interface SequenceContext {
  sequencePosition: number // 0 = first email, 1 = follow-up #1, etc.
  previousEmails?: {
    sentAt: Date
    subject: string
    opened: boolean
    clicked: boolean
    replied: boolean
  }[]
  lastResponseDate?: Date
  engagementLevel: 'none' | 'low' | 'medium' | 'high'
}

export interface NearbyContext {
  nearbyProjects?: string[]
  nearbyProperties?: string[]
  competitorFacilities?: string[]
  recentIncidents?: {
    facility: string
    description: string
  }[]
}

export interface GeneratedEmail {
  subject: string
  body: string
  vertical: VerticalType
  role: RoleType | null
  sequenceDay: number
  templateType: EmailTemplate['type']
  psychology: {
    targetFear: string
    wedgeQuestion: string | null
    painMath: PainMath | null
  }
  timing: {
    bestSendTime: string
    timezone: string
  }
  metadata: {
    verticalCheatCode: string
    rolePsychology: RolePsychology | null | undefined
  }
}

// ===========================================
// ROLE DETECTION
// ===========================================

/**
 * Detect the most likely role based on title
 */
export function detectRoleFromTitle(title: string): RoleType | null {
  const titleLower = title.toLowerCase()

  const rolePatterns: { patterns: string[]; role: RoleType }[] = [
    { patterns: ['ceo', 'chief executive', 'president', 'owner'], role: 'owner' },
    { patterns: ['cfo', 'chief financial'], role: 'cfo' },
    { patterns: ['developer', 'development'], role: 'developer' },
    { patterns: ['general contractor', 'gc', 'construction manager'], role: 'gc' },
    { patterns: ['property manager', 'community manager', 'asset manager'], role: 'property_manager' },
    { patterns: ['administrator', 'admin', 'executive director'], role: 'administrator' },
    { patterns: ['it director', 'cio', 'chief information', 'technology director', 'it manager'], role: 'it_director' },
    { patterns: ['facilities', 'building manager', 'operations'], role: 'facilities_manager' },
    { patterns: ['director of nursing', 'don', 'nurse manager'], role: 'director_of_nursing' },
    { patterns: ['director of sales', 'sales director', 'sales manager'], role: 'director_of_sales' },
    { patterns: ['architect'], role: 'architect' },
    { patterns: ['engineer'], role: 'engineer' },
  ]

  for (const { patterns, role } of rolePatterns) {
    if (patterns.some(p => titleLower.includes(p))) {
      return role
    }
  }

  return null
}

// ===========================================
// VARIABLE SUBSTITUTION
// ===========================================

interface EmailVariables {
  firstName: string
  lastName?: string
  propertyName: string
  projectName: string
  facilityName: string
  hotelName: string
  buildingName: string
  practiceName: string
  nearbyProperty?: string
  nearbyFacility?: string
  nearbyHotel?: string
  nearbyProject?: string
  competitorFacility?: string
  competitorPractice?: string
  competitorBuilding?: string
  competitorIncidentDescription?: string
  unitCount?: string
  avgRent?: string
  university?: string
  brandName?: string
  redditLinkOrDescription?: string
  [key: string]: string | undefined
}

function buildVariables(
  project: ProjectContext,
  contact: ContactContext,
  nearby: NearbyContext
): EmailVariables {
  const projectName = project.projectName || 'your project'

  return {
    firstName: contact.firstName || 'there',
    lastName: contact.lastName,
    propertyName: projectName,
    projectName: projectName,
    facilityName: projectName,
    hotelName: projectName,
    buildingName: projectName,
    practiceName: contact.company || projectName,
    nearbyProperty: nearby.nearbyProperties?.[0] || 'a property nearby',
    nearbyFacility: nearby.nearbyProperties?.[0] || 'a facility nearby',
    nearbyHotel: nearby.nearbyProperties?.[0] || 'a hotel nearby',
    nearbyProject: nearby.nearbyProjects?.[0] || 'a project nearby',
    competitorFacility: nearby.competitorFacilities?.[0],
    competitorPractice: nearby.competitorFacilities?.[0],
    competitorBuilding: nearby.competitorFacilities?.[0],
    competitorIncidentDescription: nearby.recentIncidents?.[0]?.description,
    unitCount: project.unitsCount?.toString() || '200',
    avgRent: '$1,850',
    university: project.city ? `${project.city} State` : 'the university',
    brandName: 'Marriott', // Default, should be extracted from project data
  }
}

function substituteVariables(template: string, variables: EmailVariables): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    if (value) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }
  }
  return result
}

// ===========================================
// EMAIL GENERATION
// ===========================================

/**
 * Generate a personalized email using vertical intelligence
 */
export function generateVerticalEmail(
  project: ProjectContext,
  contact: ContactContext,
  sequence: SequenceContext,
  nearby: NearbyContext = {}
): GeneratedEmail {
  // Detect vertical from project types
  const vertical = detectVerticalFromProjectType(project.projectTypes)
  const intelligence = getVerticalIntelligence(vertical)

  // Detect or use provided role
  const role = contact.role || (contact.title ? detectRoleFromTitle(contact.title) : null)
  const rolePsychology = role ? getRolePsychology(vertical, role) : null

  // Get email sequence and select template
  const emailSequence = getEmailSequence(vertical)
  const templateIndex = Math.min(sequence.sequencePosition, emailSequence.length - 1)
  const template = emailSequence[templateIndex]

  // Get wedge questions for this role
  const wedgeQuestions = role ? getWedgeQuestionsForRole(vertical, role) : []
  const selectedWedge = wedgeQuestions[0] || null

  // Get pain math
  const painMath = intelligence.painMath[0] || null

  // Build variables
  const variables = buildVariables(project, contact, nearby)

  // Generate subject and body
  const subject = substituteVariables(template.subject, variables)
  const body = substituteVariables(template.body, variables)

  // Get timing
  const bestTime = rolePsychology?.bestContactTime || '9-10am'
  const timezone = getTimezoneFromState(project.state || 'TX')

  return {
    subject,
    body,
    vertical,
    role,
    sequenceDay: template.day,
    templateType: template.type,
    psychology: {
      targetFear: rolePsychology?.whatKeepsThemUp || intelligence.cheatCode.insight,
      wedgeQuestion: selectedWedge?.question || null,
      painMath,
    },
    timing: {
      bestSendTime: bestTime,
      timezone,
    },
    metadata: {
      verticalCheatCode: intelligence.cheatCode.line,
      rolePsychology,
    },
  }
}

/**
 * Generate a custom email using psychology and wedge questions
 */
export function generateCustomNEPQEmail(
  project: ProjectContext,
  contact: ContactContext,
  options: {
    emailType: EmailTemplate['type']
    includeWedge?: boolean
    includePainMath?: boolean
    includeCheatCode?: boolean
    customHook?: string
  }
): GeneratedEmail {
  const vertical = detectVerticalFromProjectType(project.projectTypes)
  const intelligence = getVerticalIntelligence(vertical)
  const role = contact.role || (contact.title ? detectRoleFromTitle(contact.title) : null)
  const rolePsychology = role ? getRolePsychology(vertical, role) : null

  const wedgeQuestions = role ? getWedgeQuestionsForRole(vertical, role) : intelligence.wedgeQuestions
  const selectedWedge = wedgeQuestions[0] || null
  const painMath = intelligence.painMath[0] || null

  // Build the email based on type
  let subject = ''
  let body = ''
  const projectName = project.projectName || 'your project'
  const firstName = contact.firstName || 'there'

  switch (options.emailType) {
    case 'wedge':
      subject = `Quick question about ${projectName}`
      body = `Hey ${firstName},\n\n`
      if (options.customHook) {
        body += `${options.customHook}\n\n`
      }
      if (options.includeWedge && selectedWedge) {
        body += `${selectedWedge.question}\n\n`
        if (selectedWedge.followUp) {
          body += `${selectedWedge.followUp}\n\n`
        }
      }
      body += `Not trying to sell you anything. Just saw your project and it got me curious.\n\n- Mike`
      break

    case 'math':
      subject = `re: Quick question about ${projectName}`
      body = `Hey ${firstName},\n\nOne more thought on ${projectName} -\n\n`
      if (options.includePainMath && painMath) {
        body += `${painMath.scenario}:\n${painMath.calculation}\n\n${painMath.impact}\n\n${painMath.punchline}\n\n`
      }
      body += `Might be worth a 15-minute call to sanity-check your current setup. No pitch, just data.\n\n- Mike`
      break

    case 'fear':
      subject = `Saw something about ${project.city || 'a project nearby'}`
      body = `Hey ${firstName},\n\n`
      if (rolePsychology) {
        body += `${rolePsychology.whatKeepsThemUp}\n\n`
        body += `That question keeps coming up in conversations with ${rolePsychology.title}s. Curious if it's on your radar.\n\n`
      }
      if (options.includeCheatCode) {
        body += `${intelligence.cheatCode.line}\n\n`
      }
      body += `If you ever want a second set of eyes, I'm around.\n\n- Mike`
      break

    case 'story':
      subject = `What happened at a ${vertical.replace('_', ' ')} last month`
      body = `Hey ${firstName},\n\nQuick story -\n\n`
      body += `Talked to a ${rolePsychology?.title || 'property manager'} at a ${vertical.replace('_', ' ')} last month who told me ${intelligence.marketReality[0].toLowerCase()}\n\n`
      body += `Not sure if that resonates with ${projectName}, but thought I'd share.\n\n- Mike`
      break

    case 'competitive':
      subject = `What ${project.city || 'competitors'} are doing`
      body = `Hey ${firstName},\n\n`
      body += `Heads up - ${intelligence.competitiveWedges[0]}\n\n`
      body += `Not sure if that's affecting your prospects, but I'm seeing it come up more.\n\n- Mike`
      break

    case 'exit':
      subject = `Closing the loop on ${projectName}`
      body = `Hey ${firstName},\n\nI'll assume ${projectName} is all set on the technology side.\n\n`
      body += `If anything changes or you want a second set of eyes, I'm around. We specialize in ${intelligence.name.toLowerCase()} and understand the specific requirements.\n\nGood luck with the project.\n\n- Mike`
      break
  }

  const bestTime = rolePsychology?.bestContactTime || '9-10am'
  const timezone = getTimezoneFromState(project.state || 'TX')

  return {
    subject,
    body,
    vertical,
    role,
    sequenceDay: 0,
    templateType: options.emailType,
    psychology: {
      targetFear: rolePsychology?.whatKeepsThemUp || intelligence.cheatCode.insight,
      wedgeQuestion: selectedWedge?.question || null,
      painMath: options.includePainMath ? painMath : null,
    },
    timing: {
      bestSendTime: bestTime,
      timezone,
    },
    metadata: {
      verticalCheatCode: intelligence.cheatCode.line,
      rolePsychology,
    },
  }
}

// ===========================================
// TIMING INTELLIGENCE
// ===========================================

function getTimezoneFromState(state: string): string {
  const timezones: Record<string, string> = {
    // Eastern
    CT: 'America/New_York', DE: 'America/New_York', FL: 'America/New_York',
    GA: 'America/New_York', IN: 'America/New_York', KY: 'America/New_York',
    MA: 'America/New_York', MD: 'America/New_York', ME: 'America/New_York',
    MI: 'America/New_York', NC: 'America/New_York', NH: 'America/New_York',
    NJ: 'America/New_York', NY: 'America/New_York', OH: 'America/New_York',
    PA: 'America/New_York', RI: 'America/New_York', SC: 'America/New_York',
    VA: 'America/New_York', VT: 'America/New_York', WV: 'America/New_York',
    DC: 'America/New_York',
    // Central
    AL: 'America/Chicago', AR: 'America/Chicago', IA: 'America/Chicago',
    IL: 'America/Chicago', KS: 'America/Chicago', LA: 'America/Chicago',
    MN: 'America/Chicago', MO: 'America/Chicago', MS: 'America/Chicago',
    ND: 'America/Chicago', NE: 'America/Chicago', OK: 'America/Chicago',
    SD: 'America/Chicago', TN: 'America/Chicago', TX: 'America/Chicago',
    WI: 'America/Chicago',
    // Mountain
    AZ: 'America/Phoenix', CO: 'America/Denver', ID: 'America/Denver',
    MT: 'America/Denver', NM: 'America/Denver', UT: 'America/Denver',
    WY: 'America/Denver',
    // Pacific
    CA: 'America/Los_Angeles', NV: 'America/Los_Angeles',
    OR: 'America/Los_Angeles', WA: 'America/Los_Angeles',
    // Alaska/Hawaii
    AK: 'America/Anchorage', HI: 'Pacific/Honolulu',
  }

  return timezones[state.toUpperCase()] || 'America/Chicago'
}

/**
 * Calculate the optimal send time for an email
 */
export function calculateOptimalSendTime(
  role: RoleType | null,
  vertical: VerticalType,
  state: string
): Date {
  const rolePsychology = role ? getRolePsychology(vertical, role) : null
  const bestTimeStr = rolePsychology?.bestContactTime || '9-10am'

  // Parse the best time (e.g., "7-8am", "9-10am")
  const match = bestTimeStr.match(/(\d+)(?:-\d+)?([ap]m)/)
  let hour = 9 // Default
  if (match) {
    hour = parseInt(match[1])
    if (match[2] === 'pm' && hour !== 12) hour += 12
    if (match[2] === 'am' && hour === 12) hour = 0
  }

  // Create a date in the target timezone
  const timezone = getTimezoneFromState(state)
  const now = new Date()

  // Get next occurrence of this hour in target timezone
  // For simplicity, we'll just set the hour
  const sendDate = new Date(now)
  sendDate.setHours(hour, 0, 0, 0)

  // If this time has passed today, schedule for tomorrow
  if (sendDate <= now) {
    sendDate.setDate(sendDate.getDate() + 1)
  }

  // Skip weekends
  const day = sendDate.getDay()
  if (day === 0) sendDate.setDate(sendDate.getDate() + 1) // Sunday -> Monday
  if (day === 6) sendDate.setDate(sendDate.getDate() + 2) // Saturday -> Monday

  return sendDate
}

// ===========================================
// SEQUENCE MANAGEMENT
// ===========================================

export interface EmailSequenceConfig {
  vertical: VerticalType
  daysBetweenEmails: number[]
  maxEmails: number
  stopOnReply: boolean
  stopOnBounce: boolean
  pauseOnOpen: boolean
}

export function getDefaultSequenceConfig(vertical: VerticalType): EmailSequenceConfig {
  // Different verticals may have different cadences
  const configs: Partial<Record<VerticalType, Partial<EmailSequenceConfig>>> = {
    medical: {
      daysBetweenEmails: [0, 5, 12, 21], // Longer gaps for medical
      maxEmails: 4,
    },
    senior_living: {
      daysBetweenEmails: [0, 4, 10, 17],
      maxEmails: 4,
    },
    hotel: {
      daysBetweenEmails: [0, 3, 8, 14],
      maxEmails: 4,
    },
    student_housing: {
      daysBetweenEmails: [0, 3, 7, 14], // More urgent, shorter gaps
      maxEmails: 4,
    },
  }

  return {
    vertical,
    daysBetweenEmails: configs[vertical]?.daysBetweenEmails || [0, 4, 10, 17],
    maxEmails: configs[vertical]?.maxEmails || 4,
    stopOnReply: true,
    stopOnBounce: true,
    pauseOnOpen: false,
  }
}

/**
 * Generate the full email sequence for a contact
 */
export function generateFullSequence(
  project: ProjectContext,
  contact: ContactContext,
  nearby: NearbyContext = {}
): GeneratedEmail[] {
  const vertical = detectVerticalFromProjectType(project.projectTypes)
  const config = getDefaultSequenceConfig(vertical)
  const emails: GeneratedEmail[] = []

  for (let i = 0; i < config.maxEmails; i++) {
    const email = generateVerticalEmail(
      project,
      contact,
      {
        sequencePosition: i,
        engagementLevel: 'none',
      },
      nearby
    )
    emails.push(email)
  }

  return emails
}

// ===========================================
// ANALYTICS HELPERS
// ===========================================

export interface SequenceAnalytics {
  vertical: VerticalType
  role: RoleType | null
  emailsSent: number
  opens: number
  clicks: number
  replies: number
  openRate: number
  clickRate: number
  replyRate: number
}

export function calculateSequenceAnalytics(
  emails: {
    vertical: VerticalType
    role: RoleType | null
    opened: boolean
    clicked: boolean
    replied: boolean
  }[]
): SequenceAnalytics {
  if (emails.length === 0) {
    return {
      vertical: 'multifamily',
      role: null,
      emailsSent: 0,
      opens: 0,
      clicks: 0,
      replies: 0,
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
    }
  }

  const opens = emails.filter(e => e.opened).length
  const clicks = emails.filter(e => e.clicked).length
  const replies = emails.filter(e => e.replied).length

  return {
    vertical: emails[0].vertical,
    role: emails[0].role,
    emailsSent: emails.length,
    opens,
    clicks,
    replies,
    openRate: (opens / emails.length) * 100,
    clickRate: (clicks / emails.length) * 100,
    replyRate: (replies / emails.length) * 100,
  }
}
