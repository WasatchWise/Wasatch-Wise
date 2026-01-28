export interface UserProfileType {
  name: string; // Will serve as user's own pseudonym
  age: number;
  location: string;
  interests: string[];
}

export interface ProfileType {
  id: number;
  name: string; // This will be the pseudonym displayed
  age: number;
  location: string;
  compatibility: number;
  pixelationLevel: number; // 5 (heavily pixelated) down to 1 (fully clear)
  interests: string[];
  bio: string;
  image: string;
  aiFirstImpression?: string | null; // Stores AI-generated first impression
  isFetchingImpression?: boolean; // Tracks if AI impression is being fetched
}

export interface DatePlanBaseDetails {
  type: string;
  description: string;
  duration: string;
  cost: number;
  restaurant: string;
  activity: string;
  transportation: string;
  gift: string;
  totalTokens: number;
  match: number; // Compatibility percentage for the date idea itself
}

export interface DatePlanType extends DatePlanBaseDetails {
  id: number;
  customization?: string;
}

export interface ChatMessageType {
  sender: 'You' | 'system' | string; // string for partner's name
  text: string;
}

export interface CyrainoStateType {
  active: boolean;
  suggestion: string;
}

export type ViewType = 'discover' | 'matches' | 'chat' | 'tokens';

// Configuration for each pixelation level
export interface PixelationLevelDetail {
  blur: number; // px for CSS blur filter
  tokensToNext: number | null; // Cost to reach the next level (level - 1). Null if this is the clearest level.
  description: string; // Short description of what's visible
}

export interface PixelationConfig {
  [level: number]: PixelationLevelDetail;
}