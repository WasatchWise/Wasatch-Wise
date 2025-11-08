/**
 * Notification Utilities
 * Hybrid approach: Edge Function for email, native links for SMS/fallback
 */

interface NotificationData {
  requesterName: string;
  helperName: string;
  need: string;
  contactMethod: 'text' | 'email';
  contactInfo: string;
  urgency: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EDGE_FUNCTION_URL = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/send-claim-notification`
  : null;

export const generateClaimNotification = (data: NotificationData): { subject: string; body: string; link: string } => {
  const subject = `✅ Your Help List request has been claimed!`;

  const body = `Hi ${data.requesterName},

Good news! Your request on The Help List has been claimed by ${data.helperName}.

REQUEST DETAILS:
${data.need}

WHAT'S NEXT:
${data.helperName} will reach out to you shortly to coordinate shopping and delivery details. Please have your payment method ready (Venmo, Zelle, Cash App, or cash).

NEED HELP?
If you don't hear from your helper within a few hours, you can view your request status at thehelplist.co or contact us at safety@thehelplist.co.

Thank you for using The Help List!
🤝 Neighbors helping neighbors`;

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  const link = data.contactMethod === 'email'
    ? `mailto:${data.contactInfo}?subject=${encodedSubject}&body=${encodedBody}`
    : `sms:${data.contactInfo}?&body=${encodedBody}`;

  return { subject, body, link };
};

/**
 * Send email notification via Edge Function
 */
export const sendEmailNotification = async (data: NotificationData): Promise<boolean> => {
  if (!EDGE_FUNCTION_URL || data.contactMethod !== 'email') {
    return false;
  }

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.contactInfo,
        requesterName: data.requesterName,
        helperName: data.helperName,
        need: data.need,
        urgency: data.urgency,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email notification:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

/**
 * Main notification function - tries Edge Function first, falls back to native links
 */
export const openNotificationPrompt = async (data: NotificationData): Promise<void> => {
  // For email, try Edge Function first
  if (data.contactMethod === 'email' && EDGE_FUNCTION_URL) {
    const didSendEmail = await sendEmailNotification(data);

    if (didSendEmail) {
      alert(`✅ Email notification sent to ${data.requesterName}!`);
      return;
    }

    // Fall through to mailto if Edge Function failed
    console.warn('Edge Function email failed, falling back to mailto link');
  }

  // Fallback or SMS: Use native links
  const { subject, body, link } = generateClaimNotification(data);

  const didOpen = window.confirm(
    `Would you like to notify ${data.requesterName} that you've claimed their request?\n\n` +
    `This will open your ${data.contactMethod === 'email' ? 'email' : 'messaging'} app with a pre-filled message.\n\n` +
    `Click OK to continue, or Cancel to notify them later.`
  );

  if (didOpen) {
    window.location.href = link;
  }
};

export const copyNotificationText = (data: NotificationData): string => {
  const { body } = generateClaimNotification(data);

  if (navigator.clipboard) {
    navigator.clipboard.writeText(body);
  }

  return body;
};
