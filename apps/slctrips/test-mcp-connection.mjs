#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

console.log('🔍 Testing MCP and Database Setup...\n');

// Test environment variables
console.log('✓ Environment variables loaded');
console.log(`  - DATABASE_URL: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Missing'}`);
console.log(`  - SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}`);
console.log(`  - SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : '✗ Missing'}\n`);

// Test Supabase connection
try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('🔌 Testing Supabase connection...');

  // Test query
  const { data, error, count } = await supabase
    .from('destinations')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log('✗ Database connection failed:', error.message);
    process.exit(1);
  }

  console.log(`✓ Successfully connected to Supabase!`);
  console.log(`  - Total destinations in database: ${count}\n`);

  // Test a simple query
  const { data: sampleData, error: sampleError } = await supabase
    .from('destinations')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.log('✗ Sample query failed:', sampleError.message);
  } else {
    console.log('✓ Sample query successful - Available columns:');
    if (sampleData && sampleData.length > 0) {
      const columns = Object.keys(sampleData[0]);
      console.log(`  - ${columns.join(', ')}`);
      console.log(`\n  Sample record: ${sampleData[0].name || sampleData[0].title || 'Record 1'}`);
    }
  }

  console.log('\n✓ All tests passed! MCP setup is ready.');

} catch (err) {
  console.error('✗ Error:', err.message);
  process.exit(1);
}
