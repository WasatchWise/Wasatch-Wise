# State Student Data Privacy & AI Governance Profiles — CSV Mapping

This document maps the external reference CSV **"US State Student Data Privacy and AI Governance Profiles - Table 1"** to Ask Before You App’s database and `StateEcosystem` schema. Use it when building or validating state ecosystem files and when reconciling SDPC/contact data.

---

## 1. CSV Location and Source

- **In repo:** `apps/ask-before-you-app/data/state-student-privacy-ai-profiles-table1.csv`
- **Original:** User-provided (NotebookLM / 229 sources). Contains 50 states + DC; some rows are blank or partial; bottom section has “Session 3 - Complete Reference Guide” narrative data for filling gaps.

---

## 2. CSV Columns → App / Database Mapping

| CSV Column | Maps to (StateEcosystem / DB) | Notes |
|------------|-------------------------------|--------|
| **State Name** | `StateEcosystem.name`, `states.name` | Use as display name. |
| **State Code** | `StateEcosystem.code`, `states.code` (PK) | 2-letter (e.g. UT, CA, DC). |
| **SDPC Member (Yes/No)** | `StateEcosystem.sdpcMember`, `states.sdpc_member` | **Important:** CSV has "Not in source", "No", "Yes", and typos (e.g. "Not in sourceNo"). **Use app canonical list** in `lib/ecosystem/types.ts` → `SDPC_MEMBER_STATES`. Ignore CSV for SDPC when building ecosystem files. Note: Some states are in TEC (The Education Collective); SDPC and TEC are related but distinct organizations. |
| **Primary State Student Data Privacy Laws (with statute numbers)** | `StateEcosystem.stateLaws[]` | Parse into `StateLaw`: name, code, description, url. Split on `;` for multiple laws; look up official URLs. |
| **Federal Laws (FERPA, PPRA, COPPA)** | Not stored per state | App uses `FEDERAL_LAWS` constant in types. Use for reference only. |
| **State Education Agency Name** | `StateEcosystem.overview.agencyName` | e.g. "Utah State Board of Education (USBE)". |
| **State Data Privacy Contact Email** | `StateEcosystem.contacts[].email` or `overview.email` | Often "Not in source"; when present can populate contacts or overview. |
| **State Data Privacy Contact Phone** | `StateEcosystem.overview.phone` or `contacts[].phone` | Same as above. |
| **Required State Roles (Data Manager, Security Officer, Records Officer - with statute references)** | `StateEcosystem.roles` (dataManager, securityOfficer, recordsOfficer) | Parse titles and statute refs into `StateRole`: title, legalBasis, required, responsibilities[]. |
| **Key Compliance Requirements** | `StateEcosystem.compliance` (mandatoryDesignations, annualRequirements, ongoingRequirements) | Split into bullets; assign to the three arrays by meaning. |
| **State DOE Privacy Website URL** | `StateEcosystem.overview.website` | Prefer official SEA privacy/data page. |
| **DPA Template Available (Yes/No)** | `StateEcosystem.resources.dpaTemplates` | "Yes" → include NDPA/SDPC or state template in dpaTemplates; "No" / "Not in source" → minimal or SDPC link only. |
| **Notes on AI Governance Policies** | Optional narrative | Can inform `resources.guides` or `resources.external`, or app copy; not a direct schema field. |
| **Source** | Reference only | Source IDs for citations; not stored in app. |

---

## 3. SDPC Membership: CSV vs App

- **App canonical list** (`lib/ecosystem/types.ts`): All 50 states + DC **except Alaska (AK)** are SDPC members.
- **CSV:** Inconsistent ("Not in source", "No", "Yes", merged text like "Not in sourceNo"). The CSV’s “Summary Statistics” says 9 states with SDPC (CA, HI, ME, MS, NJ, NY, OR, SC, UT)—that reflects the **source’s** count, not our app.
- **Action:** When generating or validating ecosystem files, **always set `sdpcMember` from `SDPC_MEMBER_STATES`** (or the current list in types), not from the CSV.

---

## 4. Data Quality Notes

- **Blank rows:** MN, MO, NE, NC, ND, OK, RI, SD, VT (and some tab-separated rows like NE, NH, NC) are empty or malformed in the main table; the “Session 3 - Complete Reference Guide” section at the bottom fills many of these (e.g. Minnesota, Missouri, Nebraska, North Carolina, Rhode Island, South Dakota, Vermont, Oklahoma).
- **Nevada (NV):** Row 30 has column shift (Office of Information Technology in law column; contact name in wrong column). Use narrative section for correct parsing.
- **New Jersey (NJ):** SDPC value "Not in sourceYes" → treat as Yes; narrative confirms NJSDPC/A4L.
- **Pennsylvania (PA):** Contact is judicial (JEAB@pacourts.us); not SEA. Prefer PA Dept of Education when researching.
- **Idaho:** Bottom section has a stray row (column 6 "No", Student Data Accessibility Act, FERPA); use for Idaho laws if main row is thin.

Use the **narrative block** (Session 3 - Complete Reference Guide) to fill or correct main-table gaps for IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MS, MN, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY.

---

## 5. Using This CSV for Ecosystem Files

1. **Per state:** Open CSV, find state row (and if needed the Session 3 narrative entry).
2. **overview:** agencyName, website, email, phone from CSV columns; mission from research.
3. **stateLaws:** Parse "Primary State Student Data Privacy Laws" into `StateLaw[]`; add official statute/rule URLs.
4. **roles:** Parse "Required State Roles" into dataManager / securityOfficer / recordsOfficer; set `required` from statute wording.
5. **compliance:** Derive mandatoryDesignations, annualRequirements, ongoingRequirements from "Key Compliance Requirements" and laws.
6. **resources:** DPA from "DPA Template Available"; add SDPC link for SDPC members; guides/training from "Notes on AI Governance Policies" and research.
7. **sdpcMember:** Set from `SDPC_MEMBER_STATES` in `lib/ecosystem/types.ts`, not from CSV.
8. **contacts:** From CSV contact email/phone and any names in the roles/compliance text; create `StateContact[]`.

---

## 6. Related Docs

- **Schema:** `lib/ecosystem/types.ts`
- **Reference state:** `lib/ecosystem/states/utah.ts`
- **Chrome extension research prompt:** `docs/CHROME_EXTENSION_STATE_RESEARCH_PROMPT.md`
- **State ecosystem research plan:** `docs/CLAUDE_STATE_ECOSYSTEM_RESEARCH_PLAN.md`
- **DB design:** `docs/STATE_AND_DISTRICT_DATA_DESIGN.md`
- **States table:** `lib/supabase/migrations/008_states.sql`, `lib/supabase/seeds/002_states.sql`
