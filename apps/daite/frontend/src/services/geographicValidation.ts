/**
 * Geographic Validation Service
 * 
 * Validates user HOME location against DAiTE's geographic restrictions:
 * 1. Must be in the United States
 * 2. HOME location must be outside 6-hour driving radius of Salt Lake City International Airport
 * 
 * Note: Travelers/visitors to the SLC area can use DAiTE if their home address
 * is outside the restricted zone. Only HOME/permanent locations are validated.
 */

import { supabase } from '../lib/supabase'

export interface LocationValidationResult {
  allowed: boolean
  error?: string
  countryCheck?: boolean
  distanceCheck?: boolean
  distanceFromSLC?: number
}

/**
 * Check if a HOME location is allowed for DAiTE registration
 * @param country - Country of HOME address
 * @param latitude - Latitude of HOME address
 * @param longitude - Longitude of HOME address
 * @param isHomeLocation - TRUE for home/permanent address (validated), FALSE for current/travel location (not restricted)
 */
export async function validateLocation(
  country: string,
  latitude?: number,
  longitude?: number,
  isHomeLocation: boolean = true
): Promise<LocationValidationResult> {
  if (!supabase) {
    return {
      allowed: false,
      error: 'Database connection unavailable. Please try again later.',
    }
  }

  try {
    const { data, error } = await supabase.rpc('can_user_register', {
      country: country || null,
      lat: latitude || null,
      lon: longitude || null,
      is_home_location: isHomeLocation,
    })

    if (error) {
      console.error('Geographic validation error:', error)
      return {
        allowed: false,
        error: 'Unable to validate location. Please try again.',
      }
    }

    return data as LocationValidationResult
  } catch (error) {
    console.error('Geographic validation exception:', error)
    return {
      allowed: false,
      error: 'An error occurred while validating your location. Please try again.',
    }
  }
}

/**
 * Quick check: Is country United States?
 */
export function isUSCountry(country: string): boolean {
  const normalized = country?.toUpperCase().trim()
  return ['US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA'].includes(normalized)
}

/**
 * Get user-friendly error message
 */
export function getLocationErrorMessage(result: LocationValidationResult): string {
  if (result.allowed) {
    return ''
  }

  if (result.error) {
    return result.error
  }

  if (result.countryCheck === false) {
    return 'DAiTE is currently only available to users in the United States. We\'re working on expanding to other countries in the future.'
  }

  if (result.distanceCheck === false && result.distanceFromSLC) {
    return `DAiTE is not available within a 6-hour driving radius of Salt Lake City. Your location is approximately ${Math.round(result.distanceFromSLC)} miles from Salt Lake City International Airport. This restriction is temporary and may be lifted in the future.`
  }

  return 'DAiTE is currently only available to users in the United States, excluding the Salt Lake City area.'
}

/**
 * Validate HOME location during registration flow
 * Note: This validates permanent/home address, not current/travel location
 */
export async function validateRegistrationLocation(
  country: string,
  state?: string,
  city?: string,
  latitude?: number,
  longitude?: number,
  isHomeLocation: boolean = true
): Promise<{ valid: boolean; error?: string }> {
  // First check: Country must be US
  if (!isUSCountry(country)) {
    return {
      valid: false,
      error: 'DAiTE is currently only available to users in the United States. We\'re working on expanding to other countries in the future.',
    }
  }

  // Second check: If HOME coordinates provided, check distance from SLC
  // Travel locations (isHomeLocation = false) are not restricted
  if (isHomeLocation && latitude !== undefined && longitude !== undefined) {
    const result = await validateLocation(country, latitude, longitude, true)
    if (!result.allowed) {
      return {
        valid: false,
        error: getLocationErrorMessage(result),
      }
    }
  }

  return { valid: true }
}

