import type {
  CompatibilityResult,
  CompatibilityCheck,
  RiderForCompatibility,
  VenueForCompatibility,
} from './types'

function estimateGuaranteeByCapacity(capacity: number | null | undefined): number {
  if (!capacity || capacity <= 0) return 250
  if (capacity >= 1000) return 250000 // $2500 in cents
  if (capacity >= 500) return 120000  // $1200 in cents
  if (capacity >= 200) return 50000   // $500 in cents
  return 25000                        // $250 in cents
}

function checkFinancial(
  rider: RiderForCompatibility,
  venue: VenueForCompatibility
): CompatibilityCheck {
  const minGuarantee = rider.guarantee_min ?? 0

  // Prefer venue capability profile (typical_guarantee_max) when available
  const venueMaxGuarantee = venue.typical_guarantee_max ?? undefined
  const estimatedMax = venueMaxGuarantee ?? estimateGuaranteeByCapacity(venue.capacity)
  const isFromProfile = venueMaxGuarantee != null

  if (minGuarantee === 0) {
    return {
      factor: 'Financial',
      weight: 30,
      score: 100,
      status: 'pass',
      message: 'No minimum guarantee required',
    }
  }

  if (estimatedMax >= minGuarantee) {
    return {
      factor: 'Financial',
      weight: 30,
      score: isFromProfile ? 100 : venue.capacity ? 85 : 70,
      status: 'pass',
      message: isFromProfile
        ? `Venue max ($${(venueMaxGuarantee! / 100).toLocaleString()}) meets minimum ($${(minGuarantee / 100).toLocaleString()})`
        : `Estimated max ($${(estimatedMax / 100).toLocaleString()}) likely meets minimum ($${(minGuarantee / 100).toLocaleString()})`,
    }
  }

  return {
    factor: 'Financial',
    weight: 30,
    score: isFromProfile ? 0 : venue.capacity ? 0 : 50,
    status: isFromProfile || venue.capacity ? 'fail' : 'unknown',
    message: isFromProfile
      ? `Venue max ($${(venueMaxGuarantee! / 100).toLocaleString()}) below minimum $${(minGuarantee / 100).toLocaleString()}`
      : venue.capacity
        ? `Venue capacity suggests max ~$${(estimatedMax / 100).toLocaleString()} — below minimum $${(minGuarantee / 100).toLocaleString()}`
        : `Need venue to confirm guarantee range (requires min $${(minGuarantee / 100).toLocaleString()})`,
  }
}

function checkStageSize(
  rider: RiderForCompatibility,
  venue: VenueForCompatibility
): CompatibilityCheck {
  const requiredWidth = rider.min_stage_width_feet ?? 0
  const requiredDepth = rider.min_stage_depth_feet ?? 0

  if (!requiredWidth && !requiredDepth) {
    return {
      factor: 'Stage Size',
      weight: 20,
      score: 100,
      status: 'pass',
      message: 'No specific stage size requirements',
    }
  }

  const venueWidth = venue.stage_width_feet ?? 0
  const venueDepth = venue.stage_depth_feet ?? 0

  if (!venueWidth && !venueDepth) {
    return {
      factor: 'Stage Size',
      weight: 20,
      score: 50,
      status: 'unknown',
      message: `Need venue to confirm stage size (requires ${requiredWidth || '?'}x${requiredDepth || '?'}ft)`,
    }
  }

  const widthOk = venueWidth >= requiredWidth
  const depthOk = venueDepth >= requiredDepth

  if (widthOk && depthOk) {
    return {
      factor: 'Stage Size',
      weight: 20,
      score: 100,
      status: 'pass',
      message: `Stage (${venueWidth}x${venueDepth}ft) meets requirements (${requiredWidth}x${requiredDepth}ft)`,
    }
  }

  return {
    factor: 'Stage Size',
    weight: 20,
    score: 0,
    status: 'fail',
    message: `Stage too small: ${venueWidth || '?'}x${venueDepth || '?'}ft vs ${requiredWidth}x${requiredDepth}ft required`,
  }
}

