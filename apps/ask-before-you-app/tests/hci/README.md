# DAROS HCI Archetype Testing Suite

## Philosophy

This test suite implements two core HCI principles:

### 1. Cognitive Throttling
The interface adapts to match the **Cognitive Load Capacity** of each user archetype. We use Next.js middleware to serve different UI shells based on user role.

### 2. Invisible Tutorial (Mario 1-1)
Like Super Mario Bros World 1-1, the interface teaches users how to interact without explicit instruction. Learning happens through doing, not reading.

## User Archetypes & Metaphors

| Archetype | Metaphor | Input Mode | Output Mode | Load Capacity |
|-----------|----------|------------|-------------|---------------|
| **Administrator** | Traffic Light Dashboard | Binary/Bulk | Red/Yellow/Green | 3 (Low) |
| **Teacher** | Magic Wand Wizard | Natural Language | Streaming Text | 4 (Low-Mod) |
| **Parent** | Nutrition Label | Read-Only | Plain English Cards | 5 (Moderate) |
| **Student: Rusty** | Terminal Mode | Code-First | Syntax Highlight | 8 (High) |
| **Student: Jasmine** | Stage Mode | Voice-First | Video Avatar | 6 (Moderate) |
| **Student: Jay** | Canvas Mode | Gesture/Spatial | Visual Canvas | 7 (Mod-High) |
| **Student: Indigo** | Studio Mode | Minimal/Private | Private Studio | 4 (Low-Mod) |
| **Consultant** | Command Center | Power User | Streaming + Artifacts | 9 (High) |

## Test Categories

### Archetype Tests (`archetypes/`)
- `administrator.spec.ts` - Traffic Light pattern, binary inputs, bulk actions
- `teacher.spec.ts` - Magic Wand pattern, streaming responses, Cmd+K
- `parent.spec.ts` - Nutrition Label pattern, drill-down transparency
- `student.spec.ts` - Polymorphic patterns (Rusty/Jasmine/Jay/Indigo)
- `consultant.spec.ts` - Command Center, briefing workflows, artifacts

### Cognitive Tests (`cognitive/`)
- `information-density.spec.ts` - Cognitive load per page, progressive disclosure
- `invisible-tutorial.spec.ts` - Mario 1-1 learning patterns, affordances

### Accessibility Tests (`accessibility/`)
- `wcag-audit.spec.ts` - WCAG 2.1 AA compliance, full accessibility audit

## Running Tests

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run all HCI tests
npx playwright test --config=tests/hci/playwright.config.ts

# Run DAROS persona simulations
npx playwright test tests/hci/specs/

# Run specific archetype
npx playwright test --config=tests/hci/playwright.config.ts --grep "Superintendent"

# Run on mobile viewports
npx playwright test --config=tests/hci/playwright.config.ts --project=mobile-chrome

# Run accessibility tests only
npx playwright test --config=tests/hci/playwright.config.ts --project=accessibility

# Generate HTML report
npx playwright show-report tests/hci/hci-report
```

## DAROS Engine

The DAROS (Digital Archetype Response & Optimization System) engine transforms personas into **active test constraints**:

```typescript
import { darosTest, expect, superintendentPersona } from '../daros-engine';
import { PersonaActor } from '../persona-actions';

// All tests in this file use the Superintendent persona
darosTest.use({ persona: superintendentPersona });

