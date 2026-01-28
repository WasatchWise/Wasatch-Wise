import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EntityType, TransactionType, validateSufficientBalance } from '@/lib/validations/wallet'

/**
 * POST /api/salt-rocks/spend
 * Spend Salt Rocks for various features
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      entityType,
      entityId,
      amount,
      transactionType,
      description,
      metadata,
    } = body

    // Validate required fields
    if (!entityType || !entityId || !amount || !transactionType) {
      return NextResponse.json(
        { error: 'entityType, entityId, amount, and transactionType are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }

    // Validate transaction type starts with spend_
    if (!transactionType.startsWith('spend_')) {
      return NextResponse.json({ error: 'Invalid transaction type for spending' }, { status: 400 })
    }

    // Verify ownership
    const ownershipResult = await verifyOwnershipAndGetBalance(
      supabase,
      user.id,
      entityType as EntityType,
      entityId
    )

    if (!ownershipResult.isOwner) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Check sufficient balance
    const balanceCheck = validateSufficientBalance(ownershipResult.balance, amount)
    if (!balanceCheck.valid) {
      return NextResponse.json({ error: balanceCheck.error }, { status: 400 })
    }

    // Execute the transaction using the database function
    const { data: transactionId, error: txError } = await supabase.rpc(
      'add_salt_rocks_transaction_v2',
      {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_amount: -amount, // Negative for spending
        p_transaction_type: transactionType,
        p_description: description || null,
        p_stripe_payment_intent_id: null,
        p_metadata: metadata ? JSON.stringify(metadata) : null,
      }
    )

    if (txError) {
      console.error('Transaction error:', txError)
      return NextResponse.json({ error: txError.message }, { status: 500 })
    }

    // Get updated balance
    const newBalance = ownershipResult.balance - amount

    return NextResponse.json({
      success: true,
      transactionId,
      previousBalance: ownershipResult.balance,
      spent: amount,
      newBalance,
    })
  } catch (error) {
    console.error('Salt Rocks spend error:', error)
    return NextResponse.json(
      { error: 'Failed to complete transaction' },
      { status: 500 }
    )
  }
}

async function verifyOwnershipAndGetBalance(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  entityType: EntityType,
  entityId: string
): Promise<{ isOwner: boolean; balance: number }> {
  if (entityType === 'band') {
    const { data: band } = await supabase
      .from('bands')
      .select('claimed_by, salt_rocks_balance')
      .eq('id', entityId)
      .single()
    return {
      isOwner: band?.claimed_by === userId,
      balance: band?.salt_rocks_balance || 0,
    }
  } else if (entityType === 'venue') {
    const { data: venue } = await supabase
      .from('venues')
      .select('claimed_by, salt_rocks_balance')
      .eq('id', entityId)
      .single()
    return {
      isOwner: venue?.claimed_by === userId,
      balance: venue?.salt_rocks_balance || 0,
    }
  } else if (entityType === 'fan') {
    const { data: wallet } = await supabase
      .from('fan_wallets')
      .select('user_id, salt_rocks_balance')
      .eq('id', entityId)
      .single()
    return {
      isOwner: wallet?.user_id === userId,
      balance: wallet?.salt_rocks_balance || 0,
    }
  }
  return { isOwner: false, balance: 0 }
}
