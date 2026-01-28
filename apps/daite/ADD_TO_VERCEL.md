# Add These Environment Variables to Vercel

## Quick Setup Steps

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your **DAiTE** project
   - Navigate to: **Settings** → **Environment Variables**

2. **Add Variable 1: Supabase URL**
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://YOUR_PROJECT_REF.supabase.co
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```
   > Get this from: Supabase Dashboard → Settings → API → Project URL

3. **Add Variable 2: Supabase Anon Key**
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```
   > Get this from: Supabase Dashboard → Settings → API → anon public key

4. **Save and Redeploy**
   - Click **Save** for each variable
   - Go to **Deployments** tab
   - Click **...** on latest deployment → **Redeploy**

## ✅ Verification

After redeploying, check:
- ✅ No more "Invalid supabaseUrl" errors in browser console
- ✅ App loads without Supabase errors
- ✅ Supabase client initializes correctly

## 🔍 If This Key Doesn't Work

If you still get errors, verify in Supabase Dashboard:
1. Go to: https://app.supabase.com
2. Project: `ovjkwegrubzhcdgtjqvr`
3. Settings → API
4. Copy the **anon public** key exactly as shown
5. Update the variable in Vercel

