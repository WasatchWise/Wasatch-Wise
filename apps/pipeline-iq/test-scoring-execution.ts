#!/usr/bin/env tsx

import { calculateGrooveScore } from './lib/utils/scoring'

console.log('🟢 Scoring imported')

const testProject = {
  project_value: 1000000,
  project_type: ['hotel'],
  services_needed: ['wifi'],
  city: 'Test City',
  state: 'CA'
}

console.log('🟢 About to call calculateGrooveScore...')
const score = calculateGrooveScore(testProject as any)
console.log('🟢 Score calculated:', score)
console.log('✅ Test complete!')