darosTest('Goal: Know risk level at a glance', async ({ darosPage, darosMetrics }) => {
  const actor = new PersonaActor(darosPage, superintendentPersona);

  // Engine enforces load time budget
  await darosPage.goto('/dashboard');

  // Actor simulates F-pattern scanning
  await actor.findInformation('[data-status]', 'Risk Status');

  // Metrics track constraint violations
  console.log(`Clicks: ${darosMetrics.totalClicks}/${darosMetrics.maxClicksAllowed}`);
});
```

### Engine Capabilities

| Capability | Description |
|------------|-------------|
| **Load Time Enforcement** | Fails/warns if page exceeds persona's patience budget |
| **Click Counting** | Tracks clicks against complexity tolerance threshold |
| **Viewport Simulation** | Mobile/tablet/desktop based on usage patterns |
| **Interruption Simulation** | Simulates blur/focus for high-interruption personas |
| **Session Timeout** | Enforces typical session length constraints |

### PersonaActor Behaviors

| Method | Description |
|--------|-------------|
| `findInformation(selector, label)` | Scans using persona's scan pattern (F, commitment, spotted, layer-cake) |
| `makeDecision(selector)` | Clicks with persona's decision style (quick, deliberate, consensus) |
| `provideInput(locator, value)` | Inputs using persona's mode (binary, natural-language, code-first, voice) |
| `waitForResponse(locator)` | Waits for output in expected format (traffic-light, streaming, video) |
| `verifyContentFormat(container)` | Checks if content matches preferred formats |
| `simulateConfusion()` | Simulates confused navigation to test help systems |

### Console Output

```
[DAROS] ═══════════════════════════════════════════════════════════
[DAROS] Persona: Dr. Elena Martinez (superintendent)
[DAROS] Metaphor: Traffic Light Dashboard (The Pilot)
[DAROS] Constraints:
[DAROS]   • Max Load Time: 2000ms
[DAROS]   • Max Clicks: 3
[DAROS]   • Session Timeout: 300s
[DAROS] ═══════════════════════════════════════════════════════════

[DAROS Actor] Dr. Elena Martinez scanning for "Risk Status" using F-pattern pattern
[DAROS ✓] Page loaded in 1245ms (budget: 2000ms)
[DAROS Actor] Dr. Elena Martinez making decision with quick style

[DAROS] ═══════════════════════════════════════════════════════════
[DAROS] Session Summary: Dr. Elena Martinez
[DAROS]   Clicks: 2/3
[DAROS]   Load Time: 1245ms/2000ms
[DAROS]   Violations: 0
[DAROS] ═══════════════════════════════════════════════════════════
```

## Test Structure

```
tests/hci/
├── README.md
├── playwright.config.ts
├── daros-engine.ts              # Core test fixture with constraints
├── persona-actions.ts           # PersonaActor class
│
├── specs/                       # DAROS persona simulation tests
│   ├── superintendent.spec.ts   # Superintendent goal tests
│   ├── superintendent-scenarios.spec.ts  # Full scenario journeys
│   ├── teacher.spec.ts          # Teacher goal tests
│   └── teacher-scenarios.spec.ts         # Teacher scenario journeys
│
├── archetypes/                  # Validation tests (static checks)
│   ├── administrator.spec.ts
│   ├── teacher.spec.ts
│   ├── parent.spec.ts
│   ├── student.spec.ts          # Polymorphic (4 sub-archetypes)
│   └── consultant.spec.ts
│
├── cognitive/
│   ├── information-density.spec.ts
│   └── invisible-tutorial.spec.ts
│
├── accessibility/
│   └── wcag-audit.spec.ts
│
├── fixtures/
│   ├── personas.ts              # Archetype definitions + constraints
│   ├── scenarios.ts             # Task-based scenarios
│   └── test-data.ts             # Cognitive profiles, metaphor patterns
│
└── utils/
    ├── metrics.ts               # Measurement utilities
    └── assertions.ts            # Custom assertions
