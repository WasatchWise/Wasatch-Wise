/**
 * Partner ecosystem data — TEC SDPA, FPF, and other external resources.
 * Used for state implementation notes and Learn page references.
 */

export const TEC_SDPA_URL = 'https://tec-coop.org/data-privacy/'

export const TEC_SERVED_STATES = {
  direct: ['MA', 'ME', 'NH', 'NE', 'RI', 'VT', 'VA'] as const,
  partnership: {
    IL: { partner: 'Learning Technology Center (LTC)', url: 'https://www.ltcillinois.org/' },
    MO: { partner: 'MOREnet', url: 'https://www.more.net/' },
    NY: { partner: 'NY State Dept of Education + 12 RICs', url: 'https://www.nysed.gov/' },
    OH: { partner: 'Learn21', url: 'https://learn21.org/' },
    TN: { partner: 'TETA', url: 'https://teta.org/' },
  } as const,
} as const

export const TEC_ALL_STATE_CODES: readonly string[] = [
  ...TEC_SERVED_STATES.direct,
  ...(Object.keys(TEC_SERVED_STATES.partnership) as (keyof typeof TEC_SERVED_STATES.partnership)[]),
]

export function getTecSupportForState(stateCode: string): { type: 'direct' | 'partnership'; partner?: string; url?: string } | null {
  const code = stateCode.toUpperCase()
  if (TEC_SERVED_STATES.direct.includes(code as typeof TEC_SERVED_STATES.direct[number])) {
    return { type: 'direct' }
  }
  const partnership = (TEC_SERVED_STATES.partnership as Record<string, { partner: string; url: string }>)[code]
  if (partnership) {
    return { type: 'partnership', partner: partnership.partner, url: partnership.url }
  }
  return null
}

export const EXTERNAL_RESOURCES = [
  {
    name: 'Student Privacy Compass',
    org: 'Future of Privacy Forum',
    url: 'https://studentprivacycompass.org/',
    description: 'Research, infographics, and policy analysis for K-12 student data privacy',
    audiences: ['educators', 'administrators', 'policymakers'],
  },
  {
    name: 'TEC Student Data Privacy Alliance',
    org: 'The Education Cooperative',
    url: TEC_SDPA_URL,
    description: 'DPA procurement service for 12 states',
    audiences: ['administrators'],
  },
  {
    name: 'SDPC Resource Registry',
    org: 'Student Data Privacy Consortium',
    url: 'https://privacy.a4l.org/sdpc-resource-registry/',
    description: 'Vendor agreement database — see which vendors have signed DPAs',
    audiences: ['educators', 'administrators'],
  },
] as const
