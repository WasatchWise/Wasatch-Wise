/**
 * Test Utilities and Helpers
 * 
 * Shared utilities for E2E and unit tests
 */

export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Generate a unique email for testing
 */
export function generateTestEmail(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: any, timeout = 30000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for element to be visible with retry
 */
export async function waitForElement(
  page: any,
  selector: string,
  timeout = 5000
): Promise<any> {
  return await page.locator(selector).waitFor({ state: 'visible', timeout });
}

/**
 * Check if element exists
 */
export async function elementExists(page: any, selector: string): Promise<boolean> {
  return await page.locator(selector).count() > 0;
}

/**
 * Get text content safely
 */
export async function getTextContent(page: any, selector: string): Promise<string | null> {
  try {
    const element = page.locator(selector).first();
    if (await element.count() > 0) {
      return await element.textContent();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fill form input safely
 */
export async function fillInput(
  page: any,
  selector: string,
  value: string
): Promise<boolean> {
  try {
    const input = page.locator(selector).first();
    if (await input.count() > 0) {
      await input.fill(value);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Click button safely
 */
export async function clickButton(
  page: any,
  selector: string | RegExp
): Promise<boolean> {
  try {
    const button = typeof selector === 'string' 
      ? page.locator(selector).first()
      : page.locator('button, a').filter({ hasText: selector }).first();
    
    if (await button.count() > 0) {
      await button.click();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Navigate to page with retry
 */
export async function navigateTo(
  page: any,
  path: string,
  baseUrl = BASE_URL
): Promise<void> {
  try {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  } catch (error) {
    // Retry once
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  }
}

/**
 * Check if URL matches pattern
 */
export function urlMatches(url: string, pattern: string | RegExp): boolean {
  if (typeof pattern === 'string') {
    return url.includes(pattern);
  }
  return pattern.test(url);
}

/**
 * Wait for API request
 */
export async function waitForApiRequest(
  page: any,
  urlPattern: string | RegExp,
  method = 'GET',
  timeout = 10000
): Promise<any> {
  return await page.waitForResponse(
    (response: any) => {
      const matchesUrl = typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url());
      
      return matchesUrl && response.request().method() === method;
    },
    { timeout }
  ).catch(() => null);
}

/**
 * Monitor console errors
 */
export function monitorConsoleErrors(page: any): string[] {
  const errors: string[] = [];
  
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Monitor network errors
 */
export function monitorNetworkErrors(page: any): Array<{ url: string; status: number }> {
  const errors: Array<{ url: string; status: number }> = [];
  
  page.on('response', (response: any) => {
    if (response.status() >= 400) {
      errors.push({
        url: response.url(),
        status: response.status(),
      });
    }
  });
  
  return errors;
}

/**
 * Check for horizontal scroll
 */
export async function hasHorizontalScroll(page: any): Promise<boolean> {
  return await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
}

/**
 * Get viewport size
 */
export async function getViewportSize(page: any): Promise<{ width: number; height: number }> {
  return await page.viewportSize() || { width: 0, height: 0 };
}

/**
 * Set viewport size
 */
export async function setViewportSize(
  page: any,
  width: number,
  height: number
): Promise<void> {
  await page.setViewportSize({ width, height });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: any): Promise<boolean> {
  const url = page.url();
  const hasAuthIndicator = !url.includes('signin') && 
                          !url.includes('auth') &&
                          !url.includes('login');
  
  // Check for auth state in localStorage/sessionStorage
  const hasAuthStorage = await page.evaluate(() => {
    return localStorage.getItem('supabase.auth.token') || 
           sessionStorage.getItem('supabase.auth.token') ||
           document.cookie.includes('supabase');
  }).catch(() => false);
  
  return hasAuthIndicator && (hasAuthStorage || hasAuthIndicator);
}

/**
 * Clear authentication state
 */
export async function clearAuthState(page: any): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Take screenshot with name
 */
export async function takeScreenshot(
  page: any,
  name: string
): Promise<void> {
  await page.screenshot({ path: `tests/screenshots/${name}-${Date.now()}.png` }).catch(() => {
    // Screenshots directory might not exist
  });
}

/**
 * Test data generators
 */
export const TestData = {
  validEmail: () => generateTestEmail(),
  invalidEmail: () => 'invalid-email',
  weakPassword: () => '12345',
  strongPassword: () => `TestPassword${Date.now()}!`,
  tripkitSlug: () => 'test-tripkit',
  guardianSlug: () => 'test-guardian',
  destinationSlug: () => 'test-destination',
};

