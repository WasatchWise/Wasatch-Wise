// send-to-jordi.js
// Usage: SENDGRID_API_KEY=your_key node scripts/send-to-jordi.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from .env.local if not in environment
let SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  try {
    const envPath = path.join(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      // Match SENDGRID_API_KEY=value (handles spaces, quotes, etc.)
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('SENDGRID_API_KEY=')) {
          SENDGRID_API_KEY = trimmed.substring('SENDGRID_API_KEY='.length).trim();
          // Remove quotes if present
          if ((SENDGRID_API_KEY.startsWith('"') && SENDGRID_API_KEY.endsWith('"')) ||
              (SENDGRID_API_KEY.startsWith("'") && SENDGRID_API_KEY.endsWith("'"))) {
            SENDGRID_API_KEY = SENDGRID_API_KEY.slice(1, -1);
          }
          break;
        }
      }
    }
  } catch (e) {
    console.error('Error reading .env.local:', e.message);
  }
}
const TO_EMAIL = 'Jordi.ventura@dentons.com';
const FROM_EMAIL = 'wasatch@wasatchwise.com'; // SendGrid verified sender
const SUBJECT = 'FWD: Strategic Update — ready to send to JPMC';

async function sendEmail() {
  if (!SENDGRID_API_KEY) {
    console.error('❌ Error: SENDGRID_API_KEY environment variable is required');
    console.log('Usage: SENDGRID_API_KEY=your_key node scripts/send-to-jordi.js');
    process.exit(1);
  }

  const htmlPath = path.join(__dirname, '../emails/jpmc-outreach.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ Error: Email template not found at ${htmlPath}`);
    process.exit(1);
  }

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              { email: TO_EMAIL, name: 'Jordi Ventura' },
              { email: 'admin@wasatchwise.com', name: 'Admin' }
            ],
          },
        ],
        from: { email: FROM_EMAIL, name: 'Wasatch' },
        subject: SUBJECT,
        content: [
          {
            type: 'text/plain',
            value: 'Jordi — HTML email below. Forward to your JPMC contacts. Delete this note before forwarding.',
          },
          {
            type: 'text/html',
            value: `<p style="background:#fffbcc;padding:12px;border-radius:4px;font-family:Arial,sans-serif;font-size:14px;margin-bottom:24px;"><strong>Jordi —</strong> Forward this to your JPMC contacts. Delete this yellow box first.</p>${htmlContent}`,
          },
        ],
      }),
    });

    if (response.ok) {
      console.log('✅ Email sent successfully');
      console.log(`   To: ${TO_EMAIL}, admin@wasatchwise.com`);
      console.log(`   Subject: ${SUBJECT}`);
    } else {
      const error = await response.text();
      console.error('❌ SendGrid API error:', response.status, response.statusText);
      console.error('Error details:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    process.exit(1);
  }
}

sendEmail();
