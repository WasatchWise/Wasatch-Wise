#!/usr/bin/env node

/**
 * Health check script
 * Runs all health checks and validation tests
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPassed(name) {
  log(`✓ ${name}`, 'green');
}

function checkFailed(name, error) {
  log(`✗ ${name}: ${error}`, 'red');
}

function checkWarning(name, message) {
  log(`⚠ ${name}: ${message}`, 'yellow');
}

async function runHealthChecks() {
  log('\n🔍 Running Health Checks...\n', 'blue');

  const checks = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // 1. Check Node version
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion >= 18) {
      checkPassed(`Node.js version: ${nodeVersion}`);
      checks.passed++;
    } else {
      checkFailed('Node.js version', `Requires Node 18+, found ${nodeVersion}`);
      checks.failed++;
    }
  } catch (error) {
    checkFailed('Node.js version check', error.message);
    checks.failed++;
  }

  // 2. Check required files
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    '.env.local',
  ];

  requiredFiles.forEach(file => {
    if (existsSync(file)) {
      checkPassed(`File exists: ${file}`);
      checks.passed++;
    } else if (file === '.env.local') {
      checkWarning(`File missing: ${file}`, 'May be using environment variables');
      checks.warnings++;
    } else {
      checkFailed(`File missing: ${file}`);
      checks.failed++;
    }
  });

  // 3. Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optionalEnvVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
  ];

  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      checkPassed(`Environment variable: ${envVar}`);
      checks.passed++;
    } else {
      checkFailed(`Environment variable: ${envVar}`, 'Required but not set');
      checks.failed++;
    }
  });

  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      checkPassed(`Environment variable: ${envVar}`);
      checks.passed++;
    } else {
      checkWarning(`Environment variable: ${envVar}`, 'Optional but recommended');
      checks.warnings++;
    }
  });

  // 4. Check package.json dependencies
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    const requiredDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];
    
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        checkPassed(`Dependency: ${dep}`);
        checks.passed++;
      } else {
        checkFailed(`Dependency: ${dep}`, 'Missing from package.json');
        checks.failed++;
      }
    });
  } catch (error) {
    checkFailed('package.json check', error.message);
    checks.failed++;
  }

  // 5. Check TypeScript compilation
  try {
    log('\n📝 Checking TypeScript compilation...', 'blue');
    execSync('npm run type-check', { stdio: 'inherit' });
    checkPassed('TypeScript compilation');
    checks.passed++;
  } catch (error) {
    checkFailed('TypeScript compilation', 'Type errors found');
    checks.failed++;
  }

  // 6. Check ESLint
  try {
    log('\n🔍 Running ESLint...', 'blue');
    execSync('npm run lint', { stdio: 'inherit' });
    checkPassed('ESLint');
    checks.passed++;
  } catch (error) {
    checkWarning('ESLint', 'Warnings found (non-blocking)');
    checks.warnings++;
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('Health Check Summary', 'blue');
  log('='.repeat(50), 'blue');
  log(`Passed: ${checks.passed}`, 'green');
  log(`Failed: ${checks.failed}`, checks.failed > 0 ? 'red' : 'green');
  log(`Warnings: ${checks.warnings}`, checks.warnings > 0 ? 'yellow' : 'green');
  log('='.repeat(50) + '\n', 'blue');

  if (checks.failed > 0) {
    process.exit(1);
  }
}

runHealthChecks().catch(error => {
  console.error('Health check script error:', error);
  process.exit(1);
});
