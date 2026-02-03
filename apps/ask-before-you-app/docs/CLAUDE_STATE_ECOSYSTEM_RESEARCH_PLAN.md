# Claude Extension: State Ecosystem Research Plan

Plan for using Claude (browser extension, API, or Cursor) to scour the web for state-level student data privacy data and populate ecosystem files that **match the Utah infrastructure** in `lib/ecosystem/states/utah.ts`. Covers **all 50 states + DC**, including states **not** in SDPC.

---

## 1. Goal

- **Output:** One `StateEcosystem` file per state: `lib/ecosystem/states/{code}.ts` (e.g. `ca.ts`, `tx.ts`), following the same shape as Utah.
- **Scope:** All states in `ALL_STATES` (50 + DC). No exclusion for non-SDPC states; non-SDPC states may have sparser data (e.g. no state alliance, fewer resources).
- **Quality:** Prefer official sources (state SEA, state code/legislature). Link to source URLs. Note when info is missing or inferred.

---

## 2. Target Data (Match Utah Structure)

For each state, fill every section of `StateEcosystem` that has a counterpart in Utah. Use `lib/ecosystem/types.ts` and `lib/ecosystem/states/template.ts` as the schema; use `lib/ecosystem/states/utah.ts` as the depth/detail bar.

| Section | What to find | Utah reference |
|--------|----------------|------------------|
| **code, name, sdpcMember, lastUpdated** | 2-letter code, full name, SDPC member (from `SDPC_MEMBER_STATES`), date (e.g. `2026-01`) | Top of utah.ts |
| **overview** | State education agency name, privacy team/office name, mission (if published), website, email, phone, address | overview in utah.ts |
| **federalLaws** | Same for all states: use `FEDERAL_LAWS` from types | federalLaws: FEDERAL_LAWS |
| **stateLaws** | State statutes and board rules on student/data privacy: name, code, description, url, keyProvisions[] | stateLaws in utah.ts |
| **roles.dataManager** | Title (e.g. Data Manager, Data Privacy Officer), legal basis (cite if required by law), required (true/false), responsibilities[], firstSteps[], resources[] | roles.dataManager |
| **roles.securityOfficer** | Same shape; often “Information Security Officer” or similar | roles.securityOfficer |
| **roles.recordsOfficer** | Same shape; may be “Records Officer”, “ARO”, or tied to open-records law | roles.recordsOfficer |
| **contacts** | State SEA team contacts: name, title, email, phone (when public) | contacts[] |
| **resources** | dpaTemplates, guides, training, tools, external (name, description, type, url, format) | resources in utah.ts |
| **workflows** | Vendor approval, breach response, annual compliance, records requests (name, description, steps[]) | workflows[] |
| **compliance** | mandatoryDesignations[], annualRequirements[], ongoingRequirements[] | compliance |
| **stats** | studentsProtected, districtsParticipating, vendorAgreements (if published) | stats (optional) |

---

## 3. Sources to Scour (By Priority)

### 3.1 Primary (per state)

- **State education agency (SEA) / Department of Education**
  - Main site (e.g. `education.[state].gov`, `doe.[state].gov`, `state.[state].us/education`).
  - Search: “[State] student data privacy”, “[State] DOE data privacy”, “[State] education agency privacy”.
- **State legislature / code**
  - State code site (e.g. `legislature.[state].gov`, `law.[state].gov`, `le.[state].gov`).
  - Search: “[State] code student data privacy”, “[State] statute student records”, “[State] FERPA”.
- **State board of education rules**
  - Admin rules / board rules (e.g. “state board rule student data”, “[State] administrative code education”).

### 3.2 Secondary (national / cross-state)

- **SDPC (A4L)**  
  - https://privacy.a4l.org — membership, NDPA, registry; confirms SDPC membership and DPA approach.
- **Student Privacy Compass (FPF)**  
  - https://studentprivacycompass.org — state law summaries, resources, links.
- **NASBE State Policy Database**  
  - https://statepolicies.nasbe.org — state education policies (privacy-related).
- **FERPA/PPRA (ED)**  
  - https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html — federal baseline (same for all).
- **State alliances / consortia**  
  - Search: “[State] student privacy alliance”, “[State] K-12 data privacy consortium”, “[State] DPA alliance”.

### 3.3 Optional / when needed

- **Future of Privacy Forum (FPF)** — state law trackers and reports.
- **State school boards association** — policy guidance and links.
- **State archives / records division** — records officer and retention requirements.

---

## 4. Claude Workflow (Extension / API / Cursor)

### 4.1 One state per run (recommended)

1. **Input:** State code (e.g. `CA`) and name (e.g. `California`).
2. **Step 1 – Discover**
   - Claude searches (or you provide URLs): state SEA privacy page, state code sections on student/data privacy, SDPC membership, Student Privacy Compass / NASBE for that state.
   - Output: list of URLs and short “what’s there” notes.
3. **Step 2 – Extract**
   - For each URL (or key pages): summarize laws (name, code, description, url), roles (title, required, responsibilities), overview (agency, team, contact), resources, workflows, compliance bullets.
   - Use Utah fields as the checklist; leave a field empty or “Unknown” if not findable.
4. **Step 3 – Normalize**
   - Map into `StateEcosystem`: same keys and types as Utah/template. Use `FEDERAL_LAWS` for federalLaws. Use `SDPC_MEMBER_STATES` for sdpcMember.
5. **Step 4 – Emit**
   - Generate `lib/ecosystem/states/{code}.ts`: `import { StateEcosystem, FEDERAL_LAWS } from '../types'` and `export const [STATE]_ECOSYSTEM: StateEcosystem = { ... }`.
6. **Step 5 – Register**
   - Add to `lib/ecosystem/index.ts`: import and add to `STATE_ECOSYSTEMS`.

