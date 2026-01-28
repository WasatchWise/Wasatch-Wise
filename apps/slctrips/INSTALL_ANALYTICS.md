# Install Google Analytics in 2 Minutes

## Step 1: Get Your Measurement ID

1. Go to: https://analytics.google.com
2. Click **"Admin"** (gear icon bottom left)
3. Click **"Create Property"**
4. Fill in:
   - Property name: "SLC Trips"
   - Time zone: "United States - Mountain Time"
   - Currency: "USD"
5. Click **"Next"**
6. Business details:
   - Industry: "Travel & Tourism"
   - Business size: "Small"
7. Click **"Next"** → **"Create"**
8. Accept terms
9. Choose platform: **"Web"**
10. Website URL: `https://www.slctrips.com`
11. Stream name: "SLC Trips Web"
12. Click **"Create Stream"**

**Copy your Measurement ID** - It looks like: `G-XXXXXXXXXX`

---

## Step 2: Add to Your Site

### Add to `.env.local`:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # <- Replace with your ID
```

### Add to Vercel:

1. Go to: https://vercel.com/wasatch-wises-projects/slctrips-v2/settings/environment-variables
2. Add variable:
   - Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Value: `G-XXXXXXXXXX` (your ID)
   - Environments: ☑️ Production, ☑️ Preview, ☑️ Development
3. Click **"Save"**
4. Redeploy your site

---

## Step 3: Add Component to Layout

I already created the component! Just add it to your root layout:

### Edit: `src/app/layout.tsx`

```typescript
import GoogleAnalytics from '@/components/GoogleAnalytics';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />  {/* <- Add this line */}
        {children}
      </body>
    </html>
  );
}
```

---

## Step 4: Deploy & Wait

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add Google Analytics tracking"
   git push
   ```

2. **Wait for deployment** (1-2 minutes)

3. **Visit your site:** https://www.slctrips.com

4. **Check Google Analytics:** Wait 24-48 hours for data to populate

---

## Step 5: Verify It's Working

### Real-Time Test (Works Immediately!):

1. Go to Google Analytics: https://analytics.google.com
2. Click **"Reports"** → **"Realtime"**
3. Open your site in another tab: https://www.slctrips.com
4. Go back to Analytics
5. **You should see 1 active user!** (That's you!)

If you see yourself, **IT'S WORKING!** 🎉

---

## What You'll See in 24 Hours:

### Google Analytics Dashboard Will Show:

#### Users & Sessions:
- **Total Users:** Unique visitors
- **New Users:** First-time visitors
- **Sessions:** Total visits
- **Average Session Duration:** How long they stay

#### Acquisition:
- **Traffic Sources:** Where visitors come from
  - Direct (typed URL)
  - Organic Search (Google)
  - Social (Facebook, Instagram)
  - Referral (other websites)

#### Engagement:
- **Top Pages:** Which destinations are popular
- **Bounce Rate:** % who leave immediately
- **Time on Page:** How long they read

#### Demographics:
- **Countries:** Where visitors live
- **Cities:** Geographic breakdown
- **Language:** Browser language settings (for Olympics planning!)
- **Devices:** Desktop, mobile, tablet

#### Events (Custom Tracking):
- TripKit purchases
- Destination views
- Audio plays
- Map interactions

---

## Bonus: Track TripKit Sales

### Add to your checkout success page:

```typescript
import { trackEvent } from '@/components/GoogleAnalytics';

// When purchase completes:
trackEvent('purchase', {
  transaction_id: orderId,
  value: 29.99,
  currency: 'USD',
  items: [{
    item_id: tripkitId,
    item_name: tripkitName,
    price: 29.99,
    quantity: 1
  }]
});
```

This will show in Google Analytics under:
- **Monetization** → **Ecommerce Purchases**

---

## Bonus: Track Destination Views

### Add to destination pages:

```typescript
import { trackEvent } from '@/components/GoogleAnalytics';

useEffect(() => {
  trackEvent('destination_view', {
    destination_slug: slug,
    destination_name: name,
    destination_category: category
  });
}, [slug]);
```

This helps you see:
- Which destinations are most popular
- What to create multilingual audio for first
- Which TripKits to prioritize

---

## Bonus: Track Audio Plays (Olympics!)

### When someone plays Dan's audio:

```typescript
import { trackEvent } from '@/components/GoogleAnalytics';

function onAudioPlay(language: string) {
  trackEvent('audio_play', {
    type: 'dan_intro',
    language: language,
    destination: destinationSlug
  });
}
```

This shows:
- Which languages are most popular
- If multilingual audio is being used
- ROI on ElevenLabs investment

---

## 🎯 What To Check Daily:

1. **Vercel Analytics:**
   https://vercel.com/wasatch-wises-projects/slctrips-v2/analytics
   - Quick overview
   - Page views, devices

2. **Google Analytics:**
   https://analytics.google.com
   - Detailed breakdown
   - User behavior, conversions

3. **Stripe Dashboard:**
   https://dashboard.stripe.com
   - TripKit sales
   - Revenue

---

## 📊 Set Goals & Track Progress

### Week 1 Goals:
- [ ] Install analytics (this guide!)
- [ ] Get first 10 visitors
- [ ] Check which pages they visit
- [ ] Share one destination on social media

### Month 1 Goals:
- [ ] 100 unique visitors
- [ ] First TripKit sale
- [ ] Identify top 5 destinations
- [ ] Start content marketing

### Year 1 Goals:
- [ ] 10,000 visitors/month
- [ ] 100 TripKit sales
- [ ] Top 10 in "Utah travel guide" Google search
- [ ] Email list of 1,000 people

### Olympics 2034 Goals:
- [ ] 100,000 visitors/month
- [ ] Multilingual audio on top 100 destinations
- [ ] THE go-to resource for international Olympic visitors
- [ ] Featured in travel media

---

## 🚨 IMPORTANT NOTES:

### Privacy:
- Google Analytics is GDPR compliant
- Collects anonymous data (no personal info)
- Users can opt out via browser settings
- Consider adding cookie consent banner

### Cost:
- **FREE** for up to 10 million events/month
- You won't hit that limit anytime soon
- No credit card required

### Data Delay:
- **Real-time:** Shows current visitors (works immediately)
- **Standard reports:** 24-48 hour delay
- **Don't panic if it's empty on day 1!**

---

## ✅ CHECKLIST:

Installation:
- [ ] Get GA4 Measurement ID from analytics.google.com
- [ ] Add to `.env.local`
- [ ] Add to Vercel environment variables
- [ ] Add GoogleAnalytics component to layout
- [ ] Deploy to production
- [ ] Visit site and check real-time analytics

Optimization:
- [ ] Track TripKit purchases
- [ ] Track destination views
- [ ] Track audio plays
- [ ] Set up conversion goals
- [ ] Create weekly analytics review habit

---

**Time Required:** 5-10 minutes
**Cost:** FREE
**Value:** PRICELESS (you'll finally know if anyone cares!)

**Do this TODAY and come back with your numbers!** 📊
