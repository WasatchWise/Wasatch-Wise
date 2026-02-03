# Run USPA Import

The import script is working but takes 5-10 minutes to process all 1189 rows. 

## Run in Your Terminal

```bash
cd /Users/johnlyman/Desktop/wasatchwise
npx tsx scripts/import-uspa.ts \
  "/Users/johnlyman/Downloads/USPA Agreement Hub [UPDATE - 9_22_2025] - Dynamic Menu.csv" \
  --type dynamic_menu
```

## What to Expect

- Progress updates every 50 rows
- Processing ~1189 rows total
- Takes 5-10 minutes
- Shows final statistics when complete

## After Import Completes

Check results:

```sql
-- Count imported vendors
SELECT COUNT(*) FROM vendors WHERE metadata->>'imported_from' = 'uspa_agreement_hub';

-- Count district-vendor relationships  
SELECT COUNT(*) FROM district_vendors;

-- Count imported districts
SELECT COUNT(*) FROM districts WHERE metadata->>'imported_from' = 'uspa_agreement_hub';
```

Expected results:
- ~500-600 unique vendors
- ~50-100 districts
- ~700 district-vendor relationships
