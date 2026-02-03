# State & District Data: Nth-Degree Vision and Data Minimization

This document defines the full (“nth degree”) scope for state and district data in Ask Before You App (ABYA), then applies **data minimization** to identify the essential data and infrastructure for the current campaign and Knowledge Hub, with a path to expand later.

---

## 1. Nth-Degree Scope (Full Vision)

What we *could* support if we wanted complete national coverage and maximum utility.

### 1.1 States (50 + DC)

| Domain | Nth-degree data |
|--------|------------------|
| **Metadata** | State code, name, SDPC member, last_updated, data_source_agency, region/timezone |
| **Overview** | Agency name, team name, mission, website, email, phone, address |
| **Laws** | Federal (FERPA, PPRA) + per-state statutes and rules: name, code, description, url, effective_date, key_provisions[], amendment_history |
| **Roles** | Data Manager, Security Officer, Records Officer, others: title, legal_basis, required (y/n), responsibilities[], first_steps[], resources[] |
| **Contacts** | Name, title, email, phone, role_type (for state SEA team) |
| **Resources** | DPA templates, guides, training, tools, external links: name, description, type, url, format |
| **Workflows** | Breach response, annual compliance, DPA approval, parent request handling: name, description, steps[] |
| **Compliance** | Mandatory designations, annual requirements, ongoing requirements |
| **Stats** | students_protected, districts_participating, vendor_agreements (when published by state) |

### 1.2 Districts (~13,000+ LEAs)

| Domain | Nth-degree data |
|--------|------------------|
| **Identity** | Name, state, NCES LEA ID, type (district vs charter), size_band, enrollment (optional) |
| **Contact** | Primary contact, data manager, security officer, mailing address |
| **Governance** | Board policy links, AI/EdTech policy adoption date, data governance lead |
| **Vendors / DPAs** | Vendors in use, DPAs signed (SDPC registry, state alliance), last_audit |
| **State relationship** | State code (FK), participating in state alliance (y/n), compliance status (if state shares) |

### 1.3 Laws and Procedures (Granular)

- **Laws**: Versioned by effective date; link to official text; key provisions and summaries.
- **Procedures**: State-mandated workflows (e.g., breach notification timeline, annual benchmark submission) with step-by-step guidance and links to state forms/tools.

### 1.4 Implications of Full Scope

- **Content**: 51 state ecosystems × (laws, roles, contacts, resources, workflows) = large, ongoing curation.
- **Districts**: ~13k LEAs; would need authoritative source (e.g., NCES, state SEA) and refresh strategy.
- **Maintenance**: Laws and contacts change; need ownership and update process.

---

## 2. Data Minimization (Current Campaign & Knowledge Hub)

What we **actually need** to support the current product:

- **Ask Before You App** messaging and audience paths (Parent, Educator, Administrator, Student, Just learning).
- **Knowledge Hub**: “Understand apps, state laws, and procedures”; “Pick your state and get the details.”
- **Ecosystem pages**: State-by-state laws, roles, workflows, and links so users can verify and advocate.
- **Certification / Ecosystem**: Persona-aware entry points; no requirement to list every district.

### 2.1 Minimized: States

- **Scope**: State-level only. One canonical ecosystem per state when we have content (today: Utah only).
- **Essential fields** (already in `StateEcosystem`):
  - **Metadata**: `code`, `name`, `sdpcMember`, `lastUpdated`
  - **Overview**: `agencyName`, `teamName`, `website`, `email` (optional: phone, address)
  - **Laws**: Federal (shared) + state: `name`, `code`, `description`, `url`, optional `keyProvisions[]`
  - **Roles**: Data Manager, Security Officer, Records Officer: `title`, `legalBasis`, `required`, `responsibilities[]`, optional `firstSteps[]`, `resources[]`
  - **Compliance**: `mandatoryDesignations`, `annualRequirements`, `ongoingRequirements`
  - **Optional**: `contacts[]`, `resources` (templates, guides, training), `workflows[]`, `stats`
- **Not needed for campaign**: Amendment history, versioned law text, region/timezone.

### 2.2 Minimized: Districts

- **Scope**: Keep existing `districts` table for DAROS and SDPC registry use. No requirement to host a full national list for the public hub.
- **Current use**: Utah LEAs (and optionally a few others) for dashboard and seeding; `getDistrictsByState()` can return in-memory lists (e.g., Utah from `lib/data/districts.ts`) or DB when we have rows.
- **Minimized stance**: Do **not** pre-populate all ~13k districts. Add districts by state only when a concrete feature needs them (e.g., “find your district” in a future phase).

### 2.3 Minimized: Laws and Procedures

