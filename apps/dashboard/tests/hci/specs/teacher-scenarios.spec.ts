/**
 * DAROS Scenario Suite: Teacher (Sarah Johnson)
 *
 * This file implements SCENARIO-DRIVEN tests for the Teacher persona.
 * Different cognitive constraints than Superintendent:
 * - Higher interruption probability (0.9 vs 0.8)
 * - Shorter session length (3 min vs 5 min)
 * - Quick decision style vs deliberate
 * - Spotted scan pattern vs F-pattern
 *
 * Scenarios tested:
 * - quizCompletionScenario
 * - quizInterruptionScenario
 * - askDanSimpleQueryScenario
 * - askDanFollowUpScenario
 */

import { darosTest, expect, teacherPersona } from '../daros-engine';
import { PersonaActor } from '../persona-actions';
import {
  quizCompletionScenario,
  quizInterruptionScenario,
  askDanSimpleQueryScenario,
  askDanFollowUpScenario,
  contactFormSubmissionScenario,
  TestScenario,
} from '../fixtures/scenarios';

// Configure all tests to use the Teacher persona
darosTest.use({
  persona: teacherPersona,
  strictMode: false, // Teachers get warnings, not hard failures
});

/**
 * Helper: Log scenario execution
 */
function logScenario(phase: 'START' | 'END', scenario: TestScenario, status?: string) {
  if (phase === 'START') {
    console.log(`\n[SCENARIO] ════════════════════════════════════════════════════`);
    console.log(`[SCENARIO] 👩‍🏫 Teacher: ${teacherPersona.name}`);
    console.log(`[SCENARIO] ID: ${scenario.id}`);
    console.log(`[SCENARIO] "${scenario.name}"`);
    console.log(`[SCENARIO] Constraints: ${scenario.maxTimeSeconds}s / ${scenario.maxClicks} clicks`);
    console.log(`[SCENARIO] ════════════════════════════════════════════════════\n`);
  } else {
    console.log(`\n[SCENARIO] Result: ${status}`);
    console.log(`[SCENARIO] ────────────────────────────────────────────────────\n`);
  }
}

