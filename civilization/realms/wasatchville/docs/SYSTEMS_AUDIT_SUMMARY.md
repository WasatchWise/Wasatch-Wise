# Systems Audit Summary: SLC Trips & The Rock Salt

**Realm:** WasatchVille  
**Properties:** slctrips.com (B002), therocksalt.com (B003)  
**Purpose:** One-page view of audit results and next moves before inviting engagement at scale.  
**Last Updated:** 2025-01-31

---

## TL;DR

| Property | Status | Blocker? |
|----------|--------|----------|
| **SLC Trips** | Payment not connected; demo mode live | 🔴 Yes — do not promote until Stripe is wired |
| **The Rock Salt** | Fully functional | 🟢 No — ready to promote |

---

## SLC Trips (B002)

**Critical finding:** Clicking "Buy" gives instant access (DEMO-TK-*, preview@slctrips.com). No Stripe, no payment wall.

**What’s good:** Delivery, UI, progress tracking, Dan audio, Ask Dan, access-code system all work. One integration missing: **Buy button → Stripe Checkout → payment → email → access code → view.**

**Details:** [SLCTRIPS_PRE_LAUNCH_CHECKLIST.md](SLCTRIPS_PRE_LAUNCH_CHECKLIST.md) — audit findings, missing link, Swiss cheese list, post-fix test flow.

---

## The Rock Salt (B003)

**Finding:** No critical issues. Band submission, booking board, live stream, auth, search, 476 bands. Empty board is cold start (seed + outreach), not a bug.

**Details:** [ROCK_SALT_SYSTEMS_AUDIT.md](ROCK_SALT_SYSTEMS_AUDIT.md) — what works, Swiss cheese, launch strategy.

---

## Next 3 Moves

| Move | Property | Goal | When |
|------|----------|------|------|
| **1** | SLC Trips | Wire Stripe to buy buttons; test real $9.99 purchase | This weekend |
| **2** | Rock Salt | Seed booking board with ~10 open slots; ask 3 bands to claim | Monday |
| **3** | Both | Controlled soft launch | Next weekend |

**SLC Trips soft launch:** "First 10 to comment get 50% off + help me test the system."  
**Rock Salt soft launch:** "Free gig postings for first 25 bands. Let's fill February."

---

## Bottom Line

- **Rock Salt:** Ship it. It works.
- **SLC Trips:** One fix (Stripe → buy button → access gate), then re-run the 11-step post-fix test. Not a rebuild.

See [SLCTRIPS_PRE_LAUNCH_CHECKLIST.md](SLCTRIPS_PRE_LAUNCH_CHECKLIST.md) and [ROCK_SALT_SYSTEMS_AUDIT.md](ROCK_SALT_SYSTEMS_AUDIT.md) for full checklists and launch steps. [WASATCHVILLE_RTS_AND_MEDIA.md](WASATCHVILLE_RTS_AND_MEDIA.md) — RTS/SimCity framing, building-level health check, multi-platform strategy.
