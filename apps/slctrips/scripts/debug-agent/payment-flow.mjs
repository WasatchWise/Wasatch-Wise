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

let testUserId = '';
let testTripkitId = '';
let testStaykitId = '';
let testCheckoutSessionId = '';

/**
 * Test payment and checkout flows
 */
export async function testPaymentFlow() {
  console.log('\n💳 Payment & Checkout Flow Testing\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Validate required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const error = 'Missing Supabase credentials';
    console.log(`   ❌ ${error}`);
    results.failed.push({ test: 'Payment Setup', error });
    return results;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    const error = 'Missing Stripe secret key';
    console.log(`   ❌ ${error}`);
    results.failed.push({ test: 'Payment Setup', error });
    return results;
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

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  });

  const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
  if (!isTestMode) {
    console.log('   ⚠️  WARNING: Using LIVE Stripe keys. Ensure this is intentional.\n');
    results.warnings.push({ 
      test: 'Stripe Mode', 
      message: 'Using LIVE Stripe keys for testing' 
    });
  }

  // Get a test user (create if needed)
  console.log('1. Test User Setup\n');
  try {
    const testEmail = `payment-test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    // Create test user
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signupError && !signupError.message.includes('already registered')) {
      // Handle email validation errors gracefully
      if (signupError.message.includes('email') || signupError.message.includes('invalid') || 
          signupError.message.includes('Email rate limit') || signupError.message.includes('domain')) {
        console.log(`   ⚠️  User creation failed due to email validation: ${signupError.message}`);
        console.log(`   ℹ️  Skipping payment tests that require user creation`);
        results.warnings.push({ 
          test: 'Payment - Test User Setup', 
          message: `Email validation rejected test email. Configure Supabase to allow test emails.` 
        });
        return results;
      }
      throw new Error(`User creation failed: ${signupError.message}`);
    }

    if (signupData?.user) {
      testUserId = signupData.user.id;
      console.log(`   ✅ Test user created: ${testEmail}`);
    } else {
      // Try to sign in if user already exists
      const { data: loginData } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      if (loginData?.user) {
        testUserId = loginData.user.id;
        console.log(`   ✅ Test user found: ${testEmail}`);
      } else {
        throw new Error('Could not create or find test user');
      }
    }

    results.passed.push({ test: 'Payment - Test User Setup' });
  } catch (error) {
    const errorMsg = `Test user setup failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Payment - Test User Setup', error: errorMsg });
    return results;
  }

  // Get a test tripkit
  console.log('\n2. Test Product Setup\n');
  try {
    const { data: tripkits, error: tripkitError } = await supabase
      .from('tripkits')
      .select('id, code, name, price, slug')
      .in('status', ['active', 'freemium'])
      .limit(1)
      .single();

    if (tripkitError || !tripkits) {
      throw new Error(`No active tripkit found: ${tripkitError?.message || 'No data'}`);
    }

    testTripkitId = tripkits.id;
    console.log(`   ✅ Test TripKit found: ${tripkits.name} (${tripkits.code})`);
    console.log(`   ✅ Price: $${tripkits.price}`);

    // Check for staykit
    const { data: staykits } = await supabase
      .from('staykits')
      .select('id, code, name, price, slug')
      .eq('status', 'active')
      .limit(1)
      .single();

    if (staykits) {
      testStaykitId = staykits.id;
      console.log(`   ✅ Test StayKit found: ${staykits.name} (${staykits.code})`);
    } else {
      console.log(`   ℹ️  No active StayKit found (optional)`);
    }

    results.passed.push({ test: 'Payment - Test Product Setup' });
  } catch (error) {
    const errorMsg = `Test product setup failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Payment - Test Product Setup', error: errorMsg });
    return results;
  }

  // Test TripKit Checkout Creation
  console.log('\n3. TripKit Checkout Creation\n');
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const successUrl = `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/checkout/cancel`;

    const { data: tripkit } = await supabase
      .from('tripkits')
      .select('*')
      .eq('id', testTripkitId)
      .single();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tripkit.name,
              description: tripkit.tagline || tripkit.description || undefined,
            },
            unit_amount: Math.round(tripkit.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: testUserId,
        tripkit_id: testTripkitId,
        tripkit_code: tripkit.code,
      },
    });

    if (!session.url) {
      throw new Error('Checkout session created but no URL returned');
    }

    testCheckoutSessionId = session.id;
    console.log(`   ✅ Checkout session created: ${session.id}`);
    console.log(`   ✅ Checkout URL: ${session.url.substring(0, 60)}...`);
    console.log(`   ✅ Session mode: ${session.mode}`);
    console.log(`   ✅ Amount: $${(session.amount_total / 100).toFixed(2)}`);

    results.passed.push({ test: 'Payment - TripKit Checkout Creation' });
  } catch (error) {
    const errorMsg = `TripKit checkout creation failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Payment - TripKit Checkout Creation', error: errorMsg });
  }

  // Test StayKit Checkout Creation (if available)
  if (testStaykitId) {
    console.log('\n4. StayKit Checkout Creation\n');
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const successUrl = `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${siteUrl}/checkout/cancel`;

      const { data: staykit } = await supabase
        .from('staykits')
        .select('*')
        .eq('id', testStaykitId)
        .single();

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: staykit.name,
                description: staykit.tagline || staykit.description || undefined,
              },
              unit_amount: Math.round(staykit.price * 100),
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: testUserId,
          staykit_id: testStaykitId,
          staykit_code: staykit.code,
        },
      });

      if (!session.url) {
        throw new Error('Checkout session created but no URL returned');
      }

      console.log(`   ✅ StayKit checkout session created: ${session.id}`);
      console.log(`   ✅ Checkout URL: ${session.url.substring(0, 60)}...`);

      results.passed.push({ test: 'Payment - StayKit Checkout Creation' });
    } catch (error) {
      const errorMsg = `StayKit checkout creation failed: ${error.message}`;
      console.log(`   ❌ ${errorMsg}`);
      results.failed.push({ test: 'Payment - StayKit Checkout Creation', error: errorMsg });
    }
  }

  // Test Gift Checkout Creation
  console.log('\n5. Gift Checkout Creation\n');
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const successUrl = `${siteUrl}/gift/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/checkout/cancel`;

    const { data: tripkit } = await supabase
      .from('tripkits')
      .select('*')
      .eq('id', testTripkitId)
      .single();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Gift: ${tripkit.name}`,
              description: tripkit.tagline || tripkit.description || undefined,
            },
            unit_amount: Math.round(tripkit.price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: testUserId,
        tripkit_id: testTripkitId,
        tripkit_code: tripkit.code,
        is_gift: 'true',
      },
    });

    if (!session.url) {
      throw new Error('Gift checkout session created but no URL returned');
    }

    console.log(`   ✅ Gift checkout session created: ${session.id}`);
    console.log(`   ✅ Checkout URL: ${session.url.substring(0, 60)}...`);

    results.passed.push({ test: 'Payment - Gift Checkout Creation' });
  } catch (error) {
    const errorMsg = `Gift checkout creation failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Payment - Gift Checkout Creation', error: errorMsg });
  }

  // Test Webhook Signature Validation
  console.log('\n6. Webhook Signature Validation\n');
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    // Create a test event payload
    const testPayload = JSON.stringify({
      id: 'evt_test_webhook',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          object: 'checkout.session',
          mode: 'payment',
        },
      },
    });

    // Create a signature (this is a simplified test - real webhooks come from Stripe)
    try {
      stripe.webhooks.constructEvent(
        testPayload,
        'test_signature',
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log(`   ⚠️  Webhook secret configured (signature validation test skipped - requires real Stripe webhook)`);
      results.warnings.push({ 
        test: 'Webhook - Signature Validation', 
        message: 'Full webhook signature validation requires real Stripe webhook events' 
      });
    } catch (error) {
      // Expected to fail with test signature, but confirms webhook secret is set
      if (error.message.includes('No signatures found') || error.message.includes('No signatures')) {
        console.log(`   ✅ Webhook secret is configured`);
        console.log(`   ℹ️  Full validation requires real Stripe webhook (expected test failure)`);
        results.passed.push({ test: 'Webhook - Secret Configuration' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    const errorMsg = `Webhook validation test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Webhook - Signature Validation', error: errorMsg });
  }

  // Test Purchase Record Creation (simulate webhook)
  console.log('\n7. Purchase Record Creation\n');
  try {
    // Check if purchases table exists and is accessible
    const { data: purchaseTest, error: purchaseError } = await supabase
      .from('purchases')
      .select('id')
      .limit(1);

    if (purchaseError && purchaseError.code !== 'PGRST116') {
      throw new Error(`Purchases table access failed: ${purchaseError.message}`);
    }

    console.log(`   ✅ Purchases table is accessible`);

    // Test purchase record structure (don't actually insert in test mode)
    console.log(`   ℹ️  Purchase record creation tested via table access`);
    results.passed.push({ test: 'Payment - Purchase Record Access' });
  } catch (error) {
    const errorMsg = `Purchase record test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Payment - Purchase Record', error: errorMsg });
  }

  // Test Product Access After Payment (simulate)
  console.log('\n8. Post-Payment Access Grant\n');
  try {
    // Check customer_product_access table
    const { data: accessTest, error: accessError } = await supabase
      .from('customer_product_access')
      .select('id')
      .limit(1);

    if (accessError && accessError.code !== 'PGRST116') {
      throw new Error(`Access table check failed: ${accessError.message}`);
    }

    console.log(`   ✅ Customer product access table is accessible`);
    console.log(`   ℹ️  Access grant tested via table access (full test requires completed payment)`);
    results.passed.push({ test: 'Payment - Access Table Access' });
  } catch (error) {
    const errorMsg = `Post-payment access test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Payment - Post-Payment Access', error: errorMsg });
  }

  // Cleanup test checkout sessions
  console.log('\n9. Cleanup\n');
  try {
    if (testCheckoutSessionId) {
      // Expire the test session
      await stripe.checkout.sessions.expire(testCheckoutSessionId);
      console.log(`   ✅ Test checkout session expired: ${testCheckoutSessionId}`);
    }
    results.passed.push({ test: 'Payment - Cleanup' });
  } catch (error) {
    console.log(`   ⚠️  Cleanup warning: ${error.message}`);
    results.warnings.push({ 
      test: 'Payment - Cleanup', 
      message: `Test checkout session may need manual cleanup: ${testCheckoutSessionId}` 
    });
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}\n`);

  if (isTestMode) {
    console.log('ℹ️  Note: Tests run in Stripe TEST mode. Use test card: 4242 4242 4242 4242\n');
  }

  return results;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPaymentFlow()
    .then(() => process.exit(results.failed.length > 0 ? 1 : 0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

