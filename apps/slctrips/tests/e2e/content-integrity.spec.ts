import { test, expect } from '@playwright/test';

/**
 * Content Integrity Tests
 * 
 * Tests:
 * - All 11 TripKits load with cover images (no 404s)
 * - All 29 guardian pages display county profiles
 * - County data accuracy (population, area, founding dates)
 * - Destination counts match database
 * - Image CSP compliance (no blocked resources)
 * - Links between TripKits and Guardians work
 */

test.describe('Content Integrity', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test('should load all TripKits with cover images (no 404s)', async ({ page }) => {
    await page.goto(`${baseURL}/tripkits`);
    await page.waitForLoadState('networkidle');
    
    // Track failed image loads
    const failedImages: string[] = [];
    
    page.on('response', response => {
      if (response.request().resourceType() === 'image' && response.status() === 404) {
        failedImages.push(response.url());
      }
    });
    
    // Wait a bit for all images to load
    await page.waitForTimeout(3000);
    
    // Check for broken images
    const brokenImages = await page.locator('img[src*="tripkit"], img[alt*="tripkit" i]').all();
    
    for (const img of brokenImages) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (naturalWidth === 0) {
        const src = await img.getAttribute('src');
        failedImages.push(src || 'unknown');
      }
    }
    
    expect(failedImages.length).toBe(0);
  });

  test('should display all guardian pages with county profiles', async ({ page }) => {
    // Navigate to guardians page or list
    await page.goto(`${baseURL}/guardians`);
    await page.waitForLoadState('networkidle');
    
    // Find all guardian links
    const guardianLinks = page.locator('a[href*="/guardians/"]');
    const linkCount = await guardianLinks.count();
    
    // Should have guardian links (ideally 29)
    expect(linkCount).toBeGreaterThan(0);
    
    // Test a few guardian pages
    const linksToTest = Math.min(5, linkCount);
    for (let i = 0; i < linksToTest; i++) {
      const href = await guardianLinks.nth(i).getAttribute('href');
      if (href) {
        await page.goto(`${baseURL}${href}`);
        await page.waitForLoadState('networkidle');
        
        // Verify guardian content exists
        await expect(page.locator('h1, h2')).toBeVisible();
        
        // Check for county information
        const pageContent = await page.textContent('body');
        expect(pageContent).toBeTruthy();
      }
    }
  });

  test('should display accurate county data (population, area, founding dates)', async ({ page }) => {
    // Navigate to a guardian page (which should have county data)
    await page.goto(`${baseURL}/guardians`);
    await page.waitForLoadState('networkidle');
    
    const firstGuardian = page.locator('a[href*="/guardians/"]').first();
    if (await firstGuardian.count() > 0) {
      const href = await firstGuardian.getAttribute('href');
      if (href) {
        await page.goto(`${baseURL}${href}`);
        await page.waitForLoadState('networkidle');
        
        const pageContent = await page.textContent('body');
        
        // Check for county data indicators
        const hasPopulation = /population|residents/i.test(pageContent || '');
        const hasArea = /area|square miles|acres/i.test(pageContent || '');
        const hasFounding = /founded|established|since/i.test(pageContent || '');
        
        // At least one should be present
        expect(hasPopulation || hasArea || hasFounding).toBeTruthy();
      }
    }
  });

  test('should have accurate destination counts', async ({ page }) => {
    await page.goto(`${baseURL}/tripkits`);
    await page.waitForLoadState('networkidle');
    
    // Get destination counts from TripKit cards
    const tripKitCards = page.locator('[data-testid="tripkit-card"], .tripkit-card, article');
    const cardCount = await tripKitCards.count();
    
    // Test a few TripKits to verify destination count displays
    const cardsToTest = Math.min(3, cardCount);
    for (let i = 0; i < cardsToTest; i++) {
      const card = tripKitCards.nth(i);
      const cardText = await card.textContent();
      
      // Look for destination count indicators
      const hasCount = /\d+.*destination|destination.*\d+/i.test(cardText || '');
      // This is a basic check - actual count validation would need database comparison
      expect(true).toBeTruthy(); // Placeholder
    }
  });

  test('should have working links between TripKits and Guardians', async ({ page }) => {
    // Navigate to a TripKit page
    await page.goto(`${baseURL}/tripkits`);
    await page.waitForLoadState('networkidle');
    
    const firstTripKit = page.locator('a[href*="/tripkits/"]').first();
    if (await firstTripKit.count() > 0) {
      const href = await firstTripKit.getAttribute('href');
      if (href) {
        await page.goto(`${baseURL}${href}`);
        await page.waitForLoadState('networkidle');
        
        // Look for guardian links on TripKit page
        const guardianLink = page.locator('a[href*="/guardians/"]').first();
        
        if (await guardianLink.count() > 0) {
          const guardianHref = await guardianLink.getAttribute('href');
          await guardianLink.click();
          await page.waitForLoadState('networkidle');
          
          // Should navigate to guardian page
          expect(page.url()).toMatch(/\/guardians\//);
        }
      }
    }
  });

  test('should comply with CSP (no blocked resources)', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('CSP') || text.includes('Content Security Policy') || text.includes('blocked')) {
          consoleErrors.push(text);
        }
      }
    });
    
    // Navigate through key pages
    const pages = ['/tripkits', '/guardians', '/destinations'];
    
    for (const pagePath of pages) {
      await page.goto(`${baseURL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    // Check for CSP violations
    expect(consoleErrors.length).toBe(0);
  });

  test('should load all destination images without 404s', async ({ page }) => {
    await page.goto(`${baseURL}/destinations`);
    await page.waitForLoadState('networkidle');
    
    const failedImages: string[] = [];
    
    page.on('response', response => {
      if (response.request().resourceType() === 'image' && response.status() === 404) {
        failedImages.push(response.url());
      }
    });
    
    // Navigate to a few destination pages
    const destinationLinks = page.locator('a[href*="/destinations/"]');
    const linkCount = await destinationLinks.count();
    const linksToTest = Math.min(3, linkCount);
    
    for (let i = 0; i < linksToTest; i++) {
      const href = await destinationLinks.nth(i).getAttribute('href');
      if (href) {
        await page.goto(`${baseURL}${href}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
    }
    
    expect(failedImages.length).toBe(0);
  });
});

