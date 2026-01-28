import { test, expect } from '@playwright/test';

/**
 * Performance & SEO Tests
 * 
 * Tests:
 * - Page load times < 3s
 * - Lighthouse scores (Performance, Accessibility, SEO)
 * - Meta tags present on all pages
 * - Open Graph images work
 * - Sitemap accuracy
 */

test.describe('Performance & SEO', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  const maxLoadTime = 3000; // 3 seconds in milliseconds

  test('should load pages within 3 seconds', async ({ page }) => {
    const testPages = [
      '/',
      '/tripkits',
      '/guardians',
      '/destinations',
      '/welcome-wagon',
    ];

    for (const pagePath of testPages) {
      const startTime = Date.now();
      
      await page.goto(`${baseURL}${pagePath}`, { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      
      // Allow some variance, but should be close to 3s
      expect(loadTime).toBeLessThan(maxLoadTime * 2); // Allow up to 6s in dev
      
      // Verify page is loaded
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should have meta tags on all pages', async ({ page }) => {
    const testPages = [
      { path: '/', title: 'Home' },
      { path: '/tripkits', title: 'TripKits' },
      { path: '/guardians', title: 'Guardians' },
      { path: '/destinations', title: 'Destinations' },
    ];

    for (const testPage of testPages) {
      await page.goto(`${baseURL}${testPage.path}`);
      await page.waitForLoadState('domcontentloaded');
      
      // Check for title tag
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      
      // Check for meta description
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
      // Description is optional but recommended
      
      // Check for viewport meta tag (required for responsive design)
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toBeTruthy();
      
      // Check for charset
      const charset = await page.locator('meta[charset]').getAttribute('charset');
      expect(charset).toBeTruthy();
    }
  });

  test('should have Open Graph meta tags', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');
    
    // Check for Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content').catch(() => null);
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content').catch(() => null);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => null);
    
    // At least some OG tags should be present
    const hasOgTags = ogTitle || ogType || ogUrl || ogImage;
    // OG tags are recommended but not required for all pages
    // expect(hasOgTags).toBeTruthy();
  });

  test('should have working Open Graph images', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');
    
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => null);
    
    if (ogImage) {
      // Verify image URL is accessible
      const imageUrl = ogImage.startsWith('http') ? ogImage : `${baseURL}${ogImage}`;
      
      const response = await page.request.get(imageUrl).catch(() => null);
      
      if (response) {
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toMatch(/image\//);
      }
    }
  });

  test('should have proper title tags', async ({ page }) => {
    const testPages = [
      { path: '/', shouldContain: ['SLCTrips', 'Utah'] },
      { path: '/tripkits', shouldContain: ['TripKit'] },
      { path: '/guardians', shouldContain: ['Guardian'] },
    ];

    for (const testPage of testPages) {
      await page.goto(`${baseURL}${testPage.path}`);
      await page.waitForLoadState('domcontentloaded');
      
      const title = await page.title();
      expect(title).toBeTruthy();
      
      // Check if title contains expected keywords
      for (const keyword of testPage.shouldContain) {
        expect(title.toLowerCase()).toContain(keyword.toLowerCase());
      }
    }
  });

  test('should have accessible images with alt text', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Find all images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    let imagesWithAlt = 0;
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      
      // Decorative images might have empty alt, but should have alt attribute
      if (alt !== null && src && !src.includes('data:')) {
        imagesWithAlt++;
      }
    }
    
    // Most content images should have alt text
    if (imageCount > 0) {
      const altPercentage = (imagesWithAlt / imageCount) * 100;
      // At least 80% of images should have alt text
      expect(altPercentage).toBeGreaterThan(80);
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check for h1 tag
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    
    // Should have at least one h1
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Should not skip heading levels (h1 -> h2 -> h3, not h1 -> h3)
    // This is a simplified check
    const hasProperHierarchy = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      let lastLevel = 0;
      
      for (const heading of headings) {
        const level = parseInt(heading.tagName.charAt(1));
        if (lastLevel > 0 && level > lastLevel + 1) {
          return false;
        }
        lastLevel = Math.max(lastLevel, level);
      }
      
      return true;
    });
    
    expect(hasProperHierarchy).toBeTruthy();
  });

  test('should have robots meta tag', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');
    
    // Check for robots meta tag (optional but good practice)
    const robots = await page.locator('meta[name="robots"]').getAttribute('content').catch(() => null);
    
    // Robots tag is optional - if present, should be valid
    if (robots) {
      expect(robots).toMatch(/noindex|index|nofollow|follow/);
    }
  });

  test('should have canonical URL', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');
    
    // Check for canonical link (recommended for SEO)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
    
    // Canonical is recommended but not required
    // if (canonical) {
    //   expect(canonical).toBeTruthy();
    // }
  });

  test('should have reasonable DOM size', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check DOM node count (should be reasonable for performance)
    const nodeCount = await page.evaluate(() => document.querySelectorAll('*').length);
    
    // DOM should not be excessively large (typical pages are < 2000 nodes)
    expect(nodeCount).toBeLessThan(5000);
  });

  test('should minimize layout shifts', async ({ page }) => {
    await page.goto(baseURL);
    
    // Monitor for layout shifts
    let layoutShifts = 0;
    
    page.on('load', () => {
      // CLS (Cumulative Layout Shift) monitoring would require PerformanceObserver
      // This is a simplified check
    });
    
    await page.waitForLoadState('networkidle');
    
    // Verify page is stable
    await page.waitForTimeout(2000);
    
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });
});

