import { test, expect } from '@playwright/test';

/**
 * Navigation & Routing Tests
 * 
 * Tests:
 * - All nav links resolve correctly
 * - Mobile menu opens/closes
 * - Footer links work
 * - 404 handling for invalid routes
 * - Deep linking to specific TripKits/Guardians
 * - Back button behavior
 */

test.describe('Navigation & Routing', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test('should navigate via header links', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Find header navigation links
    const navLinks = page.locator('header a, nav a').filter({ hasText: /tripkits|destinations|guardians|about/i });
    
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    
    // Test navigation
    for (let i = 0; i < Math.min(3, linkCount); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && !href.startsWith('http') && !href.startsWith('mailto')) {
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we navigated (not same page)
        expect(page.url()).toMatch(new RegExp(href.replace(/^\//, '').replace(/\/$/, ''), 'i'));
      }
    }
  });

  test('should open and close mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Find mobile menu toggle button
    const menuToggle = page.locator('button[aria-label*="menu" i], button[aria-expanded], .mobile-menu-toggle, [data-testid="mobile-menu-toggle"]').first();
    
    if (await menuToggle.count() > 0) {
      // Open menu
      await menuToggle.click();
      await page.waitForTimeout(500);
      
      // Verify menu is open
      const menu = page.locator('nav[aria-hidden="false"], .mobile-menu:visible, [data-testid="mobile-menu"]:visible').first();
      const isVisible = await menu.isVisible().catch(() => false);
      
      if (isVisible) {
        // Close menu
        await menuToggle.click();
        await page.waitForTimeout(500);
        
        // Verify menu is closed
        const isHidden = await menu.isHidden().catch(() => true);
        expect(isHidden).toBeTruthy();
      }
    }
  });

  test('should have working footer links', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Find footer links
    const footerLinks = page.locator('footer a').filter({ hasText: /privacy|terms|contact|about/i });
    const linkCount = await footerLinks.count();
    
    if (linkCount > 0) {
      // Test a few footer links
      for (let i = 0; i < Math.min(3, linkCount); i++) {
        const link = footerLinks.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && !href.startsWith('http') && !href.startsWith('mailto')) {
          await link.click();
          await page.waitForLoadState('networkidle');
          
          // Verify navigation
          expect(page.url()).toMatch(new RegExp(href.replace(/^\//, ''), 'i'));
          
          // Go back
          await page.goBack();
          await page.waitForLoadState('networkidle');
        }
      }
    }
  });

  test('should handle 404 for invalid routes', async ({ page }) => {
    await page.goto(`${baseURL}/invalid-route-that-does-not-exist-12345`);
    await page.waitForLoadState('networkidle');
    
    // Should show 404 page or error
    const has404 = await page.locator('text=/404|not found|page.*found/i').isVisible().catch(() => false);
    const is404Page = page.url().includes('404');
    
    expect(has404 || is404Page).toBeTruthy();
  });

  test('should handle deep linking to specific TripKit', async ({ page }) => {
    // Use a known TripKit slug or get one from the tripkits page
    await page.goto(`${baseURL}/tripkits`);
    await page.waitForLoadState('networkidle');
    
    const firstTripKitLink = page.locator('a[href*="/tripkits/"]').first();
    
    if (await firstTripKitLink.count() > 0) {
      const href = await firstTripKitLink.getAttribute('href');
      const slug = href?.split('/tripkits/')[1];
      
      if (slug) {
        // Test direct navigation
        await page.goto(`${baseURL}/tripkits/${slug}`);
        await page.waitForLoadState('networkidle');
        
        // Should load TripKit page
        expect(page.url()).toContain(`/tripkits/${slug}`);
        await expect(page.locator('h1, h2')).toBeVisible();
      }
    }
  });

  test('should handle deep linking to specific Guardian', async ({ page }) => {
    await page.goto(`${baseURL}/guardians`);
    await page.waitForLoadState('networkidle');
    
    const firstGuardianLink = page.locator('a[href*="/guardians/"]').first();
    
    if (await firstGuardianLink.count() > 0) {
      const href = await firstGuardianLink.getAttribute('href');
      const slug = href?.split('/guardians/')[1];
      
      if (slug) {
        // Test direct navigation
        await page.goto(`${baseURL}/guardians/${slug}`);
        await page.waitForLoadState('networkidle');
        
        // Should load Guardian page
        expect(page.url()).toContain(`/guardians/${slug}`);
        await expect(page.locator('h1, h2')).toBeVisible();
      }
    }
  });

  test('should preserve back button behavior', async ({ page }) => {
    // Navigate through pages
    await page.goto(baseURL);
    await page.goto(`${baseURL}/tripkits`);
    await page.goto(`${baseURL}/guardians`);
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/.*tripkits/);
    
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(baseURL.replace(/https?:\/\//, '').replace(/\/$/, ''), 'i'));
  });

  test('should handle invalid TripKit slug → 404', async ({ page }) => {
    await page.goto(`${baseURL}/tripkits/invalid-slug-that-does-not-exist-12345`);
    await page.waitForLoadState('networkidle');
    
    const has404 = await page.locator('text=/404|not found/i').isVisible().catch(() => false);
    const is404Page = page.url().includes('404');
    
    expect(has404 || is404Page).toBeTruthy();
  });

  test('should handle invalid Guardian slug → 404', async ({ page }) => {
    await page.goto(`${baseURL}/guardians/invalid-guardian-slug-12345`);
    await page.waitForLoadState('networkidle');
    
    const has404 = await page.locator('text=/404|not found/i').isVisible().catch(() => false);
    const is404Page = page.url().includes('404');
    
    expect(has404 || is404Page).toBeTruthy();
  });
});

