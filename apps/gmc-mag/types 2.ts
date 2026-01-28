
export type ClaimType = 'risk' | 'market' | 'technical' | 'policy' | 'capability';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Claim {
  id: string;
  text: string;
  type: ClaimType;
  confidence: ConfidenceLevel;
  sourceRefs: string[];
  allowedSurfaces: ('hero' | 'body' | 'footnote')[];
}

export interface Lead {
  name: string;
  email: string;
  organization: string;
  role: string;
  interestType: 'investment' | 'offtake' | 'partnership' | 'media';
  message: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
