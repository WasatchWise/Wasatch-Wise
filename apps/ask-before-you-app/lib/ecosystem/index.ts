// State Privacy Ecosystem - Main Index
// Export all state ecosystems and utilities

export * from './types'

// Import individual state ecosystems
import { UTAH_ECOSYSTEM } from './states/utah'

// Map of all available state ecosystems
export const STATE_ECOSYSTEMS: Record<string, typeof UTAH_ECOSYSTEM> = {
  UT: UTAH_ECOSYSTEM,
  // Add more states as they are researched and added:
  // CA: CALIFORNIA_ECOSYSTEM,
  // TX: TEXAS_ECOSYSTEM,
  // etc.
}

// Get ecosystem by state code
export function getStateEcosystem(stateCode: string) {
  return STATE_ECOSYSTEMS[stateCode.toUpperCase()] || null
}

// Get list of available states (ones we have data for)
export function getAvailableStates() {
  return Object.keys(STATE_ECOSYSTEMS).map((code) => ({
    code,
    name: STATE_ECOSYSTEMS[code].name,
    sdpcMember: STATE_ECOSYSTEMS[code].sdpcMember,
  }))
}

// Check if a state has ecosystem data
export function hasEcosystemData(stateCode: string) {
  return stateCode.toUpperCase() in STATE_ECOSYSTEMS
}

// Re-export Utah as the default/example
export { UTAH_ECOSYSTEM }
