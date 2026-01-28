# TripKit Launch Playbook

**Use this guide to launch new TripKits smoothly and avoid common pitfalls.**

---

## 📋 Pre-Launch Checklist

### 1. Database Setup

#### TripKit Record
```sql
-- Example: Creating a new TripKit
INSERT INTO public.tripkits (
  code,           -- 'TK-001', 'TK-002', etc.
  name,           -- 'Adventure in Arches'
  slug,           -- 'adventure-in-arches' (URL-friendly!)
  description,
  price,
  status,         -- 'freemium' for email gate, 'active' for paid
  category,
  hero_image_url
) VALUES (
  'TK-001',
  'Adventure in Arches',
  'adventure-in-arches',  -- ⚠️ MUST be URL-friendly, not the code!
  'Explore the red rocks...',
  0,                      -- 0 for free, 49.99 for paid
  'freemium',             -- or 'active'
  'nature',
  'https://...'
);
```

**Critical:**
- ✅ `slug` must be URL-friendly (lowercase, hyphens)
- ❌ Don't use the TripKit code as the slug (e.g., 'TK-001')

#### Access Code Functions

Ensure these functions exist and use correct parameter names:

```sql
-- Verify functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%tripkit_access%';

-- Expected functions:
-- 1. generate_tripkit_access_code()
-- 2. validate_tripkit_access_code(p_code TEXT)  ← Note: p_code, not code!
-- 3. record_access_code_usage(p_code TEXT, ip TEXT, ua TEXT)
```

#### RLS Permissions

```sql
-- Grant service_role access (required for email gate!)
GRANT EXECUTE ON FUNCTION public.validate_tripkit_access_code(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_access_code_usage(TEXT, TEXT, TEXT) TO service_role;

-- Verify grants
SELECT routine_name, grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name LIKE '%tripkit_access%';
```

---

## 🚨 Common Gotchas (We Fixed These!)

### 1. **Parameter Name Mismatch**
```typescript
// ❌ WRONG - Will fail with PGRST202
await supabase.rpc('validate_tripkit_access_code', { code: accessCode });

// ✅ CORRECT - Parameter is p_code
await supabase.rpc('validate_tripkit_access_code', { p_code: accessCode });
```

### 2. **Service Role Client Required**
```typescript
// ❌ WRONG - Regular client can't bypass RLS
import { supabase } from '@/lib/supabaseClient';
await supabase.rpc('validate_tripkit_access_code', { p_code: accessCode });

// ✅ CORRECT - Use server client in server components/API routes
import { supabaseServer } from '@/lib/supabaseServer';
await supabaseServer.rpc('validate_tripkit_access_code', { p_code: accessCode });
```

### 3. **Redirect Method**
```typescript
// ❌ WRONG - Can be intercepted by Next.js router
window.location.href = `/tripkits/${slug}/view?access=${code}`;

// ✅ CORRECT - Forces full page reload
window.location.replace(`/tripkits/${slug}/view?access=${code}`);
```

### 4. **Slug in URL**
```typescript
// ❌ WRONG - Using TripKit code
/tripkits/TK-001/view

// ✅ CORRECT - Using slug
/tripkits/adventure-in-arches/view
```

---

## 🔧 Code Patterns

### Email Gate Component
Location: `src/components/TripKitEmailGate.tsx`

**Usage:**
```typescript
// In your TripKit view page
if (requiresAccess && !hasValidAccessCode) {
  return <TripKitEmailGate
    tripkitSlug={tripkit.slug}      // URL slug, not code!
    tripkitName={tripkit.name}
    tripkitCode={tripkit.code}      // Display only
  />;
}
```

### Access Code Validation Pattern
```typescript
// Server Component (page.tsx)
import { supabaseServer } from '@/lib/supabaseServer';

// 1. Check if access code is in URL
const accessCode = searchParams.access;

if (!accessCode) {
  return <TripKitEmailGate {...props} />;
}

// 2. Validate with service role client
const { data: validationResult } = await supabaseServer
  .rpc('validate_tripkit_access_code', { p_code: accessCode });

// 3. Check validation
const isValid = validationResult?.[0]?.is_valid &&
                validationResult?.[0]?.tripkit_id === tripkitId;

if (!isValid) {
  return <TripKitEmailGate {...props} />;
}

// 4. Record usage
await supabaseServer.rpc('record_access_code_usage', { p_code: accessCode });

// 5. Show TripKit content
return <TripKitViewer {...props} />;
```

---

## ✅ Testing Procedure

### 1. Pre-Launch Database Check
```sql
-- Run this query to verify TripKit setup
SELECT
  code,
  name,
  slug,
  status,
  price,
  CASE
    WHEN slug = code THEN '⚠️ Slug matches code - should be URL-friendly!'
    ELSE '✅ Slug looks good'
  END as slug_check
FROM public.tripkits
WHERE code = 'TK-XXX';  -- Your new TripKit code
```

