import { ResourceStat, ProcessComparison } from './types';

export const GMC_RESOURCES: ResourceStat[] = [
  {
    category: 'Measured & Indicated',
    tonnes: 54076357,
    magnesiteGrade: 34.44,
    talcGrade: 47.40
  },
  {
    category: 'Inferred',
    tonnes: 43000000,
    magnesiteGrade: 34.00,
    talcGrade: 47.00
  }
];

export const MAGNESIUM_IMPORTANCE = {
  properties: [
    {
      title: "Lightest Structural Metal",
      stat: "1.74 g/cm³",
      description: "Magnesium is 33% lighter than aluminum and 75% lighter than steel, making it the lightest structural metal available for engineering applications."
    },
    {
      title: "Excellent Strength-to-Weight",
      stat: "158 kN·m/kg*",
      description: "Superior specific strength enables dramatic weight reduction in vehicles and aircraft without compromising structural integrity."
    },
    {
      title: "High Damping Capacity",
      stat: "10x Aluminum",
      description: "Absorbs vibration and noise far better than other metals, critical for defense and aerospace applications."
    },
    {
      title: "Good Electrical Conductivity",
      stat: "38.6% IACS**",
      description: "While not as conductive as copper, magnesium provides excellent EMI shielding and grounding in electronics and EV battery housings."
    }
  ],
  applications: [
    {
      sector: "Aerospace & Defense",
      icon: "✈️",
      examples: [
        { item: "F-35 Lightning II", amount: "900+ lbs", note: "per aircraft in structural components" },
        { item: "Helicopter Transmissions", amount: "Critical", note: "weight-sensitive rotorcraft systems" },
        { item: "Missile Components", amount: "Essential", note: "guidance systems and airframes" },
        { item: "Military Vehicle Armor", amount: "Growing", note: "lightweight ballistic protection" }
      ]
    },
    {
      sector: "Electric Vehicles",
      icon: "🔋",
      examples: [
        { item: "Battery Enclosures", amount: "20-40 kg", note: "per vehicle, replacing steel/aluminum" },
        { item: "Structural Die Castings", amount: "15-25 kg", note: "seat frames, instrument panels" },
        { item: "Powertrain Components", amount: "10-15 kg", note: "motor housings, inverters" },
        { item: "Next-Gen Solid State", amount: "Future", note: "magnesium-ion battery research" }
      ]
    },
    {
      sector: "Automotive",
      icon: "🚗",
      examples: [
        { item: "Steering Columns", amount: "Standard", note: "in most modern vehicles" },
        { item: "Dashboard Structures", amount: "5-8 kg", note: "instrument panel beams" },
        { item: "Transfer Cases", amount: "Growing", note: "4WD/AWD drivetrain components" },
        { item: "Wheel Rims", amount: "Premium", note: "performance and luxury vehicles" }
      ]
    },
    {
      sector: "Electronics",
      icon: "💻",
      examples: [
        { item: "Laptop Chassis", amount: "Common", note: "MacBook, ThinkPad frames" },
        { item: "Smartphone Frames", amount: "Growing", note: "structural rigidity at low weight" },
        { item: "Camera Bodies", amount: "Standard", note: "professional DSLR/mirrorless" },
        { item: "EMI Shielding", amount: "Critical", note: "5G infrastructure components" }
      ]
    }
  ],
  marketDemand: [
    { year: "2024", demandMT: 1200000, note: "Current global demand" },
    { year: "2027", demandMT: 1450000, note: "EV acceleration" },
    { year: "2030", demandMT: 1800000, note: "Defense reshoring" },
    { year: "2035", demandMT: 2400000, note: "Full electrification" }
  ],
  criticalFacts: [
    "Every 10% reduction in vehicle weight improves fuel efficiency by 6-8%",
    "The average EV requires 30-50% more magnesium than a comparable Internal Combustion Engine vehicle",
    "U.S. magnesium consumption is approximately 100,000 tons annually",
    "Zero primary magnesium production in North America since 2001",
    "China controls 90% of global magnesium production capacity",
    "Magnesium is on every critical minerals list: US, EU, Canada, Australia"
  ]
};

