# Make.com Webhook Setup Guide

## ✅ Webhook URL
```
https://hook.us2.make.com/xnxhhnwi92fukseytf8wyp8e71ggfk
```

## 📋 Setup Steps

### Step 1: Add Environment Variable to Vercel

1. Go to: https://vercel.com/wasatch-wises-projects/wasatchwise/settings/environment-variables
2. Click **"Add New"**
3. Fill in:
   - **Key**: `MAKE_WEBHOOK_URL`
   - **Value**: `https://hook.us2.make.com/xnxhhnwi92fukseytf8wyp8e71ggfk`
   - **Environment**: Check **"Production"** (and **"Preview"** if you want)
4. Click **"Save"**
5. **Redeploy**: Go to Deployments tab → Click the "..." menu on the latest deployment → **"Redeploy"**

### Step 2: Complete Make.com Scenario

The webhook is currently just listening. You need to add actions to process the data:

#### Add SendGrid Email Action:

1. In Make.com, find your webhook module
2. Click the **"+"** button after the webhook module
3. Search for **"SendGrid"**
4. Choose **"Send an Email"**
5. Connect your SendGrid account (API key from SendGrid Settings → API Keys)
6. Configure the email:
   - **To**: Map `1. email` from webhook data
   - **From**: `admin@wasatchwise.com` (or your verified sender)
   - **Subject**: `Your AI Readiness Results - WasatchWise`
   - **Content**: Customize your message
7. Turn the scenario **ON** (toggle at bottom)
8. Click **"Save scenario"**

## 🧪 Testing

1. Go to: https://www.wasatchwise.com/tools/ai-readiness-quiz
2. Fill out the quiz with test data
3. Submit it
4. Check:
   - **Make.com**: Should show a new "Run" in the scenario
   - **Your email**: Should receive the automated email
   - **Supabase**: Quiz result should be saved in `quiz_results` table

## 📊 Data Sent to Webhook

When someone completes the quiz, the following data is sent to Make.com:

```json
{
  "email": "user@example.com",
  "name": "School District Name",
  "organization": "School District Name",
  "role": "Superintendent",
  "score": 75,
  "tier": "green",
  "source": "ai_readiness_quiz"
}
```

## 🔍 Troubleshooting

### Webhook not receiving data?
- Check Vercel environment variable is set correctly
- Verify the webhook URL matches exactly
- Check Vercel function logs for errors
- Ensure you redeployed after adding the environment variable

### Email not sending?
- Verify SendGrid API key is correct
- Check SendGrid sender is verified
- Look at Make.com scenario execution logs
- Ensure scenario is turned ON

### Quiz still works but webhook doesn't?
- The quiz will always work - webhook failures don't block submission
- Check server logs in Vercel for webhook errors
- Verify the environment variable name is exactly `MAKE_WEBHOOK_URL`

## ✅ Status Checklist

- [ ] Environment variable added to Vercel
- [ ] Vercel deployment redeployed
- [ ] Make.com scenario has SendGrid action added
- [ ] Make.com scenario is turned ON
- [ ] Test quiz submission completed
- [ ] Verified webhook receives data in Make.com
- [ ] Verified email is sent successfully
