import { z } from 'zod'

// =====================================================
// Step 1: Meta Information Schema
// =====================================================
export const SpiderRiderMetaSchema = z.object({
  version: z
    .string()
    .min(1, 'Version name is required')
    .max(50, 'Version name must be 50 characters or less')
    .default('v1'),
  bandId: z.string().uuid('Invalid band ID'),
})

// =====================================================
// Step 2: Financial Terms Schema
// =====================================================
export const SpiderRiderFinancialsSchema = z.object({
  guaranteeMin: z
    .number()
    .min(100, 'Minimum guarantee must be at least $100 (no exposure gigs!)')
    .max(100000, 'Guarantee seems too high'),
  guaranteeMax: z
    .number()
    .min(100, 'Maximum guarantee must be at least $100')
    .max(100000, 'Guarantee seems too high')
    .optional()
    .nullable(),
  doorSplitPercentage: z
    .number()
    .min(0, 'Door split cannot be negative')
    .max(100, 'Door split cannot exceed 100%')
    .optional()
    .nullable(),
  merchSplitToVenuePercentage: z
    .number()
    .min(0, 'Merch split cannot be negative')
    .max(50, 'Merch split to venue should not exceed 50%')
    .default(15),
  notesFinancial: z
    .string()
    .max(2000, 'Financial notes must be 2000 characters or less')
    .optional()
    .nullable(),
}).refine(
  (data) => !data.guaranteeMax || data.guaranteeMax >= data.guaranteeMin,
  {
    message: 'Maximum guarantee must be greater than or equal to minimum',
    path: ['guaranteeMax'],
  }
)

// =====================================================
// Step 3: Technical Requirements Schema
// =====================================================
export const SpiderRiderTechSchema = z.object({
  minStageWidthFeet: z
    .number()
    .min(0, 'Stage width cannot be negative')
    .max(200, 'Stage width seems too large')
    .optional()
    .nullable(),
  minStageDepthFeet: z
    .number()
    .min(0, 'Stage depth cannot be negative')
    .max(100, 'Stage depth seems too large')
    .optional()
    .nullable(),
  minInputChannels: z
    .number()
    .min(0, 'Input channels cannot be negative')
    .max(64, 'Input channels cannot exceed 64')
    .optional()
    .nullable(),
  requiresHouseDrums: z.boolean().default(false),
  stagePlotUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  inputListUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  notesTechnical: z
    .string()
    .max(2000, 'Technical notes must be 2000 characters or less')
    .optional()
    .nullable(),
})

// =====================================================
// Step 4: Hospitality Schema
// =====================================================
export const SpiderRiderHospitalitySchema = z.object({
  greenRoomRequirements: z
    .string()
    .max(1000, 'Green room requirements must be 1000 characters or less')
    .optional()
    .nullable(),
  mealBuyoutAmount: z
    .number()
    .min(0, 'Meal buyout cannot be negative')
    .max(500, 'Meal buyout seems too high')
    .optional()
    .nullable(),
  drinkTicketsCount: z
    .number()
    .min(0, 'Drink tickets cannot be negative')
    .max(50, 'Drink tickets cannot exceed 50')
    .optional()
    .nullable(),
  guestListAllocation: z
    .number()
    .min(0, 'Guest list cannot be negative')
    .max(50, 'Guest list cannot exceed 50')
    .optional()
    .nullable(),
  notesHospitality: z
    .string()
    .max(2000, 'Hospitality notes must be 2000 characters or less')
    .optional()
    .nullable(),
})

// =====================================================
// Step 5: Business Terms Schema
// =====================================================
export const SpiderRiderBusinessSchema = z.object({
  ageRestriction: z
    .enum(['all_ages', '18+', '21+'])
    .optional()
    .nullable(),
  notesBusiness: z
    .string()
    .max(2000, 'Business notes must be 2000 characters or less')
    .optional()
    .nullable(),
})

// =====================================================
// Full Spider Rider Schema (combines all steps)
// =====================================================
export const SpiderRiderFullSchema = z.object({
  // Meta
  version: SpiderRiderMetaSchema.shape.version,
  bandId: SpiderRiderMetaSchema.shape.bandId,

  // Financials
  guaranteeMin: SpiderRiderFinancialsSchema.shape.guaranteeMin,
  guaranteeMax: SpiderRiderFinancialsSchema.shape.guaranteeMax,
  doorSplitPercentage: SpiderRiderFinancialsSchema.shape.doorSplitPercentage,
  merchSplitToVenuePercentage: SpiderRiderFinancialsSchema.shape.merchSplitToVenuePercentage,
  notesFinancial: SpiderRiderFinancialsSchema.shape.notesFinancial,

  // Technical
  minStageWidthFeet: SpiderRiderTechSchema.shape.minStageWidthFeet,
  minStageDepthFeet: SpiderRiderTechSchema.shape.minStageDepthFeet,
  minInputChannels: SpiderRiderTechSchema.shape.minInputChannels,
  requiresHouseDrums: SpiderRiderTechSchema.shape.requiresHouseDrums,
  stagePlotUrl: SpiderRiderTechSchema.shape.stagePlotUrl,
  inputListUrl: SpiderRiderTechSchema.shape.inputListUrl,
  notesTechnical: SpiderRiderTechSchema.shape.notesTechnical,

  // Hospitality
  greenRoomRequirements: SpiderRiderHospitalitySchema.shape.greenRoomRequirements,
  mealBuyoutAmount: SpiderRiderHospitalitySchema.shape.mealBuyoutAmount,
  drinkTicketsCount: SpiderRiderHospitalitySchema.shape.drinkTicketsCount,
  guestListAllocation: SpiderRiderHospitalitySchema.shape.guestListAllocation,
  notesHospitality: SpiderRiderHospitalitySchema.shape.notesHospitality,

  // Business
  ageRestriction: SpiderRiderBusinessSchema.shape.ageRestriction,
  notesBusiness: SpiderRiderBusinessSchema.shape.notesBusiness,
}).refine(
  (data) => !data.guaranteeMax || data.guaranteeMax >= data.guaranteeMin,
  {
    message: 'Maximum guarantee must be greater than or equal to minimum',
    path: ['guaranteeMax'],
  }
)

