/**
 * API Request Validation Schemas
 * Zod schemas for validating all API request bodies
 */

import { z } from 'zod'

// ============================================
// Common Schemas
// ============================================

export const uuidSchema = z.string().uuid('Invalid UUID format')

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  offset: z.coerce.number().int().min(0).default(0),
})

export const searchSchema = z.object({
  search: z.string().max(200).optional(),
})

// ============================================
// Projects API Schemas
// ============================================

export const projectFiltersSchema = z.object({
  id: z.string().uuid().optional(),
  stage: z.string().optional(),
  type: z.string().optional(),
  state: z.string().max(2).optional(),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  maxScore: z.coerce.number().int().min(0).max(100).optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const createProjectSchema = z.object({
  project_name: z.string().min(1).max(500),
  project_type: z.array(z.string()).optional(),
  project_stage: z.string().optional(),
  project_value: z.number().positive().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  address: z.string().max(500).optional(),
  zip: z.string().max(10).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  developer_name: z.string().max(200).optional(),
  architect_name: z.string().max(200).optional(),
  general_contractor: z.string().max(200).optional(),
  units_count: z.number().int().positive().optional(),
  square_footage: z.number().positive().optional(),
  estimated_start_date: z.string().datetime().optional(),
  estimated_completion_date: z.string().datetime().optional(),
  bid_date: z.string().datetime().optional(),
  source: z.string().max(100).optional(),
  source_url: z.string().url().optional(),
  raw_data: z.record(z.unknown()).optional(),
})

// ============================================
// Email API Schemas
// ============================================

export const sendEmailSchema = z.object({
  contactIds: z.array(uuidSchema).min(1, 'At least one contact ID is required').max(100),
  subject: z.string().min(1, 'Subject is required').max(500),
  message: z.string().min(1, 'Message is required').max(50000),
  projectId: uuidSchema.optional(),
})

// ============================================
// Campaign API Schemas
// ============================================

export const campaignGenerationSchema = z.object({
  projectIds: z.array(uuidSchema).min(1).max(100),
  templateId: z.string().optional(),
  useAI: z.boolean().default(false),
  useVideo: z.boolean().default(false),
  generateVariants: z.boolean().default(false),
})

// ============================================
// Scraper API Schemas
// ============================================

export const scraperOptionsSchema = z.object({
  projectTypes: z.array(z.string()).optional(),
  states: z.array(z.string().max(2)).optional(),
  minValue: z.number().positive().optional(),
  maxResults: z.number().int().min(1).max(5000).default(500),
})

// ============================================
// Enrichment API Schemas
// ============================================

export const enrichmentRequestSchema = z.object({
  // No body required - project ID comes from URL params
})

// ============================================
// Validation Helper
// ============================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details: z.ZodIssue[] }

/**
 * Validate request data against a Zod schema
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errorMessage = result.error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join(', ')

  return {
    success: false,
    error: errorMessage,
    details: result.error.errors,
  }
}

/**
 * Validate search params from URL
 */
export function validateSearchParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): ValidationResult<T> {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  return validateRequest(schema, params)
}
