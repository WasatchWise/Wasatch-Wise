# ClawdBot Operations Protocol
## WasatchWise LLC - Multi-Machine AI Operations
### February 14, 2026

---

## EXECUTIVE SUMMARY

WasatchWise operates two AI-assisted machines. The Mac is the brain: strategy, content, orchestration, and deployment via Vercel. The PC is the muscle: self-hosted automation, local AI inference, monitoring, and background jobs via Docker/n8n.

They cannot see each other directly. Cloudflare is the bridge.

---

## ARCHITECTURE

```
MAC (Cowork + Claude Desktop + Cursor)
  Role: Strategy, Content, Deployment, Orchestration
  Tools: Cowork, Claude Desktop, Cursor, Vercel CLI, Git
  Runs: Next.js apps (dev), content creation, code changes
  Deploys to: Vercel (production)
  Claude context: CLAUDE.md (workspace root)

PC (ClawdBot - WSL2 + Docker)
  Role: Automation, Monitoring, Local AI, Background Jobs
  Tools: Cursor (when working), Claude Desktop, Docker, n8n
  Runs: Postgres 16, n8n, (planned: Metabase, Ollama, Uptime Kuma, Portainer)
  Accessible via: localhost (now), Tailscale (planned)
  Claude context: CLAWDBOT_PC_CLAUDE.md (see Section 6)

CLOUDFLARE (Shared Brain)
  D1 Database: clawdbot-shared-state (9b2923ff-d4e2-41ed-970e-2f2a088e6508)
  KV Namespace: CLAWDBOT_FLAGS (9a4bf3ed7e104b3094a61ed78b081a53)
  Workers: Available for webhooks, API bridges, cron triggers
  R2: pipelineiq-assets (file storage)
  Existing: best-links worker, LINKS KV, slctrips D1 databases
```

---

## COMMUNICATION PROTOCOL

### The Problem
Both machines have Claude instances but they cannot talk to each other. The Mac's Cowork session cannot SSH into the PC. The PC's Claude cannot see what the Mac is doing. John (you) is the physical bridge between them.

### The Solution: Three-Layer Sync

**Layer 1: Cloudflare D1 (Machine-to-Machine)**
Both n8n instances can read/write to Cloudflare D1 via HTTP API. This is the task queue, status board, and event log.

- `task_queue` table: Mac creates tasks, PC picks them up (and vice versa)
- `machine_status` table: Both machines report their state
- `event_log` table: Audit trail of everything that happened
- `shared_config` table: Shared configuration values

**Layer 2: Git Repository (Code Sync)**
Both machines share the Wasatch-Wise monorepo. Code changes, instruction files, and documentation sync through git push/pull. The PC already has the full repo cloned at `~/projects/Wasatch-Wise`.

- Mac pushes code changes to main (Vercel auto-deploys)
- PC pulls to stay current
- Instruction files (like this one) travel via git

**Layer 3: John (Human Bridge)**
For anything that requires judgment, approval, or physical action (Stripe dashboard, Cal.com setup, reviewing outputs), John carries context between machines.

- Copy/paste status blocks between sessions
- Approve tasks before execution
- Verify outputs on both sides

### How Tasks Flow

```
MAC creates task --> writes to D1 task_queue --> PC n8n polls D1 --> picks up task --> executes --> writes result to D1 --> MAC reads result

PC detects event --> writes to D1 event_log --> MAC n8n polls D1 --> reads event --> takes action or notifies John
```

Until Tailscale is live, n8n on the PC reads D1 via Cloudflare HTTP API:
```
GET https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{db_id}/query
Authorization: Bearer {cf_api_token}
Content-Type: application/json
Body: {"sql": "SELECT * FROM task_queue WHERE target = 'pc' AND status = 'pending' ORDER BY priority, created_at"}
```

---

## SHARED STATE SCHEMA

### D1: clawdbot-shared-state

**Database ID:** `9b2923ff-d4e2-41ed-970e-2f2a088e6508`

