/**
 * HCI Archetype Personas for DAROS Testing
 *
 * Each persona encapsulates cognitive characteristics, constraints,
 * typical behaviors, and success criteria for their archetype.
 */

export interface Persona {
  id: string;
  name: string;
  archetype: ArchetypeId;
  role: string;
  organization: string;

  // Cognitive profile
  techComfort: 'low' | 'moderate' | 'high';
  attentionBudget: 'minimal' | 'moderate' | 'focused';
  decisionStyle: 'quick' | 'deliberate' | 'consensus-seeking';

  // Constraints
  typicalSessionLength: number; // minutes
  interruptionProbability: number; // 0-1
  mobileUsagePercent: number; // 0-100

  // Goals and fears
  primaryGoals: string[];
  anxieties: string[];
  successIndicators: string[];

  // Behavioral patterns
  scanPattern: 'F-pattern' | 'layer-cake' | 'spotted' | 'commitment';
  preferredContentFormat: ('text' | 'visual' | 'video' | 'checklist')[];
  toleranceForComplexity: 'low' | 'moderate' | 'high';
}

export type ArchetypeId =
  | 'superintendent'
  | 'it-director'
  | 'teacher'
  | 'board-member'
  | 'parent'
  | 'consultant';

/**
 * Superintendent Persona
 *
 * Executive leader responsible for district-wide decisions.
 * Time-constrained, needs quick summaries with drill-down capability.
 */
export const superintendentPersona: Persona = {
  id: 'super-martinez',
  name: 'Dr. Elena Martinez',
  archetype: 'superintendent',
  role: 'Superintendent',
  organization: 'Mountain View Unified School District',

  techComfort: 'moderate',
  attentionBudget: 'minimal',
  decisionStyle: 'deliberate',

  typicalSessionLength: 5,
  interruptionProbability: 0.8,
  mobileUsagePercent: 60,

  primaryGoals: [
    'Ensure district compliance with AI regulations',
    'Present clear governance story to board',
    'Minimize political risk from AI incidents',
    'Support teacher adoption without mandating'
  ],

  anxieties: [
    'Parent backlash from AI privacy issues',
    'Board questions without clear answers',
    'Being behind peer districts',
    'Staff resistance to new policies'
  ],

  successIndicators: [
    'Can explain AI governance status in 60 seconds',
    'Has board-ready one-pager on demand',
    'Knows current risk level at a glance',
    'Can delegate specific actions with clear owners'
  ],

  scanPattern: 'F-pattern',
  preferredContentFormat: ['visual', 'checklist'],
  toleranceForComplexity: 'low'
};

/**
 * IT Director Persona
 *
 * Technical leader responsible for implementation.
 * Detail-oriented, needs comprehensive data with export capability.
 */
export const itDirectorPersona: Persona = {
  id: 'it-chen',
  name: 'Marcus Chen',
  archetype: 'it-director',
  role: 'Director of Technology',
  organization: 'Riverside County Schools',

  techComfort: 'high',
  attentionBudget: 'focused',
  decisionStyle: 'deliberate',

  typicalSessionLength: 30,
  interruptionProbability: 0.4,
  mobileUsagePercent: 20,

  primaryGoals: [
    'Complete vendor risk assessments',
    'Implement data protection controls',
    'Document compliance evidence',
    'Train staff on security practices'
  ],

  anxieties: [
    'Shadow IT AI tool usage',
    'Data breach liability',
    'Incomplete vendor documentation',
    'Audit failures'
  ],

  successIndicators: [
    'All vendors mapped with risk scores',
    'Controls have clear implementation status',
    'Evidence URLs documented for audits',
    'Export data for compliance reporting'
  ],

  scanPattern: 'commitment',
  preferredContentFormat: ['checklist', 'text'],
  toleranceForComplexity: 'high'
};

/**
 * Teacher Persona
 *
 * Classroom practitioner balancing innovation with safety.
 * Interruption-prone, needs practical guidance.
 */
export const teacherPersona: Persona = {
  id: 'teacher-johnson',
  name: 'Sarah Johnson',
  archetype: 'teacher',
  role: '8th Grade Science Teacher',
  organization: 'Lincoln Middle School',

  techComfort: 'moderate',
  attentionBudget: 'minimal',
  decisionStyle: 'quick',

  typicalSessionLength: 3,
  interruptionProbability: 0.9,
  mobileUsagePercent: 70,

  primaryGoals: [
    'Know which AI tools are approved',
    'Understand what student data is protected',
    'Get practical classroom guidance',
    'Stay compliant without extra burden'
  ],

  anxieties: [
    'Accidentally violating student privacy',
    'Using wrong tool and getting in trouble',
    'Falling behind tech-savvy colleagues',
    'Extra paperwork requirements'
  ],

  successIndicators: [
    'Can check tool approval in under 30 seconds',
    'Understands personal liability clearly',
    'Has go-to reference for common scenarios',
    'Feels supported not policed'
  ],

  scanPattern: 'spotted',
  preferredContentFormat: ['checklist', 'video'],
  toleranceForComplexity: 'low'
};

