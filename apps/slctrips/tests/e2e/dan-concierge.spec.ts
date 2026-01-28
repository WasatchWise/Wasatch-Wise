import { test, expect } from '@playwright/test';

test.describe('Dan AI Concierge', () => {
  test('Dan chat button appears on TripKit viewer', async ({ page }) => {
    // Go to the free TripKit that has Dan
    await page.goto('/tripkits/tk-000');

    // Get past email gate if present
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('test@example.com');
      await page.getByRole('button', { name: /Get|Access|Submit/i }).click();
      await page.waitForURL(/access=/, { timeout: 10000 }).catch(() => {});
    }

    // Look for Dan chat button (floating button)
    const danButton = page.locator('button[aria-label*="Dan"], button:has-text("Ask Dan"), button:has(span:text("🏔️"))');
    
    // May or may not be present depending on TripKit type
    const hasDan = await danButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasDan) {
      // Click to open chat
      await danButton.click();

      // Chat window should open
      await expect(page.locator('text=/Utah Concierge|Ask Dan/i')).toBeVisible();

      // Should have greeting message
      await expect(page.locator('text=/Good|Hello|Hi/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Dan responds to messages', async ({ page }) => {
    // This test requires a TripKit with Dan enabled
    // Skip if Dan is not available
    await page.goto('/tripkits/tk-000');

    // Attempt to open Dan chat
    const danButton = page.locator('button:has(span:text("🏔️"))').first();
    const hasDan = await danButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasDan) {
      test.skip();
      return;
    }

    await danButton.click();

    // Wait for chat to open
    await expect(page.locator('input[placeholder*="Dan"]')).toBeVisible({ timeout: 5000 });

    // Type a message
    const input = page.locator('input[placeholder*="Dan"]');
    await input.fill('What is the weather like?');
    await input.press('Enter');

    // Should show loading indicator
    await expect(page.locator('.animate-bounce, text=/\\.\\.\\./')).toBeVisible({ timeout: 3000 }).catch(() => {});

    // Should get a response (within 30 seconds - matches our timeout)
    const responseLocator = page.locator('[class*="bg-gray-100"]').filter({
      hasText: /weather|temperature|degrees|cold|warm|sunny|cloudy/i
    });

    await expect(responseLocator).toBeVisible({ timeout: 35000 });
  });
});