- **Laws**: Name, code, description, URL, and key provisions are enough for “understand and advocate.” No versioning or effective-date tracking for v1.
- **Procedures**: High-level workflows (e.g., breach response, annual compliance) in state ecosystem content are enough; no separate “procedures” table for campaign.

---

## 3. Recommended Infrastructure and Schema

### 3.1 Current State

- **State ecosystem content**: In code — `lib/ecosystem/types.ts`, `lib/ecosystem/states/utah.ts`, `lib/ecosystem/index.ts` (`STATE_ECOSYSTEMS`, `getStateEcosystem()`). Utah is full; other states use `ALL_STATES` for listing and show “no guide yet” when no ecosystem.
- **Districts**: Supabase table `districts` (id, name, state, size_band, contacts, metadata, created_at, updated_at). Utah seeded via script; DAROS/SDPC reference it.

### 3.2 Recommendation: Minimized Infrastructure

1. **Keep state ecosystem content in code** for the minimized scope.
   - Pros: No DB migration for content; versioned with app; single source of truth in repo.
   - Add states by adding new files under `lib/ecosystem/states/` and registering in `lib/ecosystem/index.ts`.

2. **Optional: `states` table** for consistent “all 50 + DC” listing and “guide ready” flag.
   - Columns: `code` (PK), `name`, `sdpc_member` (boolean), `ecosystem_available` (boolean), `last_updated` (date or text).
   - Seed from `ALL_STATES` + derive `ecosystem_available` from `getStateEcosystem(code)` (or manual until we have more states).
   - Use for: dropdowns, filters, or future admin “which states have content” without touching code. **Optional** for v1; we can keep using `ALL_STATES` and `getAvailableStates()`.

3. **Districts**: No change.
   - Keep `state` as text (e.g., `UT`). If we add a `states` table, `districts.state` can reference `states.code` later for integrity.

4. **No new tables** for laws, roles, contacts, resources, or workflows in the minimized design. They stay inside the in-code `StateEcosystem` (or a single JSONB per state if we ever move to DB).

### 3.3 Schema Additions (Only If We Add `states`)

```sql
-- Optional: run only if we want a states table for listing / admin
CREATE TABLE IF NOT EXISTS states (
  code text PRIMARY KEY,
  name text NOT NULL,
  sdpc_member boolean NOT NULL DEFAULT false,
  ecosystem_available boolean NOT NULL DEFAULT false,
  last_updated text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE states IS 'State metadata for listing; ecosystem content remains in code unless moved later.';
```

Seed: Use `lib/supabase/seeds/002_states.sql` (51 rows from `ALL_STATES`; `ecosystem_available = true` for UT only).

### 3.4 Future Expansion (If We Outgrow Code-Based Ecosystems)

- **Option A – JSONB per state**: Add `state_ecosystems` table (state_code PK, content JSONB). Migrate Utah (and others) from code into JSONB; app reads from DB with fallback to code. Allows non-dev edits via admin or import.
- **Option B – Normalized**: Add `state_laws`, `state_roles`, `state_contacts`, `state_resources`, `state_workflows` with FKs to `states`. More structure, more migrations and UI for edits.
- **Option C – Hybrid**: Keep federal laws and “template” in code; store only state-specific overrides (e.g., state_laws, state_roles) in DB.

Data minimization says: **don’t implement A/B/C until we have a concrete need** (e.g., content team, multi-state authoring, or CMS).

---

## 4. Summary

| Area | Nth degree | Minimized (current) |
|------|------------|--------------------|
| **States** | 51 full ecosystems, all fields, versioned laws | State-level content in code; Utah full; others “coming soon” via `ALL_STATES` + `getStateEcosystem()` |
| **Districts** | ~13k LEAs, contacts, policies, vendors | Existing `districts` table; seed only where needed (e.g., Utah); no national import |
| **Laws** | Versioned, effective dates, amendment history | Name, code, description, URL, key provisions in StateEcosystem |
| **Procedures** | Full workflow DB, step-level | In-code workflows in StateEcosystem when needed |
| **Infrastructure** | States + state_laws, state_roles, … + districts | Code-based ecosystems; optional `states` table for listing; districts unchanged |

**Concrete next steps (minimized):**

1. Continue adding state ecosystem content in code (e.g., copy template, fill for one more state) as needed for the campaign.
2. Use `ALL_STATES` and `getAvailableStates()` for “pick your state” and “Guides Ready” count; no DB change required.
3. Optionally add migration and seed for `states` if we want a single source of truth for “all states” and “ecosystem_available” in the DB.
4. Defer district expansion and normalized state-content tables until a product need exists.
