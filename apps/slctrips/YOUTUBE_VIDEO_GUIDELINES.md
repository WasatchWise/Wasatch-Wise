# YouTube Video Selection Guidelines

**Purpose:** Ensure all YouTube videos on destination and TripKit pages are relevant, accurate, and enhance user experience.

---

## ✅ Video Quality Standards

### Minimum Requirements

1. **Relevance Score: 40%+**
   - Video title or description must contain destination name or key location keywords
   - At least 2 keywords from destination name should match

2. **Location Match**
   - Video should be about the specific destination or nearby area
   - County/city name match is a strong positive signal

3. **Content Quality**
   - Official destination/park videos preferred
   - Professional travel channels preferred over random user content
   - Avoid generic list videos unless destination is prominently featured

### What to Avoid

❌ **Generic Content**
- List videos where destination is barely mentioned
- Generic travel tips not specific to the destination
- Random unrelated videos

❌ **Inappropriate Content**
- Negative or controversial topics (e.g., crime, tragedies)
- Misleading or clickbait titles
- Content that doesn't match the destination

❌ **Wrong Location**
- Videos about different locations with similar names
- Videos from different states/regions
- Generic content that could apply anywhere

---

## 🔍 Video Selection Process

### Step 1: Search Strategy

1. **Primary Search:** `[Destination Name] [Location]`
   - Example: "Antelope Island State Park Utah"

2. **Alternative Searches:**
   - `[Destination Name] tour`
   - `[Destination Name] hiking`
   - `[Destination Name] visit`
   - `[Destination Name] guide`

3. **Official Sources First:**
   - National/State Park official channels
   - Tourism board channels
   - Local government channels

### Step 2: Verification Checklist

Before adding a video, verify:

- [ ] Video title mentions destination name or location
- [ ] Video description contains relevant keywords
- [ ] Video is actually about the destination (watch first 30 seconds)
- [ ] Video is not region-restricted or private
- [ ] Video quality is acceptable (not too blurry/old)
- [ ] Video is appropriate for all audiences
- [ ] Video is recent enough to be relevant (within 5 years preferred)

### Step 3: Testing

1. Extract video ID from URL
2. Test embed on a test page
3. Verify video loads correctly
4. Check mobile compatibility

---

## 📋 URL Format Support

We support these YouTube URL formats:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

**Note:** The system automatically extracts the video ID, so any format works.

---

## 🔄 Maintenance Schedule

### Monthly Checks

Run the fidelity checker monthly:

```bash
node check-youtube-fidelity.mjs
```

**Action Thresholds:**
- If < 80% relevance: Review all videos
- If < 90% relevance: Review flagged videos
- If errors > 10%: Investigate broken links

### Quarterly Review

1. Review all videos on top 50 destinations
2. Check for newer/better videos
3. Update outdated content
4. Remove videos that no longer match

---

## 🛠️ Tools

### Fidelity Checker

```bash
# Check all videos for relevance
node check-youtube-fidelity.mjs

# Generates:
# - youtube-fidelity-report.json (detailed data)
# - Console output with summary
```

### Cleanup Script

```bash
# Remove problematic videos (creates backup first)
node fix-youtube-videos.mjs

# Generates:
# - youtube-backup-[timestamp].json (backup)
# - youtube-cleanup-report.json (what was removed)
```

### Manual Verification

For important destinations, manually verify:
1. Watch the video
2. Check comments for relevance
3. Verify channel credibility
4. Test on mobile device

---

## 📊 Quality Metrics

**Target Metrics:**
- ✅ Relevance Rate: > 90%
- ✅ Error Rate: < 5%
- ✅ Average Relevance Score: > 60%

**Current Status:** (Updated after cleanup)
- ✅ Relevant Videos: 65 (100% of remaining)
- ❌ Irrelevant Videos: 0 (removed)
- ⚠️ Errors: 0 (removed)

---

## 🎯 Best Practices

### For Destination Videos

1. **Prioritize Official Content**
   - National/State Park official videos
   - Tourism board content
   - Local government channels

2. **Prefer Recent Content**
   - Videos from last 3-5 years preferred
   - Older videos only if they're the best available

3. **Match Content Type**
   - Hiking destinations → hiking videos
   - Ski resorts → skiing videos
   - Historical sites → historical content

### For TripKit Videos

1. **Overview Videos**
   - Videos that showcase multiple destinations in the TripKit
   - Regional overview videos
   - "Best of" compilations

2. **Theme Matching**
   - Match video content to TripKit theme
   - Example: "Ski Utah" → skiing compilation videos

---

## 🚨 Red Flags

**Immediately Remove Videos If:**

- Video is deleted or private
- Video is about a completely different location
- Video contains inappropriate content
- Video is misleading or clickbait
- Video has been flagged by YouTube
- Video is region-restricted and not accessible

---

## 📝 Examples

### ✅ Good Video Examples

1. **Antelope Island State Park**
   - Video: "ONE OF UTAH'S BEST LOCATIONS | Antelope Island State Park"
   - ✅ Perfect match, official-sounding, specific location

2. **Dinosaur National Monument**
   - Video: "Welcome to the Quarry Exhibit Hall | Dinosaur National Monument"
   - ✅ Official park video, exact destination match

3. **Bear River Massacre Site**
   - Video: "Bear River Massacre 1863"
   - ✅ Historical match, relevant content

### ❌ Bad Video Examples (Now Removed)

1. **31 Freak Street**
   - Video: "4 Times I've Been CHEATED By Food Challenge Restaurants!!"
   - ❌ Generic food challenge, not about the restaurant

2. **Big Sky**
   - Video: "Shocking CCTV Hidden Security Camera Video Footage..."
   - ❌ Completely unrelated, inappropriate content

3. **Vail**
   - Video: "Why Nobody Lives in Wyoming"
   - ❌ Wrong state entirely

---

## 🔗 Resources

- **YouTube Data API:** https://developers.google.com/youtube/v3
- **Video Fidelity Checker:** `check-youtube-fidelity.mjs`
- **Cleanup Script:** `fix-youtube-videos.mjs`
- **Fidelity Report:** `YOUTUBE_FIDELITY_REPORT.md`

---

**Last Updated:** December 2025  
**Maintained By:** CTO / Development Team

