# USPA Agreement Hub Data Import

Import vendor/product data from USPA Agreement Hub CSV files into DAROS.

## Files

- **Dynamic Menu CSV**: Vendor/product agreements with districts (744 rows)
- **Negotiation Tracker CSV**: Active vendor negotiations

## Quick Start

### Option 1: Using the API Route

```bash
# Import Dynamic Menu
curl -X POST http://localhost:3000/api/daros/import-uspa \
  -H "Content-Type: application/json" \
  -d '{
    "type": "dynamic_menu",
    "csvContent": "'"$(cat ~/Downloads/USPA\ Agreement\ Hub\ \[UPDATE\ -\ 9_22_2025\]\ -\ Dynamic\ Menu.csv | jq -Rs .)"'"
  }'
```

### Option 2: Using the CLI Script

```bash
# Make sure tsx is installed
npm install -D tsx

# Import Dynamic Menu
npx tsx scripts/import-uspa.ts ~/Downloads/USPA\ Agreement\ Hub\ \[UPDATE\ -\ 9_22_2025\]\ -\ Dynamic\ Menu.csv --type dynamic_menu

# Import Negotiation Tracker
npx tsx scripts/import-uspa.ts ~/Downloads/USPA\ Agreement\ Hub\ \[UPDATE\ -\ 9_22_2025\]\ -\ Negotiation\ Tracker.csv --type negotiation_tracker
```

## What Gets Imported

### Dynamic Menu Import

1. **Vendors** (`vendors` table)
   - Company name
   - Category (inferred from agreement type)
   - Metadata (import source, agreement type)

2. **Districts** (`districts` table)
   - Created if they don't exist
   - Normalized names (removes "District", "School District", etc.)
   - Defaults to UT state

3. **District-Vendor Relationships** (`district_vendors` table)
   - Links districts to vendors
   - Risk level (calculated from status)
   - AI usage level (inferred from product name)
   - Notes (product, status, type, expiration info)

### Negotiation Tracker Import

- Updates existing `district_vendors` relationships with negotiation status
- Creates new relationships for vendors in negotiation
- Adds negotiation notes and status

## Data Mapping

### Risk Level Calculation

| Status | Risk Level |
|--------|------------|
| Active | Low |
| Needs Attention | Medium |
| Inactive | High |
| "Seek New Agreement" | High |

### AI Usage Level Inference

- **none**: No AI keywords detected
- **embedded**: AI detected, generic usage
- **teacher_used**: AI in teacher tools
- **student_facing**: AI in student-facing products

### Agreement Type → Category

- `USBE STATEWIDE` / `UEN Statewide` → "Statewide Agreement"
- `Vendor Specific` → "Vendor-Specific Agreement"
- `Exhibit E` → "Subscribable Agreement"
- Other → "Other"

## Skipped Rows

The import skips:
- Rows without Company or Product
- Statewide/system agreements (USBE STATEWIDE, UEN Statewide, STEM Action Center)
- Incomplete rows

## After Import

Check your data:

```sql
-- Count imported vendors
SELECT COUNT(*) FROM vendors WHERE metadata->>'imported_from' = 'uspa_agreement_hub';

-- Count district-vendor relationships
SELECT COUNT(*) FROM district_vendors;

-- View imported districts
SELECT name, state, metadata->>'imported_from' as source 
FROM districts 
WHERE metadata->>'imported_from' = 'uspa_agreement_hub'
ORDER BY name;
```

## Troubleshooting

### "District not found" errors
- Districts are created automatically
- Check district name normalization in logs
- Verify state is 'UT' (default)

### "Vendor not found" errors
- Vendors are created automatically
- Check for special characters in company names
- Verify CSV parsing (quoted fields)

### Duplicate relationships
- The import uses `upsert` - existing relationships are updated
- Check `district_vendors` for duplicates manually if needed

## Next Steps

After import:
1. Review imported vendors in dashboard
2. Update risk levels manually if needed
3. Add data types from Exhibit B (not in CSV)
4. Link contracts/agreements (contract_url field)
5. Run vendor risk analysis

## Files

- `lib/daros/import-uspa.ts` - Import logic
- `app/api/daros/import-uspa/route.ts` - API endpoint
- `scripts/import-uspa.ts` - CLI script