function checkTechnical(
  rider: RiderForCompatibility,
  venue: VenueForCompatibility
): CompatibilityCheck {
  const minChannels = rider.min_input_channels ?? 0
  const requiresDrums = rider.requires_house_drums ?? false

  if (!minChannels && !requiresDrums) {
    return {
      factor: 'Technical',
      weight: 20,
      score: 100,
      status: 'pass',
      message: 'No specific technical requirements',
    }
  }

  const venueChannels = venue.input_channels ?? 0
  const venueHasDrums = venue.has_house_drums ?? false

  const issues: string[] = []

  if (minChannels > 0) {
    if (venueChannels >= minChannels) {
      // pass
    } else if (venueChannels > 0) {
      issues.push(`Venue has ${venueChannels} channels, needs ${minChannels}`)
    } else {
      issues.push(`Need venue to confirm input channels (requires ${minChannels})`)
    }
  }

  if (requiresDrums) {
    if (venueHasDrums) {
      // pass
    } else if (venue.has_house_drums === false) {
      issues.push('Venue has no house drums — required')
    } else {
      issues.push('Need venue to confirm house drums availability')
    }
  }

  const hasFail = issues.some(
    (i) => i.includes('needs ') || i.includes('— required')
  )
  const hasUnknown = issues.some((i) => i.startsWith('Need venue to confirm'))

  const score = hasFail ? 0 : hasUnknown ? 50 : 100
  const status: CompatibilityCheck['status'] = hasFail
    ? 'fail'
    : hasUnknown
      ? 'unknown'
      : 'pass'

  return {
    factor: 'Technical',
    weight: 20,
    score,
    status,
    message:
      issues.length > 0 ? issues.join('; ') : 'Technical requirements met',
  }
}

function checkAgeRestriction(
  rider: RiderForCompatibility,
  venue: VenueForCompatibility
): CompatibilityCheck {
  const riderAge = rider.age_restriction
  const venueAges = venue.age_restrictions ?? []

  if (!riderAge || riderAge === 'all_ages') {
    return {
      factor: 'Age Restriction',
      weight: 15,
      score: 100,
      status: 'pass',
      message: 'All ages OK',
    }
  }

  // If venue has declared age restrictions, check compatibility
  if (venueAges.length > 0) {
    const match =
      venueAges.includes(riderAge) || venueAges.includes('all_ages')
    return {
      factor: 'Age Restriction',
      weight: 15,
      score: match ? 100 : 0,
      status: match ? 'pass' : 'fail',
      message: match
        ? `Venue allows ${riderAge}`
        : `Venue does not allow ${riderAge} (venue: ${venueAges.join(', ')})`,
    }
  }

  return {
    factor: 'Age Restriction',
    weight: 15,
    score: 50,
    status: 'unknown',
    message: `Rider requires ${riderAge} — need venue to confirm age policy`,
  }
}

function checkHospitality(
  _rider: RiderForCompatibility,
  _venue: VenueForCompatibility
): CompatibilityCheck {
  return {
    factor: 'Hospitality',
    weight: 10,
    score: 80,
    status: 'partial',
    message: 'Assume negotiable — confirm meal/drink tickets with venue',
  }
}

function checkBackline(
  rider: RiderForCompatibility,
  venue: VenueForCompatibility
): CompatibilityCheck {
  const requiresDrums = rider.requires_house_drums ?? false

  if (!requiresDrums) {
    return {
      factor: 'Backline',
      weight: 5,
      score: 100,
      status: 'pass',
      message: 'No backline required',
    }
  }

  const hasBackline = venue.has_backline ?? venue.has_house_drums ?? false

  if (hasBackline) {
    return {
      factor: 'Backline',
      weight: 5,
      score: 100,
      status: 'pass',
      message: 'Venue has backline/house drums',
    }
  }

  return {
    factor: 'Backline',
    weight: 5,
    score: venue.has_backline === false || venue.has_house_drums === false ? 0 : 50,
    status: venue.has_backline === false ? 'fail' : 'unknown',
    message:
      venue.has_backline === false
        ? 'Venue has no backline — required'
        : 'Need venue to confirm backline availability',
  }
}

/**
 * Calculate compatibility between a spider rider and a venue
 */
export function calculateCompatibility(
  rider: RiderForCompatibility,
  venue: VenueForCompatibility
): CompatibilityResult {
  const checks: CompatibilityCheck[] = [
    checkFinancial(rider, venue),
    checkStageSize(rider, venue),
    checkTechnical(rider, venue),
    checkAgeRestriction(rider, venue),
    checkHospitality(rider, venue),
    checkBackline(rider, venue),
  ]

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0)
  const overallScore = Math.round(
    checks.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0) *
      (100 / totalWeight)
  )

  const dealBreakers = checks
    .filter((c) => c.status === 'fail')
    .map((c) => c.message)

  let status: CompatibilityResult['status']
  if (dealBreakers.length > 0) {
    status = 'incompatible'
  } else if (overallScore >= 85) {
    status = 'excellent'
  } else if (overallScore >= 70) {
    status = 'good'
  } else {
    status = 'partial'
  }

  return {
    overallScore: Math.min(100, overallScore),
    status,
    checks,
    dealBreakers,
  }
}
