# Language Translation (i18n) — Strategy for All Sites

**Purpose:** Roll out UI language translation across WasatchWise apps so every site can serve users in their preferred language.

**Status:** Not built yet. SLC Trips has **voice** language detection (Dan speaks in the user’s browser language via ElevenLabs); that’s separate from **UI translation** (menus, copy, pages in multiple languages).

---

## 1. What Exists Today

| App / Site | Language-related | Type |
|-------------|-------------------|------|
| **SLC Trips** | `userLanguage` from `navigator.language`; Dan (voice) uses it for ElevenLabs TTS. | **Voice only** — UI is still English. |
| **Ask Before You App** | `lang="en"` on `<html>`. | **None** — English only. |
| **Dashboard** | `lang="en"` on `<html>`. | **None** — English only. |
| **Rock Salt** | `lang="en"` on `<html>`. | **None** — English only. |
| **Adult AI Academy** | `lang="en"` on `<html>`. | **None** — English only. |
| **Pipeline IQ** | — | **None** — English only. |
| **DAiTE, GMC Mag, Dublin Drive Live, etc.** | — | **None** — English only. |

So: **no app has full UI translation yet.** Adding it everywhere is the goal.

---

## 2. Recommended Approach: Shared Pattern, Per-App Content

**Philosophy:** Same pattern on every site (detect locale, load messages, render translated UI). Content (translation JSON/namespaces) can live per-app so each brand controls its own copy.

### 2.1 Option A: `next-intl` (Next.js App Router)

- **Pros:** Works with App Router, middleware for locale detection, no extra routing layer if you use locale in URL or cookie.
- **Cons:** Next.js only (slctrips, ask-before-you-app, dashboard, rock-salt, pipeline-iq, adult-ai-academy that use Next.js).
- **Pattern:** `[locale]` segment or cookie; `next-intl` provider; `useTranslations()` in components; JSON files per app: `messages/en.json`, `messages/es.json`, etc.

### 2.2 Option B: `react-i18next` + `i18next`

- **Pros:** Framework-agnostic; works with Next.js, Vite (dublin-drive-live, gmc-mag), CRA. One API across all React apps.
- **Cons:** Slightly more setup (provider, backend, detection).
- **Pattern:** `i18n.init()` with `languageDetector`; `useTranslation()` in components; same JSON-per-app structure.

### 2.3 Option C: Shared i18n Package (Future)

- **Location:** e.g. `packages/wasatchwise-i18n` (create when you add packages).
- **Contents:** Shared utilities (locale list, detection fallback, maybe shared strings like “Contact”, “Privacy Policy” if you want consistency).
- **Apps:** Import package; each app still has its own `messages/{locale}.json` for page content.

**Recommendation:** Start with **Option A for Next.js apps** and **Option B for Vite/other React apps**, using the same JSON structure and locale codes (e.g. `en`, `es`, `fr`). Add a shared package later if you want shared strings or helpers.

---

## 3. Locale Strategy

- **Default:** `en` (English).
- **Detection:** Browser language (`navigator.language`) with fallback to `en`. Optional: URL prefix (`/es/...`) or cookie for override.
- **First languages to add (suggested):** English (default), Spanish (`es`) — high impact for US K–12 and families. Then French (`fr`) if you have Canadian or French-speaking users.
- **ABYA / SDPC:** Spanish is especially valuable for parent and educator outreach in many districts.

---

## 4. Per-App Rollout Checklist

For each app, you’ll need to:

1. **Add i18n dependency** — `next-intl` or `react-i18next` + `i18next`.
2. **Create message files** — e.g. `messages/en.json`, `messages/es.json` (extract current copy into keys).
3. **Wrap app in provider** — e.g. `NextIntlClientProvider` or `I18nextProvider`.
4. **Add locale detection** — middleware (Next.js) or `i18n.use(languageDetector)`.
5. **Optional: locale switcher** — e.g. “English | Español” in header/footer so users can override.
6. **Set `<html lang={locale}>`** — for a11y and SEO.
7. **Optional: hreflang** — if you use locale in URL, add `<link rel="alternate" hreflang="x">` for SEO.

---

## 5. Apps and Suggested Order

| Priority | App | Stack | Note |
|----------|-----|--------|------|
| 1 | **Ask Before You App** | Next.js | SDPC, parents, educators — Spanish is high value. |
| 2 | **SLC Trips** | Next.js | Already has language detection for voice; add UI translation so Dan + page copy match. |
| 3 | **Dashboard** | Next.js | Shared nav, contact, pricing — one place to translate benefits all brands. |
| 4 | **Rock Salt** | Next.js | Events/venues — Spanish for artist/venue names and audience. |
| 5 | **Adult AI Academy** | Next.js | Corporate training — English first, then expand. |
| 6 | **Pipeline IQ** | Next.js | B2B — English first. |
| 7 | **DAiTE, GMC Mag, Dublin Drive Live, etc.** | Vite/other | Use `react-i18next`; add when needed. |

---

## 6. Shared Conventions (All Sites)

- **Locale code:** BCP 47 (e.g. `en`, `es`, `fr`). No region in v1 unless needed (e.g. `en-US` vs `en-GB`).
- **Message keys:** Namespaced by screen or feature (e.g. `home.hero.title`, `contact.form.submit`). Avoid one giant flat file.
- **Fallback:** Missing key → show English or key so you see what’s missing.
- **RTL:** Defer until you add a RTL language (e.g. Arabic); then set `dir="rtl"` and layout accordingly.

---

## 7. Quick Win: One Shared Component

If you don’t want full i18n in every app immediately, you can add a **language switcher component** and a **single shared locale store** (e.g. cookie + context) so that:

- User picks “Español” once.
- Cookie/store persists.
- Next visit (or next app if you share the cookie domain) uses Spanish.

Then, per-app, you either:

- Load that app’s `messages/es.json` and render translated UI, or  
- Keep UI in English but use the locale for **voice only** (like SLC Trips today) until you’re ready to translate that app’s copy.

That way “language translation” is on all sites in the sense of **preference and detection**, and you add full UI translation app-by-app.

---

## 8. Summary

- **Today:** No app has full UI translation. SLC Trips has voice-language detection only.
- **Goal:** Language translation (i18n) on all sites — same pattern, per-app message files.
- **Approach:** `next-intl` for Next.js apps, `react-i18next` for others; shared locale list and conventions; optional shared package later.
- **Order:** ABYA and SLC Trips first (high impact for Spanish); then Dashboard, Rock Salt, others.

Once you pick Option A or B and one pilot app (e.g. ABYA), the next step is: add the dependency, create `messages/en.json` and `messages/es.json` from current copy, wrap the app in the provider, and add a small locale switcher. Then replicate the pattern across the rest of the sites.