#### task_queue
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-increment PK |
| task_id | TEXT UNIQUE | Human-readable ID (e.g., `mac-2026-02-14-001`) |
| source | TEXT | `mac`, `pc`, or `human` |
| target | TEXT | `mac`, `pc`, or `both` |
| priority | TEXT | `P0` (critical), `P1` (high), `P2` (normal), `P3` (low) |
| category | TEXT | `automation`, `deployment`, `content`, `security`, `monitoring`, `data`, `config` |
| title | TEXT | Short description |
| description | TEXT | Full details |
| payload | TEXT | JSON blob with task-specific data |
| status | TEXT | `pending`, `in_progress`, `completed`, `blocked`, `cancelled` |
| blocked_by | TEXT | task_id of blocking task |
| result | TEXT | JSON blob with completion details |
| created_at | TEXT | ISO timestamp |
| started_at | TEXT | When work began |
| completed_at | TEXT | When work finished |

#### machine_status
| Column | Type | Description |
|--------|------|-------------|
| machine | TEXT PK | `mac` or `pc` |
| status | TEXT | `online`, `offline`, `busy`, `error` |
| current_task | TEXT | task_id currently being worked |
| last_heartbeat | TEXT | ISO timestamp of last check-in |
| n8n_status | TEXT | `running`, `stopped`, `error`, `unknown` |
| docker_status | TEXT | Free text status |
| notes | TEXT | Current state notes |

#### event_log
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-increment PK |
| machine | TEXT | Source machine |
| event_type | TEXT | `task_completed`, `error`, `deploy`, `heartbeat`, `alert` |
| category | TEXT | Same categories as task_queue |
| message | TEXT | Human-readable description |
| metadata | TEXT | JSON blob |
| created_at | TEXT | ISO timestamp |

#### shared_config
| Column | Type | Description |
|--------|------|-------------|
| key | TEXT PK | Config key name |
| value | TEXT | Config value |
| description | TEXT | What this config does |
| updated_at | TEXT | Last update timestamp |
| updated_by | TEXT | Who changed it |

### KV: CLAWDBOT_FLAGS

**Namespace ID:** `9a4bf3ed7e104b3094a61ed78b081a53`

Quick-read flags for real-time state. No SQL overhead.

| Key Pattern | Example | Purpose |
|-------------|---------|---------|
| `pc:status` | `online` | PC machine status |
| `mac:status` | `online` | Mac machine status |
| `deploy:latest` | `2026-02-14T22:00:00Z` | Last Vercel deploy timestamp |
| `n8n:pc:status` | `running` | n8n health on PC |
| `task:current:pc` | `mac-2026-02-14-001` | Current task on PC |
| `alert:active` | `none` | Active alert flag |

---

## CLOUDFLARE API ACCESS

Both machines need a Cloudflare API token to read/write D1 and KV.

### Create the Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create Token > Custom Token
3. Permissions:
   - Account > D1 > Edit
   - Account > Workers KV Storage > Edit
4. Account Resources: Include > Admin@wasatchwise.com's Account
5. Name it: `ClawdBot-Shared-State`
6. Save the token securely

### Use in n8n (PC)

Add to the PC's `~/clawdbot/.env`:
```
CF_API_TOKEN=<the token>
CF_ACCOUNT_ID=5a847b8247a4b397d634899d4a81c36f
CF_D1_DATABASE_ID=9b2923ff-d4e2-41ed-970e-2f2a088e6508
CF_KV_NAMESPACE_ID=9a4bf3ed7e104b3094a61ed78b081a53
```

### Use in n8n Workflows

**Read pending tasks (HTTP Request node):**
```
Method: POST
URL: https://api.cloudflare.com/client/v4/accounts/{{$env.CF_ACCOUNT_ID}}/d1/database/{{$env.CF_D1_DATABASE_ID}}/query
Headers:
  Authorization: Bearer {{$env.CF_API_TOKEN}}
  Content-Type: application/json
Body:
{
  "sql": "SELECT * FROM task_queue WHERE target IN ('pc', 'both') AND status = 'pending' ORDER BY priority, created_at LIMIT 10"
}
```

**Update task status:**
```
{
  "sql": "UPDATE task_queue SET status = 'completed', result = ?1, completed_at = datetime('now') WHERE task_id = ?2",
  "params": ["{\"output\": \"done\"}", "mac-2026-02-14-001"]
}
```

