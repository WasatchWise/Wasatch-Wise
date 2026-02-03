# Phase 3 Quick Start Guide
**Production Manager:** Auto  
**Status:** Ready to Execute  
**Estimated Time:** 35 minutes

---

## 🎯 What We're Doing

Replace polling in `Scene.tsx` with Realtime subscriptions from `GlobalPulse.ts`.

---

## ✅ Prerequisites (Verify First)

1. **Environment Variables:**
   ```bash
   # Check apps/dashboard/.env.local
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

2. **Database Status:**
   - ✅ Tables populated (8 metrics, 12 buildings, 4 health)
   - ✅ Realtime enabled
   - ✅ building_slug column exists

---

## 📝 Step-by-Step Implementation

### Step 1: Update Scene.tsx (20 min)

**File:** `apps/dashboard/app/dashboard/command-center/Scene.tsx`

**Changes:**

1. **Add imports:**
   ```typescript
   import { initializeGlobalPulse, getGlobalPulse } from '@/lib/supabase/GlobalPulse';
   ```

2. **Initialize GlobalPulse in useEffect:**
   ```typescript
   useEffect(() => {
     // ... existing setup code ...
     
     // Initialize GlobalPulse
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
     const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
     const globalPulse = initializeGlobalPulse(supabaseUrl, supabaseKey);
     
     // Subscribe to each building's health updates
     const unsubscribeFunctions: (() => void)[] = [];
     
     for (const building of buildings) {
       globalPulse.subscribeToBuildingHealth(
         building.config.id, // e.g., 'wasatchwise-capitol'
         (health) => {
           building.updateHealth(health);
         }
       ).then((unsubscribe) => {
         unsubscribeFunctions.push(unsubscribe);
       });
     }
     
     // Initial health calculation for all buildings
     Promise.all(
       buildings.map(b => 
         globalPulse.calculateBuildingHealth(b.config.id)
           .then(health => b.updateHealth(health))
       )
     );
     
     // Cleanup
     return () => {
       unsubscribeFunctions.forEach(fn => fn());
       globalPulse.destroy();
     };
   }, []);
   ```

3. **Remove polling code:**
   - Delete `const poll = async () => { ... }`
   - Delete `await poll();`
   - Delete `interval = window.setInterval(poll, 5000);`
   - Delete `if (interval) clearInterval(interval);` from cleanup

### Step 2: Verify Environment Variables (5 min)

**Check:** `apps/dashboard/.env.local`

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**If missing:** Get from Supabase Dashboard → Settings → API

### Step 3: Test (10 min)

1. **Start dev server:**
   ```bash
   cd apps/dashboard
   npm run dev
   ```

2. **Navigate to:** `http://localhost:3000/dashboard/command-center`

3. **Update a metric in Supabase SQL Editor:**
   ```sql
   UPDATE city_metrics 
   SET value = 75, last_updated = NOW()
   WHERE metric_key = 'wasatchwise-capitol_voltage';
   ```

4. **Verify:**
   - ✅ Building updates instantly (no 5-second delay)
   - ✅ No console errors
   - ✅ All 12 buildings render
   - ✅ WebSocket connection active (check Network tab)

---

## 🔍 Key Code Locations

| File | Location | What to Change |
|------|----------|----------------|
| `Scene.tsx` | `apps/dashboard/app/dashboard/command-center/Scene.tsx` | Replace polling with subscriptions |
| `GlobalPulse.ts` | `apps/dashboard/lib/supabase/GlobalPulse.ts` | ✅ Already correct (no changes needed) |

---

## ✅ Success Criteria

- [ ] No `setInterval` in Scene.tsx
- [ ] GlobalPulse initialized
- [ ] Subscriptions active for all 12 buildings
- [ ] Buildings update instantly on database changes
- [ ] No console errors
- [ ] Cleanup on unmount

---

## 🚨 Troubleshooting

### Issue: "GlobalPulse not initialized"
**Solution:** Check environment variables are set

### Issue: No updates received
**Solution:** 
1. Verify Realtime enabled: Run `PHASE1_VERIFY_REALTIME.sql`
2. Check WebSocket connection in browser Network tab
3. Verify metric_key pattern: `${building_slug}_voltage`

### Issue: TypeScript errors
**Solution:** Ensure imports are correct and types match

---

## 📊 Current State

**Database:**
- ✅ 3 tables populated
- ✅ Realtime enabled
- ✅ building_slug mapping in place

**Code:**
- ✅ GlobalPulse.ts ready
- ⏳ Scene.tsx needs update (polling → Realtime)

---

## 🎯 Next Session Checklist

1. [ ] Read this guide
2. [ ] Verify environment variables
3. [ ] Update Scene.tsx
4. [ ] Test real-time updates
5. [ ] Verify all buildings render
6. [ ] Check for console errors

---

**Status:** Ready to execute  
**Time:** ~35 minutes  
**Risk:** Low (foundation is solid)

---

*Production Manager: Auto*  
*Date: January 26, 2026*
