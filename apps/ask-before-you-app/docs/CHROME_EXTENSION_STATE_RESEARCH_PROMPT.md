# Chrome Extension Prompt: State Regulations & Laws Research for Ask Before You App

Use this prompt inside a **Google Chrome extension with Claude** to research state-level student data privacy regulations and laws. The output must align with Ask Before You App’s database and in-code ecosystem so each state can be added to the app without rework.

---

## 1. Your Mission

Research **one US state (or DC)** at a time and produce:

1. **A list of source URLs** you used, with a one-line summary per URL.
2. **A complete `StateEcosystem` object** in TypeScript that matches our schema (see below).
3. **Database alignment notes**: whether the state should have `ecosystem_available = true` and any `last_updated` value for the `states` table.

**Scope:** All 50 states + DC. Prefer **official sources** (state SEA, state code/legislature). If information is missing, use empty arrays, omit optional fields, or add `// TODO: verify` comments—do not invent data.

---

## 2. Database & App Requirements (What Must Align)

### 2.1 Database: `states` table (Supabase)

Used for listing states and “ecosystem available” in the app. Columns:

| Column | Type | Required | Notes |
|--------|------|----------|--------|
| `code` | text | Yes | 2-letter state code (e.g. `UT`, `CA`, `DC`) — **primary key** |
| `name` | text | Yes | Full name (e.g. `Utah`, `California`, `District of Columbia`) |
| `sdpc_member` | boolean | Yes | SDPC member as of 2026 (see list in types) |
| `ecosystem_available` | boolean | Yes | `true` only when we have a full ecosystem file in code |
| `last_updated` | text | No | e.g. `2026-01` or `NULL` |

- **You do not write to the database.** Your job is to produce the **in-code ecosystem file** so that when it’s added, the app can set `ecosystem_available = true` and optionally set `last_updated`.
- SDPC membership must match our canonical list in `lib/ecosystem/types.ts` (`SDPC_MEMBER_STATES`). If you find different info, note it in “Database alignment notes.”

### 2.2 In-Code Ecosystem: `StateEcosystem` (TypeScript)

Ecosystem content lives in **code**, not in the DB. One file per state:  
`apps/ask-before-you-app/lib/ecosystem/states/{code}.ts` (lowercase: `utah.ts`, `ca.ts`, `dc.ts`).

The app reads from `STATE_ECOSYSTEMS` in `lib/ecosystem/index.ts`. Each state you research will eventually be:

- Exported from `lib/ecosystem/states/{code}.ts`
- Imported and registered in `lib/ecosystem/index.ts` under the state code (e.g. `CA: CALIFORNIA_ECOSYSTEM`).

Your output must conform to the following TypeScript interfaces and the Utah example.

---

## 3. Exact Schema: TypeScript Interfaces

Copy these into your context so your output is valid.

```ts
// From lib/ecosystem/types.ts

export interface StateContact {
  name: string
  title: string
  email?: string
  phone?: string
}

export interface StateLaw {
  name: string
  code: string
  description: string
  url?: string
  keyProvisions?: string[]
}

export interface StateRole {
  title: string
  legalBasis?: string
  required: boolean
  responsibilities: string[]
  firstSteps?: string[]
  resources?: { name: string; url?: string }[]
}

export interface StateResource {
  name: string
  description: string
  type: 'template' | 'guide' | 'form' | 'training' | 'tool' | 'external'
  url?: string
  format?: 'pdf' | 'doc' | 'sheet' | 'slides' | 'video' | 'web'
}

export interface StateWorkflow {
  name: string
  description: string
  steps: {
    number: number
    title: string
    description: string
  }[]
}

export interface StateEcosystem {
  code: string                    // e.g. 'UT', 'CA', 'DC'
  name: string                    // e.g. 'Utah', 'California'
  sdpcMember: boolean
  lastUpdated: string             // e.g. '2026-01'

  overview: {
    agencyName: string
    teamName: string
    mission?: string
    website?: string
    email?: string
    phone?: string
    address?: string
  }

  federalLaws: StateLaw[]        // ALWAYS use FEDERAL_LAWS from types (same for all states)
  stateLaws: StateLaw[]

  roles: {
    dataManager?: StateRole
    securityOfficer?: StateRole
    recordsOfficer?: StateRole
    other?: StateRole[]
  }

  contacts: StateContact[]

  resources: {
    dpaTemplates: StateResource[]
    guides: StateResource[]
    training: StateResource[]
    tools: StateResource[]
    external: StateResource[]
  }

  workflows: StateWorkflow[]

  compliance: {
    mandatoryDesignations: string[]
    annualRequirements: string[]
    ongoingRequirements: string[]
  }

  stats?: {
    studentsProtected?: string
    districtsParticipating?: string
    vendorAgreements?: string
  }
}
```

**Federal laws:** Every state uses the same federal laws. In the file you must set  
`federalLaws: FEDERAL_LAWS`  
and add at the top:  
`import { StateEcosystem, FEDERAL_LAWS } from '../types'`  
Do not re-list FERPA/PPRA; use the constant.

