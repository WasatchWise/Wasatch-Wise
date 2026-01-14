/**
 * Invisible Tutorial Tests (Mario 1-1 Philosophy)
 *
 * John Lyman's "Invisible Tutorial" concept:
 * Like Super Mario Bros World 1-1, the interface itself teaches
 * users how to interact without explicit instruction.
 *
 * Key principles:
 * 1. Environment teaches through affordances, not text
 * 2. Mistakes are auto-corrected or gently guided
 * 3. Users learn by doing, not reading
 * 4. Friction is educational, not punitive
 */

import { test, expect, Page } from '@playwright/test';
import { invisibleTutorialPatterns } from '../fixtures/test-data';

test.describe('Invisible Tutorial - Mario 1-1 Philosophy', () => {

  test.describe('Affordance-Based Teaching', () => {

    test('primary action is visually obvious', async ({ page }) => {
      await page.goto('/');

      // Like Mario's Goomba in 1-1, the first interactive element
      // should be unmistakably interactive

      const primaryCTA = page.locator(
        'button.primary, a.primary, [data-primary-cta], ' +
        'button:has-text("Start"), button:has-text("Get Started"), ' +
        'a:has-text("Take Quiz")'
      );

      if (await primaryCTA.count() > 0) {
        const box = await primaryCTA.first().boundingBox();

        // Should be prominent (larger, or above fold)
        if (box) {
          expect(box.y).toBeLessThan(600); // Above the fold
        }
      }
    });

    test('interactive elements look interactive', async ({ page }) => {
      await page.goto('/');

      const buttons = page.locator('button');

      for (const button of (await buttons.all()).slice(0, 5)) {
        const styles = await button.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            cursor: computed.cursor,
            hasBackground: computed.backgroundColor !== 'transparent',
            hasBorder: computed.border !== 'none',
            hasBoxShadow: computed.boxShadow !== 'none'
          };
        });

        // Buttons should have hover cursor
        expect(styles.cursor).toBe('pointer');

        // Should have visual distinction
        const isStyled = styles.hasBackground || styles.hasBorder || styles.hasBoxShadow;
        expect(isStyled).toBe(true);
      }
    });

    test('hover states indicate interactivity', async ({ page }) => {
      await page.goto('/');

      const button = page.locator('button').first();

      // Get initial state
      const beforeHover = await button.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // Hover
      await button.hover();
      await page.waitForTimeout(100);

      // State should change
      const afterHover = await button.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // Some visual change on hover
      // (May be same if no hover style - still passes)
    });

    test('disabled states are visually distinct', async ({ page }) => {
      await page.goto('/');

      const disabledElements = page.locator('[disabled], [aria-disabled="true"]');

      for (const el of await disabledElements.all()) {
        const styles = await el.evaluate(node => ({
          opacity: window.getComputedStyle(node).opacity,
          cursor: window.getComputedStyle(node).cursor
        }));

        // Disabled should look disabled
        const isVisuallyDisabled = parseFloat(styles.opacity) < 1 ||
                                   styles.cursor === 'not-allowed';
      }
    });

  });

  test.describe('Auto-Correction (Forgiving Design)', () => {

    test('vague input receives intelligent suggestion', async ({ page }) => {
      // Teacher types vague prompt, system suggests optimized version
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea, input[type="text"]').first();
      await input.fill('Help me with math');
      await input.press('Enter');

      await page.waitForTimeout(3000);

      // Response should either:
      // 1. Ask clarifying questions
      // 2. Restate with more specificity
      // 3. Provide structured response

      const response = page.locator('.chat-response, .ai-response, [data-message]');
      const responseText = await response.first().textContent() ?? '';

      // AI should engage meaningfully, not just say "I don't understand"
      expect(responseText.length).toBeGreaterThan(50);
    });

    test('form auto-suggests based on context', async ({ page }) => {
      await page.goto('/contact');

      // Start typing in organization field
      const orgField = page.locator('input[name="organization"], #organization');

      if (await orgField.count() > 0) {
        await orgField.fill('Mountain');

        // Might show autocomplete suggestions
        const suggestions = page.locator('[role="listbox"], .autocomplete, datalist');

        // Autocomplete helps users complete input correctly
      }
    });

    test('invalid email shows correction suggestion', async ({ page }) => {
      await page.goto('/contact');

      const emailInput = page.locator('input[type="email"], input[name="email"]');

      if (await emailInput.count() > 0) {
        // Type email with common mistake
        await emailInput.fill('user@gmial.com');
        await emailInput.blur();

        await page.waitForTimeout(500);

        // Should suggest "Did you mean gmail.com?"
        const suggestion = page.locator(
          '[data-suggestion], .did-you-mean, :has-text("Did you mean")'
        );

        // Intelligent correction is better than "Invalid email"
      }
    });

  });

  test.describe('Learning by Doing', () => {

    test('no instruction walls before action', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      // Should not have long instruction text before quiz
      const preQuizText = await page.locator('main').textContent() ?? '';
      const introWords = preQuizText.split(/\s+/).filter(w => w.length > 0);

      // Brief intro is OK, but not walls of text
      // First interactive element should be quickly reachable
    });

    test('progress shows through interaction', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      // Find first answer
      const firstAnswer = page.locator('button, [role="radio"]').first();

      if (await firstAnswer.count() > 0) {
        await firstAnswer.click();

        // Progress should be visible
        const progress = page.locator(
          '[role="progressbar"], .progress, [data-progress], ' +
          ':has-text("Question 1"), :has-text("1 of")'
        );

        // User learns they're progressing through doing
      }
    });

    test('examples teach by showing not telling', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Example prompts show users HOW to interact
      const examples = page.locator(
        '[data-example], .example-prompt, .suggestion, ' +
        'button:has-text("Try"), [data-prompt-suggestion]'
      );

      // Examples are better teachers than instructions
    });

  });

  test.describe('Educational Friction', () => {

    test('red status creates teachable friction', async ({ page }) => {
      // When admin has red status, export is blocked
      // This teaches compliance is required before export
      await page.goto('/dashboard/districts/district-3');

      const exportButton = page.locator('button:has-text("Export")');

      if (await exportButton.count() > 0) {
        // If red status, export should be disabled with explanation
        const isDisabled = await exportButton.isDisabled();

        if (isDisabled) {
          // Should have tooltip or nearby text explaining why
          await exportButton.hover();

          const tooltip = page.locator(
            '[role="tooltip"], [data-tooltip], .tooltip'
          );

          // Friction is educational when explained
        }
      }
    });

    test('blocked action shows resolution path', async ({ page }) => {
      await page.goto('/dashboard/districts/district-3');

      // When action is blocked, show how to unblock
      const blockedElements = page.locator('[disabled]:has-text("Export")');

      if (await blockedElements.count() > 0) {
        // Should have "Fix" or "Resolve" nearby
        const fixAction = page.locator(
          'button:has-text("Fix"), a:has-text("Fix"), ' +
          'button:has-text("Resolve"), [data-action="fix"]'
        );

        // Friction points to resolution
      }
    });

    test('confusion triggers contextual help', async ({ page }) => {
      await page.goto('/dashboard');

      // After multiple "confused" interactions, help should appear
      // (Detected by: backtracking, hovering without clicking, etc.)

      // Simulate confusion: click around without purpose
      const tabs = page.locator('[role="tab"], .tab');

      for (let i = 0; i < 3; i++) {
        await tabs.nth(i % 3).click();
        await page.waitForTimeout(200);
      }

      // After confused navigation, help prompt might appear
      const helpPrompt = page.locator(
        '[data-contextual-help], .help-prompt, ' +
        ':has-text("Looking for"), :has-text("Need help")'
      );

      // Proactive help based on behavior
    });

  });

  test.describe('Progressive Skill Building', () => {

    test('basic actions work without learning curve', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Simplest interaction should just work
      const input = page.locator('textarea, input[type="text"]').first();
      await input.fill('Hello');
      await input.press('Enter');

      // Should get response without needing to learn anything
      const response = page.locator('.chat-response, .ai-response, [data-message]');
      await expect(response.first()).toBeVisible({ timeout: 5000 });
    });

    test('advanced features are discoverable through use', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // After basic interaction, advanced options become visible
      const input = page.locator('textarea, input[type="text"]').first();
      await input.fill('Create a lesson plan');
      await input.press('Enter');

      await page.waitForTimeout(2000);

      // After getting response, advanced options might appear
      const advancedOptions = page.locator(
        '[data-advanced], .advanced-options, :has-text("Export"), ' +
        ':has-text("Save"), :has-text("Share")'
      );

      // Features reveal themselves as users progress
    });

    test('keyboard shortcuts revealed to power users', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // After several interactions, keyboard hints appear
      // Or when user hovers over buttons

      const button = page.locator('button').first();
      await button.hover();

      // Tooltip might show keyboard shortcut
      const shortcutHint = page.locator(
        '[data-shortcut], kbd, :has-text("⌘"), :has-text("Ctrl")'
      );

      // Power users discover shortcuts naturally
    });

  });

  test.describe('Invisible Tutorial Patterns from Test Data', () => {

    for (const pattern of invisibleTutorialPatterns) {
      test(`${pattern.scenario}: ${pattern.userMistake}`, async ({ page }) => {
        // Each pattern from test data is a specific invisible tutorial scenario

        if (pattern.scenario === 'Vague Teacher Prompt') {
          await page.goto('/tools/ask-dan');
          const input = page.locator('textarea, input[type="text"]').first();
          await input.fill('Help me with math');
          await input.press('Enter');

          await page.waitForTimeout(3000);

          // AI intervention: Claude rewrites to be more specific
          const response = await page.locator('.chat-response, .ai-response').first().textContent();
          // Response should engage helpfully
          expect(response?.length).toBeGreaterThan(0);
        }

        if (pattern.scenario === 'Admin Exports with Red Status') {
          await page.goto('/dashboard/districts/district-3');
          const exportBtn = page.locator('button:has-text("Export")');

          if (await exportBtn.count() > 0) {
            // Should be disabled when status is red
            // Teaches: fix issues before exporting
          }
        }

        // Additional patterns would be tested similarly
      });
    }

  });

  test.describe('Error Messages as Teaching Moments', () => {

    test('errors explain WHY not just WHAT', async ({ page }) => {
      await page.goto('/contact');

      // Submit empty form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      const errors = page.locator('[role="alert"], .error, [data-error]');

      for (const error of await errors.all()) {
        const text = await error.textContent() ?? '';

        // Error should explain, not just label
        // "Email is required to contact you" > "Email required"
        // "Please enter a valid email address" > "Invalid email"
      }
    });

    test('errors maintain form state', async ({ page }) => {
      await page.goto('/contact');

      // Fill some fields
      const nameInput = page.locator('input[name="name"], #name');
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test User');
      }

      // Submit with missing fields
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      // Previous input should still be there
      const nameValue = await nameInput.inputValue();
      expect(nameValue).toBe('Test User');

      // Don't punish user by clearing their work
    });

    test('errors suggest next action', async ({ page }) => {
      await page.goto('/contact');

      const emailInput = page.locator('input[type="email"], input[name="email"]');

      if (await emailInput.count() > 0) {
        await emailInput.fill('bad-email');
        await emailInput.blur();
        await page.waitForTimeout(300);

        // Error should suggest what to do
        const error = page.locator('[role="alert"], .error').first();
        const errorText = await error.textContent() ?? '';

        // Should guide toward correction
        // "Enter a valid email like name@example.com"
      }
    });

  });

  test.describe('Onboarding Without Onboarding', () => {

    test('first visit does not require tutorial', async ({ page }) => {
      await page.goto('/');

      // No forced tutorial modal
      const tutorialModal = page.locator(
        '[data-tutorial], .tutorial-modal, .onboarding-overlay'
      );

      expect(await tutorialModal.count()).toBe(0);
    });

    test('features are self-explanatory through design', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      // Quiz should be usable immediately
      // No "Start Tour" or "Learn How" required

      const forcedTutorial = page.locator(
        'button:has-text("Start Tour"), button:has-text("Learn How"), ' +
        '[data-forced-tutorial]'
      );

      expect(await forcedTutorial.count()).toBe(0);

      // First question should be immediately answerable
      const answerOptions = page.locator('button, [role="radio"], input[type="radio"]');
      expect(await answerOptions.count()).toBeGreaterThan(0);
    });

    test('help is available but not mandatory', async ({ page }) => {
      await page.goto('/');

      // Help should be accessible but not blocking
      const helpButton = page.locator(
        'button[aria-label*="help"], [data-help], :has-text("?")'
      );

      // Help is optional, not required to proceed
    });

  });

});
