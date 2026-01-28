# Utilities

Utility functions for the Adult AI Academy application.

## Retry Utility

`retry.ts` provides robust retry logic with exponential backoff for external API calls.

### Features

- **Exponential backoff** with configurable delays
- **Jitter** to prevent thundering herd problems
- **Smart error detection** for rate limits, network errors, and temporary failures
- **Configurable retry presets** for different use cases
- **Customizable retry logic** via `shouldRetry` callback

### Usage

```typescript
import { retryWithBackoff, retryPresets } from '../utils/retry';

// Basic usage with defaults
const result = await retryWithBackoff(
  () => someAsyncOperation(),
);

// Using presets
const result = await retryWithBackoff(
  () => criticalOperation(),
  {
    ...retryPresets.critical,  // 5 retries, longer delays
    logger: (msg) => console.log(`[My Operation] ${msg}`),
  }
);

// Custom configuration
const result = await retryWithBackoff(
  () => customOperation(),
  {
    maxRetries: 3,
    initialDelayMs: 500,
    maxDelayMs: 10000,
    backoffMultiplier: 1.5,
    shouldRetry: (error, attempt) => {
      // Custom retry logic
      return attempt < 3 && error instanceof NetworkError;
    },
  }
);
```

### Retry Presets

- **`critical`** - 5 retries, up to 30s delays (for OpenAI, Gemini)
- **`standard`** - 3 retries, up to 20s delays (for most operations)
- **`fast`** - 2 retries, up to 5s delays (for non-critical operations)

### Error Detection

The default `shouldRetry` function automatically retries on:

- **Rate limits**: 429 errors, "rate limit", "quota exceeded"
- **Temporary failures**: 500, 502, 503, 504 errors
- **Network errors**: timeouts, connection resets, DNS failures

It does NOT retry on:
- 4xx client errors (except 429)
- Authentication errors (after first attempt)

### Integration Points

The retry utility is integrated into:

- `src/lib/assets/generation.ts` - OpenAI DALL-E image generation
- `src/lib/research/synthesis.ts` - OpenAI and Gemini content synthesis
- `src/lib/assets/heygen.ts` - HeyGen video generation

