# Phase 2 Execution Guide - FINAL
**Production Manager:** Auto  
**Status:** Ready - Schema confirmed, corrected files prepared

---

## 🎯 Phase 2 Goals

1. **Add building_slug column** - Bridge code's string IDs with database UUIDs
2. **Create missing tables** - Ensure all tables exist
3. **Insert Initial Data** - Populate tables with seed data (corrected schema)
4. **Enable Realtime** - Verify WebSocket subscriptions

---

## ✅ Step 1: Create Missing Tables (2 minutes)

**File:** `PHASE1_CREATE_MISSING_TABLES.sql`

**Why:** Ensure `city_metrics` and `system_health` exist.

**Execute:**
1. Open Supabase SQL Editor
2. Open `PHASE1_CREATE_MISSING_TABLES.sql`
3. Copy SQL
4. Paste and run

**Verify:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('city_metrics', 'building_registry', 'system_health');
-- Should return all three tables
```

---

## ✅ Step 2: Add Building Slug Column (2 minutes)

**File:** `PHASE1_ADD_BUILDING_SLUG.sql`

**Why:** Code uses string IDs like `'wasatchwise-capitol'`, database uses UUIDs. This column bridges them.

**Execute:**
1. Still in SQL Editor
2. Open `PHASE1_ADD_BUILDING_SLUG.sql`
3. Copy SQL
4. Paste and run

**Verify:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'building_registry' 
AND column_name = 'building_slug';
-- Should return: building_slug
```

---

## ✅ Step 3: Insert Data (10 minutes)

**File:** `PHASE1_DATA_INSERT_CORRECTED.sql`

**What it does:**
- Inserts 8 city metrics
- Inserts 12 buildings with `building_slug` mapping
- Inserts 4 system health records

**Schema matches:**
- ✅ `type` (not `building_type`)
- ✅ `footprint_width`, `footprint_height` (not `size_x`, `size_y`)
- ✅ `building_slug` for code mapping
- ✅ `building_id` auto-generated UUID

**Execute:**
1. Still in SQL Editor
2. Open `PHASE1_DATA_INSERT_CORRECTED.sql`
3. Copy ALL SQL
4. Paste and run

**Verify Success:**
```sql
SELECT COUNT(*) FROM city_metrics; -- Should be 8
SELECT COUNT(*) FROM building_registry; -- Should be 12
SELECT COUNT(*) FROM system_health; -- Should be 4

-- Check building_slug mapping
SELECT building_slug, display_name, building_id FROM building_registry;
-- Should show all 12 buildings with slug and UUID
```

---

## ✅ Step 4: Enable Realtime (5 minutes)

**File:** `PHASE1_REALTIME_ENABLE_FIXED.sql` ⚠️ **Use this fixed version!**

**What changed:**
- Removed comment on `residents` view (view may not exist)
- Only comments on tables that definitely exist

**Execute:**
1. Open `PHASE1_REALTIME_ENABLE_FIXED.sql`
2. Copy SQL
3. Run

**Verify:**
- Go to Database → Replication
- Verify 3 tables enabled for Realtime

**Note:** If you want to create/comment the `residents` view separately:
- Run `PHASE1_VERIFY_RESIDENTS_VIEW.sql` to check if it exists
- If missing, run `PHASE1_CREATE_RESIDENTS_VIEW.sql` to create it

---

## 📋 Phase 2 Checklist

### Schema Setup:
- [ ] Run `PHASE1_CREATE_MISSING_TABLES.sql`
- [ ] Verify all 3 tables exist
- [ ] Run `PHASE1_ADD_BUILDING_SLUG.sql`
- [ ] Verify `building_slug` column exists

### Data Insertion:
- [ ] Run `PHASE1_DATA_INSERT_CORRECTED.sql`
- [ ] Verify 8 metrics inserted
- [ ] Verify 12 buildings inserted (with building_slug)
- [ ] Verify 4 health records inserted

### Realtime Setup:
- [ ] Run `PHASE1_REALTIME_ENABLE.sql`
- [ ] Verify Realtime enabled

---

## 🎯 Success Criteria

Phase 2 is complete when:
- ✅ All 3 tables exist
- ✅ `building_slug` column added
- ✅ All tables have initial data
- ✅ Buildings have slug-to-UUID mapping
- ✅ Realtime enabled and working

---

## 📊 What You'll Have

1. **Populated Database**
   - 8 city metrics
   - 12 buildings (with UUID building_id + string building_slug)
   - 4 system health monitors

2. **Code-Database Mapping**
   - `building_slug` bridges code's string IDs to database UUIDs
   - Code can query by `building_slug` to find UUID `building_id`
   - Future: Update code to use `building_slug` for lookups

3. **Working Realtime**
   - WebSocket connections active
   - Live updates flowing
   - Buildings responding to changes

---

## 🔄 Future Code Updates

When updating `GlobalPulse.ts` or building queries:

```typescript
// Query by building_slug (code's string ID)
const { data } = await supabase
  .from('building_registry')
  .select('building_id, display_name, grid_x, grid_y')
  .eq('building_slug', 'wasatchwise-capitol')
  .single();

// Use building_id (UUID) for joins or references
const buildingId = data.building_id;
```

---

**Status:** Ready for execution  
**Files (in order):**
1. `PHASE1_CREATE_MISSING_TABLES.sql` (run first)
2. `PHASE1_ADD_BUILDING_SLUG.sql` (run second)
3. `PHASE1_DATA_INSERT_CORRECTED.sql` (run third)
4. `PHASE1_REALTIME_ENABLE.sql` (run fourth)

**Time Estimate:** 20 minutes total  
**Next:** Execute Step 1 (create missing tables)

**Ready to proceed!** 🚀
