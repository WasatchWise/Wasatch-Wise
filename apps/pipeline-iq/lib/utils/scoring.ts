interface Project {
  project_type: string[]
  project_stage: string
  project_value: number
  project_size_sqft?: number | null
  units_count?: number | null
  services_needed?: string[]
  decision_timeline?: string | null
  city?: string | null
  state?: string
  estimated_start_date?: string | null
  notes?: string | null
  raw_data?: any
}

export function calculateGrooveScore(project: Project): number {
  let score = 0

  // 1. Project Type Score (30 points)
  const highValueTypes = ['hotel', 'senior_living', 'multifamily', 'student_housing']
  const mediumValueTypes = ['rv_park', 'restaurant', 'arena', 'healthcare', 'campground']
  const lowValueTypes = ['retail', 'office', 'warehouse']

  const types = (project.project_type || []).map(t => t.toLowerCase())
  const typeScore = types.reduce((acc, type) => {
    if (highValueTypes.includes(type)) return Math.max(acc, 30)
    if (mediumValueTypes.includes(type)) return Math.max(acc, 20)
    if (lowValueTypes.includes(type)) return Math.max(acc, 10)
    return acc
  }, 0)
  score += typeScore

  // 2. Project Stage Score (25 points)
  // Normalize stage strings across scrapers/importers.
  const stageRaw = (project.project_stage || '').toLowerCase()
  const stage =
    stageRaw.includes('planning') || stageRaw.includes('permit') || stageRaw.includes('planning/approval')
      ? 'planning'
      : stageRaw.includes('design')
        ? 'design'
        : stageRaw.includes('pre') || stageRaw.includes('shell') || stageRaw.includes('foundation') || stageRaw.includes('groundbreak')
          ? 'pre_construction'
          : stageRaw.includes('bid')
            ? 'bidding'
            : stageRaw.includes('construct') || stageRaw.includes('fit-out') || stageRaw.includes('walls closing')
              ? 'construction'
              : stageRaw.includes('reno') || stageRaw.includes('upgrade')
                ? 'renovation'
                : stageRaw.includes('complete')
                  ? 'completed'
                  : stageRaw.includes('operat') || stageRaw.includes('existing')
                    ? 'operating'
                    : stageRaw

  const stageScores: Record<string, number> = {
    planning: 25, // GO NOW
    design: 22, // GO NOW
    pre_construction: 20, // GO NOW (shell/early construction)
    bidding: 14,
    construction: 8, // caution zone
    renovation: 18, // retrofit target (PIP / G.hn)
    operating: 15, // existing property - retrofit/upgrade opportunity
    completed: 0,
    cancelled: 0,
    retired: 0,
  }
  score += stageScores[stage] ?? 5

  // 3. Project Value Score (20 points)
  if (project.project_value >= 20000000) score += 20
  else if (project.project_value >= 10000000) score += 17
  else if (project.project_value >= 5000000) score += 14
  else if (project.project_value >= 2000000) score += 10
  else if (project.project_value >= 1000000) score += 7
  else if (project.project_value >= 500000) score += 4

  // 4. Project Size Score (10 points)
  const size = project.project_size_sqft || 0
  const units = project.units_count || 0

  if (size >= 100000 || units >= 200) score += 10
  else if (size >= 50000 || units >= 100) score += 8
  else if (size >= 25000 || units >= 50) score += 6
  else if (size >= 10000 || units >= 20) score += 4
  else if (size >= 5000 || units >= 10) score += 2

  // ICP boosts (from Mike / playbook)
  // - Hotels: 200+ keys is a prime full-stack target.
  if (types.some(t => t.includes('hotel')) && units >= 200) {
    score += 8
  }
  // - Large MDUs: prioritize "huge buildings" for recurring revenue.
  if (types.some(t => t.includes('multifamily') || t.includes('apartment')) && units >= 300) {
    score += 6
  }

  // 5. Timeline Score (10 points)
  const timeline = project.decision_timeline || project.estimated_start_date
  if (timeline) {
    const monthsOut = calculateMonthsToStart(timeline)
    if (monthsOut <= 3) score += 10
    else if (monthsOut <= 6) score += 8
    else if (monthsOut <= 9) score += 5
    else if (monthsOut <= 12) score += 3
  }

  // 6. Location Score (5 points) - Priority markets
  const priorityStates = ['UT', 'CA', 'TX', 'FL', 'NY', 'IL']
  const priorityCities = ['Salt Lake City', 'Las Vegas', 'Phoenix', 'Denver', 'Seattle']

  if (priorityStates.includes(project.state || '')) score += 3
  if (priorityCities.includes(project.city || '')) score += 2

  // Signal-based boosts (amenities/technologies/PIP/etc.)
  const notesText = (project.notes || '').toLowerCase()
  const signals = (project.raw_data?.signals || project.raw_data?.signals_detected || {}) as any
  const signalText = `${notesText} ${(JSON.stringify(signals) || '').toLowerCase()}`

  const hasAmenities = signalText.includes('amenities') || signals.amenities
  const hasTechnologies = signalText.includes('technologies') || signals.technologies
  if (hasAmenities) score += 4
  if (hasTechnologies) score += 4

  const hasPip = !!signals.pip || /\bproperty improvement plan\b|\bpip\b/.test(signalText)
  const hasGardenStyle = !!signals.garden_style || /\bgarden style\b/.test(signalText)
  const hasConcreteSteelLeed = !!signals.concrete_steel_leed || /\bconcrete\b|\bsteel\b|\bleed\b/.test(signalText)
  if (hasPip) score += 6 // retrofit window
  if (hasGardenStyle) score += 4 // retrofit-friendly
  if (hasConcreteSteelLeed) score += 3 // ERCES/DAS compliance risk

  // Bonus multipliers
  let multiplier = 1.0

  // Multiple Groove services needed
  const grooveServices = ['wifi', 'directv', 'tv', 'internet', 'phone', 'cabling', 'access_control', 'structured_cabling']
  const servicesMatch = (project.services_needed || [])
    .filter(s => grooveServices.some(gs => s.toLowerCase().includes(gs)))
    .length
  if (servicesMatch >= 3) multiplier *= 1.1

  // Large portfolio opportunity
  if (project.project_value >= 10000000 && (project.units_count || 0) >= 100) {
    multiplier *= 1.05
  }

  return Math.min(Math.round(score * multiplier), 100)
}

