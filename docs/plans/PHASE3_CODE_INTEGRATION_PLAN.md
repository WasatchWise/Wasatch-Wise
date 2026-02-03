# Phase 3: Code Integration Plan
**Production Manager:** Auto  
**Production Designer:** Claude  
**Date:** January 26, 2026  
**Status:** Ready to Execute

---

## 🎯 Phase 3 Goals

1. **Update GlobalPulse.ts** - Connect to Realtime subscriptions using `building_slug`
2. **Update Scene.tsx** - Replace polling with Realtime subscriptions
3. **Test Real-Time Updates** - Verify instant UI updates

---

## 📊 Current State Analysis

### GlobalPulse.ts (Current)
- ✅ Already has Realtime infrastructure
- ❌ Uses `buildingId` directly in queries
- ❌ Queries `city_metrics` with `metric_key=eq.${buildingId}_voltage`
- ✅ Has subscription methods ready

### Scene.tsx (Current)
- ❌ Uses polling: `setInterval(poll, 5000)`
- ❌ Fetches from `/api/pulse/buildings`
- ✅ Uses `b.config.id` (string IDs like 'wasatchwise-capitol')
- ✅ Has `applySnapshot` function ready

### API Route (Current)
- `/api/pulse/buildings` - Returns building health data
- May need to be updated or removed after migration

---

## 🔧 Required Changes

### 1. Update GlobalPulse.ts

**Changes Needed:**
- Query `building_registry` by `building_slug` to get UUID `building_id`
- Subscribe to `city_metrics` changes using `building_slug` in metric_key pattern
- Map database columns: `footprint_width`/`footprint_height` → code's `size_x`/`size_y`
- Update `calculateBuildingHealth` to use `building_slug`

**Key Mapping:**
```typescript
// Code uses: b.config.id = 'wasatchwise-capitol'
// Database has: building_slug = 'wasatchwise-capitol'
// Metric key pattern: 'wasatchwise-capitol_voltage'
```

### 2. Update Scene.tsx

**Changes Needed:**
- Remove `setInterval` polling
- Initialize GlobalPulse with Supabase credentials
- Subscribe to building health updates for each building
- Use Realtime callbacks instead of polling
- Clean up subscriptions on unmount

**Current Flow:**
```typescript
// OLD: Polling
const poll = async () => {
  const res = await fetch('/api/pulse/buildings');
  const json = await res.json();
  applySnapshot(json.buildings);
};
setInterval(poll, 5000);
```

**New Flow:**
```typescript
// NEW: Realtime
const globalPulse = getGlobalPulse();
for (const building of buildings) {
  await globalPulse.subscribeToBuildingHealth(
    building.config.id, // 'wasatchwise-capitol'
    (health) => building.updateHealth(health)
  );
}
```

### 3. Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Verify these exist in `.env.local`**

---

## 📋 Implementation Steps

### Step 1: Update GlobalPulse.ts (15 minutes)

1. **Update `subscribeToBuildingHealth`:**
   - Keep using `buildingId` (which is actually `building_slug`)
   - Metric key pattern already correct: `${buildingId}_voltage`
   - Verify subscription filter works

2. **Update `calculateBuildingHealth`:**
   - Query uses `building_slug` in metric_key (already correct)
   - No changes needed if metric_key pattern matches

3. **Add method to fetch building registry data:**
   - Optional: Query `building_registry` by `building_slug`
   - Get grid positions, footprints, etc.

### Step 2: Update Scene.tsx (15 minutes)

1. **Import GlobalPulse:**
   ```typescript
   import { getGlobalPulse, initializeGlobalPulse } from '@/lib/supabase/GlobalPulse';
   ```

2. **Initialize in useEffect:**
   ```typescript
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
   const globalPulse = initializeGlobalPulse(supabaseUrl, supabaseKey);
   ```

3. **Replace polling with subscriptions:**
   - Remove `setInterval` and `poll` function
   - Add subscriptions for each building
   - Store unsubscribe functions

4. **Cleanup on unmount:**
   - Unsubscribe all on component unmount
   - Call `globalPulse.destroy()` if needed

### Step 3: Test Real-Time Updates (10 minutes)

1. **Start dev server:**
   ```bash
   cd apps/dashboard
   npm run dev
   ```

2. **Navigate to:** `/dashboard/command-center`

3. **Update a metric in Supabase:**
   ```sql
   UPDATE city_metrics 
   SET value = 75, last_updated = NOW()
   WHERE metric_key = 'wasatchwise-capitol_voltage';
   ```

4. **Verify:**
   - Building updates instantly (no 5-second delay)
   - WebSocket connection active
   - All 12 buildings render correctly

---

## 🔍 Code Mapping Reference

### Database → Code

| Database Column | Code Property | Notes |
|---------------|---------------|-------|
| `building_slug` | `config.id` | String ID mapping |
| `building_id` | (UUID, for joins) | Not used in code |
| `type` | `config.type` | Building type |
| `footprint_width` | `config.footprint.width` | Size mapping |
| `footprint_height` | `config.footprint.height` | Size mapping |
| `grid_x` | `config.grid.x` | Position |
| `grid_y` | `config.grid.y` | Position |

### Metric Key Pattern

```typescript
// Code: building.config.id = 'wasatchwise-capitol'
// Database: metric_key = 'wasatchwise-capitol_voltage'
// Pattern: `${building_slug}_voltage`
```

---

## ✅ Success Criteria

Phase 3 is complete when:
- ✅ No polling in Scene.tsx
- ✅ Realtime subscriptions active
- ✅ Buildings update instantly on database changes
- ✅ All 12 buildings render correctly
- ✅ WebSocket connection stable
- ✅ No console errors

---

## 🚨 Potential Issues & Solutions

### Issue 1: Environment Variables Missing
**Solution:** Check `.env.local` for Supabase credentials

### Issue 2: Realtime Not Connecting
**Solution:** Verify tables are in `supabase_realtime` publication

### Issue 3: Metric Keys Don't Match
**Solution:** Verify metric_key pattern: `${building_slug}_voltage`

### Issue 4: Building IDs Don't Match
**Solution:** Verify `building_slug` values match `config.id` in code

---

## 📁 Files to Modify

1. `apps/dashboard/lib/supabase/GlobalPulse.ts`
   - Update subscription logic (if needed)
   - Verify metric_key pattern

2. `apps/dashboard/app/dashboard/command-center/Scene.tsx`
   - Remove polling
   - Add Realtime subscriptions
   - Initialize GlobalPulse

3. `apps/dashboard/app/api/pulse/buildings/route.ts` (Optional)
   - May be deprecated after migration
   - Can remove if not used elsewhere

---

## ⏱️ Time Estimate

- **Step 1:** 15 minutes (GlobalPulse updates)
- **Step 2:** 15 minutes (Scene.tsx updates)
- **Step 3:** 10 minutes (Testing)
- **Total:** ~40 minutes

---

## 🎯 Ready to Execute

**Status:** All prerequisites met
- ✅ Database populated
- ✅ Realtime enabled
- ✅ building_slug mapping in place
- ✅ Code structure understood

**Next Action:** Begin Step 1 (Update GlobalPulse.ts)

---

*Production Manager: Auto*  
*Production Designer: Claude*  
*Date: January 26, 2026*
