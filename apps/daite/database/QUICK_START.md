# Quick Migration Start Guide

## Current Error Fix

You're seeing: **"New tables not found! Please run database/schema.sql first"**

This means you're trying to run **Step 4** before completing **Step 3**.

---

## Check Your Current Status

**Run this first:** `check-migration-status.sql`

This will tell you exactly which step you're on and what to do next.

---

## The 4 Steps (In Order)

### Step 1-2: Backup & Rename
```sql
-- Run: migrate-with-data.sql (Steps 1-2 only)
-- Or copy/paste just the backup and rename sections
```

### Step 3: Create New Schema ⭐ **YOU ARE HERE**
```sql
-- Open: database/schema.sql
-- Copy the ENTIRE file (all 1,223 lines)
-- Paste into Supabase SQL Editor
-- Click "Run"
-- Wait for it to complete (may take 30-60 seconds)
```

### Step 4: Migrate Data
```sql
-- AFTER Step 3 completes, run: migrate-with-data.sql (Step 4)
-- This will move your 2 users and 2 agents to new tables
```

### Step 5: Verify
```sql
-- Run: verify-migration.sql
-- Should show: 2 users, 2 agents migrated
```

---

## Quick Fix for Your Current Error

**Right now, you need to:**

1. ✅ Open `database/schema.sql` in your editor
2. ✅ Select ALL (Cmd+A / Ctrl+A)
3. ✅ Copy (Cmd+C / Ctrl+C)
4. ✅ Go to Supabase SQL Editor
5. ✅ Paste the entire file
6. ✅ Click "Run" button
7. ✅ Wait for success message
8. ✅ THEN go back and run Step 4

---

## Still Confused?

Run `check-migration-status.sql` - it will tell you exactly what step you're on!

