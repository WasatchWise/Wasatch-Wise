# Groove in 45 Seconds - Setup Guide

## ✅ What Was Created

### 1. Dynamic Landing Page
**URL:** `/groove-in-45-seconds`

- **4 Vertical-Specific Versions:**
  - `?vertical=hospitality` - For hotels
  - `?vertical=senior_living` - For senior living facilities
  - `?vertical=multifamily` - For apartments/multifamily
  - `?vertical=student_commercial` - For student housing and commercial
  - Default (no param) - General version

### 2. Features Included

✅ **Vertical-Specific Content:**
- Pain points tailored to each vertical
- Solutions addressing vertical-specific challenges
- Key benefits with icons
- Industry-specific stats

✅ **Dynamic Images:**
- API endpoint: `/api/groove/images?vertical=hospitality`
- Returns hero images, icons, and gallery photos
- Currently using Unsplash placeholders (easily replaceable)

✅ **The Groove Guarantee:**
- Prominently displayed
- On Time, On Scope, On Budget, On Going
- $500 make-good promise

✅ **Mobile-Responsive:**
- Works perfectly on all devices
- Clean, professional design

## Configuration

### Environment Variable

**Optional - defaults to PipelineIQ domain**

By default, the link uses your PipelineIQ deployment URL (e.g., `https://your-app.vercel.app/groove-in-45-seconds`).

To use a custom domain, set in `.env.local` and Vercel:

```env
GROOVE_45_SECONDS_LINK=https://your-custom-domain.com/groove-in-45-seconds
```

**Note:** The workflow automatically appends `?vertical=xxx` based on the property classification, so prospects see the relevant version. The page is hosted on PipelineIQ (your app), not Groove's domain.

## How It Works

### 1. Email Generation
When the warm call workflow generates an email:
- Classifies property into a vertical
- Generates vertical-specific link: `https://getgrooven.com/groove-in-45-seconds?vertical=hospitality`
- Includes link in email

### 2. Landing Page
When prospect clicks:
- Page detects `?vertical=hospitality` parameter
- Shows hospitality-specific content
- Displays relevant pain points, solutions, and benefits
- Includes The Groove Guarantee

### 3. Images API
The page can fetch images via:
```
GET /api/groove/images?vertical=hospitality
```

Currently returns Unsplash placeholder URLs. **Replace these with your actual property photos** by updating `app/api/groove/images/route.ts`.

## Customization

### Replace Placeholder Images

1. **Option 1: Update API Route**
   Edit `app/api/groove/images/route.ts` and replace Unsplash URLs with your actual image URLs (S3, CDN, etc.)

2. **Option 2: Use Your Own Images**
   - Upload images to `/public/images/groove/`
   - Reference as `/images/groove/hospitality-hero.jpg`
   - Update API route to return these paths

### Update Content

Edit `components/groove/Groove45PageContent.tsx`:
- Modify `VERTICAL_CONTENT` object
- Update pain points, solutions, benefits
- Adjust stats and messaging

### Add More Verticals

1. Add to `VERTICAL_CONTENT` object
2. Add to vertical mapping in `lib/workflows/warm-call/vertical-classifier.ts`
3. Add images to API route

## Testing

### Test Different Versions:

```
http://localhost:3000/groove-in-45-seconds
http://localhost:3000/groove-in-45-seconds?vertical=hospitality
http://localhost:3000/groove-in-45-seconds?vertical=senior_living
http://localhost:3000/groove-in-45-seconds?vertical=multifamily
http://localhost:3000/groove-in-45-seconds?vertical=student_commercial
```

### Test Image API:

```
http://localhost:3000/api/groove/images?vertical=hospitality
```

## Next Steps

1. ✅ **Configure Domain** (Optional) - The page defaults to your PipelineIQ Vercel URL. If you want a custom domain, set `GROOVE_45_SECONDS_LINK` in Vercel.
2. 📸 **Replace Placeholder Images** with actual Groove property photos
3. ✏️ **Review Content** - Make sure messaging matches Groove's brand voice
4. 🎨 **Customize Design** - Adjust colors, fonts, layout if needed
5. 🧪 **Test Workflow** - Trigger warm call workflow and verify link works

**Important:** The page is hosted on PipelineIQ's domain (your app), not Groove's website. This is intentional since you don't control Groove's domain.

## Files Created

- `app/(public)/groove-in-45-seconds/page.tsx` - Main page route
- `components/groove/Groove45PageContent.tsx` - Page component with all content
- `app/api/groove/images/route.ts` - Image API endpoint
- `components/ui/badge.tsx` - Badge component (if missing)

## Files Modified

- `lib/workflows/warm-call/nepq-email-generator.ts` - Now generates vertical-specific links
- `lib/workflows/warm-call/vertical-classifier.ts` - Added `grooveVertical` field for URL mapping

## Example Email Link

When a hotel property triggers the workflow:
```
Hey Mike,

...email content...

You can check it out here: 
https://your-pipelineiq-app.vercel.app/groove-in-45-seconds?vertical=hospitality

...
```

The link automatically shows the hospitality version with hotel-specific content! The page is hosted on PipelineIQ (your app), not Groove's domain.

