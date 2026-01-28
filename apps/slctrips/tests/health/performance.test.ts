/**
 * Performance health checks
 * Validates page load times and resource sizes
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const MAX_LOAD_TIME = 5000; // 5 seconds
const MAX_FIRST_CONTENTFUL_PAINT = 3000; // 3 seconds

test.describe('Performance Checks', () => {
  test('homepage should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(MAX_LOAD_TIME);
  });

  test('should have acceptable First Contentful Paint', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for FCP
    await page.waitForLoadState('domcontentloaded');
    
    const fcp = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : null;
    });

    if (fcp) {
      expect(fcp).toBeLessThan(MAX_FIRST_CONTENTFUL_PAINT);
    }
  });

  test('should not have excessive network requests', async ({ page }) => {
    const requests: string[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Should not have more than 100 requests for homepage
    expect(requests.length).toBeLessThan(100);
  });

  test('should optimize images', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const images = await page.evaluate(() => {
      const imgElements = Array.from(document.querySelectorAll('img'));
      return imgElements.map(img => ({
        src: img.src,
        loading: img.getAttribute('loading'),
        decoding: img.getAttribute('decoding'),
      }));
    });

    // Check that images use modern loading attributes
    const imagesWithLazyLoading = images.filter(img => 
      img.loading === 'lazy' || img.loading === 'eager'
    );

    // At least some images should have loading attributes
    if (images.length > 0) {
      expect(imagesWithLazyLoading.length).toBeGreaterThan(0);
    }
  });

  test('should have reasonable bundle size', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return entries
        .filter(entry => entry.initiatorType === 'script' || entry.initiatorType === 'link')
        .map(entry => ({
          name: entry.name,
          size: entry.transferSize,
          type: entry.initiatorType,
        }));
    });

    const totalSize = resources.reduce((sum, r) => sum + (r.size || 0), 0);
    const maxSize = 2 * 1024 * 1024; // 2MB for initial load

    // Initial load should be reasonable
    expect(totalSize).toBeLessThan(maxSize);
  });

  test('should use efficient fonts', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const fontFaces = await page.evaluate(() => {
      if ('queryLocalFonts' in window) {
        return []; // Not available in test environment
      }
      return Array.from(document.fonts).map(font => font.family);
    });

    // Should not load excessive fonts
    const uniqueFonts = [...new Set(fontFaces)];
    expect(uniqueFonts.length).toBeLessThan(10);
  });
});
