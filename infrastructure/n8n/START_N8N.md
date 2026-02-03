# Start n8n - Quick Reference

**Created:** February 2, 2026  
**Purpose:** Quick commands to start/stop your local n8n instance

---

## 🚀 Starting n8n

### Prerequisites
1. **Docker Desktop must be running** - Check your menu bar for the Docker whale icon
2. **Environment configured** - `.env` file exists (✓ already set up)

### Start Command

```bash
# From anywhere in the wasatchwise repo:
cd infrastructure/n8n
docker compose up -d
```

**What this does:**
- Starts PostgreSQL database (for n8n's workflow storage)
- Starts n8n on **http://localhost:5678**
- Runs in detached mode (`-d`) so it runs in background

### Access n8n

Once started, open: **http://localhost:5678**

First time setup:
1. Create your admin account (email + password)
2. Skip the "community nodes" prompt (can add later)
3. You're in!

---

## 📊 Checking Status

```bash
# Check if n8n is running
docker ps | grep n8n

# Should show two containers:
# - n8n-n8n-1 (the n8n app)
# - n8n-postgres-1 (the database)
```

**Healthy output:**
```
CONTAINER ID   IMAGE                           STATUS         PORTS
abc123         docker.n8n.io/n8nio/n8n:latest  Up 2 minutes   0.0.0.0:5678->5678/tcp
def456         postgres:16-alpine              Up 2 minutes   5432/tcp
```

---

## 🛑 Stopping n8n

```bash
# Stop n8n (keeps data)
cd infrastructure/n8n
docker compose down

# Stop n8n AND delete data (⚠️ USE WITH CAUTION)
docker compose down -v
# This removes all workflows and credentials!
# But you can restore from workflows/*.json files
```

---

## 🔄 Restarting n8n

```bash
# Restart (useful after .env changes)
cd infrastructure/n8n
docker compose restart

# Or full stop + start
docker compose down && docker compose up -d
```

---

## 📋 View Logs (Troubleshooting)

```bash
# View n8n logs
docker compose logs -f n8n

# View PostgreSQL logs
docker compose logs -f postgres

# View all logs
docker compose logs -f
```

Press `Ctrl+C` to exit log view.

---

## 🔌 Connecting to Supabase

Once n8n is running, you'll need to add Supabase credentials for workflows:

### Option 1: Via n8n UI (Recommended)
1. Go to **http://localhost:5678**
2. Click **Settings** (gear icon) → **Credentials**
3. Click **Add Credential** → Search "Supabase"
4. Add:
   - **Name:** WasatchWise Dashboard
   - **Host:** Your Supabase project URL (from dashboard app)
   - **Service Role Key:** Your service_role secret key

### Option 2: Via .env (Already configured)
Your `.env` file should have:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

Workflows can reference these using `$env.SUPABASE_URL` in HTTP nodes.

---

## 🎯 Testing Setup

### Import Test Workflow

1. In n8n: **Workflows** → **Import from File**
2. Choose: `workflows/test-city-metrics-insert.json`
3. Click the workflow name → **Execute Workflow**
4. Check your dashboard - should see `test_workflow_insert` metric

### Verify Dashboard Connection

```bash
# From wasatchwise repo root:
cd apps/dashboard
pnpm run dev

# Open http://localhost:3000/dashboard/command-center
# You should see metrics updating
```

---

## 📦 Existing Workflows

Your n8n has these pre-built workflows ready to import:

| Workflow | File | Purpose |
|----------|------|---------|
| **Test Insert** | `test-city-metrics-insert.json` | Test Supabase connection |
| **Stripe Revenue** | `stripe-revenue-webhook.json` | Stripe payments → daily_revenue |
| **Amazon Commission** | `amazon-commission-to-city-metrics.json` | Amazon affiliate → slctrips_amazon_revenue |
| **TikTok Views** | `tiktok-views-sync.json` | TikTok metrics → slctrips_tiktok_views |

**To use:**
1. Import the JSON file in n8n
2. Configure credentials (Stripe, Supabase, etc.)
3. Activate the workflow
4. Test manually or via webhook

---

## 🌐 Production Setup (Future)

For production webhooks (Stripe can't reach localhost):

### Option A: Deploy n8n
- **Railway**, **Render**, **Cloud Run**, or **n8n Cloud**
- Set `N8N_HOST` and `N8N_PROTOCOL=https`
- Point Stripe webhooks to `https://your-n8n.com/webhook/stripe`

### Option B: Local Tunnel (Testing Only)
```bash
# Using ngrok
ngrok http 5678

# Use the ngrok URL in Stripe webhooks
```

---

## 💾 Backup & Recovery

### Export Workflows (Before Breaking Changes)

```bash
# In n8n UI for each workflow:
# ⋯ menu → Download → Save to workflows/

# Example naming:
workflows/
  ├── stripe-revenue-webhook.json
  ├── tiktok-views-sync.json
  └── amazon-commission-to-city-metrics.json
```

### Restore from Backup

```bash
# If you nuke Docker volumes:
docker compose down -v

# Start fresh:
docker compose up -d

# Re-import each workflow:
# n8n UI → Import from File → workflows/*.json
```

---

## 🐳 Docker Commands Reference

```bash
# System status
docker ps                    # Running containers
docker ps -a                # All containers
docker images               # Downloaded images
docker system df            # Disk usage

# Cleanup (if disk space is low)
docker system prune -a      # Remove unused images/containers
docker volume prune         # Remove unused volumes (⚠️ deletes data!)

# Our volumes
docker volume ls | grep n8n
# n8n_postgres_data  (database)
# n8n_data           (n8n config/workflows)
```

---

## ❓ Troubleshooting

### "Port 5678 is already in use"
```bash
# Find what's using port 5678
lsof -i :5678

# Stop the conflicting process or change n8n port in docker-compose.yml:
# ports:
#   - "5679:5678"  # Changed to 5679
```

### "Cannot connect to Supabase"
1. Check `.env` has correct `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Test Supabase connection from terminal:
```bash
curl -X POST \
  "YOUR_SUPABASE_URL/rest/v1/rpc/increment_daily_revenue" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount_cents": 1000, "payment_date": "2026-02-02"}'
```

### "Workflow executes but nothing happens"
1. Check n8n logs: `docker compose logs -f n8n`
2. Check workflow execution history in n8n UI
3. Verify credentials are connected to the workflow nodes

### "Database connection failed"
```bash
# Restart PostgreSQL
docker compose restart postgres

# Wait 30 seconds, then restart n8n
docker compose restart n8n
```

---

## 📚 Related Documentation

- [n8n README](./README.md) - Architecture and patterns
- [Workflow Export Guide](./workflows/README.md) - Version control
- [N8N_SUPPORTED.md](./N8N_SUPPORTED.md) - What triggers/integrations work
- [LOCKIN.md](./LOCKIN.md) - Lock-in verification steps

---

## 🎬 Quick Start Summary

```bash
# 1. Start Docker Desktop (check menu bar for whale icon)

# 2. Start n8n
cd /Users/johnlyman/Desktop/wasatchwise/infrastructure/n8n
docker compose up -d

# 3. Open n8n
open http://localhost:5678

# 4. Import test workflow
# In n8n UI: Workflows → Import from File → workflows/test-city-metrics-insert.json

# 5. Add Supabase credential
# Settings → Credentials → Add Credential → Supabase

# 6. Test the workflow
# Click "Execute Workflow" button

# 7. Check dashboard
cd /Users/johnlyman/Desktop/wasatchwise/apps/dashboard
pnpm run dev
open http://localhost:3000/dashboard/command-center
```

---

*Last updated: February 2, 2026*  
*For questions or issues, check Docker logs: `docker compose logs -f`*
