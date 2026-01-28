#!/usr/bin/env node

/**
 * Debug Agent Audit Runner
 * 
 * Comprehensive system audit that tests all critical components:
 * - Configuration & Environment
 * - Authentication Flows
 * - Payment & Checkout
 * - Product Access
 * - API Endpoints
 * - Database Integrity
 * - User Journeys
 * - Frontend Rendering
 * - External Integrations
 * - Error Monitoring
 * 
 * Usage:
 *   node scripts/debug-agent/run-audit.mjs
 *   node scripts/debug-agent/run-audit.mjs --module config-check
 *   node scripts/debug-agent/run-audit.mjs --dry-run
 */

import { checkConfig } from './config-check.mjs';
import { testAuthFlow } from './auth-flow.mjs';
import { testPaymentFlow } from './payment-flow.mjs';
import { testProductAccess } from './product-access.mjs';
import { testApiEndpoints } from './api-endpoints.mjs';
import { testDatabase } from './database-check.mjs';
import { testUserJourneys } from './user-journeys.mjs';
import { testFrontend } from './frontend-check.mjs';
import { testIntegrations } from './integrations.mjs';
import { testErrorMonitoring } from './error-monitoring.mjs';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const moduleArg = args.find(arg => arg.startsWith('--module='));
const runModule = moduleArg ? moduleArg.split('=')[1] : null;

// Audit modules configuration
const modules = [
  { name: 'config-check', fn: checkConfig, description: 'Configuration & Environment Validation' },
  { name: 'auth-flow', fn: testAuthFlow, description: 'Authentication Flow Testing' },
  { name: 'payment-flow', fn: testPaymentFlow, description: 'Payment & Checkout Flow Testing' },
  { name: 'product-access', fn: testProductAccess, description: 'Product Access Testing' },
  { name: 'api-endpoints', fn: testApiEndpoints, description: 'API Endpoint Testing' },
  { name: 'database-check', fn: testDatabase, description: 'Database & Data Integrity' },
  { name: 'user-journeys', fn: testUserJourneys, description: 'User Journey Testing' },
  { name: 'frontend-check', fn: testFrontend, description: 'Frontend Rendering & Navigation' },
  { name: 'integrations', fn: testIntegrations, description: 'External Service Integrations' },
  { name: 'error-monitoring', fn: testErrorMonitoring, description: 'Error Monitoring & Logging' },
];

// Filter modules if specific module requested
const modulesToRun = runModule 
  ? modules.filter(m => m.name === runModule)
  : modules;

if (runModule && modulesToRun.length === 0) {
  console.error(`\n❌ Error: Module "${runModule}" not found.\n`);
  console.log('Available modules:');
  modules.forEach(m => console.log(`  - ${m.name}: ${m.description}`));
  process.exit(1);
}

// Main audit execution
async function runAudit() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    DEBUG AGENT AUDIT - SLC TRIPS V2                       ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No tests will be executed\n');
    console.log('Modules that would be run:');
    modulesToRun.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name}: ${m.description}`);
    });
    console.log('\n');
    return;
  }

  const startTime = Date.now();
  const auditResults = {
    timestamp: new Date().toISOString(),
    modules: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    },
  };

  // Run each module
  for (let i = 0; i < modulesToRun.length; i++) {
    const module = modulesToRun[i];
    console.log(`\n[${i + 1}/${modulesToRun.length}] Running: ${module.description}`);
    console.log('═'.repeat(80));

    try {
      const moduleStartTime = Date.now();
      const results = await module.fn();
      const moduleDuration = Date.now() - moduleStartTime;

      auditResults.modules.push({
        name: module.name,
        description: module.description,
        duration: moduleDuration,
        results: {
          passed: results.passed.length,
          failed: results.failed.length,
          warnings: results.warnings.length,
        },
        details: {
          passed: results.passed,
          failed: results.failed,
          warnings: results.warnings,
        },
      });

      auditResults.summary.total += results.passed.length + results.failed.length + results.warnings.length;
      auditResults.summary.passed += results.passed.length;
      auditResults.summary.failed += results.failed.length;
      auditResults.summary.warnings += results.warnings.length;

      console.log(`\n✅ Module completed in ${moduleDuration}ms`);
    } catch (error) {
      console.error(`\n❌ Module failed: ${error.message}`);
      console.error(error.stack);

      auditResults.modules.push({
        name: module.name,
        description: module.description,
        error: error.message,
        stack: error.stack,
      });

      auditResults.summary.failed += 1;
    }
  }

  const totalDuration = Date.now() - startTime;

  // Generate summary report
  console.log('\n\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           AUDIT SUMMARY                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  console.log(`Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)\n`);
  console.log(`Total Tests: ${auditResults.summary.total}`);
  console.log(`✅ Passed: ${auditResults.summary.passed}`);
  console.log(`❌ Failed: ${auditResults.summary.failed}`);
  console.log(`⚠️  Warnings: ${auditResults.summary.warnings}\n`);

  // Module breakdown
  console.log('Module Breakdown:');
  console.log('─'.repeat(80));
  auditResults.modules.forEach((module, i) => {
    if (module.error) {
      console.log(`${i + 1}. ${module.name}: ❌ ERROR - ${module.error}`);
    } else {
      const status = module.results.failed > 0 ? '❌' : module.results.warnings > 0 ? '⚠️' : '✅';
      console.log(`${i + 1}. ${module.name}: ${status} ${module.results.passed} passed, ${module.results.failed} failed, ${module.results.warnings} warnings (${module.duration}ms)`);
    }
  });

  // Detailed failures
  const allFailures = auditResults.modules
    .flatMap(m => (m.details?.failed || []).map(f => ({ module: m.name, ...f })));

  if (allFailures.length > 0) {
    console.log('\n\n❌ FAILURES:');
    console.log('─'.repeat(80));
    allFailures.forEach((failure, i) => {
      console.log(`\n${i + 1}. [${failure.module}] ${failure.test}`);
      if (failure.error) {
        console.log(`   Error: ${failure.error}`);
      }
      if (failure.message) {
        console.log(`   Message: ${failure.message}`);
      }
    });
  }

  // Critical warnings
  const criticalWarnings = auditResults.modules
    .flatMap(m => (m.details?.warnings || []).filter(w => 
      w.message?.toLowerCase().includes('critical') ||
      w.message?.toLowerCase().includes('security') ||
      w.message?.toLowerCase().includes('production')
    ));

  if (criticalWarnings.length > 0) {
    console.log('\n\n⚠️  CRITICAL WARNINGS:');
    console.log('─'.repeat(80));
    criticalWarnings.forEach((warning, i) => {
      console.log(`\n${i + 1}. [${warning.test}] ${warning.message}`);
    });
  }

  // Save report to file
  const reportPath = join(__dirname, `audit-report-${Date.now()}.json`);
  try {
    writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
    console.log(`\n\n📄 Full audit report saved to: ${reportPath}`);
  } catch (error) {
    console.error(`\n⚠️  Could not save report: ${error.message}`);
  }

  // Exit code based on results
  const exitCode = auditResults.summary.failed > 0 ? 1 : 0;
  
  if (exitCode === 0) {
    console.log('\n✅ All critical tests passed! System appears to be functional.\n');
  } else {
    console.log('\n❌ Some tests failed. Please review the failures above.\n');
  }

  process.exit(exitCode);
}

// Run the audit
runAudit().catch((error) => {
  console.error('\n❌ Fatal error during audit:', error);
  console.error(error.stack);
  process.exit(1);
});

