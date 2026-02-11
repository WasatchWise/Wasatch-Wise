# Code Extension Verification Report — Feb 11, 2026

**Completed by:** Claude Code Extension (browser / logged-in checks)  
**Source questions:** `docs/QUESTIONS_FOR_CLAUDE_CODE_EXTENSION_FEB_11.md`

---

## 1. Cloudflare Web Analytics

| Domain | Status | Notes |
|--------|--------|--------|
| **wasatchwise.com** | ✅ Enabled | Showing 0 visits/pageviews in last 24 hours |
| **askbeforeyouapp.com** | ❌ Not in Cloudflare | Domain not managed through the Cloudflare account accessed |

**Action:** Add askbeforeyouapp.com to Cloudflare (or confirm which account manages it) if you want Web Analytics there. wasatchwise.com is correctly enabled.

---

## 2. GA4 Realtime

### Status after env var fix (Feb 11)

| Check | Status |
|-------|--------|
| **Deployments** | ✅ wasatchwise deployed 4–5 min ago; askbeforeyouapp 2–3 min ago (both Ready, Current) |
| **Scripts loading** | ✅ wasatchwise.com → G-Z6E4LRL4Q8; askbeforeyouapp.com → G-RN4R6STPML |
| **Realtime report** | ✅ Working (phone test showed page_view + session_start; desktop was blocked by browser) |

**Root cause identified (GA4 stream details):**
- **Wasatch Wise** stream in wasatch-wise-hq: Measurement ID **G-Z6E4LRL4Q8** (matches Vercel), URL https://wasatchwise.com, Stream ID 13585661447.
- GA4 warning: "Data collection isn't active for your website. If you installed tags more than 48 hours ago, make sure they are set up correctly."
- Other streams in same property: **SLCTrips** (slctrips.com) and **AAA** (adultaiacademy.com) are **receiving traffic** in the past 48 hours.
- **Conclusion:** Setup is correct; wasatchwise.com alone is not sending data. Most likely: ad blocker / browser privacy blocking gtag, or cookie consent / CSP blocking the script.

**Previous possible explanations (superseded by stream check):**
- **Data delay:** GA4 can take 5–15 minutes for Realtime to show data (usually faster).
- **Ad blockers / privacy tools:** Extensions or browser settings may block gtag requests.
- **Property vs streams:** The two sites use different measurement IDs. If you’re viewing the “wasatch-wise-hq” property, confirm in **GA4 Admin → Data Streams** which measurement ID(s) that property has. G-Z6E4LRL4Q8 and G-RN4R6STPML may be in different properties or different streams.
- **Browser:** Safari or strict Chrome privacy settings can block analytics.

**Recommended next steps:**
1. **Debug mode:** Add `NEXT_PUBLIC_GA_DEBUG=true` in Vercel Production for the **wasatchwise** project, redeploy, then GA4 → Admin → **DebugView**. Visit wasatchwise.com; if events appear, tracking works and the issue is likely the browser used for Realtime.
2. **Clean test:** Open wasatchwise.com in incognito/private or on another device with no extensions; check Realtime again.
3. **Console:** On wasatchwise.com, DevTools → Console — look for errors mentioning gtag or googletagmanager.

### Debug mode test (Feb 11)

Debug mode was enabled (`NEXT_PUBLIC_GA_DEBUG=true`, redeployed). **DebugView still showed "Waiting for debug events" with 0 events** after visiting wasatchwise.com.

**Root cause confirmed:** Browser-level blocking. Evidence:
- Correct measurement ID loaded (G-Z6E4LRL4Q8), deployment successful, debug enabled, other streams (SLCTrips, AAA) receiving data — but DebugView shows no events. So the blocking is on the device/browser used for testing (ad blocker, privacy settings, cookie/tracking blocker, or VPN/network).

**Verification (do from a clean environment):**
1. **Clean test:** Open wasatchwise.com from mobile (cellular), or incognito with all extensions disabled, or a different browser/computer. Check Realtime or DebugView again.
2. **Browser check:** Disable ad blocker and strict privacy (e.g. Chrome → Privacy and security → Cookies; Safari → Privacy → Prevent cross-site tracking); retry.
3. **Third party:** Have someone else visit wasatchwise.com; if their visit appears in Realtime/DebugView, the issue is limited to your test environment.

**Clean-up when done:** Remove debug flag — Vercel → wasatchwise → Settings → Environment Variables → delete `NEXT_PUBLIC_GA_DEBUG` or set to `false` → redeploy.

### GA4 verification complete (Feb 11 — phone test)

**Phone visit was tracked successfully.** Realtime report showed:
- **Views by page:** "AI Governance for School Districts |..." — 1 view (100%)
- **Events:** `page_view` (1), `session_start` (1)

**Conclusion:** GA4 tracking is working on wasatchwise.com. Measurement ID G-Z6E4LRL4Q8 is functioning. The earlier 0 events were due to **browser-level blocking on the desktop** (ad blocker or privacy settings).

**Clean-up:** Remove `NEXT_PUBLIC_GA_DEBUG` from Vercel (wasatchwise → Settings → Environment Variables → delete or set to `false`) and redeploy.

**Optional:** To have GA4 track desktop visits too, whitelist wasatchwise.com in your ad blocker or allow `*.googletagmanager.com` and `*.google-analytics.com`.

---

## 3. Vercel Environment Variables (GA4)

| Project | Variable | Production | Notes |
|---------|----------|------------|--------|
| **wasatchwise** (dashboard) | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ✅ SET | G-Z6E4LRL4Q8 — deployments complete |
| **askbeforeyouapp** | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ✅ SET | G-RN4R6STPML — deployments complete |

**Debug (troubleshooting):** `NEXT_PUBLIC_GA_DEBUG=true` sends events to DebugView. **Remove or set to false and redeploy** once verification is done (see Section 2).

---

## 4. Email Infrastructure

SendGrid check was not completed due to time.

From Vercel environment variables:
- **RESEND_API_KEY** is present in both projects.
- This matches Feb 9 documentation: **Resend** is used for contact forms, quiz, and audit.

**Conclusion:** Resend is the primary sender. SendGrid migration may be unnecessary if Resend is the only active sender; confirm SendGrid account status when convenient.

---

## 5. johnlyman.net

- **Live and functional.** Creative "Lyman Land" theme park–style interactive map showcasing expertise areas.
- CTA / “150+ districts” / broken-link checks were not explicitly reported; consider re-running `docs/JOHNLYMAN_NET_AUDIT_CHECKLIST.md` if needed.

---

## 6. Adult AI Academy (adultaiacademy.com)

- ✅ **Redirects to wasatchwise.com** and displays the Adult AI Academy landing page (not a separate standalone app).

---

## 7. First Blog Post Live?

Not reported. Check wasatchwise.com blog or dashboard for any post published in the last 7 days.

---

## Critical Action Items

1. **GA4:** ✅ Verified working (phone test). Remove debug flag when done. Both projects have `NEXT_PUBLIC_GA_MEASUREMENT_ID` set and are deployed. Scripts load correct IDs. If Realtime still shows 0, use “Recommended next steps” in Section 2 (wait, different device, verify Data Streams, or enable DebugView).

2. **Cloudflare:** Add or confirm askbeforeyouapp.com in the correct Cloudflare account if you want Web Analytics on that domain.

3. **Optional:** Re-run johnlyman.net audit checklist (CTA, “150+ districts,” broken links) and document results.

---

**Document control:** Version 1.3 — Feb 11, 2026. GA4 verification complete: phone test showed Realtime events; tracking confirmed working; desktop issue was browser blocking. Clean-up: remove debug flag.
