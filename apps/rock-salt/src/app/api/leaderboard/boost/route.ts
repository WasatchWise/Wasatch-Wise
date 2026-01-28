import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BOOST_COST = 10 // 10 Salt Rocks per boost
const BOOST_DURATION_DAYS = 7

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bandId, amount = 1 } = body

    if (!bandId) {
      return NextResponse.json(
        { error: 'Band ID is required' },
        { status: 400 }
      )
    }

    if (amount < 1 || amount > 10) {
      return NextResponse.json(
        { error: 'Amount must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Get user's fan wallet
    const { data: fanWallet } = await supabase
      .from('fan_wallets')
      .select('id, salt_rocks_balance')
      .eq('user_id', user.id)
      .single()

    if (!fanWallet) {
      return NextResponse.json(
        { error: 'You need a wallet to boost bands. Visit your wallet page first.' },
        { status: 400 }
      )
    }

    const totalCost = BOOST_COST * amount

    if ((fanWallet.salt_rocks_balance || 0) < totalCost) {
      return NextResponse.json(
        { error: `Insufficient balance. You need ${totalCost} Salt Rocks to boost ${amount} time(s).` },
        { status: 400 }
      )
    }

    // Verify the band exists and user doesn't own it
    const { data: band, error: bandError } = await supabase
      .from('bands')
      .select('id, name, claimed_by, boost_score')
      .eq('id', bandId)
      .single()

    if (bandError || !band) {
      return NextResponse.json(
        { error: 'Band not found' },
        { status: 404 }
      )
    }

    // Prevent self-boosting
    if (band.claimed_by === user.id) {
      return NextResponse.json(
        { error: 'You cannot boost your own band' },
        { status: 400 }
      )
    }

    // Check rate limit: 1 boost per user per band per day
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: recentBoosts, error: boostCheckError } = await supabase
      .from('band_boosts')
      .select('id')
      .eq('band_id', bandId)
      .eq('boosted_by_fan_id', fanWallet.id)
      .gte('created_at', oneDayAgo.toISOString())

    if (boostCheckError) {
      console.error('Boost check error:', boostCheckError)
    }

    if (recentBoosts && recentBoosts.length > 0) {
      return NextResponse.json(
        { error: 'You can only boost this band once per day' },
        { status: 429 }
      )
    }

    // Calculate expiration
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + BOOST_DURATION_DAYS)

    // Deduct Salt Rocks from fan wallet
    const { error: deductError } = await supabase
      .from('fan_wallets')
      .update({
        salt_rocks_balance: (fanWallet.salt_rocks_balance || 0) - totalCost,
      })
      .eq('id', fanWallet.id)

    if (deductError) {
      console.error('Deduct error:', deductError)
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      )
    }

    // Record the transaction
    await supabase.from('salt_rocks_transactions').insert({
      entity_type: 'fan',
      fan_wallet_id: fanWallet.id,
      amount: -totalCost,
      transaction_type: 'boost_band',
      description: `Boosted ${band.name} (${amount}x)`,
    })

    // Create boost record(s)
    const boosts = Array.from({ length: amount }, () => ({
      band_id: bandId,
      boosted_by_fan_id: fanWallet.id,
      amount: BOOST_COST,
      expires_at: expiresAt.toISOString(),
      is_active: true,
    }))

    const { error: boostError } = await supabase
      .from('band_boosts')
      .insert(boosts)

    if (boostError) {
      console.error('Boost insert error:', boostError)
      // Refund on failure
      await supabase
        .from('fan_wallets')
        .update({
          salt_rocks_balance: fanWallet.salt_rocks_balance,
        })
        .eq('id', fanWallet.id)

      return NextResponse.json(
        { error: 'Failed to create boost' },
        { status: 500 }
      )
    }

    // Update band's boost score
    const newBoostScore = (band.boost_score || 0) + (amount * BOOST_COST)
    await supabase
      .from('bands')
      .update({ boost_score: newBoostScore })
      .eq('id', bandId)

    return NextResponse.json({
      success: true,
      message: `Boosted ${band.name} with ${amount} boost(s)!`,
      newBalance: (fanWallet.salt_rocks_balance || 0) - totalCost,
      boostScore: newBoostScore,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Boost error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get user's boost history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bandId = searchParams.get('bandId')

    // Get user's fan wallet
    const { data: fanWallet } = await supabase
      .from('fan_wallets')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!fanWallet) {
      return NextResponse.json({ boosts: [] })
    }

    let query = supabase
      .from('band_boosts')
      .select(`
        id,
        amount,
        created_at,
        expires_at,
        is_active,
        band:bands(id, name, slug, image_url)
      `)
      .eq('boosted_by_fan_id', fanWallet.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (bandId) {
      query = query.eq('band_id', bandId)
    }

    const { data: boosts, error } = await query

    if (error) {
      console.error('Get boosts error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch boosts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      boosts: boosts || [],
    })
  } catch (error) {
    console.error('Get boosts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
