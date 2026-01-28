## Archives

Archives are our record-keeping system. They exist to support:

- **Institutional memory** (decisions, rationale, results)
- **Auditability** (what changed, when, and why)
- **Record retention** (keep what we must, delete what we should)
- **Privacy by design** (never stockpile sensitive data unnecessarily)

### Safety rule

Do **not** commit raw sensitive records (PII, credentials, private exports) into git.

Use:

- `civilization/archives/public/` for safe-to-commit records (policy docs, redacted summaries).
- `civilization/archives/private/` for sensitive material (gitignored).
- `civilization/archives/exports/` for generated exports/backups (gitignored).