### 2. Test Email Gate Flow
1. Go to: `https://slctrips.com/tripkits/[slug]/view` (no access code)
2. ✅ Should see email gate
3. Submit email address
4. ✅ Should redirect to viewer with `?access=TK-XXXX-XXXX`
5. ✅ Should stay on viewer page (not redirect back to gate)
6. ✅ Should see TripKit content

### 3. Test Access Code Reuse
1. Copy the access code from URL
2. Open in incognito/private window
3. Go to: `https://slctrips.com/tripkits/[slug]/view?access=TK-XXXX-XXXX`
4. ✅ Should go directly to viewer (no email gate)

### 4. Test Invalid Access Code
1. Go to: `https://slctrips.com/tripkits/[slug]/view?access=INVALID-CODE`
2. ✅ Should show email gate (invalid code rejected)

---

## 🚀 Deployment Checklist

### Vercel Setup
- ✅ Single project connected to GitHub (`slctrips-v2`)
- ✅ Domain points to correct project
- ✅ Production branch: `main`
- ✅ Auto-deploy enabled

### Environment Variables (Production)
Required in Vercel → Settings → Environment Variables:

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY  ← CRITICAL for email gate!
✅ STRIPE_SECRET_KEY (if paid TripKit)
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (if paid)
```

**After adding/changing env vars:**
- Trigger a new deployment (push to main or use Vercel "Redeploy")

---

## 📝 Launch Day Steps

1. **Create TripKit in Database**
   ```sql
   -- Run your INSERT statement
   -- Verify with SELECT query
   ```

2. **Verify Database Functions & Permissions**
   ```sql
   -- Check functions exist
   -- Check service_role grants
   ```

3. **Test Locally First**
   ```bash
   npm run dev
   # Test at http://localhost:3000/tripkits/[slug]/view
   ```

4. **Deploy to Production**
   ```bash
   git add -A
   git commit -m "Add TripKit: [Name]"
   git push origin main
   ```

5. **Wait 2 minutes for Vercel deployment**

6. **Run Full Test Suite** (see Testing Procedure above)

7. **Check Vercel Runtime Logs** (if any issues)
   - Go to Vercel → Deployments → Latest → Runtime Logs
   - Look for errors or validation failures

---

## 🐛 Troubleshooting

### Email gate redirects back to itself
**Cause:** One of these issues:
- ❌ RLS permissions not granted to service_role
- ❌ Parameter name mismatch (using `code` instead of `p_code`)
- ❌ Environment variable `SUPABASE_SERVICE_ROLE_KEY` not set in Vercel

**Fix:**
1. Check Vercel Runtime Logs for specific error
2. Run database grant SQL
3. Verify env vars in Vercel
4. Redeploy

### "Function not found" error (PGRST202)
**Cause:** Parameter name doesn't match database function

**Fix:**
```typescript
// Make sure you're using p_code, not code
await supabaseServer.rpc('validate_tripkit_access_code', { p_code: accessCode });
```

### Access code works but doesn't persist
**Cause:** `window.location.href` instead of `replace()`

**Fix:**
```typescript
// In TripKitEmailGate.tsx
window.location.replace(`/tripkits/${slug}/view?access=${code}`);
```

---

## 📊 Post-Launch Monitoring

### Check Access Codes Table
```sql
SELECT
  COUNT(*) as total_codes,
  COUNT(DISTINCT customer_email) as unique_users,
  SUM(access_count) as total_views
FROM public.tripkit_access_codes
WHERE tripkit_id = (
  SELECT id FROM public.tripkits WHERE code = 'TK-XXX'
);
```

### Recent Access Activity
```sql
SELECT
  customer_email,
  access_code,
  activated_at,
  last_accessed_at,
  access_count
FROM public.tripkit_access_codes
WHERE tripkit_id = (SELECT id FROM public.tripkits WHERE code = 'TK-XXX')
ORDER BY activated_at DESC
LIMIT 10;
```

---

## 🎯 Quick Reference

**Database Parameter Names:**
- ✅ `p_code` (not `code`)

**Client Types:**
- API Routes: `supabaseServer`
- Server Components (validation): `supabaseServer`
- Client Components: `supabase`

**Redirect Method:**
- ✅ `window.location.replace()` (not `href`)

**Slug Format:**
- ✅ URL-friendly: `adventure-in-arches`
- ❌ Not the code: `TK-001`

---

## 🔗 Related Files

- **Email Gate Component:** `src/components/TripKitEmailGate.tsx`
- **View Page (validation):** `src/app/tripkits/[slug]/view/page.tsx`
- **API Route (access creation):** `src/app/api/tripkits/request-access/route.ts`
- **Database Functions:** `supabase/migrations/20251026_tripkit_access_codes.sql`
- **Server Client:** `src/lib/supabaseServer.ts`

---

**Last Updated:** October 29, 2025
**Status:** Production-tested with TK-000 (Meet the Mt. Olympians)
