import { test, expect } from '@playwright/test';

test.describe('TripKits', () => {
  test('tripkits page loads with available kits', async ({ page }) => {
    await page.goto('/tripkits');

    // Check page loaded
    await expect(page.locator('h1')).toContainText(/TripKit/i);

    // Should have at least one TripKit card
    await expect(page.locator('[href^="/tripkits/"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('tripkit detail page loads', async ({ page }) => {
    await page.goto('/tripkits');

    // Click first TripKit
    const firstTripKit = page.locator('[href^="/tripkits/"]').first();
    await firstTripKit.click();

    // Should be on detail page
    await expect(page.url()).toMatch(/\/tripkits\/[a-z0-9-]+$/);

    // Should have purchase or access button
    const hasPurchase = await page.getByRole('button', { name: /Purchase|Buy|Get/i }).isVisible().catch(() => false);
    const hasAccess = await page.getByRole('link', { name: /Access|View|Open/i }).isVisible().catch(() => false);
    const hasFree = await page.locator('text=/free/i').isVisible().catch(() => false);

    expect(hasPurchase || hasAccess || hasFree).toBeTruthy();
  });

  test('free tripkit (TK-000) can be accessed', async ({ page }) => {
    await page.goto('/tripkits/tk-000');

    // Should show Meet the Guardians or similar content
    await expect(page.locator('h1')).toBeVisible();

    // Should have access button or email gate
    const hasAccess = await page.getByRole('link', { name: /Access|View|Start/i }).isVisible().catch(() => false);
    const hasEmailGate = await page.locator('input[type="email"]').isVisible().catch(() => false);

    expect(hasAccess || hasEmailGate).toBeTruthy();
  });
});
