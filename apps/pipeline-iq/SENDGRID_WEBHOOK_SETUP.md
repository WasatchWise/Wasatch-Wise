# SendGrid Webhook Setup Guide

## The Problem
Your emails ARE being opened (60% open rate!) but the open/click events aren't being logged to your database because the SendGrid Event Webhook isn't configured.

## Your Webhook Endpoint
```
https://pipelineiq.net/api/webhooks/sendgrid
```

Or if using Vercel preview:
```
https://your-app.vercel.app/api/webhooks/sendgrid
```

## Setup Steps in SendGrid

### 1. Go to Event Webhook Settings
1. Log into SendGrid: https://app.sendgrid.com
2. Navigate to: **Settings** → **Mail Settings** → **Event Webhook**
3. Click **Edit** (pencil icon)

### 2. Configure the Webhook
- **HTTP Post URL:** `https://pipelineiq.net/api/webhooks/sendgrid`
- **Actions to POST:**
  - ✅ Opened
  - ✅ Clicked
  - ✅ Delivered (optional, for tracking)
  - ✅ Bounced (important for list hygiene)
  - ✅ Spam Reports (important)
  - ❌ Other events (optional)

### 3. Enable the Webhook
- Toggle **Event Webhook Status** to **ON**
- Click **Save**

### 4. Test the Webhook
1. Click **Test Your Integration** in SendGrid
2. Check your Vercel logs for incoming webhook events:
   ```
   📨 SendGrid webhook: received X events
   ```

## Optional: Signed Event Webhooks (Recommended for Production)

For added security, enable signed webhooks:

1. In SendGrid, go to **Settings** → **Mail Settings** → **Event Webhook**
2. Enable **Signed Event Webhook**
3. Copy the **Verification Key**
4. Add to your `.env.local` and Vercel:
   ```
   SENDGRID_WEBHOOK_PUBLIC_KEY=your_verification_key_here
   ```

## Verify It's Working

After setup, send a test email and open it. Then check:

1. **Vercel Logs:** Look for `👁️ Email Opened!` messages
2. **Database:** Query `outreach_activities` for `status = 'opened'`

```sql
SELECT id, subject, status, opened_at 
FROM outreach_activities 
WHERE status IN ('opened', 'clicked')
ORDER BY opened_at DESC
LIMIT 10;
```

## Troubleshooting

### Webhook not receiving events
- Verify the URL is publicly accessible (not localhost)
- Check Vercel function logs for errors
- Ensure the webhook is enabled in SendGrid

### Events received but not updating database
- Check if `queue_id` is being passed in `customArgs` when sending
- Verify the JSONB lookup query is working
- Check Supabase RLS policies on `outreach_activities`

### Signature verification failing
- Remove `SENDGRID_WEBHOOK_PUBLIC_KEY` temporarily to test without signatures
- Verify the key matches what's in SendGrid

## Current Webhook Handler
Located at: `app/api/webhooks/sendgrid/route.ts`

Handles:
- Email opens → Updates `outreach_activities.status` to 'opened'
- Email clicks → Updates `outreach_activities.status` to 'clicked'
- Triggers warm call notifications when engagement detected
