export type Destination = {
  // Core identification
  id: string;
  slug: string;
  name: string;
  place_id: string;

  // Location data
  latitude: number | null;
  longitude: number | null;
  county: string | null;
  region: string | null;
  state_code: string | null;
  city: string | null;
  address_full: string | null;
  what3words: string | null;

  // Categorization
  category: string;
  subcategory: string;

  // Drive time data (from public_destinations view)
  drive_minutes: number | null;
  distance_miles: number | null;

  // Content
  description: string | null;
  image_url: string | null;
  photo_url?: string | null; // Legacy field
  photo_gallery: any | null;
  video_url: string | null;

  // Amenities (from public_destinations view)
  is_parking_free: boolean | null;
  has_restrooms: boolean | null;
  has_visitor_center: boolean | null;
  has_playground: boolean | null;

  // Visitor flags (from public_destinations view)
  is_family_friendly: boolean | null;
  pet_allowed: boolean | null;

  // Seasonal availability (from public_destinations view)
  is_season_spring: boolean | null;
  is_season_summer: boolean | null;
  is_season_fall: boolean | null;
  is_season_winter: boolean | null;
  is_season_all: boolean | null;

  // Features
  featured: boolean;
  is_featured?: boolean; // Duplicate from view
  trending: boolean;

  // Nearby recommendations
  nearby_food: string | null;
  nearby_lodging: string | null;
  nearby_attractions: string | null;
  activities: string | null;
  historical_timeline: string | null;

  // Contact information
  contact_info: any | null;

  // Ratings and scores
  popularity_score: number | null;
  accessibility_rating: number | null;
  sustainability_rating: number | null;
  data_quality_score: number | null;

  // AI-generated content
  ai_summary: string | null;
  ai_tips: string | null;
  ai_story: string | null;

  // Recommendations (JSON arrays)
  hotel_recommendations?: any[] | null;
  tour_recommendations?: any[] | null;

  // Metadata
  created_at?: string;
  updated_at?: string;

  // Allow additional database fields for flexibility
  [key: string]: any;
};

export type Guardian = {
  id: number;
  county: string | null;
  codename: string | null;
  display_name: string | null;
  animal_type: string | null;
  element: string | null;
  archetype: string | null;
  motto: string | null;
  bio: string | null;
  abilities: string | null;
  personality: string | null;
  backstory: string | null;
  avatar_url?: string | null;
  image_url?: string | null;
  [key: string]: any; // Allow additional database fields
};

export type Affiliate = {
  id: number;
  destination_id: string | number;
  name: string;
  url: string;
  category: string | null;
};


