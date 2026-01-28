import { z } from 'zod';

/**
 * Shared validation schemas for API routes
 * Prevents DoS, injection attacks, and ensures type safety
 */

// Content duration validation - matches synthesis UI options
export const contentDurationSchema = z.enum(['15s', '30s', '45s', '60s', '3m']);

// Mindset validation
export const mindsetSchema = z.enum(['Optimist', 'Maybe', 'Unaware']).optional();

// Preferred format validation
export const preferredFormatSchema = z.enum(['text', 'video', 'interactive', 'visual']).optional();

// URL validation (basic - could be enhanced)
export const urlSchema = z.string().url().max(2048).optional();

// Text content validation (with length limits to prevent DoS)
const MAX_TEXT_LENGTH = 50000; // 50KB max input
const MIN_TEXT_LENGTH = 10;

export const textContentSchema = z.string()
    .min(MIN_TEXT_LENGTH, `Text must be at least ${MIN_TEXT_LENGTH} characters`)
    .max(MAX_TEXT_LENGTH, `Text cannot exceed ${MAX_TEXT_LENGTH} characters`)
    .optional();

// Research API schema
export const researchRequestSchema = z.object({
    rawText: z.string()
        .min(MIN_TEXT_LENGTH, `Text must be at least ${MIN_TEXT_LENGTH} characters`)
        .max(MAX_TEXT_LENGTH, `Text cannot exceed ${MAX_TEXT_LENGTH} characters`)
        .optional(),
    url: urlSchema,
    duration: contentDurationSchema.optional().default('30s'),
    mindsetOverride: mindsetSchema,
    templateId: z.string().max(100).optional(),
    preferredFormat: preferredFormatSchema,
}).refine((data) => data.rawText || data.url, {
    message: 'Either rawText or url must be provided',
    path: ['rawText'],
});

// Production API schema
export const productionRequestSchema = z.object({
    rawText: z.string()
        .min(MIN_TEXT_LENGTH, `Text must be at least ${MIN_TEXT_LENGTH} characters`)
        .max(MAX_TEXT_LENGTH, `Text cannot exceed ${MAX_TEXT_LENGTH} characters`),
    duration: contentDurationSchema.optional().default('30s'),
});

// Multi-version API schema
export const multiVersionRequestSchema = z.object({
    rawText: z.string()
        .min(MIN_TEXT_LENGTH, `Text must be at least ${MIN_TEXT_LENGTH} characters`)
        .max(MAX_TEXT_LENGTH, `Text cannot exceed ${MAX_TEXT_LENGTH} characters`)
        .optional(),
    url: urlSchema,
    duration: contentDurationSchema.optional().default('30s'),
    usePerformanceData: z.boolean().optional().default(false),
    preferredFormat: preferredFormatSchema,
}).refine((data) => data.rawText || data.url, {
    message: 'Either rawText or url must be provided',
    path: ['rawText'],
});

// Asset generation schema
export const assetGenerationRequestSchema = z.object({
    prompt: z.string()
        .min(10, 'Prompt must be at least 10 characters')
        .max(1000, 'Prompt cannot exceed 1000 characters'),
    type: z.enum(['image', 'video']),
});

// Asset save schema - matches saveAssetToLibrary function signature
export const assetSaveRequestSchema = z.object({
    topic: z.string().min(1).max(200),
    pillar: z.string().min(1).max(100),
    refinedContent: z.object({
        socialHook: z.string().max(500),
        nepqTrigger: z.string().max(500),
        videoScript: z.string().max(5000),
    }),
    assets: z.object({
        video: z.string().url().max(2048).optional(),
        image: z.string().url().max(2048).optional(),
    }).optional(),
    rawText: z.string().max(MAX_TEXT_LENGTH),
});

// Generate script schema
export const generateScriptRequestSchema = z.object({
    topic: z.string()
        .min(10, 'Topic must be at least 10 characters')
        .max(500, 'Topic cannot exceed 500 characters'),
    duration: contentDurationSchema.optional().default('30s'),
    tone: z.enum(['professional', 'casual', 'educational']).optional().default('professional'),
});

// Type exports for TypeScript
export type ResearchRequest = z.infer<typeof researchRequestSchema>;
export type ProductionRequest = z.infer<typeof productionRequestSchema>;
export type MultiVersionRequest = z.infer<typeof multiVersionRequestSchema>;
export type AssetGenerationRequest = z.infer<typeof assetGenerationRequestSchema>;
export type AssetSaveRequest = z.infer<typeof assetSaveRequestSchema>;
export type GenerateScriptRequest = z.infer<typeof generateScriptRequestSchema>;

