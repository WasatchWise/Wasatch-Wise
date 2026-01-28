/**
 * SLCTrips Database TypeScript Definitions
 * Last updated: October 29, 2025 - Architecture Cleanup
 *
 * Database: mkepcjzqnbowrgbvjfem.supabase.co
 * Tables: 49 | Records: ~1,971
 *
 * Recent Changes:
 * - Added TypeScript interfaces for all JSONB fields (PhotoGallery, Activity, ContactInfo, etc.)
 * - Marked deprecated fields for removal in upcoming migration
 * - Improved type safety by replacing `any` types with proper interfaces
 * - Added new `themes` field for flexible classification
 *
 * Migration Status: Awaiting manual execution of 20251029_database_architecture_cleanup.sql
 */

// ============================================================================
// ENUMS
// ============================================================================

export type DriveTimeCategory = '30min' | '90min' | '3h' | '5h' | '8h' | '12h';

export type DestinationStatus = 'active' | 'draft' | 'archived';

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

export type AccessLevel = 'open' | 'permit' | 'fee' | 'guided_only' | 'private' | 'closed';

export type RiskFlag =
  | 'flash_flood'
  | 'cold_shock'
  | 'current'
  | 'cliff_jump'
  | 'altitude'
  | 'ice'
  | 'unstable_structure'
  | 'mine_shaft'
  | 'private_land'
  | 'trespassing'
  | 'none';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export type WaterType =
  | 'hot_spring'
  | 'waterfall_pool'
  | 'river_swim'
  | 'lake_cove'
  | 'reservoir_beach'
  | 'creek_hole'
  | 'mineral_pool'
  | 'swimming_hole';

export type MorbidType =
  | 'murder'
  | 'massacre'
  | 'execution'
  | 'disaster'
  | 'haunted'
  | 'prison'
  | 'battlefield'
  | 'accident'
  | 'serial_killer'
  | 'unsolved';

export type FilmType = 'movie' | 'tv_series' | 'documentary' | 'reality_tv' | 'commercial';

export type MysteryType =
  | 'paranormal'
  | 'cryptid'
  | 'ufo'
  | 'haunted'
  | 'unexplained'
  | 'conspiracy'
  | 'legend'
  | 'folklore';

export type BeatKind =
  | 'greeting'
  | 'safety'
  | 'lore'
  | 'conservation'
  | 'seasonal'
  | 'photo_hint'
  | 'observation'
  | 'balance'
  | 'mentor'
  | 'challenge';

export type TripKitCollectionType = 'free' | 'paid' | 'seasonal' | 'freemium';

export type TripKitTier = 'free' | 'basic' | 'plus' | 'premium';

export type TripKitStatus = 'draft' | 'active' | 'freemium' | 'archived';

export type StayKitStatus = 'draft' | 'active' | 'freemium' | 'archived';

export type StayKitTaskType = 'visit' | 'experience' | 'learn' | 'photo' | 'explore' | 'connect';

// ============================================================================
// AFFILIATE TYPES
// ============================================================================

export interface GearRecommendation {
  name: string;
  price: string;
  amazon: string; // ASIN
  category: string;
}

export interface HotelRecommendation {
  name: string;
  type: string;
  price: string;
  booking: string; // Partner code
}

export interface TourRecommendation {
  name: string;
  price: string;
  provider: 'GetYourGuide' | 'Viator';
  gyg?: string; // GetYourGuide ID
  viator?: string; // Viator ID
}

// ============================================================================
// JSONB FIELD INTERFACES
// ============================================================================

export interface PhotoGalleryItem {
  url: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
  is_featured?: boolean;
  source?: 'google_places' | 'unsplash' | 'user_submitted' | 'manual';
}

export interface PhotoGallery {
  photos: PhotoGalleryItem[];
  cover_photo?: string;
  last_updated?: string;
}

export interface Activity {
  name: string;
  duration_minutes?: number;
  difficulty?: 'easy' | 'moderate' | 'hard' | 'extreme';
  season_best?: Season[];
  required_equipment?: string[];
  description?: string;
}

export interface NearbyRecommendation {
  name: string;
  place_id?: string;
  distance_miles?: number;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  types?: string[];
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  hours?: string[] | Record<string, string>;
  best_contact_method?: 'phone' | 'email' | 'website';
}

