const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config({ path: './slctrips-v2/.env.local' });

const apiKey = process.env.SENDGRID_API_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com';

if (!apiKey) {
  console.log('❌ SENDGRID_API_KEY not found in .env.local');
  process.exit(1);
}

sgMail.setApiKey(apiKey);

const testEmail = 'test@example.com'; // Replace with your email to test
const testName = 'Test User';

console.log('🧪 Testing Welcome Wagon email sending...');
console.log(`📧 Test recipient: ${testEmail}`);
console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`);
console.log('');

const welcomeWagonUrl = `${siteUrl}/welcome-wagon`;
const firstName = testName.split(' ')[0];

const emailHtml = `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #ffffff;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Welcome to Utah! 🏔️</h1>
      <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 18px;">Your Week 1 Survival Guide</p>
    </div>

    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
        Hi ${firstName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
        This is a TEST EMAIL to verify the Welcome Wagon email system is working correctly.
      </p>

      <div style="background: #f3f4f6; border-radius: 12px; padding: 30px; margin: 30px 0;">
        <h2 style="color: #1e40af; margin-top: 0; font-size: 24px; margin-bottom: 20px;">✅ Test Successful</h2>
        <p style="color: #374151;">If you're seeing this email, the SendGrid integration is working!</p>
      </div>
    </div>
  </div>
`;

(async () => {
  try {
    const result = await sgMail.send({
      to: testEmail,
      from: 'SLCTrips <noreply@slctrips.com>',
      subject: '🧪 Test: Welcome Wagon Email System',
      html: emailHtml,
    });

    console.log('✅ Email sent successfully!');
    console.log(`📬 Status Code: ${result[0].statusCode}`);
    console.log(`📨 Message ID: ${result[0].headers['x-message-id']}`);
    console.log('');
    console.log('🎉 The Welcome Wagon email system is working correctly!');
  } catch (error) {
    console.error('❌ Error sending email:');

    if (error.response) {
      console.error('Status:', error.response.statusCode);
      console.error('Body:', JSON.stringify(error.response.body, null, 2));

      if (error.response.body?.errors) {
        console.error('\n❗ Errors:');
        error.response.body.errors.forEach((err, i) => {
          console.error(`  ${i + 1}. ${err.message}`);
          if (err.field) console.error(`     Field: ${err.field}`);
        });
      }
    } else {
      console.error(error.message);
    }

    console.log('');
    console.log('⚠️  Common issues:');
    console.log('  1. Sender email (noreply@slctrips.com) not verified in SendGrid');
    console.log('  2. Invalid API key');
    console.log('  3. SendGrid account suspended or limited');
    console.log('');
    console.log('📖 Next steps:');
    console.log('  1. Log in to SendGrid dashboard: https://app.sendgrid.com/');
    console.log('  2. Go to Settings > Sender Authentication');
    console.log('  3. Verify noreply@slctrips.com or use a verified sender');
  }
})();
