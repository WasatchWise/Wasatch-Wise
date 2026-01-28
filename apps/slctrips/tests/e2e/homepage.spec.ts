import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads successfully with key elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/SLCTrips/i);

    // Check hero section
    await expect(page.locator('h1')).toContainText('1 Airport');

    // Check navigation links
    await expect(page.getByRole('link', { name: /Explore Destinations/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /TripKit/i })).toBeVisible();
  });

  test('weekly picks section loads', async ({ page }) => {
    // Wait for weekly picks to load (skeleton should disappear)
    await expect(page.locator('text=This Week\'s Picks')).toBeVisible();

    // Either content loads or empty state shows
    const hasContent = await page.locator('[href^="/destinations/"]').first().isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=No Picks Available').isVisible().catch(() => false);

    expect(hasContent || hasEmptyState).toBeTruthy();
  });

  test('navigation to destinations works', async ({ page }) => {
    await page.getByRole('link', { name: /Explore Destinations/i }).click();
    await expect(page).toHaveURL(/\/destinations/);
  });

  test('navigation to tripkits works', async ({ page }) => {
    await page.getByRole('link', { name: /TripKit/i }).first().click();
    await expect(page).toHaveURL(/\/tripkits/);
  });

  test('bullseye target rings are clickable', async ({ page }) => {
    // Check that drive time buttons exist
    await expect(page.getByRole('link', { name: /30 min/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /90 min/i })).toBeVisible();
  });
});
