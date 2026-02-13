# Build-it-again: Corporate project insights

**Purpose:** If we built the entire WasatchWise corporate project from scratch, what would we do the same, what would we do differently, and what insights should inform future decisions? This doc captures that analysis. No code or config changes—reference only.

**Last updated:** February 2026

---

## Current decisions (recorded here to avoid drift)

- **Adult AI Academy (AAA) canonical home:** Public AAA web presence = **dashboard** (Option B): wasatchwise.com + `/adult-ai-academy`, adultaiacademy.com → same deployment. The standalone `apps/adult-ai-academy` app is for **internal/synthesis/library/pilot** (HeyGen, etc.), not the main marketing entry.
- **Email:** **Resend** = primary for transactional. **SendGrid** kept in stack but not paid for now.
- **Tier 1 (corporate core):** dashboard, ask-before-you-app, AAA (dashboard routes). Other apps in the monorepo are ventures with separate deploy and focus.

---

## 1. What we’d do the same

**Monorepo + Turborepo** — One repo, `apps/*`, root scripts (`dev:abya`, `dev:dashboard`). One place for MCP, docs, shared config.

**Tech stack** — Next.js 15 (App Router), TypeScript, Tailwind, Supabase, Vercel. Fits consulting, content, and tools.

**Holy Trinity** — Three brands (WasatchWise, Adult AI Academy, Ask Before You App) with distinct audiences; Brand Matrix and audience boundaries in [BRAND_POSITIONING.md](../brand/BRAND_POSITIONING.md).

**Per-app Supabase + per-app Vercel** — Isolated DB and deploy per app. Avoids single points of failure; matches multi-venture reality.

**Docs and governance** — civilization/, docs/ (brand, plans, execution schedule). Venture Status Review and Dormant Venture Act in [CORPORATE_MISSION_POLICIES_PROCEDURES_ACTS.md](../governance/CORPORATE_MISSION_POLICIES_PROCEDURES_ACTS.md).

**Sabrina-aligned UX** — First-visit modals by entry point ([SABRINA_MATRIX_FIRST_VISIT_MODALS.md](../content/SABRINA_MATRIX_FIRST_VISIT_MODALS.md)), one outcome per touch.

---

## 2. What we’d do differently (if starting over)

**One canonical AAA surface** — Pick one home for AAA (we’ve documented dashboard as canonical). Avoid two codebases both claiming “Adult AI Academy” marketing.

**Explicit venture tiers** — Tier 1 (corporate) vs Tier 2 (other ventures). CI/build could filter by tier so corporate deploys aren’t blocked by unrelated apps. Not implemented; doc-only for now.

**Shared packages for the Trinity** — `packages/*` for shared UI (Button, first-visit modal, blog MDX) so dashboard and ABYA don’t duplicate. Would reduce drift. Not implemented; would require refactor.

**Single email provider from day one** — One provider (e.g. Resend) for all transactional/marketing. We’ve documented current state (Resend primary, SendGrid kept not paid).

**New ventures start as experiments** — New ideas in a sandbox or experiment app until they hit a bar (revenue, activation decision), then promote to `apps/<name>`. Aligns with Dormant Venture Act.

---

## 3. Insights (recurring themes)

**Single source of truth per concept** — One AAA home, one email story, one modal implementation. When adding a brand or channel, default to “reuse or extend,” not “copy and tweak.”

**Corporate vs ventures** — Explicit tiers let the company protect the core (dashboard, ABYA, AAA) and still run experiments without treating every app as equal.

**Governance pays off** — Venture Status Review, Primary Focus, Dormant Venture Act already encode “say no, archive, or activate.” “Experiment first, then promote” would extend that.

**Brand and docs as contract** — BRAND_POSITIONING and the Sabrina matrix act as the contract for copy, CTAs, modals. Shared implementation (e.g. packages) would keep apps from drifting.

**Two AAA codebases is the main structural debt** — Largest “would fix”: one canonical AAA entry (dashboard), one codebase for marketing/blog/portal; the other (standalone app) has a clear, documented role (internal/tools).

---

## 4. What we’re doing now (no unintended consequences)

- **This doc** — Capture same/different/insights and current decisions.
- **Recorded decisions** — AAA canonical = dashboard; email = Resend primary, SendGrid kept not paid; Tier 1 = dashboard, ABYA, AAA (dashboard).
- **No code or config changes** — Everything above is documentation-only. Structural changes (packages, CI tiers, redirects) are for later when we’re ready to accept rollout risk.
