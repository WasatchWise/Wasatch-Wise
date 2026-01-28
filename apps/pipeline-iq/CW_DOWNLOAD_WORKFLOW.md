## ConstructionWire: Best-practice workflow (Saved Searches → Download CSV → Groove)

### Why this is the ideal path
- **Stable**: avoids CW UI changes + “auth on click” issues.
- **High-signal**: CW CSV downloads include **project details + notes + structured stakeholder contact blocks** (owner/developer/GC/PM).
- **Budgeted**: your account shows **500 downloads/month**, so we treat downloads as a scarce resource and avoid wasting them on low-fit records.

### Recommended cadence
- **Daily** (or 3x/week) for “newly updated in last 1–3 days” searches.
- **Weekly** for broader “last updated in 7–14 days” searches.

### Step 1 — Create a small set of saved searches in CW
Aim for 5–15 searches, each tightly scoped:
- **Vertical**: Hotel / Multifamily / Senior / Student
- **Stage**: Planning, Bidding, Pre-construction (your best timing)
- **Geo**: your target states/MSAs
- **Freshness**: “Updated in last X days”
- **Units / Value thresholds**: keep list quality high

**Note (current plan):** If you're only using CW for **Hotels + Multifamily**, skip Senior/Student searches and focus on:
- Hotels: **200+ keys** (prime full-stack window)
- Multifamily: **300+ units** (prime bulk-internet + smart building window), or 150+ if you want more volume

### Step 2 — Download the report CSV from CW
From the results list:
- Use **Download Report**
- Prefer:
  - **Download results on this page only** for smaller, higher-signal pulls
  - Or **Download first 500 results** for larger backfills

Save the file as `download.csv` (or any name).

### Step 3 — Import into Groove

Run:

```bash
npm run import:cw -- --file "/absolute/path/to/download.csv"
```

Options:
- `--dry-run`: parses + scores, **no DB writes**
- `--limit=250`: process only the first N rows

Examples:

```bash
npm run import:cw -- --file "/Users/johnlyman/Downloads/download.csv" --dry-run
```

```bash
npm run import:cw -- --file "/Users/johnlyman/Downloads/download.csv" --limit=200
```

### What gets created/updated
- **`projects`**: upserted by `cw_project_id` (`CW-<ProjectId>`)
- **`contacts`**: deduped by email, then phone (best-effort)
- **`companies`**: best-effort upsert by exact `company_name` within org
- **`project_stakeholders`**: linked with `UNIQUE(project_id, contact_id)` to prevent duplicates

### Notes
- CW exports often represent **ProjectValue in millions**. Importer uses a heuristic:
  - plain values ≤ 10,000 are treated as “millions”
  - ranges use the upper bound (e.g., `$25-$100` → `$100M`)
- If you want stricter value/units parsing per vertical, we can tune this once we see a few real exports.

### Suggested saved-search templates (Hotels + Multifamily)
Keep overlap low by structuring searches as: **(Vertical) × (Updated Window) × (Geo Slice)**.

- **Hotels (prime new-build window)**
  - Stage: Planning/Approval, Planning, Design, Permit, Shell/Early Construction
  - Rooms: 200+
  - Optional: filter to **flagged brands** (Marriott/Hilton/Hyatt/IHG/Wyndham/Choice) if you want certified ecosystem fits
  - Windows: Updated last 1 day (daily) + Updated last 7 days (weekly)

- **Hotels (retrofit window)**
  - Indicators: Renovation/Upgrade + keyword “PIP”
  - Goal: target G.hn / TV refresh / Wi‑Fi upgrades without tearing walls open

- **Multifamily (prime bulk-internet window)**
  - Stage: Planning/Approval, Design, Permit, Shell/Early Construction
  - Units: 300+ (or 150+ for more volume)
  - Keywords: “internet included”, “bulk Wi‑Fi”, “luxury”, “amenities”, “technologies”

- **Multifamily (retrofit window)**
  - Indicators: “garden style”, “historic”, renovation/upgrade
  - Goal: G.hn upgrades over existing copper/coax to avoid destructive rewiring


