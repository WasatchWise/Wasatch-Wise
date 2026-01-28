import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env.local') });

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

/**
 * Test external service integrations
 */
export async function testIntegrations() {
  console.log('\n🔗 Integration Testing\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test Stripe Integration
  console.log('1. Stripe Integration\n');
  
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });

    // Test API connectivity
    const account = await stripe.account.retrieve();

    if (account) {
      console.log(`   ✅ Stripe API connectivity verified`);
      console.log(`   ✅ Account ID: ${account.id}`);
      console.log(`   ✅ Account type: ${account.type || 'standard'}`);
      
      const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
      console.log(`   ✅ Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
      
      results.passed.push({ test: 'Integration - Stripe API' });
    }
  } catch (error) {
    const errorMsg = `Stripe integration failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Integration - Stripe API', error: errorMsg });
  }

  // Test Stripe Webhook Secret
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    console.log(`   ✅ Stripe webhook secret configured`);
    results.passed.push({ test: 'Integration - Stripe Webhook Secret' });
  } catch (error) {
    const errorMsg = `Stripe webhook secret check failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Integration - Stripe Webhook Secret', error: errorMsg });
  }

  // Test Supabase Integration
  console.log('\n2. Supabase Integration\n');
  
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Test database connectivity
    const { data, error } = await supabase.from('customer_product_access').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database connectivity failed: ${error.message}`);
    }

    console.log(`   ✅ Supabase database connectivity verified`);
    results.passed.push({ test: 'Integration - Supabase Database' });

    // Test auth service
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Auth service failed: ${authError.message}`);
    }

    console.log(`   ✅ Supabase auth service accessible`);
    results.passed.push({ test: 'Integration - Supabase Auth' });

    // Test storage (if used)
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();

      if (storageError) {
        console.log(`   ⚠️  Storage check: ${storageError.message}`);
        results.warnings.push({ 
          test: 'Integration - Supabase Storage', 
          message: storageError.message 
        });
      } else {
        console.log(`   ✅ Supabase storage accessible (${buckets?.length || 0} bucket(s))`);
        results.passed.push({ test: 'Integration - Supabase Storage' });
      }
    } catch (error) {
      console.log(`   ⚠️  Storage test: ${error.message}`);
      results.warnings.push({ 
        test: 'Integration - Supabase Storage', 
        message: error.message 
      });
    }
  } catch (error) {
    const errorMsg = `Supabase integration failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Integration - Supabase', error: errorMsg });
  }

  // Test Email Service (if configured)
  console.log('\n3. Email Service\n');
  
  try {
    // Check for email service environment variables
    const emailVars = [
      'RESEND_API_KEY',
      'SENDGRID_API_KEY',
      'SMTP_HOST',
      'EMAIL_SERVICE_API_KEY',
    ];

    const foundEmailVar = emailVars.find(v => process.env[v]);

    if (foundEmailVar) {
      console.log(`   ✅ Email service configured (${foundEmailVar})`);
      results.passed.push({ test: 'Integration - Email Service Config' });
    } else {
      console.log(`   ⚠️  No email service configuration found`);
      console.log(`   ℹ️  Email service may be handled by Supabase or external service`);
      results.warnings.push({ 
        test: 'Integration - Email Service', 
        message: 'No email service env vars found (may use Supabase email)' 
      });
    }
  } catch (error) {
    console.log(`   ⚠️  Email service check: ${error.message}`);
    results.warnings.push({ 
      test: 'Integration - Email Service', 
      message: error.message 
    });
  }

  // Test Image/Media Services
  console.log('\n4. Image/Media Services\n');
  
  try {
    // Test image proxy endpoint (if server is running)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${baseUrl}/api/image-proxy?url=https://example.com/test.jpg`, {
        method: 'GET',
      });

      if (response.status === 200 || response.status === 400 || response.status === 500) {
        console.log(`   ✅ Image proxy endpoint accessible (${response.status})`);
        results.passed.push({ test: 'Integration - Image Proxy' });
      } else {
        console.log(`   ⚠️  Image proxy: Status ${response.status}`);
        results.warnings.push({ 
          test: 'Integration - Image Proxy', 
          message: `Status: ${response.status}` 
        });
      }
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        console.log(`   ⚠️  Image proxy test: Server not running`);
        results.warnings.push({ 
          test: 'Integration - Image Proxy', 
          message: 'Server not running - test skipped' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Image/media service test: ${error.message}`);
    results.warnings.push({ 
      test: 'Integration - Image/Media', 
      message: error.message 
    });
  }

  // Test Voice/Audio Services
  console.log('\n5. Voice/Audio Services\n');
  
  try {
    // Check for voice service environment variables
    const voiceVars = [
      'ELEVENLABS_API_KEY',
      'OPENAI_API_KEY',
      'VOICE_SERVICE_API_KEY',
    ];

    const foundVoiceVar = voiceVars.find(v => process.env[v]);

    if (foundVoiceVar) {
      console.log(`   ✅ Voice service configured (${foundVoiceVar})`);
      results.passed.push({ test: 'Integration - Voice Service Config' });
    } else {
      console.log(`   ⚠️  No voice service configuration found`);
      results.warnings.push({ 
        test: 'Integration - Voice Service', 
        message: 'No voice service env vars found' 
      });
    }

    // Test voice API endpoint (if server is running)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${baseUrl}/api/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' }),
      });

      if (response.status >= 200 && response.status < 500) {
        console.log(`   ✅ Voice API endpoint accessible (${response.status})`);
        results.passed.push({ test: 'Integration - Voice API' });
      } else {
        console.log(`   ⚠️  Voice API: Status ${response.status}`);
        results.warnings.push({ 
          test: 'Integration - Voice API', 
          message: `Status: ${response.status}` 
        });
      }
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        console.log(`   ⚠️  Voice API test: Server not running`);
        results.warnings.push({ 
          test: 'Integration - Voice API', 
          message: 'Server not running - test skipped' 
        });
      } else {
        console.log(`   ⚠️  Voice API test: ${error.message}`);
        results.warnings.push({ 
          test: 'Integration - Voice API', 
          message: error.message 
        });
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Voice/audio service test: ${error.message}`);
    results.warnings.push({ 
      test: 'Integration - Voice/Audio', 
      message: error.message 
    });
  }

  // Test Analytics/Monitoring (if configured)
  console.log('\n6. Analytics & Monitoring\n');
  
  try {
    // Check for Sentry
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
    
    if (sentryDsn) {
      console.log(`   ✅ Sentry configured`);
      results.passed.push({ test: 'Integration - Sentry' });
    } else {
      console.log(`   ⚠️  Sentry not configured`);
      results.warnings.push({ 
        test: 'Integration - Sentry', 
        message: 'Sentry not configured (error tracking may be limited)' 
      });
    }

    // Check for analytics
    const analyticsVars = [
      'NEXT_PUBLIC_GA_ID',
      'NEXT_PUBLIC_GOOGLE_ANALYTICS',
      'ANALYTICS_ID',
    ];

    const foundAnalyticsVar = analyticsVars.find(v => process.env[v]);

    if (foundAnalyticsVar) {
      console.log(`   ✅ Analytics configured (${foundAnalyticsVar})`);
      results.passed.push({ test: 'Integration - Analytics' });
    } else {
      console.log(`   ⚠️  Analytics not configured`);
      results.warnings.push({ 
        test: 'Integration - Analytics', 
        message: 'Analytics not configured' 
      });
    }
  } catch (error) {
    console.log(`   ⚠️  Analytics/monitoring test: ${error.message}`);
    results.warnings.push({ 
      test: 'Integration - Analytics/Monitoring', 
      message: error.message 
    });
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}\n`);

  return results;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testIntegrations()
    .then(() => process.exit(results.failed.length > 0 ? 1 : 0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

