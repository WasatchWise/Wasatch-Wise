#!/usr/bin/env node

/**
 * Backfill customer_product_access table from tripkit_access_codes
 *
 * This script creates customer_product_access records for all existing
 * TripKit purchases that were made before the webhook was updated.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserIdFromEmail(email) {
  try {
    // First try profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileData && !profileError) {
      return profileData.id;
    }

    // Try querying auth.users directly (requires service role key)
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)
      .single();

    if (usersData && !usersError) {
      return usersData.id;
    }

    // Try with RPC function if available
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_user_id_by_email', { user_email: email });

    if (rpcData && !rpcError) {
      return rpcData;
    }

    return null;
  } catch (error) {
    console.error(`Error looking up user for ${email}:`, error.message);
    return null;
  }
}

async function backfillCustomerAccess() {
  console.log('🔍 Fetching all TripKit access codes...\n');

  // Get all tripkit_access_codes
  const { data: accessCodes, error: fetchError } = await supabase
    .from('tripkit_access_codes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('❌ Failed to fetch access codes:', fetchError);
    process.exit(1);
  }

  if (!accessCodes || accessCodes.length === 0) {
    console.log('✓ No access codes found - nothing to backfill');
    return;
  }

  console.log(`Found ${accessCodes.length} active access codes\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const code of accessCodes) {
    if (!code.customer_email) {
      console.log(`⚠️  Skipping ${code.access_code} - no email`);
      skipped++;
      continue;
    }

    // Check if access record already exists
    const { data: existing } = await supabase
      .from('customer_product_access')
      .select('id')
      .eq('product_id', code.tripkit_id)
      .eq('product_type', 'tripkit')
      .eq('stripe_session_id', code.stripe_session_id)
      .single();

    if (existing) {
      console.log(`✓ ${code.customer_email} - already has access`);
      skipped++;
      continue;
    }

    // Get user_id from email
    const userId = await getUserIdFromEmail(code.customer_email);

    if (!userId) {
      console.log(`⚠️  ${code.customer_email} - user not found (will skip)`);
      skipped++;
      continue;
    }

    // Create customer_product_access record
    const { error: insertError } = await supabase
      .from('customer_product_access')
      .insert({
        user_id: userId,
        product_id: code.tripkit_id,
        product_type: 'tripkit',
        access_type: 'purchased',
        stripe_session_id: code.stripe_session_id,
        stripe_payment_intent_id: code.stripe_payment_intent,
        amount_paid: code.amount_paid ? Math.round(code.amount_paid * 100) : null,
        access_granted_at: code.created_at,
        created_at: code.created_at,
      });

    if (insertError) {
      console.error(`❌ ${code.customer_email} - failed to create access:`, insertError.message);
      failed++;
    } else {
      console.log(`✅ ${code.customer_email} - access granted for TripKit ${code.tripkit_id}`);
      created++;
    }
  }

  console.log('\n=== Backfill Complete ===');
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total processed: ${accessCodes.length}`);
}

// Run the backfill
backfillCustomerAccess()
  .then(() => {
    console.log('\n✓ Backfill script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Backfill script failed:', error);
    process.exit(1);
  });