export const TECHNICAL_SPECS = {
  deposit: "Whitney Township Magnesite Deposit",
  location: "Timmins, Ontario, Canada",
  resourceSize: "100 million tons",
  averageGrade: "34% magnesite",
  mineLife: "Approximately 100 years at 1 million tons per year",
  control: "100% control through long-term leases from Government of Ontario",
  investment: "Over $9 million USD invested in exploration, engineering and development",
  compliance: "NI 43-101 compliant, ready for development",
  mineralization: ["Magnesite (MgCO₃)", "Industrial-grade Talc"],
  mining_method: "Continuous Surface Mining (Wirtgen Surface Miner - No Blasting, No Drilling)",
  process_type: "Hydrometallurgical Process (Dr. Anatoly Agulyansky)",
  byproducts: "Industrial Grade Talc (immediate revenue from sales to manufacturers)",
  infrastructure: ["Direct Rail and Highway Access", "Hydro One Grid (High Voltage Power)", "Natural Gas Available", "Ample Water Supply", "Nearby Idle Processing Plant Available", "Permitted Brownfield Sites for Tailings"],
  fieldTrial: {
    tons: "45,000 tons",
    cost: "$12 USD per ton",
    result: "Confirmed beneficiation to 90% magnesite concentrate"
  }
};

export const TIMMINS_LOCATION = {
  coordinates: "48.4758° N, 81.3303° W",
  province: "Ontario, Canada",
  distances: [
    { city: "Toronto", km: 695, hours: "7.5 hr drive" },
    { city: "Detroit", km: 850, hours: "Rail accessible" },
    { city: "Chicago", km: 1200, hours: "Rail accessible" },
    { city: "Montreal", km: 820, hours: "Rail accessible" },
    { city: "New York", km: 1100, hours: "Great Lakes shipping" }
  ],
  advantages: [
    "Established mining district with 100+ years of operations",
    "Skilled labor pool experienced in mineral extraction",
    "Direct rail connections to major industrial centers",
    "Ontario clean energy grid (94% zero-carbon)",
    "Pro-mining provincial government",
    "Existing permitting frameworks for mineral projects"
  ]
};

export const PHASE_MILESTONES = [
  {
    phase: "Phase One",
    capital: "$25M USD",
    duration: "12-18 Months",
    objectives: [
      "Complete feasibility studies",
      "Detailed engineering studies",
      "Environmental studies",
      "Validate the hydrometallurgical process",
      "Prepare necessary permit applications",
      "Further hydrometallurgical testing using actual Whitney ore",
      "Optimization of leaching parameters",
      "Analysis of impurities",
      "Refinement of purification steps",
      "Develop full mass-balance and cost models"
    ]
  },
  {
    phase: "Phase Two",
    capital: "~$300M USD",
    duration: "24-30 Months",
    objectives: [
      "Construct and equip the hydrometallurgical processing facility",
      "Related systems for managing tailings and wastewater",
      "Power and logistics connections",
      "Ramp up to commercial production",
      "Working capital through commercial production of talc, magnesium compounds, and magnesium metal",
      "Talc sales generate cash flow before full magnesium production begins"
    ]
  }
];

export const STRATEGIC_NEWS = [
  {
    id: 1,
    tag: "GEOPOLITICAL",
    title: "China Announcement No. 61: New Export Restrictions on Critical Minerals",
    summary: "Beijing tightens control over dual-use metals, specifically targeting aerospace manufacturers with foreign military ties.",
    impact: "High Risk / Supply Disruption",
    date: "December 2024"
  },
  {
    id: 2,
    tag: "ENERGY",
    title: "Shaanxi Province Implements 2025 Energy Mandates",
    summary: "Coal-fired Pidgeon process plants face immediate 30% production cuts to meet provincial carbon targets.",
    impact: "Market Volatility / Price Spike",
    date: "November 2024"
  },
  {
    id: 3,
    tag: "POLICY",
    title: "US Defense Production Act: Title III Funding Expanded",
    summary: "New incentives for domestic critical mineral production aimed at reducing 50%+ net import reliance.",
    impact: "Strategic Opportunity",
    date: "October 2024"
  },
  {
    id: 4,
    tag: "TRADE",
    title: "EU Critical Raw Materials Act Takes Effect",
    summary: "European Union mandates 10% domestic production and 40% processing capacity for strategic materials by 2030.",
    impact: "Export Market Opening",
    date: "September 2024"
  }
];

