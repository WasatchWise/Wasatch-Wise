# Email Not Receiving Fix

## Issue
You received an email initially, but now sign-ups aren't getting confirmation emails.

## Quick Checks

### 1. Supabase Email Provider Settings
Go to: https://app.supabase.com → Your Project → Authentication → Notifications → Email

**Check:**
- ✅ Email provider is enabled
- ✅ "Confirm email" is toggled ON (if you want email confirmation)
- ✅ Email template is configured correctly

### 2. Email Rate Limiting
Supabase has rate limits on emails:
- **Free tier**: Limited emails per hour
- **Check**: Authentication → Rate Limits in Supabase dashboard

**If you've hit the limit:**
- Wait an hour, or
- Upgrade your Supabase plan

### 3. Email Already Sent
If you try to sign up with an email that already exists:
- Supabase won't send another email immediately
- **Solution**: Use the "Resend confirmation email" button (now added to sign-in page)

### 4. Check Spam Folder
- Confirmation emails sometimes go to spam
- Check "Promotions" tab in Gmail
- Check spam/junk folder

### 5. Email Provider Issues
Check Supabase logs:
1. Go to Supabase Dashboard → Logs → Auth Logs
2. Look for email delivery errors
3. Check for rate limit warnings

## New Feature Added

I've added a **"Resend confirmation email"** button on the sign-in page:
- Enter your email address
- Click "Resend confirmation email"
- Check your inbox again

## Common Causes

1. **Rate limiting** - Too many sign-up attempts
2. **Email already confirmed** - Account exists but password forgotten
3. **Spam filter** - Email delivered but filtered
4. **Wrong email address** - Typo in email entry
5. **Supabase email service issue** - Temporary outage

## Debug Steps

1. **Try a different email address** - Test if it's email-specific
2. **Check Supabase logs** - Authentication → Audit Logs
3. **Verify email in Supabase** - Authentication → Users → Check if user exists
4. **Check email settings** - Authentication → Notifications → Email

## If Still Not Working

1. Check Supabase project status (not paused)
2. Verify email provider is active
3. Try disabling email confirmation temporarily (for testing)
4. Check if there are errors in browser console when signing up
5. Verify environment variables are correct

## Code Changes Made

✅ Added "Resend confirmation email" functionality
✅ Improved error messages to show what went wrong
✅ Better logging in browser console for debugging

Try signing up again, and if you don't receive an email, use the "Resend confirmation email" button on the sign-in page.

