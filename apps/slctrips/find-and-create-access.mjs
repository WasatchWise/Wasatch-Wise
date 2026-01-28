#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Find TK-002
console.log('Looking for TK-002: Ski Utah Complete...\n');

const { data: tripkit, error: findError } = await supabase
  .from('tripkits')
  .select('*')
  .eq('code', 'TK-002')
  .single();

if (findError || !tripkit) {
  console.error('Error finding TripKit:', findError);
  process.exit(1);
}

console.log('Found TripKit:');
console.log(`  ID: ${tripkit.id}`);
console.log(`  Code: ${tripkit.code}`);
console.log(`  Name: ${tripkit.name}`);
console.log('');

// Create access record
console.log('Creating access record for user...\n');

const { data: accessRecord, error: createError } = await supabase
  .from('customer_product_access')
  .insert({
    user_id: '201e804d-2672-4679-a70c-cb6d1d2cb4f8',
    product_id: tripkit.id,
    product_type: 'tripkit',
    access_type: 'purchased',
    amount_paid: 1299, // $12.99 in cents
    stripe_payment_intent_id: 'pi_3SXA1hLRKGH1pF110ueNZCrs',
    access_granted_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  })
  .select();

if (createError) {
  if (createError.code === '23505') {
    console.log('✓ Access record already exists');
  } else {
    console.error('❌ Error:', createError);
    process.exit(1);
  }
} else {
  console.log('✅ Successfully created access record!');
  console.log('Your Ski Utah Complete TripKit should now appear on the My TripKits page.');
}
