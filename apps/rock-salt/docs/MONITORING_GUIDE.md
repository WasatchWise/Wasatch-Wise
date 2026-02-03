# Post-Launch Monitoring Guide

**What to watch and when to act** after going live with the Spider Network.

---

## First 24 Hours

### Watch

- **Vercel:** Deployment status, function errors, 5xx rate.  
- **Supabase:** DB and Auth health; any policy errors in logs.  
- **Critical path:** Can users sign up, claim band/venue, publish a rider, save venue profile, and open the compatibility browse page without errors?

### Act if

- Auth or DB is down → fix or roll back.  
- Publish or profile save fails consistently → fix or disable the flow and communicate.  
- Storage upload fails for PDFs → check bucket and policies; use download API (signed URL) as fallback.

### Don’t over-act

- Single 404s or one-off errors: log and monitor.  
- Low traffic: expected; focus on “did the first invitees succeed?”

---

## First Week

### Watch

- **Counts:** Published riders, venues with profile_updated_at set, spider_rider_acceptances (if any).  
- **Support:** Inbound questions (email, Discord, etc.): “can’t publish,” “can’t save profile,” “compatibility doesn’t show.”  
- **Drop-off:** If you have basic analytics, where do users stop (e.g. wizard step 2 vs 5)?

### Act if

- Multiple users hit the same error → fix and notify.  
- Everyone drops at the same step → simplify or add copy/help.  
- Venues say “compatibility is wrong” → note which rider/venue; tune algorithm or messaging (see [NEXT_PHASE_DECISION_MATRIX.md](./NEXT_PHASE_DECISION_MATRIX.md)).

### Don’t over-act

- One user confused: help them individually; only change product if it recurs.  
- Low volume: keep recruiting; week 1 is often soft.

---

## First Month

### Watch

- **Trends:** Riders and venue profiles week-over-week.  
- **Engagement:** Compatibility views (or “rider detail opens” by venue owners).  
- **Feedback:** Themes from surveys or calls (want booking flow? clarity? different filters?).  
- **Stability:** Error rate and critical bugs.

### Act if

- Clear demand for “request a date” / “book” → prioritize Option C (booking).  
- Recurring confusion on one flow → polish (Option E) or copy.  
- Compatibility complaints → tune algorithm or add tooltips.  
- Supply side weak (no new riders) → focus on artist recruitment and onboarding.

### Don’t over-act

- Single negative comment: treat as signal, not mandate.  
- Feature requests that don’t align with metrics: park them and revisit after validation.

---

## When to Intervene vs. Observe

| Situation | Intervene | Observe |
|-----------|-----------|--------|
| Publish or profile save broken for everyone | Yes – fix or rollback | - |
| One user can’t sign up (e.g. email domain) | Yes – fix auth/config | - |
| Low signups in week 1 | Yes – more invites, check messaging | - |
| Low completion of wizard | - | Yes – gather more data; then simplify or nudge |
| “We want to book through you” | - | Yes – count; if repeated, plan Option C |
| Compatibility score feels wrong to one user | - | Yes – note case; tune if pattern appears |
| Single 500 error | Log, fix when convenient | Yes |

**Rule of thumb:** Intervene for **broken** or **blocking** issues; observe and **prioritize** for “nice to have” and “we want X” until you see a pattern or hit success criteria.

---

*Next: [NEXT_PHASE_DECISION_MATRIX.md](./NEXT_PHASE_DECISION_MATRIX.md) for data-driven next steps.*
