// State Privacy Ecosystem - Main Index
// Export all state ecosystems and utilities

export * from './types'
export type { StateFoundation, StateFoundationLaw } from './foundation-types'
export { STATE_FOUNDATION } from './state-foundation-data'

// Import individual state ecosystems
import { UTAH_ECOSYSTEM } from './states/utah'
import { STATE_FOUNDATION } from './state-foundation-data'

// Map of all available state ecosystems (full guides)
export const STATE_ECOSYSTEMS: Record<string, typeof UTAH_ECOSYSTEM> = {
  UT: UTAH_ECOSYSTEM,
  // Add more states as they are researched and added:
  // CA: CALIFORNIA_ECOSYSTEM,
  // TX: TEXAS_ECOSYSTEM,
  // etc.
}

// Get ecosystem by state code (full guide; null if only foundation exists)
export function getStateEcosystem(stateCode: string) {
  return STATE_ECOSYSTEMS[stateCode.toUpperCase()] || null
}

// Get foundation profile by state code (CSV-derived baseline for all 50 + DC)
export function getStateFoundation(stateCode: string) {
  return STATE_FOUNDATION[stateCode.toUpperCase()] || null
}

// Get list of available states (ones we have full ecosystem data for)
export function getAvailableStates() {
  return Object.keys(STATE_ECOSYSTEMS).map((code) => ({
    code,
    name: STATE_ECOSYSTEMS[code].name,
    sdpcMember: STATE_ECOSYSTEMS[code].sdpcMember,
  }))
}

// Check if a state has full ecosystem data (full guide)
export function hasEcosystemData(stateCode: string) {
  return stateCode.toUpperCase() in STATE_ECOSYSTEMS
}

// Check if a state has foundation data (all 50 + DC have foundation)
export function hasFoundationData(stateCode: string) {
  return stateCode.toUpperCase() in STATE_FOUNDATION
}

// Re-export Utah as the default/example
export { UTAH_ECOSYSTEM }
