# 🧪 Testing Eventbrite API Integration

**Status**: ✅ Token added to Vercel - Ready to test!

---

## ✅ Setup Complete Checklist

- [x] Eventbrite API token obtained: `FKILZ4KU7IJISJI4WNTG`
- [x] Token added to Vercel environment variables
- [x] Code implementation complete
- [ ] Deployment completed (automatic or manual)
- [ ] Integration tested and verified

---

## 🚀 Testing Steps

### Step 1: Wait for Deployment (1-2 minutes)

If you just added the environment variable:
- **Automatic**: Next commit will trigger deployment
- **Manual**: Go to Deployments → Latest → "Redeploy"

**Check Deployment Status:**
- Go to Vercel Dashboard → Deployments
- Look for latest deployment
- Verify it shows "Ready" status
- Check build logs for any errors

### Step 2: Test with Dan Concierge

**Option A: Via TripKit Viewer**
1. Navigate to any TripKit:
   - Example: https://www.slctrips.com/tripkits/morbid-misdeeds/view
2. Open Dan Concierge (chat/concierge interface)
3. Ask: **"What events are happening in Salt Lake City today?"**
4. Verify response shows real-time events

**Option B: Direct API Test** (Advanced)
```bash
# Test the API endpoint directly
curl -X POST https://www.slctrips.com/api/dan/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What events are happening in Salt Lake City today?"}'
```

### Step 3: Verify Response

**✅ Success Indicators:**

1. **Response Source**
   - Should include: `"source": "Eventbrite API - Real-time"`
   - NOT: `"source": "Static data"` or `"fallback"`

2. **Event Details**
   - Real event names (not generic)
   - Actual dates and times
   - Specific locations/venues
   - Event URLs (links to Eventbrite)

3. **Response Format**
   ```json
   {
     "date": "1/18/2025",
     "area": "Salt Lake City, UT",
     "events": [
       {
         "name": "Actual Event Name",
         "location": "Venue Name",
         "time": "7:00 PM MST",
         "date": "Sat, Jan 18",
         "price": "Free" or "$45+",
         "url": "https://www.eventbrite.com/e/...",
         "description": "Event description..."
       }
     ],
     "source": "Eventbrite API - Real-time",
     "last_updated": "2025-01-18T22:13:00.000Z"
   }
   ```

4. **Dan's Response**
   - Mentions specific events
   - Includes times and locations
   - Provides links to event pages
   - Shows disclaimers about verifying details

---

## 🎯 Expected Test Results

### Test Query 1: "What events are happening today?"
**Expected:**
- Real-time events from Eventbrite
- Events happening today in Salt Lake City
- Specific venues and times
- Links to event pages

### Test Query 2: "Show me events in Park City"
**Expected:**
- Events in Park City area
- Location-aware results
- Real-time data

### Test Query 3: "What's happening this weekend?"
**Expected:**
- Events for upcoming weekend
- Date range filtering
- Multiple events listed

---

## 🐛 Troubleshooting

### Issue: Still showing fallback/static data

**Possible Causes:**
1. Deployment hasn't completed yet
2. Environment variable not set correctly
3. Token not accessible in runtime

**Solutions:**
1. ✅ Check deployment status in Vercel
2. ✅ Verify environment variable:
   - Name: `EVENTBRITE_API_TOKEN`
   - Value: `FKILZ4KU7IJISJI4WNTG`
   - Environments: All selected
3. ✅ Check deployment logs for errors
4. ✅ Try redeploying manually

### Issue: "Eventbrite API error: 401"

**Cause**: Invalid token or authentication issue

**Solutions:**
- Verify token is correct (no extra spaces)
- Check token hasn't expired
- Verify token has proper permissions

### Issue: "No events found"

**Possible Causes:**
- No events happening today in the area
- API query parameters issue
- Date range problem

**Solutions:**
- Try different area: "Park City" or "Provo"
- Check Eventbrite website for actual events
- Verify date formatting in API call

### Issue: Response shows "source": "fallback"

**Cause**: Eventbrite API call failed, using fallback

**Solutions:**
- Check server logs for API errors
- Verify network connectivity
- Check API rate limits
- Verify token permissions

---

## 📊 Monitoring

### Check Eventbrite API Usage:

1. **Eventbrite Dashboard**
   - Go to: https://www.eventbrite.com/platform/
   - Navigate to API usage/stats
   - Monitor request count

2. **Vercel Logs**
   - Go to Vercel Dashboard → Your Project
   - Navigate to "Logs" or "Functions"
   - Check for Eventbrite API calls
   - Look for errors or warnings

3. **Expected Usage**
   - Free tier: 2,000 requests/day
   - Your usage: ~5-10 requests/day (very low)
   - Well within free tier limits

---

## ✅ Success Criteria

**Integration is working if:**
- [x] Dan responds with real-time events
- [x] Response shows "Eventbrite API - Real-time" source
- [x] Events have actual names, dates, times, locations
- [x] Events include URLs to Eventbrite pages
- [x] No errors in deployment logs
- [x] Events are relevant to the area queried

---

## 🎉 What Success Looks Like

### Before (Without Integration):
```
User: "What events are happening in Salt Lake City today?"

Dan: "There are a few events happening in Salt Lake City today. 
You could go ice skating at the Gallivan Center, see the Temple 
Square Lights, or catch a Utah Jazz game. Check local listings 
for the most current events."
```
- Generic, seasonal, low trust

### After (With Integration):
```
User: "What events are happening in Salt Lake City today?"

Dan: "Great events today! Here are some happening in Salt Lake City:

• Downtown Farmers Market at Pioneer Park (8am-2pm, Free)
  https://www.eventbrite.com/e/...

• Utah Jazz vs Lakers at Delta Center (7pm, $45+)
  https://www.eventbrite.com/e/...

• Live Music at The State Room (9pm, $20)
  https://www.eventbrite.com/e/...

⚠️ Event details may change. Verify with event organizers."
```
- Specific, real-time, high trust, actionable

---

## 📝 Next Steps After Testing

### If Working ✅:
1. Monitor usage for a few days
2. Gather user feedback
3. Track accuracy improvements
4. Plan Phase 2: Ski Conditions API

### If Not Working ❌:
1. Check troubleshooting section above
2. Review deployment logs
3. Verify environment variable
4. Test API token directly with curl

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Eventbrite Platform**: https://www.eventbrite.com/platform/
- **Your Project**: slctrips-v2
- **Test TripKit**: https://www.slctrips.com/tripkits/morbid-misdeeds/view

---

**Ready to test!** 🚀

Once deployment completes, test with Dan Concierge and verify real-time events are working!
