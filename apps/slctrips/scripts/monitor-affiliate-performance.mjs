#!/usr/bin/env node

/**
 * Affiliate Performance Monitoring Script
 * 
 * Monitors affiliate link performance, checks for issues, and provides insights
 * Run weekly to ensure affiliates are performing well and generating revenue
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(title, 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
}

// Simple env loader (since we're in ESM)
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
  } catch (error) {
    // .env.local might not exist, that's okay
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// AWIN Configuration
const AWIN_PUBLISHER_ID = process.env.NEXT_PUBLIC_AWIN_AFFILIATE_ID || '2060961';
const BOOKING_MERCHANT_ID = '6776';
const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG || 'wasatchwise-20';

// New Affiliate Programs (January 2026)
const SITPACK_MERCHANT_ID = process.env.AWIN_SITPACK_MERCHANT_ID;
const FLEXTAIL_MERCHANT_ID = process.env.AWIN_FLEXTAIL_MERCHANT_ID;
const VSGO_MERCHANT_ID = process.env.AWIN_VSGO_MERCHANT_ID;
const GOWITHGUIDE_MERCHANT_ID = process.env.AWIN_GOWITHGUIDE_MERCHANT_ID;

async function checkAffiliateConfiguration() {
  header('🔧 Affiliate Configuration Check');

  const checks = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // Check AWIN Publisher ID
  if (AWIN_PUBLISHER_ID) {
    log(`✅ AWIN Publisher ID: ${AWIN_PUBLISHER_ID}`, 'green');
    checks.passed++;
  } else {
    log('❌ AWIN Publisher ID: NOT SET', 'red');
    checks.failed++;
  }

  // Check Booking.com Merchant ID
  if (BOOKING_MERCHANT_ID) {
    log(`✅ Booking.com Merchant ID: ${BOOKING_MERCHANT_ID}`, 'green');
    checks.passed++;
  } else {
    log('❌ Booking.com Merchant ID: NOT SET', 'red');
    checks.failed++;
  }

  // Check Amazon Affiliate Tag
  if (AMAZON_TAG) {
    log(`✅ Amazon Affiliate Tag: ${AMAZON_TAG}`, 'green');
    checks.passed++;
  } else {
    log('⚠️  Amazon Affiliate Tag: NOT SET', 'yellow');
    checks.warnings++;
  }

  // Check New Affiliate Programs (January 2026)
  log('\n📦 New Affiliate Programs:', 'blue');
  
  if (SITPACK_MERCHANT_ID) {
    log(`✅ Sitpack Merchant ID: ${SITPACK_MERCHANT_ID}`, 'green');
    checks.passed++;
  } else {
    log('⚠️  Sitpack Merchant ID: NOT SET (Get from AWIN dashboard)', 'yellow');
    checks.warnings++;
  }
  
  if (FLEXTAIL_MERCHANT_ID) {
    log(`✅ FLEXTAIL Merchant ID: ${FLEXTAIL_MERCHANT_ID}`, 'green');
    checks.passed++;
  } else {
    log('⚠️  FLEXTAIL Merchant ID: NOT SET (Get from AWIN dashboard)', 'yellow');
    checks.warnings++;
  }
  
  if (VSGO_MERCHANT_ID) {
    log(`✅ VSGO Merchant ID: ${VSGO_MERCHANT_ID}`, 'green');
    checks.passed++;
  } else {
    log('⚠️  VSGO Merchant ID: NOT SET (Get from AWIN dashboard)', 'yellow');
    checks.warnings++;
  }
  
  if (GOWITHGUIDE_MERCHANT_ID) {
    log(`✅ GoWithGuide US Merchant ID: ${GOWITHGUIDE_MERCHANT_ID}`, 'green');
    checks.passed++;
  } else {
    log('⚠️  GoWithGuide US Merchant ID: NOT SET (Get from AWIN dashboard)', 'yellow');
    checks.warnings++;
  }

  // Check Supabase (for analytics)
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    log('✅ Supabase configured (for analytics)', 'green');
    checks.passed++;
  } else {
    log('⚠️  Supabase not configured (analytics may be limited)', 'yellow');
    checks.warnings++;
  }

  return checks;
}

async function checkAffiliateLinks() {
  header('🔗 Affiliate Link Health Check');

  const testLinks = [
    {
      name: 'Homepage Car Rentals',
      url: `https://www.awin1.com/cread.php?awinmid=${BOOKING_MERCHANT_ID}&awinaffid=${AWIN_PUBLISHER_ID}&campaign=slctrips-homepage-cars&ued=https://www.booking.com/cars/index.en-us.html?location=Salt+Lake+City+International+Airport`,
      type: 'AWIN/Booking.com',
    },
    {
      name: 'Homepage Hotels',
      url: `https://www.awin1.com/cread.php?awinmid=${BOOKING_MERCHANT_ID}&awinaffid=${AWIN_PUBLISHER_ID}&campaign=slctrips-homepage-hotels&ued=https://www.booking.com/searchresults.html?ss=Salt+Lake+City`,
      type: 'AWIN/Booking.com',
    },
    {
      name: 'Amazon Search',
      url: `https://www.amazon.com/s?k=hiking+gear&tag=${AMAZON_TAG}`,
      type: 'Amazon',
    },
  ];

  const results = {
    total: testLinks.length,
    working: 0,
    broken: 0,
    warnings: 0,
  };

  log('Testing affiliate link formats...\n', 'blue');

  for (const link of testLinks) {
    // Check URL format
    const isValidFormat = link.url.includes('awin1.com') || link.url.includes('amazon.com');
    
    if (isValidFormat) {
      // Check AWIN format
      if (link.url.includes('awin1.com')) {
        const hasPublisherId = link.url.includes(`awinaffid=${AWIN_PUBLISHER_ID}`);
        const hasMerchantId = link.url.includes(`awinmid=${BOOKING_MERCHANT_ID}`);
        
        if (hasPublisherId && hasMerchantId) {
          log(`✅ ${link.name}: Format correct`, 'green');
          results.working++;
        } else {
          log(`⚠️  ${link.name}: Missing required parameters`, 'yellow');
          results.warnings++;
        }
      } else if (link.url.includes('amazon.com')) {
        const hasTag = link.url.includes(`tag=${AMAZON_TAG}`);
        
        if (hasTag) {
          log(`✅ ${link.name}: Format correct`, 'green');
          results.working++;
        } else {
          log(`⚠️  ${link.name}: Missing affiliate tag`, 'yellow');
          results.warnings++;
        }
      }
    } else {
      log(`❌ ${link.name}: Invalid URL format`, 'red');
      results.broken++;
    }
  }

  return results;
}

async function checkCodebaseAffiliateImplementation() {
  header('📝 Codebase Affiliate Implementation Check');

  const filesToCheck = [
    'src/lib/affiliates.ts',
    'src/components/AWINMasterTag.tsx',
    'src/components/BookYourAdventure.tsx',
    'src/components/BookingAccommodations.tsx',
    'src/components/BookingCarRentals.tsx',
    'src/components/BookingFlights.tsx',
  ];

  const results = {
    found: 0,
    missing: 0,
  };

  log('Checking affiliate implementation files...\n', 'blue');

  for (const file of filesToCheck) {
    if (existsSync(file)) {
      log(`✅ ${file}: Exists`, 'green');
      results.found++;
    } else {
      log(`❌ ${file}: MISSING`, 'red');
      results.missing++;
    }
  }

  // Check for AWIN MasterTag in layout
  try {
    if (existsSync('src/app/layout.tsx')) {
      const layoutContent = readFileSync('src/app/layout.tsx', 'utf-8');
      if (layoutContent.includes('AWINMasterTag')) {
        log('✅ AWIN MasterTag included in layout', 'green');
        results.found++;
      } else {
        log('❌ AWIN MasterTag NOT in layout', 'red');
        results.missing++;
      }
    } else {
      log('⚠️  layout.tsx not found', 'yellow');
    }
  } catch (error) {
    log('⚠️  Could not check layout.tsx', 'yellow');
  }

  // Check CSP headers for AWIN
  try {
    if (existsSync('next.config.js')) {
      const nextConfigContent = readFileSync('next.config.js', 'utf-8');
      if (nextConfigContent.includes('awin1.com')) {
        log('✅ AWIN domain in CSP headers', 'green');
        results.found++;
      } else {
        log('⚠️  AWIN domain may not be in CSP headers', 'yellow');
      }
    } else {
      log('⚠️  next.config.js not found', 'yellow');
    }
  } catch (error) {
    log('⚠️  Could not check next.config.js', 'yellow');
  }

  return results;
}

async function generateAffiliateReport() {
  header('📊 Affiliate Performance Report Generator');

  log('This script checks affiliate implementation and configuration.\n', 'blue');
  log('For actual performance data, check:', 'yellow');
  log('  1. AWIN Dashboard: https://www.awin.com', 'cyan');
  log('  2. Google Analytics: Event reports for "affiliate_click"', 'cyan');
  log('  3. Booking.com Partner Hub: https://www.booking.com/affiliate-program\n', 'cyan');

  log('Manual checks needed:', 'yellow');
  log('  - AWIN dashboard: Review clicks, conversions, revenue', 'cyan');
  log('  - GA4 reports: Check affiliate event tracking', 'cyan');
  log('  - Link testing: Click affiliate links to verify they work', 'cyan');
  log('  - Revenue trends: Compare month-over-month performance\n', 'cyan');
}

async function checkAffiliateAnalytics() {
  header('📈 Affiliate Analytics Setup Check');

  log('Checking Google Analytics tracking implementation...\n', 'blue');

  // Check for gtag implementation
  try {
    if (existsSync('src/app/layout.tsx')) {
      const layoutContent = readFileSync('src/app/layout.tsx', 'utf-8');
      if (layoutContent.includes('gtag') || layoutContent.includes('GoogleAnalytics')) {
        log('✅ Google Analytics implementation found', 'green');
      } else {
        log('⚠️  Google Analytics may not be implemented', 'yellow');
      }
    } else {
      log('⚠️  layout.tsx not found', 'yellow');
    }
  } catch (error) {
    log('⚠️  Could not check analytics implementation', 'yellow');
  }

  // Check for affiliate click tracking
  try {
    if (existsSync('src/lib/affiliates.ts')) {
      const affiliatesContent = readFileSync('src/lib/affiliates.ts', 'utf-8');
      if (affiliatesContent.includes('trackAffiliateClick') && affiliatesContent.includes('gtag')) {
        log('✅ Affiliate click tracking function found', 'green');
      } else {
        log('⚠️  Affiliate click tracking may be missing', 'yellow');
      }
    } else {
      log('⚠️  affiliates.ts not found', 'yellow');
    }
  } catch (error) {
    log('⚠️  Could not check affiliate tracking', 'yellow');
  }

  log('\n📝 To verify analytics are working:', 'yellow');
  log('  1. Open browser DevTools → Network tab', 'cyan');
  log('  2. Click an affiliate link', 'cyan');
  log('  3. Look for gtag event: "affiliate_click" or "booking_click"', 'cyan');
  log('  4. Check GA4 Events report to confirm data is flowing\n', 'cyan');
}

async function generateRecommendations() {
  header('💡 Recommendations');

  log('Affiliate Optimization Tips:\n', 'blue');

  log('1. Link Placement:', 'yellow');
  log('   - Place affiliate links above the fold on high-traffic pages', 'cyan');
  log('   - Include links in TripKit viewer for monetization', 'cyan');
  log('   - Add links to destination pages where users are planning trips', 'cyan');

  log('\n2. Campaign Tracking:', 'yellow');
  log('   - Use descriptive campaign names for easy analysis', 'cyan');
  log('   - Include destination/TripKit context in campaign parameters', 'cyan');
  log('   - Track performance by page type (homepage, destination, TripKit)', 'cyan');

  log('\n3. Revenue Monitoring:', 'yellow');
  log('   - Review AWIN dashboard weekly for trends', 'cyan');
  log('   - Compare month-over-month revenue', 'cyan');
  log('   - Identify top-performing pages and replicate', 'cyan');

  log('\n4. Optimization:', 'yellow');
  log('   - A/B test link placement and wording', 'cyan');
  log('   - Test different call-to-action buttons', 'cyan');
  log('   - Monitor conversion rates and optimize underperformers', 'cyan');

  log('\n5. Maintenance:', 'yellow');
  log('   - Regularly check for broken links', 'cyan');
  log('   - Verify AWIN MasterTag is loading', 'cyan');
  log('   - Monitor for tracking discrepancies', 'cyan');
}

async function main() {
  log('\n💰 Affiliate Performance Monitor', 'magenta');
  log('================================\n', 'magenta');

  const configResults = await checkAffiliateConfiguration();
  const linkResults = await checkAffiliateLinks();
  const codeResults = await checkCodebaseAffiliateImplementation();
  await checkAffiliateAnalytics();
  await generateAffiliateReport();
  await generateRecommendations();

  // Summary
  header('📊 Summary');

  log('Configuration:', 'blue');
  log(`  ✅ Passed: ${configResults.passed}`, 'green');
  log(`  ❌ Failed: ${configResults.failed}`, configResults.failed > 0 ? 'red' : 'green');
  log(`  ⚠️  Warnings: ${configResults.warnings}`, configResults.warnings > 0 ? 'yellow' : 'green');

  log('\nLink Health:', 'blue');
  log(`  ✅ Working: ${linkResults.working}`, 'green');
  log(`  ❌ Broken: ${linkResults.broken}`, linkResults.broken > 0 ? 'red' : 'green');
  log(`  ⚠️  Warnings: ${linkResults.warnings}`, linkResults.warnings > 0 ? 'yellow' : 'green');

  log('\nCode Implementation:', 'blue');
  log(`  ✅ Files Found: ${codeResults.found}`, 'green');
  log(`  ❌ Files Missing: ${codeResults.missing}`, codeResults.missing > 0 ? 'red' : 'green');

  log('\n' + '='.repeat(60), 'cyan');
  
  if (configResults.failed === 0 && linkResults.broken === 0 && codeResults.missing === 0) {
    log('✅ Affiliate implementation looks healthy!', 'green');
  } else {
    log('⚠️  Some issues found - review above and fix critical items', 'yellow');
  }

  log('='.repeat(60) + '\n', 'cyan');

  log('📝 Next Steps:', 'yellow');
  log('  1. Check AWIN dashboard for actual performance data', 'cyan');
  log('  2. Verify affiliate links work in production', 'cyan');
  log('  3. Review Google Analytics for affiliate events', 'cyan');
  log('  4. Monitor revenue trends and optimize underperformers\n', 'cyan');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
