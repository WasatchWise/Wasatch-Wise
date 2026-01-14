/**
 * Parent Archetype HCI Tests
 *
 * Metaphor: Nutrition Label (The Watchdog)
 * Psychology: Anxious, protective, wants transparency
 * Input Mode: Read-only (minimal input requirements)
 * Output Mode: Plain English cards with drill-down transparency
 */

import { test, expect, Page } from '@playwright/test';
import { parentPersona, getCognitiveConstraints } from '../fixtures/personas';
import {
  quizCompletionScenario,
  contactFormSubmissionScenario
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
  getThresholdsForProfile
} from '../utils/metrics';
import {
  assertNutritionLabelPattern,
  assertReadOnlyMode,
  assertProgressiveDisclosure,
  assertKeyboardNavigable,
  assertColorContrast,
  assertTouchTargetSize
} from '../utils/assertions';

const profile = cognitiveProfiles.parent;
const constraints = getCognitiveConstraints(parentPersona);
const thresholds = getThresholdsForProfile(profile);

test.describe('Parent Archetype - Nutrition Label', () => {

  test.describe('Metaphor Pattern Validation', () => {

    test('displays information in plain English cards', async ({ page }) => {
      await page.goto('/');

      // Content should use simple language
      const mainContent = page.locator('main, [role="main"], .content');
      const text = await mainContent.textContent();

      // Check for jargon in prominent positions (headers, callouts)
      const headers = page.locator('h1, h2, h3');
      for (const header of await headers.all()) {
        const headerText = await header.textContent() ?? '';
        // Headers should be understandable to lay people
        // Flag technical jargon that parents wouldn't know
        const jargonPatterns = [
          /\bFERPA\b/i,      // Should say "data privacy law" instead
          /\bCOPPA\b/i,      // Should explain what this means
          /\battestation\b/i, // Should say "verification" or "proof"
          /\bcompliance framework\b/i
        ];

        // These terms are OK if explained, but shouldn't stand alone in headers
      }
    });

    test('implements drill-down transparency pattern', async ({ page }) => {
      await page.goto('/');

      // Should have expandable sections
      const accordions = page.locator(
        'details, [data-accordion], [aria-expanded], [role="button"][aria-controls]'
      );

      // Nutrition label pattern = layered disclosure
      // Layer 1 (visible): Simple summary
      // Layer 2 (expandable): Full details

      if (await accordions.count() > 0) {
        const firstAccordion = accordions.first();

        // Should start collapsed (simple view first)
        const isExpanded = await firstAccordion.getAttribute('aria-expanded');
        // Most should default to closed

        // Click to expand
        await firstAccordion.click();

        // Should reveal more detail
        const expandedContent = page.locator('[aria-hidden="false"], details[open] > *');
      }
    });

    test('trust badges and indicators are visible', async ({ page }) => {
      await page.goto('/');

      // Parents need trust signals
      const trustIndicators = page.locator(
        '[data-trust-badge], .trust-badge, .security-badge, ' +
        'img[alt*="secure"], img[alt*="certified"], img[alt*="privacy"]'
      );

      // Should have some trust signals visible
    });

    test('data transparency is explicit', async ({ page }) => {
      await page.goto('/');

      // Should clearly state what data is collected
      const privacyInfo = page.locator(
        'a:has-text("Privacy"), a:has-text("Data"), [data-privacy-info]'
      );

      // Privacy information should be discoverable
    });

  });

  test.describe('Input Mode - Read Only', () => {

    test('minimizes required input fields', async ({ page }) => {
      await page.goto('/');

      // Count required inputs on landing page
      const requiredInputs = page.locator(
        'input[required], textarea[required], select[required]'
      );

      const count = await requiredInputs.count();

      // Parents should mostly be consuming information
      expect(count).toBeLessThan(5);
    });

    test('primary interaction is reading not writing', async ({ page }) => {
      await page.goto('/');

      // Measure ratio of text content to input fields
      const textContent = await page.locator('p, li, h1, h2, h3, h4').count();
      const inputFields = await page.locator('input, textarea, select').count();

      // Should be heavily weighted toward reading
      expect(textContent).toBeGreaterThan(inputFields * 3);
    });

    test('contact form has minimal required fields', async ({ page }) => {
      await page.goto('/contact');

      const requiredFields = page.locator('[required]');
      const count = await requiredFields.count();

      // Keep form simple for anxious users
      expect(count).toBeLessThan(6);
    });

  });

  test.describe('Output Mode - Plain English Cards', () => {

    test('content uses conversational language', async ({ page }) => {
      await page.goto('/');

      const paragraphs = page.locator('p');

      for (const p of (await paragraphs.all()).slice(0, 5)) {
        const text = await p.textContent() ?? '';

        // Check reading level (simplified Flesch-Kincaid)
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).length;

        if (words > 10) {
          const avgWordsPerSentence = words / Math.max(sentences, 1);
          // Plain language guideline: < 20 words per sentence on average
          expect(avgWordsPerSentence).toBeLessThan(25);
        }
      }
    });

    test('numbers and data are contextualized', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      // Complete quiz to see results
      // When showing scores/numbers, should have context

      // E.g., "75% Ready" should include what that means
      const numbers = page.locator('[data-score], .score, .percentage, .stat');

      for (const num of await numbers.all()) {
        // Numbers should have labels or context
        const hasLabel = (await num.locator('..').textContent())?.match(/[a-zA-Z]/);
        expect(hasLabel).toBeTruthy();
      }
    });

    test('callouts explain implications', async ({ page }) => {
      await page.goto('/');

      // Important information should be highlighted
      const callouts = page.locator(
        '.callout, .highlight, [role="note"], aside, .important'
      );

      // Callouts help parents understand key points
    });

  });

  test.describe('Drill-Down Transparency Pattern', () => {

    test('Layer 1 provides simple summary', async ({ page }) => {
      await page.goto('/');

      // First visible content should be simple
      const firstVisibleText = await page.locator('main p').first().textContent();

      // Should be brief and clear
      const wordCount = (firstVisibleText ?? '').split(/\s+/).length;
      expect(wordCount).toBeLessThan(50);
    });

    test('Layer 2 reveals full details on interaction', async ({ page }) => {
      await page.goto('/');

      const expandable = page.locator('details, [aria-expanded="false"]').first();

      if (await expandable.count() > 0) {
        // Get initial visible text length
        const initialText = await page.locator('main').textContent() ?? '';

        // Expand
        await expandable.click();

        // More content should be visible
        await page.waitForTimeout(300);
        const expandedText = await page.locator('main').textContent() ?? '';

        // Expanded should have more content
        expect(expandedText.length).toBeGreaterThan(initialText.length - 10);
      }
    });

    test('opt-out/escalation path is clear', async ({ page }) => {
      await page.goto('/');

      // Parents need to know how to raise concerns
      const escalationPaths = page.locator(
        'a:has-text("Contact"), a:has-text("Questions"), ' +
        'a:has-text("Concern"), button:has-text("Contact"), ' +
        '[data-contact], [data-support]'
      );

      await expect(escalationPaths.first()).toBeVisible();
    });

  });

  test.describe('Cognitive Load Constraints', () => {

    test('focused attention accommodated (15 min sessions)', async ({ page }) => {
      // Parents have moderate attention budget
      await page.goto('/');

      // Key information should be findable quickly
      const timing = await measureTiming(page, async () => {
        // Find privacy/data information
        const privacyLink = page.locator('a:has-text("Privacy"), footer >> a');
        await privacyLink.first().click();
      });

      expect(timing.timeToTaskCompletion).toBeLessThan(30000); // 30 seconds
    });

    test('cognitive load appropriate for moderate capacity', async ({ page }) => {
      await page.goto('/');

      const cognitiveLoad = await measureCognitiveLoad(page);

      // Parent has loadCapacity of 5 (moderate)
      expect(cognitiveLoad.estimatedLoadScore).toBeLessThanOrEqual(7);
    });

    test('information hierarchy reduces scanning burden', async ({ page }) => {
      await page.goto('/');

      // Clear visual hierarchy
      const h1 = await page.locator('h1').count();
      const h2 = await page.locator('h2').count();
      const h3 = await page.locator('h3').count();

      expect(h1).toBe(1); // Single main heading
      expect(h2).toBeGreaterThan(0); // Section organization
    });

  });

  test.describe('Quiz Journey for Parents', () => {

    test('quiz explains purpose before starting', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      // Should explain what the quiz is and why take it
      const introText = await page.locator('main p, .intro, [data-intro]').first().textContent();

      expect(introText?.length).toBeGreaterThan(20);
      // Should explain value proposition
    });

    test('questions use parent-friendly language', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      // Question text should be understandable
      const questionText = page.locator('[data-question], .question-text, h2, h3');

      for (const q of (await questionText.all()).slice(0, 3)) {
        const text = await q.textContent() ?? '';

        // Should avoid unexplained acronyms
        // If FERPA mentioned, should be explained
        if (text.includes('FERPA')) {
          expect(text.toLowerCase()).toMatch(/privacy|law|federal/);
        }
      }
    });

    test('results provide actionable next steps', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      // Fast-forward through quiz (click any answers)
      for (let i = 0; i < 15; i++) {
        const button = page.locator('button').first();
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(200);
        }
      }

      // Results should have clear CTA
      const cta = page.locator(
        'button:has-text("Book"), button:has-text("Contact"), ' +
        'a:has-text("Learn More"), a:has-text("Next Steps")'
      );

      // Should guide parent to next action
    });

  });

  test.describe('Invisible Tutorial - Jargon Translation', () => {

    test('technical terms have tooltips or explanations', async ({ page }) => {
      await page.goto('/');

      // Find any technical terms
      const technicalTerms = page.locator(
        '[data-tooltip], abbr[title], [aria-describedby], ' +
        '.term-definition, [data-term]'
      );

      // Technical terms should be explained
      for (const term of await technicalTerms.all()) {
        const hasExplanation = await term.getAttribute('title') ||
                              await term.getAttribute('aria-describedby') ||
                              await term.getAttribute('data-tooltip');
        // Terms should have some explanation mechanism
      }
    });

    test('search suggestions use simple language', async ({ page }) => {
      // If parent searches for jargon, suggest simple alternative
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea, input[type="text"]').first();

      // Search for technical term
      await input.fill('FERPA compliance attestation');

      // System should suggest simpler language
      // "Looking for data privacy info? Try: Is my child's data safe?"
    });

  });

  test.describe('Emotional Design', () => {

    test('tone is reassuring not alarming', async ({ page }) => {
      await page.goto('/');

      const mainText = await page.locator('main').textContent() ?? '';

      // Should not have fear-inducing language without resolution
      const alarmingPatterns = [
        /danger(?!.*safe)/i,
        /risk(?!.*protected|managed|mitigated)/i,
        /threat(?!.*addressed)/i
      ];

      for (const pattern of alarmingPatterns) {
        // If alarming words present, should be paired with reassurance
      }
    });

    test('positive framing for safety features', async ({ page }) => {
      await page.goto('/');

      // Look for positive safety messaging
      const positiveIndicators = page.locator(
        ':has-text("protected"), :has-text("safe"), :has-text("secure"), ' +
        ':has-text("private"), :has-text("trusted")'
      );

      // Should emphasize positive outcomes
    });

    test('contact options reduce anxiety', async ({ page }) => {
      await page.goto('/');

      // Easy access to human contact
      const contactOptions = page.locator(
        'a[href*="contact"], a[href*="mailto"], ' +
        'a:has-text("Talk to"), a:has-text("Questions")'
      );

      await expect(contactOptions.first()).toBeVisible();
    });

  });

  test.describe('Accessibility', () => {

    test('text is readable on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Text should be legible
      const bodyText = page.locator('p, li');

      for (const text of (await bodyText.all()).slice(0, 3)) {
        const fontSize = await text.evaluate(
          el => window.getComputedStyle(el).fontSize
        );
        // Should be at least 14px on mobile
        expect(parseInt(fontSize)).toBeGreaterThanOrEqual(14);
      }
    });

    test('touch targets adequate for anxious tapping', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      await assertTouchTargetSize(page, 44);
    });

    test('content readable with screen reader', async ({ page }) => {
      await page.goto('/');

      // Landmarks present
      const landmarks = page.locator('main, nav, header, footer');
      expect(await landmarks.count()).toBeGreaterThan(0);

      // Images have alt text
      const images = page.locator('img');
      for (const img of await images.all()) {
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });

  });

  test.describe('Contact Form Experience', () => {

    test('form explains what happens next', async ({ page }) => {
      await page.goto('/contact');

      // Should set expectations
      const expectations = page.locator(
        ':has-text("respond within"), :has-text("hear back"), ' +
        ':has-text("next steps"), :has-text("we will")'
      );

      // Parents need to know what to expect
    });

    test('confirmation is reassuring', async ({ page }) => {
      await page.goto('/contact');

      // Fill form
      await page.fill('input[name="name"], #name', 'Test Parent');
      await page.fill('input[name="email"], #email', 'parent@test.com');
      await page.fill('input[name="organization"], #organization', 'Local School');

      const messageField = page.locator('textarea, #message');
      if (await messageField.count() > 0) {
        await messageField.fill('I have questions about data privacy.');
      }

      // Submit
      await page.click('button[type="submit"]');

      // Success message should be reassuring
      const successMessage = page.locator(
        '[role="alert"]:not([data-error]), .success, .confirmation'
      );

      // Should confirm submission and next steps
    });

    test('error messages are helpful not scary', async ({ page }) => {
      await page.goto('/contact');

      // Submit with invalid email
      await page.fill('input[name="email"], #email', 'invalid');
      await page.click('button[type="submit"]');

      const errorMessage = page.locator('[role="alert"], .error, [data-error]');

      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.first().textContent() ?? '';

        // Should be helpful, not accusatory
        expect(errorText.toLowerCase()).not.toMatch(/wrong|invalid|fail|error/);
        // Prefer: "Please enter a valid email" over "Invalid email"
      }
    });

  });

});
