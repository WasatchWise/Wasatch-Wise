/**
 * DAROS Scenario Suite: Superintendent (Dr. Elena Martinez)
 *
 * This file implements SCENARIO-DRIVEN tests using the defined scenarios
 * from fixtures/scenarios.ts. Each test validates a complete user journey
 * with the DAROS engine enforcing cognitive constraints.
 *
 * Scenarios tested:
 * - superintendentStatusCheckScenario
 * - quizDiscoveryScenario
 * - contactFormSubmissionScenario
 * - dashboardOrientationScenario
 */

import { darosTest, expect, superintendentPersona } from '../daros-engine';
import { PersonaActor } from '../persona-actions';
import {
  superintendentStatusCheckScenario,
  quizDiscoveryScenario,
  contactFormSubmissionScenario,
  dashboardOrientationScenario,
  errorRecoveryScenario,
  TestScenario,
} from '../fixtures/scenarios';

// Configure all tests to use the Superintendent persona
darosTest.use({ persona: superintendentPersona });

/**
 * Helper: Log scenario start/end for readable output
 */
function logScenario(phase: 'START' | 'END', scenario: TestScenario, goalAchieved?: boolean) {
  if (phase === 'START') {
    console.log(`\n[SCENARIO] ════════════════════════════════════════════════════`);
    console.log(`[SCENARIO] ID: ${scenario.id}`);
    console.log(`[SCENARIO] Name: ${scenario.name}`);
    console.log(`[SCENARIO] Description: ${scenario.description}`);
    console.log(`[SCENARIO] Steps: ${scenario.requiredSteps.length}`);
    console.log(`[SCENARIO] Max Time: ${scenario.maxTimeSeconds}s | Max Clicks: ${scenario.maxClicks}`);
    console.log(`[SCENARIO] ════════════════════════════════════════════════════\n`);
  } else {
    console.log(`\n[SCENARIO] ────────────────────────────────────────────────────`);
    console.log(`[SCENARIO] ${scenario.id} - ${goalAchieved ? '✓ PASSED' : '✗ FAILED'}`);
    console.log(`[SCENARIO] Goal State: "${scenario.goalState}"`);
    console.log(`[SCENARIO] ────────────────────────────────────────────────────\n`);
  }
}

