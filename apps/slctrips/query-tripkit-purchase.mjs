#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Look up the purchase by payment intent ID
const { data, error } = await supabase
  .from('tripkit_access_codes')
  .select('*')
  .eq('stripe_payment_intent', 'pi_3SXA1hLRKGH1pF110ueNZCrs')
  .single();

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('Found purchase:', JSON.stringify(data, null, 2));
