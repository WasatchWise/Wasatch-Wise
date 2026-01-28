#!/usr/bin/env tsx
/**
 * System Readiness Check
 * Verifies all components are ready for production
 * 
 * Usage:
 *   npx tsx scripts/readiness-check.ts
 */

import dotenv from 'dotenv'
import { createServiceSupabaseClient } from '../lib/supabase/service'
import { getAllTests } from '../lib/hci/tests'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
}

const checks: CheckResult[] = []

async function checkDatabase() {
  try {
    const supabase = createServiceSupabaseClient()
    const { data, error } = await supabase.from('projects').select('id').limit(1)
    
    if (error) {
      checks.push({
        name: 'Database Connection',
        status: 'fail',
        message: `Cannot connect to database: ${error.message}`,
      })
      return
    }
    
    checks.push({
      name: 'Database Connection',
      status: 'pass',
      message: 'Database connection successful',
    })
  } catch (error: any) {
    checks.push({
      name: 'Database Connection',
      status: 'fail',
      message: `Database error: ${error.message}`,
    })
  }
}

function checkEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
  
  const optional = [
    'OPENAI_API_KEY',
    'GOOGLE_PLACES_API_KEY',
    'HEYGEN_API_KEY',
    'NEXT_PUBLIC_APP_URL',
  ]
  
  const missing = required.filter(key => !process.env[key])
  const missingOptional = optional.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    checks.push({
      name: 'Required Environment Variables',
      status: 'fail',
      message: `Missing: ${missing.join(', ')}`,
    })
  } else {
    checks.push({
      name: 'Required Environment Variables',
      status: 'pass',
      message: 'All required variables present',
    })
  }
  
  if (missingOptional.length > 0) {
    checks.push({
      name: 'Optional Environment Variables',
      status: 'warning',
      message: `Missing (non-critical): ${missingOptional.join(', ')}`,
    })
  } else {
    checks.push({
      name: 'Optional Environment Variables',
      status: 'pass',
      message: 'All optional variables present',
    })
  }
}

function checkHCIFiles() {
  const hciFiles = [
    'lib/hci/metrics.ts',
    'lib/hci/tests.ts',
    'app/(dashboard)/hci-tests/page.tsx',
    'app/api/analytics/hci-metric/route.ts',
  ]
  
  const missing = hciFiles.filter(file => !existsSync(join(process.cwd(), file)))
  
  if (missing.length > 0) {
    checks.push({
      name: 'HCI Files',
      status: 'fail',
      message: `Missing files: ${missing.join(', ')}`,
    })
  } else {
    checks.push({
      name: 'HCI Files',
      status: 'pass',
      message: 'All HCI files present',
    })
  }
}

function checkHCITests() {
  try {
    const tests = getAllTests()
    
    if (tests.length === 0) {
      checks.push({
        name: 'HCI Tests',
        status: 'warning',
        message: 'No HCI tests defined',
      })
      return
    }
    
    checks.push({
      name: 'HCI Tests',
      status: 'pass',
      message: `${tests.length} HCI tests available`,
    })
    
    // Check test categories
    const categories = new Set(tests.map(t => t.category))
    checks.push({
      name: 'HCI Test Categories',
      status: 'pass',
      message: `${categories.size} categories: ${Array.from(categories).join(', ')}`,
    })
  } catch (error: any) {
    checks.push({
      name: 'HCI Tests',
      status: 'fail',
      message: `Error loading tests: ${error.message}`,
    })
  }
}

function checkPWAFiles() {
  const pwaFiles = [
    'public/manifest.json',
    'app/manifest.ts',
    'public/sw.js',
    'components/pwa/PWAInstallPrompt.tsx',
    'components/pwa/ServiceWorkerRegistration.tsx',
  ]
  
  const missing = pwaFiles.filter(file => !existsSync(join(process.cwd(), file)))
  
  if (missing.length > 0) {
    checks.push({
      name: 'PWA Files',
      status: 'warning',
      message: `Missing files: ${missing.join(', ')}`,
    })
  } else {
    checks.push({
      name: 'PWA Files',
      status: 'pass',
      message: 'All PWA files present',
    })
  }
}

function checkIOSFiles() {
  const iosFiles = [
    'lib/ios/optimizations.ts',
    'components/ios/IOSOptimizer.tsx',
  ]
  
  const missing = iosFiles.filter(file => !existsSync(join(process.cwd(), file)))
  
  if (missing.length > 0) {
    checks.push({
      name: 'iOS Optimization Files',
      status: 'warning',
      message: `Missing files: ${missing.join(', ')}`,
    })
  } else {
    checks.push({
      name: 'iOS Optimization Files',
      status: 'pass',
      message: 'All iOS optimization files present',
    })
  }
}

function checkScripts() {
  const scripts = [
    'scripts/run-hci-tests.ts',
    'scripts/analyze-hci-metrics.ts',
    'scripts/readiness-check.ts',
  ]
  
  const missing = scripts.filter(file => !existsSync(join(process.cwd(), file)))
  
  if (missing.length > 0) {
    checks.push({
      name: 'HCI Scripts',
      status: 'warning',
      message: `Missing scripts: ${missing.join(', ')}`,
    })
  } else {
    checks.push({
      name: 'HCI Scripts',
      status: 'pass',
      message: 'All HCI scripts present',
    })
  }
}

async function main() {
  console.log('🔍 System Readiness Check')
  console.log('='.repeat(50))
  
  // Run all checks
  await checkDatabase()
  checkEnvironmentVariables()
  checkHCIFiles()
  checkHCITests()
  checkPWAFiles()
  checkIOSFiles()
  checkScripts()
  
  // Print results
  console.log('\n📋 Check Results:\n')
  
  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️'
    const statusColor = check.status === 'pass' ? '\x1b[32m' : check.status === 'fail' ? '\x1b[31m' : '\x1b[33m'
    console.log(`${icon} ${check.name}: ${statusColor}${check.message}\x1b[0m`)
  })
  
  // Summary
  const passed = checks.filter(c => c.status === 'pass').length
  const failed = checks.filter(c => c.status === 'fail').length
  const warnings = checks.filter(c => c.status === 'warning').length
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`   ✅ Passed: ${passed}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   ⚠️  Warnings: ${warnings}`)
  console.log('='.repeat(50))
  
  if (failed > 0) {
    console.log('\n❌ System is NOT ready. Please fix the failed checks.')
    process.exit(1)
  } else if (warnings > 0) {
    console.log('\n⚠️  System is ready with warnings. Review warnings above.')
    process.exit(0)
  } else {
    console.log('\n✅ System is READY!')
    process.exit(0)
  }
}

main().catch(console.error)

