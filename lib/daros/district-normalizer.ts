/**
 * District Name Normalizer
 * 
 * Maps CSV originator names to official Utah LEA names
 */

/**
 * Normalize district name from CSV to official LEA name
 */
export function normalizeDistrictName(csvName: string): string | null {
  const normalized = csvName.trim();
  
  // Direct mappings for common variations
  const mappings: Record<string, string | null> = {
    // Common abbreviations
    'Provo': 'Provo City School District',
    'Granite': 'Granite School District',
    'Alpine': 'Alpine School District',
    'Davis': 'Davis School District',
    'Jordan': 'Jordan School District',
    'Canyons': 'Canyons School District',
    'Nebo': 'Nebo School District',
    'Cache County School District': 'Cache County School District',
    'Cache': 'Cache County School District',
    'Iron County': 'Iron County School District',
    'Iron': 'Iron County School District',
    'Wasatch County School District': 'Wasatch County School District',
    'Wasatch': 'Wasatch County School District',
    'Tooele County School District': 'Tooele County School District',
    'Tooele District': 'Tooele County School District',
    'Tooele': 'Tooele County School District',
    'Washington County School District': 'Washington County School District',
    'Washington District': 'Washington County School District',
    'Washington': 'Washington County School District',
    'Salt Lake City': 'Salt Lake City School District',
    'Murray': 'Murray City School District',
    'Park City': 'Park City School District',
    'Ogden': 'Ogden City School District',
    'Logan City School District': 'Logan City School District',
    'Logan': 'Logan City School District',
    'Weber School District': 'Weber School District',
    'Weber': 'Weber School District',
    'Uintah': 'Uintah School District',
    'San Juan': 'San Juan School District',
    'Sevier': 'Sevier School District',
    'Millard': 'Millard School District',
    'South Summit District': 'South Summit School District',
    'South Summit': 'South Summit School District',
    'North Summit': 'North Summit School District',
    'South Sanpete': 'South Sanpete School District',
    'North Sanpete': 'North Sanpete School District',
    
    // Charter schools
    'American Academy of Innovation': 'American Academy of Innovation',
    'Promontory School of Expeditionary Learn': 'Promontory School of Expeditionary Learning',
    'Promontory School of Expeditionary Learning': 'Promontory School of Expeditionary Learning',
    'Jefferson Academy': 'Jefferson Academy',
    'Highmark Charter School': 'Highmark Charter School',
    'Quest Academy': 'Quest Academy',
    'Ascent Academies of Utah': 'Ascent Academies of Utah',
    'North Davis Preparatory Academy': 'North Davis Preparatory Academy',
    'George Washington Academy': 'George Washington Academy',
    'Renaissance Academy': 'Renaissance Academy',
    'Ogden Preparatory Academy': 'Ogden Preparatory Academy',
    'Intech Collegiate High School': 'InTech Collegiate Academy',
    'Intech': 'InTech Collegiate Academy',
    'Moab Charter School': null, // Not in official list, might be closed
    'Utah Schools for the Deaf and Blind': null, // State agency, not LEA
  };
  
  // Check direct mapping first
  if (mappings[normalized]) {
    return mappings[normalized];
  }
  
  // Try fuzzy matching
  const lowerNormalized = normalized.toLowerCase();
  
  // Remove common suffixes
  const cleaned = normalized
    .replace(/\s*(District|School District|Charter|Academy|School)\s*$/i, '')
    .trim();
  
  // Try to match against known patterns
  for (const [key, value] of Object.entries(mappings)) {
    if (value && key.toLowerCase().includes(lowerNormalized) || 
        lowerNormalized.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // If it already looks like an official name, return as-is
  if (normalized.includes('School District') || 
      normalized.includes('Charter') ||
      normalized.includes('Academy')) {
    return normalized;
  }
  
  // Return null if we can't match
  return null;
}

/**
 * Get all official Utah LEA names
 */
export function getAllUtahLEANames(): string[] {
  return [
    // School Districts (41)
    'Alpine School District',
    'Beaver County School District',
    'Box Elder School District',
    'Cache County School District',
    'Canyons School District',
    'Carbon School District',
    'Daggett School District',
    'Davis School District',
    'Duchesne County School District',
    'Emery County School District',
    'Garfield County School District',
    'Grand County School District',
    'Granite School District',
    'Iron County School District',
    'Jordan School District',
    'Juab School District',
    'Kane County School District',
    'Logan City School District',
    'Millard School District',
    'Morgan County School District',
    'Murray City School District',
    'Nebo School District',
    'North Sanpete School District',
    'North Summit School District',
    'Ogden City School District',
    'Park City School District',
    'Piute County School District',
    'Provo City School District',
    'Rich School District',
    'Salt Lake City School District',
    'San Juan School District',
    'Sevier School District',
    'South Sanpete School District',
    'South Summit School District',
    'Tintic School District',
    'Tooele County School District',
    'Uintah School District',
    'Wasatch County School District',
    'Washington County School District',
    'Wayne County School District',
    'Weber School District',
    // Charter Schools (116) - truncated for brevity, full list in seed file
  ];
}