function calculateMonthsToStart(dateStr: string): number {
  if (!dateStr) return 999

  const date = new Date(dateStr)
  const now = new Date()
  const months = (date.getFullYear() - now.getFullYear()) * 12 +
    (date.getMonth() - now.getMonth())

  return Math.max(0, months)
}

export function calculateEngagementScore(interactions: any[]): number {
  let score = 0

  interactions.forEach(interaction => {
    switch (interaction.activity_type) {
      case 'email_opened': score += 5; break
      case 'link_clicked': score += 10; break
      case 'responded': score += 25; break
      case 'meeting_scheduled': score += 40; break
      case 'proposal_requested': score += 50; break
    }
  })

  return Math.min(score, 100)
}

export function calculateTimingScore(project: Project): number {
  const monthsOut = calculateMonthsToStart(
    project.estimated_start_date || ''
  )

  if (monthsOut <= 2) return 100
  if (monthsOut <= 4) return 80
  if (monthsOut <= 6) return 60
  if (monthsOut <= 9) return 40
  if (monthsOut <= 12) return 20
  return 10
}

export function calculateTotalScore(
  grooveScore: number,
  engagementScore: number,
  timingScore: number
): number {
  // Weighted average: 50% groove fit, 30% engagement, 20% timing
  return Math.round(
    (grooveScore * 0.5) +
    (engagementScore * 0.3) +
    (timingScore * 0.2)
  )
}

export function getScoreDrivers(project: Project): string[] {
  const drivers: string[] = []

  // 1. Value Driver
  if (project.project_value >= 10000000) drivers.push('High Value ($10M+)')
  else if (project.project_value >= 2000000) drivers.push('Mid Value ($2M+)')

  // 2. Type Driver
  const types = (project.project_type || []).map(t => t.toLowerCase())
  if (types.some(t => ['hotel', 'hospitality'].includes(t))) drivers.push('Hospitality Match')
  if (types.some(t => ['multifamily', 'apartment', 'senior_living'].includes(t))) drivers.push('MDU Match')

  // 3. Stage Driver
  const stageRaw = (project.project_stage || '').toLowerCase()
  if (stageRaw.includes('planning') || stageRaw.includes('design')) drivers.push('Early Stage (Planning)')
  if (stageRaw.includes('construct') || stageRaw.includes('ground')) drivers.push('Active Construction')

  // 4. Timing Driver
  const timeline = project.decision_timeline || project.estimated_start_date
  if (timeline) {
    const months = calculateMonthsToStart(timeline)
    if (months <= 3) drivers.push('Starting Soon')
  }

  // 5. Signals
  const signals = project.raw_data?.signals || {}
  if (signals.pip) drivers.push('PIP Detected')
  if (signals.amenities) drivers.push('High Amenities')

  return drivers.slice(0, 3) // Return top 3 drivers
}
