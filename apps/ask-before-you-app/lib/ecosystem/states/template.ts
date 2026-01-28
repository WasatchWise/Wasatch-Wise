import { StateEcosystem, FEDERAL_LAWS } from '../types'

/**
 * TEMPLATE FOR NEW STATE ECOSYSTEMS
 * 
 * Copy this file and rename to {statename}.ts (lowercase)
 * Fill in state-specific information
 * Import and add to the index.ts exports
 * 
 * Research sources for state-specific data:
 * 1. SDPC Registry: https://privacy.a4l.org
 * 2. State Department of Education website
 * 3. State legislature (for state codes)
 * 4. NASBE State Policy Database: https://statepolicies.nasbe.org
 * 5. Student Privacy Compass: https://studentprivacycompass.org
 */

export const STATE_TEMPLATE: StateEcosystem = {
  code: 'XX', // Two-letter state code
  name: 'State Name',
  sdpcMember: true, // Check SDPC membership list
  lastUpdated: '2026-01',

  overview: {
    agencyName: '[State] Department of Education',
    teamName: 'Student Data Privacy [Team/Office/Division]',
    mission: '[State mission statement for student data privacy]',
    website: 'https://[state-education-website]/privacy',
    email: 'privacy@[state].gov',
    phone: '(XXX) XXX-XXXX',
    address: '[Street Address], [City], [State] [ZIP]',
  },

  federalLaws: FEDERAL_LAWS, // Same for all states

  stateLaws: [
    // Research state-specific privacy laws
    // Common patterns:
    // - Student privacy/data protection acts
    // - FERPA state equivalents
    // - Breach notification laws
    // - Records retention laws
    {
      name: '[State] Student Data Privacy Act',
      code: '[State Code Section]',
      description: '[Description of what this law covers]',
      url: '[Link to state legislature]',
      keyProvisions: [
        'Key provision 1',
        'Key provision 2',
        'Key provision 3',
      ],
    },
  ],

  roles: {
    dataManager: {
      title: 'Data Privacy Officer', // Title varies by state
      legalBasis: '[State Code if applicable]',
      required: true, // Check state requirements
      responsibilities: [
        'Primary contact for state privacy team',
        'Oversee DPA agreements with vendors',
        'Ensure compliance with state and federal laws',
        'Train staff on privacy practices',
        'Respond to privacy incidents',
      ],
      firstSteps: [
        'Contact state privacy team for onboarding',
        'Review state-specific requirements',
        'Complete required training courses',
        'Join state privacy alliance/consortium',
      ],
      resources: [],
    },
    securityOfficer: {
      title: 'Information Security Officer',
      required: false, // Check state requirements
      responsibilities: [
        'Implement cybersecurity framework',
        'Monitor security threats',
        'Respond to security incidents',
        'Coordinate with data privacy officer',
      ],
      firstSteps: [],
      resources: [],
    },
    recordsOfficer: {
      title: 'Records Officer',
      required: false, // Check state requirements
      responsibilities: [
        'Manage records retention schedules',
        'Handle public records requests',
        'Ensure proper records disposal',
      ],
      firstSteps: [],
      resources: [],
    },
  },

  contacts: [
    {
      name: '[Primary Contact Name]',
      title: '[Title]',
      email: '[email]',
      phone: '[phone]',
    },
  ],

  resources: {
    dpaTemplates: [
      // Most SDPC states use the standard NDPA
      {
        name: 'National Data Privacy Agreement (NDPA)',
        description: 'Standard DPA template via SDPC',
        type: 'template',
        url: 'https://privacy.a4l.org',
      },
    ],
    guides: [],
    training: [],
    tools: [
      {
        name: 'SDPC National Registry',
        description: 'Search existing DPAs from all SDPC states',
        type: 'tool',
        url: 'https://privacy.a4l.org/registry',
      },
    ],
    external: [
      {
        name: 'Student Data Privacy Consortium (SDPC)',
        description: 'National DPA resources and registry',
        type: 'external',
        url: 'https://privacy.a4l.org',
      },
    ],
  },

  workflows: [
    {
      name: 'Vendor Approval Workflow',
      description: 'Standard process for approving educational technology vendors',
      steps: [
        { number: 1, title: 'Request', description: 'Teacher/Admin requests new app' },
        { number: 2, title: 'Check Registry', description: 'Search SDPC National Registry for existing DPA' },
        { number: 3, title: 'Subscribe or Initiate', description: 'Subscribe to existing DPA or initiate new negotiation' },
        { number: 4, title: 'Review', description: 'Review vendor agreement' },
        { number: 5, title: 'Approve', description: 'Add to approved vendor list' },
      ],
    },
  ],

  compliance: {
    mandatoryDesignations: [
      // List required role designations
    ],
    annualRequirements: [
      // List annual compliance requirements
    ],
    ongoingRequirements: [
      // List ongoing compliance requirements
    ],
  },

  stats: {
    // Add if available
  },
}
