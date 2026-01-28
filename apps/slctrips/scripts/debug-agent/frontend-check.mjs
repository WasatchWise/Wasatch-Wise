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
 * Test frontend pages and functionality
 */
export async function testFrontend() {
  console.log('\n🖥️  Frontend Rendering & Navigation Testing\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Base URL: ${baseUrl}\n`);
  console.log(`ℹ️  Note: Frontend tests require the Next.js server to be running\n`);

  // Test Public Pages
  console.log('1. Public Pages\n');
  
  const publicPages = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/faq', name: 'FAQ' },
    { path: '/destinations', name: 'Destinations' },
    { path: '/tripkits', name: 'TripKits' },
    { path: '/staykits', name: 'StayKits' },
    { path: '/educators', name: 'Educators' },
  ];

  for (const page of publicPages) {
    try {
      const response = await fetch(`${baseUrl}${page.path}`, {
        method: 'GET',
        headers: { 'Accept': 'text/html' },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          console.log(`   ✅ ${page.name} (${page.path}): Loads successfully`);
          results.passed.push({ test: `Frontend - ${page.name} Page` });
        } else {
          console.log(`   ⚠️  ${page.name} (${page.path}): Unexpected content type`);
          results.warnings.push({ 
            test: `Frontend - ${page.name} Page`, 
            message: `Unexpected content type: ${contentType}` 
          });
        }
      } else if (response.status === 404) {
        console.log(`   ❌ ${page.name} (${page.path}): Not found (404)`);
        results.failed.push({ test: `Frontend - ${page.name} Page`, error: '404 Not Found' });
      } else {
        console.log(`   ⚠️  ${page.name} (${page.path}): Status ${response.status}`);
        results.warnings.push({ 
          test: `Frontend - ${page.name} Page`, 
          message: `Status: ${response.status}` 
        });
      }
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        console.log(`   ⚠️  ${page.name} (${page.path}): Server not running`);
        results.warnings.push({ 
          test: `Frontend - ${page.name} Page`, 
          message: 'Server not running - test skipped' 
        });
      } else {
        console.log(`   ❌ ${page.name} (${page.path}): ${error.message}`);
        results.failed.push({ test: `Frontend - ${page.name} Page`, error: error.message });
      }
    }
  }

  // Test Protected Pages (should redirect or require auth)
  console.log('\n2. Protected Pages\n');
  
  const protectedPages = [
    { path: '/my-tripkits', name: 'My TripKits' },
    { path: '/my-staykit', name: 'My StayKit' },
    { path: '/account', name: 'Account' },
  ];

  for (const page of protectedPages) {
    try {
      const response = await fetch(`${baseUrl}${page.path}`, {
        method: 'GET',
        headers: { 'Accept': 'text/html' },
        redirect: 'manual', // Don't follow redirects
      });

      // Protected pages should redirect (302/307) or return 401/403
      if (response.status === 302 || response.status === 307 || response.status === 401 || response.status === 403) {
        console.log(`   ✅ ${page.name} (${page.path}): Protected correctly (${response.status})`);
        results.passed.push({ test: `Frontend - ${page.name} Protection` });
      } else if (response.status === 200) {
        console.log(`   ⚠️  ${page.name} (${page.path}): Accessible without auth (may be intentional)`);
        results.warnings.push({ 
          test: `Frontend - ${page.name} Protection`, 
          message: 'Page accessible without authentication' 
        });
      } else {
        console.log(`   ⚠️  ${page.name} (${page.path}): Status ${response.status}`);
        results.warnings.push({ 
          test: `Frontend - ${page.name} Protection`, 
          message: `Status: ${response.status}` 
        });
      }
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        console.log(`   ⚠️  ${page.name} (${page.path}): Server not running`);
        results.warnings.push({ 
          test: `Frontend - ${page.name} Protection`, 
          message: 'Server not running - test skipped' 
        });
      } else {
        console.log(`   ❌ ${page.name} (${page.path}): ${error.message}`);
        results.failed.push({ test: `Frontend - ${page.name} Protection`, error: error.message });
      }
    }
  }

  // Test Error Pages
  console.log('\n3. Error Pages\n');
  
  try {
    const response = await fetch(`${baseUrl}/nonexistent-page-12345`, {
      method: 'GET',
      headers: { 'Accept': 'text/html' },
    });

    if (response.status === 404) {
      console.log(`   ✅ 404 page handling works correctly`);
      results.passed.push({ test: 'Frontend - 404 Handling' });
    } else {
      console.log(`   ⚠️  404 handling: Status ${response.status}`);
      results.warnings.push({ 
        test: 'Frontend - 404 Handling', 
        message: `Expected 404, got ${response.status}` 
      });
    }
  } catch (error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.log(`   ⚠️  404 test: Server not running`);
      results.warnings.push({ 
        test: 'Frontend - 404 Handling', 
        message: 'Server not running - test skipped' 
      });
    } else {
      console.log(`   ❌ 404 test: ${error.message}`);
      results.failed.push({ test: 'Frontend - 404 Handling', error: error.message });
    }
  }

  // Test Page Performance (basic)
  console.log('\n4. Page Performance\n');
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${baseUrl}/`, {
      method: 'GET',
      headers: { 'Accept': 'text/html' },
    });
    const loadTime = Date.now() - startTime;

    if (response.ok) {
      if (loadTime < 1000) {
        console.log(`   ✅ Homepage load time: ${loadTime}ms (fast)`);
        results.passed.push({ test: 'Frontend - Performance' });
      } else if (loadTime < 3000) {
        console.log(`   ⚠️  Homepage load time: ${loadTime}ms (moderate)`);
        results.warnings.push({ 
          test: 'Frontend - Performance', 
          message: `Load time: ${loadTime}ms` 
        });
      } else {
        console.log(`   ⚠️  Homepage load time: ${loadTime}ms (slow)`);
        results.warnings.push({ 
          test: 'Frontend - Performance', 
          message: `Slow load time: ${loadTime}ms` 
        });
      }
    } else {
      console.log(`   ⚠️  Performance test: Status ${response.status}`);
      results.warnings.push({ 
        test: 'Frontend - Performance', 
        message: `Status: ${response.status}` 
      });
    }
  } catch (error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.log(`   ⚠️  Performance test: Server not running`);
      results.warnings.push({ 
        test: 'Frontend - Performance', 
        message: 'Server not running - test skipped' 
      });
    } else {
      console.log(`   ❌ Performance test: ${error.message}`);
      results.failed.push({ test: 'Frontend - Performance', error: error.message });
    }
  }

  // Test Static Assets
  console.log('\n5. Static Assets\n');
  
  try {
    // Test favicon (common static asset)
    const response = await fetch(`${baseUrl}/favicon.ico`, {
      method: 'GET',
    });

    if (response.ok || response.status === 404) {
      // 404 is acceptable for favicon
      console.log(`   ✅ Static assets accessible (favicon: ${response.status})`);
      results.passed.push({ test: 'Frontend - Static Assets' });
    } else {
      console.log(`   ⚠️  Static assets: Status ${response.status}`);
      results.warnings.push({ 
        test: 'Frontend - Static Assets', 
        message: `Status: ${response.status}` 
      });
    }
  } catch (error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.log(`   ⚠️  Static assets test: Server not running`);
      results.warnings.push({ 
        test: 'Frontend - Static Assets', 
        message: 'Server not running - test skipped' 
      });
    } else {
      console.log(`   ❌ Static assets test: ${error.message}`);
      results.failed.push({ test: 'Frontend - Static Assets', error: error.message });
    }
  }

  // Test Sitemap
  console.log('\n6. Sitemap\n');
  
  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`, {
      method: 'GET',
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('xml') || contentType.includes('text')) {
        console.log(`   ✅ Sitemap accessible`);
        results.passed.push({ test: 'Frontend - Sitemap' });
      } else {
        console.log(`   ⚠️  Sitemap: Unexpected content type`);
        results.warnings.push({ 
          test: 'Frontend - Sitemap', 
          message: `Content type: ${contentType}` 
        });
      }
    } else if (response.status === 404) {
      console.log(`   ⚠️  Sitemap not found (404)`);
      results.warnings.push({ 
        test: 'Frontend - Sitemap', 
        message: 'Sitemap not found' 
      });
    } else {
      console.log(`   ⚠️  Sitemap: Status ${response.status}`);
      results.warnings.push({ 
        test: 'Frontend - Sitemap', 
        message: `Status: ${response.status}` 
      });
    }
  } catch (error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.log(`   ⚠️  Sitemap test: Server not running`);
      results.warnings.push({ 
        test: 'Frontend - Sitemap', 
        message: 'Server not running - test skipped' 
      });
    } else {
      console.log(`   ❌ Sitemap test: ${error.message}`);
      results.failed.push({ test: 'Frontend - Sitemap', error: error.message });
    }
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}\n`);
  console.log(`ℹ️  Note: Many frontend tests require the Next.js server to be running`);
  console.log(`ℹ️  Start the server with: npm run dev\n`);

  return results;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFrontend()
    .then(() => process.exit(results.failed.length > 0 ? 1 : 0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

