# Fix Supabase Email Redirect URL

## Problem
Email confirmation links are redirecting to `localhost:3000` instead of your production domain.

## Solution

### 1. Update Supabase Dashboard Settings

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Site URL**, set: `https://www.daiteapp.com` (or your production domain)
4. Under **Redirect URLs**, add:
   - `https://www.daiteapp.com/auth/callback`
   - `https://www.daiteapp.com/**` (wildcard for all paths)
   - `http://localhost:3000/auth/callback` (for local development)

### 2. Update Environment Variables

Make sure `NEXT_PUBLIC_SITE_URL` is set in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   - **Key**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://www.daiteapp.com`
   - **Environment**: Production, Preview, Development

### 3. Code Changes (Already Done)

✅ Auth component now includes `emailRedirectTo` parameter  
✅ Auth callback page created at `/auth/callback`  
✅ Uses `NEXT_PUBLIC_SITE_URL` or falls back to production domain

### 4. Verify

After updating Supabase settings:
1. Try signing up with a new email
2. Check the confirmation email
3. The link should point to: `https://www.daiteapp.com/auth/callback?token=...`
4. Clicking it should redirect to `/dashboard`

## Important Notes

- **Site URL** in Supabase must match your production domain
- **Redirect URLs** must include the exact callback path
- Changes may take a few minutes to propagate
- New signups will use the updated redirect URL immediately

