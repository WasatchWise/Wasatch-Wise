#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Searching by email: admin@wasatchwise.com\n');
const { data, error } = await supabase
  .from('purchases')
  .select('*')
  .eq('customer_email', 'admin@wasatchwise.com')
  .order('created_at', { ascending: false })
  .limit(10);

if (error) {
  console.error('Error:', error);
} else if (data && data.length > 0) {
  console.log(`Found ${data.length} purchase(s):\n`);
  data.forEach((p, i) => {
    console.log(`Purchase ${i + 1}:`);
    console.log(`  TripKit ID: ${p.tripkit_id || 'N/A'}`);
    console.log(`  Product Type: ${p.product_type || 'tripkit'}`);
    console.log(`  Product ID: ${p.product_id || p.tripkit_id || 'N/A'}`);
    console.log(`  Amount: $${p.amount_paid}`);
    console.log(`  Created: ${p.created_at || p.purchased_at}`);
    console.log(`  Stripe Payment Intent: ${p.stripe_payment_intent || p.stripe_payment_intent_id || 'N/A'}`);
    console.log('');
  });
} else {
  console.log('No purchases found');
}