```

## Key Concepts

### Cognitive Profiles
Each archetype has a defined cognitive profile in `fixtures/test-data.ts`:
- `loadCapacity`: 1-10 scale of complexity tolerance
- `inputMode`: How users prefer to provide input
- `outputMode`: How information should be presented
- `frictionTolerance`: How much friction they'll accept

### Metaphor Patterns
Each metaphor has specific UI requirements in `fixtures/test-data.ts`:
- Primary components required
- Interaction styles
- State indicators
- Friction mechanics (educational friction)
- Success signals

### Invisible Tutorial Patterns
Test data includes Mario 1-1-style learning scenarios:
- User mistakes and AI interventions
- How the system teaches correct behavior
- Expected learning outcomes

## Bob Borden's Framework

These tests validate "Highest Uptake with Least Resistance" by:

1. **Matching cognitive load** to user capacity
2. **Using appropriate metaphors** for each archetype
3. **Teaching through doing**, not instruction
4. **Creating educational friction** that guides correct behavior
5. **Measuring confusion signals** to identify UX problems

## Adding New Tests

### For a new archetype:
1. Add persona to `fixtures/personas.ts`
2. Add cognitive profile to `fixtures/test-data.ts`
3. Create `archetypes/{archetype}.spec.ts`
4. Add scenarios to `fixtures/scenarios.ts`

### For a new invisible tutorial pattern:
1. Add pattern to `invisibleTutorialPatterns` in `fixtures/test-data.ts`
2. Add test case in `cognitive/invisible-tutorial.spec.ts`

## Reports

After running tests, view the HTML report:
```bash
npx playwright show-report tests/hci/hci-report
```

JSON results are saved to `tests/hci/hci-results.json` for CI integration.

## Scenario-Based Testing

Scenarios from `fixtures/scenarios.ts` define complete user journeys with measurable constraints:

```typescript
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
  // ... more constraints
};
```

### Running Scenario Tests

```bash
# Run all scenario tests
npx playwright test tests/hci/specs/*-scenarios.spec.ts

# Run superintendent scenarios only
npx playwright test tests/hci/specs/superintendent-scenarios.spec.ts

# Run with verbose logging
npx playwright test tests/hci/specs/ --reporter=list
```

### Scenario Test Output

```
[SCENARIO] ════════════════════════════════════════════════════
[SCENARIO] 👩‍💼 Superintendent: Dr. Elena Martinez
[SCENARIO] ID: super-status-check
[SCENARIO] "Superintendent Quick Status Check"
[SCENARIO] Constraints: 60s / 4 clicks
[SCENARIO] ════════════════════════════════════════════════════

[SCENARIO] ✓ Step: View district overview
[SCENARIO] ✓ Step: Check risk indicators - Found 3 indicators
[SCENARIO] ✓ Step: Identify red flags - Found 1 issue
[SCENARIO] ✓ Step: Note pending actions

[SCENARIO] ────────────────────────────────────────────────────
[SCENARIO] super-status-check - ✓ PASSED
[SCENARIO] Goal State: "Understands current risk level and next actions"
[SCENARIO] Time: 2341ms/60000ms
[SCENARIO] Clicks: 2/4
[SCENARIO] ────────────────────────────────────────────────────
```

## TDD Integration

This test suite aligns with the Technical Design Document:

| TDD Component | Test Coverage |
|--------------|---------------|
| Multi-Step Quiz (Mario 1-1) | `quizCompletionScenario`, `quizInterruptionScenario` |
| Ask Dan AI Chat | `askDanSimpleQueryScenario`, `askDanFollowUpScenario` |
| Contact Form | `contactFormSubmissionScenario`, `errorRecoveryScenario` |
| Dashboard | `dashboardOrientationScenario`, `superintendentStatusCheckScenario` |
| Briefing Workflow | `briefingWorkflowScenario` |

## Failure Modes

When tests fail, the output tells a human-readable story:

```
[DAROS ⚠️  VIOLATION] Click count (5) exceeds tolerance (3) for Dr. Elena Martinez
[DAROS] Session Summary: Dr. Elena Martinez
[DAROS]   Clicks: 5/3 ⚠️
[DAROS]   Violations: 1
    → Too complex! Superintendent gave up after 5 clicks.
```

This immediately tells the team: **"The UI is too complex for this archetype. Reduce navigation depth."**
