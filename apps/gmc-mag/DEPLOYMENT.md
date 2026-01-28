# Deployment Guide - General Magnesium Corporation Digital Deal Room

## Quick Deploy to Vercel

Your project is already configured for Vercel deployment. Here are the steps:

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Digital Deal Room - JPMC Pitch Site"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in and click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the Vite configuration
   - Click "Deploy"

3. **Environment Variables** (if needed):
   - In Vercel project settings, add `GEMINI_API_KEY` if you're using the AI features
   - The build will work without it for the main site

### Option 2: Deploy via Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm build settings (already configured in `vercel.json`)

### Option 3: Build Locally First

If you want to test the build locally:

1. **Temporarily rename .env.local** (to avoid permission issues):
   ```bash
   mv .env.local .env.local.backup
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Preview the build**:
   ```bash
   npm run preview
   ```

4. **Restore .env.local**:
   ```bash
   mv .env.local.backup .env.local
   ```

## Post-Deployment Checklist

- [ ] Verify the site loads correctly
- [ ] Test video player placeholders (replace with actual video embeds)
- [ ] Verify PDF download link works (check path: `/GMC/2025.12.25 GMC Presentation GMC Presentation with JFB Edits (1) JGV Edits (2).pdf`)
- [ ] Test mobile responsiveness
- [ ] Verify sticky compliance footer displays correctly
- [ ] Check that all sections are accessible
- [ ] Test contact information links (phone and email)

## Important Notes

1. **Video Embeds**: The video player placeholders need to be replaced with actual embedded videos. Update the video section in `App.tsx` with your video URLs.

2. **PDF Path**: Ensure the PDF file path in the download button matches your actual file location in the `public` or `GMC` folder.

3. **Analytics**: Consider adding analytics tracking (Google Analytics, Vercel Analytics, etc.) to track PDF downloads and video views.

4. **Custom Domain**: After deployment, you can add a custom domain in Vercel project settings.

## Troubleshooting

- **Build Errors**: Check Vercel build logs in the dashboard
- **Missing Assets**: Ensure all images in `/public` folder are committed
- **Environment Variables**: Add any required env vars in Vercel project settings

## Next Steps After Deployment

1. Share the deployment URL with Jordi and Fred
2. Test the PDF download tracking
3. Replace video placeholders with actual embeds
4. Monitor analytics for JPMC team access
