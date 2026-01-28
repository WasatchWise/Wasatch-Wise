import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * API Route: Link Access Codes and Products to User Account
 * POST /api/account/link-access-codes
 *
 * Links existing access codes (like TK-000) and product purchases (like Welcome Wagon)
 * to a user account when they sign up. This allows users to access their free content
 * through their account library.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Find all active access codes for this email that aren't already linked
    const { data: accessCodes, error: accessError } = await supabaseServer
      .from('tripkit_access_codes')
      .select('id, tripkit_id, access_code, customer_email')
      .eq('customer_email', email.toLowerCase())
      .eq('is_active', true);

    if (accessError) {
      console.error('Error fetching access codes:', accessError);
      return NextResponse.json(
        { error: 'Failed to fetch access codes' },
        { status: 500 }
      );
    }

    // Link each access code by creating customer_product_access records
    // This allows TripKits to show up in My TripKits library
    let linkedCount = 0;
    let tripkitLinkedCount = 0;
    const errors: string[] = [];

    // Process TripKit access codes
    for (const accessCode of (accessCodes || [])) {
      // Check if access record already exists
      const { data: existingAccess } = await supabaseServer
        .from('customer_product_access')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', accessCode.tripkit_id)
        .eq('product_type', 'tripkit')
        .maybeSingle();

      if (existingAccess) {
        // Already linked, skip
        linkedCount++;
        tripkitLinkedCount++;
        continue;
      }

      // Create a customer_product_access record for consistency with paid TripKits
      // This allows the TripKit to show up in My TripKits library
      const insertData: {
        user_id: string;
        product_id: string;
        product_type: 'tripkit';
        created_at: string;
      } = {
        user_id: userId,
        product_id: accessCode.tripkit_id,
        product_type: 'tripkit',
        created_at: new Date().toISOString(),
      };

      // Add optional fields if they exist in schema
      // These fields help track that access came from an access code
      const { error: accessRecordError } = await supabaseServer
        .from('customer_product_access')
        .insert(insertData);

      if (accessRecordError) {
        console.error(`Could not create access record for ${accessCode.id}:`, accessRecordError);
        errors.push(`Failed to link TripKit access`);
      } else {
        linkedCount++;
        tripkitLinkedCount++;
      }
    }

    // Also link Welcome Wagon purchases that were made before account creation
    // Find Welcome Wagon purchases by email that don't have a user_id yet
    const { data: welcomeWagonPurchases, error: wwError } = await supabaseServer
      .from('customer_product_access')
      .select('id, product_id, product_type, customer_email')
      .eq('product_type', 'welcome-wagon')
      .is('user_id', null) // No user linked yet
      .ilike('customer_email', email.toLowerCase()); // Match by email (if column exists)

    // Alternative: Check by looking up purchases that match the email
    // If customer_product_access doesn't have customer_email column,
    // we'd need to check via purchases table or email_captures
    let welcomeWagonLinked = 0;

    if (!wwError && welcomeWagonPurchases && welcomeWagonPurchases.length > 0) {
      for (const purchase of welcomeWagonPurchases) {
        // Update the purchase to link to user
        const { error: updateError } = await supabaseServer
          .from('customer_product_access')
          .update({ user_id: userId })
          .eq('id', purchase.id)
          .is('user_id', null);

        if (!updateError) {
          welcomeWagonLinked++;
          linkedCount++;
        }
      }
    }

    // Also check for Welcome Wagon purchases in the purchases table
    // that might need to be linked (if they were made without user_id)
    const { data: purchasesByEmail } = await supabaseServer
      .from('purchases')
      .select('id, product_id, product_type, customer_email')
      .eq('product_type', 'welcome-wagon')
      .eq('customer_email', email.toLowerCase())
      .is('user_id', null);

    if (purchasesByEmail && purchasesByEmail.length > 0) {
      // Link purchases and create corresponding access records
      for (const purchase of purchasesByEmail) {
        // Update purchase with user_id
        await supabaseServer
          .from('purchases')
          .update({ user_id: userId })
          .eq('id', purchase.id);

        // Create or update customer_product_access
        const { data: existingAccess } = await supabaseServer
          .from('customer_product_access')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', purchase.product_id)
          .eq('product_type', 'welcome-wagon')
          .maybeSingle();

        if (!existingAccess) {
          const { error: accessError } = await supabaseServer
            .from('customer_product_access')
            .insert({
              user_id: userId,
              product_id: purchase.product_id,
              product_type: 'welcome-wagon',
              created_at: new Date().toISOString(),
            });

          if (!accessError) {
            welcomeWagonLinked++;
            linkedCount++;
          }
        }
      }
    }

    const productsLinked = [];
    if (tripkitLinkedCount > 0) {
      productsLinked.push(`${tripkitLinkedCount} TripKit${tripkitLinkedCount !== 1 ? 's' : ''}`);
    }
    if (welcomeWagonLinked > 0) {
      productsLinked.push(`${welcomeWagonLinked} Welcome Wagon purchase${welcomeWagonLinked !== 1 ? 's' : ''}`);
    }

    const totalFound = (accessCodes?.length || 0) + (welcomeWagonPurchases?.length || 0) + (purchasesByEmail?.length || 0);

    return NextResponse.json({
      success: true,
      linkedCount,
      tripkitCount: tripkitLinkedCount,
      welcomeWagonCount: welcomeWagonLinked,
      totalFound,
      errors: errors.length > 0 ? errors : undefined,
      message: productsLinked.length > 0
        ? `Linked ${productsLinked.join(' and ')} to your account`
        : linkedCount > 0
        ? `Linked ${linkedCount} item${linkedCount !== 1 ? 's' : ''} to your account`
        : 'No items found to link',
    });

  } catch (error) {
    console.error('Error in link-access-codes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

