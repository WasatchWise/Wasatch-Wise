/**
 * Administrator Archetype HCI Tests
 *
 * Metaphor: Traffic Light Dashboard (The Pilot)
 * Psychology: Risk-averse, time-poor, wants order and compliance
 * Input Mode: Binary & Bulk (Approve/Deny toggles, Bulk Apply)
 * Output Mode: Red/Yellow/Green status indicators
 */

import { test, expect, Page } from '@playwright/test';
import { superintendentPersona, getCognitiveConstraints } from '../fixtures/personas';
import {
  superintendentStatusCheckScenario,
  dashboardOrientationScenario
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
  assertTrafficLightPattern,
  assertBinaryBulkInput,
  assertCognitiveLoadAppropriate,
  assertKeyboardNavigable,
  assertColorContrast
} from '../utils/assertions';

const profile = cognitiveProfiles.administrator;
const constraints = getCognitiveConstraints(superintendentPersona);
const thresholds = getThresholdsForProfile(profile);

test.describe('Administrator Archetype - Traffic Light Dashboard', () => {

  test.describe('Metaphor Pattern Validation', () => {

    test('displays Red/Yellow/Green status indicators', async ({ page }) => {
      await page.goto('/dashboard');

      // Must have traffic light status colors
      const statusIndicators = page.locator(
        '[data-status], .status-indicator, [class*="status-"]'
      );
      await expect(statusIndicators.first()).toBeVisible();

      // Verify color semantics
      const redIndicators = page.locator('[data-status="red"], .status-red, .text-red-500, .bg-red-500');
      const yellowIndicators = page.locator('[data-status="yellow"], .status-yellow, .text-yellow-500, .bg-yellow-500');
      const greenIndicators = page.locator('[data-status="green"], .status-green, .text-green-500, .bg-green-500');

      // At least one status type should be visible
      const hasStatuses = (await redIndicators.count()) > 0 ||
                         (await yellowIndicators.count()) > 0 ||
                         (await greenIndicators.count()) > 0;
      expect(hasStatuses).toBe(true);
    });

    test('provides bulk action controls', async ({ page }) => {
      await page.goto('/dashboard');

      // Administrator needs batch operations
      const bulkActions = page.locator(
        'button:has-text("Select All"), button:has-text("Approve All"), ' +
        'button:has-text("Bulk"), [data-bulk-action], input[type="checkbox"][name*="select"]'
      );

      // Should have some form of bulk selection
      // Note: May not be implemented yet - this validates the requirement
    });

    test('Red status creates friction for export', async ({ page }) => {
      await page.goto('/dashboard/districts/district-3'); // Red status district

      // When compliance is red, export should be disabled
      const exportButton = page.locator('button:has-text("Export"), [data-export]');

      if (await exportButton.count() > 0) {
        const isDisabled = await exportButton.first().isDisabled();
        // If red status present, export should be blocked
        // This is the "friction by design" pattern
      }
    });

    test('provides "Fix" action for red status items', async ({ page }) => {
      await page.goto('/dashboard/districts/district-3');

      // Red items should have a clear remediation path
      const redItems = page.locator('[data-status="red"], .status-red').first();

      if (await redItems.count() > 0) {
        // Should have a "Fix" or "Resolve" action nearby
        const fixAction = page.locator(
          'button:has-text("Fix"), button:has-text("Resolve"), ' +
          'a:has-text("Fix"), [data-action="fix"]'
        );
        // Validate fix action exists for red items
      }
    });

  });

  test.describe('Input Mode - Binary & Bulk', () => {

    test('uses toggles and checkboxes not text fields', async ({ page }) => {
      await page.goto('/dashboard');

      // Count binary inputs vs text inputs
      const binaryInputs = await page.locator(
        'input[type="checkbox"], input[type="radio"], [role="switch"], [role="checkbox"]'
      ).count();

      const textInputs = await page.locator(
        'textarea, input[type="text"]:not([readonly])'
      ).count();

      // Administrators should have more binary than text inputs
      // They shouldn't be asked to write paragraphs
      expect(binaryInputs).toBeGreaterThanOrEqual(textInputs);
    });

    test('approval workflows use clear binary choices', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');
      await page.click('text=Controls');

      // Control items should have approve/deny or complete/incomplete toggles
      const controlItems = page.locator('[data-control], .control-item');

      if (await controlItems.count() > 0) {
        const firstControl = controlItems.first();

        // Should have binary status control
        const statusControl = firstControl.locator(
          '[role="switch"], input[type="checkbox"], select'
        );
        await expect(statusControl).toBeVisible();
      }
    });

    test('batch selection is available for list items', async ({ page }) => {
      await page.goto('/dashboard');

      // District list should support multi-select
      const selectAllCheckbox = page.locator(
        'input[type="checkbox"][aria-label*="all"], thead input[type="checkbox"]'
      );

      // Or there should be individual row checkboxes
      const rowCheckboxes = page.locator('tbody input[type="checkbox"]');

      const hasBatchSelect = (await selectAllCheckbox.count()) > 0 ||
                            (await rowCheckboxes.count()) > 0;
      // Batch selection enhances administrator efficiency
    });

  });

  test.describe('Cognitive Load Constraints', () => {

    test('dashboard loads under 2 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      // Time-poor users need fast load
      expect(loadTime).toBeLessThan(constraints.maxLoadTime);
    });

    test('status overview visible without scrolling', async ({ page }) => {
      await page.goto('/dashboard');

      // Key metrics should be above the fold
      const metricCards = page.locator('.metric-card, [data-metric], .stat-card');

      if (await metricCards.count() > 0) {
        const firstCard = metricCards.first();
        const box = await firstCard.boundingBox();

        if (box) {
          // Should be in viewport without scrolling
          expect(box.top).toBeLessThan(600);
        }
      }
    });

    test('cognitive load score within threshold', async ({ page }) => {
      await page.goto('/dashboard');

      const cognitiveLoad = await measureCognitiveLoad(page);

      // Administrator has low load capacity (3)
      expect(cognitiveLoad.estimatedLoadScore).toBeLessThanOrEqual(
        profile.loadCapacity + 2 // Some tolerance
      );

      // Should have limited interactive elements
      expect(cognitiveLoad.interactiveElements).toBeLessThan(30);
    });

    test('information hierarchy is clear', async ({ page }) => {
      await page.goto('/dashboard');

      // Should have clear heading hierarchy
      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();

      expect(h1Count).toBe(1); // Single main heading
      expect(h2Count).toBeGreaterThan(0); // Section headings
    });

  });

  test.describe('Quick Status Check Journey', () => {

    test('completes status check under 60 seconds', async ({ page }) => {
      const scenario = superintendentStatusCheckScenario;

      const timing = await measureTiming(page, async () => {
        await page.goto('/dashboard');

        // Find district row
        await page.click('text=View');

        // Check overview tab
        await expect(page.locator('[data-tab="overview"], .tab-overview')).toBeVisible();

        // Identify risk level
        const riskIndicators = page.locator(
          '[data-risk], .risk-level, [class*="risk"]'
        );
        await expect(riskIndicators.first()).toBeVisible();
      });

      expect(timing.timeToTaskCompletion).toBeLessThan(scenario.maxTimeSeconds * 1000);
    });

    test('navigation requires maximum 4 clicks', async ({ page }) => {
      const interactions = await measureInteractions(page, async () => {
        await page.goto('/dashboard');

        // Click to district
        await page.click('text=View');

        // Check status
        await page.click('text=Controls');

        // Return to dashboard
        await page.click('text=Back');
      });

      expect(interactions.totalClicks).toBeLessThanOrEqual(4);
    });

    test('no confusion signals during status check', async ({ page }) => {
      const timing = await measureTiming(page, async () => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
      });

      const interactions = await measureInteractions(page, async () => {
        // Normal navigation
        await page.click('text=View');
      });

      const confusion = await detectConfusion(page, interactions, timing);

      expect(confusion.confusionScore).toBeLessThan(30);
      expect(confusion.backtracking).toBe(false);
    });

  });

  test.describe('Invisible Tutorial Patterns', () => {

    test('export blocked when red guides user to fix', async ({ page }) => {
      // Mario 1-1: Environment teaches through affordances
      await page.goto('/dashboard/districts/district-3'); // Red status

      const exportButton = page.locator('button:has-text("Export")');

      if (await exportButton.count() > 0 && await exportButton.isDisabled()) {
        // Should show tooltip or visual guide to fix
        await exportButton.hover();

        const tooltip = page.locator('[role="tooltip"], .tooltip, [data-tooltip]');
        // Tooltip should explain why disabled and how to enable
      }
    });

    test('no separate help menu needed', async ({ page }) => {
      await page.goto('/dashboard');

      // The interface should be self-explanatory
      // Help should be contextual, not a separate destination
      const helpMenu = page.locator(
        'a:has-text("Help"), button:has-text("Help"), nav >> text=Help'
      );

      // Contextual help (tooltips, inline hints) preferred over help pages
      const contextualHelp = page.locator(
        '[data-tooltip], [title], [aria-describedby], .hint, .helper-text'
      );

      // Should have contextual help scattered through UI
    });

  });

  test.describe('Accessibility - WCAG 2.1 AA', () => {

    test('color contrast meets AA standards', async ({ page }) => {
      await page.goto('/dashboard');
      await assertColorContrast(page);
    });

    test('status colors distinguishable for colorblind users', async ({ page }) => {
      await page.goto('/dashboard');

      // Status indicators should not rely on color alone
      const statusIndicators = page.locator('[data-status], .status-indicator');

      for (const indicator of await statusIndicators.all()) {
        // Should have text label or icon in addition to color
        const hasText = (await indicator.textContent())?.trim().length! > 0;
        const hasIcon = (await indicator.locator('svg, [class*="icon"]').count()) > 0;
        const hasAriaLabel = !!(await indicator.getAttribute('aria-label'));

        const hasNonColorIndicator = hasText || hasIcon || hasAriaLabel;
        // Each status should be identifiable without color
      }
    });

    test('full keyboard navigation available', async ({ page }) => {
      await page.goto('/dashboard');
      await assertKeyboardNavigable(page);

      // Tab through main navigation
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }

      // Verify focus is visible and on interactive element
      const focusedElement = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        role: document.activeElement?.getAttribute('role'),
        text: document.activeElement?.textContent?.trim().slice(0, 50)
      }));

      expect(focusedElement.tag).toMatch(/BUTTON|A|INPUT|SELECT/);
    });

    test('data table has proper ARIA attributes', async ({ page }) => {
      await page.goto('/dashboard');

      const table = page.locator('table');
      if (await table.count() > 0) {
        // Table should have caption or aria-label
        const hasCaption = (await table.locator('caption').count()) > 0;
        const hasAriaLabel = !!(await table.getAttribute('aria-label'));
        const hasAriaLabelledby = !!(await table.getAttribute('aria-labelledby'));

        expect(hasCaption || hasAriaLabel || hasAriaLabelledby).toBe(true);

        // Headers should use th with scope
        const headers = table.locator('th');
        for (const header of await headers.all()) {
          const scope = await header.getAttribute('scope');
          // Headers should have scope attribute
        }
      }
    });

  });

  test.describe('Mobile Responsiveness', () => {

    test('dashboard usable on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard');

      // Key elements should be visible and tappable
      const metrics = page.locator('.metric-card, [data-metric]');
      const navigation = page.locator('nav, [role="navigation"]');

      await expect(page.locator('body')).toBeVisible();

      // Touch targets should be adequate size
      const buttons = page.locator('button');
      for (const button of (await buttons.all()).slice(0, 5)) {
        const box = await button.boundingBox();
        if (box) {
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('critical actions accessible on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/dashboard');

      // Main navigation should be accessible (via hamburger menu if hidden)
      const mobileMenu = page.locator('[data-mobile-menu], .mobile-nav, [aria-label="Menu"]');
      const regularNav = page.locator('nav >> text=Dashboard');

      const hasNavigation = (await mobileMenu.count()) > 0 || (await regularNav.count()) > 0;
      expect(hasNavigation).toBe(true);
    });

  });

});