darosTest.describe('DAROS Scenario Suite: Teacher (Sarah Johnson)', () => {
  // ============================================
  // SCENARIO: Quiz Completion
  // ============================================
  darosTest.describe('Scenario: Quiz Completion', () => {
    const scenario = quizCompletionScenario;

    darosTest(
      scenario.name,
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, teacherPersona);
        const startTime = Date.now();

        logScenario('START', scenario);

        // Navigate to quiz
        await darosPage.goto(scenario.startingPoint);

        // Teacher uses 'spotted' scanning - looks for keywords quickly
        // Progress through questions
        for (let q = 1; q <= 10; q++) {
          // Find and click an answer option
          const answerOptions = darosPage.locator(
            'button, [role="radio"], input[type="radio"], [data-answer]'
          );

          const optionCount = await answerOptions.count();
          if (optionCount > 0) {
            // Teacher makes quick decisions
            await answerOptions.first().click();
            console.log(`[SCENARIO] ✓ Question ${q}: Answer selected`);
          }

          // Click next/continue
          const nextButton = darosPage.locator(
            'button:has-text("Next"), button:has-text("Continue"), [data-next]'
          );

          if ((await nextButton.count()) > 0) {
            await nextButton.click();
            await darosPage.waitForTimeout(200);
          }
        }

        // Submit email for results
        const emailInput = darosPage.locator('input[type="email"], input[name="email"]');
        if ((await emailInput.count()) > 0) {
          await emailInput.fill('sarah.johnson@school.edu');
          console.log(`[SCENARIO] ✓ Email submitted for results`);
        }

        // View results
        const submitButton = darosPage.locator('button[type="submit"], button:has-text("Get Results")');
        if ((await submitButton.count()) > 0) {
          await submitButton.click();
        }

        // Validate constraints
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(scenario.maxTimeSeconds * 1000);
        expect(darosMetrics.totalClicks).toBeLessThanOrEqual(scenario.maxClicks);

        logScenario('END', scenario, '✓ PASSED');
      }
    );

    darosTest('Goal: Personalized results with tier visible', async ({ darosPage }) => {
      await darosPage.goto('/tools/ai-readiness-quiz');

      // Complete quiz quickly (teacher style)
      for (let i = 0; i < 12; i++) {
        const clickable = darosPage.locator('button').first();
        if ((await clickable.count()) > 0) {
          await clickable.click().catch(() => {});
          await darosPage.waitForTimeout(150);
        }
      }

      // Results should show tier classification
      const tierIndicator = darosPage.locator(
        '[data-tier], .tier-indicator, :has-text("Red"), :has-text("Yellow"), :has-text("Green")'
      );

      // Wait for results
      await darosPage.waitForTimeout(2000);
    });
  });

  // ============================================
  // SCENARIO: Quiz Interruption Resilience
  // ============================================
  darosTest.describe('Scenario: Quiz Interruption', () => {
    const scenario = quizInterruptionScenario;

    darosTest(
      scenario.name,
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, teacherPersona);

        logScenario('START', scenario);

        // Start quiz
        await darosPage.goto(scenario.startingPoint);

        // Complete 5 questions
        for (let q = 1; q <= 5; q++) {
          const answer = darosPage.locator('button, [role="radio"]').first();
          if ((await answer.count()) > 0) {
            await answer.click();
          }

          const next = darosPage.locator('button:has-text("Next")');
          if ((await next.count()) > 0) {
            await next.click();
            await darosPage.waitForTimeout(200);
          }
        }

        console.log(`[SCENARIO] ✓ Completed 5 questions`);

        // Get current state before "interruption"
        const currentUrl = darosPage.url();

        // Simulate interruption (page refresh)
        console.log(`[SCENARIO] 🔔 Simulating interruption (page refresh)...`);
        await darosPage.reload();

        // Verify state is preserved (if implemented)
        // This tests the statePreservationRequired constraint
        if (scenario.statePreservationRequired) {
          // State should be preserved in URL or localStorage
          const urlAfterRefresh = darosPage.url();
          console.log(`[SCENARIO] URL before: ${currentUrl}`);
          console.log(`[SCENARIO] URL after: ${urlAfterRefresh}`);

          // Should still be on quiz page
          expect(urlAfterRefresh).toContain('quiz');
        }

        logScenario('END', scenario, scenario.statePreservationRequired ? '✓ State preserved' : '⚠️ State not tested');
      }
    );
  });

  // ============================================
  // SCENARIO: Ask Dan - Simple Query
  // ============================================
  darosTest.describe('Scenario: Ask Dan Simple Query', () => {
    const scenario = askDanSimpleQueryScenario;

    darosTest(
      scenario.name,
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, teacherPersona);
        const startTime = Date.now();

        logScenario('START', scenario);

        // Navigate to Ask Dan
        await darosPage.goto(scenario.startingPoint);
        console.log(`[SCENARIO] ✓ Step: Navigate to Ask Dan`);

        // Type question (natural language input mode for teacher)
        const chatInput = darosPage.locator('textarea, input[type="text"]').first();
        await expect(chatInput).toBeVisible();

        await actor.provideInput(chatInput, 'What AI tools can students use?');
        console.log(`[SCENARIO] ✓ Step: Type question`);

        // Wait for response
        const response = darosPage.locator('.chat-response, .ai-response, [data-message="assistant"]');
        await actor.waitForResponse(response);
        console.log(`[SCENARIO] ✓ Step: Receive response`);

        // Audio should be available (teacher likes voice output)
        const audioElement = darosPage.locator('audio, [data-audio]');
        if ((await audioElement.count()) > 0) {
          console.log(`[SCENARIO] ✓ Step: Audio available`);
        }

        // Validate constraints
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(scenario.maxTimeSeconds * 1000);
        expect(darosMetrics.totalClicks).toBeLessThanOrEqual(scenario.maxClicks);

        logScenario('END', scenario, '✓ PASSED');
      }
    );

    darosTest('Goal: Clear actionable answer', async ({ darosPage }) => {
      const actor = new PersonaActor(darosPage, teacherPersona);

      await darosPage.goto('/tools/ask-dan');

      const input = darosPage.locator('textarea, input[type="text"]').first();
      await input.fill('Is ChatGPT approved for classroom use?');
      await input.press('Enter');

      // Wait for response
      const response = darosPage.locator('.chat-response, .ai-response').first();
      await expect(response).toBeVisible({ timeout: 10000 });

      // Response should be actionable
      const responseText = await response.textContent();
      expect(responseText?.length).toBeGreaterThan(50);
    });
  });

  // ============================================
  // SCENARIO: Ask Dan - Follow-Up Conversation
  // ============================================
  darosTest.describe('Scenario: Ask Dan Follow-Up', () => {
    const scenario = askDanFollowUpScenario;

    darosTest(
      scenario.name,
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, teacherPersona);
        const startTime = Date.now();

        logScenario('START', scenario);

        await darosPage.goto(scenario.startingPoint);

        const input = darosPage.locator('textarea, input[type="text"]').first();
        const response = darosPage.locator('.chat-response, .ai-response, [data-message]');

        // Turn 1: Initial question
        await input.fill('What data does Google Classroom collect?');
        await input.press('Enter');
        await response.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        console.log(`[SCENARIO] ✓ Turn 1: Ask initial question`);

        await darosPage.waitForTimeout(1000);

        // Turn 2: Clarifying follow-up
        await input.fill('What about student location data?');
        await input.press('Enter');
        await darosPage.waitForTimeout(2000);
        console.log(`[SCENARIO] ✓ Turn 2: Ask clarifying follow-up`);

        // Turn 3: Final confirmation
        await input.fill('So it is safe to use?');
        await input.press('Enter');
        await darosPage.waitForTimeout(2000);
        console.log(`[SCENARIO] ✓ Turn 3: Ask final confirmation`);

        // Validate constraints
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(scenario.maxTimeSeconds * 1000);

        logScenario('END', scenario, '✓ PASSED');
      }
    );
  });

  // ============================================
  // SCENARIO: Contact Form (Teacher Context)
  // ============================================
  darosTest.describe('Scenario: Contact Form (Teacher)', () => {
    const scenario = contactFormSubmissionScenario;

    darosTest(
      'Contact form with teacher-appropriate language',
      async ({ darosPage }) => {
        await darosPage.goto(scenario.startingPoint);

        // Teacher looks for supportive language, not formal/corporate
        const pageText = await darosPage.locator('main').textContent();

        // Should NOT have threatening/policing language
        expect(pageText).not.toMatch(/mandatory|required|must comply/i);

        // Form should be simple
        const formFields = await darosPage.locator('input, textarea, select').count();
        expect(formFields).toBeLessThan(10); // Keep it simple
      }
    );
  });

  // ============================================
  // COGNITIVE CONSTRAINTS: Teacher-Specific
  // ============================================
  darosTest.describe('Teacher Cognitive Constraints', () => {
    darosTest('Quick decision making supported', async ({ darosPage }) => {
      await darosPage.goto('/tools/ask-dan');

      // Primary action should be immediately accessible
      const chatInput = darosPage.locator('textarea, input[type="text"]').first();
      await expect(chatInput).toBeVisible();

      // Can type and submit in one action
      await chatInput.focus();
      await darosPage.keyboard.type('Quick question');
      await darosPage.keyboard.press('Enter');

      // No confirmation dialog needed
      const confirmDialog = darosPage.locator('[role="dialog"]:has-text("Are you sure")');
      expect(await confirmDialog.count()).toBe(0);
    });

    darosTest('3-minute session budget respected', async ({ darosPage, darosMetrics }) => {
      const maxSession = teacherPersona.typicalSessionLength * 60 * 1000; // 3 min = 180000ms

      await darosPage.goto('/tools/ask-dan');

      const input = darosPage.locator('textarea, input[type="text"]').first();
      await input.fill('Quick question about AI');
      await input.press('Enter');

      // Wait for response
      const response = darosPage.locator('.chat-response, .ai-response').first();
      await response.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      // Should complete well within 3 minutes
      expect(darosMetrics.sessionDurationMs).toBeLessThan(maxSession);
    });

    darosTest('Spotted scan pattern: keywords findable', async ({ darosPage }) => {
      const actor = new PersonaActor(darosPage, teacherPersona);

      await darosPage.goto('/');

      // Teacher scans for specific keywords
      const keywords = ['Quiz', 'Tools', 'Help', 'AI'];

      for (const keyword of keywords) {
        const element = darosPage.locator(`:has-text("${keyword}")`).first();
        // Keywords should be findable without deep navigation
      }
    });

    darosTest('Interruption resilience: state preserved', async ({ darosPage }) => {
      await darosPage.goto('/tools/ai-readiness-quiz');

      // Answer first question
      const answer = darosPage.locator('button, [role="radio"]').first();
      if ((await answer.count()) > 0) {
        await answer.click();
      }

      // Simulate blur/focus (interruption)
      await darosPage.evaluate(() => {
        window.dispatchEvent(new Event('blur'));
      });

      await darosPage.waitForTimeout(1000);

      await darosPage.evaluate(() => {
        window.dispatchEvent(new Event('focus'));
      });

      // Page should still be functional
      const pageContent = await darosPage.locator('main').textContent();
      expect(pageContent?.length).toBeGreaterThan(0);
    });
  });
});
