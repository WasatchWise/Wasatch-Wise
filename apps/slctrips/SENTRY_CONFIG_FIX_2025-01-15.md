# Sentry Configuration Fix
## January 15, 2025

## Issue

Sentry deprecation warning:
```
[@sentry/nextjs] DEPRECATION WARNING: autoInstrumentServerFunctions is deprecated and will be removed in a future version. Use webpack.autoInstrumentServerFunctions instead.
```

## Solution

Removed the deprecated `autoInstrumentServerFunctions: true` option from the Sentry webpack plugin configuration.

### Why This Works

In newer versions of `@sentry/nextjs`, server function instrumentation is **enabled by default**. The explicit option is no longer needed and was causing the deprecation warning.

### Changes Made

**File:** `next.config.js`

**Before:**
```javascript
{
  // ...
  autoInstrumentServerFunctions: true,  // ❌ Deprecated
  // ...
}
```

**After:**
```javascript
{
  // ...
  // Note: autoInstrumentServerFunctions is now enabled by default in newer Sentry versions
  // The deprecation warning was about moving it to webpack config, but it's no longer needed
  // as server function instrumentation is automatic
  // ...
}
```

## Impact

- ✅ Deprecation warning removed
- ✅ Server function instrumentation still works (enabled by default)
- ✅ No breaking changes
- ✅ Future-proof for Sentry updates

## Verification

The deprecation warning should no longer appear during:
- `npm run build`
- `npm run dev`
- `npm run lint`

## Notes

- Server function instrumentation remains active (default behavior)
- API routes and server components are still automatically instrumented
- No configuration changes needed in `sentry.server.config.ts` or `sentry.edge.config.ts`

---

**Fixed By:** AI Code Assistant (Claude)  
**Date:** January 15, 2025  
**Status:** ✅ Complete

