// State Privacy Ecosystem Types
// Scalable structure for all 50 states

export interface StateContact {
  name: string
  title: string
  email?: string
  phone?: string
}

export interface StateLaw {
  name: string
  code: string
  description: string
  url?: string
  keyProvisions?: string[]
}

export interface StateRole {
  title: string
  legalBasis?: string
  required: boolean
  responsibilities: string[]
  firstSteps?: string[]
  resources?: { name: string; url?: string }[]
}

export interface StateResource {
  name: string
  description: string
  type: 'template' | 'guide' | 'form' | 'training' | 'tool' | 'external'
  url?: string
  format?: 'pdf' | 'doc' | 'sheet' | 'slides' | 'video' | 'web'
}

export interface StateWorkflow {
  name: string
  description: string
  steps: {
    number: number
    title: string
    description: string
  }[]
}

export interface StateEcosystem {
  // Basic Info
  code: string // e.g., 'UT', 'CA', 'TX'
  name: string // e.g., 'Utah', 'California', 'Texas'
  sdpcMember: boolean
  lastUpdated: string

  // Overview
  overview: {
    agencyName: string // e.g., 'Utah State Board of Education'
    teamName: string // e.g., 'Student Data Privacy Team'
    mission?: string
    website?: string
    email?: string
    phone?: string
    address?: string
  }

  // Legal Framework
  federalLaws: StateLaw[] // FERPA, PPRA (same for all states)
  stateLaws: StateLaw[]

  // Stakeholders & Roles
  roles: {
    dataManager?: StateRole
    securityOfficer?: StateRole
    recordsOfficer?: StateRole
    other?: StateRole[]
  }

  // Team Contacts
  contacts: StateContact[]

  // Resources
  resources: {
    dpaTemplates: StateResource[]
    guides: StateResource[]
    training: StateResource[]
    tools: StateResource[]
    external: StateResource[]
  }

  // Workflows
  workflows: StateWorkflow[]

  // Compliance Requirements
  compliance: {
    mandatoryDesignations: string[]
    annualRequirements: string[]
    ongoingRequirements: string[]
  }

  // Stats (if available)
  stats?: {
    studentsProtected?: string
    districtsParticipating?: string
    vendorAgreements?: string
  }
}

// Federal laws are the same for all states
export const FEDERAL_LAWS: StateLaw[] = [
  {
    name: 'Family Educational Rights and Privacy Act (FERPA)',
    code: '20 U.S.C. § 1232g',
    description:
      'Federal law protecting the privacy of student education records. Gives parents certain rights with respect to their children\'s education records.',
    url: 'https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html',
    keyProvisions: [
      'Right to inspect and review education records',
      'Right to request amendment of records',
      'Right to consent to disclosure of PII',
      'Right to file complaints with US Dept of Education',
    ],
  },
  {
    name: 'Protection of Pupil Rights Amendment (PPRA)',
    code: '20 U.S.C. § 1232h',
    description:
      'Federal law that affords parents certain rights regarding surveys, collection and use of information for marketing purposes, and certain physical exams.',
    url: 'https://www2.ed.gov/policy/gen/guid/fpco/ppra/index.html',
    keyProvisions: [
      'Consent for surveys on sensitive topics',
      'Opt-out for marketing data collection',
      'Inspection of instructional materials',
      'Notification requirements for schools',
    ],
  },
]

// SDPC Member States (as of 2026)
export const SDPC_MEMBER_STATES = [
  'AL', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI',
  'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA',
  'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM',
  'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD',
  'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]

// All US States and Territories
export const ALL_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]
