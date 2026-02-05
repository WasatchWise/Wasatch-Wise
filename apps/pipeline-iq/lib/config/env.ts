/**
 * Environment Configuration & Validation
 * Validates all required environment variables at startup
 */

import { z } from 'zod'

const envSchema = z.object({
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Organization
  ORGANIZATION_ID: z.string().uuid('ORGANIZATION_ID must be a valid UUID'),

  // OpenAI (Required for AI features)
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required').optional(),

  // Google APIs (Optional - features degrade gracefully)
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  GOOGLE_GEMINI_API_KEY: z.string().optional(),
  GOOGLE_SEARCH_ENGINE_ID: z.string().optional(),

  // HeyGen (Optional - video features)
  HEYGEN_API_KEY: z.string().optional(),
  HEYGEN_MIKE_AVATAR_ID: z.string().optional(),

  // Email (Optional - email features)
  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),

  // Scraping
  SCRAPE_API_KEY: z.string().optional(),
  CONSTRUCTION_WIRE_USERNAME: z.string().optional(),
  CONSTRUCTION_WIRE_PASSWORD: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | null = null

/**
 * Validate and return environment variables
 * Throws detailed error if validation fails
 */
export function getEnv(): Env {
  if (cachedEnv) return cachedEnv

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.errors
      .map(err => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n')

    throw new Error(
      `\n❌ Environment validation failed:\n${errors}\n\nPlease check your .env.local file.`
    )
  }

  cachedEnv = result.data
  return cachedEnv
}

/**
 * Get a specific environment variable with type safety
 */
export function env<K extends keyof Env>(key: K): Env[K] {
  return getEnv()[key]
}

/**
 * Check if a feature is available based on env vars
 */
export const featureFlags = {
  get aiEnrichment(): boolean {
    return !!process.env.OPENAI_API_KEY && !!process.env.GOOGLE_PLACES_API_KEY
  },
  get videoGeneration(): boolean {
    return !!process.env.HEYGEN_API_KEY && !!process.env.HEYGEN_MIKE_AVATAR_ID
  },
  get emailSending(): boolean {
    return !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD
  },
  get scraping(): boolean {
    return !!process.env.CONSTRUCTION_WIRE_USERNAME && !!process.env.CONSTRUCTION_WIRE_PASSWORD
  },
  get googleSearch(): boolean {
    return !!process.env.GOOGLE_PLACES_API_KEY && !!process.env.GOOGLE_SEARCH_ENGINE_ID
  },
}

/**
 * Validate environment on module load in production (runtime only).
 * Skip during Next.js build (phase-production-build) so Vercel build can complete;
 * env vars are available at runtime. See MONOREPO_STATUS_AND_SEND_OUT.md §5.
 */
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
  try {
    getEnv()
    console.log('✅ Environment validation passed')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
