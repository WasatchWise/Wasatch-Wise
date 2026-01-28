# Setting Up Environment Variables in Vercel

## ⚠️ Current Issue
Your app is deployed but Supabase environment variables are missing, causing errors.

## ✅ Solution: Add Environment Variables

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your **DAiTE** project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Supabase Variables

Add these environment variables:

#### Required:
```
NEXT_PUBLIC_SUPABASE_URL
```
**Value:** `https://ovjkwegrubzhcdgtjqvr.supabase.co`
- This is your Supabase project URL
- Format: `https://{project-ref}.supabase.co`

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
**Value:** Your Supabase anon/public key (JWT format, starts with `eyJ...`)
- Get from: Supabase Dashboard → Project Settings → API
- Look for `anon` `public` key
- ⚠️ Should be a JWT token starting with `eyJ...`, not `sb_secret_...`

#### Optional (for AI features):
```
NEXT_PUBLIC_GEMINI_API_KEY
```
**Value:** Your Google Gemini API key
- Get from: https://aistudio.google.com/app/apikey

### Step 3: Select Environments
For each variable, check:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development** (if you use Vercel dev)

### Step 4: Redeploy
After adding variables:
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger auto-deploy

## 🔍 Verify Supabase URL Format

Your Supabase URL should be:
- ✅ **Correct:** `https://ovjkwegrubzhcdgtjqvr.supabase.co`
- ❌ **Wrong:** `sb_publishable_...` (that's an API key, not a URL)
- ❌ **Wrong:** `postgresql://...` (that's a database URL)

## 📝 Quick Reference

Based on your `.env.local` file, you need:

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ovjkwegrubzhcdgtjqvr.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Supabase Dashboard → Settings → API → anon public |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Your Gemini key | Google AI Studio |

## 🚨 Important Notes

1. **Next.js Environment Variables**: Variables that start with `NEXT_PUBLIC_` are exposed to the browser
2. **Never commit secrets**: Keep `.env.local` in `.gitignore` (already done)
3. **After adding variables**: You MUST redeploy for changes to take effect
4. **Variable names are case-sensitive**: Make sure they match exactly

## ✅ After Setup

Once variables are set and redeployed, the error should disappear:
- ✅ No more "Invalid supabaseUrl" errors
- ✅ Supabase client will initialize correctly
- ✅ Database features will work

