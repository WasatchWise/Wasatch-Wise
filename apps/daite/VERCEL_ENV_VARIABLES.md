# Vercel Environment Variables Setup

## 🔍 Important: Key Verification

Your `NEXT_PUBLIC_SUPABASE_ANON_KEY` doesn't look like a standard Supabase anon key. Supabase anon keys are JWT tokens that start with `eyJ...`.

## ✅ Correct Supabase Anon Key Format

A Supabase anon key should look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI0MDAsImV4cCI6MTk2MDc2ODQwMH0.xxxxx
```

## 📝 Steps to Get the Correct Keys

### 1. Go to Supabase Dashboard
1. Visit https://app.supabase.com
2. Select your project: `ovjkwegrubzhcdgtjqvr`
3. Go to **Settings** → **API**

### 2. Find Your Keys

You should see:
- **Project URL**: `https://ovjkwegrubzhcdgtjqvr.supabase.co` ✅
- **anon public** key: Should start with `eyJ...` (JWT format)
- **service_role** key: Should start with `eyJ...` (JWT format)

## 🔐 Environment Variables to Add in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required for Frontend (Client-Side)

| Variable Name | Value | Where to Find |
|---------------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ovjkwegrubzhcdgtjqvr.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (JWT token) | Supabase Dashboard → Settings → API → **anon** `public` key |

### Optional (For Server-Side Features Later)

| Variable Name | Value | Note |
|---------------|-------|------|
| `DATABASE_URL` | `postgresql://postgres:...` | Only needed for server-side DB access |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (JWT token) | Only for server-side, NEVER expose to client |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Your Gemini key | For AI features |

## ⚠️ Important Notes

1. **NEXT_PUBLIC_ prefix**: Variables with this prefix are exposed to the browser
2. **Never expose service_role key**: Don't use `NEXT_PUBLIC_` prefix for service_role
3. **Anon key format**: Should be a JWT token starting with `eyJ...`
4. **Select environments**: Check Production, Preview, and Development

## 🚀 After Adding Variables

1. **Save** the variables
2. **Redeploy** your latest deployment
3. Check the browser console - errors should be gone!

## 🔍 Verify in Supabase Dashboard

Your Supabase Dashboard → Settings → API should show:

```
Project URL: https://ovjkwegrubzhcdgtjqvr.supabase.co

API Keys:
┌─────────────────────────────────────────────────────────┐
│ anon        public                                      │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                │
│                                                         │
│ service_role secret                                     │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                │
└─────────────────────────────────────────────────────────┘
```

Use the **anon public** key (starts with `eyJ...`) for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

