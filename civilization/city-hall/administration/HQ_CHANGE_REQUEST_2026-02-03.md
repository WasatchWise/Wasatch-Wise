# HQ Change Request — SLC Trips (B002) Alerts

**Date:** 2026-02-03  
**From:** SLC Trips (B002)  
**To:** Wasatch Wise Headquarters  
**Priority:** High (operational awareness)

## Change needed (HQ-level)

**Problem:** Headquarters currently learns about SLC Trips errors only by manually checking Sentry/Stripe/Vercel or by customer email. There is no automatic notification path to HQ.

**Request:** Establish HQ-level alerting for B002 using **Sentry Issue Alerts** (email and/or Slack).

### Proposed implementation

- **Sentry Issue Alert** for SLC Trips project:
  - **Trigger:** “A new issue is created” (or threshold, e.g. “seen > 3 times in 1 hour”).
  - **Action:** Send **Email** to HQ list and/or post to **Slack** channel (e.g. `#b002-alerts`).
- Optional: Stripe failures → Slack via n8n or serverless function.

### Why this matters

- Eliminates “wait for customer email” failure mode.
- Gives HQ real-time visibility when the amusement park (B002) breaks.
- Aligns with existing corporate infrastructure (Sentry + Slack).

### Reference

See `apps/slctrips/docs/WHERE_TO_LOOK_WHEN_THINGS_BREAK.md` for details and setup steps.

