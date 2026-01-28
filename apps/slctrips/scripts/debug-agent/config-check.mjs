import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env.local') });

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

/**
 * Test configuration and validate environment variables
 */
export async function checkConfig() {
  console.log('\n📋 Configuration & Environment Validation\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Required environment variables
  const requiredEnvVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
    'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
    'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL,
  };

  // Check required environment variables
  console.log('1. Environment Variables\n');
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      const error = `Missing required environment variable: ${key}`;
      console.log(`   ❌ ${key}: Missing`);
      results.failed.push({ test: `Env Var: ${key}`, error });
    } else {
      // Mask sensitive values
      const displayValue = key.includes('KEY') || key.includes('SECRET') 
        ? `${value.substring(0, 8)}...` 
        : value;
      console.log(`   ✅ ${key}: ${displayValue}`);
      results.passed.push({ test: `Env Var: ${key}` });
    }
  }

  // Test Supabase connection
  console.log('\n2. Supabase Connection\n');
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
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

    // Test connection with a simple query
    const { data, error } = await supabase.from('customer_product_access').select('id').limit(1);

    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }

    console.log('   ✅ Supabase connection successful');
    console.log(`   ✅ Database accessible (tested customers table)`);
    results.passed.push({ test: 'Supabase Connection' });
    results.passed.push({ test: 'Supabase Database Access' });
  } catch (error) {
    const errorMsg = `Supabase connection failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Supabase Connection', error: errorMsg });
  }

  // Test Supabase anon key
  console.log('\n3. Supabase Anon Key\n');
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing anon key');
    }

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test with a public query (should work with anon key)
    const { error } = await anonClient.from('tripkits').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      throw new Error(`Anon key test failed: ${error.message}`);
    }

    console.log('   ✅ Supabase anon key is valid');
    results.passed.push({ test: 'Supabase Anon Key' });
  } catch (error) {
    const errorMsg = `Anon key validation failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Supabase Anon Key', error: errorMsg });
  }

  // Test Stripe connection
  console.log('\n4. Stripe API Connection\n');
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe secret key');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });

    // Test connection by retrieving account info
    const account = await stripe.account.retrieve();

    if (account) {
      const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
      const mode = isTestMode ? 'TEST MODE' : 'LIVE MODE';
      console.log(`   ✅ Stripe connection successful (${mode})`);
      console.log(`   ✅ Account ID: ${account.id}`);
      results.passed.push({ test: 'Stripe Connection', data: { mode } });
      
      if (!isTestMode) {
        results.warnings.push({ 
          test: 'Stripe Mode', 
          message: 'Using LIVE Stripe keys - ensure this is intentional for production testing' 
        });
      }
    }
  } catch (error) {
    const errorMsg = `Stripe connection failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Stripe Connection', error: errorMsg });
  }

  // Validate environment-specific configs
  console.log('\n5. Environment Configuration\n');
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`   Environment: ${nodeEnv}`);

  if (nodeEnv === 'production') {
    if (!process.env.NEXT_PUBLIC_SITE_URL && !process.env.SITE_URL) {
      const warning = 'Production environment missing SITE_URL';
      console.log(`   ⚠️  ${warning}`);
      results.warnings.push({ test: 'Production Config', message: warning });
    } else {
      console.log(`   ✅ Site URL configured: ${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL}`);
      results.passed.push({ test: 'Production Site URL' });
    }
  } else {
    console.log(`   ℹ️  Development environment detected`);
    results.passed.push({ test: 'Environment Detection' });
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
  checkConfig()
    .then(() => process.exit(results.failed.length > 0 ? 1 : 0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

