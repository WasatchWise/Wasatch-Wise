# Ordinance: Privacy by Design

**ID:** ORD-0001  
**Status:** Adopted  
**Adopted:** 2026-01-26  
**Owner:** Privacy/Compliance (Superintendent)  
**Applies To:** All realms, all apps, all data integrations  

## Purpose

Ensure we build every system with privacy as a default: collect less, retain less, restrict access, and prove compliance through documentation and controls.

## Definitions

- **PII**: Personally Identifiable Information (directly identifies a person).
- **Sensitive data**: PII + student data + financial identifiers + credentials/tokens + private communications.
- **Data minimization**: Collect/store only what is necessary for the purpose.
- **Least privilege**: Only the minimum access needed to perform a function.

## Requirements (SHALL)

- **Data minimization**:
  - We SHALL not collect, store, or log sensitive data unless it is required for a defined purpose.
  - We SHALL document the purpose and retention for each sensitive data element.
- **Default privacy posture**:
  - We SHALL default to **private** access and explicitly grant access where needed.
  - We SHALL use row-level security (RLS) for any client-facing tables and scoped data access for services.
- **Secrets management**:
  - We SHALL never commit secrets to git.
  - We SHALL store secrets in environment variables or a managed secret store.
- **Logging discipline**:
  - We SHALL not log raw request bodies that may contain PII.
  - We SHALL redact or hash identifiers when logging.
  - We SHALL log AI usage in a controlled way (no raw sensitive prompts; store redacted summaries when possible).
- **Documentation as control**:
  - We SHALL record privacy-impacting decisions as ordinances or executive directives.
  - We SHALL maintain a data inventory for each realm (what data, where from, where stored, who can access).

## Guidance (SHOULD)

- Prefer anonymized/aggregated metrics for dashboards.
- Prefer one-way hashes for identifiers when a stable join key is needed without revealing the original value.
- Treat “exports” and “archives” as high-risk: keep them local and ephemeral unless explicitly approved and sanitized.

## Implementation Notes

- For each integration (Stripe, Supabase, analytics, etc.), document:
  - Data fields pulled
  - Storage location
  - Access boundaries (service vs client)
  - Retention window
  - Redaction rules for logs
- For each new feature:
  - Identify sensitive data flows
  - Define a safe default
  - Add a “privacy notes” section to the decision record

## Compliance / Enforcement

- Pull requests SHOULD include a privacy review checklist item when touching:
  - Auth, user tables, student data, logging, exports, AI prompts, or integrations
- Periodic audits SHOULD verify:
  - RLS is enabled where required
  - No secrets in repo history
  - Logs do not contain raw sensitive payloads

## Exceptions

Exceptions require an ordinance addendum documenting:

- what is being collected/stored,
- why it is required,
- how it is protected,
- the exact retention window,
- and who approved it.

## Change Log

| Date | Change | Reason | Author |
|------|--------|--------|--------|
| 2026-01-26 | Initial adoption | Establish baseline privacy controls | Agent + John |