### 4.2 Prompt sketch for Claude (per state)

```text
I need to build a state student data privacy ecosystem for [STATE_NAME] ([CODE]) that matches our Utah structure.

**Target structure:** StateEcosystem with: overview (agency, team, website, email, phone), stateLaws (name, code, description, url, keyProvisions), roles (dataManager, securityOfficer, recordsOfficer), contacts[], resources (dpaTemplates, guides, training, tools, external), workflows[], compliance (mandatoryDesignations, annualRequirements, ongoingRequirements), optional stats.

**Sources to use (search the web if needed):**
1. [State] Department of Education / state education agency — student data privacy or data governance pages
2. [State] state code / legislature — student privacy, student records, data protection statutes and board rules
3. SDPC (privacy.a4l.org) — is [STATE] a member? NDPA usage?
4. Student Privacy Compass (studentprivacycompass.org) — [State] summary and links
5. NASBE state policy database — [State] privacy-related policies

**Output:** 
1. List of URLs you used (with 1-line summary each).
2. A complete StateEcosystem object in TypeScript (same shape as Utah), with federalLaws: FEDERAL_LAWS, and real official URLs. If something isn’t found, use empty array or "Unknown" and add a short comment.
3. SDPC member: [yes/no] (from SDPC_MEMBER_STATES or SDPC site).
```

### 4.3 Batch / automation (optional)

- **Order:** SDPC states first (larger ecosystem), then non-SDPC. Or by region to reuse similar state-code patterns.
- **Script:** Loop over `ALL_STATES`; for each, call Claude API with the prompt above; write `states/{code}.ts` and append to a “pending registration” list; then one pass to update `index.ts`.
- **Rate / quality:** Prefer 1 state per run with a quick human scan of URLs and key provisions before merging; automate only after a few states look good.

---

## 5. Output Format and Conventions

- **File:** `lib/ecosystem/states/{code}.ts` (lowercase code: `ca.ts`, `tx.ts`, `dc.ts`).
- **Export name:** `[STATE_CODE]_ECOSYSTEM` (e.g. `CALIFORNIA_ECOSYSTEM` → use e.g. `CA_ECOSYSTEM` for consistency with Utah: `UTAH_ECOSYSTEM`). So pattern: `${code.toUpperCase()}_ECOSYSTEM` for the const name is fine; Utah uses “UTAH” not “UT”, so we can use either `UT_ECOSYSTEM` or keep `UTAH_ECOSYSTEM`. Use full state name: `CALIFORNIA_ECOSYSTEM`, `TEXAS_ECOSYSTEM`; in `index.ts` map code to const (e.g. `CA: CALIFORNIA_ECOSYSTEM`).
- **Federal laws:** Always `federalLaws: FEDERAL_LAWS` (from `../types`).
- **Missing data:** Use `[]` for arrays, omit optional fields or set to `undefined` only if the type allows; otherwise use placeholder text and a `// TODO: verify` comment.
- **URLs:** Prefer official state legislature/SEA links; avoid broken or session-specific URLs.

---

## 6. Validation and Review

- **Links:** Spot-check 3–5 URLs per state (SEA, one law, one resource). Fix or remove broken links.
- **Legal accuracy:** State code and statute/rule numbers must match official state sources; descriptions should be neutral summaries, not legal advice.
- **SDPC:** Confirm SDPC membership from https://privacy.a4l.org (or our `SDPC_MEMBER_STATES`) so `sdpcMember` is correct for all 50+DC.
- **Non-SDPC states:** Expect fewer DPA templates/workflows; leave NDPA in resources if the state uses SDPC registry; otherwise describe state-specific or “check with SEA” and leave dpaTemplates minimal.

---

## 7. Priority Order (Suggested)

1. **SDPC states with known activity:** CA, TX, NY, FL, IL, CO, etc. (fastest to fill from SDPC + SEA).
2. **Remaining SDPC states** (all in `SDPC_MEMBER_STATES`).
3. **Non-SDPC:** AK (only non-SDPC in ALL_STATES). Still produce one file; data may be thinner.

---

## 8. Checklist Per State (for Claude or human)

- [ ] overview.agencyName, .teamName, .website, .email (or note “not published”)
- [ ] stateLaws[] with at least one state statute or rule; name, code, url
- [ ] roles.dataManager (title, required, responsibilities)
- [ ] roles.securityOfficer and/or recordsOfficer (if state uses them)
- [ ] contacts[] at least one (can be generic e.g. privacy@doe.state.gov)
- [ ] resources: at least external[] with SDPC link if member; state SEA link
- [ ] workflows[]: at least vendor approval; breach and annual compliance if findable
- [ ] compliance: mandatoryDesignations, annualRequirements, ongoingRequirements (can be short)
- [ ] sdpcMember set from SDPC_MEMBER_STATES
- [ ] File saved as `lib/ecosystem/states/{code}.ts` and registered in `lib/ecosystem/index.ts`

---

## 9. Where This Lives in the Repo

- **Plan (this file):** `apps/ask-before-you-app/docs/CLAUDE_STATE_ECOSYSTEM_RESEARCH_PLAN.md`
- **Schema / types:** `apps/ask-before-you-app/lib/ecosystem/types.ts`
- **Template:** `apps/ask-before-you-app/lib/ecosystem/states/template.ts`
- **Reference:** `apps/ask-before-you-app/lib/ecosystem/states/utah.ts`
- **Registration:** `apps/ask-before-you-app/lib/ecosystem/index.ts`
- **Data design (minimized scope):** `apps/ask-before-you-app/docs/STATE_AND_DISTRICT_DATA_DESIGN.md`

Once a state file is added and registered, the Ecosystem UI will show it as “guide ready” and the state’s ecosystem page will render from the new file.
