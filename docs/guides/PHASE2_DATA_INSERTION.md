# Phase 2: Data Insertion & Realtime Testing
**Production Manager:** Auto  
**Production Designer:** Claude  
**Status:** Ready to Execute  
**Prerequisites:** Phase 1 Complete ✅

---

## 🎯 Phase 2 Goals

1. **Insert Initial Data** - Populate tables with seed data
2. **Test Realtime Connection** - Verify WebSocket subscriptions work
3. **Update Code** - Connect GlobalPulse to new schema
4. **Validate End-to-End** - Test real-time updates in UI

---

## ✅ Step 1: Add External ID Column (2 minutes)

### File: `PHASE1_ADD_EXTERNAL_ID.sql` (NEW - run this first!)

**Why needed:**
- Code uses string IDs like `'wasatchwise-capitol'`
- Database uses UUIDs for `building_id`
- Need `external_id` column to map them

**Execute:**
1. Open `PHASE1_ADD_EXTERNAL_ID.sql`
2. Copy SQL
3. Run in Supabase SQL Editor

---

## ✅ Step 2: Insert Initial Data (10 minutes)

### File: `PHASE1_DATA_INSERT_FINAL.sql` (CORRECTED - use this one!)

**Execute:**
1. Open Supabase SQL Editor
2. Open `PHASE1_DATA_INSERT.sql`
3. Copy ALL SQL
4. Paste and run

**What it does:**
- Inserts 8 city metrics (total_revenue, system_voltage, etc.)
- Inserts 12 buildings (all your building types)
- Inserts 4 system health records (supabase, sendgrid, vertex_ai, vercel)

**Verify Success:**
```sql
SELECT COUNT(*) FROM city_metrics; -- Should be 8
SELECT COUNT(*) FROM building_registry; -- Should be 12
SELECT COUNT(*) FROM system_health; -- Should be 4
```

---

## ✅ Step 2: Enable Realtime (5 minutes)

### File: `PHASE1_REALTIME_ENABLE.sql` (already created)

**Execute:**
1. Still in SQL Editor
2. Open `PHASE1_REALTIME_ENABLE.sql`
3. Copy SQL
4. Paste and run

**What it does:**
- Enables Realtime on `city_metrics`
- Enables Realtime on `building_registry`
- Enables Realtime on `system_health`
- Adds helpful comments

**Verify Success:**
- Go to Database → Replication
- Verify 3 tables show as enabled for Realtime

---

## ✅ Step 3: Test Realtime Connection (10 minutes)

### Create Test File: `test-realtime.html`

1. **Create file** anywhere on your computer
2. **Copy this code:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>WasatchVille Realtime Test</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <h1>WasatchVille Global Pulse Test</h1>
  <div id="status">Connecting...</div>
  <div id="metrics"></div>
  
  <script>
    // REPLACE WITH YOUR CREDENTIALS
    const SUPABASE_URL = 'YOUR_SUPABASE_URL'
    const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Subscribe to city_metrics changes
    const channel = supabase
      .channel('global-pulse')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'city_metrics' },
        (payload) => {
          console.log('✅ Metric updated:', payload)
          document.getElementById('status').innerHTML = 
            `✅ LIVE - Last update: ${new Date().toLocaleTimeString()}`
          displayMetrics()
        }
      )
      .subscribe()
    
    // Fetch and display metrics
    async function displayMetrics() {
      const { data, error } = await supabase
        .from('city_metrics')
        .select('*')
      
      if (error) {
        document.getElementById('metrics').innerHTML = `❌ Error: ${error.message}`
        return
      }
      
      document.getElementById('metrics').innerHTML = data.map(m => 
        `<div><strong>${m.metric_key}</strong>: ${m.value} (${m.trend})</div>`
      ).join('')
    }
    
    displayMetrics()
    
    // Test: Update a metric every 5 seconds
    setInterval(async () => {
      await supabase
        .from('city_metrics')
        .update({ value: Math.random() * 1000, last_updated: new Date().toISOString() })
        .eq('metric_key', 'system_voltage')
    }, 5000)
  </script>
</body>
</html>
```

3. **Get your credentials:**
   - Supabase Dashboard → Settings → API
   - Copy Project URL and anon public key

4. **Replace placeholders** in the HTML

5. **Open in browser**

6. **Expected Result:**
   - Metrics display on page
   - Updates happen automatically every 5 seconds
   - Console shows "✅ LIVE" messages

**If this works:** ✅ Realtime is configured correctly!

---

## ✅ Step 4: Update GlobalPulse.ts (15 minutes)

### File to Update: `apps/dashboard/lib/supabase/GlobalPulse.ts`

**Changes needed:**

1. **Update table name** (if needed):
   ```typescript
   // Should already be 'city_metrics' (no prefix)
   .from('city_metrics')
   ```

2. **Verify Realtime subscription** is using correct table:
   ```typescript
   .on('postgres_changes', {
     event: 'UPDATE',
     schema: 'public',
     table: 'city_metrics', // Should match new table
     filter: `metric_key=eq.${buildingId}_voltage`
   }, ...)
   ```

**Test:**
- Start dev server: `npm run dev`
- Navigate to `/dashboard/command-center`
- Open Supabase SQL Editor
- Update a metric:
  ```sql
  UPDATE city_metrics 
  SET value = 75, last_updated = NOW()
  WHERE metric_key = 'wasatchwise-capitol_voltage';
  ```
- Watch building update in real-time! 🎉

---

## ✅ Step 5: Update Scene.tsx (10 minutes)

### File to Update: `apps/dashboard/app/dashboard/command-center/Scene.tsx`

**Changes needed:**

1. **Remove polling code** (if still present)
2. **Add Realtime subscriptions** (if not already done)

**Verify:**
- No `setInterval` for polling
- Uses `globalPulse.subscribeToBuildingHealth` instead
- Buildings update when database changes

---

## 📋 Phase 2 Checklist

### Data Insertion:
- [ ] Run `PHASE1_DATA_INSERT.sql`
- [ ] Verify 8 metrics inserted
- [ ] Verify 12 buildings inserted
- [ ] Verify 4 health records inserted

### Realtime Setup:
- [ ] Run `PHASE1_REALTIME_ENABLE.sql`
- [ ] Verify Realtime enabled in Database → Replication
- [ ] Test with `test-realtime.html`
- [ ] Confirm automatic updates work

### Code Updates:
- [ ] Update GlobalPulse.ts (if needed)
- [ ] Update Scene.tsx (remove polling)
- [ ] Test real-time updates in UI
- [ ] Verify buildings respond to database changes

---

## 🎯 Success Criteria

Phase 2 is complete when:
- ✅ All tables have initial data
- ✅ Realtime test HTML shows live updates
- ✅ Buildings update in real-time when database changes
- ✅ No polling in code (using Realtime only)
- ✅ No console errors

---

## 📊 What You'll Have After Phase 2

1. **Populated Database**
   - 8 city metrics with values
   - 12 buildings registered
   - 4 system health monitors

2. **Working Realtime**
   - WebSocket connections active
   - Live updates flowing
   - No polling needed

3. **Connected UI**
   - Buildings display real data
   - Updates happen automatically
   - Foundation for Phase 3

---

**Status:** Ready for execution  
**Prerequisites:** Phase 1 complete ✅  
**Time Estimate:** 40 minutes total  
**Next:** Execute Step 1 (data insertion)

**Ready to proceed with Phase 2!** 🚀
