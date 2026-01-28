/**
 * DAROS Persona Actions
 *
 * Defines HOW each persona interacts based on their:
 * - scanPattern: How they visually search for information
 * - decisionStyle: How they approach decisions
 * - preferredContentFormat: What content types resonate
 * - toleranceForComplexity: How much friction they'll accept
 *
 * This transforms abstract persona definitions into concrete test behaviors.
 */

import { Page, expect, Locator } from '@playwright/test';
import { Persona } from './fixtures/personas';
import { cognitiveProfiles, InputMode, OutputMode } from './fixtures/test-data';

/**
 * PersonaActor - Simulates persona-specific interactions
 *
 * Usage:
 *   const actor = new PersonaActor(page, superintendentPersona);
 *   await actor.findInformation('[data-risk-status]', 'Risk Status');
 *   await actor.makeDecision('button:has-text("Export")');
 */
export class PersonaActor {
  private page: Page;
  private persona: Persona;
  private profile: typeof cognitiveProfiles[keyof typeof cognitiveProfiles];

  constructor(page: Page, persona: Persona) {
    this.page = page;
    this.persona = persona;
    this.profile = cognitiveProfiles[persona.archetype] || cognitiveProfiles.parent;
  }

  /**
   * Get the persona's expected input mode
   */
  get inputMode(): InputMode {
    return this.profile?.inputMode || 'read-only';
  }

  /**
   * Get the persona's expected output mode
   */
  get outputMode(): OutputMode {
    return this.profile?.outputMode || 'nutrition-label';
  }

  /**
   * Simulates how this persona finds information based on their scan pattern.
   *
   * Scan Patterns:
   * - F-pattern: Quick horizontal scans at top, then down left side (Superintendent)
   * - commitment: Thorough, methodical reading (IT Director, Consultant)
   * - spotted: Keyword scanning, chaotic pattern (Teacher, Parent)
   * - layer-cake: Scan headings/subheadings only (Board Member)
   */
  async findInformation(selector: string, label: string): Promise<void> {
    console.log(
      `[DAROS Actor] ${this.persona.name} scanning for "${label}" using ${this.persona.scanPattern} pattern`
    );

    const element = this.page.locator(selector);

    switch (this.persona.scanPattern) {
      case 'F-pattern':
        // Superintendents scan headers and left-aligned text quickly.
        // They expect key info in the top-left quadrant.
        // Check if multiple elements match
        const count = await element.count();
        if (count > 1) {
          console.log(`[DAROS Actor] Found ${count} elements for "${label}", verifying first one...`);
          await expect(element.first()).toBeVisible({ timeout: 2000 });
        } else {
          await expect(element).toBeVisible({ timeout: 2000 });
        }

        // Simulate quick, non-thorough scan
        await this.page.waitForTimeout(300);

        // Verify it's in a prominent position (simplified check)
        const fBox = await (count > 1 ? element.first() : element).boundingBox();
        if (fBox && this.persona.toleranceForComplexity === 'low') {
          // Should be in upper portion of viewport
          if (fBox.y > 600) {
            console.warn(
              `[DAROS Actor ⚠️] "${label}" at y=${fBox.y}px may be too far down for F-pattern scanner`
            );
          }
        }
        break;

      case 'commitment':
        // IT Directors/Consultants read methodically and thoroughly.
        // They scroll, hover, and examine details.
        await element.scrollIntoViewIfNeeded();
        await element.hover();

        // Simulate thorough reading
        await this.page.waitForTimeout(1200);

        // They may check related elements
        const parent = element.locator('..');
        const siblings = parent.locator('> *');
        console.log(
          `[DAROS Actor] Commitment reader examining ${await siblings.count()} sibling elements`
        );
        break;

      case 'spotted':
        // Teachers/Parents scan chaotically for keywords.
        // They move mouse erratically looking for triggers.
        await this.simulateSpottedScanning();

        // Then lock onto target
        await element.hover();
        await this.page.waitForTimeout(600);
        break;

      case 'layer-cake':
        // Board members scan headings and subheadings only.
        // Content must be under clear header hierarchy.
        const nearbyHeading = this.page.locator(
          `h1:has-text("${label}"), h2:has-text("${label}"), h3:has-text("${label}"), h4:has-text("${label}")`
        );

        if ((await nearbyHeading.count()) > 0) {
          await expect(nearbyHeading.first()).toBeVisible();
        } else {
          // Element should at least be near a heading
          await element.scrollIntoViewIfNeeded();
        }

        await this.page.waitForTimeout(800);
        break;
    }

    // Universal check: Low complexity tolerance requires above-the-fold visibility
    if (this.persona.toleranceForComplexity === 'low') {
      try {
        await expect(element).toBeInViewport({ timeout: 1000 });
      } catch {
        console.warn(
          `[DAROS Actor ⚠️] "${label}" not in viewport for low-complexity-tolerance persona`
        );
      }
    }
  }

