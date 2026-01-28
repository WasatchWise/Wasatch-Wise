# Mobile PWA Setup Instructions

## Quick Start

1. **Deploy your app** to a public URL (Vercel, Netlify, etc.)
2. **Open on iPhone Safari** (not Chrome - Chrome doesn't support PWA install on iOS)
3. **Tap Share button** → **"Add to Home Screen"**
4. **Done!** App is now installed

## Required Files

### Icons Needed

Create these icon files in `/public`:

- `icon-192.png` - 192x192px (Android)
- `icon-512.png` - 512x512px (Android)
- `apple-touch-icon.png` - 180x180px (iPhone)

### Manifest

✅ Already created: `/app/manifest.ts` and `/public/manifest.json`

### Service Worker

✅ Already created: `/public/sw.js`

## Testing on iPhone

1. Open Safari on iPhone
2. Navigate to your app URL
3. Look for "Add to Home Screen" prompt (or use Share menu)
4. Install the app
5. Open from home screen
6. Should launch in standalone mode (no browser UI)

## Features Enabled

- ✅ Standalone display mode
- ✅ Offline caching
- ✅ Home screen icon
- ✅ Splash screen
- ✅ Install prompt
- ✅ Service worker registration

## Troubleshooting

### App doesn't install
- Make sure you're using Safari (not Chrome)
- Check that manifest.json is accessible
- Verify HTTPS is enabled (required for PWA)

### Icons not showing
- Check file paths in manifest
- Verify icon files exist in /public
- Clear browser cache

### Service worker not registering
- Check browser console for errors
- Verify sw.js is accessible at /sw.js
- Check HTTPS requirement

## Next Steps

1. Create actual icon files (use a design tool)
2. Test on real iPhone device
3. Monitor service worker in browser DevTools
4. Test offline functionality

