import { z } from 'zod'

export const venueCapabilitySchema = z.object({
  typical_guarantee_min: z.number().min(0).optional().nullable(),
  typical_guarantee_max: z.number().min(0).optional().nullable(),
  payment_methods: z.array(z.string()).default([]),
  w9_on_file: z.boolean().default(false),
  insurance_coi_on_file: z.boolean().default(false),
  stage_width_feet: z.number().min(0).max(200).optional().nullable(),
  stage_depth_feet: z.number().min(0).max(100).optional().nullable(),
  input_channels: z.number().min(0).max(64).optional().nullable(),
  has_house_drums: z.boolean().default(false),
  has_backline: z.boolean().default(false),
  green_room_available: z.boolean().default(false),
  green_room_description: z.string().max(500).optional().nullable(),
  meal_buyout_available: z.boolean().default(false),
  typical_meal_buyout_amount: z.number().min(0).optional().nullable(),
  drink_tickets_available: z.number().min(0).optional().nullable(),
  guest_list_spots: z.number().min(0).optional().nullable(),
  parking_spaces: z.number().min(0).optional().nullable(),
  age_restrictions: z.array(z.enum(['all_ages', '18+', '21+'])).default([]),
  load_in_notes: z.string().max(1000).optional().nullable(),
  curfew_time: z.string().optional().nullable(),
})

export type VenueCapabilityFormData = z.infer<typeof venueCapabilitySchema>

export function venueCapabilityToDbFormat(data: VenueCapabilityFormData) {
  return {
    typical_guarantee_min: data.typical_guarantee_min ?? null,
    typical_guarantee_max: data.typical_guarantee_max ?? null,
    payment_methods: data.payment_methods?.length ? data.payment_methods : [],
    w9_on_file: data.w9_on_file ?? false,
    insurance_coi_on_file: data.insurance_coi_on_file ?? false,
    stage_width_feet: data.stage_width_feet ?? null,
    stage_depth_feet: data.stage_depth_feet ?? null,
    input_channels: data.input_channels ?? null,
    has_house_drums: data.has_house_drums ?? false,
    has_backline: data.has_backline ?? false,
    green_room_available: data.green_room_available ?? false,
    green_room_description: data.green_room_description || null,
    meal_buyout_available: data.meal_buyout_available ?? false,
    typical_meal_buyout_amount: data.typical_meal_buyout_amount ?? null,
    drink_tickets_available: data.drink_tickets_available ?? null,
    guest_list_spots: data.guest_list_spots ?? null,
    parking_spaces: data.parking_spaces ?? null,
    age_restrictions: data.age_restrictions?.length ? data.age_restrictions : [],
    load_in_notes: data.load_in_notes || null,
    curfew_time: data.curfew_time || null,
    profile_updated_at: new Date().toISOString(),
  }
}
