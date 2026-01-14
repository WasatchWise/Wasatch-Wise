/**
 * HCI Test Scenarios for DAROS
 *
 * Task-based scenarios mapped to user archetypes with
 * measurable success criteria.
 */

import { ArchetypeId, Persona } from './personas';

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  archetypes: ArchetypeId[];

  // Task definition
  startingPoint: string; // URL path
  goalState: string;
  requiredSteps: string[];

  // Success metrics
  maxTimeSeconds: number;
  maxClicks: number;
  maxErrors: number;

  // Cognitive load factors
  informationDensity: 'low' | 'medium' | 'high';
  decisionPoints: number;
  memoryBurden: 'minimal' | 'moderate' | 'heavy';

  // Accessibility requirements
  keyboardNavigable: boolean;
  screenReaderCompatible: boolean;
  colorContrastSafe: boolean;

  // Interruption resilience
  statePreservationRequired: boolean;
  resumableAfterInterruption: boolean;
}

// ============================================
// QUIZ JOURNEY SCENARIOS
// ============================================

export const quizDiscoveryScenario: TestScenario = {
  id: 'quiz-discovery',
  name: 'Find and Start AI Readiness Quiz',
  description: 'User discovers quiz from homepage and begins assessment',
  archetypes: ['superintendent', 'it-director', 'teacher', 'parent'],

  startingPoint: '/',
  goalState: 'First quiz question visible',
  requiredSteps: [
    'Locate quiz CTA on homepage',
    'Navigate to quiz page',
    'Read introduction',
    'Click to begin'
  ],

  maxTimeSeconds: 30,
  maxClicks: 3,
  maxErrors: 0,

  informationDensity: 'low',
  decisionPoints: 1,
  memoryBurden: 'minimal',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: false,
  resumableAfterInterruption: false
};

export const quizCompletionScenario: TestScenario = {
  id: 'quiz-completion',
  name: 'Complete Full Quiz Assessment',
  description: 'User answers all 10 questions and receives results',
  archetypes: ['superintendent', 'it-director', 'teacher', 'parent'],

  startingPoint: '/tools/ai-readiness-quiz',
  goalState: 'Personalized results with tier classification visible',
  requiredSteps: [
    'Answer question 1 (Board policy)',
    'Answer question 2 (Teacher usage)',
    'Answer question 3 (FERPA training)',
    'Answer question 4 (Tool evaluation)',
    'Answer question 5 (Parent trust)',
    'Answer question 6 (Incident history)',
    'Answer question 7 (Staff dedication)',
    'Answer question 8 (Teacher confidence)',
    'Answer question 9 (Usage tracking)',
    'Answer question 10 (Parent communication)',
    'Submit email for results',
    'View personalized recommendations'
  ],

  maxTimeSeconds: 180,
  maxClicks: 15,
  maxErrors: 2,

  informationDensity: 'medium',
  decisionPoints: 11,
  memoryBurden: 'minimal',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: true,
  resumableAfterInterruption: true
};

export const quizInterruptionScenario: TestScenario = {
  id: 'quiz-interruption',
  name: 'Resume Quiz After Interruption',
  description: 'User is interrupted mid-quiz and can resume',
  archetypes: ['teacher', 'superintendent'],

  startingPoint: '/tools/ai-readiness-quiz',
  goalState: 'Quiz resumes at correct question with previous answers intact',
  requiredSteps: [
    'Complete 5 questions',
    'Simulate browser close/refresh',
    'Return to quiz page',
    'Verify answers preserved',
    'Continue from question 6'
  ],

  maxTimeSeconds: 60,
  maxClicks: 8,
  maxErrors: 0,

  informationDensity: 'low',
  decisionPoints: 1,
  memoryBurden: 'minimal',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: true,
  resumableAfterInterruption: true
};

// ============================================
// DASHBOARD SCENARIOS
// ============================================

export const dashboardOrientationScenario: TestScenario = {
  id: 'dashboard-orientation',
  name: 'First-Time Dashboard Orientation',
  description: 'New consultant orients to dashboard and understands layout',
  archetypes: ['consultant'],

  startingPoint: '/dashboard',
  goalState: 'User can articulate purpose of each section',
  requiredSteps: [
    'Identify district list',
    'Understand metric cards',
    'Locate add district action',
    'Preview district detail navigation'
  ],

  maxTimeSeconds: 60,
  maxClicks: 5,
  maxErrors: 1,

  informationDensity: 'medium',
  decisionPoints: 0,
  memoryBurden: 'moderate',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: false,
  resumableAfterInterruption: false
};

