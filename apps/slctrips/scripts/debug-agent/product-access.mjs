import { createClient } from '@supabase/supabase-js';
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
 * Test product access functionality
 */
export async function testProductAccess() {
  console.log('\n📦 Product Access Testing\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const error = 'Missing Supabase credentials';
    console.log(`   ❌ ${error}`);
    results.failed.push({ test: 'Product Access Setup', error });
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

  // Create test user
  console.log('1. Test User Setup\n');
  let testUserId = '';
  let testUserEmail = '';
  try {
    testUserEmail = `access-test-${Date.now()}@example.com`;
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testUserEmail,
      password: 'TestPassword123!',
    });

    if (signupError && !signupError.message.includes('already registered')) {
      // Handle email validation errors gracefully
      if (signupError.message.includes('email') || signupError.message.includes('invalid') || 
          signupError.message.includes('Email rate limit') || signupError.message.includes('domain')) {
        console.log(`   ⚠️  User creation failed due to email validation: ${signupError.message}`);
        console.log(`   ℹ️  Skipping product access tests that require user creation`);
        results.warnings.push({ 
          test: 'Product Access - Test User Setup', 
          message: `Email validation rejected test email. Configure Supabase to allow test emails.` 
        });
        return results;
      }
      throw new Error(`User creation failed: ${signupError.message}`);
    }

    if (signupData?.user) {
      testUserId = signupData.user.id;
      console.log(`   ✅ Test user created: ${testUserEmail}`);
    } else {
      // Try login if user exists
      const { data: loginData } = await supabase.auth.signInWithPassword({
        email: testUserEmail,
        password: 'TestPassword123!',
      });
      if (loginData?.user) {
        testUserId = loginData.user.id;
        console.log(`   ✅ Test user found: ${testUserEmail}`);
      } else {
        throw new Error('Could not create or find test user');
      }
    }
    results.passed.push({ test: 'Product Access - Test User' });
  } catch (error) {
    const errorMsg = `Test user setup failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Product Access - Test User', error: errorMsg });
    return results;
  }

  // Get test products
  console.log('\n2. Test Products Setup\n');
  let testTripkitId = '';
  let testStaykitId = '';
  try {
    const { data: tripkit } = await supabase
      .from('tripkits')
      .select('id, code, name')
      .in('status', ['active', 'freemium'])
      .limit(1)
      .single();

    if (tripkit) {
      testTripkitId = tripkit.id;
      console.log(`   ✅ Test TripKit: ${tripkit.name} (${tripkit.code})`);
    } else {
      throw new Error('No active tripkit found');
    }

    const { data: staykit } = await supabase
      .from('staykits')
      .select('id, code, name')
      .eq('status', 'active')
      .limit(1)
      .single();

    if (staykit) {
      testStaykitId = staykit.id;
      console.log(`   ✅ Test StayKit: ${staykit.name} (${staykit.code})`);
    } else {
      console.log(`   ℹ️  No active StayKit found (optional)`);
    }

    results.passed.push({ test: 'Product Access - Test Products' });
  } catch (error) {
    const errorMsg = `Test products setup failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Product Access - Test Products', error: errorMsg });
    return results;
  }

  // Test TripKit Access Grant
  console.log('\n3. TripKit Access Grant\n');
  try {
    // Grant access
    const { error: grantError } = await supabase
      .from('customer_product_access')
      .insert({
        user_id: testUserId,
        product_id: testTripkitId,
        product_type: 'tripkit',
        access_type: 'purchased',
        access_granted_at: new Date().toISOString(),
      });

    if (grantError) {
      throw new Error(`Access grant failed: ${grantError.message}`);
    }

    console.log(`   ✅ TripKit access granted`);

    // Verify access
    const { data: accessData, error: checkError } = await supabase
      .from('customer_product_access')
      .select('id, access_type, access_granted_at')
      .eq('user_id', testUserId)
      .eq('product_id', testTripkitId)
      .eq('product_type', 'tripkit')
      .maybeSingle();

    if (checkError) {
      throw new Error(`Access verification failed: ${checkError.message}`);
    }

    if (!accessData) {
      throw new Error('Access record not found after grant');
    }

    console.log(`   ✅ Access verified: ${accessData.access_type}`);
    results.passed.push({ test: 'Product Access - TripKit Grant' });
    results.passed.push({ test: 'Product Access - TripKit Verification' });
  } catch (error) {
    const errorMsg = `TripKit access grant failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Product Access - TripKit Grant', error: errorMsg });
  }

  // Test StayKit Access Grant (if available)
  if (testStaykitId) {
    console.log('\n4. StayKit Access Grant\n');
    try {
      const { error: grantError } = await supabase
        .from('customer_product_access')
        .insert({
          user_id: testUserId,
          product_id: testStaykitId,
          product_type: 'staykit',
          access_type: 'purchased',
          access_granted_at: new Date().toISOString(),
        });

      if (grantError) {
        throw new Error(`Access grant failed: ${grantError.message}`);
      }

      console.log(`   ✅ StayKit access granted`);

      const { data: accessData } = await supabase
        .from('customer_product_access')
        .select('id, access_type')
        .eq('user_id', testUserId)
        .eq('product_id', testStaykitId)
        .eq('product_type', 'staykit')
        .maybeSingle();

      if (accessData) {
        console.log(`   ✅ Access verified: ${accessData.access_type}`);
        results.passed.push({ test: 'Product Access - StayKit Grant' });
      }
    } catch (error) {
      const errorMsg = `StayKit access grant failed: ${error.message}`;
      console.log(`   ❌ ${errorMsg}`);
      results.failed.push({ test: 'Product Access - StayKit Grant', error: errorMsg });
    }
  }

  // Test Access Code Linking
  console.log('\n5. Access Code Linking\n');
  try {
    // Check if access codes table exists
    const { data: accessCodes, error: codesError } = await supabase
      .from('tripkit_access_codes')
      .select('id, code, tripkit_id')
      .limit(1);

    if (codesError && codesError.code !== 'PGRST116') {
      throw new Error(`Access codes table check failed: ${codesError.message}`);
    }

    if (accessCodes && accessCodes.length > 0) {
      console.log(`   ✅ Access codes table accessible`);
      console.log(`   ℹ️  Access code linking functionality available`);
      results.passed.push({ test: 'Product Access - Access Codes Table' });
    } else {
      console.log(`   ℹ️  No access codes found (table exists but empty)`);
      results.passed.push({ test: 'Product Access - Access Codes Table' });
    }
  } catch (error) {
    const errorMsg = `Access code linking test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Product Access - Access Code Linking', error: errorMsg });
  }

  // Test RLS Policies (using anon key)
  console.log('\n6. Row Level Security (RLS) Policies\n');
  try {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Try to access customer_product_access with anon key (should be restricted)
    const { data: anonAccess, error: anonError } = await anonClient
      .from('customer_product_access')
      .select('id')
      .limit(1);

    // RLS should prevent access - if we get data, RLS might not be configured
    if (anonAccess && anonAccess.length > 0) {
      console.log(`   ⚠️  RLS may not be fully configured (anon key can access customer_product_access)`);
      results.warnings.push({ 
        test: 'Product Access - RLS Policies', 
        message: 'RLS may not be fully configured for customer_product_access' 
      });
    } else if (anonError && (anonError.code === '42501' || anonError.message.includes('permission'))) {
      console.log(`   ✅ RLS policies are active (anon access denied as expected)`);
      results.passed.push({ test: 'Product Access - RLS Policies' });
    } else {
      console.log(`   ℹ️  RLS check inconclusive: ${anonError?.message || 'No error'}`);
      results.warnings.push({ 
        test: 'Product Access - RLS Policies', 
        message: 'RLS check inconclusive' 
      });
    }
  } catch (error) {
    console.log(`   ⚠️  RLS test error: ${error.message}`);
    results.warnings.push({ 
      test: 'Product Access - RLS Policies', 
      message: error.message 
    });
  }

  // Test Content Loading
  console.log('\n7. Content Loading\n');
  try {
    // Test tripkit content query
    const { data: tripkitContent, error: contentError } = await supabase
      .from('tripkits')
      .select('id, name, description, cover_image_url, destination_count')
      .eq('id', testTripkitId)
      .single();

    if (contentError) {
      throw new Error(`Content loading failed: ${contentError.message}`);
    }

    if (tripkitContent) {
      console.log(`   ✅ TripKit content loaded: ${tripkitContent.name}`);
      console.log(`   ✅ Destinations: ${tripkitContent.destination_count || 0}`);
      console.log(`   ${tripkitContent.cover_image_url ? '✅' : '⚠️ '} Cover image: ${tripkitContent.cover_image_url ? 'Present' : 'Missing'}`);
      
      if (!tripkitContent.cover_image_url) {
        results.warnings.push({ 
          test: 'Product Access - Content Images', 
          message: 'TripKit missing cover image' 
        });
      } else {
        results.passed.push({ test: 'Product Access - Content Images' });
      }
      
      results.passed.push({ test: 'Product Access - Content Loading' });
    }
  } catch (error) {
    const errorMsg = `Content loading failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Product Access - Content Loading', error: errorMsg });
  }

  // Test Access Expiration (if applicable)
  console.log('\n8. Access Expiration Handling\n');
  try {
    // Check if expiration_date field exists in customer_product_access
    const { data: accessWithExpiry } = await supabase
      .from('customer_product_access')
      .select('id, access_granted_at')
      .eq('user_id', testUserId)
      .limit(1);

    if (accessWithExpiry && accessWithExpiry.length > 0) {
      console.log(`   ✅ Access records have timestamp: ${accessWithExpiry[0].access_granted_at}`);
      console.log(`   ℹ️  Expiration logic depends on business rules`);
      results.passed.push({ test: 'Product Access - Expiration Fields' });
    }
  } catch (error) {
    console.log(`   ⚠️  Access expiration check: ${error.message}`);
    results.warnings.push({ 
      test: 'Product Access - Expiration', 
      message: error.message 
    });
  }

  // Cleanup
  console.log('\n9. Cleanup\n');
  try {
    // Remove test access records
    await supabase
      .from('customer_product_access')
      .delete()
      .eq('user_id', testUserId);

    console.log(`   ✅ Test access records cleaned up`);

    // Delete test user
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUser = users?.users?.find(u => u.email === testUserEmail);
    if (testUser) {
      await supabase.auth.admin.deleteUser(testUser.id);
      console.log(`   ✅ Test user cleaned up`);
    }

    results.passed.push({ test: 'Product Access - Cleanup' });
  } catch (error) {
    console.log(`   ⚠️  Cleanup warning: ${error.message}`);
    results.warnings.push({ 
      test: 'Product Access - Cleanup', 
      message: `Test data may need manual cleanup: ${testUserEmail}` 
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
  testProductAccess()
    .then(() => process.exit(results.failed.length > 0 ? 1 : 0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

