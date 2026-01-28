import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa']) // WCAG 2.0 Level A and AA
      .analyze();

    // Filter to only critical and serious violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    // Log violations for debugging
    if (criticalViolations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(criticalViolations, null, 2));
    }

    expect(criticalViolations).toEqual([]);
  });

  test('tripkits page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/tripkits');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalViolations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(criticalViolations, null, 2));
    }

    expect(criticalViolations).toEqual([]);
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // H1 should come before any h2
    const firstH1 = await page.locator('h1').first().boundingBox();
    const firstH2 = await page.locator('h2').first().boundingBox();

    if (firstH1 && firstH2) {
      expect(firstH1.y).toBeLessThan(firstH2.y);
    }
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    await page.keyboard.press('Tab');

    // First focusable element should be visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing - should reach main navigation
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Should still have a focused element
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all images
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');

      // Every image should have an alt attribute (can be empty for decorative)
      expect(alt, `Image ${src} missing alt attribute`).not.toBeNull();
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/auth/signin');

    // Find all inputs
    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have some form of label
      const hasLabel = id && await page.locator(`label[for="${id}"]`).count() > 0;
      const hasAccessibleName = ariaLabel || ariaLabelledBy || hasLabel || placeholder;

      expect(hasAccessibleName, `Input missing accessible name`).toBeTruthy();
    }
  });
});
