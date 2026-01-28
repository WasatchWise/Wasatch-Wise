import { z } from 'zod'

// =====================================================
// Entity Types
// =====================================================
export const EntityTypeSchema = z.enum(['band', 'venue', 'fan'])
export type EntityType = z.infer<typeof EntityTypeSchema>

// =====================================================
// Transaction Types
// =====================================================
export const TransactionTypeSchema = z.enum([
  // Purchases
  'purchase',
  'refund',
  // Band spending
  'spend_bio_upgrade',
  'spend_song_slot',
  'spend_photo_slot',
  'spend_featured_listing',
  'spend_event_promotion',
  'spend_tier_upgrade',
  // Fan spending
  'spend_boost_band',
  // Venue spending
  'spend_venue_promotion',
  'spend_priority_booking',
  // Earnings
  'earn_referral',
  'earn_engagement',
  'receive_boost',
  // System
  'boost_decay',
  'spend_contract_generation',
  'admin_adjustment',
])
export type TransactionType = z.infer<typeof TransactionTypeSchema>

// =====================================================
// Token Package Schema (for purchases)
// =====================================================
export const TokenPackageSchema = z.object({
  id: z.string(),
  tokens: z.number().positive(),
  priceInCents: z.number().positive(),
  bonusPercentage: z.number().min(0).max(100),
  label: z.string(),
})
export type TokenPackage = z.infer<typeof TokenPackageSchema>

// Available token packages
export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'rocks_50', tokens: 50, priceInCents: 500, bonusPercentage: 0, label: '50 Salt Rocks' },
  { id: 'rocks_120', tokens: 120, priceInCents: 1000, bonusPercentage: 20, label: '120 Salt Rocks (+20% bonus)' },
  { id: 'rocks_350', tokens: 350, priceInCents: 2500, bonusPercentage: 40, label: '350 Salt Rocks (+40% bonus)' },
  { id: 'rocks_800', tokens: 800, priceInCents: 5000, bonusPercentage: 60, label: '800 Salt Rocks (+60% bonus)' },
]

// =====================================================
// Purchase Request Schema
// =====================================================
export const PurchaseRequestSchema = z.object({
  packageId: z.string().refine(
    (id) => TOKEN_PACKAGES.some(p => p.id === id),
    'Invalid token package'
  ),
  entityType: EntityTypeSchema,
  entityId: z.string().uuid('Invalid entity ID'),
})
export type PurchaseRequest = z.infer<typeof PurchaseRequestSchema>

// =====================================================
// Spend Request Schema
// =====================================================
export const SpendRequestSchema = z.object({
  entityType: EntityTypeSchema,
  entityId: z.string().uuid('Invalid entity ID'),
  amount: z.number().positive('Amount must be positive'),
  transactionType: TransactionTypeSchema.refine(
    (type) => type.startsWith('spend_'),
    'Invalid spend transaction type'
  ),
  description: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
})
export type SpendRequest = z.infer<typeof SpendRequestSchema>

// =====================================================
// Boost Request Schema
// =====================================================
export const BoostRequestSchema = z.object({
  bandId: z.string().uuid('Invalid band ID'),
  amount: z
    .number()
    .min(1, 'Minimum boost is 1 Salt Rock')
    .max(100, 'Maximum boost is 100 Salt Rocks'),
})
export type BoostRequest = z.infer<typeof BoostRequestSchema>

// =====================================================
// Transaction Response Schema
// =====================================================
export const TransactionResponseSchema = z.object({
  id: z.string().uuid(),
  entityType: EntityTypeSchema,
  amount: z.number(),
  balanceAfter: z.number(),
  transactionType: TransactionTypeSchema,
  description: z.string().nullable(),
  createdAt: z.string(),
})
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>

// =====================================================
// Wallet Balance Response Schema
// =====================================================
export const WalletBalanceSchema = z.object({
  entityType: EntityTypeSchema,
  entityId: z.string().uuid(),
  balance: z.number().min(0),
  lastTransaction: TransactionResponseSchema.nullable(),
})
export type WalletBalance = z.infer<typeof WalletBalanceSchema>

// =====================================================
// Spending costs (in Salt Rocks)
// =====================================================
export const SPENDING_COSTS = {
  // Band features
  bio_upgrade: 10,
  song_slot: 25,
  photo_slot: 15,
  featured_listing_day: 50,
  event_promotion: 30,

  // Fan features
  boost_band_min: 1,
  boost_band_max: 100,

  // Venue features
  venue_promotion: 40,
  priority_booking: 20,

  // Contract
  contract_generation: 100,
} as const

// =====================================================
// Helper to get package by ID
// =====================================================
export function getTokenPackage(packageId: string): TokenPackage | undefined {
  return TOKEN_PACKAGES.find(p => p.id === packageId)
}

// =====================================================
// Helper to validate sufficient balance
// =====================================================
export function validateSufficientBalance(
  currentBalance: number,
  cost: number
): { valid: boolean; error?: string } {
  if (currentBalance < cost) {
    return {
      valid: false,
      error: `Insufficient balance. You have ${currentBalance} Salt Rocks but need ${cost}.`,
    }
  }
  return { valid: true }
}
