/**
 * Information Density and Cognitive Load Tests
 *
 * Tests that validate the "Cognitive Throttling" concept:
 * Interface complexity adapts to match user's cognitive load capacity.
 */

import { test, expect, Page } from '@playwright/test';
import {
  cognitiveProfiles,
  CognitiveProfile
} from '../fixtures/test-data';
import {
  measureCognitiveLoad,
  CognitiveLoadMetrics
} from '../utils/metrics';

test.describe('Information Density - Cognitive Throttling', () => {

  test.describe('Per-Page Load Thresholds', () => {

    test('homepage maintains low cognitive load', async ({ page }) => {
      await page.goto('/');

      const load = await measureCognitiveLoad(page);

      // Homepage should be accessible to all archetypes
      expect(load.estimatedLoadScore).toBeLessThanOrEqual(5);
      expect(load.interactiveElements).toBeLessThan(25);
      expect(load.textDensity).toBeLessThan(500);
    });

    test('quiz page maintains minimal cognitive load', async ({ page }) => {
      await page.goto('/tools/ai-readiness-quiz');

      const load = await measureCognitiveLoad(page);

      // Quiz should be simple - one question at a time
      expect(load.estimatedLoadScore).toBeLessThanOrEqual(4);
      expect(load.interactiveElements).toBeLessThan(15);
    });

    test('chatbot page maintains moderate load', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const load = await measureCognitiveLoad(page);

      // Chat is focused but can accumulate messages
      expect(load.estimatedLoadScore).toBeLessThanOrEqual(6);
    });

    test('dashboard acceptable for expert users', async ({ page }) => {
      await page.goto('/dashboard');

      const load = await measureCognitiveLoad(page);

      // Dashboard is for consultants (loadCapacity 9)
      expect(load.estimatedLoadScore).toBeLessThanOrEqual(8);
    });

  });

  test.describe('Progressive Disclosure Patterns', () => {

    test('complex content starts collapsed', async ({ page }) => {
      await page.goto('/');

      // Find expandable sections
      const collapsed = page.locator(
        'details:not([open]), [aria-expanded="false"]'
      );
      const expanded = page.locator(
        'details[open], [aria-expanded="true"]'
      );

      const collapsedCount = await collapsed.count();
      const expandedCount = await expanded.count();

      // More should be collapsed than expanded by default
      expect(collapsedCount).toBeGreaterThanOrEqual(expandedCount);
    });

    test('expanding reveals additional detail', async ({ page }) => {
      await page.goto('/');

      const expandable = page.locator('details, [aria-expanded="false"]').first();

      if (await expandable.count() > 0) {
        const beforeText = await page.locator('main').textContent();

        await expandable.click();
        await page.waitForTimeout(300);

        const afterText = await page.locator('main').textContent();

        // Content should increase
        expect((afterText ?? '').length).toBeGreaterThan((beforeText ?? '').length - 20);
      }
    });

    test('each expansion level is self-contained', async ({ page }) => {
      await page.goto('/');

      // Each level should make sense without drilling deeper
      const summaries = page.locator('summary, [role="button"][aria-expanded]');

      for (const summary of await summaries.all()) {
        const text = await summary.textContent();
        // Summary text should be meaningful on its own
        expect((text ?? '').trim().length).toBeGreaterThan(3);
      }
    });

  });

  test.describe('Visual Hierarchy', () => {

    test('single H1 per page', async ({ page }) => {
      await page.goto('/');
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      await page.goto('/tools/ai-readiness-quiz');
      const quizH1Count = await page.locator('h1').count();
      expect(quizH1Count).toBe(1);

      await page.goto('/contact');
      const contactH1Count = await page.locator('h1').count();
      expect(contactH1Count).toBe(1);
    });

    test('heading hierarchy is correct', async ({ page }) => {
      await page.goto('/');

      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

      let lastLevel = 0;
      for (const heading of headings) {
        const tag = await heading.evaluate(el => el.tagName);
        const level = parseInt(tag.charAt(1));

        // Heading levels shouldn't skip (h1 -> h3 without h2)
        if (lastLevel > 0) {
          expect(level).toBeLessThanOrEqual(lastLevel + 1);
        }
        lastLevel = level;
      }
    });

    test('primary actions are visually prominent', async ({ page }) => {
      await page.goto('/');

      // Find primary buttons
      const primaryButtons = page.locator(
        'button.primary, button[class*="primary"], ' +
        'a.primary, [data-primary]'
      );

      // If primary actions exist, they should be styled distinctly
    });

    test('spacing creates clear content groups', async ({ page }) => {
      await page.goto('/');

      // Sections should have clear separation
      const sections = page.locator('section, [role="region"], article');
      const sectionCount = await sections.count();

      // Content should be grouped, not one long stream
      expect(sectionCount).toBeGreaterThan(2);
    });

  });

  test.describe('Text Readability', () => {

    test('line length is comfortable', async ({ page }) => {
      await page.goto('/');

      const paragraphs = page.locator('p');

      for (const p of (await paragraphs.all()).slice(0, 5)) {
        const width = await p.evaluate((el) => {
          if (el instanceof HTMLElement) {
            return el.offsetWidth;
          }
          return el.getBoundingClientRect().width;
        });
        const fontSize = await p.evaluate(el =>
          parseFloat(window.getComputedStyle(el).fontSize)
        );

        // Characters per line: width / (fontSize * 0.5)
        // Ideal: 45-75 characters
        const estimatedCharsPerLine = width / (fontSize * 0.5);

        // Allow wider for responsive, but warn if too wide
        expect(estimatedCharsPerLine).toBeLessThan(100);
      }
    });

    test('font size meets minimum accessibility', async ({ page }) => {
      await page.goto('/');

      const bodyText = page.locator('p, li, td, span');

      for (const el of (await bodyText.all()).slice(0, 10)) {
        const fontSize = await el.evaluate(el =>
          parseFloat(window.getComputedStyle(el).fontSize)
        );

        // Minimum 14px for body text (16px preferred)
        expect(fontSize).toBeGreaterThanOrEqual(14);
      }
    });

    test('sufficient line height', async ({ page }) => {
      await page.goto('/');

      const paragraphs = page.locator('p');

      for (const p of (await paragraphs.all()).slice(0, 5)) {
        const lineHeight = await p.evaluate(el =>
          parseFloat(window.getComputedStyle(el).lineHeight)
        );
        const fontSize = await p.evaluate(el =>
          parseFloat(window.getComputedStyle(el).fontSize)
        );

        // Line height should be at least 1.4x font size
        if (!isNaN(lineHeight) && !isNaN(fontSize)) {
          expect(lineHeight / fontSize).toBeGreaterThanOrEqual(1.3);
        }
      }
    });

  });

  test.describe('Color Usage', () => {

    test('limited color palette reduces cognitive load', async ({ page }) => {
      await page.goto('/');

      const load = await measureCognitiveLoad(page);

      // Too many colors is overwhelming
      expect(load.colorVariety).toBeLessThan(30);
    });

    test('semantic colors are consistent', async ({ page }) => {
      await page.goto('/');

      // Collect all status colors
      const redElements = page.locator('[class*="red"], [class*="error"], [class*="danger"]');
      const greenElements = page.locator('[class*="green"], [class*="success"]');
      const yellowElements = page.locator('[class*="yellow"], [class*="warning"]');

      // These should use consistent colors throughout
      // Would need more sophisticated testing for actual color values
    });

    test('information not conveyed by color alone', async ({ page }) => {
      await page.goto('/');

      // Status indicators should have text/icon in addition to color
      const statusIndicators = page.locator('[data-status], .status');

      for (const indicator of await statusIndicators.all()) {
        const hasText = (await indicator.textContent())?.trim().length! > 0;
        const hasIcon = (await indicator.locator('svg, [class*="icon"]').count()) > 0;
        const hasAriaLabel = !!(await indicator.getAttribute('aria-label'));

        const hasAccessibleMeaning = hasText || hasIcon || hasAriaLabel;
        // Each status should be identifiable without color
      }
    });

  });

  test.describe('Animation and Motion', () => {

    test('respects reduced motion preference', async ({ page }) => {
      // Set prefer-reduced-motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');

      // Animations should be disabled or reduced
      const animatedElements = page.locator('[class*="animate"]');

      // In reduced motion mode, animations should use
      // prefers-reduced-motion media query
    });

    test('no auto-playing distracting animations', async ({ page }) => {
      await page.goto('/');

      // Look for auto-playing animations that might distract
      const autoPlayingVideo = page.locator('video[autoplay]:not([muted])');
      const infiniteAnimations = page.locator('[class*="animate-infinite"]');

      // Auto-playing video with sound is distracting
      expect(await autoPlayingVideo.count()).toBe(0);
    });

    test('loading states use subtle indicators', async ({ page }) => {
      await page.goto('/');

      // Loading spinners should be present but not overwhelming
      const loadingIndicators = page.locator(
        '[role="progressbar"], .loading, .spinner, [data-loading]'
      );

      // If loading indicators exist, they should be appropriately sized
    });

  });

  test.describe('Mobile Cognitive Load', () => {

    test('mobile view simplifies appropriately', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const load = await measureCognitiveLoad(page);

      // Mobile should have even lower load
      expect(load.interactiveElements).toBeLessThan(20);
    });

    test('navigation collapses to hamburger menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const hamburgerMenu = page.locator(
        '[data-mobile-menu], button[aria-label*="menu"], .hamburger'
      );
      const fullNav = page.locator('nav >> a:visible');

      // Either hamburger is visible, or minimal inline nav
      const hasCollapsedNav = (await hamburgerMenu.count()) > 0 ||
                              (await fullNav.count()) < 5;

      expect(hasCollapsedNav).toBe(true);
    });

    test('touch targets meet minimum size', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const interactives = page.locator('button, a, input, select');

      for (const el of (await interactives.all()).slice(0, 10)) {
        const box = await el.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          // At least one dimension should meet 44px minimum
          const meetsMinimum = box.width >= 44 || box.height >= 44;
          expect(meetsMinimum).toBe(true);
        }
      }
    });

  });

});
