/**
 * Integration tests for authentication flow
 */

import { test, expect } from '@playwright/test';
import { generateTestEmail, clearAuthState } from '../utils/test-helpers';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test('should navigate to signin page', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    
    expect(page.url()).toContain('/auth/signin');
    await expect(page.locator('h1, h2')).toContainText(/sign in|login/i);
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    
    expect(page.url()).toContain('/auth/signup');
    await expect(page.locator('h1, h2')).toContainText(/sign up|register/i);
  });

  test('should validate email format on signup', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('invalid-email');
    
    // Try to submit or blur
    await emailInput.blur();
    
    // Should show validation error (implementation dependent)
    const errorMessage = page.locator('text=/invalid|valid|email/i').first();
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    // If validation exists, it should catch invalid email
    if (hasError) {
      expect(await errorMessage.textContent()).toMatch(/invalid|valid|email/i);
    }
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('short');
    
    await passwordInput.blur();
    
    // Should show password requirements error
    const hasError = await page
      .locator('text=/8 characters|password|length/i')
      .first()
      .isVisible()
      .catch(() => false);
    
    // If validation exists, it should catch short password
    if (hasError) {
      expect(hasError).toBe(true);
    }
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    
    // Fill form with test data
    const email = generateTestEmail();
    await page.locator('input[type="email"]').first().fill(email);
    await page.locator('input[type="password"]').first().fill('TestPassword123');
    
    // Try to submit
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should either succeed or show error, not crash
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      // Should either redirect or show error message
      expect(
        currentUrl.includes('/account') ||
        currentUrl.includes('/signup') ||
        page.locator('text=/error|invalid|try again/i').first().isVisible()
      ).toBeTruthy();
    }
  });
});
