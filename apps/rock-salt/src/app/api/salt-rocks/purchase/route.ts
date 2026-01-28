import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { TOKEN_PACKAGES, getTokenPackage, EntityType } from '@/lib/validations/wallet'

/**
 * GET /api/salt-rocks/purchase
 * Get available token packages
 */
export async function GET() {
  return NextResponse.json({
    packages: TOKEN_PACKAGES,
  })
}

/**
 * POST /api/salt-rocks/purchase
 * Create a Stripe checkout session to purchase Salt Rocks
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { packageId, entityType, entityId, successUrl, cancelUrl } = body

    if (!packageId || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'packageId, entityType, and entityId are required' },
        { status: 400 }
      )
    }

    // Validate package
    const tokenPackage = getTokenPackage(packageId)
    if (!tokenPackage) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }

    // Verify ownership of the entity
    const isOwner = await verifyOwnership(supabase, user.id, entityType as EntityType, entityId)
    if (!isOwner) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    const customerEmail = profile?.email || user.email

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tokenPackage.label,
              description: `${tokenPackage.tokens} Salt Rocks for The Rock Salt`,
              images: ['https://therocksalt.com/salt-rocks-icon.png'],
            },
            unit_amount: tokenPackage.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'salt_rocks_purchase',
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        package_id: packageId,
        tokens: tokenPackage.tokens.toString(),
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?canceled=true`,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Salt Rocks purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

async function verifyOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  entityType: EntityType,
  entityId: string
): Promise<boolean> {
  if (entityType === 'band') {
    const { data: band } = await supabase
      .from('bands')
      .select('claimed_by')
      .eq('id', entityId)
      .single()
    return band?.claimed_by === userId
  } else if (entityType === 'venue') {
    const { data: venue } = await supabase
      .from('venues')
      .select('claimed_by')
      .eq('id', entityId)
      .single()
    return venue?.claimed_by === userId
  } else if (entityType === 'fan') {
    const { data: wallet } = await supabase
      .from('fan_wallets')
      .select('user_id')
      .eq('id', entityId)
      .single()
    return wallet?.user_id === userId
  }
  return false
}
