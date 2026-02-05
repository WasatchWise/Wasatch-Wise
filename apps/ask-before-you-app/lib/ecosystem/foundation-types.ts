/**
 * State foundation profile — CSV-derived baseline for every state.
 * Used when a full StateEcosystem (e.g. Utah) is not yet available.
 * Source: US State Student Data Privacy and AI Governance Profiles (Table 1).
 */

export interface StateFoundationLaw {
  name: string
  code: string
  description?: string
}

export interface StateFoundation {
  code: string
  name: string
  sdpcMember: boolean
  agencyName: string | null
  stateLaws: StateFoundationLaw[]
  federalLawsNote: string | null
  contactEmail: string | null
  contactPhone: string | null
  website: string | null
  requiredRolesSummary: string | null
  complianceSummary: string | null
  dpaAvailable: boolean | null
  aiGovernanceNotes: string | null
}
