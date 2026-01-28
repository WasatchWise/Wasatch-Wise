# Ordinance: Record Retention & Archives

**ID:** ORD-0002  
**Status:** Adopted  
**Adopted:** 2026-01-26  
**Owner:** Archives (Librarian) + Compliance (Superintendent)  
**Applies To:** All realms, all apps, all operational records  

## Purpose

Establish a clear record retention policy so we:

- keep what we need (operations, auditability, compliance),
- delete what we don’t (risk reduction),
- and prevent sensitive archives from accidentally landing in git.

## Definitions

- **Record**: any stored artifact (doc, decision, export, dataset, log, screenshot).
- **Archive**: records stored for reference/audit after active use.
- **Retention**: how long a record is kept before deletion/rotation.

## Requirements (SHALL)

- **No sensitive archives in git**:
  - We SHALL not commit raw sensitive records to git.
  - Sensitive records SHALL be stored in `civilization/archives/private/` (gitignored) or an approved secure store.
- **Public vs private archive separation**:
  - `civilization/archives/public/` MAY contain redacted summaries that are safe to commit.
  - `civilization/archives/exports/` SHALL be treated as ephemeral and gitignored.
- **Retention is mandatory metadata**:
  - Any new record type SHALL declare a retention class (see schedule below).
- **Deletion is a feature**:
  - We SHALL periodically purge/rotate records according to retention class.

## Retention Schedule (baseline)

This is a starting schedule; adjust per realm/client requirements.

- **R0 — Ephemeral (hours → 30 days)**:
  - Local exports, temporary datasets, raw API dumps, ad-hoc screenshots.
- **R1 — Operational (90 days → 2 years)**:
  - Runbooks, checklists, non-sensitive logs, non-sensitive analytics snapshots.
- **R2 — Governance (3 → 7 years)**:
  - Ordinances, executive directives, architectural decisions, audit summaries.
- **R3 — Permanent (indefinite)**:
  - Realm charter/specification, building registry, agent roster (redacted where needed).

## Implementation Notes

- Prefer to store “proof” as:
  - redacted summaries,
  - aggregates,
  - and reproducible steps (scripts, queries) rather than raw dumps.
- When a raw export is needed for debugging:
  - put it in `civilization/archives/exports/`,
  - sanitize if possible,
  - delete when done,
  - and document the outcome as a public summary if it matters.

## Compliance / Enforcement

- `.gitignore` SHALL include `civilization/archives/private/` and `civilization/archives/exports/`.
- Reviews SHOULD flag:
  - new files that look like exports/dumps,
  - large datasets,
  - anything with PII or credentials.

## Exceptions

Exceptions must be documented with:

- the record type,
- why retention must differ,
- where it is stored securely,
- and who approved it.

## Change Log

| Date | Change | Reason | Author |
|------|--------|--------|--------|
| 2026-01-26 | Initial adoption | Establish baseline retention + archive separation | Agent + John |

