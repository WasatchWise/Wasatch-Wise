// Quick test script to verify Supabase connection and check schema
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...\n');

  // Test 1: Check requests table
  console.log('1. Checking requests table...');
  const { data: requests, error: requestsError } = await supabase
    .from('requests')
    .select('*')
    .limit(5);

  if (requestsError) {
    console.error('Error fetching requests:', requestsError.message);
    console.error('Details:', requestsError);
  } else {
    console.log(`✓ Found ${requests.length} requests`);
    if (requests.length > 0) {
      console.log('Sample request structure:', Object.keys(requests[0]));
    }
  }

  // Test 2: Try to create a test request
  console.log('\n2. Testing request creation...');
  const testRequest = {
    requester_display_name: 'TestUser123',
    need: 'Test groceries',
    city: 'Test City',
    contact_info: 'test@test.com',
    contact_method: 'email',
    items: [{ name: 'Test Item', quantity: 1, notes: 'Test' }],
    urgency_level: 'today',
    delivery_privacy: 'high',
    location_description: 'Test City',
    status: 'active',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    auto_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const { data: newRequest, error: createError } = await supabase
    .from('requests')
    .insert(testRequest)
    .select()
    .single();

  if (createError) {
    console.error('Error creating request:', createError.message);
    console.error('Details:', createError);
  } else {
    console.log('✓ Successfully created test request:', newRequest.id);

    // Clean up - delete the test request
    await supabase.from('requests').delete().eq('id', newRequest.id);
    console.log('✓ Cleaned up test request');
  }

  console.log('\n=== Connection test complete ===');
}

testConnection().catch(console.error);