  /**
   * Simulates making a decision (clicking a primary action).
   *
   * Decision Styles:
   * - quick: Click almost immediately (Teacher)
   * - deliberate: Hover, hesitate, then click (Superintendent, IT Director)
   * - consensus-seeking: Look around for confirmation before clicking (Board Member)
   */
  async makeDecision(selector: string): Promise<void> {
    console.log(
      `[DAROS Actor] ${this.persona.name} making decision with ${this.persona.decisionStyle} style`
    );

    const element = this.page.locator(selector);

    switch (this.persona.decisionStyle) {
      case 'quick':
        // Quick decision makers click almost instantly
        await element.click();
        break;

      case 'deliberate':
        // Deliberate decision makers hover and hesitate
        await element.hover();
        await this.page.waitForTimeout(800);

        // May check for confirmation text nearby
        const confirmText = this.page.locator(
          ':has-text("Are you sure"), :has-text("This will"), :has-text("Warning")'
        );
        if ((await confirmText.count()) > 0) {
          await this.page.waitForTimeout(500);
        }

        await element.click();
        break;

      case 'consensus-seeking':
        // Consensus seekers look around for validation
        await element.hover();
        await this.page.waitForTimeout(600);

        // Check for supporting info
        const supportingInfo = this.page.locator(
          '.description, .helper-text, [data-info], .tooltip'
        );
        if ((await supportingInfo.count()) > 0) {
          await supportingInfo.first().hover();
          await this.page.waitForTimeout(400);
        }

        // Return to button and click
        await element.hover();
        await this.page.waitForTimeout(300);
        await element.click();
        break;
    }
  }

  /**
   * Verifies content matches persona's preferred format.
   */
  async verifyContentFormat(container: Locator): Promise<void> {
    const formats = this.persona.preferredContentFormat;
    console.log(
      `[DAROS Actor] Verifying content format for ${this.persona.name}: prefers ${formats.join(', ')}`
    );

    // Check for preferred formats
    let hasPreferredFormat = false;

    if (formats.includes('checklist')) {
      const lists = container.locator('ul, ol, [role="list"], input[type="checkbox"]');
      if ((await lists.count()) > 0) hasPreferredFormat = true;
    }

    if (formats.includes('visual')) {
      const visuals = container.locator(
        'svg, canvas, img, [data-chart], .chart, [class*="graph"], [class*="status-"]'
      );
      if ((await visuals.count()) > 0) hasPreferredFormat = true;
    }

    if (formats.includes('video')) {
      const videos = container.locator('video, iframe[src*="youtube"], [data-video]');
      if ((await videos.count()) > 0) hasPreferredFormat = true;
    }

    if (formats.includes('text')) {
      const text = container.locator('p, article, .text-content');
      if ((await text.count()) > 0) hasPreferredFormat = true;
    }

    if (!hasPreferredFormat) {
      console.warn(
        `[DAROS Actor ⚠️] Content may not match ${this.persona.name}'s preferred formats: ${formats.join(', ')}`
      );
    }
  }

  /**
   * Simulates a confused navigation pattern to test help system.
   */
  async simulateConfusion(): Promise<void> {
    console.log(`[DAROS Actor] Simulating confusion for ${this.persona.name}...`);

    // Click around without purpose
    const tabs = this.page.locator('[role="tab"], .tab, button');
    const tabCount = await tabs.count();

    for (let i = 0; i < Math.min(3, tabCount); i++) {
      await tabs.nth(i % tabCount).click().catch(() => { });
      await this.page.waitForTimeout(150);
    }

    // Move mouse erratically
    await this.simulateSpottedScanning();

    console.log(`[DAROS Actor] Confusion simulation complete`);
  }

