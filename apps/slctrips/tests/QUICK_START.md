# Testing Quick Start Guide

## Test Suite Overview

**108 test cases** across **10 test suites** covering all critical user flows and functionality.

### Test Suites

1. **auth.spec.ts** - 11 tests (signup, signin, password reset, redirects)
2. **tripkit-purchase.spec.ts** - 10 tests (teaser preview, purchase flow, images)
3. **content-integrity.spec.ts** - 10 tests (pages load, CSP, images, links)
4. **navigation-routing.spec.ts** - 12 tests (all routes, 404s, deep linking)
5. **responsive-design.spec.ts** - 10 tests (mobile/tablet/desktop layouts)
6. **performance-seo.spec.ts** - 12 tests (load times, meta tags, headers)
7. **error-handling.spec.ts** - 11 tests (validation, 404s, JS errors)
8. **security.spec.ts** - 11 tests (auth protection, XSS, CSP, RLS)
9. **welcome-wagon.spec.ts** - 10 tests (form capture, validation, accessibility)
10. **staykit-dashboard.spec.ts** - 11 tests (auth required, responsive, errors)

## Quick Commands

```bash
# Run all E2E tests
npm run test:e2e

# Interactive UI mode (recommended for debugging)
npm run test:e2e:ui

# See browser window
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# Run against production
BASE_URL=https://www.slctrips.com npm run test:e2e
```

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## What Gets Tested

✅ **Authentication & User Flows** - Sign up, sign in, password reset, session management  
✅ **TripKit Purchase Flow** - Browse, purchase, Stripe integration, webhooks  
✅ **Content Integrity** - All TripKits, Guardians, destinations load correctly  
✅ **Welcome Wagon** - Form submission, validation, email capture  
✅ **StayKit Dashboard** - Authentication, task management, RLS  
✅ **Navigation & Routing** - All links, 404s, deep linking  
✅ **Responsive Design** - Mobile, tablet, desktop layouts  
✅ **Performance & SEO** - Load times, meta tags, accessibility  
✅ **Error Handling** - Network failures, invalid routes, graceful degradation  
✅ **Security** - Protected routes, XSS protection, CSP, RLS  

## Browser Coverage

Tests run across:
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **WebKit** (Desktop Safari)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

## Test Execution

The test suite will:
1. **Automatically start your dev server** (if not already running)
2. **Run tests in parallel** (2 workers locally, 1 in CI)
3. **Generate HTML reports** (view with `npx playwright show-report`)
4. **Take screenshots on failure** (saved to `test-results/`)
5. **Record videos on failure** (saved to `test-results/`)

## Tips

- **Use UI mode** (`npm run test:e2e:ui`) to interactively run and debug tests
- **Run specific test file**: `npx playwright test tests/e2e/auth.spec.ts`
- **Run specific test**: `npx playwright test -g "should display signup page"`
- **View last report**: `npx playwright show-report`
- **Update snapshots**: `npx playwright test --update-snapshots`

## Troubleshooting

**Tests timeout?**  
- Check if dev server is running: `npm run dev`
- Verify `BASE_URL` environment variable

**Browser not found?**  
```bash
npx playwright install
```

**Tests pass locally but fail in CI?**  
- Check environment variables
- Review Playwright CI configuration
- Ensure all dependencies are installed

**Need to see what's happening?**  
```bash
npm run test:e2e:headed  # See browser
npm run test:e2e:debug   # Step through tests
npm run test:e2e:ui      # Interactive UI
```

## Ready to Find Bugs! 🐛

The tests will automatically start your dev server and run across Chromium, Firefox, Safari (desktop and mobile). Ready to find bugs!

