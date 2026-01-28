# YouTube Video Fidelity Report

**Date:** December 2025  
**Total Destinations with Videos:** 157  
**TripKits with Videos:** 0

---

## 📊 Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ **Relevant Videos** | 65 | 41.4% |
| ❌ **Irrelevant Videos** | 39 | 24.8% |
| ⚠️ **Errors (Not Found/Deleted)** | 53 | 33.8% |

**Overall Fidelity Score:** 41.4% ✅

---

## 🚨 Critical Issues

### Irrelevant Videos (Need Immediate Fix)

These videos do NOT match the destination content and should be replaced or removed:

1. **31 Freak Street** (Las Vegas)
   - Video: "4 Times I've Been CHEATED By Food Challenge Restaurants!!"
   - Issue: Generic food challenge video, not about the specific restaurant
   - URL: https://www.youtube.com/watch?v=Q2hxlxWYTN0

2. **American Legion Post No. 9 - Ogden**
   - Video: "Top 3 BEST SKATEPARKS to Visit in 2023 #skatepark #shorts"
   - Issue: Completely unrelated - skateparks vs. American Legion post
   - URL: https://www.youtube.com/watch?v=HmcioUagp2Q

3. **Big Sky** (Montana)
   - Video: "Shocking CCTV Hidden Security Camera Video Footage Captures The Unimaginable And It Ends In Tragedy!"
   - Issue: Generic security camera footage, not about Big Sky Montana
   - URL: https://www.youtube.com/watch?v=tUXDto9t5h8

4. **Bingham Creek Library**
   - Video: "This mom had an amazing idea for her son's graduation party ❤️"
   - Issue: Generic graduation party video, not about the library
   - URL: https://www.youtube.com/watch?v=4rxI8y2wWdE

5. **Black Book Barred Hotels**
   - Video: "A Glitch In The Matrix Caught On Camera At Disneyland #shorts"
   - Issue: Disneyland video, not about the hotel
   - URL: https://www.youtube.com/watch?v=Bp1UtbE1dak

6. **Chappel Brewing**
   - Video: "Killed by Jet Crash. The Joshua Woods Story - PART 2"
   - Issue: Tragedy story, not about the brewery
   - URL: https://www.youtube.com/watch?v=gmpny9aP24c

7. **Drift Lounge**
   - Video: "6 Best Rooftop Bars in Salt Lake City - 2025"
   - Issue: Generic list video, may mention Drift but not specifically about it
   - URL: https://www.youtube.com/watch?v=0f6aijZ8mCU

8. **Dry Creek Canyon Campsite**
   - Video: "Old School Survival Camping - No Tent, No Sleeping Bag - Exploring Appalachia"
   - Issue: About Appalachia, not Utah's Dry Creek Canyon
   - URL: https://www.youtube.com/watch?v=ZhJVb3q62J0

9. **Ensenada** (Mexico)
   - Video: "Cartel Sighting #shorts #explore #mexico"
   - Issue: Negative/inappropriate content about cartels
   - URL: https://www.youtube.com/watch?v=eYHq2Ss5vUE

10. **Great Falls** (Montana)
    - Video: "Shocking CCTV Hidden Security Camera Video Footage Captures The Unimaginable And It Ends In Tragedy!"
    - Issue: Same generic security footage as Big Sky
    - URL: https://www.youtube.com/watch?v=tUXDto9t5h8

11. **Jackson Hole**
    - Video: "Why Nobody Lives in Wyoming"
    - Issue: Negative content about Wyoming, not about Jackson Hole specifically
    - URL: https://www.youtube.com/watch?v=... (see full report)

12. **Vail** (Colorado)
    - Video: "Why Nobody Lives in Wyoming"
    - Issue: Wrong state entirely (Wyoming vs. Colorado)
    - URL: https://www.youtube.com/watch?v=...

**... and 27 more** (see `youtube-fidelity-report.json` for complete list)

---

## ⚠️ Videos Not Found (Deleted/Private)

53 videos could not be found via YouTube API. These may be:
- Deleted by the creator
- Made private
- Region-restricted
- Invalid video IDs

**Examples:**
- Alta Ski Area (ID: VLPnqYVq93E)
- Arapahoe Basin (ID: Uv5hLnONz0o)
- Multiple ski resorts (Aspen, Breckenridge, Vail, etc.)

**Action Required:** These should be replaced with working videos or removed.

---

## ✅ Good Examples (Relevant Videos)

These videos correctly match their destinations:

1. **Antelope Island State Park**
   - Video: "ONE OF UTAH'S BEST LOCATIONS | Antelope Island State Park"
   - ✅ Perfect match

2. **Antelope Canyon**
   - Video: "Antelope Canyon Tour and Horseshoe Bend from Sedona, Arizona"
   - ✅ Relevant (same location)

3. **Bear River Massacre Site**
   - Video: "Bear River Massacre 1863"
   - ✅ Perfect historical match

4. **Dinosaur National Monument**
   - Video: "Welcome to the Quarry Exhibit Hall | Dinosaur National Monument"
   - ✅ Official park video

5. **Utah Shakespeare Festival**
   - Video: "The Utah Shakespeare Festival 2015 Season | Contact in the Community"
   - ✅ Perfect match

---

## 🔧 Recommendations

### Immediate Actions

1. **Remove or Replace Irrelevant Videos (39 destinations)**
   - Priority: High
   - Impact: Poor user experience, misleading content
   - Estimated Time: 2-4 hours to find replacements

2. **Fix Broken Video Links (53 destinations)**
   - Priority: High
   - Impact: Broken embeds on pages
   - Estimated Time: 3-5 hours to find replacements

3. **Review Borderline Cases**
   - Some videos may be contextually relevant even if keyword match is low
   - Manual review recommended for videos with 20-30% relevance

### Long-term Improvements

1. **Automated Video Validation**
   - Run this script monthly to catch new issues
   - Add to CI/CD pipeline

2. **Video Selection Guidelines**
   - Require videos to mention destination name in title
   - Prefer official destination/park videos
   - Avoid generic list videos unless destination is prominently featured

3. **Video Quality Standards**
   - Minimum relevance score: 40%
   - Must match at least 2 keywords from destination name
   - Location match (county/city) counts as strong signal

---

## 📋 Action Items

- [ ] Review all 39 irrelevant videos
- [ ] Replace or remove irrelevant videos
- [ ] Fix 53 broken video links
- [ ] Create video selection guidelines document
- [ ] Set up monthly automated checks
- [ ] Update video_url fields in database

---

## 📄 Detailed Data

Full detailed report with all video metadata available in:
- `youtube-fidelity-report.json` - Complete JSON data
- Run `node check-youtube-fidelity.mjs` to regenerate

---

**Last Updated:** December 2025  
**Next Review:** January 2026 (or after fixes are applied)

