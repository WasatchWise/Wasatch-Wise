
export interface Neurotransmitter {
  name: string;
  function: string;
  application: string;
  outcome: string;
  color: string;
}

export interface ResourceStat {
  category: string;
  tonnes: number;
  magnesiteGrade: number;
  talcGrade: number;
}

export interface ProcessComparison {
  feature: string;
  pidgeon: string;
  electrolytic: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
