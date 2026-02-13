import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Store in Supabase
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: dbError } = await supabase
        .from('email_captures')
        .upsert(
          {
            email: email.toLowerCase().trim(),
            source: source || 'newsletter',
            captured_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );

      if (dbError) {
        console.error('Supabase email capture error:', dbError);
      }
    }

    // Trigger N8N webhook for lead routing (non-blocking)
    const webhookUrl = process.env.LEAD_ROUTER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
          type: 'email_capture',
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => {
        console.error('N8N webhook error:', err);
      });
    }

    // Send welcome email via Resend (non-blocking)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WasatchWise <hello@wasatchwise.com>',
          to: email,
          subject: 'Welcome to WasatchWise — Your First AI Governance Resource',
          html: getWelcomeEmailHtml(),
        }),
      }).catch((err) => {
        console.error('Resend welcome email error:', err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture email' },
      { status: 500 }
    );
  }
}

function getWelcomeEmailHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#111827;font-size:24px;margin:0 0 8px;">Welcome to WasatchWise</h1>
        <p style="color:#6b7280;font-size:16px;margin:0;">AI Governance That Actually Works</p>
      </div>

      <p style="color:#374151;font-size:16px;line-height:1.6;">
        Thanks for joining. You're now part of a growing community of school leaders
        who are taking AI governance seriously — without the paralysis.
      </p>

      <p style="color:#374151;font-size:16px;line-height:1.6;">
        Here's what you'll get from us:
      </p>

      <ul style="color:#374151;font-size:16px;line-height:1.8;padding-left:20px;">
        <li>Weekly practical AI governance insights (no fluff)</li>
        <li>Policy templates and checklists you can use immediately</li>
        <li>Updates on FERPA, AI compliance, and what other districts are doing</li>
      </ul>

      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:24px;margin:24px 0;">
        <p style="color:#9a3412;font-size:16px;font-weight:600;margin:0 0 8px;">
          Your First Resource: AI Readiness Quiz
        </p>
        <p style="color:#c2410c;font-size:14px;margin:0 0 16px;">
          Take 2 minutes to assess your district's AI readiness. You'll get a personalized
          score and actionable next steps.
        </p>
        <a href="https://www.wasatchwise.com/tools/ai-readiness-quiz"
           style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Take the Free Quiz →
        </a>
      </div>

      <p style="color:#374151;font-size:16px;line-height:1.6;">
        Have a question about AI governance? Reply to this email — I read every one.
      </p>

      <p style="color:#374151;font-size:16px;line-height:1.6;">
        — John Lyman<br>
        <span style="color:#6b7280;">Founder, WasatchWise</span><br>
        <span style="color:#6b7280;">Former Utah State Student Data Privacy Lead</span>
      </p>
    </div>

    <div style="text-align:center;margin-top:24px;">
      <p style="color:#9ca3af;font-size:12px;">
        WasatchWise · AI Governance for K-12 Districts<br>
        <a href="https://www.wasatchwise.com" style="color:#9ca3af;">wasatchwise.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
