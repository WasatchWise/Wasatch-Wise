# Check Guardians RLS and Production Setup

## Step 1: Verify RLS Policy

Run this in your Supabase SQL Editor:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'guardians';

-- Check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'guardians';
```

**Expected**: You should see RLS enabled and a policy for SELECT that allows public access.

## Step 2: Test Public Access

Try this query as an anonymous user:

```sql
-- This simulates what the website does
SELECT county, display_name, animal_type, archetype
FROM guardians
ORDER BY county
LIMIT 5;
```

If this works, the data and RLS are fine.

## Step 3: Force Production Rebuild

If the database is fine, the issue is likely caching. You need to:

### Option A: Redeploy on Vercel

1. Go to: https://vercel.com/dashboard
2. Find your slctrips-v2 project
3. Go to Deployments
4. Click "Redeploy" on the latest deployment
5. Select "Redeploy" (this will force a fresh build)

### Option B: Push a Small Change

```bash
cd slctrips-v2
git add .
git commit -m "Force redeploy - guardians data added"
git push
```

This will trigger a new Vercel deployment.

## Step 4: Clear Cache

After redeploying, you may need to:
1. Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Clear browser cache
3. Try in an incognito window

## Step 5: Verify Environment Variables

Make sure Vercel has the correct environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`: https://mkepcjzqnbowrgbvjfem.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (your anon key)

## Quick Test

If you want to quickly test if the issue is the website or database:

1. Open browser DevTools (F12)
2. Go to https://www.slctrips.com/guardians
3. Open Console tab
4. Run:
```javascript
fetch('https://mkepcjzqnbowrgbvjfem.supabase.co/rest/v1/guardians?select=county,display_name&limit=5', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZXBjanpxbmJvd3JnYnZqZmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzQzOTAsImV4cCI6MjA2NzM1MDM5MH0.sAaVt7vUxeZ--sjN1qvJzsApW63iKHug0FvzAfwXdgg',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZXBjanpxbmJvd3JnYnZqZmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzQzOTAsImV4cCI6MjA2NzM1MDM5MH0.sAaVt7vUxeZ--sjN1qvJzsApW63iKHug0FvzAfwXdgg'
  }
}).then(r => r.json()).then(console.log)
```

If this returns data, the database is fine and it's a deployment/cache issue.
If this returns an error or empty array, there's an RLS issue.
