# Business Realms & WasatchVille

**Audience:** Builders and future clients  
**Purpose:** Clarify how WasatchVille relates to the future product “Business Realms” and how we learn from it.

---

## WasatchVille = Your Interface + Reference Implementation

**WasatchVille** is:

1. **Your operating interface** – The place where you (John) conduct business through agentic work: buildings as ventures, departments, AI agents, and councils. You use it daily to see health, prioritize, and act.
2. **The first realm** – One “city” (one client/portfolio) in the Business REALMS system.
3. **The reference implementation** – Every pattern we build here (data model, agent chat, councils, n8n workflows, building ↔ venture mapping) is designed to be **reusable**. WasatchVille is the blueprint we will duplicate and adapt for future clients under the **Business Realms** product.

So we are **simultaneously**:

- Making WasatchVille great for you.
- Documenting and structuring it so that “Business Realms” can be a repeatable product (realms = client deployments with their own buildings, agents, and data).

---

## How You Run Business Through It

- **Dashboard (command center)** – City view, building inspector, building interior, agent chat, council room.
- **Agents** – Department-head personas that have access to **city_metrics** and conversation history; you talk to them for summaries, prioritization, and recommendations.
- **Councils** – Multi-agent meetings (e.g. Executive Council, Content Council) for cross-venture decisions.
- **n8n** – Automation that feeds the city (Stripe, TikTok, etc. → city_metrics) and runs task-based and human-in-the-loop workflows. The interface stays the single place you look; n8n keeps the data and tasks flowing.

The goal is **one interface** for all your business tasks, with agentic departments and automation doing the heavy lifting behind the scenes.

---

## What We’re Learning for Business Realms

As we build and refine WasatchVille, we capture:

- **Realm structure** – REALM_SPEC, BUILDING_REGISTRY, AGENT_ROSTER, INTEGRATION_LOG (see `realms/wasatchville/docs/`).
- **Data contract** – `city_metrics` and building IDs; how agents and councils consume this data.
- **Automation patterns** – Which n8n workflows map to which buildings and metrics; how to template them for another realm (e.g. different building_ids, same “Stripe → city_metrics” pattern).
- **Agentic UX** – Single-agent vs council; when to use which; how personality and data_scope are configured.

This documentation lives in **civilization/** (city-hall administration, realms, templates) so that spinning up a new “realm” for a future client is a matter of configuration and replication, not a rewrite.

---

## Summary

| Concept | Meaning |
|--------|---------|
| **WasatchVille** | Your city: your interface + the first Business REALMS realm. |
| **Business Realms** | Future product: one “realm” per client, each with their own buildings, agents, and data, built from the same patterns as WasatchVille. |
| **n8n** | Agentic backbone: pipelines and tasks that feed the realm (e.g. city_metrics) and extend what the interface can do. |
| **Civilization repo** | Where we document realms, templates, and build system so WasatchVille stays great and Business Realms stays replicable. |

We build WasatchVille to be excellent for you; we structure and document it so that excellence can be duplicated as Business Realms.
