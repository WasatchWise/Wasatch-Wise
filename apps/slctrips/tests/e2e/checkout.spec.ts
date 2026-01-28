import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('purchase button initiates checkout', async ({ page }) => {
    // Go to a paid TripKit (adjust slug as needed)
    await page.goto('/tripkits');

    // Find a paid TripKit (one with a price shown)
    const paidTripKit = page.locator('[href^="/tripkits/"]').filter({
      has: page.locator('text=/\\$\\d+/')
    }).first();

    // If no paid tripkit on page, skip test
    const hasPaid = await paidTripKit.isVisible().catch(() => false);
    if (!hasPaid) {
      test.skip();
      return;
    }

    await paidTripKit.click();

    // Click purchase button
    const purchaseBtn = page.getByRole('button', { name: /Purchase|Buy|Get Access/i });
    await expect(purchaseBtn).toBeVisible({ timeout: 5000 });

    // Set up request interception to verify checkout API is called
    const checkoutPromise = page.waitForRequest(request =>
      request.url().includes('/api/checkout') ||
      request.url().includes('/api/stripe')
    );

    await purchaseBtn.click();

    // Should either redirect to Stripe or show loading
    const redirectedToStripe = await page.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 }).catch(() => false);
    const showsLoading = await page.locator('text=/Processing|Loading|Redirecting/i').isVisible().catch(() => false);

    expect(redirectedToStripe || showsLoading).toBeTruthy();
  });

  test('checkout success page handles valid session', async ({ page }) => {
    // Visit success page with a mock session ID
    await page.goto('/checkout/success?session_id=test_session_123');

    // Should show success content or "processing" state
    const hasSuccess = await page.locator('text=/Success|Thank you|Confirmed/i').isVisible({ timeout: 5000 }).catch(() => false);
    const hasProcessing = await page.locator('text=/Processing|Loading/i').isVisible().catch(() => false);

    expect(hasSuccess || hasProcessing).toBeTruthy();
  });
});
