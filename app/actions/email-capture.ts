'use server';

import { emailCaptureSchema } from '@/lib/utils/validation';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';

export async function captureEmail(data: {
  email: string;
  name?: string;
  organization?: string;
  role?: string;
  source: string;
  leadMagnet?: string;
}) {
  // Validate
  const validation = emailCaptureSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  try {
    const supabase = await createClient();

    // Store in database
    await supabase.from('email_captures').insert({
      email: data.email,
      name: data.name,
      organization: data.organization,
      role: data.role,
      source: data.source,
      lead_magnet: data.leadMagnet,
    });

    // Send welcome email if lead magnet provided
    if (data.leadMagnet) {
      await sendEmail({
        to: data.email,
        subject: `Your ${data.leadMagnet} from WasatchWise`,
        html: `
          <p>Hi ${data.name || 'there'},</p>
          <p>Thanks for your interest! Here's your ${data.leadMagnet}:</p>
          <p>[Link to resource would go here]</p>
          <p>Best,<br />John Lyman<br />Founder, WasatchWise</p>
        `,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Email capture error:', error);
    return {
      success: false,
      error: 'Failed to capture email. Please try again.',
    };
  }
}

