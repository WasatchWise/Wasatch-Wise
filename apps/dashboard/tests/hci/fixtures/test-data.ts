/**
 * Test Data and Cognitive Profile Configuration
 *
 * Implements "Cognitive Throttling" concept where UI adapts
 * to match the cognitive load capacity of each archetype.
 */

// ============================================
// COGNITIVE THROTTLING CONFIGURATION
// ============================================

export type CognitiveProfile = {
  archetype: string;
  metaphor: string;
  inputMode: InputMode;
  outputMode: OutputMode;
  frictionTolerance: 'none' | 'minimal' | 'moderate' | 'high';
  loadCapacity: number; // 1-10 scale
  preferredFeedback: FeedbackType[];
};

export type InputMode =
  | 'binary-bulk'      // Admin: Approve/Deny toggles
  | 'natural-language' // Teacher: Chat/voice
  | 'read-only'        // Parent: Minimal input
  | 'code-first'       // Rusty: Terminal/IDE
  | 'voice-first'      // Jasmine: Microphone
  | 'canvas-spatial'   // Jay: Whiteboard/drag
  | 'minimal-private'; // Indigo: Quiet/focused

export type OutputMode =
  | 'traffic-light'    // Admin: Red/Yellow/Green status
  | 'streaming-text'   // Teacher: Vercel AI SDK streaming
  | 'nutrition-label'  // Parent: Plain English cards
  | 'syntax-highlight' // Rusty: Code output
  | 'video-avatar'     // Jasmine: HeyGen/ElevenLabs
  | 'visual-canvas'    // Jay: Spatial layout
  | 'private-studio';  // Indigo: No social counters

export type FeedbackType =
  | 'status-color'
  | 'streaming'
  | 'toast'
  | 'inline'
  | 'audio'
  | 'haptic'
  | 'animation';

// Cognitive profiles for each archetype
export const cognitiveProfiles: Record<string, CognitiveProfile> = {
  administrator: {
    archetype: 'administrator',
    metaphor: 'Traffic Light Dashboard (The Pilot)',
    inputMode: 'binary-bulk',
    outputMode: 'traffic-light',
    frictionTolerance: 'none',
    loadCapacity: 3,
    preferredFeedback: ['status-color', 'toast']
  },

  teacher: {
    archetype: 'teacher',
    metaphor: 'Magic Wand Wizard (The Operator)',
    inputMode: 'natural-language',
    outputMode: 'streaming-text',
    frictionTolerance: 'minimal',
    loadCapacity: 4,
    preferredFeedback: ['streaming', 'inline']
  },

  parent: {
    archetype: 'parent',
    metaphor: 'Nutrition Label (The Watchdog)',
    inputMode: 'read-only',
    outputMode: 'nutrition-label',
    frictionTolerance: 'minimal',
    loadCapacity: 5,
    preferredFeedback: ['inline', 'animation']
  },

  'student-rusty': {
    archetype: 'student-rusty',
    metaphor: 'Terminal Mode (The Logistician)',
    inputMode: 'code-first',
    outputMode: 'syntax-highlight',
    frictionTolerance: 'high',
    loadCapacity: 8,
    preferredFeedback: ['inline', 'animation']
  },

  'student-jasmine': {
    archetype: 'student-jasmine',
    metaphor: 'Stage Mode (The Campaigner)',
    inputMode: 'voice-first',
    outputMode: 'video-avatar',
    frictionTolerance: 'minimal',
    loadCapacity: 6,
    preferredFeedback: ['audio', 'animation']
  },

  'student-jay': {
    archetype: 'student-jay',
    metaphor: 'Canvas Mode (The Adventurer)',
    inputMode: 'canvas-spatial',
    outputMode: 'visual-canvas',
    frictionTolerance: 'moderate',
    loadCapacity: 7,
    preferredFeedback: ['animation', 'haptic']
  },

  'student-indigo': {
    archetype: 'student-indigo',
    metaphor: 'Studio Mode (The Mediator)',
    inputMode: 'minimal-private',
    outputMode: 'private-studio',
    frictionTolerance: 'none',
    loadCapacity: 4,
    preferredFeedback: ['inline', 'animation']
  },

  consultant: {
    archetype: 'consultant',
    metaphor: 'Command Center (The Facilitator)',
    inputMode: 'natural-language',
    outputMode: 'streaming-text',
    frictionTolerance: 'high',
    loadCapacity: 9,
    preferredFeedback: ['streaming', 'toast', 'inline']
  }
};

// ============================================
// METAPHOR INTERACTION PATTERNS
// ============================================

export interface MetaphorPattern {
  metaphor: string;
  primaryComponents: string[];
  interactionStyle: string;
  stateIndicators: string[];
  frictionMechanics: string[];
  successSignals: string[];
}

