/**
 * Types for the Spider Rider ↔ Venue compatibility matching engine
 */

export type CompatibilityStatus = 'excellent' | 'good' | 'partial' | 'incompatible'

export type CheckStatus = 'pass' | 'partial' | 'fail' | 'unknown'

export interface CompatibilityCheck {
  factor: string
  weight: number
  score: number
  status: CheckStatus
  message: string
}

export interface CompatibilityResult {
  overallScore: number
  status: CompatibilityStatus
  checks: CompatibilityCheck[]
  dealBreakers: string[]
}

/** Spider rider shape (from DB) */
export interface RiderForCompatibility {
  id: string
  guarantee_min?: number | null
  guarantee_max?: number | null
  min_stage_width_feet?: number | null
  min_stage_depth_feet?: number | null
  min_input_channels?: number | null
  requires_house_drums?: boolean | null
  age_restriction?: string | null
}

/** Venue shape (from DB) */
export interface VenueForCompatibility {
  id: string
  name: string
  slug?: string | null
  capacity?: number | null
  stage_width_feet?: number | null
  stage_depth_feet?: number | null
  input_channels?: number | null
  has_house_drums?: boolean | null
  has_backline?: boolean | null
  /** Venue capability profile: typical max guarantee (cents) */
  typical_guarantee_max?: number | null
  /** Venue capability profile: typical min guarantee (cents) */
  typical_guarantee_min?: number | null
  /** Venue capability profile: age restrictions (all_ages, 18+, 21+) */
  age_restrictions?: string[] | null
}
