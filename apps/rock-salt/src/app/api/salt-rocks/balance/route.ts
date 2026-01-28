import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EntityType } from '@/lib/validations/wallet'

/**
 * GET /api/salt-rocks/balance
 * Get wallet balance for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType') as EntityType | null
    const entityId = searchParams.get('entityId')

    // If no specific entity requested, return all wallets for this user
    if (!entityType || !entityId) {
      return await getAllWallets(supabase, user.id)
    }

    // Get specific wallet balance
    return await getWalletBalance(supabase, user.id, entityType, entityId)
  } catch (error) {
    console.error('Balance GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}

async function getAllWallets(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const wallets: Array<{
    entityType: EntityType
    entityId: string
    entityName: string
    balance: number
  }> = []

  // Get user's bands
  const { data: bands } = await supabase
    .from('bands')
    .select('id, name, salt_rocks_balance')
    .eq('claimed_by', userId)

  if (bands) {
    bands.forEach(band => {
      wallets.push({
        entityType: 'band',
        entityId: band.id,
        entityName: band.name,
        balance: band.salt_rocks_balance || 0,
      })
    })
  }

  // Get user's venues
  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, salt_rocks_balance')
    .eq('claimed_by', userId)

  if (venues) {
    venues.forEach(venue => {
      wallets.push({
        entityType: 'venue',
        entityId: venue.id,
        entityName: venue.name,
        balance: venue.salt_rocks_balance || 0,
      })
    })
  }

  // Get user's fan wallet (or create one)
  let { data: fanWallet } = await supabase
    .from('fan_wallets')
    .select('id, salt_rocks_balance, display_name')
    .eq('user_id', userId)
    .single()

  // Create fan wallet if it doesn't exist
  if (!fanWallet) {
    const { data: newWallet, error: createError } = await supabase
      .from('fan_wallets')
      .insert({ user_id: userId })
      .select()
      .single()

    if (!createError && newWallet) {
      fanWallet = newWallet
    }
  }

  if (fanWallet) {
    wallets.push({
      entityType: 'fan',
      entityId: fanWallet.id,
      entityName: fanWallet.display_name || 'My Fan Wallet',
      balance: fanWallet.salt_rocks_balance || 0,
    })
  }

  return NextResponse.json({
    wallets,
    totalBalance: wallets.reduce((sum, w) => sum + w.balance, 0),
  })
}

async function getWalletBalance(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  entityType: EntityType,
  entityId: string
) {
  let balance = 0
  let entityName = ''
  let isOwner = false

  if (entityType === 'band') {
    const { data: band } = await supabase
      .from('bands')
      .select('name, salt_rocks_balance, claimed_by')
      .eq('id', entityId)
      .single()

    if (!band) {
      return NextResponse.json({ error: 'Band not found' }, { status: 404 })
    }

    isOwner = band.claimed_by === userId
    balance = band.salt_rocks_balance || 0
    entityName = band.name
  } else if (entityType === 'venue') {
    const { data: venue } = await supabase
      .from('venues')
      .select('name, salt_rocks_balance, claimed_by')
      .eq('id', entityId)
      .single()

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    isOwner = venue.claimed_by === userId
    balance = venue.salt_rocks_balance || 0
    entityName = venue.name
  } else if (entityType === 'fan') {
    const { data: wallet } = await supabase
      .from('fan_wallets')
      .select('salt_rocks_balance, display_name, user_id')
      .eq('id', entityId)
      .single()

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    isOwner = wallet.user_id === userId
    balance = wallet.salt_rocks_balance || 0
    entityName = wallet.display_name || 'My Fan Wallet'
  }

  if (!isOwner) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('salt_rocks_transactions')
    .select('*')
    .eq(entityType === 'band' ? 'band_id' : entityType === 'venue' ? 'venue_id' : 'fan_wallet_id', entityId)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    entityType,
    entityId,
    entityName,
    balance,
    recentTransactions: transactions || [],
  })
}
