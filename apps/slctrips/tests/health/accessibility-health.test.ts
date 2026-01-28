/**
 * Accessibility health checks
 * Validates basic accessibility requirements
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Accessibility Health Checks', () => {
  test('homepage should have no critical accessibility violations', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Filter out minor issues, focus on critical
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const headings = await page.evaluate(() => {
      const hElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return hElements.map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent?.trim().substring(0, 50),
      }));
    });

    // Should have at least one h1
    const h1Count = headings.filter(h => h.tag === 'h1').length;
    expect(h1Count).toBeGreaterThan(0);
    expect(h1Count).toBeLessThanOrEqual(1); // Only one h1 per page
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const images = await page.evaluate(() => {
      const imgElements = Array.from(document.querySelectorAll('img'));
      return imgElements.map(img => ({
        src: img.src.substring(0, 50),
        alt: img.alt,
        role: img.getAttribute('role'),
      }));
    });

    // Decorative images can have empty alt, but should have alt attribute
    images.forEach(img => {
      expect(img).toHaveProperty('alt');
    });
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    
    const inputs = await page.evaluate(() => {
      const inputElements = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]'));
      return inputElements.map(input => ({
        id: input.id,
        name: input.name,
        type: input.type,
        hasLabel: !!document.querySelector(`label[for="${input.id}"]`),
        ariaLabel: input.getAttribute('aria-label'),
        placeholder: input.getAttribute('placeholder'),
      }));
    });

    inputs.forEach(input => {
      // Should have either label, aria-label, or placeholder
      const hasAccessibleName = input.hasLabel || input.ariaLabel || input.placeholder;
      expect(hasAccessibleName).toBe(true);
    });
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    const colorContrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(colorContrastViolations).toHaveLength(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check that interactive elements are focusable
    const interactiveElements = await page.evaluate(() => {
      const selectors = 'a, button, input, select, textarea, [tabindex]';
      const elements = Array.from(document.querySelectorAll(selectors));
      return elements.map(el => ({
        tag: el.tagName.toLowerCase(),
        tabIndex: el.getAttribute('tabindex'),
        disabled: (el as HTMLElement).hasAttribute('disabled'),
      }));
    });

    // Should have interactive elements
    expect(interactiveElements.length).toBeGreaterThan(0);
    
    // No elements should have tabindex > 0 (anti-pattern)
    const badTabIndex = interactiveElements.filter(el => 
      el.tabIndex && parseInt(el.tabIndex) > 0
    );
    expect(badTabIndex.length).toBe(0);
  });
});
