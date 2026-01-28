import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = body?.session_id as string | undefined;
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Fetch access code and related purchase info by session id
    const { data: codeRow, error: codeError } = await supabase
      .from('tripkit_access_codes')
      .select('access_code, customer_email, tripkit_id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (codeError || !codeRow) {
      return NextResponse.json({ error: 'No purchase found for session' }, { status: 404 });
    }

    const accessCode = codeRow.access_code as string;
    const customerEmail = codeRow.customer_email as string | null;
    const { data: tripkit, error: tkError } = await supabase
      .from('tripkits')
      .select('name')
      .eq('id', codeRow.tripkit_id)
      .single();

    const tripkitName = tkError || !tripkit ? 'Your TripKit' : tripkit.name;
    const accessUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com'}/tk/${accessCode}`;

    if (customerEmail && process.env.SENDGRID_API_KEY) {
      const emailHtml = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #1e40af; margin-bottom: 20px;">📧 Here’s your access again</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            You requested a new copy of your purchase confirmation. Your access details are below.
          </p>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 24px;">${tripkitName}</h2>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${accessUrl}" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
              🚀 Access Your TripKit
            </a>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px;">
              <strong>📌 Save Your Access Code:</strong><br/>
              <code style="background: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-family: monospace; display: inline-block; margin-top: 8px;">${accessCode}</code>
            </p>
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
              SLCTrips • From Salt Lake, to Everywhere<br/>
              <a href="mailto:Dan@slctrips.com" style="color: #6b7280;">Dan@slctrips.com</a>
            </p>
          </div>
        </div>
      `;

      try {
        await sgMail.send({
          to: customerEmail,
          from: 'SLCTrips <noreply@slctrips.com>',
          subject: `🔁 Your ${tripkitName} access details`,
          html: emailHtml,
        });
      } catch {
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


