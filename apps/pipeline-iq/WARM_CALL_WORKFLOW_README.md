# Warm Call Engine Workflow

## Overview

The Warm Call Engine is an automated post-scrape workflow that transforms high-score property leads into "warm calls" by handling the low-value repetitive explanation, allowing you to step into conversations at the exact moment of highest intent.

## Architecture

The workflow consists of 4 phases:

### Phase 1: Contextual Classification
**Trigger:** When scraper flags a high-score property (score >= 70)

**Action:** System classifies the property into one of Groove's four verticals:
- **Hospitality** → Pain points: Guest Satisfaction Scores, Wi-Fi Reliability, Review Management
- **Senior Living** → Pain points: Resident Safety, Fall Detection, Staff Efficiency
- **Multifamily/MDU** → Pain points: Amenity Fees, Smart Building/IoT, Resident Retention
- **Student/Commercial** → Pain points: Bandwidth Density, Access Control

### Phase 2: NEPQ Email Generation
**Action:** System automatically generates a draft (or sends) an NEPQ-compliant email

**Email Structure:**
1. **The Hook (Connection):** References specific scraped data (e.g., "Saw the new development on [Street Name]...")
2. **The Problem (Vendor Sprawl):** Addresses the pain of coordinating multiple vendors
3. **The Asset Link:** Includes link to "Groove in 45 Seconds" one-pager (reduces cognitive load)
4. **The Soft CTA:** Uses permissive language ("If it's worth a look...") to avoid psychological reactance

### Phase 3: Streak Signal Detection
**Action:** System monitors sent emails via Streak/SendGrid integration for engagement signals

**Logic:**
- Monitor for **Open** (primary trigger)
- Monitor for **Click** on asset link (high intent signal)
- Filter opens outside business hours (queue for 8:00 AM next business day)

### Phase 4: Warm Call Trigger
**Action:** When engagement detected during business hours, system pushes notification

**Notification Payload:**
- Prospect Name & Building
- Specific pain point used in email
- "Call Now" script with context

## Configuration

### Environment Variables

```env
# Email Sending (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
GMAIL_USER=msartain@getgrooven.com

# Warm Call Workflow
WARM_CALL_AUTO_SEND=false  # Set to 'true' to auto-send emails (default: draft mode)
GROOVE_45_SECONDS_LINK=https://getgrooven.com/groove-in-45-seconds

# Notifications (Optional)
# SMS via Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_NUMBER=+1234567890
WARM_CALL_SMS_NUMBER=+1234567890

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Internal API (for scraper to trigger workflow)
INTERNAL_API_KEY=your_internal_api_key  # Optional security
```

### Business Hours Configuration

Business hours are defined in `lib/workflows/warm-call/notification-service.ts`:
- **Monday-Friday:** 8 AM - 6 PM (local time)
- Engagements outside these hours are queued for next business day at 8:00 AM

## API Endpoints

### Trigger Workflow Manually

```bash
POST /api/workflows/warm-call/trigger
Content-Type: application/json

{
  "projectId": "uuid-of-project",
  "contactId": "uuid-of-contact",  // Optional
  "autoSend": false  // If false, generates draft only
}
```

**Response:**
```json
{
  "success": true,
  "workflow": "warm-call",
  "phases": {
    "classification": {
      "vertical": "hospitality",
      "painPoints": ["Guest Satisfaction Scores", "Wi-Fi Reliability", "Review Management"],
      "grooveBundle": "Hospitality Bundle"
    },
    "email": {
      "generated": true,
      "sent": false,
      "subject": "Quick question about [Project Name]",
      "activityId": "uuid-of-email-activity"
    }
  }
}
```

### Streak Webhook

```bash
POST /api/webhooks/streak
Content-Type: application/json
X-Streak-Signature: signature_hash
```

The webhook handler processes:
- Email opens (`emailOpened`)
- Link clicks (`emailLinkClicked`)
- Email replies (`emailReplied`)

When an open or click is detected for a warm-call workflow email, it triggers Phase 4 (notifications).

## Integration with Scraper

The workflow is automatically triggered when:
1. Scraper identifies a new property (not updated)
2. Groove fit score >= 70
3. Project is successfully inserted into database

The trigger is asynchronous and non-blocking - scrape continues even if workflow trigger fails.

## Email Template Structure

### Example Generated Email

```
Hey [FirstName],

Saw [Project Name] in [City, State] and wanted to reach out.

We specialize in simplifying technology under one roof for [Vertical] properties. Most properties we talk to are managing multiple vendors for Internet, TV, Phone, and Access - which creates coordination headaches and gaps in accountability.

Specifically for [vertical] like yours, we see the biggest pain points around [Pain Point 1], [Pain Point 2]. The challenge is that when you're coordinating between 3-4 different technology vendors, nobody truly owns the outcome.

I've put together a quick "Groove in 45 Seconds" overview that answers the most common questions we get: what we do, who we serve, and our guarantee. 

You can check it out here: [Asset Link]

This reduces the back-and-forth so you can see if we're relevant before we even talk.

If it's worth a look and you want to explore how we might help with [Project Name], I'm happy to schedule a brief conversation. No pressure - just want to make sure you have options as you're making decisions.

Best,
Mike
Groove Technologies
```

## Notification Channels

### Dashboard
Always enabled - notifications are stored in database for dashboard display.

### SMS (Twilio)
Enable by setting:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `WARM_CALL_SMS_NUMBER`

### Slack
Enable by setting:
- `SLACK_WEBHOOK_URL`

## Success Criteria

✅ **Latency:** Notification arrives within minutes of email open  
✅ **Context:** System knows exactly which vertical and pain points were pitched  
✅ **Timing:** Business hours filtering ensures calls happen at optimal times  
✅ **Outcome:** System handles "education" (email + link), you handle "diagnosis" (phone call)

## Troubleshooting

### Workflow not triggering after scrape
- Check scraper logs for errors
- Verify `NEXT_PUBLIC_APP_URL` or `VERCEL_URL` is set
- Check that projects with score >= 70 are being created
- Verify internal API key if configured

### Emails not sending
- Check `SENDGRID_API_KEY` is set
- Verify `autoSend: true` in workflow trigger
- Check SendGrid dashboard for delivery status

### Notifications not working
- Verify webhook URL is configured in Streak/SendGrid
- Check business hours logic matches your timezone
- Verify notification credentials (Twilio/Slack) are set

### Wrong vertical classification
- Review project types in database
- Check `lib/workflows/warm-call/vertical-classifier.ts` mapping
- Manually override classification in database `raw_data.vertical_classification`

## Future Enhancements

- [ ] A/B testing for email templates
- [ ] Machine learning for optimal send times
- [ ] Multi-language support
- [ ] Integration with calendar for automatic scheduling
- [ ] Analytics dashboard for workflow performance