**Write heartbeat:**
```
{
  "sql": "UPDATE machine_status SET last_heartbeat = datetime('now'), status = 'online', n8n_status = 'running' WHERE machine = 'pc'"
}
```

---

## PC-SIDE OPERATIONS (CLAWDBOT)

### Current Stack (Operational)
- WSL2 + Ubuntu 22.04 (default distro)
- Docker 29.2 (integrated with WSL2)
- Postgres 16 (127.0.0.1:5432, internal only)
- n8n latest (http://localhost:5678, logged in)
- Git 2.34, Node 22.22, npm 10.9
- Full Wasatch-Wise repo at ~/projects/Wasatch-Wise
- .wslconfig: 8GB RAM, 0 swap, 6 CPUs, no localhost forwarding

### Planned Stack (Phase Blast Off)
- Metabase (analytics dashboards, connects to Postgres and Supabase)
- Ollama (local LLM inference for n8n AI workflows)
- Uptime Kuma (monitoring for all 6 domains + API endpoints)
- Portainer (Docker management UI)
- Tailscale (secure remote access from Mac)

### Security Hardening (from Security Playbook)
- Network segmentation (separate Docker networks per concern)
- Capability drops (no root in containers)
- Read-only filesystems where possible
- Non-root users in all containers
- Secret management via Docker secrets (not env vars in compose)

---

## PHASE BLAST OFF ROADMAP

### Phase 1: Shared Brain (THIS SESSION - DONE)
- [x] Create Cloudflare D1 database (clawdbot-shared-state)
- [x] Create Cloudflare KV namespace (CLAWDBOT_FLAGS)
- [x] Design and create schema (task_queue, machine_status, event_log, shared_config)
- [x] Seed initial config values
- [x] Document communication protocol
- [x] Write PC-side CLAUDE.md

### Phase 2: Task Queue Workflows (PC - Next)
Build 3 n8n workflows on the PC:

1. **Heartbeat** (Schedule: every 5 min)
   - Update `machine_status` with PC health
   - Check Docker container status
   - Write to D1

2. **Task Poller** (Schedule: every 1 min)
   - Read `task_queue` for pending PC tasks
   - Route by category to sub-workflows
   - Update status to `in_progress`
   - On completion, write result back

3. **Event Reporter** (Trigger: on workflow completion)
   - Log completed tasks to `event_log`
   - Update KV flags for real-time reads

### Phase 3: Tailscale (PC + Mac)
1. Install Tailscale on PC (WSL2)
2. Install Tailscale on Mac
3. Join both to same tailnet
4. PC's n8n becomes accessible at `http://clawdbot:5678` from Mac
5. Update `shared_config` with Tailscale hostname

### Phase 4: Expanded Stack (PC)
Add services in this order (each one gets added to docker-compose.yml):

1. **Portainer** (first, so you can manage everything visually)
   - Port: 9443 (HTTPS)
   - Manages all other containers

2. **Uptime Kuma** (second, so monitoring is live before adding more services)
   - Port: 3001
   - Monitor: wasatchwise.com, adultaiacademy.com, pipelineiq.net, slctrips.com, therocksalt.com, askbeforeyouapp.com
   - Monitor: n8n health endpoint, Postgres, each container
   - Alert: Telegram or email on downtime

3. **Metabase** (third, analytics layer)
   - Port: 3000
   - Connect to: local Postgres, Supabase (via connection string)
   - Dashboards: Revenue, Leads, Platform Health, Affiliate Performance

4. **Ollama** (fourth, local AI)
   - Port: 11434
   - Models: llama3.2 (general), codellama (code tasks)
   - n8n integration: AI nodes for email generation, content scoring, lead qualification

### Phase 5: Security Hardening (PC)
Apply the Security Playbook to the full stack:

1. Create Docker networks: `frontend`, `backend`, `monitoring`
2. Move services to appropriate networks
3. Drop capabilities: `--cap-drop=ALL --cap-add=NET_BIND_SERVICE`
4. Read-only containers where possible
5. Non-root user in all containers
6. Docker secrets for all credentials
7. Automated backup to R2 (Cloudflare) via cron

### Phase 6: n8n Automation Build-Out (PC)
Build the actual business workflows. Priority order:

| Priority | Workflow | What It Does |
|----------|----------|-------------|
| P0 | Universal Lead Router | Webhook receives leads from all sites, routes to correct Supabase table, triggers follow-up |
| P0 | Stripe Revenue Tracker | Webhook from Stripe, updates city_metrics by building |
| P1 | Uptime Alert Pipeline | Uptime Kuma webhook to n8n, logs to D1, alerts via email/Telegram |
| P1 | Daily Revenue Digest | Morning email with yesterday's Stripe + affiliate numbers |
| P1 | Quiz Follow-Up Sequence | After AI Readiness Quiz, trigger email sequence based on score band |
| P2 | Content Factory | Utah Conditions Monitor (already built) + UTM link gen + performance reporter |
| P2 | Awin Affiliate Sync | Pull Awin data via API/CSV, update city_metrics |
| P2 | PipelineIQ Auto-Outreach | NEPQ email generation + SendGrid send + follow-up sequences |
| P3 | TikTok Analytics Sync | Pull TikTok stats, update city_metrics (when API access ready) |
| P3 | Metabase Report Scheduler | Auto-generate and email weekly dashboards |

---

## ROLE DEFINITIONS

### Mac (Cowork / Claude Desktop)
**Title:** CTO + Content Engine
- Strategic planning and decision-making
- Code changes to the monorepo (via Cursor)
- Content creation (blog posts, LinkedIn, outreach copy, proposals)
- Vercel deployments (auto-deploy from main)
- Cloudflare management (D1, KV, Workers, R2, DNS)
- Creating tasks for PC via D1 task_queue
- Reviewing PC task results
- Client-facing deliverables

### PC (ClawdBot)
**Title:** COO + Automation Engine
- Self-hosted service management (Docker, n8n, Postgres)
- Background automation (lead routing, email sequences, data sync)
- Monitoring and alerting (Uptime Kuma, health checks)
- Local AI inference (Ollama, when deployed)
- Analytics dashboards (Metabase, when deployed)
- Executing tasks from D1 task_queue
- Reporting results back to D1

### John (Human)
**Title:** CEO + Physical Bridge
- Final approval on all customer-facing actions
- Stripe dashboard operations (product creation, webhook setup)
- Supabase dashboard operations (storage uploads, RLS changes)
- Cal.com / scheduling tool management
- Content filming (Dan / TikTok)
- Physical carry of context between machines when needed
- "Yes/no" on anything that sends money, emails, or public content

---

## IMMEDIATE NEXT ACTIONS

### For PC (Do These Now)

1. **Create Cloudflare API Token** (see Section 4)
2. **Add CF credentials to ~/clawdbot/.env**
3. **Build the Heartbeat workflow in n8n:**
   - Schedule trigger (every 5 min)
   - HTTP Request to D1 API (update machine_status)
   - Verify with: check D1 for updated `last_heartbeat`
4. **Build the Task Poller workflow in n8n:**
   - Schedule trigger (every 1 min)
   - HTTP Request to read pending tasks from D1
   - IF node: route by category
   - HTTP Request to update status back to D1
5. **Pull latest from git** (`cd ~/projects/Wasatch-Wise && git pull`)
6. **Read this file** and CLAWDBOT_PC_CLAUDE.md for full context

### For Mac (This Session)

1. [x] Create D1 and KV infrastructure
2. [x] Write this protocol document
3. [ ] Write CLAWDBOT_PC_CLAUDE.md (the PC's instruction set)
4. [ ] Seed initial tasks into D1 task_queue
5. [ ] Commit and push so PC can pull

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Title | ClawdBot Operations Protocol |
| Version | 1.0 |
| Author | Mac (Cowork CTO Session) |
| Date | February 14, 2026 |
| Classification | Internal - WasatchWise LLC |
| Cloudflare D1 ID | 9b2923ff-d4e2-41ed-970e-2f2a088e6508 |
| Cloudflare KV ID | 9a4bf3ed7e104b3094a61ed78b081a53 |
| Cloudflare Account | 5a847b8247a4b397d634899d4a81c36f |
