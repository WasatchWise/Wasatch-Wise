#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const userId = '201e804d-2672-4679-a70c-cb6d1d2cb4f8';

console.log('Checking access records for user:', userId);
console.log('');

// Get all access records for this user
const { data: accessRecords, error } = await supabase
  .from('customer_product_access')
  .select('*')
  .eq('user_id', userId);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Found ${accessRecords?.length || 0} access records:`);
console.log('');

for (const record of accessRecords || []) {
  console.log('---');
  console.log('Product ID:', record.product_id);
  console.log('Product Type:', record.product_type);
  console.log('Access Type:', record.access_type);

  // Get the TripKit details
  const { data: tripkit } = await supabase
    .from('tripkits')
    .select('code, name, slug')
    .eq('id', record.product_id)
    .single();

  if (tripkit) {
    console.log('TripKit:', tripkit.code, '-', tripkit.name);
    console.log('Slug:', tripkit.slug);
  }
  console.log('');
}