/**
 * Board Member Persona
 *
 * Governance oversight with infrequent engagement.
 * Needs high-level summaries with confidence.
 */
export const boardMemberPersona: Persona = {
  id: 'board-williams',
  name: 'Patricia Williams',
  archetype: 'board-member',
  role: 'School Board Vice President',
  organization: 'Oakdale School District',

  techComfort: 'low',
  attentionBudget: 'moderate',
  decisionStyle: 'consensus-seeking',

  typicalSessionLength: 10,
  interruptionProbability: 0.3,
  mobileUsagePercent: 40,

  primaryGoals: [
    'Fulfill fiduciary duty on AI governance',
    'Ask informed questions at meetings',
    'Represent parent concerns appropriately',
    'Support superintendent recommendations'
  ],

  anxieties: [
    'Not understanding technical details',
    'Approving something risky',
    'Being caught off-guard by parent complaints',
    'Appearing uninformed at meetings'
  ],

  successIndicators: [
    'Can articulate governance posture in lay terms',
    'Knows 3 key metrics to monitor',
    'Has talking points for constituents',
    'Understands what was approved and why'
  ],

  scanPattern: 'layer-cake',
  preferredContentFormat: ['visual', 'text'],
  toleranceForComplexity: 'low'
};

/**
 * Parent Persona
 *
 * Concerned stakeholder seeking transparency.
 * Emotionally invested, needs trust signals.
 */
export const parentPersona: Persona = {
  id: 'parent-garcia',
  name: 'Michael Garcia',
  archetype: 'parent',
  role: 'Parent of 6th Grader',
  organization: 'Valley Elementary PTA Member',

  techComfort: 'moderate',
  attentionBudget: 'focused',
  decisionStyle: 'deliberate',

  typicalSessionLength: 15,
  interruptionProbability: 0.5,
  mobileUsagePercent: 80,

  primaryGoals: [
    'Verify child data is protected',
    'Understand what AI tools are used',
    'Know how to opt out if needed',
    'Trust district is being responsible'
  ],

  anxieties: [
    'Child data being sold or misused',
    'AI making decisions about child',
    'Not being informed of AI usage',
    'District prioritizing convenience over safety'
  ],

  successIndicators: [
    'Finds privacy policy without hunting',
    'Understands data protection in plain language',
    'Knows escalation path for concerns',
    'Feels heard and respected'
  ],

  scanPattern: 'spotted',
  preferredContentFormat: ['text', 'visual'],
  toleranceForComplexity: 'moderate'
};

/**
 * Consultant Persona (Clarion)
 *
 * Expert user facilitating district briefings.
 * Workflow efficiency, needs power-user features.
 */
export const consultantPersona: Persona = {
  id: 'consultant-kim',
  name: 'Jennifer Kim',
  archetype: 'consultant',
  role: 'Senior Governance Consultant',
  organization: 'Clarion AI Partners',

  techComfort: 'high',
  attentionBudget: 'focused',
  decisionStyle: 'quick',

  typicalSessionLength: 60,
  interruptionProbability: 0.2,
  mobileUsagePercent: 30,

  primaryGoals: [
    'Complete briefing sessions efficiently',
    'Generate professional artifacts quickly',
    'Track multiple district engagements',
    'Demonstrate value to clients'
  ],

  anxieties: [
    'System delays during client meetings',
    'Artifacts looking unprofessional',
    'Losing work from session interruptions',
    'Client seeing confusing interfaces'
  ],

  successIndicators: [
    'Complete briefing workflow under 60 minutes',
    'Generate all artifacts in one session',
    'Navigate without explaining UI to clients',
    'Export client-ready outputs instantly'
  ],

  scanPattern: 'commitment',
  preferredContentFormat: ['checklist', 'visual'],
  toleranceForComplexity: 'high'
};

// Persona collection for iteration
export const allPersonas: Persona[] = [
  superintendentPersona,
  itDirectorPersona,
  teacherPersona,
  boardMemberPersona,
  parentPersona,
  consultantPersona
];

// Lookup by archetype
export const personasByArchetype: Record<ArchetypeId, Persona> = {
  'superintendent': superintendentPersona,
  'it-director': itDirectorPersona,
  'teacher': teacherPersona,
  'board-member': boardMemberPersona,
  'parent': parentPersona,
  'consultant': consultantPersona
};

/**
 * Get cognitive constraints for test configuration
 */
export function getCognitiveConstraints(persona: Persona) {
  return {
    maxLoadTime: persona.attentionBudget === 'minimal' ? 2000 : 5000,
    maxClicksToGoal: persona.toleranceForComplexity === 'low' ? 3 : 6,
    requiresMobileTest: persona.mobileUsagePercent > 50,
    interruptionSimulation: persona.interruptionProbability > 0.5,
    sessionTimeout: persona.typicalSessionLength * 60 * 1000
  };
}
