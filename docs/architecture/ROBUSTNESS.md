# Robustness Features

This document outlines all the robustness features implemented in WasatchWise.

## Error Handling

### Custom Error Types
- `AppError` - Base error class with status codes
- `ValidationError` - Input validation failures (400)
- `AuthenticationError` - Auth failures (401)
- `AuthorizationError` - Permission failures (403)
- `NotFoundError` - Resource not found (404)
- `ConflictError` - Resource conflicts (409)
- `RateLimitError` - Rate limit exceeded (429)
- `ExternalAPIError` - External API failures (502)
- `DatabaseError` - Database operation failures (500)

### Error Boundaries
- React Error Boundary component catches UI errors
- Graceful fallback UI with retry options
- Development mode shows detailed error stack

## Input Validation & Sanitization

### Validation
- Zod schemas for all form inputs
- Type-safe validation with detailed error messages
- Server-side validation in all Server Actions

### Sanitization
- String sanitization (removes dangerous characters)
- Email validation and sanitization
- URL validation (only http/https)
- Phone number normalization
- JSON parsing with validation
- Recursive object sanitization

## Rate Limiting

### Implementation
- In-memory rate limiter with automatic cleanup
- Configurable limits per endpoint type
- IP-based rate limiting
- Rate limit headers in responses

### Limits
- AI endpoints: 5 requests/minute
- General API: 20 requests/minute
- Automatic cleanup of expired entries

## Security

### Middleware
- CORS headers for API routes
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Content Security Policy
- Request validation

### Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Retry Logic & Circuit Breakers

### Retry Strategy
- Exponential backoff with jitter
- Configurable max attempts
- Retryable error detection
- Service-specific retry logic

### Circuit Breaker
- Automatic circuit opening on failures
- Half-open state for recovery testing
- Configurable failure threshold
- Automatic recovery after timeout

## Logging

### Structured Logging
- Development: Human-readable console logs
- Production: JSON structured logs
- Log levels: debug, info, warn, error

### Logged Operations
- All API calls with timing
- Database operations with timing
- Error details with context
- Performance metrics

## Timeouts

### Service-Specific Timeouts
- Claude API: 30 seconds
- HeyGen: 2 minutes (video generation)
- ElevenLabs: 15 seconds
- Supabase: 10 seconds
- Resend: 10 seconds
- Default: 15 seconds

## Database Operations

### Transaction Safety
- Automatic retry on connection errors
- Exponential backoff for retries
- Batch operations with error handling
- Connection pooling via Supabase

### Error Handling
- Graceful degradation on DB failures
- Non-blocking logging operations
- Transaction rollback on errors

## Health Checks

### Endpoint
- `/api/health` - Comprehensive health check
- Checks database connectivity
- Validates environment variables
- Returns 200 if healthy, 503 if degraded

## API Route Wrappers

### Error Handling Wrapper
- Automatic error catching
- Consistent error response format
- Request logging
- Input sanitization

## Monitoring

### Metrics Tracked
- API response times
- Database query times
- Error rates
- Rate limit hits
- External API failures

### Integration Ready
- Sentry error tracking configured
- Structured logs for log aggregation
- Health check endpoint for monitoring

## Graceful Degradation

### Features
- Non-critical operations don't block requests
- Fallback responses when external APIs fail
- Partial success handling in batch operations
- User-friendly error messages

## Best Practices

1. **Always validate input** - Use Zod schemas
2. **Sanitize user input** - Use sanitize utilities
3. **Handle errors gracefully** - Use custom error types
4. **Log everything** - Use logger utility
5. **Set timeouts** - Use withTimeout wrapper
6. **Retry on failures** - Use retry utility
7. **Rate limit APIs** - Middleware handles this
8. **Monitor health** - Use /api/health endpoint

## Testing Robustness

### Manual Testing
1. Test with invalid input
2. Test with network failures
3. Test rate limiting
4. Test error boundaries
5. Check health endpoint

### Monitoring
- Watch logs for errors
- Monitor API response times
- Check error rates
- Review rate limit hits
