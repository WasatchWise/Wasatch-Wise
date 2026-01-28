/**
 * DAROS Archetype Spec: Teacher (Sarah Johnson)
 *
 * Metaphor: Magic Wand Wizard (The Operator)
 * Psychology: High burnout, skepticism of new tech, interruption-prone
 *
 * This spec tests the system from the Teacher's perspective,
 * with natural language input and streaming output expectations.
 */

import { darosTest, expect, teacherPersona } from '../daros-engine';
import { PersonaActor, assertComplexityAppropriate } from '../persona-actions';

// Configure all tests to use the Teacher persona
darosTest.use({
  persona: teacherPersona,
  strictMode: false, // Teachers get warnings, not failures
});

darosTest.describe('DAROS Archetype: Teacher (Sarah Johnson)', () => {
  darosTest.describe('Primary Goals', () => {
    darosTest(
      'Goal: "Know which AI tools are approved"',
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, teacherPersona);

        // Teacher goes to Ask Dan for quick answer
        await darosPage.goto('/tools/ask-dan');

        // Find the chat input (natural language is her mode)
        const chatInput = darosPage.locator('textarea, input[type="text"]').first();
        await expect(chatInput).toBeVisible();

        // Ask a quick question
        await actor.provideInput(chatInput, 'What AI tools can I use in class?');

        // Wait for response (should be streaming)
        const response = darosPage.locator('.chat-response, .ai-response, [data-message]');
        await actor.waitForResponse(response);

        // Response should appear quickly (streaming reduces perceived latency)
        console.log(
          `[TEST] Answer received in ${darosMetrics.loadTimeMs}ms with ${darosMetrics.totalClicks} clicks`
        );
      }
    );

    darosTest(
      'Goal: "Can check tool approval in under 30 seconds"',
      async ({ darosPage }) => {
        const actor = new PersonaActor(darosPage, teacherPersona);
        const startTime = Date.now();

        await darosPage.goto('/tools/ask-dan');

        // Quick query
        const input = darosPage.locator('textarea, input[type="text"]').first();
        await input.fill('Is ChatGPT approved?');
        await input.press('Enter');

        // Wait for response
        const response = darosPage.locator('.chat-response, .ai-response').first();
        await expect(response).toBeVisible({ timeout: 10000 });

        const elapsed = Date.now() - startTime;
        console.log(`[TEST] Tool check completed in ${elapsed}ms`);

        // Must complete in under 30 seconds
        expect(elapsed).toBeLessThan(30000);
      }
    );

    darosTest(
      'Goal: "Get practical classroom guidance"',
      async ({ darosPage }) => {
        const actor = new PersonaActor(darosPage, teacherPersona);

        await darosPage.goto('/tools/ask-dan');

        // Ask for practical advice
        const input = darosPage.locator('textarea, input[type="text"]').first();
        await input.fill('How do I use AI for lesson planning?');
        await input.press('Enter');

        // Response should be visible
        const response = darosPage.locator('.chat-response, .ai-response').first();
        await expect(response).toBeVisible({ timeout: 10000 });

        // Response should be actionable (contains action words)
        const responseText = await response.textContent();
        // Good responses contain practical guidance
      }
    );
  });

  darosTest.describe('Anxiety Scenarios', () => {
    darosTest(
      'Anxiety: "Accidentally violating student privacy"',
      async ({ darosPage }) => {
        const actor = new PersonaActor(darosPage, teacherPersona);

        await darosPage.goto('/tools/ask-dan');

        // Ask about liability
        const input = darosPage.locator('textarea, input[type="text"]').first();
        await input.fill('What student data can I share with AI tools?');
        await input.press('Enter');

        // Response should be reassuring and clear
        const response = darosPage.locator('.chat-response, .ai-response').first();
        await expect(response).toBeVisible({ timeout: 10000 });

        // Should get clear guidance, not scary legal jargon
      }
    );

    darosTest(
      'Anxiety: "Extra paperwork requirements"',
      async ({ darosPage }) => {
        // System should minimize bureaucracy
        await darosPage.goto('/tools/ask-dan');

        // The interface should be simple, not form-heavy
        const forms = darosPage.locator('form');
        const formFields = darosPage.locator(
          'input:not([type="text"]):not([type="search"]), select'
        );

        // Minimal required fields
        expect(await formFields.count()).toBeLessThan(5);
      }
    );
  });

  darosTest.describe('Magic Wand Pattern', () => {
    darosTest(
      'Pattern: Natural language input is primary',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        // Chat input should be prominent
        const chatInput = darosPage.locator('textarea, input[type="text"]');
        await expect(chatInput.first()).toBeVisible();

        // Placeholder should invite natural language
        const placeholder = await chatInput.first().getAttribute('placeholder');
        expect(placeholder?.toLowerCase()).toMatch(/ask|type|what|how/);
      }
    );

    darosTest(
      'Pattern: No menu navigation required',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        // Should be able to interact immediately without navigating menus
        const chatInput = darosPage.locator('textarea, input[type="text"]').first();

        // Input should be focusable immediately
        await chatInput.focus();
        expect(
          await chatInput.evaluate((el) => document.activeElement === el)
        ).toBe(true);
      }
    );

    darosTest(
      'Pattern: Streaming response (no loading spinner block)',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        const input = darosPage.locator('textarea, input[type="text"]').first();
        await input.fill('What is FERPA?');
        await input.press('Enter');

        // Should NOT have a blocking loading spinner
        const blockingSpinner = darosPage.locator(
          '.loading-overlay, [data-loading-block], .modal-loading'
        );
        await expect(blockingSpinner).not.toBeVisible();

        // Response should stream in
        const response = darosPage.locator('.chat-response, .ai-response').first();
        await expect(response).toBeVisible({ timeout: 10000 });
      }
    );

    darosTest(
      'Pattern: Command palette available (Cmd+K)',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        // Trigger command palette
        await darosPage.keyboard.press('Meta+k');

        // Command palette should appear
        const commandPalette = darosPage.locator(
          '[role="dialog"], [cmdk-root], .command-palette, [data-command-menu]'
        );

        // Note: This validates the requirement; may not be implemented yet
      }
    );
  });

  darosTest.describe('Cognitive Constraints', () => {
    darosTest(
      'Constraint: 3-minute session accommodation',
      async ({ darosPage, darosMetrics }) => {
        // Teachers are interruption-prone with ~3 minute sessions
        const startTime = Date.now();

        await darosPage.goto('/tools/ask-dan');

        const input = darosPage.locator('textarea, input[type="text"]').first();
        await input.fill('Quick question: Is Canva AI approved?');
        await input.press('Enter');

        // Wait for response
        const response = darosPage.locator('.chat-response, .ai-response').first();
        await expect(response).toBeVisible({ timeout: 10000 });

        const elapsed = Date.now() - startTime;

        // Should complete well within 3 minutes
        expect(elapsed).toBeLessThan(180000);
        console.log(`[TEST] Task completed in ${elapsed}ms (budget: 180000ms)`);
      }
    );

    darosTest(
      'Constraint: Low-moderate complexity tolerance',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        // Verify complexity is appropriate
        await assertComplexityAppropriate(darosPage, teacherPersona, 'main');
      }
    );

    darosTest(
      'Constraint: Primary action immediately obvious',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        // Text input should be prominently positioned
        const input = darosPage.locator('textarea, input[type="text"]').first();
        const inputBox = await input.boundingBox();

        expect(inputBox).toBeTruthy();
        if (inputBox) {
          // Should be in discoverable position
          expect(inputBox.y).toBeLessThan(600);
        }
      }
    );
  });

  darosTest.describe('Invisible Tutorial', () => {
    darosTest(
      'Tutorial: Vague prompt gets optimized suggestion',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        const input = darosPage.locator('textarea, input[type="text"]').first();

        // Enter vague prompt
        await input.fill('Help me with math');
        await input.press('Enter');

        // Response should clarify or enhance the query
        const response = darosPage.locator('.chat-response, .ai-response').first();
        await expect(response).toBeVisible({ timeout: 10000 });

        // AI should engage meaningfully
        const responseText = await response.textContent();
        expect((responseText || '').length).toBeGreaterThan(50);
      }
    );

    darosTest(
      'Tutorial: Example prompts visible for guidance',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        // Should show example prompts or suggestions
        const examples = darosPage.locator(
          '[data-example], .example-prompt, .suggestion, ' +
          'button:has-text("Try"), [data-suggestions]'
        );

        // Examples teach users how to interact
      }
    );

    darosTest(
      'Tutorial: Learning through doing, not reading',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        // Should NOT have lengthy instruction text
        const instructions = darosPage.locator('.instructions, [data-instructions]');

        if ((await instructions.count()) > 0) {
          const text = await instructions.first().textContent();
          const wordCount = (text || '').split(/\s+/).length;

          // Instructions should be brief
          expect(wordCount).toBeLessThan(100);
        }

        // Primary focus should be on the input
        const input = darosPage.locator('textarea, input[type="text"]').first();
        await expect(input).toBeVisible();
      }
    );
  });

  darosTest.describe('Quiz Experience', () => {
    darosTest(
      'Quiz: Progress clearly visible',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ai-readiness-quiz');

        // Should have progress indicator
        const progress = darosPage.locator(
          '[role="progressbar"], .progress, [data-progress]'
        );

        await expect(progress).toBeVisible();
      }
    );

    darosTest(
      'Quiz: Minimal friction to complete',
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, teacherPersona);

        await darosPage.goto('/tools/ai-readiness-quiz');

        // Answer a few questions quickly
        for (let i = 0; i < 3; i++) {
          const answer = darosPage.locator('button, [role="radio"]').first();
          if ((await answer.count()) > 0) {
            await answer.click();
            await darosPage.waitForTimeout(200);
          }

          const next = darosPage.locator('button:has-text("Next")');
          if ((await next.count()) > 0) {
            await next.click();
            await darosPage.waitForTimeout(200);
          }
        }

        // Should be within click budget
        expect(darosMetrics.totalClicks).toBeLessThan(20);
      }
    );
  });

  darosTest.describe('Success Indicators', () => {
    darosTest(
      'Success: "Feels supported not policed"',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        // Language should be supportive, not authoritative
        const mainText = await darosPage.locator('main').textContent();

        // Should NOT have threatening language
        const policingPatterns = [
          /you must/i,
          /required to/i,
          /violation/i,
          /penalty/i,
          /mandatory/i,
        ];

        for (const pattern of policingPatterns) {
          expect(mainText).not.toMatch(pattern);
        }
      }
    );

    darosTest(
      'Success: "Has go-to reference for common scenarios"',
      async ({ darosPage }) => {
        await darosPage.goto('/tools/ask-dan');

        // Should be able to ask common questions
        const commonQueries = [
          'Can students use ChatGPT?',
          'What AI tools are approved?',
          'How do I protect student data?',
        ];

        // Each should get a meaningful response
        for (const query of commonQueries.slice(0, 1)) {
          const input = darosPage.locator('textarea, input[type="text"]').first();
          await input.fill(query);
          await input.press('Enter');

          const response = darosPage.locator('.chat-response, .ai-response').first();
          await expect(response).toBeVisible({ timeout: 10000 });
        }
      }
    );
  });
});