export interface SocialMediaUrls {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface LearningObjective {
  grade_level?: string;
  subject?: string;
  objective: string;
  utah_core_standard?: string;
  activity_suggestion?: string;
}

export interface FieldTripStop {
  stop_number: number;
  name: string;
  description: string;
  duration_minutes: number;
  learning_focus?: string;
  safety_notes?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface HistoricalTimelineEvent {
  year: number;
  date?: string;
  event: string;
  description?: string;
  source?: string;
  significance?: 'low' | 'medium' | 'high';
}

export interface EventDate {
  name: string;
  start_date: string;
  end_date?: string;
  description?: string;
  recurring?: boolean;
  url?: string;
}

export interface AffiliateLinks {
  amazon?: Record<string, string>; // product_name -> ASIN
  booking_com?: string; // affiliate link
  viator?: string; // affiliate link
  get_your_guide?: string; // affiliate link
  rei?: string; // affiliate link
  [key: string]: any; // Allow custom affiliate partners
}

// ============================================================================
// MAIN TABLES
// ============================================================================

export interface Destination {
  // Core Identity
  id: string; // UUID
  name: string;
  slug: string;

  // Location
  latitude: number;
  longitude: number;
  county: string;
  region: string;
  state_code: string;
  category: DriveTimeCategory;
  subcategory: string;

  // Content
  description: string | null;
  image_url: string | null;
  photo_gallery: PhotoGallery | null;
  video_url: string | null;

  // AI-Generated Content
  ai_summary: string | null;
  ai_tips: string[] | null; // Array of tip strings
  ai_story: string | null;

  // Metadata
  place_id: string; // Google Places ID
  address_full: string | null;
  what3words: string | null;

  // Status & Quality
  status: DestinationStatus;
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  data_quality_score: number; // 0-100
  last_verified_at: string | null;
  last_synced: string | null;

  // Source Attribution
  source_url: string | null;
  source_name: string | null;
  source_type: string | null;
  source_notes: string | null;

  // Features & Flags
  featured: boolean;
  trending: boolean;
  verified: boolean; // DEPRECATED: Use is_verified instead (will be removed in migration)
  user_submitted: boolean;
  is_educational: boolean;
  is_county: boolean;

  // Relationships
  tripkit_id: string | null; // DEPRECATED: Use tripkit_destinations junction table (will be removed in migration)
  guardian: string | null; // DEPRECATED: Compute from county (will be removed in migration)
  character_ids: string[] | null; // DEPRECATED: (will be removed in migration)

  // Rich Data
  activities: Activity[] | null;
  badges: any | null; // DEPRECATED: (will be removed in migration)
  digital_collectibles: any | null; // DEPRECATED: (will be removed in migration)
  themes?: string[]; // NEW: Flexible theme tags (water, morbid, film, mystery, spiritual, etc.)

  // Nearby Recommendations
  nearby_food: NearbyRecommendation[];
  nearby_lodging: NearbyRecommendation[];
  nearby_attractions: NearbyRecommendation[];

  // Affiliate Recommendations
  gear_recommendations: GearRecommendation[]; // DEPRECATED: Use destination_affiliate_gear table (will be removed in migration)
  hotel_recommendations: HotelRecommendation[];
  tour_recommendations: TourRecommendation[];
  recommended_gear: any[]; // DEPRECATED: Use destination_affiliate_gear table (will be removed in migration)
  affiliate_links: AffiliateLinks;

  // Analytics & Engagement
  popularity_score: number | null;
  weather_info: any | null; // DEPRECATED: Use external API (will be removed in migration)
  sustainability_rating: number | null;
  accessibility_rating: number | null;

  // Educational
  learning_objectives: LearningObjective[] | null;
  field_trip_stops: FieldTripStop[] | null;
  historical_timeline: HistoricalTimelineEvent[] | null;

  // AR/VR
  ar_anchor_id: string | null; // DEPRECATED: (will be removed in migration)
  ar_content_url: string | null; // DEPRECATED: (will be removed in migration)

  // UGC
  trip_history: any | null; // DEPRECATED: Move to user_trips table (will be removed in migration)
  ugc_submissions: any | null; // DEPRECATED: Move to destination_ugc table (will be removed in migration)

  // Contact & Social
  contact_info: ContactInfo | null;
  social_media_urls: SocialMediaUrls | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  updated_with_recommendations: string;
  event_dates: EventDate[] | null;
}

export interface TripKit {
  // Core Identity
  id: string; // UUID
  name: string;
  slug: string;
  code: string; // 'TK-001', 'TKE-004', etc.

  // Marketing
  tagline: string;
  description: string;
  value_proposition: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];

  // Classification
  collection_type: TripKitCollectionType;
  primary_theme: string;
  tier: TripKitTier;
  states_covered: string[];

  // Pricing (Stripe)
  price: number;
  founder_price: number;
  regular_price: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_in_flash_sale: boolean;
  founder_sold: number;
  founder_limit: number | null;

  // Content
  destination_count: number;
  estimated_time: string | null;
  difficulty_level: string | null;
  features: string[];
  includes: any | null;
  resources: any[] | null; // Array of resource objects (guides, gear, etc.)

  // Media
  cover_image_url: string;
  preview_images: any | null;
  video_url: string | null;

