'use server';

import { appRequestSchema } from '@/lib/utils/validation';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';

export async function submitAppRequest(formData: {
  name: string;
  email: string;
  role?: string;
  organization?: string;
  appName: string;
  appUrl?: string;
  reason?: string;
}) {
  const data = {
    ...formData,
    appUrl: formData.appUrl?.trim() || undefined,
  };

  const validation = appRequestSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  const v = validation.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('app_requests').insert({
      name: v.name,
      email: v.email,
      role: v.role || null,
      organization: v.organization || null,
      app_name: v.appName,
      app_url: v.appUrl || null,
      reason: v.reason || null,
    });

    if (error) {
      console.error('App request insert error:', error);
      return { success: false, error: 'Failed to submit. Please try again.' };
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await sendEmail({
        to: 'john@wasatchwise.com',
        subject: `[ABYA] App review request: ${v.appName} from ${v.name}`,
        html: `
          <h2>New app review request</h2>
          <p><strong>Name:</strong> ${v.name}</p>
          <p><strong>Email:</strong> ${v.email}</p>
          <p><strong>Role:</strong> ${v.role || '—'}</p>
          <p><strong>Organization:</strong> ${v.organization || '—'}</p>
          <p><strong>App name:</strong> ${v.appName}</p>
          <p><strong>App URL:</strong> ${v.appUrl || '—'}</p>
          <p><strong>Why:</strong></p>
          <p>${v.reason || '—'}</p>
        `,
      }).catch((err) => console.error('Admin email failed:', err));

      await sendEmail({
        to: v.email,
        subject: 'We received your app suggestion — Ask Before You App',
        html: `
          <p>Hi ${v.name},</p>
          <p>Thanks for suggesting <strong>${v.appName}</strong>. We use these suggestions to prioritize which apps get added to our resources and SDPC Registry guidance.</p>
          <p>While you wait, you can <a href="https://www.askbeforeyouapp.com/certification">take our free NDPA certification</a> to learn how to vet apps yourself, or <a href="https://sdpc.a4l.org/search.php">search the SDPC Registry</a> to see if this app already has agreements in other states.</p>
          <p>Best,<br />Ask Before You App</p>
        `,
      }).catch((err) => console.error('Confirmation email failed:', err));
    }

    const webhookUrl = process.env.LEAD_ROUTER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'app_review_request',
          name: v.name,
          email: v.email,
          organization: v.organization,
          role: v.role,
          app_name: v.appName,
          app_url: v.appUrl,
          reason: v.reason,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error('Lead router webhook failed:', err));
    }

    return { success: true };
  } catch (error) {
    console.error('App request error:', error);
    return { success: false, error: 'Failed to submit. Please try again.' };
  }
}
