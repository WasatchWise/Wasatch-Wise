# Utah Conditions Monitor - Setup Guide

**Created:** February 2, 2026  
**Purpose:** Year-round conditions engine for SLC Trips content and recommendations

---

## 🌡️ What This Does

The **Utah Conditions Monitor** checks weather and air quality every 6 hours and:

✅ Detects conditions (powder days, extreme heat, air quality hazards)  
✅ Generates content angles for social media  
✅ Recommends activities for tourists and locals  
✅ Logs everything to Supabase for dashboard tracking

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Create Supabase Table**

Run this migration in your **Dashboard Supabase project**:

```bash
cd apps/dashboard
# If using Supabase CLI:
supabase migration new weather_alerts
# Copy contents from lib/supabase/migrations/010_weather_alerts.sql

# Or run directly in Supabase SQL Editor:
# Paste contents of 010_weather_alerts.sql
```

**Or manually in Supabase Dashboard:**
1. Go to SQL Editor
2. Paste the SQL from `apps/dashboard/lib/supabase/migrations/010_weather_alerts.sql`
3. Run it

---

### **Step 2: Add OpenWeather API Key to n8n**

Your `.env` should already have:
```bash
OPENWEATHER_API_KEY=your_key_here
```

If not, add it! Get a free key at: https://openweathermap.org

---

### **Step 3: Import Workflow into n8n**

1. Open n8n: http://localhost:5678
2. **Workflows** → **Import from File**
3. Choose: `infrastructure/n8n/workflows/utah-conditions-monitor.json`
4. The workflow will automatically use `$env.OPENWEATHER_API_KEY` and `$env.SUPABASE_URL`

---

## ✅ Test the Workflow

### Manual Test Run

1. Open the imported workflow in n8n
2. Click **"Execute Workflow"** (play button in bottom left)
3. Check the execution:
   - Green nodes = success
   - Should see weather data flowing through
4. Verify in Supabase:
```sql
SELECT * FROM weather_alerts ORDER BY timestamp DESC LIMIT 1;
```

---

## 📊 Understanding the Output

### Condition Modes

| Mode | When | Content Angle | Urgency |
|------|------|--------------|---------|
| **POWDER_DAY** | Fresh snow, <32°F | "❄️ SNOW DAY - Hit the slopes!" | High |
| **WINTER_COLD** | <32°F, clear | "🥶 Bundle up! Cold but clear" | Normal |
| **WINTER_MILD** | 32-50°F | "☀️ Mild winter day" | Normal |
| **EXTREME_HEAT** | >100°F | "🔥 EXTREME HEAT - Water activities!" | High |
| **HOT** | 90-100°F | "☀️ Hot day - find shade" | Normal |
| **PERFECT_SUMMER** | 75-90°F | "✨ PERFECT Utah day!" | Normal |
| **HAZARD** | AQI ≥4 (Poor) | "⚠️ Air Quality Alert" | High |
| **IDEAL** | 60-75°F, shoulder season | "🌸 Perfect weather" | Normal |
| **VARIABLE** | Other shoulder season | "🌤️ Layer up!" | Normal |

### Example Output (Feb 2, 2026 - Current)

```json
{
  "timestamp": "2026-02-02T14:00:00.000Z",
  "weather": {
    "temp": 33,
    "conditions": "Clear",
    "description": "clear sky",
    "humidity": 45
  },
  "airQuality": {
    "aqi": 1,
    "level": "Good"
  },
  "season": "winter",
  "mode": "WINTER_COLD",
  "urgency": "normal",
  "contentAngle": "🥶 Bundle up! Cold but clear",
  "recommendations": [
    {
      "name": "Temple Square Lights",
      "type": "outdoor",
      "link": "/activities/temple-square"
    },
    {
      "name": "Olympic Oval (ice skating)",
      "type": "activity",
      "link": "/activities/ice-skating"
    },
    {
      "name": "Cozy coffee shops",
      "type": "indoor",
      "link": "/food-drink/coffee"
    }
  ],
  "utmCampaign": "slctrips-weather-winter_cold"
}
```

---

## 📅 Workflow Schedule

**Runs automatically every 6 hours:**
- 12:00 AM
- 6:00 AM
- 12:00 PM
- 6:00 PM

**Change the schedule:**
1. Open workflow in n8n
2. Click "Every 6 Hours" node
3. Adjust interval (e.g., every 3 hours, daily at 8am, etc.)

---

## 🎯 Using the Data

### For Content Team

Query latest conditions:
```sql
SELECT 
  mode,
  content_angle,
  recommendations,
  weather->>'temp' as temp,
  weather->>'conditions' as conditions
FROM weather_alerts 
ORDER BY timestamp DESC 
LIMIT 1;
```

