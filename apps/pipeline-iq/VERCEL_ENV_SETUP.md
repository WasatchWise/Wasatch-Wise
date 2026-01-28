# Setting Environment Variables in Vercel

## Do You Need CRON_SECRET in Vercel?

**Short answer:** Yes, add it for consistency and security, but Vercel Cron actually authenticates requests automatically, so it's an extra safety layer.

## How to Add It to Vercel

### Option 1: Via Vercel Dashboard (Easiest)

1. **Go to your Vercel project:**
   - Visit https://vercel.com/dashboard
   - Click on your project

2. **Navigate to Settings:**
   - Click "Settings" tab at the top
   - Click "Environment Variables" in the sidebar

3. **Add the variable:**
   - Click "Add New"
   - **Name:** `CRON_SECRET`
   - **Value:** (use the same value as your `.env.local` - e.g., `groove-secret-2025`)
   - **Environment:** Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development (optional)
   - Click "Save"

4. **Redeploy:**
   - After adding, go to "Deployments" tab
   - Click the three dots (⋯) on your latest deployment
   - Click "Redeploy" to apply the new environment variable

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Add the environment variable
vercel env add CRON_SECRET

# It will prompt you for the value
# Then ask which environments (select all)
```

## Important Notes

### Vercel Cron Authentication

**Good news:** Vercel Cron automatically authenticates requests to your cron endpoints, so they're already protected. The `CRON_SECRET` adds an extra layer of security, but it's not strictly required for Vercel Cron to work.

However, if someone gets the URL directly, `CRON_SECRET` prevents them from calling it without the secret.

### Other Environment Variables

You'll also need to add these other environment variables to Vercel:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ORGANIZATION_ID`

**Optional but Recommended:**
- `CRON_SECRET`
- `OPENAI_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `SENDGRID_API_KEY`
- Any other API keys you use

### Best Practice

Copy all environment variables from your `.env.local` to Vercel, but **never commit `.env.local` to git** (it should already be in `.gitignore`).

## Quick Checklist

- [ ] Add `CRON_SECRET` to Vercel environment variables
- [ ] Add all other required environment variables
- [ ] Select all environments (Production, Preview, Development)
- [ ] Redeploy your project after adding variables

---

**TL;DR:** Yes, add `CRON_SECRET` to Vercel's environment variables in Settings → Environment Variables. Use the same value as your `.env.local`. Then redeploy.