**SDPC member states (as of 2026):**  
AL, AZ, AR, CA, CO, CT, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY, DC.  
**Only non-SDPC:** AK.

---

## 4. What to Research (Field-by-Field)

Use this as your checklist. For each state, fill as much as you can from official or authoritative sources.

| Section | What to find | Required? |
|--------|----------------|-----------|
| **code, name, sdpcMember, lastUpdated** | 2-letter code, full name, SDPC from list above, date (e.g. `2026-01`) | Yes |
| **overview** | State education agency name, privacy team/office name, mission (if published), website, email, phone, address | agencyName, teamName at minimum |
| **federalLaws** | Do not research; use `FEDERAL_LAWS` | Yes |
| **stateLaws** | State statutes and board rules: name, code, description, url, keyProvisions[] | At least one state law with name, code, url |
| **roles.dataManager** | Title, legal basis (cite statute/rule if required), required (true/false), responsibilities[], firstSteps[], resources[] | Strongly preferred |
| **roles.securityOfficer** | Same shape; often “Information Security Officer” | If state uses it |
| **roles.recordsOfficer** | Same shape; may be “Records Officer”, “ARO”, or tied to open-records law | If state uses it |
| **contacts** | State SEA team contacts: name, title, email, phone (when public) | At least one (can be generic) |
| **resources** | dpaTemplates, guides, training, tools, external (name, description, type, url, format) | external[] should include SDPC link if member |
| **workflows** | Vendor approval, breach response, annual compliance, records requests (name, description, steps[]) | At least vendor approval |
| **compliance** | mandatoryDesignations[], annualRequirements[], ongoingRequirements[] | All three arrays (can be short) |
| **stats** | studentsProtected, districtsParticipating, vendorAgreements (if published) | Optional |

---

## 5. Sources to Use (In Order of Priority)

### 5.1 Primary (per state)

- **State education agency (SEA) / Department of Education**  
  Main site (e.g. `education.[state].gov`, `doe.[state].gov`).  
  Search: “[State] student data privacy”, “[State] DOE data privacy”, “[State] education agency privacy”.
- **State legislature / state code**  
  State code site.  
  Search: “[State] code student data privacy”, “[State] statute student records”, “[State] FERPA”.
- **State board of education rules**  
  Admin/board rules.  
  Search: “state board rule student data”, “[State] administrative code education”.

### 5.2 Secondary (national / cross-state)

- **SDPC (A4L):** https://privacy.a4l.org — membership, NDPA, registry.
- **Student Privacy Compass (FPF):** https://studentprivacycompass.org — state law summaries and links.
- **NASBE State Policy Database:** https://statepolicies.nasbe.org — state education policies (privacy-related).

### 5.3 Optional

- State school boards association, state archives/records division, Future of Privacy Forum state trackers.

---

## 6. Workflow (One State per Run)

1. **Input:** State code (e.g. `CA`) and name (e.g. `California`).
2. **Discover:** Search the web for state SEA privacy page, state code sections on student/data privacy, SDPC membership, Student Privacy Compass / NASBE for that state. Output a list of URLs with a one-line summary each.
3. **Extract:** For each relevant URL, extract laws (name, code, description, url, keyProvisions), roles (title, required, responsibilities), overview (agency, team, contact), resources, workflows, compliance. Use the checklist in section 4; leave a field empty or add `// TODO: verify` if not findable.
4. **Normalize:** Map everything into `StateEcosystem` with the exact keys and types above. Use `FEDERAL_LAWS` for federal laws and the SDPC list for `sdpcMember`.
5. **Emit:** Produce:
   - The list of source URLs (with one-line summaries).
   - The full TypeScript file content for `lib/ecosystem/states/{code}.ts` (lowercase code), with:
     - First line: `import { StateEcosystem, FEDERAL_LAWS } from '../types'`
     - Export: `export const [STATE_NAME_UPPER]_ECOSYSTEM: StateEcosystem = { ... }`  
       Use the state name in SCREAMING_SNAKE_CASE (e.g. `CALIFORNIA_ECOSYSTEM`, `DISTRICT_OF_COLUMBIA_ECOSYSTEM` for DC).
   - Short “Database alignment notes”: SDPC member yes/no, suggested `last_updated`, and any caveats (e.g. “no official DPA template found; link to SDPC only”).

---

## 7. Output Format and Conventions

- **File path:** `lib/ecosystem/states/{code}.ts` — use **lowercase** state code: `ca.ts`, `tx.ts`, `dc.ts`, `utah.ts`.
- **Export name:** `{STATE_NAME}_ECOSYSTEM` in SCREAMING_SNAKE_CASE (e.g. `CALIFORNIA_ECOSYSTEM`, `DISTRICT_OF_COLUMBIA_ECOSYSTEM`). For Utah we use `UTAH_ECOSYSTEM` (not `UT_ECOSYSTEM`).
- **Federal laws:** Always `federalLaws: FEDERAL_LAWS`.
- **Missing data:** Use `[]` for arrays; omit optional fields or use placeholder only with `// TODO: verify`. Do not invent statute numbers or URLs.
- **URLs:** Prefer stable official links (state legislature, SEA). Avoid session-specific or obviously fragile URLs.