export const metaphorPatterns: Record<string, MetaphorPattern> = {
  'traffic-light': {
    metaphor: 'Traffic Light Dashboard',
    primaryComponents: [
      'StatusIndicator (Red/Yellow/Green)',
      'DataTable with sticky headers',
      'BatchActionBar',
      'ApprovalToggle',
      'ComplianceScore'
    ],
    interactionStyle: 'Binary decisions, bulk operations',
    stateIndicators: [
      'Red = Liability Risk (blocks Export)',
      'Yellow = Pending Review',
      'Green = Compliant (enables all actions)'
    ],
    frictionMechanics: [
      'Red status disables Export button',
      'Must click "Fix" to resolve issues',
      'Pre-written policy scripts execute on Fix'
    ],
    successSignals: [
      'All indicators green',
      'Export button enabled',
      'Compliance score 100%'
    ]
  },

  'magic-wand': {
    metaphor: 'Magic Wand Wizard',
    primaryComponents: [
      'CommandMenu (Cmd+K)',
      'StreamingTextArea',
      'OneClickExport',
      'IntentParser',
      'LMSIntegration'
    ],
    interactionStyle: 'Natural language, conversational',
    stateIndicators: [
      'Typing indicator during processing',
      'Streaming text response',
      'Ready to export indicator'
    ],
    frictionMechanics: [
      'No menus to navigate',
      'Voice input alternative',
      'Auto-optimize vague prompts'
    ],
    successSignals: [
      'Lesson plan generated',
      'One-click to Canvas/Classroom',
      'Saved to recent outputs'
    ]
  },

  'nutrition-label': {
    metaphor: 'Nutrition Label',
    primaryComponents: [
      'PlainEnglishCard',
      'DrillDownAccordion',
      'DataTransparencyList',
      'TrustBadge',
      'PrivacySummary'
    ],
    interactionStyle: 'Read-only, layered disclosure',
    stateIndicators: [
      'Accordion closed = Simple summary',
      'Accordion open = Full details',
      'Trust badges visible'
    ],
    frictionMechanics: [
      'Defaults to closed (simple)',
      'Allows drill-down for skeptics',
      'No jargon at top level'
    ],
    successSignals: [
      'Parent understands data policy',
      'Can find specific data types',
      'Trust indicators visible'
    ]
  },

  'terminal-mode': {
    metaphor: 'Terminal/IDE Mode (Rusty)',
    primaryComponents: [
      'MonospaceEditor',
      'SyntaxHighlighter',
      'KeyboardShortcutBar',
      'DarkModeToggle',
      'ConsoleOutput'
    ],
    interactionStyle: 'Keyboard-first, code-native',
    stateIndicators: [
      'Cursor position visible',
      'Syntax errors highlighted',
      'Command history accessible'
    ],
    frictionMechanics: [
      'Full keyboard navigation',
      'Vim/Emacs bindings optional',
      'No mouse required'
    ],
    successSignals: [
      'Code executes successfully',
      'Output rendered',
      'History saved'
    ]
  },

  'stage-mode': {
    metaphor: 'Video/Stage Mode (Jasmine)',
    primaryComponents: [
      'MicrophoneButton',
      'AvatarDisplay (HeyGen)',
      'VoiceSynthesis (ElevenLabs)',
      'VideoRecorder',
      'LargeTouchTargets'
    ],
    interactionStyle: 'Voice-first, performative',
    stateIndicators: [
      'Recording indicator',
      'Avatar speaking animation',
      'Audio waveform visualization'
    ],
    frictionMechanics: [
      'No typing required',
      'Large touch targets',
      'Voice commands enabled'
    ],
    successSignals: [
      'Avatar responds with audio',
      'Recording saved',
      'Can share/perform result'
    ]
  },

  'canvas-mode': {
    metaphor: 'Whiteboard/Canvas Mode (Jay)',
    primaryComponents: [
      'SpatialCanvas',
      'DraggableElements',
      'GestureRecognizer',
      'ZoomControls',
      'SnapToGrid'
    ],
    interactionStyle: 'Gesture-based, spatial thinking',
    stateIndicators: [
      'Element selection highlight',
      'Zoom level indicator',
      'Connection lines visible'
    ],
    frictionMechanics: [
      'Swipe/pinch gestures',
      'Drag-to-connect',
      'Spatial memory aids'
    ],
    successSignals: [
      'Layout saved',
      'Connections established',
      'Export to image/video'
    ]
  },

  'studio-mode': {
    metaphor: 'Private Studio Mode (Indigo)',
    primaryComponents: [
      'MinimalistWorkspace',
      'PrivacyToggle',
      'DrawingCanvas',
      'AudioRecorder',
      'NoSocialCounters'
    ],
    interactionStyle: 'Quiet, focused, private',
    stateIndicators: [
      'Privacy mode indicator',
      'No view/like counters',
      'Auto-save indicator'
    ],
    frictionMechanics: [
      'Distraction-free interface',
      'No notifications by default',
      'Easy mute/hide'
    ],
    successSignals: [
      'Work saved privately',
      'Can share when ready',
      'No external pressure'
    ]
  }
};

