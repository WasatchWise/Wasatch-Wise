import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Creating customer_product_access table...\n');

// Create the table using Supabase REST API
// Note: Ideally this would be done through Supabase Dashboard or migrations,
// but for quick setup we can try via RPC if a create function exists

// First, check if table already exists
const { data: existingData, error: checkError } = await supabase
  .from('customer_product_access')
  .select('*')
  .limit(1);

if (!checkError) {
  console.log('✓ Table customer_product_access already exists!');
  console.log('Sample columns:', existingData && existingData[0] ? Object.keys(existingData[0]) : 'No data yet');
} else if (checkError.code === '42P01') {
  console.log('Table does not exist. Creating via SQL...\n');

  // Since we can't create tables directly via the JS client without a custom RPC function,
  // let's provide the SQL statement that needs to be run in Supabase SQL Editor
  console.log('Please run the following SQL in your Supabase SQL Editor:\n');
  console.log('---START SQL---');
  console.log(`
CREATE TABLE IF NOT EXISTS customer_product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  purchase_id UUID REFERENCES purchases(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on customer_email for fast lookups
CREATE INDEX IF NOT EXISTS idx_customer_product_access_email
  ON customer_product_access(customer_email);

-- Create index on product_type and product_id
CREATE INDEX IF NOT EXISTS idx_customer_product_access_product
  ON customer_product_access(product_type, product_id);

-- Enable RLS
ALTER TABLE customer_product_access ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access"
  ON customer_product_access
  FOR ALL
  TO service_role
  USING (true);

-- Create policy to allow authenticated users to see their own access
CREATE POLICY "Users can view their own access"
  ON customer_product_access
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.email());
  `);
  console.log('---END SQL---\n');

  console.log('After running the SQL, the Stripe webhook will be able to grant access to purchased products.');
} else {
  console.error('Error checking table:', checkError);
}
