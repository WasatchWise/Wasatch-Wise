/**
 * Venue profile completeness calculation for capability matching
 */

export interface VenueForCompleteness {
  id?: string
  stage_width_feet?: number | null
  stage_depth_feet?: number | null
  input_channels?: number | null
  has_house_drums?: boolean | null
  has_backline?: boolean | null
  capacity?: number | null
  typical_guarantee_min?: number | null
  typical_guarantee_max?: number | null
  payment_methods?: string[] | null
  w9_on_file?: boolean | null
  insurance_coi_on_file?: boolean | null
  green_room_available?: boolean | null
  meal_buyout_available?: boolean | null
  drink_tickets_available?: number | null
  guest_list_spots?: number | null
  parking_spaces?: number | null
  green_room_description?: string | null
  age_restrictions?: string[] | null
  load_in_notes?: string | null
  curfew_time?: string | null
  address?: string | null
}

export interface ProfileCompletenessResult {
  percentage: number
  filledFields: number
  totalFields: number
  missingFields: string[]
}

const FIELDS: Record<string, string> = {
  stage_width_feet: 'Stage width',
  stage_depth_feet: 'Stage depth',
  input_channels: 'Input channels',
  has_house_drums: 'House drums',
  has_backline: 'Backline availability',
  capacity: 'Venue capacity',
  typical_guarantee_min: 'Minimum guarantee',
  typical_guarantee_max: 'Maximum guarantee',
  payment_methods: 'Payment methods',
  w9_on_file: 'W-9 on file',
  insurance_coi_on_file: 'Insurance COI',
  green_room_available: 'Green room',
  meal_buyout_available: 'Meal buyout',
  drink_tickets_available: 'Drink tickets',
  guest_list_spots: 'Guest list spots',
  parking_spaces: 'Parking spaces',
  green_room_description: 'Green room details',
  age_restrictions: 'Age restrictions',
  load_in_notes: 'Load-in notes',
  curfew_time: 'Curfew time',
  address: 'Venue address',
}

/**
 * Calculate venue profile completeness percentage
 */
export function calculateVenueProfileCompleteness(
  venue: VenueForCompleteness
): ProfileCompletenessResult {
  const totalFields = Object.keys(FIELDS).length
  let filledFields = 0
  const missingFields: string[] = []

  for (const [key, label] of Object.entries(FIELDS)) {
    const value = venue[key as keyof VenueForCompleteness]
    const isFilled =
      value !== null &&
      value !== undefined &&
      (Array.isArray(value) ? value.length > 0 : true) &&
      (typeof value === 'string' ? value.trim().length > 0 : true)
    if (isFilled) {
      filledFields++
    } else {
      missingFields.push(label)
    }
  }

  const percentage = Math.round((filledFields / totalFields) * 100)
  return { percentage, filledFields, totalFields, missingFields }
}

/**
 * Get completeness status for UI display
 */
export function getCompletenessStatus(percentage: number): {
  status: 'incomplete' | 'partial' | 'good' | 'excellent'
  color: 'red' | 'yellow' | 'blue' | 'green'
  message: string
} {
  if (percentage < 40) {
    return {
      status: 'incomplete',
      color: 'red',
      message: 'Profile needs more information',
    }
  }
  if (percentage < 70) {
    return {
      status: 'partial',
      color: 'yellow',
      message: 'Profile partially complete',
    }
  }
  if (percentage < 90) {
    return {
      status: 'good',
      color: 'blue',
      message: 'Profile mostly complete',
    }
  }
  return {
    status: 'excellent',
    color: 'green',
    message: 'Profile complete',
  }
}
