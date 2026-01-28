# Fix for Intermittent Destination Detail Page Errors

## The Problem

**File:** `src/app/destinations/[slug]/page.tsx`
**Error:** "Application error: a server-side exception has occurred" (intermittent)

## Root Cause

**Lines 144-161: Database queries have NO error handling**

```typescript
// Line 144-148: NO try-catch
const { data } = await supabase
  .from('public_destinations')
  .select('*')
  .eq('slug', params.slug)
  .maybeSingle();

const d = data as Destination | null;

// Line 154-161: NO try-catch
if (d?.county) {
  const { data: guardianData } = await supabase
    .from('guardians')
    .select('*')
    .eq('county', d.county)
    .maybeSingle();
  guardian = guardianData as Guardian | null;
}
```

**When Supabase has:**
- Network timeout
- Rate limiting
- Connection issues
- Slow queries

**Result:** Unhandled promise rejection → Server crash → Error boundary

**Why it's intermittent:**
- Works when network is fast
- Fails when network is slow/congested
- Vercel serverless functions have 10s timeout by default

---

## The Fix

### Add Try-Catch with Error Handling

**Replace lines 143-161 with:**

```typescript
export default async function DestinationDetail({ params, searchParams }: Params) {
  let d: Destination | null = null;
  let guardian: Guardian | null = null;
  let fetchError = false;

  // Try to fetch destination data with error handling
  try {
    const { data, error } = await supabase
      .from('public_destinations')
      .select('*')
      .eq('slug', params.slug)
      .maybeSingle();

    if (error) {
      console.error('Supabase error fetching destination:', error);
      fetchError = true;
    } else {
      d = data as Destination | null;
    }
  } catch (err) {
    console.error('Exception fetching destination:', err);
    fetchError = true;
  }

  // Try to fetch Guardian for this county
  if (d?.county && !fetchError) {
    try {
      const { data: guardianData, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('county', d.county)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching guardian:', error);
        // Don't set fetchError - guardian is optional
      } else {
        guardian = guardianData as Guardian | null;
      }
    } catch (err) {
      console.error('Exception fetching guardian:', err);
      // Don't crash page if only guardian fails
    }
  }

  // Check if viewing from TK-000
  const isFromTK000 = searchParams.from === 'tk-000';

  // Show error page if fetch failed or destination not found
  if (fetchError || !d) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">
              {fetchError ? 'Unable to Load Destination' : 'Destination Not Found'}
            </h1>
            <p className="text-gray-400 mb-8">
              {fetchError
                ? 'We\'re having trouble connecting to our database. Please try again in a moment.'
                : 'We couldn\'t find that destination.'}
            </p>
            <Link href="/destinations" className="text-blue-400 hover:text-blue-300 underline">
              ← Back to all destinations
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ... rest of component (lines 184+) stays the same
```

---

## Why This Fixes It

### Before:
- ❌ Unhandled promise rejection crashes server
- ❌ Error boundary shows generic error
- ❌ No way to recover or retry
- ❌ User sees blank error page

### After:
- ✅ Errors caught and logged
- ✅ User sees friendly error message
- ✅ Suggests trying again
- ✅ Back button to destinations list
- ✅ Guardian failure doesn't crash page (optional data)

---

## Complete Code to Replace

**File:** `src/app/destinations/[slug]/page.tsx`

**Find lines 143-182 and replace with:**

```typescript
export default async function DestinationDetail({ params, searchParams }: Params) {
  let d: Destination | null = null;
  let guardian: Guardian | null = null;
  let fetchError = false;

  // Fetch destination data with error handling
  try {
    const { data, error } = await supabase
      .from('public_destinations')
      .select('*')
      .eq('slug', params.slug)
      .maybeSingle();

    if (error) {
      console.error('Supabase error fetching destination:', error);
      fetchError = true;
    } else {
      d = data as Destination | null;
    }
  } catch (err) {
    console.error('Exception fetching destination:', err);
    fetchError = true;
  }

  // Fetch Guardian for this county (non-critical, don't fail page if this errors)
  if (d?.county && !fetchError) {
    try {
      const { data: guardianData, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('county', d.county)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching guardian:', error);
      } else {
        guardian = guardianData as Guardian | null;
      }
    } catch (err) {
      console.error('Exception fetching guardian:', err);
    }
  }

  // Check if viewing from TK-000 (free educational context - no affiliate content)
  const isFromTK000 = searchParams.from === 'tk-000';

  // Show error page if fetch failed or destination not found
  if (fetchError || !d) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">
              {fetchError ? 'Unable to Load Destination' : 'Destination Not Found'}
            </h1>
            <p className="text-gray-400 mb-8">
              {fetchError
                ? 'We\'re having trouble connecting to our database. Please try again in a moment.'
                : 'We couldn\'t find that destination.'}
            </p>
            <Link href="/destinations" className="text-blue-400 hover:text-blue-300 underline">
              ← Back to all destinations
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const categoryInfo = getCategoryLabel(d.category);
  const subcategoryIcon = getSubcategoryIcon(d.subcategory);
  const contactInfo = d.contact_info || {};
  const hours = contactInfo.hours || [];
  const phone = contactInfo.phone;
  const website = contactInfo.website;

  return (
    // ... rest of component stays the same (line 191+)
```

---

## How to Apply the Fix

```bash
cd /Users/johnlyman/Desktop/slctrips-v2/slctrips-v2

# Open the file in your editor
# Replace lines 143-182 with the code above

# Or use Edit tool to make the change

# Commit
git add src/app/destinations/[slug]/page.tsx
git commit -m "fix: Add error handling to destination detail queries

- Wrap Supabase queries in try-catch blocks
- Prevent server crashes from network timeouts
- Show friendly error message on fetch failures
- Allow page to render even if guardian fetch fails
- Fixes intermittent 'Application error' on destination pages"

git push origin main
```

**Vercel will auto-deploy in ~30 seconds**

---

## Testing the Fix

### Test 1: Normal Page Load
```
1. Visit any destination: /destinations/some-slug
2. Should load successfully
3. No errors in console
```

### Test 2: Invalid Slug (404)
```
1. Visit: /destinations/this-does-not-exist
2. Should show: "Destination Not Found"
3. Should have back button to /destinations
4. No server crash
```

### Test 3: Simulate Network Error (harder to test)
```
1. Would need to block Supabase connection
2. Should show: "Unable to Load Destination"
3. Should suggest trying again
4. No server crash
```

---

## Success Criteria

✅ **No more intermittent "Application error" messages**
✅ **Friendly error page when destination not found**
✅ **Friendly error page when database has issues**
✅ **Errors logged to Vercel logs for debugging**
✅ **Page still works even if guardian fetch fails**

---

Created: November 3, 2025
Status: Ready to implement
Confidence: Very High (clear missing error handling)
