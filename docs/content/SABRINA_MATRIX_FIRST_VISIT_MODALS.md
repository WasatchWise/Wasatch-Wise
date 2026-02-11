# Sabrina Matrix — First-Visit Modals

**Purpose:** One welcome modal per entry point, aligned with the [Brand Matrix](docs/brand/BRAND_POSITIONING.md). Each brand gets one clear message on first visit—no sprawl, one outcome per touch (Sabrina: one outcome per piece of content).

**Reference:** [BRAND_POSITIONING.md](../brand/BRAND_POSITIONING.md) (Brand Matrix, Audience Boundaries, Messaging Guidelines).

---

## Matrix: Entry Point → Modal Content

| Entry point | Brand | Audience | Modal headline | Modal body (short) | Primary CTA | Secondary CTA |
|-------------|--------|----------|----------------|--------------------|-------------|----------------|
| `/` (wasatchwise.com) | WasatchWise | School districts, superintendents, IT directors | AI governance for school districts | Stop worrying about AI compliance. Build trust with parents, protect student data, and empower teachers—in 90 days. | Book a Cognitive Audit | Take the AI Readiness Quiz |
| `/adult-ai-academy` (or adultaiacademy.com) | Adult AI Academy | Adults, Gen X/Xennials, reluctant learners | Practical AI literacy for adults | Whether you're upskilling, hesitant to try AI, or ready to go beyond the basics. Built for real people—no jargon. | Get Started | Take Free Assessment |
| askbeforeyouapp.com `/` | Ask Before You App | K-12 schools, teachers, parents | App safety for K-12 and families | Vet edtech and AI tools before they touch your classroom or your kids. Privacy, DPAs, and clear guidance. | Try WiseBot | Contact |

---

## Rules (aligned with Sabrina / Brand Positioning)

1. **One modal per visit** — Show at most one modal per session per entry point (sessionStorage key by slug).
2. **One outcome per modal** — One primary CTA; one clear takeaway (headline + 1–2 sentences).
3. **No cross-brand clutter** — WasatchWise modal does not push AAA or ABYA; AAA does not use K-12 language; ABYA does not use enterprise governance language.
4. **Dismissible** — Always allow close (X or "Maybe later"); no forced path.

---

## Implementation

- **Dashboard app:** `FirstVisitModal` + config keyed by path (`/` → wasatchwise, `/adult-ai-academy` → adult-ai-academy). Rendered in marketing layout via `FirstVisitModalController` that reads `pathname`. Storage: `ww_first_visit_modal_${slug}` in **sessionStorage** (once per session).
- **Ask Before You App:** Existing `WhoAreYouModal` (root layout) is aligned with the matrix: headline "App safety for K-12 and families", body about vetting and privacy. Persona + optional email remain for routing and nurture. Storage: `abya_welcome_seen` in localStorage (existing).
