#!/usr/bin/env tsx
/**
 * HCI Test Runner Script
 * Runs HCI tests programmatically and outputs results
 * 
 * Usage:
 *   npx tsx scripts/run-hci-tests.ts [test-id]
 *   npx tsx scripts/run-hci-tests.ts all
 *   npx tsx scripts/run-hci-tests.ts test-001
 */

import dotenv from 'dotenv'
import { getAllTests, runHCI_Test, getTestsByCategory, type HCITest } from '../lib/hci/tests'
import { getHCITracker } from '../lib/hci/metrics'

dotenv.config({ path: '.env.local' })

interface TestResult {
  testId: string
  testName: string
  success: boolean
  duration: number
  steps: number
  errors: number
  passed: boolean
  criteria: {
    maxDuration?: number
    maxSteps?: number
    maxErrors?: number
    minCompletionRate?: number
  }
}

async function runTest(test: HCITest): Promise<TestResult> {
  console.log(`\n🧪 Running: ${test.name}`)
  console.log(`   Description: ${test.description}`)
  console.log(`   Category: ${test.category}`)
  console.log(`   Tasks: ${test.tasks.length}`)
  
  try {
    const result = await runHCI_Test(test.id)
    
    const criteria = test.successCriteria
    const passed = 
      (!criteria.maxDuration || result.duration <= criteria.maxDuration) &&
      (!criteria.maxSteps || result.steps <= criteria.maxSteps) &&
      (!criteria.maxErrors || result.errors <= criteria.maxErrors) &&
      (!criteria.minCompletionRate || (result.errors / result.steps) <= 1 - criteria.minCompletionRate)
    
    const testResult: TestResult = {
      testId: test.id,
      testName: test.name,
      success: result.success,
      duration: result.duration,
      steps: result.steps,
      errors: result.errors,
      passed,
      criteria,
    }
    
    console.log(`   ✅ Duration: ${(result.duration / 1000).toFixed(1)}s`)
    console.log(`   ✅ Steps: ${result.steps}`)
    console.log(`   ${result.errors > 0 ? '❌' : '✅'} Errors: ${result.errors}`)
    console.log(`   ${passed ? '✅ PASSED' : '❌ FAILED'}`)
    
    return testResult
  } catch (error) {
    console.error(`   ❌ Test failed with error:`, error)
    return {
      testId: test.id,
      testName: test.name,
      success: false,
      duration: 0,
      steps: 0,
      errors: 1,
      passed: false,
      criteria: test.successCriteria,
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const testId = args[0] || 'all'
  
  console.log('🚀 HCI Test Runner')
  console.log('=' .repeat(50))
  
  let testsToRun: HCITest[] = []
  
  if (testId === 'all') {
    testsToRun = getAllTests()
    console.log(`\nRunning all ${testsToRun.length} tests...`)
  } else if (testId.startsWith('category:')) {
    const category = testId.split(':')[1] as any
    testsToRun = getTestsByCategory(category)
    console.log(`\nRunning ${category} tests (${testsToRun.length} tests)...`)
  } else {
    const test = getAllTests().find(t => t.id === testId)
    if (!test) {
      console.error(`❌ Test ${testId} not found`)
      console.log('\nAvailable tests:')
      getAllTests().forEach(t => {
        console.log(`  - ${t.id}: ${t.name}`)
      })
      process.exit(1)
    }
    testsToRun = [test]
    console.log(`\nRunning single test: ${test.name}`)
  }
  
  const results: TestResult[] = []
  
  for (const test of testsToRun) {
    const result = await runTest(test)
    results.push(result)
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Summary')
  console.log('='.repeat(50))
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  const totalSteps = results.reduce((sum, r) => sum + r.steps, 0)
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0)
  
  console.log(`\nTotal Tests: ${results.length}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(1)}s`)
  console.log(`📝 Total Steps: ${totalSteps}`)
  console.log(`⚠️  Total Errors: ${totalErrors}`)
  
  // Detailed results
  console.log('\n' + '='.repeat(50))
  console.log('📋 Detailed Results')
  console.log('='.repeat(50))
  
  results.forEach(result => {
    console.log(`\n${result.passed ? '✅' : '❌'} ${result.testName} (${result.testId})`)
    console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s ${result.criteria.maxDuration ? `(max: ${result.criteria.maxDuration / 1000}s)` : ''}`)
    console.log(`   Steps: ${result.steps} ${result.criteria.maxSteps ? `(max: ${result.criteria.maxSteps})` : ''}`)
    console.log(`   Errors: ${result.errors} ${result.criteria.maxErrors !== undefined ? `(max: ${result.criteria.maxErrors})` : ''}`)
  })
  
  // Exit code
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(console.error)

