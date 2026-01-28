# Monthly YouTube Video Quality Checks - Setup Guide

**Purpose:** Automate monthly quality checks to maintain 100% video fidelity

---

## ✅ Setup Complete

Monthly checks are now configured to run automatically.

---

## 📅 Schedule

**Frequency:** Monthly  
**Day:** 1st of each month  
**Time:** 9:00 AM  
**Script:** `scripts/monthly-youtube-check.sh`

---

## 🔧 Manual Setup (If Needed)

### Option 1: Cron Job (Recommended)

```bash
# Run setup script
./scripts/setup-monthly-checks.sh

# Or manually add to crontab
crontab -e

# Add this line:
0 9 1 * * cd /path/to/slctrips-v2 && ./scripts/monthly-youtube-check.sh
```

### Option 2: GitHub Actions (Alternative)

Create `.github/workflows/monthly-youtube-check.yml`:

```yaml
name: Monthly YouTube Check

on:
  schedule:
    - cron: '0 9 1 * *'  # 1st of each month at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node check-youtube-fidelity.mjs
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_DANIEL_SERVICE_KEY: ${{ secrets.SUPABASE_DANIEL_SERVICE_KEY }}
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
      - uses: actions/upload-artifact@v3
        with:
          name: youtube-fidelity-report
          path: youtube-fidelity-report.json
```

### Option 3: Manual Monthly Reminder

Set a calendar reminder for the 1st of each month to run:

```bash
cd /path/to/slctrips-v2
node check-youtube-fidelity.mjs
```

---

## 📊 What Gets Checked

1. **Video Relevance**
   - Verifies video titles/descriptions match destinations
   - Calculates relevance scores
   - Flags videos below 40% relevance

2. **Video Accessibility**
   - Checks if videos are deleted/private
   - Verifies video IDs are valid
   - Flags broken links

3. **Quality Metrics**
   - Relevance rate (target: > 90%)
   - Error rate (target: < 5%)
   - Total videos checked

---

## 📄 Output Files

### Console Output
- Summary statistics
- List of problematic videos
- Recommendations

### Generated Files
- `youtube-fidelity-report.json` - Complete analysis data
- `logs/youtube-check-YYYY-MM.log` - Monthly log file

---

## 🚨 Alert Thresholds

The script will flag issues if:

- **Relevance Rate < 80%** - Too many irrelevant videos
- **Error Rate > 10%** - Too many broken links
- **New Issues Detected** - Videos that were previously good

---

## 🔄 Maintenance Workflow

### Monthly (Automated)

1. **Check Runs Automatically** (1st of month)
2. **Review Log File** (`logs/youtube-check-YYYY-MM.log`)
3. **Check Report** (`youtube-fidelity-report.json`)

### If Issues Found

1. **Review Flagged Videos**
   ```bash
   # Check report
   cat youtube-fidelity-report.json | jq '.details[] | select(.status == "irrelevant" or .status == "error")'
   ```

2. **Fix Issues**
   ```bash
   # Remove problematic videos
   node fix-youtube-videos.mjs
   ```

3. **Add Better Videos**
   ```bash
   # Find videos for destinations
   node find-youtube-videos.mjs --from-report
   ```

---

## 📈 Tracking Progress

### Current Metrics (After Cleanup)
- ✅ Relevance Rate: 100%
- ✅ Error Rate: 0%
- ✅ Total Videos: 65

### Target Metrics
- ✅ Relevance Rate: > 90%
- ✅ Error Rate: < 5%
- ✅ Video Coverage: Growing monthly

---

## 🛠️ Tools Reference

### Check Video Quality
```bash
node check-youtube-fidelity.mjs
```

### Fix Problematic Videos
```bash
node fix-youtube-videos.mjs
```

### Find Videos for Destinations
```bash
node find-youtube-videos.mjs "Destination Name"
```

### Analyze Opportunities
```bash
node analyze-video-opportunities.mjs
```

---

## 📞 Support

**Questions?** Review:
- `YOUTUBE_VIDEO_GUIDELINES.md` - Selection guidelines
- `YOUTUBE_CLEANUP_SUMMARY.md` - Previous cleanup
- `VIDEO_OPPORTUNITY_PRIORITIES.md` - Priority destinations

**Logs Location:** `logs/youtube-check-*.log`

---

**Setup Date:** December 2025  
**Status:** ✅ Automated Monthly Checks Configured