export const STRATEGIC_PILLARS = [
  {
    title: 'Geopolitical Resilience',
    description: 'De-risking the NATO defense supply chain by establishing a high-capacity primary production hub in a Tier-1 jurisdiction.',
    meta: 'Sovereignty'
  },
  {
    title: 'Asset Scale',
    description: 'The Whitney project hosts a 100-million-ton resource, offering over a century of production potential in the heart of Ontario.',
    meta: '100+ Years'
  },
  {
    title: 'Carbon Efficiency',
    description: "Leveraging Ontario's clean energy grid and proprietary electrolytic extraction to reduce CO2 emissions by over 90% vs traditional methods.",
    meta: 'Low-Carbon'
  },
  {
    title: 'Execution Discipline',
    description: 'A phased development strategy beginning with a $25M Phase One activation focused on infrastructure and initial offtake.',
    meta: 'Capital Efficient'
  }
];

export const PROCESS_COMPARISON: ProcessComparison[] = [
  { feature: 'Energy Source', pidgeon: 'Coal / Coke (Highly Polluting, Coal Intensive)', electrolytic: 'No Coal-Based Reduction (Clean Grid)' },
  { feature: 'CO2 Footprint', pidgeon: 'High Carbon Emissions (21-27 tons CO2 per ton Mg)', electrolytic: 'Significantly Lower Emissions (< 2 tons CO2 per ton Mg)' },
  { feature: 'Purity Level', pidgeon: 'Lower Product Purity with Lower Efficiency', electrolytic: 'Significantly Greater Product Quantities and Purity' },
  { feature: 'Supply Security', pidgeon: 'High-Risk / Foreign (90% China Control)', electrolytic: 'Domestic / Secure (U.S. and Canada)' },
  { feature: 'Environmental Standards', pidgeon: 'Faces Increasing Environmental Restrictions', electrolytic: 'Complies with U.S. and Canadian Environmental Standards' },
  { feature: 'Scalability', pidgeon: 'Limited by Environmental Constraints', electrolytic: 'Fully Scalable for Commercial Production' }
];

export const COMPLIANCE_DISCLAIMER = `This presentation contains forward-looking statements regarding the potential development, operation, and future performance of General Magnesium Corporation and the Whitney Deposit. All mineral resource disclosure has been prepared in accordance with Canada's National Instrument 43-101 ("NI 43-101"), meaning it meets Canada's regulator-enforced standard for mineral project disclosure, widely relied upon in global mining capital markets. Readers are cautioned not to place undue reliance on forward-looking statements. The technical information supporting this presentation is contained in GMC's NI 43-101 technical report.`;

export const JPMC_CONNECTION = {
  title: "Strategic Market Alignment",
  content: "GMC's magnesium production directly serves downstream demand from Arconic Corporation, a portfolio company of Apollo Global Management. Key supplier to Arconic Corporation (A portfolio company of Apollo Global Management).",
  logos: ["Arconic", "Apollo Global Management"]
};

export const HYDROMETALLURGICAL_PROCESS = {
  developer: "Dr. Anatoly Agulyansky (Internationally renowned chemist and metallurgist)",
  partner: "SGS Minerals (Global leader in metallurgical testing)",
  status: "Each step validated at bench scale, pilot scale testing now underway",
  steps: [
    {
      step: 1,
      name: "Talc Separation",
      description: "Isolate and remove industrial grade talc to be sold separately, leaving behind 95% pure magnesium carbonate"
    },
    {
      step: 2,
      name: "Calcination",
      description: "Convert the 95% pure magnesium carbonate to magnesium oxide, which contains about 60% magnesium"
    },
    {
      step: 3,
      name: "Acid Digestion",
      description: "Digest the magnesium oxide in hydrochloric acid"
    },
    {
      step: 4,
      name: "Filtration",
      description: "Filter out insoluble materials"
    },
    {
      step: 5,
      name: "Liquid Extraction",
      description: "Use fatty alcohols to produce pure magnesium"
    },
    {
      step: 6,
      name: "Reduction",
      description: "Use electrolysis to produce the final magnesium metal"
    }
  ],
  phaseOneTesting: [
    "Further hydrometallurgical testing using actual Whitney ore",
    "Optimization of leaching parameters",
    "Analysis of impurities",
    "Refinement of purification steps",
    "Develop full mass-balance and cost models",
    "Rigorous institutional-grade engineering and testing"
  ]
};

