# Production Fixes - October 28, 2025

## Issues Identified from Console Errors

### 1. ✅ Missing Image: area-51-perimeter.jpg (404 Error)

**Problem:**
- The `area-51-perimeter` destination had an invalid relative image path: `./assets/destinations/area-51-perimeter.jpg`
- This file didn't exist in the public directory, causing 404 errors

**Solution:**
- Updated the database record to use an Unsplash image URL instead
- Script: `scripts/fix-area-51-perimeter-image.js`
- New URL: https://images.unsplash.com/photo-1589126330527-5d8a0425b61c

**Status:** ✅ FIXED

---

### 2. ✅ HeyGen API Error: /api/heygen/dan-intro (500 Error) - READY TO DEPLOY

**Problem:**
- API route `/api/heygen/dan-intro?lang=en` returns 500 Internal Server Error
- Error message: `ElevenLabs API error: 401 {"detail":{"status":"invalid_api_key","message":"Invalid API key"}}`

**Root Cause:**
The ElevenLabs API key in Vercel was **INVALID or EXPIRED**. The environment variable existed but the key itself was being rejected by ElevenLabs with a 401 Unauthorized error.

**Solution:**

#### ✅ New API Key Obtained and Verified

A new ElevenLabs API key has been obtained and tested successfully:

```
New Key: sk_bf8e5f5e4c6e7c2f90d3ffcacb6e7624f4c4827cd90712ca
Status: ✅ VERIFIED (generated 30,138 bytes of test audio)
Account: Wasatch wise (Creator tier - 252k characters remaining)
```

#### Step 1: Update Vercel Environment Variable

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `slctrips-v2`
3. Go to **Settings** → **Environment Variables**
4. Find `ELEVENLABS_API_KEY` and click **Edit**
5. Replace with the new key: `sk_bf8e5f5e4c6e7c2f90d3ffcacb6e7624f4c4827cd90712ca`
6. Enable for all environments (Production, Preview, Development)
7. Click **Save**

#### Step 2: Redeploy

After updating the environment variable, trigger a redeploy:

**Option A: Redeploy from Dashboard (Recommended)**
- Go to Deployments → Latest deployment → Three dots (⋮) → Redeploy

**Option B: Push a new commit**
```bash
git commit --allow-empty -m "chore: trigger redeploy for updated API key"
git push origin main
```

#### Step 3: Verify the Fix

After deployment completes (1-2 minutes), test the API:

```bash
curl https://www.slctrips.com/api/heygen/dan-intro?lang=en
```

Expected response (may take 30-60 seconds on first request):
```json
{
  "success": true,
  "language": "en",
  "video_url": "https://...",
  "cached": false,
  "script": "I didn't get the mascot job..."
}
```

**Status:** ✅ READY TO DEPLOY (see `VERCEL_UPDATE_INSTRUCTIONS.md` for detailed steps)

---

### 3. ℹ️ Dan Video Loading Error

**Problem:**
- Console error: "Error loading Dan video: Error: Failed to load Dan's video"
- This is a downstream effect of issue #2 (API 500 error)

**Solution:**
- Once the HeyGen API environment variables are configured (issue #2), this error will resolve automatically
- The frontend is working correctly; it's just reporting the API failure

**Status:** ℹ️ WILL BE FIXED when issue #2 is resolved

---

## Database Changes Applied

### Migration: `20251028_create_dan_videos_table.sql`

Created a new table to cache Dan's multilingual introduction videos:

```sql
CREATE TABLE dan_videos (
  id UUID PRIMARY KEY,
  language_code TEXT UNIQUE NOT NULL,
  video_url TEXT NOT NULL,
  script TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Status:** ✅ APPLIED (table verified empty, ready for video caching)

---

## Summary

| Issue | Status | Action Required |
|-------|--------|-----------------|
| area-51-perimeter.jpg 404 | ✅ Fixed | None - already applied to database |
| /api/heygen/dan-intro 500 | ✅ Ready | **Update Vercel with new API key** (see VERCEL_UPDATE_INSTRUCTIONS.md) |
| Dan video loading error | ℹ️ Dependent | Will auto-fix after Vercel deployment |
| dan_videos table missing | ✅ Fixed | None - migration applied |

---

## Next Steps

1. ✅ **Get a new ElevenLabs API key** - COMPLETED (key obtained and verified)
2. ⏳ **Update ELEVENLABS_API_KEY in Vercel** - **ACTION REQUIRED** (see `VERCEL_UPDATE_INSTRUCTIONS.md`)
3. ⏳ **Redeploy the application** - Required after updating env var
4. ⏳ **Test the Dan video feature** on production: `curl https://www.slctrips.com/api/heygen/dan-intro?lang=en`
5. ⏳ **Monitor for any new errors** in browser console

📋 **See detailed instructions in:** `VERCEL_UPDATE_INSTRUCTIONS.md`

---

## Files Created/Modified

### Scripts Created:
- `scripts/apply-dan-videos-migration.js` - Applies dan_videos table migration
- `scripts/find-area-51-references.js` - Finds image references in database
- `scripts/check-destinations-schema.js` - Inspects destinations table structure
- `scripts/fix-area-51-perimeter-image.js` - Updates area-51-perimeter image URL

### Migrations Created:
- `supabase/migrations/20251028_create_dan_videos_table.sql` - Creates video cache table

### Database Updates:
- `destinations` table: Updated `area-51-perimeter` image_url to valid Unsplash URL

---

## API Keys Status

### Updated Keys in `.env.local`:

```bash
HEYGEN_API_KEY=sk_bec8d88c60fd0dcde424cdd3a1d956332e712c32d4f85f7c  # ❌ INVALID - needs replacement
ELEVENLABS_API_KEY=sk_bf8e5f5e4c6e7c2f90d3ffcacb6e7624f4c4827cd90712ca  # ✅ NEW - Verified working
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # ✅ Valid
```

### Status:
- ✅ **ELEVENLABS_API_KEY** - New key obtained and verified locally (generated 30KB test audio)
- ❌ **HEYGEN_API_KEY** - INVALID (needs new key from https://app.heygen.com/settings/api)
- ✅ **SUPABASE_SERVICE_ROLE_KEY** - Valid (no changes needed)

### Next Action:
🔄 **Update Vercel with new ELEVENLABS_API_KEY and redeploy**

⚠️ **Security Note:** Keep API keys secure and only add them to trusted environments (Vercel production/preview).

---

## Verification Checklist

After deploying the fixes:

- [ ] area-51-perimeter.jpg no longer shows 404 errors
- [ ] /api/heygen/dan-intro returns 200 OK (may be slow on first request)
- [ ] Dan's video modal loads successfully on homepage
- [ ] No 500 errors in browser console
- [ ] Dan's video plays in multiple languages (en, es, fr, de, zh, ja)

---

**Generated:** October 28, 2025
**Affected URL:** https://www.slctrips.com
**Database:** Supabase (mkepcjzqnbowrgbvjfem)
