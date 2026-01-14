import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  react?: React.ReactElement;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  const { to, from = 'John at WasatchWise <john@wasatchwise.com>', subject, html, react, text } = options;

  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      react,
      text,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Resend API error:', error);
    throw error;
  }
}

