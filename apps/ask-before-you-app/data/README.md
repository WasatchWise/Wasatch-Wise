# Ask Before You App — Data

Place import CSVs here. They are loaded into Supabase via scripts in `scripts/`.

## Common Sense Media privacy evaluations

**File:** `privacy.csv`

Your scraped Common Sense Media privacy evaluations CSV. Expected columns (from your scrape):

| CSV header           | Description                    |
|----------------------|--------------------------------|
| evaluation-teaser href | URL to the evaluation page   |
| thumbnail src        | URL to product thumbnail       |
| title                | Product / app name             |
| updated-date         | e.g. "Last updated August 30, 2023" |
| tier-icon src        | URL to tier icon (Warning/Pass/Fail) |
| tier-label           | **Warning**, **Pass**, **Fail**, or Common Sense Privacy Seal |
| tier-score           | Optional percentage, e.g. "20%" or empty |

**Import:**

1. Run the Supabase migration so the table exists: apply `lib/supabase/migrations/007_common_sense_privacy_evaluations.sql` in your Supabase project.
2. From the app root with **service role** access: `.env.local` must have `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (the script bypasses RLS for bulk insert).

```bash
# If the CSV is at data/privacy.csv (default):
pnpm run seed:common-sense-privacy

# Or pass any path:
pnpm exec tsx scripts/import-common-sense-privacy.ts /path/to/privacy.csv
```

Data goes into the `common_sense_privacy_evaluations` table in Supabase (see migration `007_common_sense_privacy_evaluations.sql`).
