// =====================================================
// THE HELP LIST - TYPESCRIPT TYPES
// =====================================================
// Version: 1.0.0
// Privacy-First Architecture
// =====================================================

// Privacy levels enum
export enum PrivacyLevel {
  MAXIMUM = 'maximum',   // City level (10mi)
  HIGH = 'high',         // Neighborhood (2mi)
  MEDIUM = 'medium',     // Street corner (0.5mi)
  LOW = 'low',          // Exact address
}

// User roles
export enum UserRole {
  REQUESTER = 'requester',
  HELPER = 'helper',
  BOTH = 'both',
  SPONSOR = 'sponsor',
  ADMIN = 'admin',
}

// Request status from new schema
export enum RequestStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLAIMED = 'claimed',
  SHOPPING = 'shopping',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  // Legacy statuses for compatibility
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}


// Verification status
export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

// =====================================================
// USER TYPES
// =====================================================

export interface PrivacySettings {
  anonymous_mode: boolean;
  show_first_name: boolean;
  share_stories: boolean;
  allow_stats: boolean;
  location_privacy: PrivacyLevel;
  auto_delete_days: number;
}

export interface User {
  id: string;
  display_name: string; // Can be pseudonym
  avatar_seed?: string; // For generated avatars
  role: UserRole;
  verified_status: VerificationStatus;
  privacy_settings: PrivacySettings;
  location_privacy: PrivacyLevel;
  service_radius_meters?: number; // For helpers
  member_since_month?: string; // "2024-11" format
  total_requests_made: number;
  total_helps_given: number;
  created_at: Date;
  last_active_at: Date;
}

// Safe public user (what others see)
export interface PublicUser {
  display_name: string;
  avatar_seed?: string;
  role: UserRole;
  verified: boolean;
  general_area?: string; // Fuzzy location description
  member_duration?: string; // "2+ years", not exact date
  help_count?: string; // "50+", not exact
  rating?: number; // Average, no individual ratings
}

// =====================================================
// REQUEST TYPES
// =====================================================

export interface RequestItem {
  name: string;
  quantity: number;
  notes?: string;
  category?: string;
}

export interface BudgetRange {
  min: number;
  max: number;
}

export interface Request {
  id: string;
  
  // Requester info (anonymous)
  requester_id?: string;
  requester_display_name: string;
  
  // Request details
  items: RequestItem[];
  item_count: number;
  dietary_restrictions?: string[];
  budget_range?: BudgetRange;
  urgency_level: 'today' | 'tomorrow' | 'this_week' | 'flexible';
  
  // Location (graduated disclosure)
  delivery_privacy: PrivacyLevel;
  location_description?: string; // "North area", etc
  distance_meters?: number; // From helper
  
  // Status
  status: RequestStatus;
  
  // Helper info (if claimed)
  helper_id?: string;
  helper_display_name?: string;
  claimed_at?: Date;
  
  // Delivery tracking
  shopping_started_at?: Date;
  delivery_started_at?: Date;
  delivered_at?: Date;
  
  // Financial (privacy-preserved)
  estimated_cost?: number;
  actual_cost?: number;
  
  // Communication
  chat_room_id?: string;
  has_unread_messages?: boolean;
  
  // Lifecycle
  created_at: Date;
  expires_at: Date;
  auto_delete_at: Date;
  
  // Privacy
  share_story_consent: boolean;

  // Simple fields for legacy compatibility
  need?: string;
  city?: string;
  contactInfo?: string;
  contactMethod?: 'text' | 'email';
}

// Available request (what helpers see)
export interface AvailableRequest {
  id: string;
  requester_display_name: string;
  item_count: number;
  urgency_level: string;
  delivery_privacy: PrivacyLevel;
  distance_meters: number;
  location_description: string;
  created_at: Date;
  expires_at: Date;
  // Added for compatibility with existing components
  need: string;
  city: string;
}

// =====================================================
// MESSAGE TYPES
// =====================================================

export interface Message {
  id: string;
  request_id: string;
  sender_display_name: string;
  message_type: 'text' | 'system' | 'location_reveal';
  encrypted_content?: string; // Decrypted on client
  created_at: Date;
  read_at?: Date;
  expires_at: Date;
}

// Decrypted message for display
export interface DecryptedMessage extends Omit<Message, 'encrypted_content'> {
  content: string;
  is_expired: boolean;
}

// =====================================================
// VERIFICATION TYPES
// =====================================================

export interface HelperVerification {
  id: string;
  user_id: string;
  background_check_passed?: boolean;
  background_check_expires?: Date;
  references_verified: boolean;
  references_count: number;
  training_completed: string[]; // Module IDs
  onboarding_completed_at?: Date;
  verification_status: VerificationStatus;
  expires_at: Date;
}

// =====================================================
// ANALYTICS TYPES (Anonymized)
// =====================================================

export interface AggregatedAnalytics {
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: Date;
  period_end: Date;
  area_name: string;
  total_requests: number;
  total_deliveries: number;
  total_helpers_active: number;
  total_requesters_served: number;
  avg_response_time_hours: number;
  avg_delivery_time_hours: number;
  fulfillment_rate: number;
  top_requested_items?: Array<{ item: string; count: number }>;
}

// =====================================================
// CONSENT TYPES
// =====================================================

export interface PrivacyConsent {
  id: string;
  consent_type: 'terms' | 'privacy' | 'marketing' | 'stories';
  consent_version: string;
  granted: boolean;
  granted_at?: Date;
  revoked_at?: Date;
  expires_at?: Date;
}

// =====================================================
// SUCCESS STORY TYPES (Anonymized)
// =====================================================

export interface SuccessStory {
  id: string;
  title?: string;
  story: string;
  month_year: string; // "2024-11"
  general_area: string;
  helper_pseudonym: string;
  requester_pseudonym: string;
  hearts: number;
  published: boolean;
  expires_at: Date;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
    privacy_implication?: string;
  };
  meta?: {
    encryption_status: 'encrypted' | 'plain';
    data_retention: string;
    privacy_level: PrivacyLevel;
  };
}