  /**
   * Uses the persona's expected input mode.
   */
  async provideInput(inputLocator: Locator, value: string): Promise<void> {
    console.log(
      `[DAROS Actor] ${this.persona.name} providing input using ${this.inputMode} mode`
    );

    switch (this.inputMode) {
      case 'binary-bulk':
        // Administrator: expects checkboxes/toggles
        const checkbox = inputLocator.locator('input[type="checkbox"]');
        if ((await checkbox.count()) > 0) {
          await checkbox.click();
        } else {
          await inputLocator.click();
        }
        break;

      case 'natural-language':
        // Teacher: types conversationally
        await inputLocator.fill(value);
        await inputLocator.press('Enter');
        break;

      case 'read-only':
        // Parent: minimal input
        console.log(`[DAROS Actor] Read-only persona; skipping input`);
        break;

      case 'code-first':
        // Rusty: keyboard-centric
        await inputLocator.focus();
        await this.page.keyboard.type(value, { delay: 30 });
        await this.page.keyboard.press('Control+Enter');
        break;

      case 'voice-first':
        // Jasmine: would click mic (simulated as click + text)
        const micButton = this.page.locator('[data-mic], button[aria-label*="voice"]');
        if ((await micButton.count()) > 0) {
          await micButton.click();
        }
        await inputLocator.fill(value);
        break;

      default:
        await inputLocator.fill(value);
    }
  }

  /**
   * Waits for response in persona's expected output format.
   */
  async waitForResponse(responseLocator: Locator): Promise<void> {
    console.log(
      `[DAROS Actor] ${this.persona.name} expecting response in ${this.outputMode} format`
    );

    switch (this.outputMode) {
      case 'traffic-light':
        // Administrator expects status colors
        await expect(
          responseLocator.locator('[data-status], [class*="status-"], [class*="red"], [class*="yellow"], [class*="green"]')
        ).toBeVisible({ timeout: 5000 });
        break;

      case 'streaming-text':
        // Teacher/Consultant expects streaming
        await expect(responseLocator).toBeVisible({ timeout: 5000 });
        // Would track content growth for streaming
        break;

      case 'nutrition-label':
        // Parent expects plain English
        await expect(responseLocator).toBeVisible({ timeout: 5000 });
        break;

      case 'syntax-highlight':
        // Rusty expects code
        await expect(
          responseLocator.locator('pre, code, [class*="syntax"]')
        ).toBeVisible({ timeout: 5000 });
        break;

      case 'video-avatar':
        // Jasmine expects audio/video
        await expect(
          responseLocator.locator('audio, video, [data-avatar]')
        ).toBeVisible({ timeout: 10000 });
        break;

      default:
        await expect(responseLocator).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Simulates the "spotted" scanning pattern (chaotic mouse movement).
   */
  private async simulateSpottedScanning(): Promise<void> {
    const viewport = this.page.viewportSize() || { width: 1024, height: 768 };

    // Erratic mouse movements simulating scanning for keywords
    const points = [
      { x: viewport.width * 0.2, y: viewport.height * 0.3 },
      { x: viewport.width * 0.7, y: viewport.height * 0.2 },
      { x: viewport.width * 0.3, y: viewport.height * 0.6 },
      { x: viewport.width * 0.8, y: viewport.height * 0.5 },
      { x: viewport.width * 0.1, y: viewport.height * 0.8 },
    ];

    for (const point of points) {
      await this.page.mouse.move(point.x, point.y, { steps: 3 });
      await this.page.waitForTimeout(100);
    }
  }
}

/**
 * Factory function to create a PersonaActor for the given archetype.
 */
export function createActor(page: Page, persona: Persona): PersonaActor {
  return new PersonaActor(page, persona);
}

/**
 * Assertion helper: Verify element is appropriate for persona's complexity tolerance.
 */
export async function assertComplexityAppropriate(
  page: Page,
  persona: Persona,
  containerSelector: string
): Promise<void> {
  const container = page.locator(containerSelector);
  const interactives = container.locator('button, a, input, select, textarea');
  const count = await interactives.count();

  const limits = {
    low: 10,
    moderate: 20,
    high: 50,
  };

  const limit = limits[persona.toleranceForComplexity];

  if (count > limit) {
    console.warn(
      `[DAROS] Container has ${count} interactive elements; exceeds ${persona.toleranceForComplexity} tolerance limit of ${limit}`
    );
  }

  expect(count).toBeLessThanOrEqual(limit * 1.5); // 50% buffer before hard fail
}
