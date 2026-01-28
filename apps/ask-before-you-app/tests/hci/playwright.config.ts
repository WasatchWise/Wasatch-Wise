/**
 * Playwright Configuration for HCI Archetype Tests
 *
 * Optimized for testing cognitive load, accessibility,
 * and archetype-specific interaction patterns.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',

  // Run tests in parallel for efficiency
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'hci-report' }],
    ['json', { outputFile: 'hci-results.json' }],
    ['list']
  ],

  // Global timeout for each test
  timeout: 30000,

  // Expect timeout for assertions
  expect: {
    timeout: 5000
  },

  use: {
    // Base URL for the application
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying a failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'on-first-retry',

    // Viewport for desktop tests
    viewport: { width: 1280, height: 720 },

    // Action timeout
    actionTimeout: 10000,
  },

  // Configure projects for different test scenarios
  projects: [
    // Desktop browser tests
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewport tests (important for Parent and Teacher archetypes)
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 }
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 }
      },
    },

    // Tablet tests (Consultant briefings may happen on tablets)
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 834, height: 1194 }
      },
    },

    // Accessibility-focused tests
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        // Can add accessibility testing extensions here
      },
      testMatch: '**/accessibility/*.spec.ts',
    },

    // Reduced motion tests
    {
      name: 'reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        // Emulate reduced motion preference
      },
    },
  ],

  // Local dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
