
export type GrooveVertical = 'Hospitality' | 'Senior Living' | 'Multifamily' | 'Student/Commercial' | 'General'

export interface ClassificationResult {
    vertical: GrooveVertical
    pain_points: string[]
    groove_bundle: string
}

export function classifyProject(projectTypes: string[]): ClassificationResult {
    // Normalize types to lowercase for comparison
    const types = projectTypes.map(t => t.toLowerCase())

    // 1. Hospitality
    if (types.some(t =>
        t.includes('hotel') ||
        t.includes('resort') ||
        t.includes('motel') ||
        t.includes('hospitality') ||
        t.includes('inn')
    )) {
        return {
            vertical: 'Hospitality',
            pain_points: ['Guest Satisfaction Scores', 'Wi-Fi Reliability', 'Review Management'],
            groove_bundle: 'Guest Experience Suite'
        }
    }

    // 2. Senior Living
    if (types.some(t =>
        t.includes('senior') ||
        t.includes('assisted') ||
        t.includes('nursing') ||
        t.includes('retirement') ||
        t.includes('care')
    )) {
        return {
            vertical: 'Senior Living',
            pain_points: ['Resident Safety', 'Fall Detection', 'Staff Efficiency'],
            groove_bundle: 'Care & Safety Suite'
        }
    }

    // 3. Multifamily / MDU
    if (types.some(t =>
        t.includes('multifamily') ||
        t.includes('multi-family') ||
        t.includes('apartment') ||
        t.includes('condo') ||
        t.includes('residential') ||
        t.includes('townhouse')
    )) {
        return {
            vertical: 'Multifamily',
            pain_points: ['Amenity Fees', 'Smart Building/IoT', 'Resident Retention'],
            groove_bundle: 'Connected Community Suite'
        }
    }

    // 4. Student / Commercial
    if (types.some(t =>
        t.includes('student') ||
        t.includes('dorm') ||
        t.includes('university') ||
        t.includes('office') ||
        t.includes('commercial') ||
        t.includes('retail')
    )) {
        return {
            vertical: 'Student/Commercial',
            pain_points: ['Bandwidth Density', 'Access Control'],
            groove_bundle: 'High-Density Campus Suite'
        }
    }

    // Fallback
    return {
        vertical: 'General',
        pain_points: ['Vendor Consolidation', 'Project Simplicity'],
        groove_bundle: 'Groove Essentials'
    }
}
