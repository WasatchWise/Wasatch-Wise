
import { Claim, FAQItem } from './types';

export const AUTHORITY_DATA = {
  china_magnesium_share: '90%',
  phase_one_capital: '$25M USD',
  phase_two_capital: '$300M USD',
  project_location: 'Timmins, Ontario',
  coordinates: { lat: 48.4758, lng: -81.3305 }, // Timmins area
  resource_size: '100 Million Tonnes',
  average_grade: '34% Magnesite',
  mine_life: '~100 Years',
  historical_investment: '>$9M USD',
  company_name: 'GMC',
};

export const TECHNICAL_SPECS = [
  { metric: "Ore Type", value: "Magnesite (MgCO₃)", detail: "Near-surface deposit" },
  { metric: "Recovery Rate", value: "92.4%", detail: "Optimized HydroMet flow" },
  { metric: "Energy Intensity", value: "8.2 kWh/kg", detail: "60% lower than Pidgeon" },
  { metric: "Talc Grade", value: "Industrial Alpha", detail: "Secondary revenue stream" },
  { metric: "CO₂ Footprint", value: "2.1 t/t Mg", detail: "Hydro-powered facility" },
  { metric: "Product Purity", value: "99.9% Mg", detail: "Aerospace-grade threshold" },
];

export const CLAIMS_LIBRARY: Claim[] = [
  {
    id: 'C-001',
    text: 'China currently controls approximately 90% of the primary magnesium market, while production in the US, Canada, and EU remains at zero.',
    type: 'risk',
    confidence: 'high',
    sourceRefs: ['USGS 2024 Mineral Commodity Summaries', 'AIA Whitepaper'],
    allowedSurfaces: ['hero', 'body'],
  },
  {
    id: 'C-002',
    text: 'GMC holds 100% control of the Whitney Township magnesite deposit, containing an NI 43-101 compliant resource of 100M tonnes at 34% MgCO₃.',
    type: 'capability',
    confidence: 'high',
    sourceRefs: ['NI 43-101 Mineral Resource Estimate', 'SGS Minerals Audit'],
    allowedSurfaces: ['body'],
  },
  {
    id: 'C-003',
    text: 'The deposit allows for continuous surface mining without explosives, significantly reducing operational costs and permitting complexity.',
    type: 'technical',
    confidence: 'medium',
    sourceRefs: ['GMC Field Trial Report 2023'],
    allowedSurfaces: ['body'],
  },
  {
    id: 'C-004',
    text: 'Phase I ($25M) focuses on de-risking via HydroMet validation and feasibility studies, while Phase II (~$300M) targets full commercial commissioning.',
    type: 'capability',
    confidence: 'high',
    sourceRefs: ['GMC Strategic Roadmap 2025'],
    allowedSurfaces: ['body'],
  },
  {
    id: 'C-005',
    text: 'The project includes recoverable industrial-grade talc, providing a potential early-stage revenue bridge prior to magnesium metal production.',
    type: 'capability',
    confidence: 'high',
    sourceRefs: ['SGS Metallurgy Reports', 'Metallurgical Bench Testing'],
    allowedSurfaces: ['body'],
  }
];

export const FAQ_DATA: FAQItem[] = [
  {
    question: "Is the proprietary HydroMet process proven at commercial scale?",
    answer: "The process has been validated at the bench and pilot levels. Phase I capital of $25M is specifically allocated for commercial-scale validation and a Definitive Feasibility Study (DFS) in partnership with SGS Minerals."
  },
  {
    question: "How does GMC compare to other North American magnesium initiatives?",
    answer: "GMC possesses the largest known high-purity magnesite resource in North America. Unlike greenfield projects, our location in Timmins, Ontario, provides immediate adjacency to Tier 1 infrastructure, including hydro, rail, and gas."
  }
];