// =====================================================
// Type exports
// =====================================================
export type SpiderRiderMeta = z.infer<typeof SpiderRiderMetaSchema>
export type SpiderRiderFinancials = z.infer<typeof SpiderRiderFinancialsSchema>
export type SpiderRiderTech = z.infer<typeof SpiderRiderTechSchema>
export type SpiderRiderHospitality = z.infer<typeof SpiderRiderHospitalitySchema>
export type SpiderRiderBusiness = z.infer<typeof SpiderRiderBusinessSchema>
export type SpiderRiderFormData = z.infer<typeof SpiderRiderFullSchema>

// =====================================================
// Status type for state machine
// =====================================================
export type SpiderRiderStatus = 'draft' | 'published' | 'archived'

export const SpiderRiderStatusSchema = z.enum(['draft', 'published', 'archived'])

// =====================================================
// Database record type (includes system fields)
// =====================================================
export interface SpiderRiderRecord extends SpiderRiderFormData {
  id: string
  status: SpiderRiderStatus
  versionNumber: number
  parentVersionId: string | null
  publishedAt: string | null
  acceptanceCount: number
  bookingCount: number
  createdAt: string
  updatedAt: string
}

// =====================================================
// Helper to convert form data to database format
// =====================================================
export function formDataToDbFormat(data: SpiderRiderFormData) {
  return {
    band_id: data.bandId,
    version: data.version,
    // Financials - convert dollars to cents for storage
    guarantee_min: Math.round(data.guaranteeMin * 100),
    guarantee_max: data.guaranteeMax ? Math.round(data.guaranteeMax * 100) : null,
    door_split_percentage: data.doorSplitPercentage || null,
    merch_split_to_venue_percentage: data.merchSplitToVenuePercentage,
    notes_financial: data.notesFinancial || null,
    // Technical
    min_stage_width_feet: data.minStageWidthFeet || null,
    min_stage_depth_feet: data.minStageDepthFeet || null,
    min_input_channels: data.minInputChannels || null,
    requires_house_drums: data.requiresHouseDrums,
    stage_plot_url: data.stagePlotUrl || null,
    input_list_url: data.inputListUrl || null,
    notes_technical: data.notesTechnical || null,
    // Hospitality - convert dollars to cents
    green_room_requirements: data.greenRoomRequirements || null,
    meal_buyout_amount: data.mealBuyoutAmount ? Math.round(data.mealBuyoutAmount * 100) : null,
    drink_tickets_count: data.drinkTicketsCount || null,
    guest_list_allocation: data.guestListAllocation || null,
    notes_hospitality: data.notesHospitality || null,
    // Business
    age_restriction: data.ageRestriction || null,
    notes_business: data.notesBusiness || null,
  }
}

// =====================================================
// Helper to convert database record to form format
// =====================================================
export function dbToFormData(record: Record<string, unknown>): Partial<SpiderRiderFormData> {
  return {
    bandId: record.band_id as string,
    version: record.version as string,
    // Financials - convert cents to dollars for display
    guaranteeMin: record.guarantee_min ? Number(record.guarantee_min) / 100 : 0,
    guaranteeMax: record.guarantee_max ? Number(record.guarantee_max) / 100 : null,
    doorSplitPercentage: record.door_split_percentage as number | null,
    merchSplitToVenuePercentage: (record.merch_split_to_venue_percentage as number) || 15,
    notesFinancial: record.notes_financial as string | null,
    // Technical
    minStageWidthFeet: record.min_stage_width_feet as number | null,
    minStageDepthFeet: record.min_stage_depth_feet as number | null,
    minInputChannels: record.min_input_channels as number | null,
    requiresHouseDrums: Boolean(record.requires_house_drums),
    stagePlotUrl: record.stage_plot_url as string | null,
    inputListUrl: record.input_list_url as string | null,
    notesTechnical: record.notes_technical as string | null,
    // Hospitality - convert cents to dollars
    greenRoomRequirements: record.green_room_requirements as string | null,
    mealBuyoutAmount: record.meal_buyout_amount ? Number(record.meal_buyout_amount) / 100 : null,
    drinkTicketsCount: record.drink_tickets_count as number | null,
    guestListAllocation: record.guest_list_allocation as number | null,
    notesHospitality: record.notes_hospitality as string | null,
    // Business
    ageRestriction: record.age_restriction as 'all_ages' | '18+' | '21+' | null,
    notesBusiness: record.notes_business as string | null,
  }
}