  // Audience
  target_audience: string[];
  learning_objectives: string[] | null;
  curriculum_alignment: { subject: string; grade_level: string; standard: string } | null;

  // Status & Analytics
  status: TripKitStatus;
  featured: boolean;
  download_count: number;
  view_count: number;
  average_rating: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// ============================================================================
// STAYKIT TABLES
// ============================================================================

export interface StayKit {
  // Core Identity
  id: string; // UUID
  name: string;
  slug: string;
  code: string; // 'SK-001', 'SK-002', etc.
  product_key: string; // 'staykit:sk-001'

  // Marketing
  tagline: string | null;
  description: string | null;
  value_proposition: string | null;
  meta_title: string | null;
  meta_description: string | null;

  // Content Stats
  day_count: number; // Total days (e.g., 90)
  milestone_day_count: number | null; // Number of milestone days with content
  task_count: number | null;
  tip_count: number | null;
  destination_count: number | null;

  // Pricing
  price: number;
  regular_price: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;

  // Media
  cover_image_url: string | null;
  preview_images: any | null;

  // Status & Analytics
  status: StayKitStatus;
  featured: boolean;
  purchase_count: number | null;
  view_count: number | null;
  average_rating: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface StayKitVersion {
  // Core Identity
  id: string; // UUID
  staykit_id: string; // UUID FK
  version_number: number;

  // Metadata
  change_summary: string | null;
  is_active: boolean;

  // Timestamps
  created_at: string;
  created_by: string | null; // UUID FK to auth.users
}

export interface StayKitDay {
  // Core Identity
  id: string; // UUID
  staykit_id: string; // UUID FK
  version_id: string | null; // UUID FK

  // Day Info
  day_number: number; // 1, 5, 10, 15, etc.
  title: string;
  description: string | null;
  estimated_duration_hours: number | null;

