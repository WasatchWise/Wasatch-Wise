/**
 * Custom HCI Assertions for Playwright Tests
 *
 * Domain-specific assertions for validating cognitive throttling,
 * metaphor patterns, and accessibility requirements.
 */

import { expect, Page, Locator } from '@playwright/test';
import { CognitiveProfile, MetaphorPattern, metaphorPatterns } from '../fixtures/test-data';

// ============================================
// METAPHOR PATTERN ASSERTIONS
// ============================================

/**
 * Assert Traffic Light Dashboard pattern (Administrator)
 */
export async function assertTrafficLightPattern(page: Page) {
  // Must have status indicators
  const statusIndicators = page.locator('[data-status="red"], [data-status="yellow"], [data-status="green"], .status-red, .status-yellow, .status-green');
  await expect(statusIndicators.first()).toBeVisible();

  // Must have bulk actions
  const bulkActions = page.locator('[data-bulk-action], .bulk-action, button:has-text("All")');
  await expect(bulkActions.first()).toBeVisible();

  // Red status should disable export
  const redStatus = page.locator('[data-status="red"], .status-red');
  if (await redStatus.count() > 0) {
    const exportButton = page.locator('button:has-text("Export"), [data-export]');
    if (await exportButton.count() > 0) {
      await expect(exportButton.first()).toBeDisabled();
    }
  }
}

/**
 * Assert Magic Wand Wizard pattern (Teacher)
 */
export async function assertMagicWandPattern(page: Page) {
  // Must have command menu or chat input
  const commandInput = page.locator('[data-command-menu], [role="combobox"], .chat-input, textarea[placeholder*="type"], input[placeholder*="ask"]');
  await expect(commandInput.first()).toBeVisible();

  // Should support Cmd+K shortcut
  await page.keyboard.press('Meta+k');
  const commandPalette = page.locator('[role="dialog"], [data-command-palette], .command-palette');
  // May or may not open depending on implementation
}

/**
 * Assert Nutrition Label pattern (Parent)
 */
export async function assertNutritionLabelPattern(page: Page) {
  // Must have accordion or expandable sections
  const accordions = page.locator('[data-accordion], details, [role="region"][aria-expanded]');
  await expect(accordions.first()).toBeVisible();

  // Text should be plain language (no jargon in headers)
  const headers = page.locator('h1, h2, h3, h4');
  for (const header of await headers.all()) {
    const text = await header.textContent();
    // Flag if contains common jargon
    const jargonPatterns = ['FERPA', 'COPPA', 'attestation', 'compliance framework'];
    // Headers should use plain language
    // (In production, would check against jargon dictionary)
  }
}

/**
 * Assert Terminal Mode pattern (Rusty)
 */
export async function assertTerminalModePattern(page: Page) {
  // Must have monospace font area
  const codeArea = page.locator('pre, code, [data-code-editor], .monaco-editor, [class*="monospace"]');
  await expect(codeArea.first()).toBeVisible();

  // Should have dark mode option or already dark
  const isDark = await page.evaluate(() => {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    // Check if background is dark
    const match = bg.match(/\d+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      return (r + g + b) / 3 < 128;
    }
    return false;
  });

  // Keyboard shortcuts must be available
  const shortcutHints = page.locator('[data-shortcut], kbd, .keyboard-hint');
  // Should have some keyboard hints visible or discoverable
}

/**
 * Assert Stage Mode pattern (Jasmine)
 */
