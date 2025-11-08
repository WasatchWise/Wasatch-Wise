# Supabase Edge Functions - Deployment Guide

This directory contains Supabase Edge Functions for The Help List.

## Functions

### send-claim-notification

Sends email notifications via SendGrid when a helper claims a request.

**Endpoint:** `https://[YOUR-PROJECT-REF].supabase.co/functions/v1/send-claim-notification`

## Prerequisites

1. **Supabase CLI** - Install from https://supabase.com/docs/guides/cli
2. **SendGrid API Key** - Already configured in `.env.local`
3. **Supabase Project** - Linked to keibifxqohdxbpmboxpj

## Setup

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref keibifxqohdxbpmboxpj
```

### 4. Set Environment Secrets

Edge Functions need access to the SendGrid API key. Set it as a secret:

```bash
supabase secrets set SENDGRID_API_KEY=<your-sendgrid-api-key>
supabase secrets set SENDGRID_FROM_EMAIL=help@thehelplist.co
```

**Note:** Get your SendGrid API key from the project's `.env.local` file or from SendGrid dashboard.

### 5. Deploy the Function

```bash
# Deploy all functions
supabase functions deploy

# Or deploy just this one
supabase functions deploy send-claim-notification
```

## Testing Locally

You can test the Edge Function locally before deploying:

```bash
# Start local Supabase (includes Edge Functions)
supabase start

# Serve the function locally
supabase functions serve send-claim-notification --env-file .env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-claim-notification' \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "test@example.com",
    "requesterName": "John Doe",
    "helperName": "Jane Helper",
    "need": "Groceries: milk, bread, eggs",
    "urgency": "today"
  }'
```

## Production Deployment

Once deployed, the Edge Function will be available at:

```
https://keibifxqohdxbpmboxpj.supabase.co/functions/v1/send-claim-notification
```

The frontend automatically detects this endpoint using the `VITE_SUPABASE_URL` environment variable.

## How It Works

1. **Frontend calls Edge Function** when a request is claimed
2. **Edge Function validates** the request data
3. **SendGrid API sends** the email with HTML template
4. **Response** returns success/failure to frontend
5. **Frontend falls back** to mailto: link if Edge Function fails

## Monitoring

View function logs in the Supabase Dashboard:

1. Go to https://supabase.com/dashboard/project/keibifxqohdxbpmboxpj
2. Navigate to Edge Functions
3. Select `send-claim-notification`
4. View logs and metrics

## Troubleshooting

**Function not deploying?**
- Ensure Supabase CLI is up to date: `supabase update`
- Check you're logged in: `supabase login`
- Verify project link: `supabase projects list`

**Emails not sending?**
- Check SendGrid API key is set: `supabase secrets list`
- Verify SendGrid account has email verified
- Check function logs for errors

**CORS errors?**
- Edge Function includes CORS headers for all origins
- If issues persist, check Supabase project CORS settings

## Cost Considerations

- **Supabase Edge Functions:** 500K invocations/month free
- **SendGrid:** 100 emails/day free tier
- For higher volumes, upgrade SendGrid plan

## Alternative: Database Triggers

For automated notifications without frontend calls, you could use Supabase Database Triggers:

```sql
-- Example: Auto-send email when request is claimed
CREATE OR REPLACE FUNCTION notify_requester_on_claim()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function via pg_net extension
  PERFORM net.http_post(
    url := 'https://keibifxqohdxbpmboxpj.supabase.co/functions/v1/send-claim-notification',
    body := jsonb_build_object(
      'to', NEW.contact_info,
      'requesterName', NEW.requester_display_name,
      'helperName', NEW.helper_display_name,
      'need', NEW.need,
      'urgency', NEW.urgency_level
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_request_claimed
  AFTER UPDATE ON requests
  FOR EACH ROW
  WHEN (OLD.status = 'active' AND NEW.status = 'claimed')
  EXECUTE FUNCTION notify_requester_on_claim();
```

This would make notifications fully automatic without requiring frontend action.
