#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Check purchases table
const { data, error } = await supabase
  .from('purchases')
  .select('*')
  .eq('stripe_payment_intent', 'pi_3SXA1hLRKGH1pF110ueNZCrs');

if (error) {
  console.error('Error:', error);
} else if (data && data.length > 0) {
  console.log('Found purchase:', JSON.stringify(data, null, 2));
} else {
  console.log('No purchase found in purchases table');
  
  // Try customer_email
  console.log('\nSearching by email: admin@wasatchwise.com');
  const { data: byEmail } = await supabase
    .from('purchases')
    .select('*')
    .eq('customer_email', 'admin@wasatchwise.com')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (byEmail && byEmail.length > 0) {
    console.log('Found purchases by email:', JSON.stringify(byEmail, null, 2));
  }
}
