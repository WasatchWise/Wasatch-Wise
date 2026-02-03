# Build vs Buy – WasatchVille Operating Principle

**Realm:** WasatchVille  
**Principle:** Ramp up by **buying / adopting** first; build only when nothing fits or it’s a differentiator.  
**Last updated:** 2026-02-01

---

## Default: Buy / Adopt First

- **Buy** = paid SaaS, templates, marketplaces, integrations, no-code/low-code tools, paid support.
- **Adopt** = free templates, community workflows, open-source, “use workflow” / one-click import.
- **Build** = custom code, custom workflows from scratch, in-house-only solutions.

**Default:** Prefer buy/adopt. Use templates, marketplaces, and existing products to get 80% of the way; then adapt the last mile to our schema (city_metrics, building_id, WasatchWise Supabase). Build only when:
- Nothing exists that fits, or
- The thing is a core differentiator (e.g. WasatchVille dashboard metaphor, realm-specific logic), or
- Integration is trivial and building is faster than evaluating another tool.

---

## What “Buy / Adopt” Looks Like Here

| Area | Buy / Adopt | Build only when |
|------|-------------|------------------|
| **n8n** | Templates from n8n.io/workflows, n8nresources.dev, n8ntemplates.me; adopt Stripe/Supabase/TikTok/ConvertKit workflows; adapt last node to city_metrics | Custom logic that no template covers |
| **Integrations** | Supabase, Stripe, Awin, Amazon, TikTok/ConvertKit APIs; use official nodes and docs | We need a one-off RPC or schema the product doesn’t support |
| **Dashboard** | Use existing UI components, Vercel, Supabase Auth; gauge libraries, chart libs | WasatchVille-specific metaphor (city, buildings, agents) |
| **Affiliates** | Awin, Amazon, TikTok already enrolled; use their dashboards and links | Attribution to city_metrics (small adapter layer) |
| **Content / social** | Native TikTok, ConvertKit, etc.; their analytics and tools | Pipeline into city_metrics for “one pane of glass” |
| **Lead routing / CRM** | Webhook + n8n template + existing CRM or Supabase table | Custom routing rules we can’t express in n8n/tools |
| **Payments** | Stripe; use webhooks and standard patterns | Mapping to building_id and city_metrics (already done) |

---

## How to Apply This

1. **Before building:** Search for a template, integration, or product that does most of it. (See [LOCKIN.md §0](../../../infrastructure/n8n/LOCKIN.md) for n8n template sources.)
2. **When adopting:** Import or sign up → configure credentials → adapt the “write” or “target” step to our contract (city_metrics, RPCs, metric_key names).
3. **When building:** Limit to the slice that’s differentiator or impossible to buy (e.g. realm schema, dashboard metaphor, one-off RPC). Don’t rebuild what a template or SaaS already does.

This keeps velocity high and custom code focused where it matters.
