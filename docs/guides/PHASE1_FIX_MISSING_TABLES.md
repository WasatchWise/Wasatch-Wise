# Phase 1 Fix: Missing Tables
**Production Manager:** Auto  
**Issue:** `system_health` table doesn't exist

---

## 🔍 Problem

The verification query failed because `system_health` table wasn't created during Phase 1.

**What exists:**
- ✅ `building_registry` (confirmed by index output)
- ❓ `city_metrics` (unknown)
- ❌ `system_health` (confirmed missing)

---

## ✅ Solution

### Step 1: Verify What Exists (1 minute)

**File:** `PHASE1_VERIFY_TABLES.sql`

Run this to see which tables actually exist.

### Step 2: Create Missing Tables (2 minutes)

**File:** `PHASE1_CREATE_MISSING_TABLES.sql`

This will:
- Create `city_metrics` if missing
- Create `system_health` if missing
- Create indexes
- Verify all three tables exist

**Execute:**
1. Open `PHASE1_CREATE_MISSING_TABLES.sql`
2. Copy SQL
3. Run in Supabase SQL Editor

### Step 3: Verify Schema (1 minute)

**File:** `PHASE1_VERIFY_SCHEMA.sql`

Now that all tables exist, verify the column names to choose the correct INSERT file.

---

## 📋 Execution Order

1. ✅ Run `PHASE1_VERIFY_TABLES.sql` → See what exists
2. ✅ Run `PHASE1_CREATE_MISSING_TABLES.sql` → Create missing tables
3. ✅ Run `PHASE1_VERIFY_SCHEMA.sql` → Check column names
4. ✅ Choose INSERT file (A or B) → Based on schema
5. ✅ Run data insertion → Insert seed data

---

## 🎯 Expected Result

After Step 2, you should have:
- ✅ `city_metrics` table
- ✅ `building_registry` table  
- ✅ `system_health` table

All three tables with proper indexes.

---

**Status:** Ready to fix  
**Time:** ~5 minutes total  
**Next:** Run `PHASE1_CREATE_MISSING_TABLES.sql`
