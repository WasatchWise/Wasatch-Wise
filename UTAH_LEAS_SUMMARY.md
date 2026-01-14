# Utah LEAs Database Summary

## Overview

As of January 2026, Utah has **157 Local Education Agencies (LEAs)**:
- **41 School Districts**
- **116 Charter Schools**

## Database Status

### Seeded LEAs
- **Total in Database**: 124 LEAs
- **School Districts**: 35
- **Charter Schools**: 89
- **From Import**: Some districts were created during the USPA import

### Missing LEAs
Some LEAs may not be in the database yet if they:
- Weren't in the USPA Agreement Hub CSV
- Weren't successfully created during seeding
- Have different naming conventions

## Files Created

### 1. Seed Script
- **`lib/daros/seed-utah-leas.ts`** - Seeds all 157 official LEAs
- **`scripts/seed-utah-leas.ts`** - CLI script to run seeding

### 2. District Normalizer
- **`lib/daros/district-normalizer.ts`** - Maps CSV names to official LEA names
- Handles common variations (e.g., "Provo" → "Provo City School District")
- Updated import to use normalized names

### 3. Updated Import
- **`lib/daros/import-uspa.ts`** - Now uses district normalizer
- Maps CSV originator names to official LEA names
- Creates districts if they don't exist (but should be seeded first)

## Usage

### Seed All LEAs
```bash
npx tsx scripts/seed-utah-leas.ts
```

### Verify LEAs
```sql
-- Count by type
SELECT 
  metadata->>'type' as type,
  COUNT(*) as count
FROM districts
WHERE state = 'UT'
GROUP BY metadata->>'type';

-- List all LEAs
SELECT name, metadata->>'type' as type
FROM districts
WHERE state = 'UT'
ORDER BY metadata->>'type', name;
```

## Next Steps

1. **Verify all 157 LEAs are present**
   - Run seed script again (it skips existing)
   - Check for any missing LEAs

2. **Update existing district-vendor relationships**
   - Re-run import with normalized names
   - Or update existing relationships to use official names

3. **Add missing LEAs manually** (if any)
   - Some charters may have closed/merged
   - Some may use different names

## District Name Normalization

The normalizer handles common variations:
- "Provo" → "Provo City School District"
- "Granite" → "Granite School District"
- "Tooele District" → "Tooele County School District"
- "Washington District" → "Washington County School District"

See `lib/daros/district-normalizer.ts` for full mapping.
