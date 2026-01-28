export const UTAH_SCHOOL_DISTRICTS = [
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
];

export const UTAH_CHARTER_SCHOOLS = [
    'Academy for Math Engineering & Science (AMES)',
    'Advantage Arts Academy',
    'American Academy of Innovation',
    'American Leadership Academy',
    'American Preparatory Academy',
    'American Principles Academy',
    'Ascent Academies of Utah',
    'Athenian eAcademy',
    'Azure Fields Charter High School',
    'Bear River Charter School',
    'Beehive Science & Technology Academy',
    'Bonneville Academy',
    'Bridge Elementary School',
    'C.S. Lewis Academy',
    'Canyon Grove Academy',
    'Canyon Rim Academy',
    'Channing Hall',
    'City Academy',
    'Custom Class Charter School',
    'Davinci Academy',
    'Dual Immersion Academy',
    'Early Light Academy at Daybreak',
    'East Hollywood High',
    'Edith Bowen Laboratory School',
    'Elevated Charter School',
    'Endeavor Hall',
    'Entheos Academy',
    'Esperanza School',
    'Excelsior Academy',
    'Fast Forward High',
    'Franklin Discovery Academy',
    'Freedom Preparatory Academy',
    'Gateway Preparatory Academy',
    'George Washington Academy',
    'Good Foundations Academy',
    'Greenwood Charter School',
    'Guadalupe School',
    'Hawthorn Academy',
    'Highmark Charter School',
    'Ignite Entrepreneurship Academy',
    'InTech Collegiate Academy',
    'Itineris Early College High School',
    'Jefferson Academy',
    'John Hancock Charter School',
    'Karl G. Maeser Preparatory Academy',
    'Lakeview Academy',
    'Leadership Academy of Utah',
    'Leadership Learning Academy',
    'Legacy Preparatory Academy',
    'Lincoln Academy',
    'Lumen Scholar Institute',
    'Mana Academy Charter School',
    'Maria Montessori Academy',
    'Merit College Preparatory Academy',
    'Monticello Academy',
    'Mountain Heights Academy',
    'Mountain Sunrise Academy',
    'Mountain View Montessori',
    'Mountain West Montessori Academy',
    'Mountainville Academy',
    'Navigator Pointe Academy',
    'No. UT. Acad. for Math Engineering & Science (NUAMES)',
    'Noah Webster Academy',
    'North Davis Preparatory Academy',
    'North Star Academy',
    'Odyssey Charter School',
    'Ogden Preparatory Academy',
    'Open Classroom',
    'Pacific Heritage Academy',
    'Paradigm High School',
    'Pinnacle Canyon Academy',
    'Promontory School of Expeditionary Learning',
    'Providence Hall',
    'Quest Academy',
    'Ranches Academy',
    'Reagan Academy',
    'Renaissance Academy',
    'Rockwell Charter High School',
    'Roots Charter High School',
    'Salt Lake Academy High School',
    'Salt Lake Arts Academy',
    'Salt Lake Center for Science Education',
    'Scholar Academy',
    'Soldier Hollow Charter School',
    'Spectrum Academy',
    'St. George Academy',
    'Success Academy',
    'Summit Academy',
    'Syracuse Arts Academy',
    'Terra Academy',
    'The Center for Creativity Innovation and Discovery',
    'Thomas Edison Charter School',
    'ThrivePoint Academy',
    'Timpanogos Academy',
    'Treeside Charter School',
    'Uintah River High',
    'Utah Arts Academy',
    'Utah Career Path High School',
    'Utah Connections Academy',
    'Utah County Academy of Science (UCAS)',
    'Utah International Charter School',
    'Utah Military Academy',
    'Utah Virtual Academy',
    'Valley Academy',
    'Vanguard Academy',
    'Venture Academy',
    'Virtual Horizons Charter School',
    'Vista School',
    'Voyage Academy',
    'Walden School of Liberal Arts',
    'Wallace Stegner Academy',
    'Wasatch Peak Academy',
    'Wasatch Waldorf Charter School',
    'Weber State University Charter Academy',
    'Weilenmann School of Discovery',
    'Winter Sports School',
];

/**
 * Determine size band based on district name/type
 */
export function getSizeBand(name: string): 'small' | 'medium' | 'large' | 'mega' {
    // Check if charter (assume most are small unless specified)
    if (UTAH_CHARTER_SCHOOLS.includes(name)) {
        return 'small';
    }

    // Large districts (known from Utah)
    const largeDistricts = [
        'Alpine School District',
        'Granite School District',
        'Davis School District',
        'Jordan School District',
        'Canyons School District',
        'Nebo School District',
    ];

    if (largeDistricts.includes(name)) {
        // Alpine is uniquely massive
        if (name === 'Alpine School District') return 'mega';
        return 'large';
    }

    return 'medium';
}

/**
 * Get available districts for a state
 */
export function getDistrictsByState(stateCode: string): string[] {
    if (stateCode === 'UT') {
        return [...UTAH_SCHOOL_DISTRICTS, ...UTAH_CHARTER_SCHOOLS].sort();
    }

    // Fallback for other states (mock data for now to demonstrate extensibility)
    if (stateCode === 'CO') {
        return ['Denver Public Schools', 'Jeffco Public Schools', 'Cherry Creek School District', 'Other'];
    }

    return [];
}
