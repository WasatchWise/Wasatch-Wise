# CRON_SECRET Setup Guide

## What is CRON_SECRET?

`CRON_SECRET` is a password/token that protects your cron job endpoints from unauthorized access. It's like a lock on your automatic tasks.

## Why Do I Need It?

Your cron jobs (auto-follow-up, auto-archive, update goals) are API endpoints that anyone with the URL could potentially call. The `CRON_SECRET` ensures only authorized services (like Vercel Cron) can trigger them.

## Is It Required?

**For local development:** No, it's optional. If you don't set it, the cron jobs will still work locally.

**For production (Vercel):** Recommended, but Vercel Cron actually handles authentication automatically. However, it's still good security practice to set it.

## How to Set It Up

### Step 1: Generate a Random Secret

You can use any random string. Here are easy ways:

**Option A: Use a password generator**
- Visit: https://www.random.org/strings/
- Generate a 32-character random string

**Option B: Use a command (Mac/Linux)**
```bash
openssl rand -hex 32
```

**Option C: Just make one up**
- Any long random string works, like: `my-secret-cron-key-2025-xyz123`

### Step 2: Add It to Your .env.local File

Open (or create) the `.env.local` file in your project root and add:

```env
CRON_SECRET=your-random-secret-here
```

For example:
```env
CRON_SECRET=a7f3b2c9d4e1f6g8h2i5j3k7l9m4n6p8q2
```

### Step 3: That's It!

The cron endpoints will now check for this secret before running.

## Where Is It Used?

The secret is checked in these files:
- `/app/api/cron/update-goals/route.ts`
- `/app/api/cron/auto-follow-up/route.ts`
- `/app/api/cron/auto-archive/route.ts`

## For Vercel Deployment

When you deploy to Vercel, add it as an environment variable:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - **Name:** `CRON_SECRET`
   - **Value:** `your-random-secret-here`
   - **Environment:** Production (and Preview if you want)

**Note:** Vercel Cron actually handles authentication automatically, but setting `CRON_SECRET` adds an extra layer of security.

## Example .env.local File

Here's what your complete `.env.local` might look like:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://rpephxkyyllvikmdnqem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-key-here

# Organization
ORGANIZATION_ID=34249404-774f-4b80-b346-a2d9e6322584

# Cron Security (optional but recommended)
CRON_SECRET=your-random-secret-here

# Other API keys...
OPENAI_API_KEY=your-key-here
GOOGLE_PLACES_API_KEY=your-key-here
```

## Quick Start (Simplest Approach)

If you just want to get started quickly:

1. Open `.env.local` in your project root
2. Add this line:
   ```env
   CRON_SECRET=groove-cron-secret-2025
   ```
3. Save the file
4. Restart your dev server

That's it! You can change the value to something more secure later.

## Testing

To test that it works, you can call the endpoint manually:

```bash
# Without secret (should fail if CRON_SECRET is set)
curl http://localhost:3000/api/cron/update-goals

# With secret (should work)
curl -H "Authorization: Bearer your-secret-here" http://localhost:3000/api/cron/update-goals
```

---

**TL;DR:** Add `CRON_SECRET=any-random-string` to your `.env.local` file. It's optional but recommended for security.

