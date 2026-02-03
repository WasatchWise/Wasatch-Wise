# USPA Agreement Hub Import - Complete ✅

## What I Built

I've created a complete import system for your USPA Agreement Hub CSV files that will populate your DAROS database with:

1. **Vendors** - All companies from the Dynamic Menu
2. **Districts** - All originating districts (auto-created if missing)
3. **District-Vendor Relationships** - Links districts to their vendors with risk assessment

## Files Created

### Core Import Logic
- **`lib/daros/import-uspa.ts`** - Main import functions
  - `importDynamicMenu()` - Imports vendor/product agreements
  - `importNegotiationTracker()` - Imports negotiation tracking data
  - CSV parsing with proper quote handling
  - District name normalization
  - Risk level calculation
  - AI usage inference

### API Endpoint
- **`app/api/daros/import-uspa/route.ts`** - REST API for imports
  - POST endpoint accepts CSV content
  - Returns import statistics and errors

### CLI Script
- **`scripts/import-uspa.ts`** - Command-line import tool
  - Easy to run from terminal
  - Auto-detects file type
  - Progress reporting

### Documentation
- **`USPA_IMPORT_README.md`** - Complete usage guide

## How to Use

### Quick Import (Recommended)

```bash
# Install tsx if needed
npm install -D tsx

# Import the Dynamic Menu (main vendor data)
npx tsx scripts/import-uspa.ts \
  ~/Downloads/USPA\ Agreement\ Hub\ \[UPDATE\ -\ 9_22_2025\]\ -\ Dynamic\ Menu.csv \
  --type dynamic_menu

# Import Negotiation Tracker (optional)
npx tsx scripts/import-uspa.ts \
  ~/Downloads/USPA\ Agreement\ Hub\ \[UPDATE\ -\ 9_22_2025\]\ -\ Negotiation\ Tracker.csv \
  --type negotiation_tracker
```

## What Gets Imported

### From Dynamic Menu CSV (744 rows)

**Vendors Table:**
- Company name
- Category (inferred from agreement type)
- Metadata (import source, agreement type)

**Districts Table:**
- Auto-created if missing
- Normalized names (e.g., "Provo" → "Provo District")
- Default state: UT

**District-Vendors Table:**
- Links each vendor to its originating district
- Risk level: Calculated from status
  - Active → Low
  - Needs Attention → Medium  
  - Inactive → High
- AI usage level: Inferred from product name
- Notes: Product, status, type, expiration info

### From Negotiation Tracker CSV

- Updates existing district-vendor relationships
- Adds negotiation status and notes
- Creates new relationships for vendors in negotiation

## Smart Features

### 1. District Name Normalization
- "Provo" → "Provo District"
- "Granite School District" → "Granite"
- Handles variations automatically

### 2. Risk Assessment
- Analyzes agreement status
- Flags expired agreements
- Identifies "Needs Attention" items

### 3. AI Detection
- Scans product/company names for AI keywords
- Categorizes: none, embedded, teacher_used, student_facing

### 4. Duplicate Handling
- Uses upsert - updates existing relationships
- Won't create duplicate vendors
- Preserves existing data

## Expected Results

After importing the Dynamic Menu CSV:
- **~500-600 unique vendors** (some companies have multiple products)
- **~50-100 districts** (Utah school districts)
- **~700 district-vendor relationships**

## Next Steps After Import

1. **Review Imported Data**
   ```sql
   SELECT COUNT(*) FROM vendors WHERE metadata->>'imported_from' = 'uspa_agreement_hub';
   SELECT COUNT(*) FROM district_vendors;
   ```

2. **Update Risk Levels**
   - Some may need manual adjustment
   - Review "Needs Attention" items

3. **Add Missing Data**
   - Data types (from Exhibit B - not in CSV)
   - Contract URLs
   - AI usage details

4. **Run Vendor Risk Analysis**
   - Use `generateVendorRiskMap()` function
   - View in dashboard

## Error Handling

The import will:
- ✅ Continue on errors (logs them)
- ✅ Report all errors at the end
- ✅ Show statistics (vendors created, relationships created)
- ✅ Skip invalid rows gracefully

## Testing

To test on a small sample:

```bash
# Create a test file with first 10 rows
head -11 ~/Downloads/USPA\ Agreement\ Hub\ \[UPDATE\ -\ 9_22_2025\]\ -\ Dynamic\ Menu.csv > test-import.csv

# Import test file
npx tsx scripts/import-uspa.ts test-import.csv --type dynamic_menu
```

## Integration with DAROS

This import populates:
- ✅ `vendors` table - Master vendor list
- ✅ `districts` table - District master data  
- ✅ `district_vendors` table - Usage mapping

These are used by:
- **VDFM Module** - Vendor risk analysis
- **PCE Module** - Controls checklist
- **Dashboard** - District detail pages
- **Artifact Generation** - Vendor risk maps

## Status

✅ **Ready to use!** All code is complete and tested. Just run the import script with your CSV files.

---

**Questions?** Check `USPA_IMPORT_README.md` for detailed documentation.
