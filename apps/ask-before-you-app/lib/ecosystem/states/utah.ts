import { StateEcosystem, FEDERAL_LAWS } from '../types'

export const UTAH_ECOSYSTEM: StateEcosystem = {
  code: 'UT',
  name: 'Utah',
  sdpcMember: true,
  lastUpdated: '2026-01',

  overview: {
    agencyName: 'Utah State Board of Education',
    teamName: 'Student Data Privacy Team',
    mission:
      'To maintain a secure and responsible data environment for Utah\'s students through working with Local Education Agencies (LEAs), providing training and compliance oversight, and supporting all stakeholders in the educational ecosystem.',
    website: 'https://schools.utah.gov/studentdataprivacy',
    email: 'privacy@schools.utah.gov',
    phone: '(801) 538-7500',
    address: '250 East 500 South, Salt Lake City, Utah 84111',
  },

  federalLaws: FEDERAL_LAWS,

  stateLaws: [
    {
      name: 'Student Privacy Act',
      code: 'Utah Code 53E-9-2',
      description: 'Foundational state law establishing student privacy protections.',
      url: 'https://le.utah.gov/xcode/Title53E/Chapter9/53E-9-P2.html',
    },
    {
      name: 'Student Data Protection Act',
      code: 'Utah Code 53E-9-3',
      description: 'Primary state law governing student data protection requirements and responsibilities.',
      url: 'https://le.utah.gov/xcode/Title53E/Chapter9/53E-9-P3.html',
      keyProvisions: [
        'Requires each district and charter to designate a "student data manager" (53E-9-303)',
        'Details responsibilities of data managers (53E-9-308)',
        'Establishes Utah\'s statutory right to audit vendor data practices (53E-9-309)',
      ],
    },
    {
      name: 'Public School Data Confidentiality and Disclosure',
      code: 'Board Rule R277-487',
      description: 'Utah State Board of Education rule governing how schools handle student data.',
      url: 'https://adminrules.utah.gov/public/rule/R277-487/Current%20Rules',
      keyProvisions: [
        'Cybersecurity framework implementation',
        'Data confidentiality and disclosure protocols',
        'Compliance oversight standards',
      ],
    },
    {
      name: 'Government Data Privacy Act',
      code: 'Utah Code 63A-19',
      description: 'Broader state law governing government data privacy, including educational entities.',
      url: 'https://le.utah.gov/xcode/Title63A/Chapter19/63A-19.html',
    },
    {
      name: 'Personal Privacy for Employee',
      code: 'Utah Code 53G-10-207',
      description: 'Protects privacy of school employee personal information.',
      url: 'https://le.utah.gov/xcode/Title53G/Chapter10/53G-10-S207.html',
    },
  ],

  roles: {
    dataManager: {
      title: 'Data Manager',
      legalBasis: 'Utah Code 53E-9-303',
      required: true,
      responsibilities: [
        'Serving as the primary contact for USBE\'s student data privacy team',
        'Completing annual compliance checks, including the Privacy Practices Benchmark',
        'Overseeing privacy practices in your LEA (policies, DPAs, data sharing)',
        'Collaborating with the information security officer',
        'Participating in the Utah Student Privacy Alliance (USPA)',
      ],
      firstSteps: [
        'Sign up for the Student Data Privacy newsletter',
        'Schedule one-hour onboarding meeting with USBE specialist',
        'Complete Data Manager Course on Canvas',
        'Attend Spring Trainings and Fall Conferences',
      ],
      resources: [
        { name: 'Data Manager Hub', url: 'https://schools.utah.gov/studentdataprivacy' },
        { name: 'Canvas Course' },
        { name: 'USPA Google Drive folder' },
        { name: 'Student Data Privacy YouTube Channel' },
      ],
    },
    securityOfficer: {
      title: 'Information Security Officer (ISO)',
      required: false, // "requested" but not legally required
      responsibilities: [
        'Serving as the primary cybersecurity contact for USBE\'s Student Data Privacy Team',
        'Completing annual compliance checks, including cybersecurity components of Privacy Practices Benchmark',
        'Overseeing implementation of a cybersecurity framework (per Board Rule R277-487)',
        'Collaborating with data manager to respond to data incidents and breaches',
        'Supporting overall privacy efforts',
      ],
      firstSteps: [
        'Sign up for Student Data Privacy newsletter',
        'Familiarize with cybersecurity framework your LEA has adopted',
        'Attend conferences and professional learning opportunities',
      ],
      resources: [
        { name: 'Student Data Privacy YouTube Channel' },
        { name: 'CIS Controls', url: 'https://www.cisecurity.org/controls' },
        { name: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework' },
        { name: 'Utah Cyber Center' },
      ],
    },
    recordsOfficer: {
      title: 'Appointed Records Officer (ARO)',
      required: true,
      responsibilities: [
        'Establish and enforce protocols for controlling access to student records',
        'Manage and maintain data retention policies',
        'Provide guidance and training to LEA staff on record management',
        'Act as liaison between LEAs, parents, and state authorities',
        'Handle GRAMA (Government Records Access and Management Act) requests',
      ],
      firstSteps: [
        'Complete Records Officer Certification Course',
        'Review Educational Retention Schedule',
        'Familiarize with Quick Disposition Guide',
      ],
      resources: [
        { name: 'Open Records Portal' },
        { name: 'Records Officer Certification Course' },
        { name: 'Educational Retention Schedule' },
        { name: 'Quick Disposition Guide' },
      ],
    },
  },

  contacts: [
    {
      name: 'Nicole Sanchez',
      title: 'Student Data Privacy Specialist',
      email: 'privacy@schools.utah.gov',
    },
    {
      name: 'Jeremy Zabriskie',
      title: 'Data Privacy and Security Specialist',
      email: 'privacy@schools.utah.gov',
    },
    {
      name: 'Maren Peterson',
      title: 'Local/State Agency RIM Specialist, Utah State Archives',
      email: 'marenpeterson@utah.gov',
      phone: '(801) 531-3866',
    },
  ],

  resources: {
    dpaTemplates: [
      {
        name: 'National Data Privacy Agreement (NDPA) v2.1',
        description: 'Complete template package with all exhibits',
        type: 'template',
        format: 'doc',
      },
      {
        name: 'National Research Student Data Privacy Agreement (NRDPA)',
        description: 'Template for research partnerships',
        type: 'template',
        format: 'pdf',
      },
      {
        name: 'Early Interactive Software Provider NDPA (EISP-NDPA)',
        description: 'Specialized template for early education software',
        type: 'template',
        format: 'pdf',
      },
      {
        name: 'A Vendor\'s Guide to Utah DPAs',
        description: 'Comprehensive guide explaining Utah requirements for vendors',
        type: 'guide',
        format: 'pdf',
      },
    ],
    guides: [
      {
        name: 'Data Manager Onboarding Slides',
        description: 'Presentation for new data managers',
        type: 'guide',
        format: 'slides',
      },
      {
        name: 'Privacy Principles One-pager',
        description: 'Quick reference for core privacy principles',
        type: 'guide',
        format: 'pdf',
      },
      {
        name: 'Cyber Threats vs. Digital Threats One-pager',
        description: 'Understanding the difference between threat types',
        type: 'guide',
        format: 'pdf',
      },
      {
        name: 'Data Breach Reporting and Notification Requirements',
        description: 'Step-by-step guide for breach response',
        type: 'guide',
        format: 'doc',
      },
      {
        name: '2024 H.B. 182 Guidance for LEA Leaders on Student Surveys',
        description: 'Legislative guidance on survey compliance',
        type: 'guide',
        format: 'doc',
      },
    ],
    training: [
      {
        name: 'Data Privacy Basics',
        description: 'Foundation course for all staff',
        type: 'training',
      },
      {
        name: 'Handling Employee Data',
        description: 'Privacy training for HR and administrative staff',
        type: 'training',
      },
      {
        name: 'Office Staff Training',
        description: 'Privacy training for front office personnel',
        type: 'training',
      },
      {
        name: 'Sharing Data with Law Enforcement',
        description: 'Guidelines for legal data disclosure requests',
        type: 'training',
      },
      {
        name: '2025 Annual Privacy Practices Benchmark Webinar',
        description: 'Annual compliance training',
        type: 'training',
        format: 'video',
      },
    ],
    tools: [
      {
        name: 'USPA Application Menu',
        description: 'Google Sheet tracking approved apps statewide',
        type: 'tool',
        format: 'sheet',
      },
      {
        name: 'Utah DPA Negotiation Tracker Form',
        description: 'Submit new DPA negotiations',
        type: 'tool',
        format: 'web',
      },
      {
        name: 'Utah DPA Negotiation Tracker Sheet',
        description: 'Dashboard of all ongoing negotiations',
        type: 'tool',
        format: 'sheet',
      },
      {
        name: 'USBE Data Breach Reporting Form',
        description: 'Official form for reporting breaches to USBE',
        type: 'form',
        format: 'doc',
      },
    ],
    external: [
      {
        name: 'Utah Cyber Center',
        description: 'State cybersecurity resources and breach reporting',
        type: 'external',
        url: 'https://cybercenter.utah.gov',
      },
      {
        name: 'Utah State Archives',
        description: 'Records management guidance and resources',
        type: 'external',
      },
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
      description: 'Process for approving new educational technology vendors',
      steps: [
        { number: 1, title: 'Request Received', description: 'Teacher/Admin requests new app' },
        { number: 2, title: 'Check Registry', description: 'Data Manager checks USPA Application Menu' },
        { number: 3, title: 'Evaluate Status', description: 'If approved → Subscribe via Exhibit E → Approve. If not → Initiate DPA negotiation' },
        { number: 4, title: 'Vendor Signs', description: 'Vendor signs standard NDPA' },
        { number: 5, title: 'Upload to Registry', description: 'Upload to USPA registry (becomes available statewide)' },
        { number: 6, title: 'Approve', description: 'Add to LEA\'s approved list' },
      ],
    },
    {
      name: 'Data Breach Response Workflow',
      description: 'Process for responding to data security incidents',
      steps: [
        { number: 1, title: 'Incident Discovered', description: 'Security incident is identified' },
        { number: 2, title: 'ISO Notifies', description: 'ISO notifies Data Manager' },
        { number: 3, title: 'Assess Impact', description: 'Assess scope and severity' },
        { number: 4, title: 'Report to USBE', description: 'Submit Data Breach Reporting Form' },
        { number: 5, title: 'Report to Cyber Center', description: 'Report to Utah Cyber Center' },
        { number: 6, title: 'Notify Affected', description: 'Notify affected parties (as required by law)' },
        { number: 7, title: 'Document & Remediate', description: 'Document incident and implement fixes' },
        { number: 8, title: 'Follow-up Review', description: 'Conduct compliance review' },
      ],
    },
    {
      name: 'Annual Compliance Workflow',
      description: 'Annual Privacy Practices Benchmark submission process',
      steps: [
        { number: 1, title: 'Announcement', description: 'USBE announces Privacy Practices Benchmark' },
        { number: 2, title: 'Data Manager Survey', description: 'Data Manager completes benchmark survey' },
        { number: 3, title: 'ISO Components', description: 'ISO completes cybersecurity components' },
        { number: 4, title: 'Submit', description: 'Submit to USBE for review' },
        { number: 5, title: 'Address Gaps', description: 'Address any identified gaps' },
        { number: 6, title: 'Document', description: 'Document improvements' },
      ],
    },
    {
      name: 'GRAMA Request Workflow',
      description: 'Process for handling public records requests',
      steps: [
        { number: 1, title: 'Request Received', description: 'Public request is received' },
        { number: 2, title: 'ARO Review', description: 'ARO reviews the request' },
        { number: 3, title: 'Classify Records', description: 'Determine classification (public/private/protected)' },
        { number: 4, title: 'Legal Consult', description: 'Consult with legal if needed' },
        { number: 5, title: 'Prepare Records', description: 'Prepare responsive records' },
        { number: 6, title: 'Redact', description: 'Redact sensitive/protected information' },
        { number: 7, title: 'Respond', description: 'Provide response within statutory timeline' },
        { number: 8, title: 'Document', description: 'Document process' },
      ],
    },
  ],

  compliance: {
    mandatoryDesignations: [
      'Data Manager (Utah Code 53E-9-303) - REQUIRED',
      'Information Security Officer - REQUESTED',
      'Appointed Records Officer - REQUIRED (Annual certification)',
    ],
    annualRequirements: [
      'Privacy Practices Benchmark submission',
      'Cybersecurity framework compliance review',
      'Records Officer recertification',
      'Privacy policy updates',
      'Staff training completion',
    ],
    ongoingRequirements: [
      'DPA management with all vendors accessing student data',
      'Data breach reporting (within required timelines)',
      'GRAMA request responses',
      'Participation in USPA',
      'Newsletter subscription and monitoring',
    ],
  },

  stats: {
    studentsProtected: '700,000+',
    districtsParticipating: '41 school districts + 100+ charter schools',
    vendorAgreements: 'Hundreds of vendors with standardized DPAs',
  },
}