export const districtCreationScenario: TestScenario = {
  id: 'district-creation',
  name: 'Create New District Engagement',
  description: 'Consultant creates a new district for briefing',
  archetypes: ['consultant'],

  startingPoint: '/dashboard',
  goalState: 'New district appears in list with correct details',
  requiredSteps: [
    'Click Add District',
    'Enter district name',
    'Select state',
    'Choose size band',
    'Submit form',
    'Verify district in list'
  ],

  maxTimeSeconds: 45,
  maxClicks: 8,
  maxErrors: 1,

  informationDensity: 'low',
  decisionPoints: 3,
  memoryBurden: 'minimal',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: true,
  resumableAfterInterruption: false
};

export const briefingWorkflowScenario: TestScenario = {
  id: 'briefing-workflow',
  name: 'Complete 60-Minute Briefing Session',
  description: 'Consultant runs full briefing with district stakeholders',
  archetypes: ['consultant'],

  startingPoint: '/dashboard/districts/[id]',
  goalState: 'All artifacts generated and session marked complete',
  requiredSteps: [
    'Navigate to Briefing tab',
    'Start new session',
    'Assess stakeholder outcomes (5 groups)',
    'Review controls status (8 controls)',
    'Map vendor risks (variable)',
    'Record interventions',
    'Complete session',
    'Verify artifacts generated'
  ],

  maxTimeSeconds: 3600,
  maxClicks: 50,
  maxErrors: 3,

  informationDensity: 'high',
  decisionPoints: 20,
  memoryBurden: 'heavy',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: true,
  resumableAfterInterruption: true
};

// ============================================
// STAKEHOLDER INFORMATION SCENARIOS
// ============================================

export const superintendentStatusCheckScenario: TestScenario = {
  id: 'super-status-check',
  name: 'Superintendent Quick Status Check',
  description: 'Superintendent checks governance status between meetings',
  archetypes: ['superintendent'],

  startingPoint: '/dashboard',
  goalState: 'Understands current risk level and next actions',
  requiredSteps: [
    'View district overview',
    'Check risk indicators',
    'Identify any red flags',
    'Note pending actions'
  ],

  maxTimeSeconds: 60,
  maxClicks: 4,
  maxErrors: 0,

  informationDensity: 'low',
  decisionPoints: 0,
  memoryBurden: 'minimal',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: false,
  resumableAfterInterruption: false
};

export const itDirectorVendorAuditScenario: TestScenario = {
  id: 'it-vendor-audit',
  name: 'IT Director Vendor Compliance Audit',
  description: 'IT Director reviews all vendors for compliance reporting',
  archetypes: ['it-director'],

  startingPoint: '/dashboard/districts/[id]',
  goalState: 'Complete vendor list exported with risk scores',
  requiredSteps: [
    'Navigate to Vendors tab',
    'Review vendor list',
    'Check risk scores',
    'Verify data types mapped',
    'Export vendor report'
  ],

  maxTimeSeconds: 300,
  maxClicks: 15,
  maxErrors: 1,

  informationDensity: 'high',
  decisionPoints: 2,
  memoryBurden: 'moderate',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: false,
  resumableAfterInterruption: false
};

export const boardMemberBriefingPrepScenario: TestScenario = {
  id: 'board-briefing-prep',
  name: 'Board Member Meeting Preparation',
  description: 'Board member reviews one-pager before governance vote',
  archetypes: ['board-member'],

  startingPoint: '/dashboard/districts/[id]',
  goalState: 'Board member understands key points for meeting',
  requiredSteps: [
    'Locate Artifacts tab',
    'Find board one-pager',
    'Review summary points',
    'Note any concerns',
    'Download for offline reference'
  ],

  maxTimeSeconds: 180,
  maxClicks: 6,
  maxErrors: 1,

  informationDensity: 'low',
  decisionPoints: 0,
  memoryBurden: 'moderate',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: false,
  resumableAfterInterruption: false
};

// ============================================
// CHATBOT SCENARIOS
// ============================================

