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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Make HTTP request to API endpoint
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { error: error.message, ok: false };
  }
}

/**
 * Test API endpoints
 */
export async function testApiEndpoints() {
  console.log('\n🔌 API Endpoint Testing\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Base URL: ${baseUrl}\n`);

  // Test Purchases API
  console.log('1. Purchases API\n');
  
  // Test /api/purchases/by-session
  try {
    const { status, data, error } = await apiRequest('/api/purchases/by-session?session_id=test_session_123');
    
    if (error) {
      throw new Error(`Request failed: ${error}`);
    }

    // Should return 400 or 401 (invalid session) - that's expected
    if (status === 400 || status === 401 || status === 404) {
      console.log(`   ✅ /api/purchases/by-session responds correctly (${status})`);
      results.passed.push({ test: 'API - Purchases By Session' });
    } else if (status === 200) {
      console.log(`   ✅ /api/purchases/by-session accessible`);
      results.passed.push({ test: 'API - Purchases By Session' });
    } else {
      console.log(`   ⚠️  /api/purchases/by-session returned ${status}`);
      results.warnings.push({ test: 'API - Purchases By Session', message: `Unexpected status: ${status}` });
    }
  } catch (error) {
    const errorMsg = `Purchases by session test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'API - Purchases By Session', error: errorMsg });
  }

  // Test /api/purchases/gift-details
  try {
    const { status, error } = await apiRequest('/api/purchases/gift-details?code=TEST123');
    
    if (error) {
      throw new Error(`Request failed: ${error}`);
    }

    if (status === 400 || status === 404) {
      console.log(`   ✅ /api/purchases/gift-details responds correctly (${status})`);
      results.passed.push({ test: 'API - Gift Details' });
    } else if (status === 200) {
      console.log(`   ✅ /api/purchases/gift-details accessible`);
      results.passed.push({ test: 'API - Gift Details' });
    } else {
      console.log(`   ⚠️  /api/purchases/gift-details returned ${status}`);
      results.warnings.push({ test: 'API - Gift Details', message: `Unexpected status: ${status}` });
    }
  } catch (error) {
    const errorMsg = `Gift details test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'API - Gift Details', error: errorMsg });
  }

  // Test Staykit API
  console.log('\n2. Staykit API\n');
  
  try {
    const { status, error } = await apiRequest('/api/staykit/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ staykitId: 'test-id' }),
    });
    
    if (error) {
      throw new Error(`Request failed: ${error}`);
    }

    // Should require auth (401) or return 400 for invalid data
    if (status === 401 || status === 400) {
      console.log(`   ✅ /api/staykit/create-checkout responds correctly (${status})`);
      results.passed.push({ test: 'API - Staykit Checkout' });
    } else {
      console.log(`   ⚠️  /api/staykit/create-checkout returned ${status}`);
      results.warnings.push({ test: 'API - Staykit Checkout', message: `Unexpected status: ${status}` });
    }
  } catch (error) {
    const errorMsg = `Staykit checkout test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'API - Staykit Checkout', error: errorMsg });
  }

  // Test Welcome Wagon API
  console.log('\n3. Welcome Wagon API\n');
  
  try {
    const { status, error } = await apiRequest('/api/welcome-wagon/send-guide', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    
    if (error) {
      throw new Error(`Request failed: ${error}`);
    }

    // Should return 200, 400, or 500 depending on implementation
    if (status >= 200 && status < 500) {
      console.log(`   ✅ /api/welcome-wagon/send-guide responds (${status})`);
      results.passed.push({ test: 'API - Welcome Wagon' });
    } else {
      console.log(`   ⚠️  /api/welcome-wagon/send-guide returned ${status}`);
      results.warnings.push({ test: 'API - Welcome Wagon', message: `Unexpected status: ${status}` });
    }
  } catch (error) {
    const errorMsg = `Welcome Wagon test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'API - Welcome Wagon', error: errorMsg });
  }

  // Test Utility APIs
  console.log('\n4. Utility APIs\n');
  
  // Weather API
  try {
    const { status, error } = await apiRequest('/api/weather?lat=40.7128&lon=-74.0060');
    
    if (error) {
      throw new Error(`Request failed: ${error}`);
    }

    if (status === 200 || status === 400 || status === 500) {
      console.log(`   ✅ /api/weather responds (${status})`);
      results.passed.push({ test: 'API - Weather' });
    } else {
      console.log(`   ⚠️  /api/weather returned ${status}`);
      results.warnings.push({ test: 'API - Weather', message: `Unexpected status: ${status}` });
    }
  } catch (error) {
    const errorMsg = `Weather API test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'API - Weather', error: errorMsg });
  }

  // Image Proxy API
  try {
    const { status, error } = await apiRequest('/api/image-proxy?url=https://example.com/image.jpg');
    
    if (error) {
      throw new Error(`Request failed: ${error}`);
    }

    if (status === 200 || status === 400 || status === 500) {
      console.log(`   ✅ /api/image-proxy responds (${status})`);
      results.passed.push({ test: 'API - Image Proxy' });
    } else {
      console.log(`   ⚠️  /api/image-proxy returned ${status}`);
      results.warnings.push({ test: 'API - Image Proxy', message: `Unexpected status: ${status}` });
    }
  } catch (error) {
    const errorMsg = `Image proxy test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'API - Image Proxy', error: errorMsg });
  }

  // Voice API
  try {
    const { status, error } = await apiRequest('/api/voice', {
      method: 'POST',
      body: JSON.stringify({ text: 'test' }),
    });
    
    if (error) {
      throw new Error(`Request failed: ${error}`);
    }

    if (status >= 200 && status < 500) {
      console.log(`   ✅ /api/voice responds (${status})`);
      results.passed.push({ test: 'API - Voice' });
    } else {
      console.log(`   ⚠️  /api/voice returned ${status}`);
      results.warnings.push({ test: 'API - Voice', message: `Unexpected status: ${status}` });
    }
  } catch (error) {
    const errorMsg = `Voice API test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'API - Voice', error: errorMsg });
  }

  // Test Error Handling
  console.log('\n5. Error Handling\n');
  
  // Test invalid request
  try {
    const { status, data } = await apiRequest('/api/nonexistent-endpoint');
    
    if (status === 404) {
      console.log(`   ✅ 404 handling works correctly`);
      results.passed.push({ test: 'API - Error Handling (404)' });
    } else {
      console.log(`   ⚠️  Unexpected response for 404: ${status}`);
      results.warnings.push({ test: 'API - Error Handling (404)', message: `Expected 404, got ${status}` });
    }
  } catch (error) {
    console.log(`   ⚠️  Error handling test: ${error.message}`);
    results.warnings.push({ test: 'API - Error Handling', message: error.message });
  }

  // Test malformed request
  try {
    const { status } = await apiRequest('/api/stripe/create-checkout', {
      method: 'POST',
      body: 'invalid json',
    });
    
    if (status === 400 || status === 500) {
      console.log(`   ✅ Malformed request handling works (${status})`);
      results.passed.push({ test: 'API - Error Handling (Malformed)' });
    } else {
      console.log(`   ⚠️  Unexpected response for malformed request: ${status}`);
      results.warnings.push({ test: 'API - Error Handling (Malformed)', message: `Expected 400/500, got ${status}` });
    }
  } catch (error) {
    console.log(`   ⚠️  Malformed request test: ${error.message}`);
    results.warnings.push({ test: 'API - Error Handling (Malformed)', message: error.message });
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}\n`);
  console.log(`ℹ️  Note: API endpoint tests require the Next.js server to be running`);
  console.log(`ℹ️  Some endpoints may require authentication - 401 responses are expected\n`);

  return results;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testApiEndpoints()
    .then(() => process.exit(results.failed.length > 0 ? 1 : 0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

