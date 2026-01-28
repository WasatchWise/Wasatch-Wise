'use server';

import { contactFormSchema } from '@/lib/utils/validation';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';

export async function submitContactForm(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    organization: formData.get('organization') as string,
    role: formData.get('role') as string,
    message: formData.get('message') as string,
  };

  // Validate
  const validation = contactFormSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  const validated = validation.data;

  try {
    // Store in Supabase
    const supabase = await createClient();
    await supabase.from('email_captures').insert({
      email: validated.email,
      name: validated.name,
      organization: validated.organization,
      role: validated.role,
      source: 'contact_form',
    });

    // Send notification email
    await sendEmail({
      to: 'john@wasatchwise.com',
      subject: `New Contact Form Submission from ${validated.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${validated.name}</p>
        <p><strong>Email:</strong> ${validated.email}</p>
        <p><strong>Organization:</strong> ${validated.organization}</p>
        <p><strong>Role:</strong> ${validated.role || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${validated.message}</p>
      `,
    });

    // Send confirmation to user
    await sendEmail({
      to: validated.email,
      subject: 'Thank you for contacting WasatchWise',
      html: `
        <p>Hi ${validated.name},</p>
        <p>Thanks for reaching out! I'll get back to you within 24 hours.</p>
        <p>Best,<br />John Lyman<br />Founder, WasatchWise</p>
      `,
    });

    // Trigger N8N Universal Lead Router
    const webhookUrl = process.env.LEAD_ROUTER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'contact_form',
          name: validated.name,
          email: validated.email,
          organization: validated.organization,
          role: validated.role,
          message: validated.message,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error('Lead router webhook failed:', err));
    }

    return { success: true };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      error: 'Failed to submit form. Please try again.',
    };
  }
}

