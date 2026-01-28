# 🚀 Vercel Environment Variables Setup - Eventbrite API

## ✅ Your Eventbrite API Token

**Token**: `FKILZ4KU7IJISJI4WNTG` ✅

**Status**: Ready to add to Vercel

---

## 📝 Step-by-Step: Add to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `slctrips-v2`

2. **Navigate to Settings**
   - Click on your project
   - Go to **"Settings"** tab (left sidebar)
   - Click **"Environment Variables"** (under "Configuration")

3. **Add Eventbrite Token**
   - Click **"Add New"** button
   - **Key**: `EVENTBRITE_API_TOKEN`
   - **Value**: `FKILZ4KU7IJISJI4WNTG`
   - **Environment**: Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **"Save"**

4. **Redeploy** (if needed)
   - Go to **"Deployments"** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - Or wait for next automatic deployment

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variable
vercel env add EVENTBRITE_API_TOKEN production
# When prompted, paste: FKILZ4KU7IJISJI4WNTG

vercel env add EVENTBRITE_API_TOKEN preview
# When prompted, paste: FKILZ4KU7IJISJI4WNTG

vercel env add EVENTBRITE_API_TOKEN development
# When prompted, paste: FKILZ4KU7IJISJI4WNTG

# Redeploy
vercel --prod
```

---

## ✅ Verify Setup

### Check Environment Variable:

1. **In Vercel Dashboard:**
   - Settings → Environment Variables
   - Verify `EVENTBRITE_API_TOKEN` appears
   - Verify it's added to all environments

2. **After Deployment:**
   - Check deployment logs
   - Look for successful build
   - No errors related to Eventbrite API

---

## 🧪 Test the Integration

### Step 1: Wait for Deployment
- After adding the environment variable, wait for deployment to complete
- Usually takes 1-2 minutes

### Step 2: Test with Dan Concierge

1. **Go to any TripKit viewer**
   - Example: https://www.slctrips.com/tripkits/morbid-misdeeds/view

2. **Open Dan Concierge**
   - Click the chat/concierge button
   - Or navigate to Dan's interface

3. **Ask for Events**
   - Type: **"What events are happening in Salt Lake City today?"**
   - Or: **"Show me events in Salt Lake City"**

4. **Verify Response**
   - ✅ Should show real-time events from Eventbrite
   - ✅ Response should include: `"source": "Eventbrite API - Real-time"`
   - ✅ Events should have actual dates, times, locations
   - ✅ Events should have URLs to Eventbrite pages

### Step 3: Check Response Format

**Expected Response Structure:**
```json
{
  "date": "1/18/2025",
  "area": "Salt Lake City, UT",
  "events": [
    {
      "name": "Event Name",
      "location": "Venue Name",
      "time": "7:00 PM MST",
      "date": "Sat, Jan 18",
      "price": "Free" or "$45+",
      "url": "https://www.eventbrite.com/e/...",
      "description": "Event description..."
    }
  ],
  "source": "Eventbrite API - Real-time",
  "last_updated": "2025-01-18T22:13:00.000Z",
  "disclaimer": "⚠️ Event details may change. Verify with event organizers."
}
```

---

## 🐛 Troubleshooting

### Issue: Still showing fallback data

**Check:**
1. ✅ Environment variable is set in Vercel
2. ✅ Variable is added to Production environment
3. ✅ Deployment completed successfully
4. ✅ Token is correct (no extra spaces)

**Solution:**
- Verify token in Vercel dashboard
- Check deployment logs for errors
- Try redeploying after adding variable

### Issue: "Eventbrite API error: 401"

**Cause**: Invalid or expired token

**Solution:**
- Verify token is correct: `FKILZ4KU7IJISJI4WNTG`
- Check for extra spaces or characters
- Regenerate token if needed

### Issue: "Eventbrite API error: 429"

**Cause**: Rate limit exceeded

**Solution:**
- Free tier: 2,000 requests/day
- Wait a few minutes
- Check usage in Eventbrite dashboard

### Issue: No events found

**Possible Causes:**
- No events happening today in Salt Lake City
- API token doesn't have proper permissions
- Date range issue

**Solution:**
- Try asking for events in a different area
- Check Eventbrite website for actual events
- Verify token has "read public events" permission

---

## 📊 Expected Results

### Before (Without Token):
- Events accuracy: ~40%
- Generic/seasonal suggestions
- Response: "Ice skating at Gallivan Center, Temple Square Lights..."

### After (With Token):
- Events accuracy: **90%+**
- Real-time actual events
- Response: "Downtown Farmers Market at Pioneer Park (8am-2pm, Free), Utah Jazz game at Delta Center (7pm, $45+)..."

---

## ✅ Success Checklist

- [ ] Eventbrite API token obtained
- [ ] Token added to Vercel environment variables
- [ ] Token added to all environments (Production, Preview, Development)
- [ ] Deployment completed successfully
- [ ] Tested with Dan Concierge
- [ ] Verified real-time events appear
- [ ] Confirmed response shows "Eventbrite API - Real-time" source

---

## 🎉 Next Steps

Once verified working:

1. **Monitor Usage**
   - Check Eventbrite API usage dashboard
   - Ensure staying within free tier (2,000 requests/day)

2. **Gather Feedback**
   - Monitor user interactions with Dan
   - Track accuracy improvements
   - Note any issues or edge cases

3. **Plan Phase 2**
   - Ski conditions API integration
   - Canyon status with UDOT API
   - Additional accuracy improvements

---

## 📝 Quick Reference

**Token**: `FKILZ4KU7IJISJI4WNTG`  
**Environment Variable**: `EVENTBRITE_API_TOKEN`  
**API Endpoint**: `https://www.eventbriteapi.com/v3/events/search/`  
**Free Tier**: 2,000 requests/day  
**Documentation**: See `EVENTBRITE_API_SETUP.md`

---

**Status**: ✅ Token obtained - Ready to add to Vercel!