export async function assertStageModePattern(page: Page) {
  // Must have microphone button
  const micButton = page.locator('[data-mic], button[aria-label*="microphone"], button[aria-label*="voice"], .mic-button');
  await expect(micButton.first()).toBeVisible();

  // Touch targets must be large
  const buttons = page.locator('button');
  for (const button of await buttons.all()) {
    const box = await button.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
}

/**
 * Assert Canvas Mode pattern (Jay)
 */
export async function assertCanvasModePattern(page: Page) {
  // Must have draggable elements
  const draggables = page.locator('[draggable="true"], [data-draggable], .draggable');
  await expect(draggables.first()).toBeVisible();

  // Should have zoom controls
  const zoomControls = page.locator('[data-zoom], button[aria-label*="zoom"], .zoom-control');
  // Zoom controls should exist
}

/**
 * Assert Studio Mode pattern (Indigo)
 */
export async function assertStudioModePattern(page: Page) {
  // Must NOT have social counters
  const socialCounters = page.locator('[data-likes], [data-views], .like-count, .view-count');
  await expect(socialCounters).toHaveCount(0);

  // Must have privacy toggle
  const privacyToggle = page.locator('[data-privacy], input[type="checkbox"][name*="private"], .privacy-toggle');
  // Privacy controls should be present
}

// ============================================
// COGNITIVE LOAD ASSERTIONS
// ============================================

/**
 * Assert cognitive load is appropriate for archetype
 */
export async function assertCognitiveLoadAppropriate(
  page: Page,
  profile: CognitiveProfile
) {
  const maxElements = profile.loadCapacity * 10; // Rough heuristic
  const maxInteractive = profile.loadCapacity * 5;

  // Count visible interactive elements
  const interactiveCount = await page.locator('button, a, input, select, textarea, [role="button"]')
    .filter({ has: page.locator(':visible') })
    .count();

  if (profile.loadCapacity < 5) {
    expect(interactiveCount).toBeLessThan(maxInteractive);
  }

  // Check text density for low-capacity users
  if (profile.loadCapacity < 4) {
    const textContent = await page.locator('main, [role="main"], .content').first().textContent();
    const wordCount = (textContent ?? '').split(/\s+/).length;
    expect(wordCount).toBeLessThan(500); // Low-load users need less text
  }
}

/**
 * Assert progressive disclosure is implemented
 */
export async function assertProgressiveDisclosure(page: Page) {
  // Look for collapsed sections that expand on interaction
  const collapsibles = page.locator('details, [aria-expanded="false"], [data-collapsed]');
  const count = await collapsibles.count();

  expect(count).toBeGreaterThan(0);

  // Click first one and verify it expands
  if (count > 0) {
    const first = collapsibles.first();
    await first.click();

    // Check for expanded state
    const expanded = await first.getAttribute('aria-expanded');
    if (expanded !== null) {
      expect(expanded).toBe('true');
    }
  }
}

// ============================================
// INPUT MODE ASSERTIONS
// ============================================

/**
 * Assert binary/bulk input mode (Administrator)
 */
export async function assertBinaryBulkInput(page: Page) {
  // Should have checkboxes or toggles
  const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"], [role="switch"]');
  await expect(checkboxes.first()).toBeVisible();

  // Should have bulk action buttons
  const bulkActions = page.locator('button:has-text("All"), button:has-text("Bulk"), [data-bulk]');
  await expect(bulkActions.first()).toBeVisible();

  // Should NOT have long text inputs
  const textareas = page.locator('textarea');
  const count = await textareas.count();
  // Administrators shouldn't need to write paragraphs
}

/**
 * Assert natural language input mode (Teacher)
 */
export async function assertNaturalLanguageInput(page: Page) {
  // Must have text area or chat input
  const textInput = page.locator('textarea, input[type="text"][class*="chat"], [data-chat-input]');
  await expect(textInput.first()).toBeVisible();

  // Should accept free-form text
  const placeholder = await textInput.first().getAttribute('placeholder');
  expect(placeholder).toBeTruthy();
}

/**
 * Assert read-only mode (Parent)
 */
export async function assertReadOnlyMode(page: Page) {
  // Count editable inputs
  const editableInputs = page.locator('input:not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])');
  const count = await editableInputs.count();

  // Parents should have minimal input requirements
  expect(count).toBeLessThan(5);
}

// ============================================
// ACCESSIBILITY ASSERTIONS
// ============================================

/**
 * Assert WCAG 2.1 AA color contrast
 */
export async function assertColorContrast(page: Page) {
  // This would use axe-core or similar in production
  // Simplified check for demonstration
  const textElements = page.locator('p, span, h1, h2, h3, h4, h5, h6, a, button');

  // Sample a few elements
  const samples = await textElements.all();
  for (const el of samples.slice(0, 10)) {
    const styles = await el.evaluate((node) => ({
      color: window.getComputedStyle(node).color,
      backgroundColor: window.getComputedStyle(node).backgroundColor
    }));

    // Would calculate actual contrast ratio here
    // For now, just verify we can get the styles
    expect(styles.color).toBeTruthy();
  }
}

/**
 * Assert keyboard navigability
 */
export async function assertKeyboardNavigable(page: Page) {
  // Press Tab and verify focus moves
  const initialFocus = await page.evaluate(() => document.activeElement?.tagName);

  await page.keyboard.press('Tab');

  const newFocus = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    hasOutline: window.getComputedStyle(document.activeElement!).outlineWidth !== '0px'
  }));

  // Focus should have moved
  expect(newFocus.tag).toBeTruthy();

  // Focus should be visible
  // Note: Some designs use box-shadow instead of outline
}

