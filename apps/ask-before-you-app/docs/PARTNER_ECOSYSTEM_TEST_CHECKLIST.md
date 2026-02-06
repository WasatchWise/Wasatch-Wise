# Partner Ecosystem — Pre-Deploy Test Checklist

Use this checklist before deploying Phase 1 (TEC + FPF integration) to production.

## Learn page

- [ ] **/learn** — External Resources section is visible at the bottom
- [ ] **/learn** — "Also on this page" quick links include **Certification** and **External resources**
- [ ] **/learn** — Clicking "External resources" scrolls to the External Resources section
- [ ] **/learn** — All three resource cards render (Student Privacy Compass, TEC SDPA, SDPC Resource Registry)
- [ ] **/learn** — Each resource link opens in a new tab and goes to the correct URL
- [ ] **/learn** — Layout is readable on mobile (responsive)

## State ecosystem pages — TEC notes

- [ ] **/ecosystem/ma** — Shows **Implementation support** section with TEC direct-service note and link to TEC SDPA
- [ ] **/ecosystem/il** — Shows **Implementation support** with LTC partnership note and link to LTC
- [ ] **/ecosystem/ca** — Does **not** show any TEC / Implementation support section
- [ ] **/ecosystem/me**, **/ecosystem/nh**, **/ecosystem/ne**, **/ecosystem/ri**, **/ecosystem/vt**, **/ecosystem/va** — Each shows TEC direct-service note
- [ ] **/ecosystem/mo**, **/ecosystem/ny**, **/ecosystem/oh**, **/ecosystem/tn** — Each shows partnership note with correct partner name and URL

## Links

- [ ] TEC SDPA: `https://tec-coop.org/data-privacy/`
- [ ] Student Privacy Compass: `https://studentprivacycompass.org/`
- [ ] SDPC Resource Registry: `https://privacy.a4l.org/sdpc-resource-registry/`
- [ ] Partnership URLs (IL LTC, MO MOREnet, NY SED, OH Learn21, TN TETA) open correctly

## Build & types

- [ ] `pnpm build` (or `npm run build`) completes without errors
- [ ] No TypeScript errors in `lib/ecosystem/partners.ts` or state/learn pages

---

**Phase 1 scope:** `PARTNER_ECOSYSTEM_ANALYSIS.md`, `lib/ecosystem/partners.ts`, Learn External Resources, TEC notes on 12 state pages.
