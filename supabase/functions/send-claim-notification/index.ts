import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')!
const FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') || 'help@thehelplist.co'

interface NotificationRequest {
  to: string
  requesterName: string
  helperName: string
  need: string
  urgency: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { to, requesterName, helperName, need, urgency }: NotificationRequest = await req.json()

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: '✅ Your Help List request has been claimed!',
          },
        ],
        from: {
          email: FROM_EMAIL,
          name: 'The Help List',
        },
        content: [
          {
            type: 'text/plain',
            value: `Hi ${requesterName},

Good news! Your request on The Help List has been claimed by ${helperName}.

REQUEST DETAILS:
${need}

URGENCY: ${urgency.charAt(0).toUpperCase() + urgency.slice(1).replace('_', ' ')}

WHAT'S NEXT:
${helperName} will reach out to you shortly to coordinate shopping and delivery details. Please have your payment method ready (Venmo, Zelle, Cash App, or cash).

NEED HELP?
If you don't hear from your helper within a few hours, you can view your request status at thehelplist.co or contact us at help@thehelplist.co.

Thank you for using The Help List!
🤝 Neighbors helping neighbors`,
          },
          {
            type: 'text/html',
            value: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6C5CE7 0%, #8B7FE8 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🤝 The Help List</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Neighbors helping neighbors</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
    <div style="background: #D1FAE5; border-left: 4px solid #10B981; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 8px 0; color: #047857; font-size: 20px;">✅ Good News!</h2>
      <p style="margin: 0; color: #065F46;">Your request has been claimed by <strong>${helperName}</strong></p>
    </div>

    <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Request Details:</h3>
      <p style="margin: 0; color: #4B5563;">${need}</p>
      <p style="margin: 12px 0 0 0; color: #6B7280; font-size: 14px;">
        <strong>Urgency:</strong> ${urgency.charAt(0).toUpperCase() + urgency.slice(1).replace('_', ' ')}
      </p>
    </div>

    <div style="margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 18px;">What's Next:</h3>
      <p style="margin: 0 0 12px 0; color: #4B5563;">
        ${helperName} will reach out to you shortly to coordinate shopping and delivery details.
      </p>
      <p style="margin: 0; color: #4B5563;">
        Please have your payment method ready:
      </p>
      <ul style="color: #4B5563; margin: 8px 0;">
        <li>Venmo, Zelle, or Cash App</li>
        <li>Cash on delivery</li>
        <li>Or they might cover it as a gift</li>
      </ul>
    </div>

    <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; color: #92400E; font-size: 14px;">
        <strong>Need Help?</strong> If you don't hear from your helper within a few hours,
        <a href="https://thehelplist.co" style="color: #6C5CE7;">check your request status</a>
        or contact us at <a href="mailto:help@thehelplist.co" style="color: #6C5CE7;">help@thehelplist.co</a>
      </p>
    </div>

    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #E5E7EB;">
      <a href="https://thehelplist.co" style="display: inline-block; background: #6C5CE7; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        View Your Requests
      </a>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
    <p>You're receiving this because you submitted a request on The Help List.</p>
    <p>© 2025 The Help List. Privacy-first neighbor-to-neighbor help.</p>
  </div>
</body>
</html>`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SendGrid API error: ${errorText}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
