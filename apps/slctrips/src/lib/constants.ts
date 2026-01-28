/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values
 */

// Pagination
export const PAGINATION = {
  DESTINATIONS_PER_PAGE: 20,
  TRIPKITS_PER_PAGE: 12,
  GUARDIANS_PER_PAGE: 29,
  MAX_RESULTS: 100,
  INITIAL_LOAD: 50,
} as const;

// Timeouts (milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 10000,
  DEBOUNCE_SEARCH: 300,
  MODAL_DELAY: 1000,
  REDIRECT_DELAY: 1200,
} as const;

// Images
export const IMAGES = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  QUALITY: {
    HIGH: 90,
    MEDIUM: 75,
    LOW: 60,
  },
} as const;

// Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: {
    LOWERCASE: /[a-z]/,
    UPPERCASE: /[A-Z]/,
    NUMBER: /[0-9]/,
    SPECIAL: /[!@#$%^&*(),.?":{}|<>]/,
  },
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
} as const;

// Drive Time Categories
export const DRIVE_CATEGORIES = [
  { name: '30min', label: '30 min', emoji: '⚡', max: 30 },
  { name: '90min', label: '90 min', emoji: '🚗', max: 90 },
  { name: '3h', label: '3 hours', emoji: '🏔️', max: 180 },
  { name: '5h', label: '5 hours', emoji: '🌄', max: 300 },
  { name: '8h', label: '8 hours', emoji: '🗺️', max: 480 },
  { name: '12h', label: '12+ hours', emoji: '🚙', max: 9999 }
] as const;

// Seasons
export const SEASONS = {
  SPRING: { name: 'spring', label: 'Spring', emoji: '🌸', months: [3, 4, 5] },
  SUMMER: { name: 'summer', label: 'Summer', emoji: '☀️', months: [6, 7, 8] },
  FALL: { name: 'fall', label: 'Fall', emoji: '🍂', months: [9, 10, 11] },
  WINTER: { name: 'winter', label: 'Winter', emoji: '❄️', months: [12, 1, 2] },
} as const;

// Subcategory Icons
export const SUBCATEGORY_ICONS: Record<string, string> = {
  'Brewery': '🍺',
  'Coffee': '☕',
  'Restaurant': '🍽️',
  'Film Locations': '🎬',
  'Scenic Drive': '🚗',
  'Haunted Location': '👻',
  'Hiking': '🥾',
  'Skiing': '⛷️',
  'Swimming': '🏊',
  'National Park': '🏞️',
  'Museum': '🏛️',
  'Rock Climbing': '🧗',
  'Camping': '⛺',
  'Mountain Biking': '🚵',
  'Lake': '🏊',
  'Waterfall': '💧',
  'Ghost Town': '👻',
  'Hot Spring': '♨️',
  'General': '📍'
};

// Supported Languages (ElevenLabs)
export const SUPPORTED_LANGUAGES = [
  'en', 'es', 'fr', 'de', 'pt', 'it', 'zh', 'ja', 'ko', 'nl',
  'pl', 'tr', 'ru', 'ar', 'hi', 'sv', 'da', 'no', 'fi', 'cs',
  'uk', 'ro', 'el', 'hu', 'bg', 'hr', 'sk', 'sl', 'lt', 'lv', 'et'
] as const;

// Site Configuration
export const SITE_CONFIG = {
  NAME: 'SLCTrips',
  TAGLINE: 'From Salt Lake, to Everywhere',
  DESCRIPTION: 'Discover amazing destinations from Salt Lake City International Airport. 1 Airport, 1000+ Destinations.',
  URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com',
  TWITTER: '@SLCTrips',
  EMAIL: 'Dan@slctrips.com',
} as const;

// Cache durations (seconds)
export const CACHE_DURATION = {
  STATIC_ASSETS: 31536000, // 1 year
  API_RESPONSE: 300, // 5 minutes
  PAGE_DATA: 3600, // 1 hour
  USER_SESSION: 86400, // 24 hours
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  AUTH_ATTEMPTS_PER_HOUR: 5,
  EMAIL_SENDS_PER_DAY: 10,
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  DESTINATION_VIEW: 'destination_view',
  FILTER_APPLIED: 'filter_applied',
  CHECKOUT_STARTED: 'checkout_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  MODAL_INTERACTION: 'modal_interaction',
  EMAIL_SUBMITTED: 'email_submitted',
  AUDIO_PLAYED: 'audio_played',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You must be logged in to access this.',
  FORBIDDEN: 'You do not have permission to access this.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. We\'re working on it.',
} as const;

export default {
  PAGINATION,
  TIMEOUTS,
  IMAGES,
  VALIDATION,
  DRIVE_CATEGORIES,
  SEASONS,
  SUBCATEGORY_ICONS,
  SUPPORTED_LANGUAGES,
  SITE_CONFIG,
  CACHE_DURATION,
  RATE_LIMITS,
  ANALYTICS_EVENTS,
  ERROR_MESSAGES,
};
