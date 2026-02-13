import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  districtName: z.string().min(1, 'District name is required'),
  role: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { name, email, districtName, role } = parsed.data;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('email_captures').insert({
      email: email.toLowerCase().trim(),
      name,
      organization: districtName,
      role: role || null,
      source: 'daros-lead',
      lead_magnet: 'DAROS Briefing Proposal',
    });

    const webhookUrl = process.env.LEAD_ROUTER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          districtName,
          role,
          source: 'daros-lead',
          type: 'daros_lead',
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error('[DAROS lead] N8N webhook error:', err));
    }

    const proposalPdfUrl =
      process.env.DAROS_PROPOSAL_PDF_URL ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wasatchwise.com'}/downloads/daros/WasatchWise_DAROS_Briefing_Proposal.pdf`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'WasatchWise <hello@wasatchwise.com>',
        to: email,
        subject: 'Your DAROS Briefing Proposal',
        html: getDarosProposalEmailHtml(name, proposalPdfUrl),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DAROS lead-capture]', error);
    return NextResponse.json(
      { error: 'Failed to submit. Please try again or email admin@wasatchwise.com.' },
      { status: 500 }
    );
  }
}

function getDarosProposalEmailHtml(name: string, proposalPdfUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="color:#111827;font-size:24px;margin:0 0 8px;">Hi ${name},</h1>
      <p style="color:#374151;font-size:16px;line-height:1.6;">
        Thank you for your interest in the DAROS Briefing. Attached is the full proposal.
      </p>
      <a href="${proposalPdfUrl}"
         style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
        Download DAROS Briefing Proposal
      </a>
      <p style="color:#374151;font-size:16px;line-height:1.6;">
        We will reach out within 1-2 business days to schedule your 60-minute briefing.
      </p>
      <p style="color:#374151;font-size:14px;margin-top:24px;">
        John Lyman<br>
        <span style="color:#6b7280;">Founder, WasatchWise</span>
      </p>
    </div>
  </div>
</body>
</html>`;
}
