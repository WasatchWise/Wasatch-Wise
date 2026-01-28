# WasatchWise MCP Configuration

This folder contains the Model Context Protocol (MCP) configuration for all Wasatchville businesses.

## What is MCP?

MCP servers allow AI assistants (like Claude) to interact with external services on your behalf - deploying to Vercel, querying databases, managing DNS, etc.

## Available Servers

| Server | Purpose | Used By |
|--------|---------|---------|
| **memory** | Persistent context across sessions | All apps |
| **supabase** | Hosted MCP — DB/tables (OAuth at first use) | Scoped to project hwxpcekddtfubmnkwutl |
| **stripe** | Payment processing | ABYA, SLC Trips, Rock Salt |
| **vercel** | Deployment management | All apps |
| **cloudflare** | DNS/CDN management | All domains |
| **github** | Official GitHub MCP (repos, issues, PRs, Actions) | Monorepo — requires Docker |
| **slack** | Team notifications | All apps |
| **notion** | Documentation | Corporate docs |
| **sentry** | Error monitoring | All production apps |
| **elevenlabs** | Official ElevenLabs MCP (TTS, voice clone, transcription) | WiseBot, Dashboard — requires uv |
| **heygen** | HeyGen MCP (AI video/avatar) | Dashboard — requires uv |
| **google-maps** | Location services | SLC Trips, ABYA |
| **fetch** | Web content fetching | Research, scraping |
| **puppeteer** | Browser automation | Testing, screenshots |
| **filesystem** | File access | Monorepo only |

## Prerequisites

- **GitHub MCP**: Requires [Docker](https://docs.docker.com/get-docker/) (uses [GitHub's official MCP server](https://github.com/github/github-mcp-server)). If Docker isn't installed, the GitHub server will fail to start; other servers will still work.
- **Supabase MCP**: Uses [Supabase hosted MCP](https://supabase.com/docs/guides/getting-started/mcp). On first use, Cursor will prompt you to sign in to Supabase and grant org access; no env vars needed.
- **ElevenLabs MCP**: Uses [official elevenlabs-mcp](https://github.com/elevenlabs/elevenlabs-mcp). Requires [uv](https://github.com/astral-sh/uv) (run `curl -LsSf https://astral.sh/uv/install.sh | sh`). Set `ELEVENLABS_API_KEY` in `/.env.mcp`. If you get "spawn uvx ENOENT", use the full path to uvx (e.g. `"command": "/usr/local/bin/uvx"`).

## Setup Instructions

### 1. Configure Credentials

Edit `/.env.mcp` at the repository root with your API keys:

```bash
# From repository root
cp .env.mcp.example .env.mcp
# Edit with your credentials
```

### 2. Reload Cursor

After editing `mcp.json` or `.env.mcp`:
- **Mac**: `Cmd + Shift + P` → "Developer: Reload Window"
- **Windows**: `Ctrl + Shift + P` → "Developer: Reload Window"

### 3. Verify Servers

In Cursor's MCP panel, you should see all servers listed. Green = connected.

## App-to-Supabase Mapping

| App | Supabase Project | Project Ref |
|-----|-----------------|-------------|
| Dashboard | wasatchwise | hwxpcekddtfubmnkwutl |
| Ask Before You App | askbeforeyouapp | rmlqgwkkpmelmxxuykne |
| SLC Trips | slctrips | mkepcjzqnbowrgbvjfem |
| The Rings | TheRings | (check dashboard) |
| Rock Salt | therocksalt | (check dashboard) |
| DAiTE | DAiTE | (check dashboard) |

## Security Notes

1. **Never commit `.env.mcp`** - It's in `.gitignore`
2. **Use least-privilege tokens** - Only grant necessary scopes
3. **Rotate keys regularly** - Especially after team changes
4. **Audit MCP usage** - Check logs for unexpected activity

## Troubleshooting

### Server won't connect
1. Check credentials in `.env.mcp`
2. Verify token hasn't expired
3. Reload Cursor window
4. Check Cursor's Output panel for MCP errors

### "Rate limited" errors
Some APIs have rate limits. Wait and retry, or upgrade your plan.

### "Permission denied"
Token may lack required scopes. Generate new token with correct permissions.

## Adding New Servers

1. Edit `mcp.json`
2. Add credentials to `.env.mcp`
3. Reload Cursor
4. Document in this README

---

*Part of the Wasatchville Corporate Infrastructure*
