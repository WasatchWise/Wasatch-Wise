# ✅ Vercel Environment Variables - Final Setup

## Add These Two Variables to Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### 1. Supabase URL
```
Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://YOUR_PROJECT_REF.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```
> Get this from: Supabase Dashboard → Settings → API → Project URL

### 2. Supabase Anon Key (JWT Format)
```
Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
Environments: ✅ Production ✅ Preview ✅ Development
```
> Get this from: Supabase Dashboard → Settings → API → anon public key

## Steps

1. ✅ Add both variables (copy values exactly as shown above)
2. ✅ Check all three environments for each variable
3. ✅ Click **Save**
4. ✅ Go to **Deployments** tab
5. ✅ Click **...** on the latest deployment
6. ✅ Click **Redeploy**

## ✅ Verification

After redeploy, check:
- ✅ No "Invalid supabaseUrl" errors in browser console
- ✅ Supabase client initializes successfully
- ✅ App loads without Supabase connection errors

Your app should now work perfectly! 🚀

