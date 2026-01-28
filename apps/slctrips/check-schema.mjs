#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Get one row to see the schema
const { data, error } = await supabase
  .from('purchases')
  .select('*')
  .limit(1);

if (error) {
  console.error('Error:', error);
} else if (data && data.length > 0) {
  console.log('Purchases table columns:', Object.keys(data[0]));
  console.log('\nSample record:', JSON.stringify(data[0], null, 2));
} else {
  console.log('No records in purchases table');
}

// Also check tripkit_access_codes
const { data: accessData } = await supabase
  .from('tripkit_access_codes')
  .select('*')
  .eq('customer_email', 'admin@wasatchwise.com')
  .limit(1);

if (accessData && accessData.length > 0) {
  console.log('\n\nTripKit Access Codes columns:', Object.keys(accessData[0]));
  console.log('Sample record:', JSON.stringify(accessData[0], null, 2));
}
