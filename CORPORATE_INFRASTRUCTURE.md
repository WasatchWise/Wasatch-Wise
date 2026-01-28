# Wasatchville Corporate Infrastructure

## Architecture Overview

```
wasatchwise/                    (Monorepo Root)
├── .cursor/
│   ├── mcp.json               # MCP server configuration (all businesses)
│   └── README.md              # MCP documentation
├── .env.mcp                   # Centralized MCP credentials (gitignored)
├── apps/
│   ├── ask-before-you-app/    # SDPC Partner - Free Ed-Tech Training
│   ├── dashboard/             # WasatchWise Command Center
│   ├── slctrips/              # SLC Trips - Travel Planning
│   ├── rock-salt/             # Rock Salt - Music Venue
│   ├── the-rings/             # The Rings - Personal Finance
│   ├── daite/                 # DAiTE - AI Dating App
│   ├── adult-ai-academy/      # Adult AI Academy Hub
│   ├── pipeline-iq/           # Pipeline IQ - Sales Tool
│   ├── gmc-mag/               # GMC Magazine
│   ├── munchyslots/           # Munchy Slots Game
│   └── dublin-drive-live/     # Dublin Drive Live
└── civilization/              # Project documentation
```

## Service Matrix

### Cloud Infrastructure

| Service | Purpose | Apps Using |
|---------|---------|------------|
| **Vercel** | Hosting & Deployment | All Next.js apps |
| **Supabase** | Database & Auth | All apps with user data |
| **Cloudflare** | DNS & CDN | All domains |
| **GitHub** | Source Control | Monorepo |

### Payment Processing

| Provider | Apps |
|----------|------|
| **Stripe** | SLC Trips, Rock Salt, Pipeline IQ |
| *(Free)* | Ask Before You App |

### AI Services

| Service | Purpose | Apps |
|---------|---------|------|
| **Anthropic Claude** | Chat, Analysis | Dashboard, ABYA WiseBot |
| **ElevenLabs** | Voice Synthesis | Dashboard, WiseBot |
| **HeyGen** | Video Generation | Dashboard (John avatar) |
| **Google AI** | Various | Munchyslots, GMC Mag |

### Communication

| Service | Purpose |
|---------|---------|
| **Resend** | Transactional Email |
| **Slack** | Team Notifications |
| **Notion** | Documentation |

### Monitoring

| Service | Purpose |
|---------|---------|
| **Sentry** | Error Tracking |
| **Vercel Analytics** | Traffic Analytics |

## Supabase Projects

| Project Name | App | Region | Project Ref |
|-------------|-----|--------|-------------|
| wasatchwise | Dashboard | us-east-1 | hwxpcekddtfubmnkwutl |
| askbeforeyouapp | ABYA | us-east-1 | rmlqgwkkpmelmxxuykne |
| slctrips | SLC Trips | us-east-1 | mkepcjzqnbowrgbvjfem |
| TheRings | The Rings | us-east-1 | (verify) |
| therocksalt | Rock Salt | us-east-2 | (verify) |
| DAiTE | DAiTE | us-east-2 | (verify) |
| PipelineIQ | Pipeline IQ | us-east-2 | (verify) |

## Vercel Projects

Each app deploys independently from the monorepo:

| Vercel Project | Git Path | Domain |
|---------------|----------|--------|
| ask-before-you-app | apps/ask-before-you-app | askbeforeyouapp.com |
| slctrips | apps/slctrips | slctrips.com |
| rock-salt | apps/rock-salt | therocksalt.com |
| the-rings | apps/the-rings/TheRings/app | therings.app |
| dashboard | apps/dashboard | dashboard.wasatchwise.com |

**Vercel Configuration:**
- Connect to `WasatchWise/Wasatch-Wise` repo
- Set "Root Directory" to the app's folder (e.g., `apps/ask-before-you-app`)
- Framework: Next.js (auto-detected)

## Domain Registry

| Domain | Registrar | Points To |
|--------|-----------|-----------|
| wasatchwise.com | Cloudflare | Vercel (dashboard) |
| askbeforeyouapp.com | Cloudflare | Vercel (abya) |
| slctrips.com | Cloudflare | Vercel |
| therocksalt.com | Cloudflare | Vercel |
| therings.app | Cloudflare | Vercel |

## Environment Variables

### Per-App Pattern

Each app has its own `.env.local`:

```
apps/[app-name]/.env.local
```

### Required Variables (All Apps)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site
NEXT_PUBLIC_SITE_URL=
```

### App-Specific Variables

**Ask Before You App:**
```bash
ANTHROPIC_API_KEY=     # WiseBot
RESEND_API_KEY=        # Email
```

**SLC Trips:**
```bash
STRIPE_SECRET_KEY=     # Payments
GOOGLE_PLACES_API_KEY= # Location
```

**Dashboard:**
```bash
ANTHROPIC_API_KEY=     # Analysis
ELEVENLABS_API_KEY=    # Voice
HEYGEN_API_KEY=        # Video
STRIPE_SECRET_KEY=     # Payments
```

## MCP Server Access

AI assistants in Cursor can access these services via MCP:

1. **Deployment**: Deploy to Vercel, manage DNS
2. **Database**: Query Supabase directly
3. **Payments**: Check Stripe transactions
4. **Code**: Search/edit files in monorepo
5. **Research**: Fetch web content
6. **Testing**: Run browser automation

Configuration: `/.cursor/mcp.json`
Credentials: `/.env.mcp`

## Security Checklist

- [ ] All `.env*` files in `.gitignore`
- [ ] Supabase RLS enabled on all tables
- [ ] API routes protected with auth
- [ ] Stripe webhooks use signature verification
- [ ] CORS configured correctly
- [ ] Rate limiting on public endpoints
- [ ] Error messages don't leak secrets

## Deployment Checklist

When deploying a new app:

1. [ ] Create Supabase project
2. [ ] Run database migrations
3. [ ] Create Vercel project (connect to monorepo, set root directory)
4. [ ] Add environment variables to Vercel
5. [ ] Configure Cloudflare DNS
6. [ ] Update this document
7. [ ] Add MCP credentials if needed

---

*Last Updated: January 28, 2026*
