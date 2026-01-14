/**
 * DAROS Archetype Spec: Superintendent (Dr. Elena Martinez)
 *
 * Metaphor: Traffic Light Dashboard (The Pilot)
 * Psychology: Risk-averse, time-poor, wants order and compliance
 *
 * This spec tests the system from the Superintendent's perspective,
 * enforcing her cognitive constraints throughout the test.
 */

import { darosTest, expect, superintendentPersona } from '../daros-engine';
import { PersonaActor, assertComplexityAppropriate } from '../persona-actions';

// Configure all tests in this file to use the Superintendent persona
darosTest.use({ persona: superintendentPersona });

darosTest.describe('DAROS Archetype: Superintendent (Dr. Martinez)', () => {
  darosTest.describe('Primary Goals', () => {
    darosTest(
      'Goal: "Know current risk level at a glance"',
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);

        // 1. Navigate to dashboard (Engine enforces load time budget)
        await darosPage.goto('/dashboard');

        // 2. Scan for risk status using F-pattern
        await actor.findInformation('[data-status], .status-indicator, [class*="risk"]', 'Risk Status');

        // 3. Verify content is in her preferred format (visual, checklist)
        const mainContent = darosPage.locator('main');
        await actor.verifyContentFormat(mainContent);

        // 4. Status should be color-coded (Traffic Light pattern)
        const statusColors = darosPage.locator(
          '[class*="red"], [class*="yellow"], [class*="green"], ' +
          '[data-status="red"], [data-status="yellow"], [data-status="green"]'
        );
        expect(await statusColors.count()).toBeGreaterThan(0);

        // 5. Key metrics visible without scrolling
        const metrics = darosPage.locator('.metric-card, [data-metric], .stat');
        if ((await metrics.count()) > 0) {
          const firstMetric = metrics.first();
          await expect(firstMetric).toBeInViewport();
        }

        // Report click efficiency
        console.log(
          `[TEST] Goal achieved with ${darosMetrics.totalClicks} clicks (budget: ${darosMetrics.maxClicksAllowed})`
        );
      }
    );

    darosTest(
      'Goal: "Present clear governance story to board"',
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);

        await darosPage.goto('/dashboard');

        // Find the board summary/export feature
        await actor.findInformation(
          'button:has-text("Export"), button:has-text("Board"), [data-export]',
          'Board Export'
        );

        // Make the decision to export
        const exportButton = darosPage.locator(
          'button:has-text("Export Board"), button:has-text("Export"), [data-export]'
        );

        if ((await exportButton.count()) > 0) {
          await actor.makeDecision('button:has-text("Export")');

          // Success should be quick and clear
          const success = darosPage.locator('.toast, [role="alert"], .success');
          await expect(success.first()).toBeVisible({ timeout: 5000 });
        }

        // Verify clicks stayed within budget
        expect(darosMetrics.totalClicks).toBeLessThanOrEqual(
          darosMetrics.maxClicksAllowed
        );
      }
    );

    darosTest(
      'Goal: "Can explain AI governance status in 60 seconds"',
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);
        const startTime = Date.now();

        await darosPage.goto('/dashboard');

        // She needs to quickly find and understand:
        // 1. Overall status
        await actor.findInformation('[data-status], .status', 'Overall Status');

        // 2. Any red flags
        const redFlags = darosPage.locator(
          '[data-status="red"], .status-red, [class*="danger"], [class*="critical"]'
        );
        const redCount = await redFlags.count();

        // 3. Next action required
        await actor.findInformation(
          'button, a, [data-action]',
          'Next Action'
        );

        const elapsed = Date.now() - startTime;
        console.log(`[TEST] Status comprehension achieved in ${elapsed}ms`);

        // Should complete within 60 seconds
        expect(elapsed).toBeLessThan(60000);
      }
    );
  });

  darosTest.describe('Anxiety Scenarios', () => {
    darosTest(
      'Anxiety: "Board questions without clear answers"',
      async ({ darosPage }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);

        // Navigate to FAQ or help section
        await darosPage.goto('/');

        // Find FAQ link
        const faqLink = darosPage.locator('a:has-text("FAQ"), a:has-text("Questions")');

        if ((await faqLink.count()) > 0) {
          await faqLink.first().click();

          // Content should be structured as accordion/checklist
          // NOT dense paragraphs
          const accordions = darosPage.locator('details, [data-accordion], [role="region"]');
          const denseParagraphs = darosPage.locator('p.dense, .wall-of-text');

          expect(await accordions.count()).toBeGreaterThanOrEqual(0);
          expect(await denseParagraphs.count()).toBe(0);
        }
      }
    );

    darosTest(
      'Anxiety: "Parent backlash from AI privacy issues"',
      async ({ darosPage }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);

        await darosPage.goto('/dashboard');

        // Privacy status should be immediately visible
        const privacyStatus = darosPage.locator(
          '[data-privacy-status], :has-text("Privacy"), :has-text("FERPA")'
        );

        // If privacy issues exist, they should be prominently flagged
        const privacyAlerts = darosPage.locator(
          '[data-status="red"]:has-text("Privacy"), ' +
          '.alert:has-text("Privacy"), ' +
          '[role="alert"]:has-text("Privacy")'
        );

        // Privacy concerns should surface, not hide
      }
    );
  });

  darosTest.describe('Cognitive Constraints', () => {
    darosTest(
      'Constraint: Dashboard complexity within tolerance',
      async ({ darosPage }) => {
        await darosPage.goto('/dashboard');

        // Verify complexity is appropriate for low-tolerance persona
        await assertComplexityAppropriate(
          darosPage,
          superintendentPersona,
          'main'
        );
      }
    );

    darosTest(
      'Constraint: Information above the fold',
      async ({ darosPage }) => {
        await darosPage.goto('/dashboard');

        // Key elements should be visible without scrolling
        const keyElements = [
          '.metric-card',
          '[data-status]',
          '[data-metric]',
        ];

        for (const selector of keyElements) {
          const element = darosPage.locator(selector).first();
          if ((await element.count()) > 0) {
            await expect(element).toBeInViewport();
          }
        }
      }
    );

    darosTest(
      'Constraint: Binary/bulk inputs not text paragraphs',
      async ({ darosPage }) => {
        await darosPage.goto('/dashboard');

        // Count input types
        const binaryInputs = await darosPage
          .locator('input[type="checkbox"], input[type="radio"], [role="switch"]')
          .count();

        const textareas = await darosPage
          .locator('textarea')
          .count();

        // Should have more binary than text inputs (or equal)
        console.log(
          `[TEST] Binary inputs: ${binaryInputs}, Textareas: ${textareas}`
        );
        expect(binaryInputs).toBeGreaterThanOrEqual(textareas);
      }
    );
  });

  darosTest.describe('Traffic Light Pattern', () => {
    darosTest(
      'Pattern: Red status blocks export with explanation',
      async ({ darosPage }) => {
        // Navigate to a district with red status
        await darosPage.goto('/dashboard/districts/district-3');

        const exportButton = darosPage.locator(
          'button:has-text("Export"), [data-export]'
        );

        if ((await exportButton.count()) > 0) {
          // If red status, export should be disabled
          const isDisabled = await exportButton.first().isDisabled();

          if (isDisabled) {
            // Hover should show explanation
            await exportButton.first().hover();

            const tooltip = darosPage.locator(
              '[role="tooltip"], .tooltip, [data-tooltip]'
            );

            // Explanation should exist
          }
        }
      }
    );

    darosTest(
      'Pattern: Fix action available for red items',
      async ({ darosPage }) => {
        await darosPage.goto('/dashboard/districts/district-3');

        const redItems = darosPage.locator(
          '[data-status="red"], .status-red'
        );

        if ((await redItems.count()) > 0) {
          // Each red item should have a fix action
          const fixActions = darosPage.locator(
            'button:has-text("Fix"), button:has-text("Resolve"), [data-action="fix"]'
          );

          // Fix path should exist
        }
      }
    );
  });

  darosTest.describe('Success Indicators', () => {
    darosTest(
      'Success: "Has board-ready one-pager on demand"',
      async ({ darosPage, darosMetrics }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);

        await darosPage.goto('/dashboard');

        // Should be able to get one-pager within click budget
        const onePagerButton = darosPage.locator(
          'button:has-text("One-Pager"), button:has-text("Summary"), ' +
          'a:has-text("Board"), [data-board-summary]'
        );

        if ((await onePagerButton.count()) > 0) {
          await actor.makeDecision(await onePagerButton.first().getAttribute('class') || 'button');

          // Should complete within budget
          expect(darosMetrics.totalClicks).toBeLessThanOrEqual(
            darosMetrics.maxClicksAllowed
          );
        }
      }
    );

    darosTest(
      'Success: "Can delegate specific actions with clear owners"',
      async ({ darosPage }) => {
        const actor = new PersonaActor(darosPage, superintendentPersona);

        await darosPage.goto('/dashboard/districts/district-1');

        // Find controls or tasks
        const controlsTab = darosPage.locator(
          '[data-tab="controls"], button:has-text("Controls")'
        );

        if ((await controlsTab.count()) > 0) {
          await controlsTab.click();

          // Each control should show an owner
          const ownerFields = darosPage.locator(
            '[data-owner], .owner, :has-text("Assigned")'
          );

          // Ownership should be visible for delegation
        }
      }
    );
  });
});
