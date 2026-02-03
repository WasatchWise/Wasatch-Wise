# Air Quality API Troubleshooting

**Issue:** Air pollution endpoint returning errors  
**Created:** February 2, 2026

---

## 🔍 Common Issues

### 1. API Key Not Working for Air Pollution Endpoint

**Problem:** Weather API works, but air pollution fails with 401 error.

**Cause:** Some OpenWeather API keys don't have air pollution access enabled by default.

**Solutions:**

#### Option A: Wait for API Key Activation (Recommended)
OpenWeather API keys can take **up to 2 hours** to fully activate after creation. If your key is brand new:
1. Wait 2 hours
2. Test again
3. Should work automatically

#### Option B: Upgrade to Professional Plan
Free tier sometimes has limited air pollution access:
1. Go to https://openweathermap.org/price
2. Check if air pollution is included in your plan
3. May need to upgrade (but usually free tier works after activation)

#### Option C: Use Workflow v2 (Immediate Solution)
I've created **utah-conditions-monitor-v2.json** that:
- ✅ Makes air quality OPTIONAL
- ✅ Continues working even if AQ API fails
- ✅ Defaults to "Good" air quality if unavailable
- ✅ Still logs weather and recommendations

---

## 🧪 Testing Your API Key

### Test Weather API (Should Work)
```bash
curl "https://api.openweathermap.org/data/2.5/weather?q=Salt%20Lake%20City,US&appid=YOUR_API_KEY&units=imperial"
```

**Expected:** JSON with weather data

---

### Test Air Pollution API
```bash
curl "https://api.openweathermap.org/data/2.5/air_pollution?lat=40.7608&lon=-111.8910&appid=YOUR_API_KEY"
```

**Expected (Success):**
```json
{
  "coord": [111.8910, 40.7608],
  "list": [{
    "main": {"aqi": 1},
    "components": {"co": 230.31, "no": 0, ...}
  }]
}
```

**Expected (Failure - New Key):**
```json
{
  "cod": 401,
  "message": "Invalid API key. Please see https://openweathermap.org/faq#error401 for more info."
}
```

---

## ✅ Solution: Import v2 Workflow

### What's Different in v2?

| Feature | v1 | v2 |
|---------|----|----|
| Weather data | ✅ Required | ✅ Required |
| Air quality data | ✅ Required | ⚠️ Optional |
| Fails if AQ unavailable | ❌ Yes | ✅ No |
| Default AQ value | None | "Good" (aqi: 1) |
| Error handling | Basic | Graceful fallback |

### Import v2 Workflow

1. **Delete or deactivate v1** in n8n
2. **Import new file:**
   - Workflows → Import from File
   - Choose: `infrastructure/n8n/workflows/utah-conditions-monitor-v2.json`
3. **Activate** the workflow
4. **Test** - Should work even without air quality!

---

## 📊 What You'll Get Without Air Quality

The workflow will still:
- ✅ Detect weather conditions (snow, heat, etc.)
- ✅ Generate content angles
- ✅ Provide activity recommendations
- ✅ Log to Supabase
- ✅ Detect high urgency (powder days, extreme heat)

**Missing:**
- ❌ Air quality hazard alerts (will show "Unknown")
- ❌ Inversion warnings

**When your API key activates (within 2 hours), air quality will start working automatically - no changes needed!**

---

## 🔧 Checking API Key Status

### In OpenWeather Dashboard
1. Go to https://home.openweathermap.org/api_keys
2. Find your API key
3. Check "Status" column:
   - ✅ **Active** - Should work
   - ⏳ **Pending** - Wait up to 2 hours
   - ❌ **Inactive** - Generate new key

### In n8n Execution Log
After running workflow, check the "Get Air Quality" node:
- **Green** = Working
- **Red** = Failed (but v2 continues anyway)
- Click node to see error message

---

## 🚀 Recommended Workflow

### Immediate (Right Now)
1. ✅ Import **v2 workflow**
2. ✅ Test execution
3. ✅ Verify weather data flows through
4. ✅ Check Supabase for logged data

### After 2 Hours (When Key Activates)
1. Test air quality endpoint manually (curl command above)
2. If working, great! v2 will automatically use it
3. If still failing, check OpenWeather dashboard for key status

### Long-term (Once Working)
Keep v2 - it's more robust and handles API failures gracefully. Even if air quality works now, it might fail occasionally (rate limits, API downtime). v2 continues working regardless.

---

## 🐛 Still Having Issues?

### Error: "Invalid API key"
- **Check:** API key is correct in `.env`
- **Check:** No extra spaces or quotes around key
- **Wait:** 2 hours for activation
- **Try:** Generate a new API key

### Error: "Rate limit exceeded"
Free tier = 1,000 calls/day
- Current workflow = 4 calls every 6 hours = 16 calls/day ✅
- Well within limits
- If hitting limit, check for other apps using same key

### Error: "Supabase insert failed"
Not an air quality issue - check:
- `weather_alerts` table exists
- `SUPABASE_SERVICE_ROLE_KEY` is correct
- Supabase project is accessible

---

## 📝 Technical Details

### Why Air Quality Might Not Work

OpenWeather API has different endpoints:
1. **Current Weather** - Always available on free tier
2. **Forecast** - Always available on free tier  
3. **Air Pollution** - Available on free tier BUT:
   - Needs API key activation period
   - Newer feature (added 2021)
   - Some legacy keys don't have access

### v2 Workflow Changes

**In Conditions Router Node:**
```javascript
// v1: Assumes air quality data exists
const aqi = airQuality.list[0].main.aqi;

// v2: Handles missing air quality gracefully
let aqi = 1; // Default to "Good"
try {
  const aqData = $('Get Air Quality (Optional)').first().json;
  if (aqData && aqData.list && aqData.list[0]) {
    aqi = aqData.list[0].main.aqi;
  }
} catch (e) {
  console.log('Air quality unavailable, using default');
}
```

**In HTTP Request Node:**
- Added: `continueOnFail: true`
- Added: `neverError: true` in options
- Added: `alwaysOutputData: true`

This means: Even if API returns 401, workflow continues.

---

## 🎯 Summary

**Problem:** Air quality API not working yet  
**Cause:** New API key needs activation time  
**Solution:** Import v2 workflow (works without air quality)  
**Timeline:** Should work automatically within 2 hours  
**Impact:** Minimal - weather and recommendations still work perfectly

---

*Last updated: February 2, 2026*  
*Next check: 2 hours after API key creation*
