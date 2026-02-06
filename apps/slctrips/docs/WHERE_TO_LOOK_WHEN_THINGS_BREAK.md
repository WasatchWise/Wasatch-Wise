# Where to Look When Things Break — SLC Trips

**You don’t have to wait for customers to email.** Use these in order when something might be wrong.

---

## 1. Sentry (first place to check)

**What it catches:** Unhandled errors, React crashes, API route failures, and explicit captures (e.g. Stripe payment failed, webhook fulfillment errors).

**Where:** https://sentry.io/organizations/wasatch-wise-llc/

**What to do:** Open the project for SLC Trips → **Issues**. New errors show up within seconds. You’ll see stack traces, request context, and tags (e.g. `component: stripe-webhook-fulfillment`).

**Requires:** `NEXT_PUBLIC_SENTRY_DSN` (and/or `SENTRY_DSN`) set in production. If those aren’t set, Sentry won’t receive events.

---

## 2. Stripe Dashboard (payments & webhooks)

**What it shows:** Whether Stripe received a payment, whether webhooks were sent, and whether your endpoint returned success or failure.

**Where:** https://dashboard.stripe.com  
→ **Developers** → **Webhooks** → select your endpoint (e.g. `https://www.slctrips.com/api/webhooks/stripe`).

**What to do:**
- **Webhook deliveries:** Click a delivery → see request/response and status code. Red = failure (e.g. 500); you can resend for testing.
- **Payments:** **Payments** tab shows successful and failed payments. Failed payments don’t mean your code failed; they mean the card/processor failed. For “customer paid but didn’t get access,” check webhook deliveries.

**No code needed** — this is Stripe’s log of what they sent and what your app returned.

---

## 3. Vercel (server logs)

**What it shows:** `console.error`, `console.warn`, and uncaught logs from API routes and server code (including Stripe create-checkout and webhooks).

**Where:** Vercel project → **Logs** (or **Functions** → select a function → **Logs**). Filter by time range and search for `[Stripe`, `Webhook`, `Error`, etc.

**What to do:** When Sentry shows an error from an API route, open the same time window in Vercel logs to see the full `console.error` output and any request IDs.

---

## 4. Customer email (last resort)

If nothing shows up in Sentry, Stripe, or Vercel, then yes — you may hear it first from a customer. Encourage a short “Report a problem” or support link so you get a screenshot or URL; that plus the time of the issue helps you search Sentry/Vercel/Stripe by time.

---

## Quick reference

| Symptom | Check first | Then |
|--------|-------------|------|
| “Payment didn’t go through” | Stripe → Payments | Stripe → Webhooks (did we get the event?) |
| “I paid but can’t access my TripKit” | Stripe → Webhooks (did fulfillment succeed?) | Sentry (webhook fulfillment errors) |
| “Site is broken / white screen” | Sentry → Issues | Vercel → Logs |
| “Checkout button does nothing” | Sentry (create-checkout errors) | Vercel Logs for `[Stripe Checkout]` |

---

## How HQ gets notified (Wasatch Wise headquarters)

**Right now:** Headquarters finds out when something is wrong at the amusement park (B002 / SLC Trips) only by **checking** Sentry, Stripe, or Vercel — or when a customer emails. There is no automatic push to HQ.

**To get notified automatically** (so HQ doesn’t have to remember to check):

### 1. Sentry Alerts (recommended first step)

Sentry can **push** when new errors happen: email and/or Slack.

1. Go to **Sentry** → https://sentry.io/organizations/wasatch-wise-llc/
2. Open the **SLC Trips** project.
3. **Alerts** → **Create Alert** (or **Alert Rules**).
4. Create an **Issue Alert**:
   - **When:** “A new issue is created” (or “The issue is seen more than X times in 1 hour” for noise reduction).
   - **Then:** Add action → **Send a notification** → choose **Email** (e.g. team@wasatchwise.com or specific people) and/or **Slack** (e.g. #slctrips-ops or #b002-alerts).
5. Save. From then on, when something breaks at SLC Trips, HQ gets an email or Slack message with a link to the issue.

**Slack:** If you use Slack, connect Sentry to your workspace (Sentry → **Settings** → **Integrations** → **Slack**), then pick the channel in the alert rule.

### 2. Optional: Stripe failures → Slack

For “payment failed” or “webhook failed” to show up in Slack without opening Stripe: use **Stripe webhooks** (e.g. `charge.failed`, or failed webhook delivery) to trigger an n8n workflow or a small serverless function that posts to a Slack channel. This is optional; Sentry already captures webhook fulfillment errors, and Stripe Dashboard shows delivery status.

### Summary

| Who        | How they know something is wrong at B002 |
|-----------|------------------------------------------|
| **Today** | Check Sentry / Stripe / Vercel, or wait for customer email. |
| **After Sentry Alerts** | Email and/or Slack when a new issue is created (or threshold hit). |

Set up **one** Sentry alert (“new issue” → email or Slack) and HQ will know when the amusement park has a problem without having to remember to check dashboards.

---

*Stripe fulfillment webhook now sends errors to Sentry (`component: stripe-webhook-fulfillment`), so payment-path failures will show up in Sentry as well as in Stripe and Vercel.*
