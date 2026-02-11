# Questions for Claude Code Extension — Feb 11, 2026

**Purpose:** These require logged-in browser access (GA4, Cloudflare, Vercel, SendGrid, live sites). Please run through each, then save a short summary to `docs/reports/CODE_EXTENSION_VERIFICATION_FEB_11.md` so we have one place with answers.

---

## 1. Cloudflare Web Analytics

- Log into **Cloudflare** (account that has wasatchwise.com and askbeforeyouapp.com).
- For **wasatchwise.com**: Is "Web Analytics" (or the equivalent visitor analytics) **enabled**? Are any pageviews/visits shown (even if 0 or low)?
- Same for **askbeforeyouapp.com**.

**Answer format:** wasatchwise.com: Enabled Y/N, data visible Y/N. askbeforeyouapp.com: same.

---

## 2. GA4 Realtime

- Log into **Google Analytics** (property: wasatch-wise-hq or the one used for WasatchWise).
- Go to **Reports → Realtime**.
- Open **wasatchwise.com** in a browser tab and leave it a moment. Do you see a realtime hit in GA4?
- Open **askbeforeyouapp.com** in a tab. Do you see a realtime hit?

**Answer format:** wasatchwise.com: Hit seen Y/N. askbeforeyouapp.com: Hit seen Y/N. If no hit, note whether the data stream exists or is missing.

---

## 3. Vercel — GA4 environment variable

- Log into **Vercel**.
- Open the project that deploys **wasatchwise.com** (likely "dashboard" or "wasatchwise").
  - **Settings → Environment Variables.** Is `NEXT_PUBLIC_GA_MEASUREMENT_ID` set for **Production**? What is the value (e.g. G-XXXXXXXXXX)?
- Open the project that deploys **askbeforeyouapp.com**.
  - Same check: `NEXT_PUBLIC_GA_MEASUREMENT_ID` for Production? Value?

**Answer format:** wasatchwise project: Set Y/N, value. askbeforeyouapp project: Set Y/N, value.

---

## 4. SendGrid vs Resend (email)

- Log into **SendGrid**. This month: how many emails sent? Is the account on trial or paid? Any active automations or just manual/API use?
- In the codebase, the **dashboard** uses **Resend** for contact form / quiz / audit (see `apps/dashboard` and any `lib/email` or similar).

**Answer format:** Primary sender for WasatchWise: Resend or SendGrid? SendGrid: trial/paid, X emails this month. Do we still need to migrate off SendGrid (Y/N)?

---

## 5. johnlyman.net audit

- Open **https://johnlyman.net** in the browser.
- **Homepage:** Is there a clear call-to-action like "Consulting with school districts? Learn about WasatchWise →" (or similar) that links to wasatchwise.com/about or wasatchwise.com/contact?
- **Privacy Perimeter** (or the section that describes district work): Is "150+ school districts" (or equivalent) clearly stated?
- **Broken links:** Click main nav and key sections. Any obvious 404s or broken links? List critical ones or "None found."

**Answer format:** CTA on homepage: Y/N. "150+ districts" stated: Y/N. Broken links: None / list.

---

## 6. Adult AI Academy live URL (optional)

- Open **https://adultaiacademy.com**. What do you see? (e.g. redirect to wasatchwise.com, standalone app, "under construction," etc.)

**Answer format:** One sentence.

---

## 7. First blog post live? (optional)

- If the WasatchWise blog is on wasatchwise.com (or the dashboard app): Is there a **blog post published in the last 7 days**? For example "The 5 Questions Every Superintendent Must Ask…" or "FERPA vs. COPPA for AI in Schools…"?

**Answer format:** Yes/No. If yes, paste the URL.

---

**After answering:** Create or update `docs/reports/CODE_EXTENSION_VERIFICATION_FEB_11.md` with the answers so the main revised plan (`docs/plans/REVISED_PLAN_FEB_11_2026.md`) can reference one verification doc.
