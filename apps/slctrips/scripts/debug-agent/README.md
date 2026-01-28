# Debug Agent Audit System

Comprehensive system audit tool that validates all critical components and user flows to ensure production readiness.

## Overview

The debug agent systematically tests:
- Configuration & Environment variables
- Authentication flows (signup, login, password reset)
- Payment & Checkout processing
- Product access (TripKits & StayKits)
- API endpoints
- Database integrity & RLS policies
- Complete user journeys
- Frontend rendering & navigation
- External service integrations
- Error monitoring & logging

## Usage

### Run Full Audit

```bash
node scripts/debug-agent/run-audit.mjs
```

Or make it executable and run directly:

```bash
./scripts/debug-agent/run-audit.mjs
```

### Run Specific Module

```bash
node scripts/debug-agent/run-audit.mjs --module=config-check
node scripts/debug-agent/run-audit.mjs --module=auth-flow
node scripts/debug-agent/run-audit.mjs --module=payment-flow
```

### Dry Run (Preview)

```bash
node scripts/debug-agent/run-audit.mjs --dry-run
```

### Run Individual Modules

Each module can also be run independently:

```bash
node scripts/debug-agent/config-check.mjs
node scripts/debug-agent/auth-flow.mjs
node scripts/debug-agent/payment-flow.mjs
node scripts/debug-agent/product-access.mjs
node scripts/debug-agent/api-endpoints.mjs
node scripts/debug-agent/database-check.mjs
node scripts/debug-agent/user-journeys.mjs
node scripts/debug-agent/frontend-check.mjs
node scripts/debug-agent/integrations.mjs
node scripts/debug-agent/error-monitoring.mjs
```

## Modules

### 1. config-check.mjs
Validates environment variables and service connectivity:
- Supabase URL and keys
- Stripe API keys
- Site URL configuration
- Service health checks

### 2. auth-flow.mjs
Tests authentication lifecycle:
- User signup
- Login & session creation
- Password reset flow
- Session management
- Logout functionality

### 3. payment-flow.mjs
Tests payment processing:
- Checkout session creation (TripKit, StayKit, Gift)
- Stripe API connectivity
- Webhook signature validation
- Purchase record creation
- Post-payment access grant

### 4. product-access.mjs
Validates product access:
- TripKit/StayKit access grant
- Access code linking
- RLS policy enforcement
- Content loading
- Access expiration handling

### 5. api-endpoints.mjs
Tests API routes:
- Purchases API
- StayKit API
- Welcome Wagon API
- Utility APIs (weather, voice, image-proxy)
- Error handling

### 6. database-check.mjs
Validates database state:
- Connection health
- Critical table structure
- Data quality checks
- Foreign key relationships
- RLS policies
- Data consistency

### 7. user-journeys.mjs
Tests complete user flows:
- New user: Signup → Purchase → Access
- Returning user: Login → Browse → Purchase
- Gift purchase: Checkout → Code → Redemption
- Educator: Page access → Submission

### 8. frontend-check.mjs
Tests frontend functionality:
- Public page rendering
- Protected page authentication
- Error page handling (404)
- Page performance
- Static assets
- Sitemap

### 9. integrations.mjs
Tests external services:
- Stripe integration
- Supabase integration
- Email service configuration
- Image/media services
- Voice/audio services
- Analytics & monitoring

### 10. error-monitoring.mjs
Validates error handling:
- Sentry configuration
- Error boundary files
- Logger configuration
- Error handler setup
- API error handling
- Logging configuration

## Requirements

- Node.js (v18+)
- Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_SITE_URL` (optional, defaults to localhost:3000)

## Output

The audit generates:
1. **Console output**: Real-time test results with pass/fail indicators
2. **JSON report**: Detailed report saved to `audit-report-{timestamp}.json`

### Report Structure

```json
{
  "timestamp": "2025-01-XX...",
  "modules": [
    {
      "name": "config-check",
      "description": "...",
      "duration": 1234,
      "results": {
        "passed": 5,
        "failed": 0,
        "warnings": 1
      },
      "details": {
        "passed": [...],
        "failed": [...],
        "warnings": [...]
      }
    }
  ],
  "summary": {
    "total": 50,
    "passed": 45,
    "failed": 2,
    "warnings": 3
  }
}
```

## Exit Codes

- `0`: All tests passed (or only warnings)
- `1`: One or more tests failed

## Notes

- **Test Mode**: Payment tests use Stripe test mode if `STRIPE_SECRET_KEY` starts with `sk_test_`
- **Cleanup**: Test users and data are automatically cleaned up after tests
- **Server Required**: Some tests (API endpoints, frontend) require the Next.js server to be running
- **Non-Destructive**: Tests are designed to be safe and won't affect production data

## Troubleshooting

### "Server not running" warnings
Start the Next.js development server:
```bash
npm run dev
```

### "Missing environment variables" errors
Ensure `.env.local` is properly configured with all required variables.

### "Connection refused" errors
Check that:
- Supabase URL is correct
- Network connectivity is available
- Firewall isn't blocking connections

### "RLS policy" warnings
These are informational - verify RLS policies are configured as intended in Supabase dashboard.

## Integration with CI/CD

The audit can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Debug Agent Audit
  run: node scripts/debug-agent/run-audit.mjs
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
```

## Best Practices

1. **Run before deployments**: Execute full audit before deploying to production
2. **Run after changes**: Test specific modules after making related changes
3. **Review warnings**: Address warnings even if tests pass
4. **Monitor trends**: Compare audit reports over time to identify regressions
5. **Fix failures first**: Address failed tests before warnings

