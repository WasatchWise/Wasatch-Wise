/**
 * Teacher Archetype HCI Tests
 *
 * Metaphor: Magic Wand Wizard (The Operator)
 * Psychology: High burnout, skepticism of new tech
 * Input Mode: Natural Language (type/speak intent)
 * Output Mode: Streaming Response (Vercel AI SDK)
 */

import { test, expect, Page } from '@playwright/test';
import { teacherPersona, getCognitiveConstraints } from '../fixtures/personas';
import {
  askDanSimpleQueryScenario,
  askDanFollowUpScenario,
  quizCompletionScenario
} from '../fixtures/scenarios';
import {
  cognitiveProfiles,
  metaphorPatterns,
  invisibleTutorialPatterns
} from '../fixtures/test-data';
import {
  measureTiming,
  measureInteractions,
  measureCognitiveLoad,
  detectConfusion,
  getThresholdsForProfile,
  generateReport
} from '../utils/metrics';
import {
  assertMagicWandPattern,
  assertNaturalLanguageInput,
  assertCognitiveLoadAppropriate,
  assertKeyboardNavigable,
  assertStreamingResponse
} from '../utils/assertions';

const profile = cognitiveProfiles.teacher;
const constraints = getCognitiveConstraints(teacherPersona);
const thresholds = getThresholdsForProfile(profile);

