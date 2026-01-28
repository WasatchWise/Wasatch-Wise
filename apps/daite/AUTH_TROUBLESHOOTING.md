# Authentication Troubleshooting Guide

## Common Issues & Solutions

### 1. Sign Up Issues

#### Problem: "Error: User already registered"
- **Solution**: Try signing in instead, or use password reset

#### Problem: "Email not confirmed"
- **Solution**: Check your email inbox (and spam folder) for confirmation link
- The confirmation email might take a few minutes to arrive
- Click the link in the email to confirm your account

#### Problem: "Invalid email or password"
- **Solution**: 
  - Verify email is typed correctly (case doesn't matter)
  - Check password meets requirements (minimum 6 characters)
  - If you just signed up, make sure you confirmed your email first

#### Problem: No error message, but sign up doesn't work
- **Check**: Browser console for errors (F12 → Console tab)
- **Check**: Network tab to see if Supabase API calls are failing
- **Verify**: Supabase environment variables are set correctly in Vercel

### 2. HTTPS Issues on Different Chrome Profiles

#### Problem: Site shows as "Not Secure" or HTTPS errors
- **Solution**: 
  1. Clear browser cache and cookies
  2. Check if the URL starts with `https://` (not `http://`)
  3. Try incognito mode to test without extensions
  4. Check browser extensions that might interfere (ad blockers, privacy tools)

#### Problem: Mixed content warnings
- **Cause**: Site loads HTTP resources on HTTPS page
- **Solution**: All resources (Supabase API, images, etc.) must use HTTPS
- **Check**: Browser console for "Mixed Content" warnings

#### Problem: CORS errors in console
- **Check**: Supabase dashboard → Settings → API → CORS configuration
- **Solution**: Add your domain to allowed origins:
  - `https://www.daiteapp.com`
  - `https://daiteapp.com`
  - `http://localhost:3000` (for development)

### 3. Email Confirmation Not Working

#### Problem: Email link redirects to wrong URL
- **Check**: Supabase Dashboard → Authentication → URL Configuration
- **Set Site URL**: `https://www.daiteapp.com`
- **Add Redirect URLs**:
  - `https://www.daiteapp.com/auth/callback`
  - `https://www.daiteapp.com/**`

#### Problem: Email confirmation link expired
- **Solution**: Request a new confirmation email
- **Or**: Sign up again with the same email

### 4. Supabase Configuration Issues

#### Verify Environment Variables (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check these are set for **Production**:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://{project-ref}.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key - JWT format)
   - `NEXT_PUBLIC_SITE_URL` = `https://www.daiteapp.com`

#### Verify Supabase Project Settings
1. Go to https://app.supabase.com → Your Project
2. **Authentication** → **URL Configuration**:
   - Site URL: `https://www.daiteapp.com`
   - Redirect URLs: Add your callback URL
3. **Authentication** → **Providers**:
   - Email provider should be enabled
   - Confirm email setting: Check your preference

### 5. Debugging Steps

1. **Check Browser Console** (F12)
   - Look for red error messages
   - Check Network tab for failed requests

2. **Test Supabase Connection**:
   ```javascript
   // In browser console on your site:
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

3. **Check Network Requests**:
   - Open DevTools → Network tab
   - Try signing up
   - Look for requests to `*.supabase.co`
   - Check if they return 200 OK or errors

4. **Verify SSL Certificate**:
   - Your domain should have a valid SSL certificate
   - Vercel provides this automatically
   - Check: https://www.ssllabs.com/ssltest/

### 6. Quick Fixes

**If nothing works:**
1. Clear all browser data (cache, cookies, local storage)
2. Try a different browser
3. Try incognito/private mode
4. Check if Supabase project is active (not paused)
5. Verify Vercel deployment is successful
6. Check Supabase project logs for errors

## Getting Help

If issues persist:
1. Check browser console for specific error messages
2. Check Supabase dashboard → Logs → Auth Logs
3. Verify all environment variables are set correctly
4. Test with a fresh browser profile or incognito mode

