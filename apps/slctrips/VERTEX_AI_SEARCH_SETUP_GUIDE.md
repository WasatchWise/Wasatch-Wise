# Vertex AI Search Setup Guide - Step by Step 🚀

**Date:** January 2025  
**Project:** cs-poc-ujrgyykgigo08lwlg6fdrrl  
**Goal:** Set up Vertex AI Search for real-time events (40% → 90%+ accuracy)

---

## 🎯 OVERVIEW

This guide will help you set up Vertex AI Search to replace the curated events data with real-time event information, dramatically improving Dan Concierge accuracy.

**Expected Result:** Events accuracy improves from 40% → 90%+

---

## 📋 PREREQUISITES

✅ **Already Complete:**
- Vertex AI API enabled
- Google Cloud project: `cs-poc-ujrgyykgigo08lwlg6fdrrl`
- Project location: Global

⏳ **To Do:**
- Create Vertex AI Search app
- Set up data store
- Configure environment variables
- Test integration

---

## 🚀 STEP-BY-STEP SETUP

### Step 1: Navigate to Vertex AI Search

1. **Open Google Cloud Console:**
   - Go to: https://console.cloud.google.com/vertex-ai/search?project=cs-poc-ujrgyykgigo08lwlg6fdrrl
   - Or: Search for "Vertex AI Search" in console

2. **Verify Access:**
   - You should see "Vertex AI Search" dashboard
   - If you see a tutorial, you're in the right place

---

### Step 2: Create Search App

1. **Click "Create App"** (or "Get Started")

2. **Choose App Type:**
   - Select: **"Custom Search"**
   - Then: **"General"** (not "Website" or "Structured Data")

3. **Configure App:**
   - **App Name:** `SLCTrips Events Search`
   - **Description:** `Real-time event search for Salt Lake City area`
   - **Region:** `Global` (or your preferred region)

4. **Click "Create"**

---

### Step 3: Create Data Store

1. **In Your Search App, Click "Create Data Store"**

2. **Choose Data Source Type (First-party recommended):**
   - **Option A: First-party Website (Recommended)**
     - Choose: "Website (Advanced)" or "Web URLs"
     - Add URLs:
       - `https://slctrips.com/events/`
       - `https://slctrips.com/events/*`
     - This avoids domain verification blockers and keeps indexing stable.
   
   - **Option B: Structured Data (Future enhancement)**
     - Choose: "Structured Data" or "API"
     - Provide a JSON feed from your own events database
     - Highest accuracy, requires custom feed setup

3. **Configure Data Store:**
   - **Name:** `SLC Events Data Store`
   - **Description:** `Salt Lake City area events from multiple sources`
   - **Update Frequency:** `Daily` (or `Real-time` if using API)

4. **Click "Create"**

---

### Step 4: Wait for Data Indexing

1. **After Creating Data Store:**
   - Vertex AI will start indexing your data sources
   - This can take 15-60 minutes depending on data volume
   - You'll see progress in the dashboard

2. **Check Status:**
   - Look for "Indexing" or "Ready" status
   - Wait until status shows "Ready" before proceeding

---

### Step 5: Get Data Store ID

1. **Once Data Store is Ready:**
   - Click on your data store name
   - Look for "Data Store ID" or "ID"
   - Copy this ID (it will look like: `1234567890` or similar)

2. **Save for Next Step:**
   - You'll need this ID for environment variables

---

### Step 6: Set Environment Variables

1. **Add to `.env` file:**
```env
# Vertex AI Configuration
GOOGLE_CLOUD_PROJECT_ID=cs-poc-ujrgyykgigo08lwlg6fdrrl
VERTEX_AI_LOCATION=global
VERTEX_AI_EVENTS_DATASTORE_ID=your-datastore-id-here
```

2. **Replace `your-datastore-id-here`** with the actual Data Store ID from Step 5

3. **Add to Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all three variables
   - Redeploy after adding

---

### Step 7: Install Dependencies

```bash
npm install @google-cloud/aiplatform
```

**Verify Installation:**
```bash
npm list @google-cloud/aiplatform
```

---

### Step 8: Update Code (Already Done ✅)

The code is already prepared! The `getTodaysEvents()` function in `/api/dan/chat/route.ts` will automatically use Vertex AI Search when:
- `VERTEX_AI_EVENTS_DATASTORE_ID` is set
- Vertex AI Search is configured

