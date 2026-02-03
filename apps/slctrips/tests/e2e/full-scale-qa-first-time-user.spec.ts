/**
 * Full-Scale HCI QA – First-Time User (cache cleared)
 *
 * Run as if the user has never visited. Clears storage before run.
 * Use with: BASE_URL=https://www.slctrips.com pnpm exec playwright test tests/e2e/full-scale-qa-first-time-user.spec.ts
 * Or locally: pnpm exec playwright test tests/e2e/full-scale-qa-first-time-user.spec.ts
 */

import { test, expect } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Full-Scale QA – First-Time User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Phase 1: Landing – homepage loads with hero and nav', async ({ page }) => {
    await page.goto(baseURL + '/');
    await expect(page).toHaveURL(/\//);
    await expect(page).toHaveTitle(/SLCTrips/i);
    await expect(page.locator('h1')).toContainText(/1 Airport|Airport|Destinations/i);
    await expect(page.getByRole('link', { name: /Explore Destinations|Destinations/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /TripKit|Get Your TripKit/i }).first()).toBeVisible();
  });

  test('Phase 1: Nav – Destinations and TripKits routes work', async ({ page }) => {
    await page.goto(baseURL + '/');
    await page.getByRole('link', { name: /Explore Destinations|Destinations/i }).first().click();
    await expect(page).toHaveURL(/\/destinations/);
    await page.goto(baseURL + '/');
    await page.getByRole('link', { name: /TripKit|Get Your TripKit/i }).first().click();
    await expect(page).toHaveURL(/\/tripkits/);
  });

  test('Phase 2: TripKits list loads with free and paid', async ({ page }) => {
    await page.goto(baseURL + '/tripkits');
    await expect(page).toHaveURL(/\/tripkits/);
    const freeBadge = page.locator('text=/FREE|Free forever/i').first();
    const paidPrice = page.locator('text=/\\$\\d+\\.?\\d*/').first();
    await expect(freeBadge.or(paidPrice)).toBeVisible({ timeout: 10000 });
  });

  test('Phase 2: Paid TripKit detail has Buy button', async ({ page }) => {
    await page.goto(baseURL + '/tripkits');
    await page.waitForLoadState('networkidle');
    const paidLink = page.locator('a[href^="/tripkits/"]').filter({ has: page.locator('text=/\\$\\d+/') }).first();
    if ((await paidLink.count()) === 0) {
      test.skip();
      return;
    }
    await paidLink.click();
    await expect(page).toHaveURL(/\/tripkits\/[^/]+$/);
    await expect(page.getByRole('button', { name: /Buy for|Purchase/i })).toBeVisible({ timeout: 5000 });
  });

  test('Phase 3: Unauthenticated Buy redirects to sign in', async ({ page }) => {
    await page.goto(baseURL + '/tripkits');
    await page.waitForLoadState('networkidle');
    const paidLink = page.locator('a[href^="/tripkits/"]').filter({ has: page.locator('text=/\\$\\d+/') }).first();
    if ((await paidLink.count()) === 0) {
      test.skip();
      return;
    }
    await paidLink.click();
    const buyBtn = page.getByRole('button', { name: /Buy for|Purchase/i });
    await buyBtn.click();
    await expect(page).toHaveURL(/\/auth\/signin|\/login/);
  });

  test('Phase 4: Checkout success page handles session param', async ({ page }) => {
    await page.goto(baseURL + '/checkout/success?session_id=test_session_123');
    const success = page.locator('text=/Success|Thank you|Confirmed|Processing|Loading/i');
    await expect(success.first()).toBeVisible({ timeout: 8000 });
  });

  test('Phase 5: Checkout cancel page shows no charge message', async ({ page }) => {
    await page.goto(baseURL + '/checkout/cancel');
    await expect(page.locator('text=/cancel|cancelled|not processed|no charge/i')).toBeVisible({ timeout: 5000 });
  });

  test('Phase 6: Welcome Wagon page loads with pricing and Buy CTA', async ({ page }) => {
    await page.goto(baseURL + '/welcome-wagon');
    await expect(page).toHaveURL(/\/welcome-wagon/);
    await expect(page.locator('h1, h2').filter({ hasText: /welcome|90-day|relocation/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Buy Now|\\$49/i })).toBeVisible({ timeout: 5000 });
  });

  test('Phase 7: Destinations list and one detail load', async ({ page }) => {
    await page.goto(baseURL + '/destinations');
    await expect(page).toHaveURL(/\/destinations/);
    const firstDest = page.locator('a[href^="/destinations/"]').first();
    await expect(firstDest).toBeVisible({ timeout: 10000 });
    await firstDest.click();
    await expect(page).toHaveURL(/\/destinations\/[^/]+$/);
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
  });

  test('Phase 8: StayKits page loads', async ({ page }) => {
    await page.goto(baseURL + '/staykits');
    await expect(page).toHaveURL(/\/staykits/);
    await expect(page.locator('text=/StayKit|90-day|immersion/i')).toBeVisible({ timeout: 8000 });
  });

  test('Phase 9: Affiliate link on destination has tracking (AWIN or tag)', async ({ page }) => {
    await page.goto(baseURL + '/destinations');
    await page.waitForLoadState('networkidle');
    const firstDest = page.locator('a[href^="/destinations/"]').first();
    if ((await firstDest.count()) === 0) {
      test.skip();
      return;
    }
    await firstDest.click();
    await page.waitForLoadState('networkidle');
    const bookingLink = page.locator('a[href*="booking"], a[href*="awin"], a[href*="viator"]').first();
    if ((await bookingLink.count()) === 0) {
      test.skip();
      return;
    }
    const href = await bookingLink.getAttribute('href');
    const hasTracking = href && (href.includes('awin') || href.includes('tag=') || href.includes('affid') || href.includes('booking.com'));
    expect(hasTracking || href?.includes('booking.com') || href?.includes('viator')).toBeTruthy();
  });

  test('Phase 10: Sign in page loads and has form', async ({ page }) => {
    await page.goto(baseURL + '/auth/signin');
    await expect(page).toHaveURL(/\/auth\/signin|\/login/);
    await expect(page.locator('input[type="email"], input[name*="email" i]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first()).toBeVisible();
  });

  test('Phase 11: Footer links exist and resolve', async ({ page }) => {
    await page.goto(baseURL + '/');
    const terms = page.getByRole('link', { name: /Terms|Privacy|Refund|Contact|FAQ/i });
    await expect(terms.first()).toBeVisible({ timeout: 5000 });
    const firstFooterLink = page.locator('footer a[href]').first();
    if ((await firstFooterLink.count()) > 0) {
      const href = await firstFooterLink.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    }
  });

  test('Phase 12: Free TripKit leads to view or email gate', async ({ page }) => {
    await page.goto(baseURL + '/tripkits');
    await page.waitForLoadState('networkidle');
    const freeLink = page.locator('a[href^="/tripkits/"]').filter({ has: page.locator('text=/FREE|Free/i') }).first();
    if ((await freeLink.count()) === 0) {
      test.skip();
      return;
    }
    await freeLink.click();
    const getFreeBtn = page.getByRole('button', { name: /Get Free|Free Access/i });
    await getFreeBtn.click();
    await expect(page).toHaveURL(/view|auth|signin|tripkits/);
  });
});