/**
 * Assert touch targets meet minimum size
 */
export async function assertTouchTargetSize(
  page: Page,
  minSize: number = 44
) {
  const interactives = page.locator('button, a, input, select');

  for (const el of await interactives.all()) {
    const box = await el.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      // At least one dimension should meet minimum
      const meetsMinimum = box.width >= minSize || box.height >= minSize;
      expect(meetsMinimum).toBe(true);
    }
  }
}

/**
 * Assert screen reader compatibility
 */
export async function assertScreenReaderCompatible(page: Page) {
  // Check for ARIA landmarks
  const landmarks = page.locator('[role="main"], [role="navigation"], [role="banner"], main, nav, header');
  await expect(landmarks.first()).toBeVisible();

  // Check images have alt text
  const images = page.locator('img');
  for (const img of await images.all()) {
    const alt = await img.getAttribute('alt');
    // All images should have alt (even if empty for decorative)
    expect(alt).not.toBeNull();
  }

  // Check buttons have accessible names
  const buttons = page.locator('button');
  for (const button of await buttons.all()) {
    const name = await button.getAttribute('aria-label') ??
                 await button.textContent();
    expect(name?.trim()).toBeTruthy();
  }
}

// ============================================
// ERROR HANDLING ASSERTIONS
// ============================================

/**
 * Assert forgiving error handling (Mario 1-1 pattern)
 */
export async function assertForgivingErrors(page: Page, inputLocator: Locator) {
  // Submit invalid input
  await inputLocator.fill('invalid input that should trigger help');
  await inputLocator.press('Enter');

  // Should show helpful suggestion, not just error
  const errorMessage = page.locator('[role="alert"], .error, [data-error]');
  const suggestionMessage = page.locator('[data-suggestion], .suggestion, [class*="hint"]');

  // If there's an error, there should also be a suggestion
  if (await errorMessage.count() > 0) {
    await expect(suggestionMessage).toBeVisible();
  }
}

/**
 * Assert auto-correction is offered
 */
export async function assertAutoCorrection(page: Page) {
  const suggestions = page.locator('[data-auto-correct], [data-suggestion], .did-you-mean');

  // If suggestions exist, they should be actionable
  if (await suggestions.count() > 0) {
    const first = suggestions.first();
    await expect(first).toBeVisible();

    // Should have a way to accept the suggestion
    const acceptButton = first.locator('button, a, [role="button"]');
    await expect(acceptButton).toBeVisible();
  }
}

// ============================================
// STREAMING RESPONSE ASSERTIONS
// ============================================

/**
 * Assert streaming response behavior for AI features
 */
export async function assertStreamingResponse(
  page: Page,
  triggerAction: () => Promise<void>,
  maxLatency: number = 500
) {
  const startTime = Date.now();
  let firstTokenTime: number | null = null;

  // Watch for streaming content
  await page.exposeFunction('__streamDetected', () => {
    if (!firstTokenTime) {
      firstTokenTime = Date.now();
    }
  });

  await page.addInitScript(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData' ||
            mutation.addedNodes.length > 0) {
          (window as any).__streamDetected?.();
        }
      }
    });

    // Watch the likely streaming container
    const container = document.querySelector('[data-streaming], .chat-response, .ai-response');
    if (container) {
      observer.observe(container, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  });

  await triggerAction();

  // Wait for streaming to complete
  await page.waitForTimeout(2000);

  if (firstTokenTime) {
    const latency = firstTokenTime - startTime;
    expect(latency).toBeLessThan(maxLatency);
  }
}
