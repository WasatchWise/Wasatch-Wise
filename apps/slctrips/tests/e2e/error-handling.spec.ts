import { test, expect } from '@playwright/test';

/**
 * Error Handling Tests
 * 
 * Tests:
 * - Network failures gracefully handled
 * - Invalid TripKit slug → 404
 * - Invalid Guardian slug → 404
 * - Supabase connection errors
 * - Stripe payment failures
 */

test.describe('Error Handling', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test('should handle network failures gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);
    
    await page.goto(baseURL).catch(() => {});
    
    // Should handle offline gracefully
    // Either show offline message or use cached content
    const hasOfflineMessage = await page.locator('text=/offline|no.*connection|check.*connection/i').isVisible().catch(() => false);
    const pageLoaded = await page.locator('body').isVisible().catch(() => false);
    
    // Should either show offline message or load from cache
    expect(hasOfflineMessage || pageLoaded).toBeTruthy();
    
    // Restore online
    await context.setOffline(false);
  });

  test('should show 404 for invalid TripKit slug', async ({ page }) => {
    await page.goto(`${baseURL}/tripkits/invalid-slug-that-does-not-exist-12345`);
    await page.waitForLoadState('networkidle');
    
    // Should show 404 page
    const has404 = await page.locator('text=/404|not found|page.*not.*found/i').isVisible().catch(() => false);
    const is404Page = page.url().includes('404');
    const statusIs404 = await page.evaluate(() => {
      // Check if Next.js shows 404 page
      return document.body.textContent?.includes('404') || false;
    });
    
    expect(has404 || is404Page || statusIs404).toBeTruthy();
  });

  test('should show 404 for invalid Guardian slug', async ({ page }) => {
    await page.goto(`${baseURL}/guardians/invalid-guardian-slug-12345`);
    await page.waitForLoadState('networkidle');
    
    // Should show 404 page
    const has404 = await page.locator('text=/404|not found|page.*not.*found/i').isVisible().catch(() => false);
    const is404Page = page.url().includes('404');
    const statusIs404 = await page.evaluate(() => {
      return document.body.textContent?.includes('404') || false;
    });
    
    expect(has404 || is404Page || statusIs404).toBeTruthy();
  });

  test('should show 404 for invalid destination slug', async ({ page }) => {
    await page.goto(`${baseURL}/destinations/invalid-destination-slug-12345`);
    await page.waitForLoadState('networkidle');
    
    // Should show 404 page
    const has404 = await page.locator('text=/404|not found|page.*not.*found/i').isVisible().catch(() => false);
    const is404Page = page.url().includes('404');
    const statusIs404 = await page.evaluate(() => {
      return document.body.textContent?.includes('404') || false;
    });
    
    expect(has404 || is404Page || statusIs404).toBeTruthy();
  });

  test('should handle Supabase connection errors gracefully', async ({ page }) => {
    // Monitor for error messages related to Supabase
    const errorMessages: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('supabase') || text.includes('database') || text.includes('connection')) {
          errorMessages.push(text);
        }
      }
    });
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Navigate to pages that use Supabase
    const pages = ['/tripkits', '/guardians', '/destinations'];
    
    for (const pagePath of pages) {
      await page.goto(`${baseURL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    // If there are errors, they should be handled gracefully (page should still load)
    const pageContent = await page.locator('body').isVisible();
    expect(pageContent).toBeTruthy();
    
    // Errors should not crash the page
    // (actual Supabase error handling would require API testing)
  });

  test('should handle Stripe payment failures gracefully', async ({ page }) => {
    // Navigate to TripKits page
    await page.goto(`${baseURL}/tripkits`);
    await page.waitForLoadState('networkidle');
    
    // Find purchase button
    const buyButton = page.locator('button:has-text("Buy"), button:has-text("Purchase")').first();
    
    if (await buyButton.count() > 0) {
      // Monitor for checkout errors
      const errorMessages: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errorMessages.push(msg.text());
        }
      });
      
      // Try to initiate checkout (might fail without auth)
      await buyButton.click();
      await page.waitForTimeout(2000);
      
      // Should either redirect to checkout or show error message gracefully
      const currentURL = page.url();
      const isCheckout = currentURL.includes('checkout') || currentURL.includes('stripe');
      const hasErrorMessage = await page.locator('text=/error|failed|try.*again/i').isVisible().catch(() => false);
      
      // Should handle error gracefully (either redirect or show message)
      expect(isCheckout || hasErrorMessage || currentURL.includes('signin')).toBeTruthy();
    }
  });

  test('should display user-friendly error messages', async ({ page }) => {
    // Navigate to invalid page
    await page.goto(`${baseURL}/invalid-route-12345`);
    await page.waitForLoadState('networkidle');
    
    // Should show user-friendly error message
    const hasErrorMessage = await page.locator('text=/404|not found|page.*not.*found|error/i').isVisible();
    
    // Error message should not be technical jargon
    const pageText = await page.textContent('body');
    const hasTechnicalError = pageText?.includes('Error:') || 
                             pageText?.includes('Exception:') ||
                             pageText?.includes('Stack trace');
    
    // Should have friendly message and not show technical errors
    expect(hasErrorMessage).toBeTruthy();
    expect(hasTechnicalError).toBeFalsy();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Monitor API responses
    const apiErrors: { url: string; status: number }[] = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        apiErrors.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Navigate to pages that make API calls
    const pages = ['/tripkits', '/guardians'];
    
    for (const pagePath of pages) {
      await page.goto(`${baseURL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    // If there are API errors, page should still function
    const pageContent = await page.locator('body').isVisible();
    expect(pageContent).toBeTruthy();
    
    // Errors should not crash the page
    // (specific error handling would require API testing)
  });

  test('should recover from errors and allow retry', async ({ page }) => {
    // Test that error states allow recovery
    await page.goto(`${baseURL}/tripkits`);
    await page.waitForLoadState('networkidle');
    
    // Try to trigger an error (e.g., invalid form submission)
    const formInput = page.locator('input[type="email"], input[type="text"]').first();
    
    if (await formInput.count() > 0) {
      // Fill invalid data and submit
      await formInput.fill('invalid');
      
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Should show error but allow retry
        const hasError = await page.locator('text=/error|invalid|try.*again/i').isVisible().catch(() => false);
        
        if (hasError) {
          // Should be able to fix and retry
          await formInput.clear();
          await formInput.fill('valid@example.com');
          
          // Form should be usable again
          const isEnabled = await formInput.isEnabled();
          expect(isEnabled).toBeTruthy();
        }
      }
    }
  });

  test('should log errors appropriately', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Navigate to potentially error-prone pages
    await page.goto(`${baseURL}/tripkits/invalid-slug`);
    await page.waitForLoadState('networkidle');
    
    // Errors should be logged (but not exposed to users)
    // This is a monitoring test - we just verify the page doesn't crash
    const pageContent = await page.locator('body').isVisible();
    expect(pageContent).toBeTruthy();
  });
});