  // Metadata
  theme: string | null;
  difficulty_level: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface StayKitTask {
  // Core Identity
  id: string; // UUID
  day_id: string; // UUID FK
  task_order: number;

  // Task Info
  title: string;
  description: string | null;
  duration_minutes: number | null;
  task_type: StayKitTaskType;
  is_optional: boolean;

  // Location (optional)
  destination_id: string | null; // UUID FK to destinations
  address: string | null;
  place_id: string | null; // Google Places ID
  latitude: number | null;
  longitude: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface StayKitTip {
  // Core Identity
  id: string; // UUID
  task_id: string; // UUID FK
  tip_order: number;

  // Tip Content
  tip_text: string;
  category: string | null; // 'insider', 'practical', 'seasonal', 'budget', etc.

  // Timestamps
  created_at: string;
}

export interface UserStayKitProgress {
  // Core Identity
  id: string; // UUID
  user_id: string; // UUID FK to auth.users
  staykit_id: string; // UUID FK

  // Progress Tracking
  access_granted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  current_day_number: number | null;
  progress_percentage: number | null;

  // Stats
  tasks_completed: number | null;
  total_tasks: number | null;
  days_active: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface UserTaskCompletion {
  // Core Identity
  id: string; // UUID
  user_id: string; // UUID FK to auth.users
  task_id: string; // UUID FK

  // Completion Info
  completed_at: string;
  notes: string | null;
  photo_url: string | null;

  // Timestamps
  created_at: string;
}

export interface Guardian {
  // Core Identity
  id: string; // UUID
  codename: string; // UNIQUE
  display_name: string;
  county: string | null;

  // Character Design
  element: string;
  motto: string;
  bio: string;
  colorway: string; // CSV of hex colors
  themes: string[];

  // Voice Characteristics (1-5 scale)
  voice_formality: number; // 1=casual, 5=formal
  voice_humor: number; // 1=serious, 5=comedic
  voice_mysticism: number; // 1=practical, 5=mystical
  voice_brevity: number; // 1=verbose, 5=brief

  // Assets
  image_url: string;
  image_url_transparent: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface WaterDestination {
  // Core Identity
  id: string; // UUID
  name: string;
  slug: string | null;
  state: string;
  county: string;

  // Water-Specific
  water_type: WaterType;
  water_temp_c_min: number | null;
  water_temp_c_max: number | null;
  pool_depth_m_max: number | null;

  // Content
  summary: string | null;
  description: string | null;

  // Location
  lat: number | null;
  lon: number | null;
  drive_time_min_from_slc: number | null;

  // Seasonal
  best_seasons: Season[] | null;

  // Safety & Access
  access: AccessLevel;
  risk_flags: RiskFlag[];

  // Relationships
  character_ids: string[];

  // Status & Media
  status: ContentStatus;
  featured: boolean;
  image_url: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface MorbidDestination {
  // Core Identity
  id: string; // UUID
  name: string;
  slug: string;
  state: string;
  county: string;

  // Morbid-Specific
  morbid_type: MorbidType;
  incident_date: string | null; // date
  victim_count: number | null;
  perpetrator: string | null;
  case_status: string | null;

  // Content
  summary: string | null;
  description: string;

  // Location
  lat: number;
  lon: number;
  drive_time_min_from_slc: number;

  // Safety & Ethics
  access: AccessLevel;
  risk_flags: RiskFlag[];
  sensitivity_warning: boolean;

  // Relationships
  character_ids: string[];

  // Status & Media
  status: ContentStatus;
  featured: boolean;
  image_url: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface FilmDestination {
  // Core Identity
  id: string; // UUID
  name: string; // Film title
  slug: string;
  state: string;
  county: string;

  // Film-Specific
  film_type: FilmType;
  release_year: number;
  location_name: string; // Specific filming location
  scenes_filmed: string | null;
  genre: string;

  // Content
  summary: string | null;
  description: string;

  // Location
  lat: number | null;
  lon: number | null;
  drive_time_min_from_slc: number | null;

  // Safety & Access
  access: AccessLevel;
  risk_flags: RiskFlag[];

  // Relationships
  character_ids: string[] | null;

  // Status & Media
  status: ContentStatus;
  featured: boolean;
  image_url: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface MysteryDestination {
  // Core Identity
  id: string; // UUID
  name: string;
  slug: string;
  state: string;
  county: string;

  // Mystery-Specific
  mystery_type: MysteryType;
  first_report: string | null; // date
  investigation_level: number | null; // 1-5 scale
  evidence_level: number | null; // 1-5 scale

  // Content
  summary: string | null;
  description: string;

  // Location
  lat: number | null;
  lon: number | null;
  drive_time_min_from_slc: number | null;

  // Safety & Access
  access: AccessLevel;
  risk_flags: RiskFlag[];

  // Relationships
  character_ids: string[];

  // Status & Media
  status: ContentStatus;
  featured: boolean;
  image_url: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface DestinationAffiliateGear {
  // Core Identity
  id: number; // Serial
  destination_id: string; // UUID FK

  // Product Info
  product_name: string;
  product_description: string;
  brand: string;
  category: string;

  // Pricing
  price: number;
  price_range: string | null;

  // Links & IDs
  affiliate_link: string;
  image_url: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;

  // Display
  display_order: number;
  active: boolean;
  featured: boolean;
  tags: string[];

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface GuardianBeat {
  // Core Identity
  id: string; // UUID
  guardian_id: string; // UUID FK

  // Polymorphic Destination Reference
  destination_id: string; // UUID
  destination_type: 'water' | 'morbid' | 'film' | 'mystery' | 'destination';

  // Narrative Content
  beat_kind: BeatKind;
  script: string; // Guardian dialogue

  // Context
  ar_hint: string | null;
  season_hint: Season[];
  eco_tags: string[];

  // Luna-Specific
  ephemeral: boolean; // default false
  spawn_weight: number; // default 1

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface UserTrip {
  // Core Identity
  id: string; // UUID
  user_id: string; // UUID FK to auth.users

  // Trip Info
  name: string;
  description: string | null;

  // Itinerary
  destination_ids: string[];
  custom_destinations: any[];

  // Planning
  planned_date: string | null; // date
  duration_days: number | null;

  // Status
  is_public: boolean;
  is_completed: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DestinationFilters {
  category?: DriveTimeCategory | DriveTimeCategory[];
  subcategory?: string;
  county?: string;
  region?: string;
  featured?: boolean;
  trending?: boolean;
  search?: string;
}

export interface TripKitFilters {
  tier?: TripKitTier;
  collection_type?: TripKitCollectionType;
  primary_theme?: string;
  featured?: boolean;
  status?: TripKitStatus;
  max_price?: number;
}

export interface StayKitFilters {
  status?: StayKitStatus;
  featured?: boolean;
  max_price?: number;
  min_days?: number;
  max_days?: number;
}

// ============================================================================
// JOINED/COMPOSITE TYPES
// ============================================================================

export interface StayKitDayWithTasks extends StayKitDay {
  tasks: StayKitTaskWithTips[];
}

export interface StayKitTaskWithTips extends StayKitTask {
  tips: StayKitTip[];
  destination?: Destination | null;
}

export interface StayKitWithProgress extends StayKit {
  progress?: UserStayKitProgress | null;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DestinationType =
  | 'destination'
  | 'water'
  | 'morbid'
  | 'film'
  | 'mystery';

export type AllDestinations =
  | Destination
  | WaterDestination
  | MorbidDestination
  | FilmDestination
  | MysteryDestination;

// ============================================================================
// DATABASE HELPER TYPES
// ============================================================================

export interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
  count?: number | null;
  status: number;
  statusText: string;
}
