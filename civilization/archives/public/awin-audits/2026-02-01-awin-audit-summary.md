# Awin Link Audit Summary – slctrips.com Booking.com

**Date:** 2026-02-01  
**Auditor:** Director of Awin Monetization (Chrome extension)  
**Site:** slctrips.com  
**Merchant:** Booking.com (Awin ID 6776)  
**Publisher:** 2060961 (Wasatch Wise LLC)

---

## RESULT

**PASS** (with minor verification needed)

All tested Booking.com links use Awin tracking (`awin1.com/cread.php`), correct `awinmid=6776`, `awinaffid=2060961`, and appropriate campaign parameters.

---

## VERIFIED

| Location | Link | Campaign | Status |
|----------|------|----------|--------|
| Homepage | Rent a Car | slctrips-homepage-cars | OK |
| Homepage | Find Hotels | slctrips-homepage-hotels | OK |
| Footer | Find Accommodations | slctrips-homepage-hotels | OK |
| Destination (e.g. SLC Airport) | Where to Stay → View on Booking.com | slctrips-accommodations | OK |

---

## UNABLE TO VERIFY (login/access)

| Location | Reason |
|----------|--------|
| TripKit viewer (my-tripkits/[code]) | 404 without login/ownership; "Where to Stay" in TripKit viewer remains on backlog for verification when logged in. |

---

## BUGS

None.

---

## NEEDS CURSOR

None for tested pages.

---

## RECOMMENDATIONS (from Director)

1. **Optional:** Add "Where to Stay" higher on destination pages; consider 3–5 hotels.
2. **Future:** Add other Awin partners (Campspot, GoWithGuide, Cerquer) per AWIN_STRATEGY.
3. **Next:** Monitor Awin dashboard by campaign (homepage vs destinations) and optimize placement.

---

## RETENTION

R2 Governance per ORD-0002. Redacted summary only; no PII.  
See [AWIN_SECTOR_ORG section 6f](../../../realms/wasatchville/docs/AWIN_SECTOR_ORG.md#6f-report-destination).
