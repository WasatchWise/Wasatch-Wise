# Phase 2 Execution Guide - CORRECTED
**Production Manager:** Auto  
**Status:** Ready - Schema mismatch fixed

---

## 🎯 Phase 2 Goals

1. **Add external_id column** - Bridge code's string IDs with database UUIDs
2. **Insert Initial Data** - Populate tables with seed data (corrected schema)
3. **Enable Realtime** - Verify WebSocket subscriptions
4. **Update Code** - Connect GlobalPulse to new schema

---

## ✅ Step 1: Add External ID Column (2 minutes)

**File:** `PHASE1_ADD_EXTERNAL_ID.sql`

**Why needed:**
- Code uses string IDs: `'wasatchwise-capitol'`
- Database uses UUIDs: `building_id` (auto-generated)
- Need mapping column to connect them

**Execute:**
1. Open Supabase SQL Editor
2. Open `PHASE1_ADD_EXTERNAL_ID.sql`
3. Copy SQL
4. Paste and run

**Verify:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'building_registry' 
AND column_name = 'external_id';
-- Should return: external_id
```

---

## ✅ Step 2: Insert Data (10 minutes)

**File:** `PHASE1_DATA_INSERT_FINAL.sql`

**What it does:**
- Inserts 8 city metrics
- Inserts 12 buildings with `external_id` mapping
- Inserts 4 system health records

**Execute:**
1. Still in SQL Editor
2. Open `PHASE1_DATA_INSERT_FINAL.sql`
3. Copy ALL SQL
4. Paste and run

**Verify Success:**
```sql
SELECT COUNT(*) FROM city_metrics; -- Should be 8
SELECT COUNT(*) FROM building_registry; -- Should be 12
SELECT COUNT(*) FROM system_health; -- Should be 4

-- Check external_id mapping
SELECT external_id, display_name FROM building_registry;
-- Should show all 12 buildings with external_id values
```

---

## ✅ Step 3: Enable Realtime (5 minutes)

**File:** `PHASE1_REALTIME_ENABLE.sql`

**Execute:**
1. Open `PHASE1_REALTIME_ENABLE.sql`
2. Copy SQL
3. Run

**Verify:**
- Go to Database → Replication
- Verify 3 tables enabled for Realtime

---

## ✅ Step 4: Update GlobalPulse.ts (15 minutes)

### File: `apps/dashboard/lib/supabase/GlobalPulse.ts`

**Changes needed:**

1. **Update to use external_id for lookups:**
   ```typescript
   // When querying by building ID, use external_id
   const { data: buildingData } = await this.client
     .from('building_registry')
     .select('building_id')
     .eq('external_id', buildingId) // Use external_id to find UUID
     .single();
   ```

2. **Or update metric_key pattern:**
   ```typescript
   // Keep using buildingId in metric_key (e.g., 'wasatchwise-capitol_voltage')
   .eq('metric_key', `${buildingId}_voltage`)
   ```

**Note:** The metric_key already uses string IDs (e.g., `'wasatchwise-capitol_voltage'`), so the current code should work. The `external_id` column is for future building lookups.

---

## ✅ Step 5: Test Real-Time Updates (10 minutes)

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

4. **Watch building update in real-time!** 🎉

---

## 📋 Phase 2 Checklist

### Schema Update:
- [ ] Run `PHASE1_ADD_EXTERNAL_ID.sql`
- [ ] Verify `external_id` column exists

### Data Insertion:
- [ ] Run `PHASE1_DATA_INSERT_FINAL.sql`
- [ ] Verify 8 metrics inserted
- [ ] Verify 12 buildings inserted (with external_id)
- [ ] Verify 4 health records inserted

### Realtime Setup:
- [ ] Run `PHASE1_REALTIME_ENABLE.sql`
- [ ] Verify Realtime enabled

### Code Updates:
- [ ] Review GlobalPulse.ts (may not need changes)
- [ ] Test real-time updates
- [ ] Verify buildings respond to database changes

---

## 🎯 Success Criteria

Phase 2 is complete when:
- ✅ `external_id` column exists
- ✅ All tables have initial data
- ✅ Buildings have external_id mapping
- ✅ Realtime enabled and working
- ✅ Buildings update in real-time

---

## 📊 What You'll Have

1. **Populated Database**
   - 8 city metrics
   - 12 buildings (with UUID building_id + string external_id)
   - 4 system health monitors

2. **Code-Database Mapping**
   - `external_id` bridges code's string IDs to database UUIDs
   - Code can query by external_id
   - Future: Update code to use external_id for lookups

3. **Working Realtime**
   - WebSocket connections active
   - Live updates flowing
   - Buildings responding to changes

---

**Status:** Ready for execution  
**Files:** 
- `PHASE1_ADD_EXTERNAL_ID.sql` (run first)
- `PHASE1_DATA_INSERT_FINAL.sql` (run second)
- `PHASE1_REALTIME_ENABLE.sql` (run third)

**Time Estimate:** 30 minutes total  
**Next:** Execute Step 1 (add external_id column)

**Ready to proceed!** 🚀
