
export enum AgentPersonaType {
  Cupid = "Cupid",
  Confidant = "Confidant",
  WingPerson = "Wing-Person",
  Matchmaker = "Matchmaker",
  Philosopher = "Philosopher",
  Adventurer = "Adventurer",
  Coach = "Coach", // Added for Cyr(ai)no's evolved role
}

export enum RelationshipGoal {
  LongTerm = "Long-term",
  Casual = "Casual",
  Friendship = "Friendship",
  Exploring = "Exploring",
  Networking = "Networking",
}

export interface CommunicationTone {
  warmth: number; // 0-100
  humor: number;  // 0-100
  directness: number; // 0-100
}

// Removed JournalEntry interface

export interface DAgentProfile {
  id: string;
  userId?: string; 
  agentName: string;
  agentPersonaType: AgentPersonaType;
  personaBackstory: string; 
  communicationTone: CommunicationTone; 
  coreValues: string[]; 
  hobbiesInterests: string[];
  relationshipGoal: RelationshipGoal;
  dealbreakers: string[];
  profileImage?: string;
  compatibilityScore?: number;
  // Removed journalEntries field
}

export interface AgentInteraction {
  interactingAgents: { userAgent: DAgentProfile; otherAgent: DAgentProfile };
  transcript: string; 
  summary: string;    
  matchPotential: number; 
  matchDecision: "YES" | "NO"; 
  error?: string; 
  blindDatePitch?: string; 
}

export interface DateIdea {
  activity: string;
  description: string;
  budget: string; 
  quirkFactor: string; 
  vibe: string; 
  // Renamed from conversationStarters to emphasize coaching aspect
  cyranoConvoCatalysts: string[]; 
  suggestedTimeSlots: string[]; 
}

export enum DateStatus {
    IDEAS_GENERATED = 'ideas_generated',
    IDEA_SELECTED = 'idea_selected',
    TIME_SLOT_SUGGESTED = 'time_slot_suggested',
    TIME_SLOT_CONFIRMED = 'time_slot_confirmed',
    BOOKED_BY_CYRANO = 'booked_by_cyrano',
    DATE_COMPLETED_PENDING_REFLECTION = 'date_completed_pending_reflection',
    REFLECTION_SUBMITTED = 'reflection_submitted',
}

export interface PlannedDateDetails {
  selectedDateIdea: DateIdea;
  status: DateStatus;
  selectedTimeSlot: string | null;
  calendarStatus: 'pending_check' | 'checking' | 'virtual_all_clear' | 'failed_to_clear';
  transportationStatus: 'pending' | 'arranging' | 'virtually_sorted';
  isBlindDate?: boolean; 
  reflectionNotes?: string;
  reflectionTags?: string[];
  reflectionGivenAt?: string; 
}

export type FirstContactMode = 'text' | 'video' | 'in_person' | 'blind_date';
export type FirstContactStatus = 'pending_choice' | 'initiated' | 'awaiting_date_plan' | 'completed' | 'declined';


export interface FirstContactDetails {
  mode: FirstContactMode | null;
  status: FirstContactStatus;
  initiatedAt?: string; 
}

export interface MatchRecord {
  id: string; 
  agentOne: DAgentProfile;
  agentTwo: DAgentProfile;
  interactionDetails: AgentInteraction;
  matchedAt: string; 
  firstContact: FirstContactDetails; 
  plannedDateDetails?: PlannedDateDetails | null;
}

export interface ReflectionData {
    notes: string;
    tags: string[];
}

export interface VisualPreferencePhoto {
  id: string;
  url: string;
  alt: string;
}

export interface VisualPreferenceResponse {
  photoId: string;
  wouldTalk: boolean | null;
  emotionallySafe: boolean | null;
  vibeNotes: string;
}

// For responses from chatWithAgentAndExtractProfile
export interface ProfileChatResponse {
  chatResponse: string;
  profileUpdate: Partial<DAgentProfile> | null;
  // Removed journalPromptSuggestion
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  agentProfile?: Partial<DAgentProfile>; 
  isCoachingMessage?: boolean; // To style coaching messages differently if needed
}