// ============================================
// MARIO 1-1 "INVISIBLE TUTORIAL" PATTERNS
// ============================================

export interface InvisibleTutorialPattern {
  scenario: string;
  userMistake: string;
  aiIntervention: string;
  learningOutcome: string;
  testAssertion: string;
}

export const invisibleTutorialPatterns: InvisibleTutorialPattern[] = [
  {
    scenario: 'Vague Teacher Prompt',
    userMistake: 'Teacher types: "Help me with math"',
    aiIntervention: 'Claude rewrites to: "Generate a 5th-grade fractions quiz aligned to Utah Core Standards"',
    learningOutcome: 'Teacher sees optimized prompt pattern',
    testAssertion: 'expect(suggestedPrompt).toContain("grade") && toContain("standards")'
  },
  {
    scenario: 'Admin Exports with Red Status',
    userMistake: 'Admin tries to export report while compliance is red',
    aiIntervention: 'Export button disabled, "Fix Issues First" tooltip appears',
    learningOutcome: 'Admin learns export requires green compliance',
    testAssertion: 'expect(exportButton).toBeDisabled() when status === "red"'
  },
  {
    scenario: 'Parent Searches Jargon',
    userMistake: 'Parent searches for "FERPA compliance attestation"',
    aiIntervention: 'System shows: "Looking for data privacy info? Try: Is my child\'s data safe?"',
    learningOutcome: 'Parent learns plain-language queries work better',
    testAssertion: 'expect(searchSuggestion).toUseSimpleLanguage()'
  },
  {
    scenario: 'Student Rusty Uses Mouse',
    userMistake: 'Rusty clicks menu instead of using keyboard',
    aiIntervention: 'Subtle hint: "Pro tip: Ctrl+K opens command palette"',
    learningOutcome: 'Rusty discovers power-user shortcuts',
    testAssertion: 'expect(keyboardHint).toBeVisible() afterMouseInteraction()'
  },
  {
    scenario: 'Incomplete Vendor Entry',
    userMistake: 'IT Director saves vendor without data types',
    aiIntervention: 'Form auto-suggests common data types based on vendor category',
    learningOutcome: 'IT Director learns required fields through suggestion',
    testAssertion: 'expect(dataTypeSuggestions).toAppear() when vendorCategory is set'
  },
  {
    scenario: 'Board Member Confusion',
    userMistake: 'Board member clicks random tabs looking for summary',
    aiIntervention: 'After 3 misdirected clicks, "Looking for the summary?" prompt appears',
    learningOutcome: 'Board member finds board one-pager directly',
    testAssertion: 'expect(helpPrompt).toAppear() after confusedNavigationPattern()'
  }
];

// ============================================
// UNIVERSAL INPUT COMPONENT TEST DATA
// ============================================

export interface UniversalInputTestCase {
  archetype: string;
  expectedRendering: string;
  inputSimulation: string;
  expectedBehavior: string;
}

export const universalInputTestCases: UniversalInputTestCase[] = [
  {
    archetype: 'administrator',
    expectedRendering: 'Checklist with bulk actions',
    inputSimulation: 'Check 5 items, click "Approve All"',
    expectedBehavior: 'All 5 items status changed to approved'
  },
  {
    archetype: 'teacher',
    expectedRendering: 'ChatBox with streaming',
    inputSimulation: 'Type "Create lesson on volcanoes"',
    expectedBehavior: 'Streaming response begins within 500ms'
  },
  {
    archetype: 'parent',
    expectedRendering: 'Read-only cards with accordions',
    inputSimulation: 'Click accordion header',
    expectedBehavior: 'Detailed info expands without page reload'
  },
  {
    archetype: 'student-rusty',
    expectedRendering: 'CodeBlock with syntax highlighting',
    inputSimulation: 'Type Python code, press Ctrl+Enter',
    expectedBehavior: 'Code executes, output in console panel'
  },
  {
    archetype: 'student-jasmine',
    expectedRendering: 'MicrophoneButton with avatar',
    inputSimulation: 'Click mic, speak query',
    expectedBehavior: 'Avatar responds with voice synthesis'
  },
  {
    archetype: 'student-jay',
    expectedRendering: 'SpatialCanvas with drag handles',
    inputSimulation: 'Drag element, pinch to zoom',
    expectedBehavior: 'Element repositions, canvas zooms'
  },
  {
    archetype: 'student-indigo',
    expectedRendering: 'Minimalist workspace, no social',
    inputSimulation: 'Toggle privacy mode',
    expectedBehavior: 'All sharing options hidden'
  }
];

