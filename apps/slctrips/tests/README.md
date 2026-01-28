# Test Suite Documentation

This directory contains comprehensive tests for the SLCTrips v2 application.

## Test Structure

```
tests/
├── unit/              # Unit tests (Jest)
│   ├── components/    # React component tests
│   ├── utils/         # Utility function tests
│   └── api/           # API route unit tests
├── integration/       # Integration tests (Playwright)
│   └── api-routes.test.ts
├── e2e/               # End-to-end tests (Playwright)
│   ├── homepage.spec.ts
│   ├── auth.spec.ts
│   └── ...
├── health/            # Health check tests
│   ├── config-validation.test.ts
│   ├── data-integrity.test.ts
│   ├── performance.test.ts
│   └── accessibility-health.test.ts
└── utils/             # Test utilities and helpers
    └── test-helpers.ts
```

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- tests/unit/utils/distanceUtils.test.ts
```

### Integration Tests (Playwright)

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npm run test:e2e -- tests/integration/auth-flow.test.ts
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

### Health Checks

```bash
# Run health check script
npm run health:check

# Run health check tests
npm run test:health
```

### Run All Tests

```bash
# Run unit + E2E tests
npm run test:all
```

## Test Categories

### Unit Tests

Fast, isolated tests for individual functions and components:

- **Components**: React component rendering and interaction
- **Utils**: Utility functions (distance calculations, validations, etc.)
- **API Routes**: API endpoint logic (with mocked dependencies)

### Integration Tests

Tests that verify multiple parts work together:

- **API Routes**: Full HTTP request/response cycle
- **Auth Flow**: Complete authentication workflows
- **Data Flow**: Database interactions and data transformations

### E2E Tests

Full user journey tests:

- **Homepage**: Landing page functionality
- **Navigation**: Routing and page transitions
- **Authentication**: Sign up, sign in, password reset
- **Checkout**: Purchase flow
- **TripKits**: TripKit viewing and access
- **Accessibility**: WCAG compliance
- **Performance**: Load times and optimization

### Health Checks

System-level validation:

- **Configuration**: Environment variables and config files
- **Data Integrity**: Database structure and relationships
- **Performance**: Page load times and resource sizes
- **Accessibility**: Basic a11y requirements

## Writing New Tests

### Unit Test Example

```typescript
// tests/unit/utils/myFunction.test.ts
import { myFunction } from '@/lib/myFunction';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

### Component Test Example

```typescript
// tests/unit/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
// tests/integration/my-feature.test.ts
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/');
  await page.click('button');
  await expect(page).toHaveURL('/success');
});
```

## Test Utilities

The `tests/utils/test-helpers.ts` file provides reusable utilities:

- `generateTestEmail()`: Create unique test emails
- `waitForNetworkIdle()`: Wait for network requests
- `navigateTo()`: Navigate with retry logic
- `monitorConsoleErrors()`: Track console errors
- `TestData`: Predefined test data generators

## Coverage Goals

- **Unit Tests**: 50%+ coverage
- **Critical Paths**: 80%+ coverage
- **Components**: All public components tested

## CI/CD Integration

Tests run automatically on:

- Pull requests
- Commits to main branch
- Pre-deployment checks

## Debugging Tests

### Jest (Unit Tests)

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test with verbose output
npm run test -- --verbose tests/unit/utils/distanceUtils.test.ts
```

### Playwright (E2E/Integration)

```bash
# Debug mode (opens Playwright inspector)
npm run test:e2e:debug

# Run with trace
npm run test:e2e -- --trace on

# Generate HTML report
npm run test:e2e -- --reporter=html
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up after tests (clear state, reset mocks)
3. **Descriptive Names**: Use clear test descriptions
4. **Arrange-Act-Assert**: Follow AAA pattern
5. **Mock External Dependencies**: Don't hit real APIs in unit tests
6. **Test Edge Cases**: Include error cases and boundary conditions
7. **Keep Tests Fast**: Unit tests should run in milliseconds
8. **Maintain Test Data**: Keep test data realistic and up-to-date

## Troubleshooting

### Tests failing locally but passing in CI

- Check environment variables
- Verify Node version matches CI
- Clear node_modules and reinstall

### Playwright tests timing out

- Increase timeout in test
- Check if dev server is running
- Verify BASE_URL is correct

### Jest tests not finding modules

- Check `jest.config.js` moduleNameMapper
- Verify TypeScript paths match Jest config
- Clear Jest cache: `npm run test -- --clearCache`

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
