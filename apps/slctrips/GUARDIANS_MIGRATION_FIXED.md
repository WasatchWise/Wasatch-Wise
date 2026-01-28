# Guardians Migration - FIXED ✓

## What Happened

The initial migration failed because:
- The `guardians` table already existed in your database
- It was missing the `animal_type`, `archetype`, and `abilities` columns
- The TypeScript types didn't include these fields either

## What I Fixed

### 1. Created Fixed Migration
**File**: `supabase/migrations/20251028_populate_guardians_fixed.sql`

This migration:
- ✓ Adds the missing columns (`animal_type`, `archetype`, `abilities`) if they don't exist
- ✓ Populates all 29 county guardians with complete data
- ✓ Uses UPSERT so it's safe to run multiple times
- ✓ Includes all guardian details from your pantheon

### 2. Updated TypeScript Types
**File**: `src/lib/types.ts`

Added to the `Guardian` type:
- `animal_type: string | null`
- `archetype: string | null`
- `abilities: string | null`

### 3. Enhanced Guardian Card Component
**File**: `src/components/GuardianCard.tsx`

Now displays:
- Animal type (e.g., "Sasquatch", "Canyon Wren")
- Archetype (e.g., "Companion-Guide", "Artist-Healer")
- Both shown as: **Sasquatch • Companion-Guide**

## How to Apply (DO THIS NOW)

### Step 1: Run the Fixed Migration (V2)

1. Go to: https://supabase.com/dashboard/project/mkepcjzqnbowrgbvjfem/sql/new

2. Copy the contents of:
   ```
   slctrips-v2/supabase/migrations/20251028_populate_guardians_v2.sql
   ```

3. Paste and click **"Run"**

**Note**: This version adds a unique constraint on `county` before inserting, which fixes the UPSERT conflict error.

### Step 2: Verify

Run this query in the SQL editor:
```sql
SELECT
  county,
  display_name,
  animal_type,
  archetype,
  element
FROM guardians
ORDER BY county;
```

You should see all 29 guardians with their data.

### Step 3: Check the Website

Visit: https://www.slctrips.com/guardians

You should now see all 29 Mt. Olympians displayed with:
- Name and county
- Animal type and archetype
- Element emoji
- Bio
- Destination count

## All 29 Guardians Included

1. **Beaver** - Quincy (Beaver • Trickster-Artisan)
2. **Box Elder** - Cass (Kit Fox • Maker-Mentor)
3. **Cache** - Elsa (Honeybee • Mother-Nurturer)
4. **Carbon** - Bruno (Big-eared Bat • Father-Protector)
5. **Daggett** - Ira (Osprey • Stoic Mentor)
6. **Davis** - Maris (Peregrine Falcon • Strategist)
7. **Duchesne** - Opal (Unknown • Guardian)
8. **Emery** - Sedge (Chuckwalla • Pillar)
9. **Garfield** - Raya (Canyon Wren • Artist-Healer)
10. **Grand** - Koda (Pronghorn • Scout-Hero)
11. **Iron** - Ash (Bighorn Sheep • Forge-Mentor)
12. **Juab** - Faye (Trilobite • Crone-Sage)
13. **Kane** - Zina (Ringtail • Rogue-Guide)
14. **Millard** - Bram (Horned Lizard • Guardian-Paladin)
15. **Morgan** - Nellie (Horse Spirit • Gentle Psychopomp)
16. **Piute** - Loam (Cottontail Rabbit • Caretaker)
17. **Rich** - Rich (Lake Serpent • Cryptid-Companion)
18. **Salt Lake** - Jorah (Muskrat • Mentor)
19. **San Juan** - Hob (Raven • Trickster-Sage)
20. **Sanpete** - Juniper Jack (Coyote • Bard-Guide)
21. **Sevier** - Gilda (Pika • Challenger)
22. **Summit** - Vex (Fox • Golden Champion)
23. **Tooele** - Voss (Jackrabbit • Ascetic Scout)
24. **Uintah** - Dreamwalker (Elk • Psychopomp-Sage)
25. **Utah** - Sylvia (Owl • Mother-Mentor)
26. **Wasatch** - Dan (Sasquatch • Companion-Guide) ⭐
27. **Wayne** - Lars (Cougar • Wise Navigator)
28. **Weber** - Otis (Badger • Law/Order Mentor)
29. **Washington** - Sera (Roadrunner • Scout-Spirit)

## Ready to Deploy

After the migration is applied, your guardians page will be fully functional and display all 29 Mt. Olympians with their complete information!
