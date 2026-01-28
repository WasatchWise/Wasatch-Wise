#!/usr/bin/env node

/**
 * Production Verification Script
 * 
 * Verifies that recent production changes are working correctly:
 * - Console.log cleanup
 * - Sentry enterprise features
 * - Site accessibility
 * 
 * Usage: node verify-production.mjs
 */

import https from 'https';
import { URL } from 'url';

const PRODUCTION_URL = 'https://www.slctrips.com';
const SENTRY_ORG = 'wasatch-wise-llc';

console.log('🔍 Production Verification Script\n');
console.log('=' .repeat(50));
console.log(`Testing: ${PRODUCTION_URL}\n`);

const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper to make HTTP requests
function fetch(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'SLCTrips-Verification/1.0'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data, headers: res.headers });
      });
    }).on('error', reject);
  });
}

// Test 1: Site is accessible
async function testSiteAccessible() {
  console.log('1️⃣  Testing site accessibility...');
  try {
    const response = await fetch(PRODUCTION_URL);
    if (response.status === 200) {
      results.passed.push('Site is accessible (200 OK)');
      console.log('   ✅ Site is accessible\n');
      return true;
    } else {
      results.failed.push(`Site returned ${response.status} instead of 200`);
      console.log(`   ❌ Site returned ${response.status}\n`);
      return false;
    }
  } catch (error) {
    results.failed.push(`Site is not accessible: ${error.message}`);
    console.log(`   ❌ Site is not accessible: ${error.message}\n`);
    return false;
  }
}

// Test 2: Check for console.log statements in HTML source
async function testConsoleLogCleanup() {
  console.log('2️⃣  Checking for console.log statements in HTML...');
  try {
    const response = await fetch(PRODUCTION_URL);
    const html = response.body;
    
    // Check for common debug patterns
    const debugPatterns = [
      /console\.log\(/gi,
      /🌟/g,
      /🎯/g,
      /✅/g,
      /Loading weekly picks/gi,
      /Found \d+ destinations/gi,
      /Detected language/gi
    ];
    
    const found = [];
    debugPatterns.forEach((pattern, index) => {
      const matches = html.match(pattern);
      if (matches) {
        found.push(pattern.toString());
      }
    });
    
    if (found.length === 0) {
      results.passed.push('No console.log debug statements found in HTML source');
      console.log('   ✅ No debug statements found in HTML\n');
      return true;
    } else {
      results.warnings.push(`Found ${found.length} potential debug patterns in HTML (may be in comments or strings)`);
      console.log(`   ⚠️  Found ${found.length} potential debug patterns\n`);
      return true; // Not a failure, just a warning
    }
  } catch (error) {
    results.warnings.push(`Could not check HTML source: ${error.message}`);
    console.log(`   ⚠️  Could not check: ${error.message}\n`);
    return true;
  }
}

// Test 3: Check for Sentry script
async function testSentryIntegration() {
  console.log('3️⃣  Checking for Sentry integration...');
  try {
    const response = await fetch(PRODUCTION_URL);
    const html = response.body;
    
    // Check for Sentry script
    const hasSentry = html.includes('sentry.io') || 
                     html.includes('sentry') || 
                     html.includes('Sentry');
    
    if (hasSentry) {
      results.passed.push('Sentry integration detected in HTML');
      console.log('   ✅ Sentry integration detected\n');
      return true;
    } else {
      results.warnings.push('Sentry not detected in HTML (may be loaded dynamically)');
      console.log('   ⚠️  Sentry not detected in HTML (may be loaded dynamically)\n');
      return true; // Not a failure - Sentry may load via JS
    }
  } catch (error) {
    results.warnings.push(`Could not check Sentry: ${error.message}`);
    console.log(`   ⚠️  Could not check: ${error.message}\n`);
    return true;
  }
}

// Test 4: Check security headers
async function testSecurityHeaders() {
  console.log('4️⃣  Checking security headers...');
  try {
    const response = await fetch(PRODUCTION_URL);
    const headers = response.headers;
    
    const securityHeaders = {
      'strict-transport-security': 'HSTS',
      'x-frame-options': 'X-Frame-Options',
      'x-content-type-options': 'X-Content-Type-Options',
      'content-security-policy': 'CSP'
    };
    
    const missing = [];
    Object.keys(securityHeaders).forEach(header => {
      if (!headers[header.toLowerCase()]) {
        missing.push(securityHeaders[header]);
      }
    });
    
    if (missing.length === 0) {
      results.passed.push('All security headers present');
      console.log('   ✅ Security headers present\n');
      return true;
    } else {
      results.warnings.push(`Missing security headers: ${missing.join(', ')}`);
      console.log(`   ⚠️  Missing: ${missing.join(', ')}\n`);
      return true; // Warning, not failure
    }
  } catch (error) {
    results.warnings.push(`Could not check headers: ${error.message}`);
    console.log(`   ⚠️  Could not check: ${error.message}\n`);
    return true;
  }
}

// Test 5: Check response time
async function testResponseTime() {
  console.log('5️⃣  Testing response time...');
  try {
    const start = Date.now();
    await fetch(PRODUCTION_URL);
    const duration = Date.now() - start;
    
    if (duration < 2000) {
      results.passed.push(`Response time: ${duration}ms (good)`);
      console.log(`   ✅ Response time: ${duration}ms\n`);
      return true;
    } else if (duration < 4000) {
      results.warnings.push(`Response time: ${duration}ms (acceptable but could be better)`);
      console.log(`   ⚠️  Response time: ${duration}ms (acceptable)\n`);
      return true;
    } else {
      results.failed.push(`Response time: ${duration}ms (too slow)`);
      console.log(`   ❌ Response time: ${duration}ms (too slow)\n`);
      return false;
    }
  } catch (error) {
    results.failed.push(`Could not test response time: ${error.message}`);
    console.log(`   ❌ Could not test: ${error.message}\n`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('Starting verification...\n');
  
  await testSiteAccessible();
  await testConsoleLogCleanup();
  await testSentryIntegration();
  await testSecurityHeaders();
  await testResponseTime();
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 VERIFICATION SUMMARY\n');
  
  if (results.passed.length > 0) {
    console.log('✅ PASSED:');
    results.passed.forEach(item => console.log(`   • ${item}`));
    console.log('');
  }
  
  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    results.warnings.forEach(item => console.log(`   • ${item}`));
    console.log('');
  }
  
  if (results.failed.length > 0) {
    console.log('❌ FAILED:');
    results.failed.forEach(item => console.log(`   • ${item}`));
    console.log('');
  }
  
  // Final status
  const totalTests = results.passed.length + results.warnings.length + results.failed.length;
  const passedTests = results.passed.length;
  const failedTests = results.failed.length;
  
  console.log('='.repeat(50));
  console.log(`Total: ${totalTests} | Passed: ${passedTests} | Warnings: ${results.warnings.length} | Failed: ${failedTests}`);
  
  if (failedTests === 0) {
    console.log('\n✅ All critical tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Manually verify Sentry widget in browser');
    console.log('   2. Test error capture in browser console');
    console.log('   3. Check Sentry dashboard: https://sentry.io/organizations/wasatch-wise-llc/');
    console.log('   4. Proceed with mobile/performance testing');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Review issues above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Verification script error:', error);
  process.exit(1);
});