export const askDanSimpleQueryScenario: TestScenario = {
  id: 'ask-dan-simple',
  name: 'Ask Simple Governance Question',
  description: 'User asks Dan a straightforward policy question',
  archetypes: ['teacher', 'superintendent', 'parent'],

  startingPoint: '/tools/ask-dan',
  goalState: 'Receives clear, actionable answer with audio',
  requiredSteps: [
    'Type question',
    'Submit query',
    'Receive response',
    'Audio plays automatically',
    'Understand answer'
  ],

  maxTimeSeconds: 30,
  maxClicks: 2,
  maxErrors: 0,

  informationDensity: 'medium',
  decisionPoints: 0,
  memoryBurden: 'minimal',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: false,
  resumableAfterInterruption: false
};

export const askDanFollowUpScenario: TestScenario = {
  id: 'ask-dan-followup',
  name: 'Multi-Turn Conversation with Dan',
  description: 'User has extended conversation requiring context',
  archetypes: ['it-director', 'consultant'],

  startingPoint: '/tools/ask-dan',
  goalState: 'Complex question resolved through dialogue',
  requiredSteps: [
    'Ask initial question',
    'Receive response',
    'Ask clarifying follow-up',
    'Receive contextual response',
    'Ask final confirmation',
    'Receive conclusive answer'
  ],

  maxTimeSeconds: 180,
  maxClicks: 6,
  maxErrors: 1,

  informationDensity: 'high',
  decisionPoints: 3,
  memoryBurden: 'moderate',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: true,
  resumableAfterInterruption: false
};

// ============================================
// CONTACT & CONVERSION SCENARIOS
// ============================================

export const contactFormSubmissionScenario: TestScenario = {
  id: 'contact-submission',
  name: 'Submit Contact Request',
  description: 'User completes contact form to request consultation',
  archetypes: ['superintendent', 'it-director', 'parent'],

  startingPoint: '/contact',
  goalState: 'Confirmation message displayed, email sent',
  requiredSteps: [
    'Fill name field',
    'Fill email field',
    'Fill organization field',
    'Select role',
    'Write message',
    'Submit form',
    'See confirmation'
  ],

  maxTimeSeconds: 90,
  maxClicks: 8,
  maxErrors: 1,

  informationDensity: 'low',
  decisionPoints: 1,
  memoryBurden: 'minimal',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: false,
  resumableAfterInterruption: false
};

export const errorRecoveryScenario: TestScenario = {
  id: 'error-recovery',
  name: 'Recover from Form Validation Error',
  description: 'User makes input error and successfully corrects it',
  archetypes: ['superintendent', 'teacher', 'parent', 'board-member'],

  startingPoint: '/contact',
  goalState: 'User understands error and successfully resubmits',
  requiredSteps: [
    'Submit form with invalid email',
    'See clear error message',
    'Identify problem field',
    'Correct the error',
    'Resubmit successfully'
  ],

  maxTimeSeconds: 45,
  maxClicks: 5,
  maxErrors: 1,

  informationDensity: 'low',
  decisionPoints: 1,
  memoryBurden: 'minimal',

  keyboardNavigable: true,
  screenReaderCompatible: true,
  colorContrastSafe: true,

  statePreservationRequired: true,
  resumableAfterInterruption: false
};

// ============================================
// SCENARIO COLLECTIONS
// ============================================

export const allScenarios: TestScenario[] = [
  quizDiscoveryScenario,
  quizCompletionScenario,
  quizInterruptionScenario,
  dashboardOrientationScenario,
  districtCreationScenario,
  briefingWorkflowScenario,
  superintendentStatusCheckScenario,
  itDirectorVendorAuditScenario,
  boardMemberBriefingPrepScenario,
  askDanSimpleQueryScenario,
  askDanFollowUpScenario,
  contactFormSubmissionScenario,
  errorRecoveryScenario
];

export function getScenariosForArchetype(archetype: ArchetypeId): TestScenario[] {
  return allScenarios.filter(s => s.archetypes.includes(archetype));
}

export function getCriticalPathScenarios(): TestScenario[] {
  return [
    quizCompletionScenario,
    briefingWorkflowScenario,
    contactFormSubmissionScenario
  ];
}

export function getAccessibilityScenarios(): TestScenario[] {
  return allScenarios.filter(
    s => s.keyboardNavigable && s.screenReaderCompatible
  );
}
