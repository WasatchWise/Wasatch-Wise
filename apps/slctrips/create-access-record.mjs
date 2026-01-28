#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Creating customer_product_access record...\n');

const { data, error } = await supabase
  .from('customer_product_access')
  .insert({
    user_id: '201e804d-2672-4679-a70c-cb6d1d2cb4f8',
    product_id: '30ef5541-ca1b-4d2b-88f8-f107003d3292',
    product_type: 'tripkit',
    access_type: 'complimentary',
    access_granted_at: '2025-10-29T22:21:06.196957+00:00',
    created_at: '2025-10-29T22:21:06.196957+00:00'
  })
  .select();

if (error) {
  if (error.code === '23505') {
    console.log('✓ Access record already exists (duplicate key)');
  } else {
    console.error('❌ Error creating access record:', error);
    process.exit(1);
  }
} else {
  console.log('✅ Successfully created access record!');
  console.log('Record:', JSON.stringify(data, null, 2));
}