### For Park Director Agent (A003)

Morning briefing integration:
```typescript
// apps/dashboard/lib/ai/agent-chat.ts
const latestConditions = await supabase
  .from('weather_alerts')
  .select('*')
  .order('timestamp', { ascending: false })
  .limit(1)
  .single();

if (latestConditions.data.urgency === 'high') {
  briefing.alerts.push({
    type: 'weather',
    message: latestConditions.data.content_angle,
    recommendations: latestConditions.data.recommendations
  });
}
```

### For Social Media Posts

Use the `content_angle` directly in posts:
```typescript
// Example: Auto-generate social post
const post = {
  platform: 'tiktok',
  content: latestConditions.data.content_angle,
  cta: `Check out these spots: ${latestConditions.data.recommendations[0].name}`,
  link: `slctrips.com${latestConditions.data.recommendations[0].link}?utm_campaign=${latestConditions.data.utmCampaign}`
};
```

---

## 🔧 Customization

### Add More Locations

Currently monitors Salt Lake City. To add more:

1. Duplicate "Get SLC Weather" node
2. Change `q` parameter to new city (e.g., "Park City,US")
3. Update Conditions Router to handle multiple locations

### Add Custom Triggers

Example: Only alert on powder days >6 inches:

```javascript
// In Conditions Router node
if (conditions === 'Snow') {
  const snowAmount = weather.snow?.['1h'] || 0; // inches in last hour
  if (snowAmount > 6) {
    urgency = 'critical';
    contentAngle = '🚨 MAJOR POWDER DAY - ' + snowAmount + '" in the last hour!';
  }
}
```

### Add Notifications

**Slack Notification Node:**
1. Add "Slack" node after "High Urgency?" (true branch)
2. Configure with your Slack webhook
3. Message: `{{ $json.contentAngle }}`

**Email Notification:**
1. Add "Send Email" node
2. To: your-email@example.com
3. Subject: "🚨 Utah Conditions Alert"
4. Body: Content angle + recommendations

---

## 📈 Future Enhancements

### Phase 2: Ski-Specific Data
- Scrape Ski Utah snow reports
- Resort-specific conditions (Alta vs Snowbird vs Park City)
- Lift status, trail counts

### Phase 3: Advanced Weather
- NWS severe weather alerts
- Fire danger ratings
- Pollen counts (for allergy sufferers)
- UV index for summer

### Phase 4: Predictive Content
- "Storm coming in 3 days - prep powder content"
- "Heat wave forecast - schedule water activities posts"
- "Spring warmth - time to pivot to parks content"

### Phase 5: Multi-Location
- Moab conditions (for road trip content)
- Park City (luxury ski focus)
- Zion/Bryce (national parks)

---

## 🐛 Troubleshooting

### "Weather API not responding"
- Check `OPENWEATHER_API_KEY` in `.env`
- Verify API key is active at openweathermap.org
- Check API usage (free tier = 1000 calls/day)

### "Supabase insert fails"
- Verify `weather_alerts` table exists
- Check `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Verify Supabase project URL is correct

### "Workflow not running on schedule"
- Check if workflow is **activated** (toggle in top right)
- View workflow execution history
- Check n8n logs: `docker compose logs -f n8n`

### "AQI data missing"
- Air quality API endpoint is separate from weather
- Requires same API key
- If fails, workflow continues without AQI data

---

## 📚 Related Documentation

- [Weather Service](../../../civilization/realms/wasatchville/docs/WEATHER_SERVICE.md) - Architecture
- [February 2026 Content Execution](../../../apps/slctrips/docs/FEBRUARY_2026_CONTENT_EXECUTION.md) - Content strategy
- [Building Registry](../../../civilization/realms/wasatchville/docs/BUILDING_REGISTRY.md) - B002 weather integration
- [n8n README](../README.md) - n8n setup and patterns

---

## 🎬 Quick Reference Commands

```bash
# Check if n8n is running
docker ps | grep n8n

# View n8n logs
cd infrastructure/n8n
docker compose logs -f n8n

# Restart workflow
# In n8n UI: Deactivate → Activate

# Query latest conditions
# In Supabase SQL Editor:
SELECT * FROM weather_alerts ORDER BY timestamp DESC LIMIT 10;

# Check high urgency alerts
SELECT * FROM weather_alerts 
WHERE mode IN ('POWDER_DAY', 'EXTREME_HEAT', 'HAZARD')
ORDER BY timestamp DESC;
```

---

*Last updated: February 2, 2026*  
*Weather API: OpenWeather (free tier)*  
*Runs every: 6 hours*  
*Next enhancement: Slack notifications*
