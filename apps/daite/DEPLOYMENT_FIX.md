# Vercel Deployment Troubleshooting

## Issue: Automatic deployment not triggering

### Quick Fix Options

#### Option 1: Trigger via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find your DAiTE project
3. Click "Deployments" tab
4. Click "Redeploy" on the latest deployment
5. Or click "Create Deployment" to trigger a new one

#### Option 2: Use Vercel CLI
```bash
cd frontend
vercel --prod
```

#### Option 3: Check GitHub Integration
1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Verify:
   - ✅ Repository is connected
   - ✅ Production Branch is set to `main`
   - ✅ Auto-deploy is enabled

#### Option 4: Force push (triggers webhook)
```bash
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

### Common Issues

**Issue**: GitHub webhook not firing
- **Fix**: Reconnect GitHub in Vercel Settings → Git → Disconnect and reconnect

**Issue**: Root directory mismatch
- **Current**: Vercel should be set to `frontend/` as Root Directory
- **Check**: Vercel Dashboard → Settings → General → Root Directory

**Issue**: Build command failing
- **Current**: Should auto-detect Next.js
- **Check**: Vercel Dashboard → Settings → General → Build & Development Settings

### Current Configuration

- **Root Directory**: `frontend` (no trailing slash)
- **Framework**: Next.js (auto-detected)
- **Build Command**: Auto (Next.js default: `next build`)
- **Output Directory**: `.next` (Next.js default)

### Verification Checklist

- [ ] GitHub repo connected in Vercel
- [ ] Root Directory set to `frontend`
- [ ] Production branch is `main`
- [ ] Auto-deploy enabled
- [ ] Environment variables set
- [ ] Domain configured (daiteapp.com)
