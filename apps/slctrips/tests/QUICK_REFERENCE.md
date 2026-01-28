# Test Suite Quick Reference

## Quick Commands

```bash
# Run all unit tests
npm run test:unit

# Run all tests (unit + e2e)
npm run test:all

# Run health checks
npm run health:check

# Run specific test file
npm run test -- tests/unit/utils/distanceUtils.test.ts
npm run test:e2e -- tests/e2e/homepage.spec.ts

# Watch mode (unit tests)
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test File Locations

| Type | Location | Framework |
|------|----------|-----------|
| Unit Tests | `tests/unit/` | Jest |
| Integration Tests | `tests/integration/` | Playwright |
| E2E Tests | `tests/e2e/` | Playwright |
| Health Checks | `tests/health/` | Playwright/Jest |

## Common Test Patterns

### Testing a Utility Function

```typescript
// tests/unit/utils/myFunction.test.ts
import { myFunction } from '@/lib/myFunction';

describe('myFunction', () => {
  it('should handle normal case', () => {
    expect(myFunction(input)).toBe(expected);
  });

  it('should handle edge case', () => {
    expect(myFunction(edgeInput)).toBe(edgeExpected);
  });
});
```

### Testing a Component

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

### Testing an API Route

```typescript
// tests/integration/api-routes.test.ts
import { test, expect } from '@playwright/test';

test('should return 200', async ({ request }) => {
  const response = await request.get('/api/endpoint');
  expect(response.status()).toBe(200);
});
```

## Debugging

### Jest (Unit Tests)
```bash
# Debug specific test
npm run test -- --testNamePattern="should calculate distance"
```

### Playwright (E2E/Integration)
```bash
# Debug mode
npm run test:e2e:debug

# Run specific test
npm run test:e2e -- tests/e2e/homepage.spec.ts
```

## Test Data

Use test helpers from `tests/utils/test-helpers.ts`:

```typescript
import { generateTestEmail, TestData } from '../utils/test-helpers';

const email = generateTestEmail();
const password = TestData.strongPassword();
```

## Environment Variables

Tests use these environment variables:

- `BASE_URL` - Base URL for E2E tests (default: http://localhost:3000)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

## Common Issues

### Tests failing locally
1. Check environment variables
2. Ensure dev server is running for E2E tests
3. Clear caches: `npm run test -- --clearCache`

### Playwright timeouts
1. Increase timeout in test
2. Check if server is accessible
3. Verify BASE_URL is correct

### Module not found errors
1. Check `jest.config.js` paths
2. Verify TypeScript paths
3. Clear Jest cache

## Coverage Goals

- Overall: 50%+
- Critical paths: 80%+
- Components: All public components

## Need Help?

- See `tests/README.md` for detailed documentation
- See `tests/TEST_SUITE_SUMMARY.md` for test overview
- Check test utilities in `tests/utils/test-helpers.ts`
