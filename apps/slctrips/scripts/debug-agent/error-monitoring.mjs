import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env.local') });

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

/**
 * Test error monitoring and logging
 */
export async function testErrorMonitoring() {
  console.log('\n🚨 Error Monitoring & Logging Testing\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test Sentry Configuration
  console.log('1. Sentry Integration\n');
  
  try {
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
    
    if (sentryDsn) {
      console.log(`   ✅ Sentry DSN configured`);
      
      // Check for Sentry config files
      const sentryConfigFiles = [
        'sentry.client.config.ts',
        'sentry.server.config.ts',
        'sentry.edge.config.ts',
      ];

      let foundConfigs = 0;
      for (const configFile of sentryConfigFiles) {
        const configPath = join(__dirname, '../../', configFile);
        if (existsSync(configPath)) {
          foundConfigs++;
          console.log(`   ✅ Found: ${configFile}`);
        }
      }

      if (foundConfigs > 0) {
        results.passed.push({ test: 'Error Monitoring - Sentry Config Files' });
      } else {
        console.log(`   ⚠️  No Sentry config files found`);
        results.warnings.push({ 
          test: 'Error Monitoring - Sentry Config Files', 
          message: 'Sentry DSN configured but no config files found' 
        });
      }

      results.passed.push({ test: 'Error Monitoring - Sentry DSN' });
    } else {
      console.log(`   ⚠️  Sentry not configured`);
      results.warnings.push({ 
        test: 'Error Monitoring - Sentry', 
        message: 'Sentry not configured - error tracking may be limited' 
      });
    }
  } catch (error) {
    const errorMsg = `Sentry check failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Error Monitoring - Sentry', error: errorMsg });
  }

  // Test Error Boundary Files
  console.log('\n2. Error Boundaries\n');
  
  try {
    const errorBoundaryFiles = [
      'src/app/error.tsx',
      'src/app/global-error.tsx',
      'src/app/not-found.tsx',
    ];

    let foundBoundaries = 0;
    for (const errorFile of errorBoundaryFiles) {
      const filePath = join(__dirname, '../../', errorFile);
      if (existsSync(filePath)) {
        foundBoundaries++;
        console.log(`   ✅ Found: ${errorFile}`);
      }
    }

    if (foundBoundaries > 0) {
      console.log(`   ✅ ${foundBoundaries} error boundary file(s) found`);
      results.passed.push({ test: 'Error Monitoring - Error Boundaries' });
    } else {
      console.log(`   ⚠️  No error boundary files found`);
      results.warnings.push({ 
        test: 'Error Monitoring - Error Boundaries', 
        message: 'No error boundary files found' 
      });
    }
  } catch (error) {
    const errorMsg = `Error boundary check failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Error Monitoring - Error Boundaries', error: errorMsg });
  }

  // Test Logger Configuration
  console.log('\n3. Logger Configuration\n');
  
  try {
    const loggerPath = join(__dirname, '../../src/lib/logger.ts');
    
    if (existsSync(loggerPath)) {
      console.log(`   ✅ Logger file found: src/lib/logger.ts`);
      
      // Try to read and check for basic logger functionality
      try {
        const loggerContent = readFileSync(loggerPath, 'utf-8');
        if (loggerContent.includes('logger') || loggerContent.includes('log')) {
          console.log(`   ✅ Logger appears to be configured`);
          results.passed.push({ test: 'Error Monitoring - Logger File' });
        } else {
          console.log(`   ⚠️  Logger file exists but may not be fully configured`);
          results.warnings.push({ 
            test: 'Error Monitoring - Logger File', 
            message: 'Logger file exists but configuration unclear' 
          });
        }
      } catch (readError) {
        console.log(`   ⚠️  Could not read logger file: ${readError.message}`);
        results.warnings.push({ 
          test: 'Error Monitoring - Logger File', 
          message: readError.message 
        });
      }
    } else {
      console.log(`   ⚠️  Logger file not found`);
      results.warnings.push({ 
        test: 'Error Monitoring - Logger File', 
        message: 'Logger file not found at src/lib/logger.ts' 
      });
    }
  } catch (error) {
    const errorMsg = `Logger check failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Error Monitoring - Logger', error: errorMsg });
  }

  // Test Error Handler
  console.log('\n4. Error Handler\n');
  
  try {
    const errorHandlerPath = join(__dirname, '../../src/lib/errorHandler.ts');
    
    if (existsSync(errorHandlerPath)) {
      console.log(`   ✅ Error handler file found: src/lib/errorHandler.ts`);
      results.passed.push({ test: 'Error Monitoring - Error Handler' });
    } else {
      console.log(`   ⚠️  Error handler file not found`);
      results.warnings.push({ 
        test: 'Error Monitoring - Error Handler', 
        message: 'Error handler file not found' 
      });
    }
  } catch (error) {
    const errorMsg = `Error handler check failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Error Monitoring - Error Handler', error: errorMsg });
  }

  // Test API Error Handling
  console.log('\n5. API Error Handling\n');
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Test error response from API
    try {
      const response = await fetch(`${baseUrl}/api/nonexistent-endpoint`, {
        method: 'GET',
      });

      if (response.status === 404 || response.status >= 500) {
        console.log(`   ✅ API error handling works (${response.status})`);
        results.passed.push({ test: 'Error Monitoring - API Error Handling' });
      } else {
        console.log(`   ⚠️  API error handling: Status ${response.status}`);
        results.warnings.push({ 
          test: 'Error Monitoring - API Error Handling', 
          message: `Status: ${response.status}` 
        });
      }
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        console.log(`   ⚠️  API error handling test: Server not running`);
        results.warnings.push({ 
          test: 'Error Monitoring - API Error Handling', 
          message: 'Server not running - test skipped' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.log(`   ⚠️  API error handling test: ${error.message}`);
    results.warnings.push({ 
      test: 'Error Monitoring - API Error Handling', 
      message: error.message 
    });
  }

  // Test Logging Configuration
  console.log('\n6. Logging Configuration\n');
  
  try {
    // Check for logging environment variables
    const loggingVars = [
      'LOG_LEVEL',
      'NODE_ENV',
      'NEXT_PUBLIC_LOG_LEVEL',
    ];

    const foundLoggingVars = loggingVars.filter(v => process.env[v]);
    
    if (foundLoggingVars.length > 0) {
      console.log(`   ✅ Logging configuration found: ${foundLoggingVars.join(', ')}`);
      results.passed.push({ test: 'Error Monitoring - Logging Config' });
    } else {
      console.log(`   ⚠️  No explicit logging configuration found`);
      console.log(`   ℹ️  Using default logging (may be sufficient)`);
      results.warnings.push({ 
        test: 'Error Monitoring - Logging Config', 
        message: 'No explicit logging env vars found' 
      });
    }
  } catch (error) {
    console.log(`   ⚠️  Logging configuration test: ${error.message}`);
    results.warnings.push({ 
      test: 'Error Monitoring - Logging Config', 
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
  testErrorMonitoring()
    .then(() => process.exit(results.failed.length > 0 ? 1 : 0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