**No code changes needed** - it's ready to go!

---

### Step 9: Test Vertex AI Search

1. **Test Query in Vertex AI Console:**
   - Go to your Search App
   - Click "Test" or "Try it"
   - Query: "Events happening today in Salt Lake City"
   - Verify results look good

2. **Test in Your App:**
   - Navigate to a TripKit viewer
   - Open Dan Concierge
   - Ask: "What events are happening in Salt Lake City today?"
   - Verify response includes real-time events

---

### Step 10: Monitor & Optimize

1. **Check Usage:**
   - Monitor Vertex AI Search usage in Google Cloud Console
   - Check costs (should be ~$0.50 per 1,000 queries)

2. **Optimize Data Sources:**
   - Add more event sources if needed
   - Remove sources that aren't providing good data
   - Adjust update frequency

---

## 🔧 TROUBLESHOOTING

### Issue: "Data Store not found"
**Solution:**
- Verify Data Store ID is correct
- Check that Data Store status is "Ready"
- Ensure project ID matches

### Issue: "No results returned"
**Solution:**
- Check that data indexing completed
- Verify data sources are accessible
- Test query in Vertex AI Console first

### Issue: "Permission denied"
**Solution:**
- Verify Vertex AI API is enabled
- Check IAM permissions for service account
- Ensure project ID is correct

### Issue: "Import error for @google-cloud/aiplatform"
**Solution:**
- Run `npm install @google-cloud/aiplatform`
- Check Node.js version (should be 18+)
- Verify package.json includes dependency

---

## 📊 EXPECTED RESULTS

### Before Vertex AI Search:
- Events: 40% accuracy (curated/seasonal)
- User sees: Generic suggestions
- Trust: Low (data may be outdated)

### After Vertex AI Search:
- Events: 90%+ accuracy (real-time)
- User sees: Current events happening today
- Trust: High (real-time, verified data)

---

## 💰 COST ESTIMATE

### Vertex AI Search Pricing:
- **Free Tier:** First 1,000 queries/month free
- **After Free Tier:** ~$0.50 per 1,000 queries

### Estimated Monthly Cost:
- **Low Usage:** $0-10/month (under 20K queries)
- **Medium Usage:** $10-50/month (20K-100K queries)
- **High Usage:** $50-200/month (100K+ queries)

**Your current usage:** Likely low-medium, so ~$10-30/month

---

## ✅ CHECKLIST

- [ ] Navigate to Vertex AI Search console
- [ ] Create Search App ("SLCTrips Events Search")
- [ ] Create Data Store with event sources
- [ ] Wait for data indexing to complete
- [ ] Get Data Store ID
- [ ] Add environment variables to `.env`
- [ ] Add environment variables to Vercel
- [ ] Install `@google-cloud/aiplatform` package
- [ ] Test query in Vertex AI Console
- [ ] Test in your app (Dan Concierge)
- [ ] Monitor usage and costs
- [ ] Celebrate improved accuracy! 🎉

---

## 🚀 QUICK START (5 Minutes)

If you want to test quickly:

1. **Create Search App** (2 min)
   - Name: "SLCTrips Events Test"
   - Type: Custom Search → General

2. **Create Data Store** (2 min)
   - Add: `https://www.visitsaltlake.com/events/`
   - Wait for indexing (can test with partial data)

3. **Set Environment Variable** (1 min)
   - Add `VERTEX_AI_EVENTS_DATASTORE_ID` to `.env`
   - Redeploy

4. **Test!**
   - Ask Dan: "What events are happening today?"

---

## 📝 NEXT STEPS AFTER EVENTS

Once events are working:

1. **Ski Conditions** (Phase 2)
   - Integrate resort APIs
   - Use Vertex AI Function Calling
   - Expected: 60% → 85% accuracy

2. **Canyon Status** (Phase 3)
   - Integrate UDOT API
   - Real-time traffic data
   - Expected: 70% → 85% accuracy

3. **Grounding** (Phase 4)
   - Enable for all queries
   - Better citations
   - Expected: +5-10% overall accuracy

---

**Your code is ready! Just set up the Vertex AI Search app and data store, and events will automatically use real-time data.** 🚀✨
