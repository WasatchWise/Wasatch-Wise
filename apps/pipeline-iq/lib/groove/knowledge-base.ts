/**
 * Groove Technology Solutions Knowledge Base
 * Complete product stack, value propositions, and sales intelligence
 * 
 * Integrated with NEPQ framework for optimal sales conversations
 */

export type GrooveIndustry =
  | 'hospitality'
  | 'senior_living'
  | 'multifamily'
  | 'student_housing'
  | 'government'
  | 'commercial'
  | 'k12'
  | 'arena'
  | 'prison'
  | 'man_camp'

export type GrooveSolutionCategory =
  | 'infrastructure'
  | 'tv_wifi_phone'
  | 'smart_building'
  | 'access_security'

export type ProjectStage =
  | 'planning'
  | 'design'
  | 'pre_construction'
  | 'construction'
  | 'fit_out'
  | 'operating'
  | 'renovation'

export interface GrooveProduct {
  id: string
  name: string
  category: GrooveSolutionCategory
  industries: GrooveIndustry[]
  description: string
  keyFeatures: string[]
  painPointsSolved: string[]
  valuePropositions: string[]
  certifications?: string[]
  bestProjectStages: ProjectStage[]
  typicalUnitCount?: { min?: number; max?: number }
  talkingPoints: string[]
}

export interface GrooveValueProposition {
  id: string
  title: string
  description: string
  supportingProducts: string[]
  objectionHandling: string[]
  nepqStage: 'connecting' | 'engagement' | 'transition' | 'presentation' | 'commitment'
}

export interface ProjectToSolutionMapping {
  projectType: string[]
  projectStage: ProjectStage
  unitCount?: number
  amenities?: string[]
  recommendedProducts: string[]
  discoveryQuestions: string[]
  valuePropsToLead: string[]
}

// ============================================
// GROOVE PRODUCT CATALOG
// ============================================