export const SUPPLY_CHAIN_STAGES = [
  {
    stage: 1,
    name: "Primary Production",
    description: "The conversion of magnesite ore into magnesium metal. Today, more than 90% of this conversion takes place in China, using the highly polluting, coal intensive Pidgeon process.",
    gmcRole: "GMC enters at Stage One, the foundation of the entire value chain."
  },
  {
    stage: 2,
    name: "Alloying",
    description: "Magnesium is combined with other metals like aluminum, zinc, and rare earths to create specialized alloys designed for lightweight strength, durability and performance."
  },
  {
    stage: 3,
    name: "Fabrication and End Use",
    description: "Die casting companies and manufacturers produce finished component parts for automotive manufacturers like GM, Ford, and BMW, aerospace giants like Boeing and Airbus, and defense contractors like General Dynamics and Lockheed Martin."
  }
];

export const OWNERSHIP_SECURITY = {
  shareholders: "U.S. and Canadian shareholders",
  chineseOwnership: "No Chinese ownership, control, or influence at any level",
  maxOwnership: "No single shareholder owns more than twenty-five percent of the company",
  compliance: [
    "Full compliance with Know-Your-Customer (KYC) requirements",
    "Full compliance with Anti-Money-Laundering (AML) requirements",
    "Ownership structure supports compliance with national security, foreign investment, and supply chain integrity requirements",
    "Available, auditable shareholder registry confirming no Chinese ownership, control, or influence at any level"
  ],
  domesticStatus: "Under the U.S. Canada critical minerals framework, GMC's Whitney Deposit qualifies as a domestic source. That domestic status is critical for defense procurement, government financing, and supply chain compliance.",
  eligibility: [
    "U.S. Defense Production Act, Title III",
    "U.S. Department of Energy, Title 17",
    "Canada's Strategic Minerals Initiative",
    "U.S. Export-Import Bank"
  ]
};

export const CONTACT_INFO = {
  name: "Jordi Ventura",
  title: "Strategic Advisor and Special Counsel",
  phone: "(801) 201-7621",
  email: "jventura@generalmagnesiumcorp.com"
};

export const REPORT_SUMMARY = `
General Magnesium Corporation (GMC) - Strategic Briefing 2025

ASSET: Whitney Talc-Magnesite Project, Timmins, Ontario, Canada
RESOURCE: 100M tons @ 34% magnesite (NI 43-101 compliant)
TECHNOLOGY: HydroMet Process (Zero-Coal, 90%+ CO2 reduction)
MARKET CONTEXT: 90% Chinese dominance, zero North American primary production

INVESTMENT STRUCTURE:
- Phase I ($25M): De-risking, feasibility study, pilot validation
- Phase II ($300M): Full construction, commercial production
- Phase III ($150M): Capacity expansion, alloy development

KEY VALUE DRIVERS:
- Talc co-product revenue provides early cash flow
- Ontario clean grid enables ESG-compliant production
- Defense and aerospace demand growing 8-12% annually
- EV lightweighting driving structural demand increase

STRATEGIC APPLICATIONS:
- F-35 Lightning II: 900+ lbs magnesium per aircraft
- Electric Vehicles: 30-50% more Mg than Internal Combustion Engine vehicles
- Battery Enclosures: Replacing aluminum for weight savings
- Defense Systems: Missiles, armor, helicopter components

COMPETITIVE ADVANTAGE:
- First primary North American producer in 25 years
- 99.95%+ purity (aerospace specification)
- <2 tons CO2 per ton Mg (vs 21-27 for Pidgeon process)
- Stable jurisdiction with pro-mining policies
`;
