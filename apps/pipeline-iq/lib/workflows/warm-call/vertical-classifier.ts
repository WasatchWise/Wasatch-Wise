/**
 * Vertical Classification Service
 * Classifies properties into Groove verticals and tags pain points
 * Part of the Warm Call Engine workflow
 */

import { VerticalType, detectVerticalFromProjectType, getVerticalIntelligence } from '@/lib/nepq/verticals'

export interface VerticalClassification {
  vertical: VerticalType // Internal vertical type (hotel, senior_living, etc.)
  verticalName: string
  painPoints: string[]
  grooveBundle: string // Which Groove bundle to reference
  confidence: 'high' | 'medium' | 'low'
  grooveVertical: 'hospitality' | 'senior_living' | 'multifamily' | 'student_commercial' // For URL mapping
}

/**
 * Classify a property into a Groove vertical and extract pain points
 */
export function classifyPropertyVertical(
  projectTypes: string[],
  projectStage?: string,
  projectValue?: number,
  unitsCount?: number
): VerticalClassification {
  // Detect the primary vertical
  const vertical = detectVerticalFromProjectType(projectTypes)
  const intelligence = getVerticalIntelligence(vertical)

  // Map to Groove's 4 verticals as specified in requirements
  let grooveVertical: 'hospitality' | 'senior_living' | 'multifamily' | 'student_commercial'
  let painPoints: string[]
  let grooveBundle: string

  switch (vertical) {
    case 'hotel':
      grooveVertical = 'hospitality'
      painPoints = [
        'Guest Satisfaction Scores',
        'Wi-Fi Reliability',
        'Review Management',
      ]
      grooveBundle = 'Hospitality Bundle'
      break

    case 'senior_living':
      grooveVertical = 'senior_living'
      painPoints = [
        'Resident Safety',
        'Fall Detection',
        'Staff Efficiency',
      ]
      grooveBundle = 'Senior Living Bundle'
      break

    case 'multifamily':
    case 'corporate_office':
    case 'mixed_use':
      grooveVertical = 'multifamily'
      painPoints = [
        'Amenity Fees',
        'Smart Building/IoT',
        'Resident Retention',
      ]
      grooveBundle = 'Multifamily/MDU Bundle'
      break

    case 'student_housing':
      grooveVertical = 'student_commercial'
      painPoints = [
        'Bandwidth Density',
        'Access Control',
      ]
      grooveBundle = 'Student/Commercial Bundle'
      break

    default:
      // Default to multifamily if unclear
      grooveVertical = 'multifamily'
      painPoints = [
        'Amenity Fees',
        'Smart Building/IoT',
        'Resident Retention',
      ]
      grooveBundle = 'Multifamily/MDU Bundle'
  }

  // Calculate confidence based on how specific the project type is
  let confidence: 'high' | 'medium' | 'low' = 'medium'
  if (projectTypes.length === 1 && projectTypes[0] !== 'mixed_use') {
    confidence = 'high'
  } else if (projectTypes.length > 2) {
    confidence = 'low'
  }
  
  return {
    vertical: vertical, // Keep the detected vertical for internal use
    verticalName: intelligence.name,
    painPoints,
    grooveBundle,
    confidence,
    grooveVertical, // For URL mapping to the 4 Groove verticals
  }
}