---

## 8. Validation Before Submitting

- **Links:** Spot-check 3–5 URLs (e.g. SEA, one law, one resource). If you cannot verify, note in comments.
- **Legal accuracy:** State code and statute/rule numbers must match official state sources. Descriptions must be neutral summaries, not legal advice.
- **SDPC:** Confirm `sdpcMember` from our list (or note if you find conflicting info).
- **Non-SDPC states (e.g. AK):** Expect fewer state-specific DPA templates; include SDPC in resources if relevant; otherwise “check with SEA” and minimal dpaTemplates is fine.

---

## 9. Registration (For Cursor / Developer)

After the ecosystem file is added to the repo, a developer must:

1. Add to `lib/ecosystem/index.ts`:
   - `import { CALIFORNIA_ECOSYSTEM } from './states/ca'` (example)
   - In `STATE_ECOSYSTEMS`, add: `CA: CALIFORNIA_ECOSYSTEM`
2. Optionally update the DB: set `ecosystem_available = true` and `last_updated` for that state in the `states` table (e.g. via Supabase or a seed script).

You (the Chrome extension) do not edit the repo or DB; you only produce the state file and the notes.

---

## 10. Prompt to Paste for a Single State

When you are inside the Chrome extension and ready to research one state, paste the following and replace the placeholders.

```
I need to build a state student data privacy ecosystem for [STATE_NAME] ([STATE_CODE]) for Ask Before You App.

**Target:** One TypeScript file that exports a single StateEcosystem object matching the schema in CHROME_EXTENSION_STATE_RESEARCH_PROMPT.md (StateLaw, StateRole, StateResource, StateWorkflow, StateContact, StateEcosystem). Use FEDERAL_LAWS for federalLaws; do not duplicate FERPA/PPRA. SDPC membership: [STATE_CODE] is [SDPC member / not SDPC — only AK is non-SDPC].

**Required sections:** code, name, sdpcMember, lastUpdated, overview (agencyName, teamName, plus optional mission/website/email/phone/address), federalLaws: FEDERAL_LAWS, stateLaws[], roles (dataManager, securityOfficer, recordsOfficer as applicable), contacts[], resources (dpaTemplates, guides, training, tools, external), workflows[], compliance (mandatoryDesignations, annualRequirements, ongoingRequirements). Optional: stats.

**Sources to use (search the web):**
1. [State] Department of Education / state education agency — student data privacy or data governance pages
2. [State] state code / legislature — student privacy, student records, data protection statutes and board rules
3. SDPC (privacy.a4l.org) — confirm membership and NDPA/registry usage
4. Student Privacy Compass (studentprivacycompass.org) — [State] summary and links
5. NASBE state policy database — [State] privacy-related policies

**Output:**
1. List of URLs you used with a one-line summary each.
2. Complete TypeScript file content for lib/ecosystem/states/[code].ts (lowercase), first line: import { StateEcosystem, FEDERAL_LAWS } from '../types', export const [STATE_NAME]_ECOSYSTEM. Use official URLs; if something is not found use [] or a // TODO: verify comment.
3. Database alignment notes: SDPC member (yes/no), suggested last_updated, and any caveats for ecosystem_available.
```

**Example for California:**

```
I need to build a state student data privacy ecosystem for California (CA) for Ask Before You App.
... SDPC membership: CA is SDPC member.
... Output: ... lib/ecosystem/states/ca.ts ... export const CALIFORNIA_ECOSYSTEM ...
```

---

## 11. Repo Reference (For Context)

- **This prompt:** `apps/ask-before-you-app/docs/CHROME_EXTENSION_STATE_RESEARCH_PROMPT.md`
- **Schema / types:** `apps/ask-before-you-app/lib/ecosystem/types.ts`
- **Template:** `apps/ask-before-you-app/lib/ecosystem/states/template.ts`
- **Reference (depth/detail):** `apps/ask-before-you-app/lib/ecosystem/states/utah.ts`
- **Registration:** `apps/ask-before-you-app/lib/ecosystem/index.ts`
- **States table migration:** `apps/ask-before-you-app/lib/supabase/migrations/008_states.sql`
- **States seed:** `apps/ask-before-you-app/lib/supabase/seeds/002_states.sql`
- **Data design:** `apps/ask-before-you-app/docs/STATE_AND_DISTRICT_DATA_DESIGN.md`
- **Existing research plan:** `apps/ask-before-you-app/docs/CLAUDE_STATE_ECOSYSTEM_RESEARCH_PLAN.md`

Once a state file is added and registered in `index.ts`, the app’s Ecosystem UI will show that state as “guide ready” and the state’s ecosystem page will render from the new file. The database `states` table can then set `ecosystem_available = true` and `last_updated` for that state so the app and DB stay in sync.
