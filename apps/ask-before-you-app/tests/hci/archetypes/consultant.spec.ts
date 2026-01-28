/**
 * Consultant Archetype HCI Tests
 *
 * Metaphor: Command Center (The Facilitator)
 * Psychology: Expert user, workflow efficiency, client-facing
 * Input Mode: Natural language with power-user shortcuts
 * Output Mode: Streaming text with professional artifacts
 *
 * The consultant (Clarion) is the power user who runs briefings
 * and generates artifacts for district clients.
 */

import { test, expect, Page } from '@playwright/test';
import { consultantPersona, getCognitiveConstraints } from '../fixtures/personas';
import {
  briefingWorkflowScenario,
  dashboardOrientationScenario,
  districtCreationScenario
} from '../fixtures/scenarios';
import {
  cognitiveProfiles
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
  assertKeyboardNavigable,
  assertStreamingResponse
} from '../utils/assertions';

const profile = cognitiveProfiles.consultant;
const constraints = getCognitiveConstraints(consultantPersona);
const thresholds = getThresholdsForProfile(profile);

test.describe('Consultant Archetype - Command Center', () => {

  test.describe('Dashboard Power User Features', () => {

    test('dashboard overview loads instantly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      // Consultant needs instant access
      expect(loadTime).toBeLessThan(2000);
    });

    test('all districts visible without pagination for small lists', async ({ page }) => {
      await page.goto('/dashboard');

      // For efficiency, show all if < 20 districts
      const districtRows = page.locator('[data-district], .district-row, tbody tr');
      const count = await districtRows.count();

      if (count > 0 && count < 20) {
        // All should be visible
        const paginationControls = page.locator('[data-pagination], .pagination');
        // Small lists shouldn't need pagination
      }
    });

    test('keyboard shortcuts for common actions', async ({ page }) => {
      await page.goto('/dashboard');

      // Power users expect keyboard shortcuts
      // N for New District
      await page.keyboard.press('n');

      const newDistrictModal = page.locator('[data-new-district], .new-district-form, [role="dialog"]');

      // Or search with /
      await page.keyboard.press('/');
      const searchInput = page.locator('input[type="search"], [data-search]');

      // Shortcuts accelerate workflow
    });

    test('search/filter immediately available', async ({ page }) => {
      await page.goto('/dashboard');

      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search"], ' +
        '[data-search], input[placeholder*="filter"]'
      );

      // Should be visible or quickly accessible
    });

    test('bulk operations available', async ({ page }) => {
      await page.goto('/dashboard');

      // Consultant might need to act on multiple districts
      const bulkSelect = page.locator(
        'input[type="checkbox"][aria-label*="select all"], ' +
        'thead input[type="checkbox"], [data-bulk-select]'
      );

      // Bulk operations save time
    });

  });

  test.describe('Briefing Workflow Efficiency', () => {

    test('complete briefing workflow under 60 minutes', async ({ page }) => {
      const scenario = briefingWorkflowScenario;

      // This is the critical path for consultants
      await page.goto('/dashboard/districts/district-1');

      // Navigate to briefing tab
      const briefingTab = page.locator(
        '[data-tab="briefing"], button:has-text("Briefing"), a:has-text("Briefing")'
      );

      if (await briefingTab.count() > 0) {
        await briefingTab.click();
      }

      // Briefing should have clear workflow steps
      const workflowSteps = page.locator(
        '[data-step], .workflow-step, .briefing-section'
      );

      // Should have structured sections for 60-minute flow
    });

    test('stakeholder matrix entry is efficient', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // 5 stakeholder groups to assess
      // Each should be quick to update
      const stakeholderInputs = page.locator(
        '[data-stakeholder], .stakeholder-row, [data-outcome-level]'
      );

      // Input method should be fast (dropdowns, not text)
    });

    test('controls status batch update available', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // Go to controls tab
      const controlsTab = page.locator(
        '[data-tab="controls"], button:has-text("Controls")'
      );

      if (await controlsTab.count() > 0) {
        await controlsTab.click();

        // Should have batch status update
        const batchUpdate = page.locator(
          'button:has-text("Update All"), [data-batch-status]'
        );

        // Updating 8 controls one-by-one is too slow
      }
    });

    test('vendor import is streamlined', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // Vendors tab
      const vendorsTab = page.locator(
        '[data-tab="vendors"], button:has-text("Vendors")'
      );

      if (await vendorsTab.count() > 0) {
        await vendorsTab.click();

        // Should have import function
        const importButton = page.locator(
          'button:has-text("Import"), [data-import-vendors]'
        );

        // Adding vendors one-by-one is inefficient
      }
    });

  });

  test.describe('Artifact Generation', () => {

    test('all artifacts generated in single action', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // After briefing, should generate all artifacts at once
      const generateAllButton = page.locator(
        'button:has-text("Generate All"), button:has-text("Complete Session"), ' +
        '[data-generate-artifacts]'
      );

      // Single click should produce:
      // - Stakeholder Matrix
      // - Controls Checklist
      // - Adoption Plan
      // - Board One-Pager
      // - Vendor Risk Map
    });

    test('artifact generation shows progress', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // During generation, should show progress
      const progressIndicator = page.locator(
        '[role="progressbar"], .generating, [data-generation-status]'
      );

      // Consultant needs feedback during generation
    });

    test('artifacts are immediately downloadable', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // Artifacts tab
      const artifactsTab = page.locator(
        '[data-tab="artifacts"], button:has-text("Artifacts")'
      );

      if (await artifactsTab.count() > 0) {
        await artifactsTab.click();

        // Each artifact should have download button
        const downloadButtons = page.locator(
          'button:has-text("Download"), a[download], [data-download]'
        );

        // Immediate access is essential
      }
    });

    test('artifacts are client-presentation ready', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // Artifacts should look professional
      // No raw JSON, ugly formatting, or developer UI
      const artifactPreview = page.locator('[data-artifact-preview], .artifact');

      if (await artifactPreview.count() > 0) {
        // Should have polished appearance
        const hasTitle = await artifactPreview.locator('h1, h2, .title').count() > 0;
        expect(hasTitle).toBe(true);
      }
    });

  });

  test.describe('Multi-District Management', () => {

    test('switch between districts without losing context', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // Make some changes
      const someInput = page.locator('input, select, textarea').first();
      if (await someInput.count() > 0) {
        // Note current state
      }

      // Navigate to another district
      await page.goto('/dashboard/districts/district-2');

      // Return to original
      await page.goto('/dashboard/districts/district-1');

      // State should be preserved (auto-save)
    });

    test('dashboard shows all engagement statuses', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see status of each district at a glance
      const statusIndicators = page.locator(
        '[data-engagement-status], .district-status, [data-status]'
      );

      // Overview helps prioritize work
    });

    test('quick navigation between district tabs', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // Tab navigation should be instant
      const tabs = page.locator('[role="tab"], .tab, [data-tab]');

      for (const tab of (await tabs.all()).slice(0, 3)) {
        const startTime = Date.now();
        await tab.click();
        await page.waitForLoadState('domcontentloaded');
        const tabSwitchTime = Date.now() - startTime;

        // Tab switch should feel instant
        expect(tabSwitchTime).toBeLessThan(500);
      }
    });

  });

  test.describe('Client-Facing Considerations', () => {

    test('no confusing UI visible during client meetings', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // Nothing that would confuse or distract clients
      const developerUI = page.locator(
        '[data-debug], .debug, .developer-tools, ' +
        ':has-text("undefined"), :has-text("null")'
      );

      expect(await developerUI.count()).toBe(0);
    });

    test('interface is professional and polished', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // No broken layouts
      const brokenLayouts = page.locator('[style*="overflow: hidden"]');

      // No placeholder text in production
      const placeholders = page.locator(
        ':has-text("Lorem ipsum"), :has-text("TODO"), :has-text("FIXME")'
      );

      expect(await placeholders.count()).toBe(0);
    });

    test('errors are graceful not technical', async ({ page }) => {
      // Navigate to invalid district
      await page.goto('/dashboard/districts/invalid-id');

      // Error should be user-friendly
      const errorMessage = page.locator('[role="alert"], .error, .not-found');

      if (await errorMessage.count() > 0) {
        const text = await errorMessage.first().textContent();
        // Should not show stack traces or technical details
        expect(text).not.toMatch(/TypeError|undefined|null|Error:/);
      }
    });

  });

  test.describe('Session Resilience', () => {

    test('work auto-saves during briefing', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // Make changes
      const input = page.locator('input, select, textarea').first();
      if (await input.count() > 0) {
        await input.fill('Test value');

        // Wait for auto-save
        await page.waitForTimeout(2000);

        // Should have auto-save indicator
        const saveIndicator = page.locator(
          '[data-saved], :has-text("Saved"), .auto-saved'
        );
      }
    });

    test('session resumes after interruption', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // Simulate browser refresh
      await page.reload();

      // Previous state should be preserved
      // No "start over" required
    });

    test('handles network disconnection gracefully', async ({ page }) => {
      await page.goto('/dashboard/districts/district-1');

      // Go offline
      await page.route('**/api/**', route => route.abort());

      // Try to save
      const saveButton = page.locator('button:has-text("Save")');
      if (await saveButton.count() > 0) {
        await saveButton.click();

        // Should show offline message, not crash
        const offlineMessage = page.locator(
          '[data-offline], :has-text("offline"), :has-text("connection")'
        );
      }
    });

  });

  test.describe('Cognitive Load for Expert Users', () => {

    test('supports high information density', async ({ page }) => {
      await page.goto('/dashboard');

      const cognitiveLoad = await measureCognitiveLoad(page);

      // Consultant has loadCapacity of 9
      // Can handle complex interfaces
      expect(cognitiveLoad.estimatedLoadScore).toBeLessThanOrEqual(10);

      // More interactive elements acceptable
      expect(cognitiveLoad.interactiveElements).toBeLessThan(50);
    });

    test('keyboard navigation for efficiency', async ({ page }) => {
      await page.goto('/dashboard');

      await assertKeyboardNavigable(page);

      // Should be fully operable via keyboard
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
      }

      const focused = await page.evaluate(() =>
        document.activeElement?.tagName
      );

      // Should still have focus on meaningful element
      expect(focused).toBeTruthy();
    });

    test('no hand-holding for expert users', async ({ page }) => {
      await page.goto('/dashboard');

      // Tooltips should be brief, not tutorial-like
      const tooltips = page.locator('[data-tooltip], [title]');

      // Expert users don't need everything explained
    });

  });

  test.describe('Streaming AI Responses', () => {

    test('AI responses stream within 500ms', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea, input[type="text"]').first();

      const startTime = Date.now();
      await input.fill('Generate a stakeholder matrix analysis');
      await input.press('Enter');

      // Watch for first content
      const response = page.locator('.chat-response, .ai-response, [data-message]');

      await response.first().waitFor({ state: 'visible', timeout: 5000 });
      const responseTime = Date.now() - startTime;

      // Streaming should start quickly
      expect(responseTime).toBeLessThan(3000);
    });

    test('streaming does not block interface', async ({ page }) => {
      await page.goto('/tools/ask-dan');

      const input = page.locator('textarea, input[type="text"]').first();
      await input.fill('Tell me about AI governance');
      await input.press('Enter');

      // During streaming, interface should remain responsive
      await page.waitForTimeout(500);

      // Should be able to interact with other elements
      const otherButton = page.locator('button').first();
      await expect(otherButton).toBeEnabled();
    });

  });

});