export const GROOVE_PRODUCTS: Record<string, GrooveProduct> = {
  // INFRASTRUCTURE
  structured_cabling: {
    id: 'structured_cabling',
    name: 'Structured Cabling',
    category: 'infrastructure',
    industries: ['hospitality', 'senior_living', 'multifamily', 'student_housing', 'commercial'],
    description: 'Organized low-voltage wiring (data, voice, TV) as the digital foundation for all building technology',
    keyFeatures: [
      'Designed for long-term reliability',
      'Supports all other technology (Wi-Fi, TV, access control)',
      'Future-ready architecture',
      'Code-compliant installation',
    ],
    painPointsSolved: [
      'Vendor sprawl and coordination headaches',
      'Future technology upgrades requiring rewiring',
      'Unreliable connectivity due to poor infrastructure',
      'Multiple change orders during construction',
    ],
    valuePropositions: [
      'One-time investment that supports decades of technology',
      'Prevents costly retrofits later',
      'Reduces construction disruption',
      'Single partner for entire infrastructure',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction'],
    talkingPoints: [
      'Gigabit services over existing wiring through G.hn technology',
      'Designed so all other technology runs reliably for years',
      'The "roots" of your building\'s technology ecosystem',
    ],
  },

  retrofit_solutions: {
    id: 'retrofit_solutions',
    name: 'Retrofit Solutions',
    category: 'infrastructure',
    industries: ['hospitality', 'senior_living', 'multifamily'],
    description: 'Use existing wiring (coax, copper) to deliver gigabit internet without tearing open walls',
    keyFeatures: [
      'G.hn technology for gigabit over existing wiring',
      'Property assessment and design',
      'Long-term viability focus (not band-aids)',
      'Minimal disruption to operations',
    ],
    painPointsSolved: [
      'Capex shock from full rewiring',
      'Construction disruption and downtime',
      'Budget constraints on new construction',
      'Need for modern speeds without major renovation',
    ],
    valuePropositions: [
      'Gigabit speeds without major construction',
      'Future-ready, not quick fixes',
      'Reduced cost vs. full rewiring',
      'Minimal operational disruption',
    ],
    bestProjectStages: ['renovation', 'operating', 'fit_out'],
    talkingPoints: [
      'Gigabit services over existing wiring',
      'Property assessment and design for long-term viability',
      'Upgrades aimed at sustainability, not band-aids',
    ],
  },

  cellular_amplification: {
    id: 'cellular_amplification',
    name: 'Cellular Amplification (DAS)',
    category: 'infrastructure',
    industries: ['hospitality', 'senior_living', 'multifamily', 'commercial', 'arena'],
    description: 'Distributed Antenna Systems that eliminate dead zones inside buildings for reliable voice and data',
    keyFeatures: [
      'Eliminates cellular dead zones',
      'Reliable voice and data coverage',
      'Critical for emergency communications',
      'Supports all major carriers',
    ],
    painPointsSolved: [
      'Guest/resident complaints about poor cell service',
      'Emergency communication failures',
      'Staff unable to use mobile devices',
      'Negative reviews due to connectivity issues',
    ],
    valuePropositions: [
      'Improved guest/resident satisfaction',
      'Emergency communication reliability',
      'Better staff productivity',
      'Competitive advantage in reviews',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction', 'renovation'],
    talkingPoints: [
      'Distributed Antenna Systems eliminate dead zones',
      'Critical for emergency use and guest satisfaction',
      'Reliable voice and data for guests, residents, and staff',
    ],
  },

  public_safety_das: {
    id: 'public_safety_das',
    name: 'Public Safety DAS (ERCES)',
    category: 'infrastructure',
    industries: ['hospitality', 'senior_living', 'multifamily', 'commercial', 'government'],
    description: 'Emergency Radio Coverage Enhancement Systems to meet fire and life safety codes',
    keyFeatures: [
      'Code-compliant ERCES design',
      'Site assessments and tailored solutions',
      'Prevents failed occupancy inspections',
      'Meets local fire code requirements',
    ],
    painPointsSolved: [
      'Failed occupancy permits due to missing ERCES',
      'Delayed building openings',
      'Code compliance uncertainty',
      'Emergency responder communication failures',
    ],
    valuePropositions: [
      'Prevents failed inspections and delayed openings',
      'Code-compliant from day one',
      'Peace of mind for owners and developers',
      'Meets all local fire code requirements',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction'],
    talkingPoints: [
      'Many buildings fail occupancy due to missing ERCES',
      'Designed to satisfy local fire code and ERCES requirements',
      'Site assessments and tailored solutions for compliance',
    ],
  },

  internet_circuits: {
    id: 'internet_circuits',
    name: 'Internet Circuits',
    category: 'infrastructure',
    industries: ['hospitality', 'senior_living', 'multifamily', 'commercial'],
    description: 'WAN circuit procurement and design with lightning-quick speed and reliability',
    keyFeatures: [
      'Variety of circuit types',
      'Sized for bandwidth and budget',
      'Lightning-quick speed',
      'Reliability even in heavy usage',
    ],
    painPointsSolved: [
      'Insufficient bandwidth for property needs',
      'Unreliable internet affecting operations',
      'Complex circuit procurement',
      'Poor performance during peak usage',
    ],
    valuePropositions: [
      'Right-sized for your needs and budget',
      'Reliable even under heavy load',
      'Single partner for circuit design and procurement',
      'Optimized for property technology stack',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction'],
    talkingPoints: [
      'Lightning-quick speed and reliability',
      'Designed for bandwidth and budget',
      'Variety of circuit types to meet needs',
    ],
  },

  // TV, WIFI & PHONE
  directv: {
    id: 'directv',
    name: 'DIRECTV Property Solutions',
    category: 'tv_wifi_phone',
    industries: ['hospitality', 'senior_living'],
    description: 'Full DIRECTV property solutions for hospitality and senior living with COM1000/2000/3000 and DRE platforms',
    keyFeatures: [
      'COM1000/2000/3000 platforms',
      'DRE suites',
      'Award-winning expertise',
      'Full property solutions',
    ],
    painPointsSolved: [
      'Guest complaints about TV service',
      'Complex TV system management',
      'Need for reliable entertainment',
      'Integration with other property systems',
    ],
    valuePropositions: [
      'Multiple national awards (AT&T Dealer of Year, DIRECTV lodging awards)',
      'Deep technical certification',
      'Reliable guest entertainment',
      'Integrated with property management',
    ],
    certifications: ['COM1000', 'COM2000', 'COM3000', 'DRE'],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction'],
    talkingPoints: [
      'AT&T Dealer of the Year',
      'Multiple DIRECTV lodging awards',
      'HBO Top Lodging Dealer',
      'Expertise with COM1000/2000/3000 and DRE platforms',
    ],
  },

  managed_wifi: {
    id: 'managed_wifi',
    name: 'Managed Wi-Fi Services',
    category: 'tv_wifi_phone',
    industries: ['hospitality', 'senior_living', 'multifamily', 'student_housing', 'commercial'],
    description: 'Enterprise-grade Wi-Fi design, deployment, and monitoring using Ruckus, Aruba, Cisco Meraki',
    keyFeatures: [
      'Ruckus, Aruba, Cisco Meraki expertise',
      'Ekahau design tools',
      '24/7 monitoring',
      'Scalable deployment',
    ],
    painPointsSolved: [
      'Poor Wi-Fi coverage and speed',
      'Guest/resident complaints',
      'Complex Wi-Fi management',
      'Need for reliable connectivity',
    ],
    valuePropositions: [
      'Enterprise-grade reliability',
      'Expert design and deployment',
      'Ongoing monitoring and support',
      'Certified in Tier-1 vendors',
    ],
    certifications: ['RACPA', 'RICXI', 'Aruba Wireless', 'Cisco Meraki', 'CWNA', 'Ekahau ECSE'],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction', 'renovation'],
    talkingPoints: [
      'Certified in Ruckus, Aruba, Cisco Meraki',
      'Ekahau design expertise',
      'Enterprise-grade Wi-Fi for hospitality and multifamily',
    ],
  },

  phone_systems: {
    id: 'phone_systems',
    name: 'Phone Systems (VoIP/PBX)',
    category: 'tv_wifi_phone',
    industries: ['hospitality', 'senior_living', 'multifamily', 'commercial'],
    description: 'VoIP and PBX solutions for front desk, back-of-house, resident rooms, and admin staff',
    keyFeatures: [
      'VoIP and PBX solutions',
      'Front desk and back-of-house',
      'Resident room phones',
      'Admin staff systems',
    ],
    painPointsSolved: [
      'Outdated phone systems',
      'Poor call quality',
      'Complex phone management',
      'Need for modern communication',
    ],
    valuePropositions: [
      'Modern VoIP technology',
      'Integrated with property systems',
      'Reliable communication',
      'Single partner for all voice needs',
    ],
    certifications: ['Phonesuite Voiceware', 'Asterisk Essentials'],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction', 'renovation'],
    talkingPoints: [
      'VoIP and PBX for all property needs',
      'Integrated voice solutions',
      'Reliable communication systems',
    ],
  },

  // SMART BUILDING
  della_os: {
    id: 'della_os',
    name: 'Della OS & Resident App',
    category: 'smart_building',
    industries: ['multifamily', 'student_housing', 'senior_living'],
    description: 'First-of-its-kind platform unifying smart hardware and software into one management system',
    keyFeatures: [
      'Centralized property control',
      'Resident mobile app',
      'Controls lighting, HVAC, locks',
      'Maintenance requests and amenity reservations',
      'Community events integration',
    ],
    painPointsSolved: [
      'Multiple disconnected systems',
      'Staff overload from manual tasks',
      'Resident expectations for smart features',
      'Lack of unified property management',
    ],
    valuePropositions: [
      'One platform for all smart building technology',
      'Reduced staff workload',
      'Attracts technology-savvy residents',
      'Increases NOI through efficiency',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction', 'renovation'],
    talkingPoints: [
      'First-of-its-kind unified platform',
      'Property side: centralized control',
      'Resident side: mobile app for everything',
      'Attracts Millennials and Gen Z',
    ],
  },

  ev_charging: {
    id: 'ev_charging',
    name: 'EV Charging',
    category: 'smart_building',
    industries: ['multifamily', 'hospitality', 'senior_living', 'commercial'],
    description: 'Smart EV chargers with usage tracking, scalable deployment, and property system integration',
    keyFeatures: [
      'Usage tracking',
      'Scalable deployment',
      'Future-proofing',
      'Integration with property systems',
    ],
    painPointsSolved: [
      'Resident/guest demand for EV charging',
      'Competitive disadvantage without EV',
      'Need for scalable solution',
      'Revenue opportunity from charging',
    ],
    valuePropositions: [
      'Attracts EV owners',
      'Competitive advantage',
      'Revenue opportunity',
      'Future-proofs property',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction'],
    talkingPoints: [
      'Smart EV chargers for multifamily and hospitality',
      'Usage tracking and scalable deployment',
      'Future-proofing and integration',
    ],
  },

  leak_detection: {
    id: 'leak_detection',
    name: 'Smart Leak Detection',
    category: 'smart_building',
    industries: ['multifamily', 'senior_living', 'hospitality'],
    description: 'Smart water leak sensors with 24/7 monitoring and real-time alerts',
    keyFeatures: [
      '24/7 monitoring',
      'Real-time alerts',
      'Prevents water damage',
      'Reduces insurance risk',
    ],
    painPointsSolved: [
      'Water damage from undetected leaks',
      'High insurance costs',
      'Resident complaints about water issues',
      'Expensive repairs from delayed detection',
    ],
    valuePropositions: [
      'Prevents costly water damage',
      'Reduces insurance premiums',
      'Peace of mind for owners',
      '24/7 protection',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction', 'renovation'],
    talkingPoints: [
      'Smart water leak sensors',
      '24/7 monitoring and real-time alerts',
      'Prevents water damage and reduces risk',
    ],
  },

  self_guided_tours: {
    id: 'self_guided_tours',
    name: 'Self-Guided Tours',
    category: 'smart_building',
    industries: ['multifamily', 'student_housing', 'senior_living'],
    description: 'Self-guided touring systems with Touch Tour platform integration',
    keyFeatures: [
      'Content-rich kiosk experience',
      'Floorplans, videos, 3D tours',
      'Virtual tours for remote leasing',
      'Integrated pricing and availability',
      'Online leasing initiation',
      'Time-limited secure access',
    ],
    painPointsSolved: [
      'Staff overload from tour scheduling',
      'Missed leasing opportunities',
      'Need for 24/7 tour availability',
      'Competitive disadvantage',
    ],
    valuePropositions: [
      'Reduces staff workload',
      '24/7 tour availability',
      'Increases leasing efficiency',
      'Attracts technology-savvy renters',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction', 'operating'],
    talkingPoints: [
      'Touch Tour platform integration',
      'Content-rich digital experience',
      'Virtual tours and online leasing',
      'Time-limited secure access',
    ],
  },

  // ACCESS & SECURITY
  access_control: {
    id: 'access_control',
    name: 'Access Control',
    category: 'access_security',
    industries: ['multifamily', 'senior_living', 'hospitality', 'commercial'],
    description: 'Card, fob, and mobile credential systems with detailed audit trails',
    keyFeatures: [
      'Card, fob, and mobile credentials',
      'Grant/revoke access remotely',
      'Detailed audit trails',
      'Entry tracking',
    ],
    painPointsSolved: [
      'Security concerns',
      'Lost keys and rekeying costs',
      'Lack of access control',
      'Need for audit trails',
    ],
    valuePropositions: [
      'Enhanced security',
      'Remote access management',
      'Detailed tracking and audit',
      'Reduced rekeying costs',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction', 'renovation'],
    talkingPoints: [
      'Card, fob, and mobile credential systems',
      'Grant/revoke access with detailed audit trails',
      'Entry tracking for security',
    ],
  },

  smart_locks: {
    id: 'smart_locks',
    name: 'Smart Locks',
    category: 'access_security',
    industries: ['multifamily', 'senior_living', 'hospitality'],
    description: 'Keyless locks controlled by app, keypad, or biometrics with remote management',
    keyFeatures: [
      'App, keypad, biometric control',
      'Remote management',
      'Temporary codes for move-ins',
      'Real-time alerts',
    ],
    painPointsSolved: [
      'Lost keys and rekeying',
      'Need for temporary access',
      'Lack of modern lock technology',
      'Security concerns',
    ],
    valuePropositions: [
      'No more lost keys',
      'Temporary codes for move-ins/check-ins',
      'Remote management',
      'Real-time alerts',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction', 'renovation'],
    talkingPoints: [
      'Keyless locks controlled by app, keypad, biometrics',
      'Remote management and temporary codes',
      'Real-time alerts',
    ],
  },

  video_surveillance: {
    id: 'video_surveillance',
    name: 'Video Surveillance',
    category: 'access_security',
    industries: ['multifamily', 'senior_living', 'hospitality', 'commercial'],
    description: 'High-resolution camera systems with real-time monitoring and recorded footage',
    keyFeatures: [
      'High-resolution cameras',
      'Real-time monitoring',
      'Recorded footage',
      'Critical area coverage',
    ],
    painPointsSolved: [
      'Security concerns',
      'Need for incident investigation',
      'Lack of property visibility',
      'Insurance requirements',
    ],
    valuePropositions: [
      'Enhanced security',
      'Incident investigation capability',
      'Real-time monitoring',
      'Peace of mind',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction', 'construction', 'renovation'],
    talkingPoints: [
      'High-resolution camera systems',
      'Real-time monitoring and recorded footage',
      'Coverage of critical areas',
    ],
  },

  fire_alarm: {
    id: 'fire_alarm',
    name: 'Fire Alarm Systems',
    category: 'access_security',
    industries: ['hospitality', 'senior_living', 'multifamily', 'commercial'],
    description: 'Code-compliant fire alarm systems with smoke, heat, CO detection and automatic alerts',
    keyFeatures: [
      'Smoke, heat, CO detection',
      'Automatic alerts',
      'Code-compliant design',
      'Emergency service integration',
    ],
    painPointsSolved: [
      'Code compliance requirements',
      'Life safety concerns',
      'Failed inspections',
      'Need for reliable fire detection',
    ],
    valuePropositions: [
      'Code-compliant life safety',
      'Meets safety regulations',
      'Automatic emergency alerts',
      'Peace of mind',
    ],
    bestProjectStages: ['planning', 'design', 'pre_construction'],
    talkingPoints: [
      'Code-compliant fire alarm systems',
      'Meets safety regulations',
      'Automatic alerts to occupants and emergency services',
    ],
  },
}

// ============================================
// GROOVE VALUE PROPOSITIONS
// ============================================

export const GROOVE_VALUE_PROPOSITIONS: GrooveValueProposition[] = [
  {
    id: 'one_partner',
    title: 'One Partner, One Throat to Choke',
    description: 'All TV, Wi-Fi, phones, doors, cameras, smart building, and life safety handled under one roof',
    supportingProducts: [
      'structured_cabling',
      'managed_wifi',
      'directv',
      'phone_systems',
      'access_control',
      'video_surveillance',
      'della_os',
    ],
    objectionHandling: [
      'Eliminates vendor coordination headaches',
      'Single point of accountability',
      'Reduced complexity and management overhead',
      'One contract, one relationship',
    ],
    nepqStage: 'presentation',
  },
  {
    id: 'future_ready',
    title: 'Future-Ready, Not Band-Aid',
    description: 'Strong emphasis on design for scalability and upcoming technology, not quick fixes',
    supportingProducts: ['structured_cabling', 'retrofit_solutions', 'managed_wifi', 'della_os'],
    objectionHandling: [
      'Prevents costly retrofits later',
      'Designed for long-term viability',
      'Scalable architecture',
      'Investment that pays dividends',
    ],
    nepqStage: 'transition',
  },
  {
    id: 'groove_guarantee',
    title: 'The Groove Guarantee',
    description: 'On Time, On Scope, On Budget, On Going - backed by $500 make-good if we drop the ball',
    supportingProducts: [], // Applies to all products
    objectionHandling: [
      'Eliminates fear of change orders',
      'Schedule risk protection',
      'Budget certainty',
      'Long-term support commitment',
      'Real money on the line ($500 gift card)',
    ],
    nepqStage: 'commitment',
  },
  {
    id: 'specialization',
    title: 'Specialization in Experience-Critical Properties',
    description: 'Deep expertise in hotels, senior living, multifamily, and complex commercial sites',
    supportingProducts: [], // Applies to all products
    objectionHandling: [
      'Industry-specific expertise',
      'Understanding of unique needs',
      'Proven track record',
      'Award-winning performance',
    ],
    nepqStage: 'connecting',
  },
  {
    id: 'integrated_experience',
    title: 'Integrated Resident and Staff Experience',
    description: 'Della OS, Resident App, self-guided tours, parcel, EV, access control all working together',
    supportingProducts: ['della_os', 'self_guided_tours', 'ev_charging', 'access_control'],
    objectionHandling: [
      'Reduces staff workload',
      'Attracts technology-savvy residents',
      'Increases NOI through efficiency',
      'Competitive advantage',
    ],
    nepqStage: 'presentation',
  },
]

// ============================================
// PROJECT TO SOLUTION MAPPING
// ============================================

export function mapProjectToGrooveSolutions(
  project: {
    projectType: string[]
    projectStage: ProjectStage
    unitCount?: number
    amenities?: string[]
    description?: string
  }
): ProjectToSolutionMapping {
  const { projectType, projectStage, unitCount, amenities = [] } = project

  const recommendedProducts: string[] = []
  const discoveryQuestions: string[] = []
  const valuePropsToLead: string[] = []

  // Always recommend infrastructure for new construction
  if (['planning', 'design', 'pre_construction', 'construction'].includes(projectStage)) {
    recommendedProducts.push('structured_cabling', 'public_safety_das', 'internet_circuits')
    discoveryQuestions.push(
      'What\'s your timeline for low-voltage infrastructure installation?',
      'Have you considered ERCES requirements for occupancy permits?',
      'What bandwidth needs do you anticipate for the property?'
    )
  }

  // Hospitality-specific
  if (projectType.some((t) => ['hotel', 'motel', 'resort', 'campground'].includes(t.toLowerCase()))) {
    recommendedProducts.push('directv', 'managed_wifi', 'phone_systems', 'access_control')
    if (amenities.includes('EV') || amenities.includes('EV parking')) {
      recommendedProducts.push('ev_charging')
    }
    valuePropsToLead.push('specialization', 'one_partner')
    discoveryQuestions.push(
      'What TV and entertainment solution are you planning?',
      'How important is reliable Wi-Fi for guest satisfaction?',
      'What access control system do you need for guest rooms and common areas?'
    )
  }

  // Senior Living-specific
  if (projectType.some((t) => ['senior_living', 'assisted_living', 'memory_care'].includes(t.toLowerCase()))) {
    recommendedProducts.push('cellular_amplification', 'public_safety_das', 'leak_detection', 'managed_wifi')
    valuePropsToLead.push('specialization', 'groove_guarantee')
    discoveryQuestions.push(
      'How critical is cellular coverage for emergency communications?',
      'What safety monitoring systems do you need?',
      'How will you handle water leak detection across the property?'
    )
  }

  // Multifamily-specific
  if (projectType.some((t) => ['multifamily', 'apartment', 'condo'].includes(t.toLowerCase()))) {
    recommendedProducts.push('della_os', 'managed_wifi', 'smart_locks', 'access_control')
    if (amenities.includes('EV') || amenities.includes('EV parking')) {
      recommendedProducts.push('ev_charging')
    }
    if (amenities.includes('parcel') || amenities.includes('package')) {
      // Note: Parcel lockers would be a product, but not in current catalog
    }
    if (unitCount && unitCount >= 50) {
      recommendedProducts.push('self_guided_tours')
    }
    valuePropsToLead.push('integrated_experience', 'future_ready')
    discoveryQuestions.push(
      'What smart building features are residents expecting?',
      'How will you handle self-guided tours for leasing?',
      'What access control solution do you need for resident units?'
    )
  }

  // Student Housing-specific
  if (projectType.some((t) => ['student_housing', 'dormitory'].includes(t.toLowerCase()))) {
    recommendedProducts.push('della_os', 'managed_wifi', 'self_guided_tours', 'smart_locks')
    valuePropsToLead.push('integrated_experience', 'future_ready')
    discoveryQuestions.push(
      'What technology expectations do Gen Z students have?',
      'How will you handle high-bandwidth Wi-Fi demands?',
      'What smart features will attract students?'
    )
  }

  // Always add video surveillance for security
  if (['planning', 'design', 'pre_construction', 'construction'].includes(projectStage)) {
    recommendedProducts.push('video_surveillance')
  }

  // Remove duplicates
  const uniqueProducts = [...new Set(recommendedProducts)]

  return {
    projectType,
    projectStage,
    unitCount,
    amenities,
    recommendedProducts: uniqueProducts,
    discoveryQuestions,
    valuePropsToLead,
  }
}

// ============================================
// GROOVE GUARANTEE DETAILS
// ============================================

export const GROOVE_GUARANTEE = {
  onTime: 'They commit to the agreed schedule',
  onScope: 'What they promise is what they deliver, no surprise or unapproved change orders',
  onBudget: 'The number you sign is the number you pay, period',
  onGoing: 'After install they do not disappear, they lean into long-term support',
  makeGood: 'If Groove fails and it is their fault, they "own it" and make it right with a $500 gift card',
}

// ============================================
// GROOVE PAIN POINTS (Buyer's Perspective)
// ============================================

export const GROOVE_PAIN_POINTS = {
  vendor_sprawl: {
    title: 'Complexity and Vendor Sprawl',
    description: 'Owners juggling multiple vendors for TV, Wi-Fi, access control, security, EV charging, leak detection',
    solution: 'One partner, end-to-end',
    nepqStage: 'engagement' as const,
  },
  capex_shock: {
    title: 'Capex Shock and Construction Disruption',
    description: 'High costs and disruption from infrastructure installation',
    solution: 'Retrofit solutions, gigabit over existing wiring, future-ready design',
    nepqStage: 'transition' as const,
  },
  code_risk: {
    title: 'Code and Inspection Risk',
    description: 'ERCES DAS and fire alarms that prevent failed inspections and delayed openings',
    solution: 'Code-compliant ERCES and fire alarm systems',
    nepqStage: 'transition' as const,
  },
  resident_expectations: {
    title: 'Resident Expectations',
    description: 'Millennials and Gen Z want smart features, strong Wi-Fi, EV charging, and self-service tools',
    solution: 'Della OS, smart building features, managed Wi-Fi',
    nepqStage: 'engagement' as const,
  },
  staff_overload: {
    title: 'Staff Overload',
    description: 'Manual work, tour scheduling, parcel management creating operational burden',
    solution: 'Smart building systems, self-guided tours, automation, 24/7 monitoring',
    nepqStage: 'engagement' as const,
  },
}

// ============================================
// GROOVE TALKING POINTS BY CONTEXT
// ============================================

export function getGrooveTalkingPoints(context: {
  industry?: GrooveIndustry
  projectStage?: ProjectStage
  painPoint?: keyof typeof GROOVE_PAIN_POINTS
}): string[] {
  const points: string[] = []

  if (context.industry === 'hospitality') {
    points.push(
      'AT&T Dealer of the Year',
      'Multiple DIRECTV lodging awards',
      'HBO Top Lodging Dealer',
      'Expertise with COM1000/2000/3000 platforms'
    )
  }

  if (context.projectStage === 'planning' || context.projectStage === 'design') {
    points.push(
      'Future-ready design prevents costly retrofits',
      'Code-compliant from day one',
      'One partner for entire technology stack'
    )
  }

  if (context.painPoint === 'vendor_sprawl') {
    points.push(
      'One partner, one throat to choke',
      'Eliminates vendor coordination headaches',
      'Single point of accountability'
    )
  }

  if (context.painPoint === 'code_risk') {
    points.push(
      'Many buildings fail occupancy due to missing ERCES',
      'Code-compliant ERCES and fire alarm systems',
      'Prevents delayed openings'
    )
  }

  return points
}

