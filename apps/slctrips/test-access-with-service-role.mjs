#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const userId = '201e804d-2672-4679-a70c-cb6d1d2cb4f8';
const tripkitId = 'e77ddd05-2607-42a0-bc03-c766f4f43e40'; // TK-002

console.log('Testing access query with service role key...\n');

const { data, error } = await supabase
  .from('customer_product_access')
  .select('id')
  .eq('user_id', userId)
  .eq('product_id', tripkitId)
  .eq('product_type', 'tripkit')
  .single();

console.log('Query result:');
console.log('Data:', data);
console.log('Error:', error);

if (data) {
  console.log('\n✅ Access record found! User should have access.');
} else {
  console.log('\n❌ No access record found or query failed.');
}
