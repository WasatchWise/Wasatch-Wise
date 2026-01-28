# Dark Mode Header Visibility Fix

## Issue
User reported: "Dark mode, I can't see the header words"

## Fix Applied ✅
Changed header tagline text color from `text-gray-200` to `text-white` for better contrast in dark mode.

**Location:** `src/components/Header.tsx` line 28

**Before:**
```tsx
className="... text-gray-200"
```

**After:**
```tsx
className="... text-white"
```

## Status
✅ **Fixed** - Header text now uses `text-white` for maximum visibility against dark background

---

**Note:** The header has a dark background (`bg-gray-900`) so white text provides the best contrast. Navigation links already use appropriate colors (`text-gray-300` with `hover:text-white`).