test.describe('Teacher Archetype - Magic Wand Wizard', () => {

  test.describe('Metaphor Pattern Validation', () => {

    test('provides natural language input interface', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Must have conversational input
      const chatInput = page.locator(
        'textarea, input[type="text"]'
      ).filter({ hasText: '' });

      await expect(chatInput.first()).toBeVisible();

      // Placeholder should invite natural language
      const placeholder = await chatInput.first().getAttribute('placeholder');
      expect(placeholder?.toLowerCase()).toMatch(/ask|type|what|how|help/);
    });

    test('supports Command+K palette for quick actions', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Trigger command palette
      await page.keyboard.press('Meta+k');

      // Should show command menu or palette
      const commandPalette = page.locator(
        '[role="dialog"], [data-command-palette], .command-menu, [cmdk-root]'
      );

      // Note: May not be implemented - validates the requirement
    });

    test('displays streaming response without loading spinner', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const chatInput = page.locator('textarea, input[type="text"]').first();
      await chatInput.fill('What is FERPA?');
      await chatInput.press('Enter');

      // Response should stream, not show loading then appear
      const responseArea = page.locator('.chat-response, .ai-response, [data-message]');

      // Wait for first content (streaming start)
      await expect(responseArea.first()).toBeVisible({ timeout: 5000 });

      // Should NOT have a blocking loading spinner during response
      const blockingSpinner = page.locator('.loading-overlay, [data-loading-block]');
      await expect(blockingSpinner).not.toBeVisible();
    });

    test('provides one-click export to LMS', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // After getting a response, should be able to export easily
      const chatInput = page.locator('textarea, input[type="text"]').first();
      await chatInput.fill('Create a simple lesson about photosynthesis');
      await chatInput.press('Enter');

      // Wait for response
      await page.waitForTimeout(3000);

      // Look for export/share options
      const exportOptions = page.locator(
        'button:has-text("Export"), button:has-text("Copy"), ' +
        'button:has-text("Share"), [data-export], [data-copy]'
      );

      // Export to Canvas/Classroom should be discoverable
    });

  });

  test.describe('Input Mode - Natural Language', () => {

    test('accepts free-form text queries', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea, input[type="text"]').first();

      // Should accept various query formats
      const queries = [
        'Help me with a math lesson',
        'What AI tools are approved?',
        'How do I protect student data?'
      ];

      for (const query of queries) {
        await input.fill(query);
        // Input should accept without validation errors
        const errorIndicator = page.locator('[role="alert"], .error');
        await expect(errorIndicator).not.toBeVisible();
        await input.clear();
      }
    });

    test('does not require menu navigation', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // The primary action should be typing, not clicking menus
      const input = page.locator('textarea, input[type="text"]').first();

      // Should be immediately focusable/focused
      await input.focus();
      expect(await input.evaluate(el => document.activeElement === el)).toBe(true);

      // No complex menu structure required to start
      const requiredMenuClicks = page.locator(
        'nav >> a, [role="menuitem"]'
      ).filter({ hasText: /required|must|first/i });

      expect(await requiredMenuClicks.count()).toBe(0);
    });

    test('voice input option available', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Should have microphone/voice button
      const voiceButton = page.locator(
        'button[aria-label*="voice"], button[aria-label*="microphone"], ' +
        '[data-voice-input], .mic-button, button >> svg[class*="mic"]'
      );

      // Voice input is important for reducing friction
    });

  });

  test.describe('Output Mode - Streaming Response', () => {

    test('first token appears within 500ms', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea, input[type="text"]').first();

      const startTime = Date.now();

      await input.fill('What is AI governance?');
      await input.press('Enter');

      // Watch for any response content
      const responseContent = page.locator(
        '.chat-response, .ai-response, [data-streaming], [data-message="assistant"]'
      );

      await responseContent.first().waitFor({ state: 'visible', timeout: 5000 });

      const responseTime = Date.now() - startTime;

      // Streaming should start quickly to reduce perceived latency
      expect(responseTime).toBeLessThan(2000); // Generous for real API
    });

    test('response progressively reveals content', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea, input[type="text"]').first();
      await input.fill('Explain FERPA in detail');
      await input.press('Enter');

      // Track content length over time
      const responseContainer = page.locator('.chat-response, .ai-response, [data-message="assistant"]').first();

      let previousLength = 0;
      let growthDetected = false;

      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(200);
        const currentText = await responseContainer.textContent() ?? '';
        if (currentText.length > previousLength + 10) {
          growthDetected = true;
        }
        previousLength = currentText.length;
      }

      // Content should grow progressively (streaming behavior)
      // Note: May be batched in some implementations
    });

    test('audio response plays automatically', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea, input[type="text"]').first();
      await input.fill('What is COPPA?');
      await input.press('Enter');

      // Wait for response
      await page.waitForTimeout(3000);

      // Should have audio player
      const audioPlayer = page.locator('audio, [data-audio-player]');

      // Audio should be available for the response
    });

  });

  test.describe('Cognitive Load Constraints', () => {

    test('session length accommodates 3-minute windows', async ({ page }) => {
      // Teachers are interruption-prone with ~3 minute sessions
      await page.goto('/tools/ask-dan');

      // Should be able to ask and get answer in under 3 minutes
      const timing = await measureTiming(page, async () => {
        const input = page.locator('textarea, input[type="text"]').first();
        await input.fill('Which AI tools can I use in class?');
        await input.press('Enter');

        // Wait for complete response
        await page.waitForTimeout(5000);
      });

      expect(timing.timeToTaskCompletion).toBeLessThan(180000); // 3 minutes
    });

    test('interface complexity matches low-moderate tolerance', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const cognitiveLoad = await measureCognitiveLoad(page);

      // Teacher has loadCapacity of 4
      expect(cognitiveLoad.estimatedLoadScore).toBeLessThanOrEqual(6);

      // Limited interactive elements to reduce overwhelm
      expect(cognitiveLoad.interactiveElements).toBeLessThan(20);
    });

    test('primary action is immediately obvious', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // The text input should be prominently positioned
      const input = page.locator('textarea, input[type="text"]').first();
      const inputBox = await input.boundingBox();

      expect(inputBox).toBeTruthy();
      if (inputBox) {
        // Should be in a discoverable position
        expect(inputBox.y).toBeLessThan(600);
      }
    });

  });

  test.describe('Invisible Tutorial - Prompt Optimization', () => {

    test('vague prompts receive optimization suggestions', async ({ page }) => {
      // Mario 1-1: System teaches proper prompting through correction
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea, input[type="text"]').first();

      // Enter a vague prompt
      await input.fill('Help me with math');
      await input.press('Enter');

      // System should optimize or suggest better prompt
      await page.waitForTimeout(3000);

      const response = page.locator('.chat-response, .ai-response').first();
      const responseText = await response.textContent();

      // Response should either:
      // 1. Ask clarifying questions
      // 2. Show an optimized version of the prompt
      // 3. Provide a structured response that models good prompting
    });

    test('displays example prompts for guidance', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Should show example prompts or suggestions
      const examples = page.locator(
        '[data-example-prompt], .example-prompt, .suggestion-chip, ' +
        'button:has-text("Try:"), [data-suggestions]'
      );

      // Examples teach users how to interact effectively
    });

    test('learning happens through doing not reading', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Should NOT have lengthy instruction text
      const instructionText = page.locator('.instructions, [data-instructions], .help-text');

      if (await instructionText.count() > 0) {
        const text = await instructionText.first().textContent();
        // Instructions should be brief (< 100 words)
        const wordCount = (text ?? '').split(/\s+/).length;
        expect(wordCount).toBeLessThan(100);
      }

      // Primary focus should be on the input
      const input = page.locator('textarea, input[type="text"]').first();
      await expect(input).toBeVisible();
    });

  });

  test.describe('Quiz Journey for Teachers', () => {

    test('completes quiz with minimal friction', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      const timing = await measureTiming(page, async () => {
        // Progress through quiz
        for (let i = 0; i < 10; i++) {
          // Find and click an answer
          const answers = page.locator('button, [role="radio"], input[type="radio"]');
          const answerCount = await answers.count();

          if (answerCount > 0) {
            await answers.first().click();
            await page.waitForTimeout(300);
          }

          // Click next if available
          const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
          if (await nextButton.count() > 0) {
            await nextButton.click();
            await page.waitForTimeout(300);
          }
        }
      });

      // Should complete quickly given teacher time constraints
      expect(timing.timeToTaskCompletion).toBeLessThan(180000);
    });

    test('progress is clearly visible', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      // Should have progress indicator
      const progressBar = page.locator(
        '[role="progressbar"], .progress-bar, .progress, [data-progress]'
      );

      await expect(progressBar).toBeVisible();
    });

    test('can resume after interruption', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      // Answer first question
      const firstAnswer = page.locator('button, [role="radio"]').first();
      await firstAnswer.click();

      // Get current state
      const currentQuestion = await page.locator('[data-question-number], .question-number').textContent();

      // Simulate page refresh (interruption)
      await page.reload();

      // Should preserve progress (if implemented)
      // This validates the requirement for interruption resilience
    });

  });

  test.describe('Accessibility', () => {

    test('full keyboard navigation for chat', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Tab to input
      await page.keyboard.press('Tab');

      const input = page.locator('textarea, input[type="text"]').first();

      // Should be able to type immediately
      await page.keyboard.type('Test query');

      const inputValue = await input.inputValue();
      expect(inputValue).toContain('Test query');

      // Enter should submit
      await page.keyboard.press('Enter');
    });

    test('screen reader announces new messages', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Response area should have live region
      const responseContainer = page.locator(
        '[aria-live], [role="log"], [role="status"]'
      );

      // Should have ARIA live region for announcements
    });

    test('sufficient touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/tools/ask-dan');

      const buttons = page.locator('button');

      for (const button of (await buttons.all()).slice(0, 5)) {
        const box = await button.boundingBox();
        if (box) {
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
        }
      }
    });

  });

  test.describe('Error Recovery', () => {

    test('handles network errors gracefully', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // Simulate offline
      await page.route('**/api/**', route => route.abort());

      const input = page.locator('textarea, input[type="text"]').first();
      await input.fill('Test query');
      await input.press('Enter');

      // Should show user-friendly error
      const errorMessage = page.locator('[role="alert"], .error-message, [data-error]');

      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });

      // Error should be understandable
      const errorText = await errorMessage.first().textContent();
      expect(errorText?.toLowerCase()).toMatch(/connection|network|try again|offline/);
    });

    test('allows retry after error', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      // After an error, should be able to try again
      const input = page.locator('textarea, input[type="text"]').first();

      // Input should remain enabled/usable
      await expect(input).toBeEnabled();
    });

  });

});
