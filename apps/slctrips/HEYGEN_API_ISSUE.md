# HeyGen API Key Issue

## Test Results

### ✅ ElevenLabs (Voice Generation)
- **Status:** WORKING PERFECTLY
- **Test:** Generated 588KB of audio for Dan's voice
- **API Key:** Valid and functional
- **Account:** Wasatch wise (Creator tier)

### ❌ HeyGen (Video Generation)
- **Status:** INVALID API KEY
- **Error:** `401 Unauthorized - {"data":null,"error":{"code":"internal_error","message":"Unauthorized"}}`
- **Current Key:** `sk_bec8d88c60fd0dcde424cdd3a1d956332e712c32d4f85f7c`
- **Issue:** Key is expired or invalid

## What We Tried

Successfully generated Dan's voice audio (588KB MP3), but HeyGen rejected the video generation request with a 401 error.

## Solution: Get a New HeyGen API Key

### Step 1: Go to HeyGen Dashboard

Visit: https://app.heygen.com/home

### Step 2: Navigate to API Settings

1. Click on your profile/avatar in the top right
2. Go to **Settings** → **API**
3. Or directly visit: https://app.heygen.com/settings/api

### Step 3: Generate New API Key

1. Click **"Create API Key"** or **"Generate New Key"**
2. Give it a name (e.g., "SLCTrips Production")
3. Copy the new API key (starts with `sk_...`)
4. **Important:** Save it immediately - you won't be able to see it again!

### Step 4: Update Local Environment

Update `.env.local`:

```bash
HEYGEN_API_KEY=your_new_key_here
```

### Step 5: Update Vercel

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select `slctrips-v2` project
3. Settings → Environment Variables
4. Find `HEYGEN_API_KEY` and update with new value
5. Redeploy

### Step 6: Test the Video Generation

Run the test script:

```bash
npx tsx scripts/test-dan-video-generation.js
```

Expected output:
```
✅ Voice generated: ~588KB
✅ Video job created: [video_id]
⏳ Polling for video completion... (30-60 seconds)
🎉 SUCCESS! Dan's video is ready!
Video URL: https://...
```

## HeyGen Account Requirements

**To generate videos, your HeyGen account needs:**

- Active subscription (Free tier may have limited API access)
- API access enabled (some plans don't include API)
- Credits/quota available for video generation

Check your account status at: https://app.heygen.com/settings/billing

## Pricing Information

HeyGen video generation costs vary by plan:
- **Creator Plan:** Typically includes API access
- **Business Plan:** More API quota
- **Enterprise:** Custom limits

Each video generation uses credits. Check your remaining credits in the dashboard.

## Alternative: Use Pre-Generated Video

If you don't want to use the HeyGen API, you can use the existing video:

**File:** `public/video/Avatar IV Video.mp4` (36MB)

This can be used as Dan's default video instead of generating dynamic ones.

### To Use the Existing Video:

1. **Option A:** Update the DanVideoModal component to use the static file
2. **Option B:** Upload the video to Supabase Storage and cache the URL
3. **Option C:** Host on CDN and reference directly

## Summary

| Service | Status | Action Needed |
|---------|--------|---------------|
| ElevenLabs | ✅ Working | None - already updated |
| HeyGen | ❌ Invalid Key | Get new API key from https://app.heygen.com/settings/api |

## What Works Right Now

Even without HeyGen, you can:
- ✅ Generate Dan's voice in any language (ElevenLabs working)
- ✅ Use the existing Avatar IV Video.mp4 file
- ✅ Create audio-only content
- ⏳ Need HeyGen key for: Dynamic talking avatar videos

---

**Next Steps:**
1. Get new HeyGen API key
2. Update `.env.local` and Vercel
3. Test video generation: `npx tsx scripts/test-dan-video-generation.js`
4. Generate videos in all 6 languages (en, es, fr, de, zh, ja)

**Alternative:**
- Use the existing `Avatar IV Video.mp4` as Dan's default video
- Focus on voice-only content with ElevenLabs (which is working great!)