// ============================================
// WCAG 2.1 AA TEST REQUIREMENTS
// ============================================

export interface AccessibilityRequirement {
  criterion: string;
  wcagRef: string;
  level: 'A' | 'AA' | 'AAA';
  testMethod: string;
  archetypeRelevance: string[];
}

export const accessibilityRequirements: AccessibilityRequirement[] = [
  {
    criterion: 'Color Contrast (Normal Text)',
    wcagRef: '1.4.3',
    level: 'AA',
    testMethod: 'Contrast ratio >= 4.5:1',
    archetypeRelevance: ['administrator', 'board-member', 'parent']
  },
  {
    criterion: 'Color Contrast (Large Text)',
    wcagRef: '1.4.3',
    level: 'AA',
    testMethod: 'Contrast ratio >= 3:1 for 18pt+ text',
    archetypeRelevance: ['all']
  },
  {
    criterion: 'Non-Text Contrast',
    wcagRef: '1.4.11',
    level: 'AA',
    testMethod: 'UI components and graphics >= 3:1 contrast',
    archetypeRelevance: ['administrator'] // Traffic light colors critical
  },
  {
    criterion: 'Keyboard Navigation',
    wcagRef: '2.1.1',
    level: 'A',
    testMethod: 'All functionality available via keyboard',
    archetypeRelevance: ['student-rusty', 'consultant']
  },
  {
    criterion: 'Focus Visible',
    wcagRef: '2.4.7',
    level: 'AA',
    testMethod: 'Keyboard focus indicator clearly visible',
    archetypeRelevance: ['all']
  },
  {
    criterion: 'Target Size',
    wcagRef: '2.5.5',
    level: 'AAA',
    testMethod: 'Touch targets >= 44x44 CSS pixels',
    archetypeRelevance: ['student-jasmine', 'parent', 'teacher']
  },
  {
    criterion: 'Error Identification',
    wcagRef: '3.3.1',
    level: 'A',
    testMethod: 'Errors identified and described in text',
    archetypeRelevance: ['all']
  },
  {
    criterion: 'Labels or Instructions',
    wcagRef: '3.3.2',
    level: 'A',
    testMethod: 'Labels provided for user input',
    archetypeRelevance: ['all']
  },
  {
    criterion: 'Screen Reader Announcements',
    wcagRef: '4.1.3',
    level: 'AA',
    testMethod: 'Status messages use ARIA live regions',
    archetypeRelevance: ['all']
  }
];

// ============================================
// SAMPLE DISTRICT DATA FOR TESTING
// ============================================

export const sampleDistricts = [
  {
    id: 'district-1',
    name: 'Mountain View Unified',
    state: 'UT',
    sizeBand: 'large',
    complianceStatus: 'yellow',
    controlsComplete: 6,
    controlsTotal: 8,
    vendorCount: 12,
    highRiskVendors: 2
  },
  {
    id: 'district-2',
    name: 'Riverside County Schools',
    state: 'UT',
    sizeBand: 'mega',
    complianceStatus: 'green',
    controlsComplete: 8,
    controlsTotal: 8,
    vendorCount: 24,
    highRiskVendors: 0
  },
  {
    id: 'district-3',
    name: 'Oakdale School District',
    state: 'UT',
    sizeBand: 'small',
    complianceStatus: 'red',
    controlsComplete: 2,
    controlsTotal: 8,
    vendorCount: 5,
    highRiskVendors: 3
  }
];

// ============================================
// QUIZ RESPONSE DATA FOR TESTING
// ============================================

export const quizResponseSets = {
  redTier: {
    answers: [1, 1, 1, 1, 2, 1, 1, 1, 1, 2], // Low scores
    expectedScore: 35,
    expectedTier: 'red',
    expectedCTA: 'Book Cognitive Audit'
  },
  yellowTier: {
    answers: [3, 3, 2, 3, 3, 4, 2, 3, 2, 3], // Medium scores
    expectedScore: 62,
    expectedTier: 'yellow',
    expectedCTA: 'Get Full Report'
  },
  greenTier: {
    answers: [4, 4, 4, 4, 4, 5, 4, 4, 4, 4], // High scores
    expectedScore: 88,
    expectedTier: 'green',
    expectedCTA: 'Download Report'
  }
};