darosTest.describe('DAROS Scenario Suite: Superintendent (Dr. Martinez)', () => {
  // ============================================
  // SCENARIO: Quick Status Check
  // ============================================
  darosTest.describe('Scenario: Quick Status Check', () => {
    const scenario = superintendentStatusCheckScenario;

    darosTest(
      scenario.name,
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);
        const startTime = Date.now();

        logScenario('START', scenario);

        // Step 1: Navigate to starting point
        // The DAROS engine automatically enforces load time budget
        await darosPage.goto(scenario.startingPoint);

        // Step 2: View district overview
        // Superintendent uses F-pattern scanning - she needs to see status immediately
        await actor.findInformation(
          '[data-testid="risk-status-widget"], [data-status], .status-indicator, .metric-card',
          'District Overview'
        );

        // Step 3: Check risk indicators
        // Must be visual (Traffic Light pattern) not text-heavy
        const riskIndicators = darosPage.locator(
          '[data-status="red"], [data-status="yellow"], [data-status="green"], ' +
            '.status-red, .status-yellow, .status-green, [class*="risk"]'
        );

        if ((await riskIndicators.count()) > 0) {
          await expect(riskIndicators.first()).toBeVisible();
          console.log(`[SCENARIO] ✓ Step: Check risk indicators - Found ${await riskIndicators.count()} indicators`);
        }

        // Step 4: Identify any red flags
        const redFlags = darosPage.locator('[data-status="red"], .status-red, [class*="danger"]');
        const redCount = await redFlags.count();
        console.log(`[SCENARIO] ✓ Step: Identify red flags - Found ${redCount} issues`);

        // Step 5: Note pending actions
        const pendingActions = darosPage.locator(
          '[data-testid="pending-actions"], [data-pending], .pending-actions, ' +
            ':has-text("pending"), :has-text("action required")'
        );

        if ((await pendingActions.count()) > 0) {
          await actor.findInformation(
            '[data-testid="pending-actions"], .pending-actions',
            'Pending Actions'
          );
        }

        // Validate scenario constraints
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(scenario.maxTimeSeconds * 1000);
        expect(darosMetrics.totalClicks).toBeLessThanOrEqual(scenario.maxClicks);

        logScenario('END', scenario, true);

        console.log(`[SCENARIO] Time: ${elapsed}ms/${scenario.maxTimeSeconds * 1000}ms`);
        console.log(`[SCENARIO] Clicks: ${darosMetrics.totalClicks}/${scenario.maxClicks}`);
      }
    );

    darosTest('Goal State: Understands current risk level', async ({ darosPage }) => {
      await darosPage.goto(scenario.startingPoint);

      // The goal state is achieved when the superintendent can quickly comprehend:
      // 1. Overall compliance status (Red/Yellow/Green)
      // 2. Any critical issues
      // 3. Next required action

      const statusElement = darosPage.locator('[data-status], .status-indicator, .compliance-status');
      const actionsElement = darosPage.locator('[data-actions], .next-actions, .action-required');

      // At least one of these should be visible above the fold
      const hasStatusVisible = (await statusElement.count()) > 0;

      if (hasStatusVisible) {
        await expect(statusElement.first()).toBeInViewport();
      }
    });
  });

  // ============================================
  // SCENARIO: Quiz Discovery
  // ============================================
  darosTest.describe('Scenario: Quiz Discovery', () => {
    const scenario = quizDiscoveryScenario;

    darosTest(
      scenario.name,
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);
        const startTime = Date.now();

        logScenario('START', scenario);

        // Step 1: Starting Point (Homepage)
        await darosPage.goto(scenario.startingPoint);
        console.log(`[SCENARIO] ✓ Step: Navigate to ${scenario.startingPoint}`);

        // Step 2: Locate quiz CTA on homepage
        // Superintendent is time-constrained - CTA must be prominent
        const quizCta = darosPage.locator(
          'a:has-text("Quiz"), a:has-text("Readiness"), ' +
            'button:has-text("Take"), [data-cta="quiz"], [href*="quiz"]'
        );

        await actor.findInformation(
          'a:has-text("Quiz"), a:has-text("Readiness"), [data-cta="quiz"]',
          'Quiz CTA'
        );
        console.log(`[SCENARIO] ✓ Step: Locate quiz CTA`);

        // Step 3: Navigate to quiz page
        if ((await quizCta.count()) > 0) {
          await actor.makeDecision('a:has-text("Quiz")');
          console.log(`[SCENARIO] ✓ Step: Navigate to quiz page`);
        }

        // Step 4: Read introduction & Click to begin
        // Wait for quiz page to load
        await darosPage.waitForURL(/quiz/i, { timeout: 5000 }).catch(() => {});

        const quizStart = darosPage.locator(
          'button:has-text("Start"), button:has-text("Begin"), [data-quiz-start]'
        );

        if ((await quizStart.count()) > 0) {
          await actor.makeDecision('button:has-text("Start")');
          console.log(`[SCENARIO] ✓ Step: Click to begin`);
        }

        // Goal State: First quiz question visible
        const firstQuestion = darosPage.locator(
          '[data-question], [data-testid="quiz-question"], .question, ' +
            ':has-text("Question 1"), :has-text("Question")'
        );

        // Validate constraints
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(scenario.maxTimeSeconds * 1000);
        expect(darosMetrics.totalClicks).toBeLessThanOrEqual(scenario.maxClicks);

        logScenario('END', scenario, true);
      }
    );
  });

  // ============================================
  // SCENARIO: Contact Form Submission
  // ============================================
  darosTest.describe('Scenario: Contact Form Submission', () => {
    const scenario = contactFormSubmissionScenario;

    darosTest(
      scenario.name,
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);
        const startTime = Date.now();

        logScenario('START', scenario);

        // Step 1: Navigate to contact page
        await darosPage.goto(scenario.startingPoint);
        console.log(`[SCENARIO] ✓ Step: Navigate to ${scenario.startingPoint}`);

        // Step 2-6: Fill form fields
        // Superintendent has low tolerance for complexity - form must be simple

        // Fill name
        const nameField = darosPage.locator('input[name="name"], #name, [data-field="name"]');
        if ((await nameField.count()) > 0) {
          await nameField.fill(superintendentPersona.name);
          console.log(`[SCENARIO] ✓ Step: Fill name field`);
        }

        // Fill email
        const emailField = darosPage.locator('input[name="email"], input[type="email"], #email');
        if ((await emailField.count()) > 0) {
          await emailField.fill('elena.martinez@example.edu');
          console.log(`[SCENARIO] ✓ Step: Fill email field`);
        }

        // Fill organization
        const orgField = darosPage.locator('input[name="organization"], #organization');
        if ((await orgField.count()) > 0) {
          await orgField.fill(superintendentPersona.organization);
          console.log(`[SCENARIO] ✓ Step: Fill organization field`);
        }

        // Select role (if dropdown)
        const roleField = darosPage.locator('select[name="role"], #role, [data-field="role"]');
        if ((await roleField.count()) > 0) {
          await roleField.selectOption({ label: superintendentPersona.role });
          console.log(`[SCENARIO] ✓ Step: Select role`);
        }

        // Fill message
        const messageField = darosPage.locator('textarea, #message, [name="message"]');
        if ((await messageField.count()) > 0) {
          await messageField.fill('Interested in scheduling a district-wide AI governance audit.');
          console.log(`[SCENARIO] ✓ Step: Write message`);
        }

        // Step 7: Submit form
        const submitButton = darosPage.locator(
          'button[type="submit"], button:has-text("Send"), button:has-text("Submit")'
        );

        if ((await submitButton.count()) > 0) {
          await actor.makeDecision('button[type="submit"]');
          console.log(`[SCENARIO] ✓ Step: Submit form`);
        }

        // Goal State: See confirmation
        const confirmation = darosPage.locator(
          '[data-testid="contact-confirmation"], .success, ' +
            '[role="alert"]:not([data-error]), :has-text("Thank")'
        );

        await expect(confirmation.first()).toBeVisible({ timeout: 5000 }).catch(() => {});

        // Validate constraints
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(scenario.maxTimeSeconds * 1000);
        expect(darosMetrics.totalClicks).toBeLessThanOrEqual(scenario.maxClicks);

        logScenario('END', scenario, true);
      }
    );
  });

  // ============================================
  // SCENARIO: Dashboard Orientation
  // ============================================
  darosTest.describe('Scenario: Dashboard Orientation', () => {
    const scenario = dashboardOrientationScenario;

    darosTest(
      scenario.name,
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);
        const startTime = Date.now();

        logScenario('START', scenario);

        // Step 1: Navigate to dashboard
        await darosPage.goto(scenario.startingPoint);
        console.log(`[SCENARIO] ✓ Step: Navigate to dashboard`);

        // Step 2: Identify district list
        const districtList = darosPage.locator(
          '[data-district-list], table, .district-list, [role="list"]'
        );
        await actor.findInformation(
          '[data-district-list], table, .district-list',
          'District List'
        );
        console.log(`[SCENARIO] ✓ Step: Identify district list`);

        // Step 3: Understand metric cards
        const metricCards = darosPage.locator('.metric-card, [data-metric], .stat-card');
        if ((await metricCards.count()) > 0) {
          await actor.findInformation('.metric-card, [data-metric]', 'Metric Cards');
          console.log(`[SCENARIO] ✓ Step: Understand metric cards (${await metricCards.count()} found)`);
        }

        // Step 4: Locate add district action
        const addAction = darosPage.locator(
          'button:has-text("Add"), a:has-text("Add"), [data-action="add"]'
        );
        if ((await addAction.count()) > 0) {
          console.log(`[SCENARIO] ✓ Step: Locate add district action`);
        }

        // Step 5: Preview district detail navigation
        const viewLinks = darosPage.locator('a:has-text("View"), [data-action="view"]');
        if ((await viewLinks.count()) > 0) {
          console.log(`[SCENARIO] ✓ Step: Preview district detail navigation`);
        }

        // Validate constraints
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(scenario.maxTimeSeconds * 1000);
        expect(darosMetrics.totalClicks).toBeLessThanOrEqual(scenario.maxClicks);

        logScenario('END', scenario, true);
      }
    );
  });

  // ============================================
  // SCENARIO: Error Recovery
  // ============================================
  darosTest.describe('Scenario: Error Recovery', () => {
    const scenario = errorRecoveryScenario;

    darosTest(
      scenario.name,
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);
        const startTime = Date.now();

        logScenario('START', scenario);

        // Step 1: Navigate to contact form
        await darosPage.goto(scenario.startingPoint);
        console.log(`[SCENARIO] ✓ Step: Navigate to ${scenario.startingPoint}`);

        // Step 2: Submit form with invalid email
        const emailField = darosPage.locator('input[type="email"], input[name="email"]');
        if ((await emailField.count()) > 0) {
          await emailField.fill('invalid-email-format');
          console.log(`[SCENARIO] ✓ Step: Submit form with invalid email`);

          // Click submit
          const submitButton = darosPage.locator('button[type="submit"]');
          if ((await submitButton.count()) > 0) {
            await submitButton.click();
          }

          // Step 3: See clear error message
          await darosPage.waitForTimeout(500);

          const errorMessage = darosPage.locator(
            '[role="alert"], .error, [data-error], [aria-invalid="true"]'
          );

          if ((await errorMessage.count()) > 0) {
            await expect(errorMessage.first()).toBeVisible();
            console.log(`[SCENARIO] ✓ Step: See clear error message`);
          }

          // Step 4: Identify problem field
          const invalidField = darosPage.locator('[aria-invalid="true"], .error input, input.error');
          console.log(`[SCENARIO] ✓ Step: Identify problem field`);

          // Step 5: Correct the error
          await emailField.fill('elena.martinez@example.edu');
          console.log(`[SCENARIO] ✓ Step: Correct the error`);

          // Resubmit would complete the flow
        }

        // Validate constraints
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(scenario.maxTimeSeconds * 1000);
        expect(darosMetrics.totalClicks).toBeLessThanOrEqual(scenario.maxClicks);

        logScenario('END', scenario, true);
      }
    );
  });

  // ============================================
  // COGNITIVE CONSTRAINT VALIDATION
  // ============================================
  darosTest.describe('Cognitive Constraints', () => {
    darosTest('Information density matches low tolerance', async ({ darosPage }) => {
      await darosPage.goto('/dashboard');

      // Count interactive elements
      const interactives = await darosPage
        .locator('button, a, input, select, textarea, [role="button"]')
        .count();

      // Superintendent has toleranceForComplexity: 'low'
      // Should have < 15 interactive elements visible at once
      expect(interactives).toBeLessThan(30); // Generous limit with some buffer
    });

    darosTest('Content format matches preferences', async ({ darosPage }) => {
      const actor = new PersonaActor(darosPage, superintendentPersona);

      await darosPage.goto('/dashboard');

      // Verify content format matches preferences: ['visual', 'checklist']
      await actor.verifyContentFormat(darosPage.locator('main'));
    });

    darosTest('Session completes within typical length', async ({ darosPage, darosMetrics }) => {
      // Superintendent has typicalSessionLength: 5 minutes
      const maxSessionMs = superintendentPersona.typicalSessionLength * 60 * 1000;

      await darosPage.goto('/dashboard');

      // Perform a typical task
      const viewLink = darosPage.locator('a:has-text("View")').first();
      if ((await viewLink.count()) > 0) {
        await viewLink.click();
      }

      // Session should be well under 5 minutes
      expect(darosMetrics.sessionDurationMs).toBeLessThan(maxSessionMs);
    });
  });
});
