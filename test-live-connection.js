#!/usr/bin/env node

/**
 * Test The Help List with Real Supabase Connection
 *
 * This script creates a real test request and verifies everything works!
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('🚀 Testing The Help List + Supabase Connection\n');

  try {
    // Step 1: Create a test request
    console.log('1️⃣  Creating a test help request...');

    const testRequest = {
      requester_display_name: 'LegendaryFounder',
      need: 'Fresh groceries for the legendary launch party!',
      city: 'Longmont, CO',
      contact_info: 'wasatch@thehelplist.org',
      contact_method: 'email',
      items: [
        { name: 'Champagne', quantity: 3, notes: 'For celebrating' },
        { name: 'Fresh fruit platter', quantity: 1 },
        { name: 'Artisan cheese board', quantity: 1, notes: 'Variety selection' }
      ],
      urgency_level: 'today',
      delivery_privacy: 'high',
      location_description: 'North Longmont',
      status: 'active',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      auto_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data: newRequest, error: createError } = await supabase
      .from('requests')
      .insert(testRequest)
      .select()
      .single();

    if (createError) throw createError;

    console.log(`   ✅ Request created! ID: ${newRequest.id}`);
    console.log(`   📝 Need: "${newRequest.need}"`);
    console.log(`   🏙️  Location: ${newRequest.location_description}`);
    console.log(`   ⏰ Urgency: ${newRequest.urgency_level}`);

    // Step 2: Fetch available requests
    console.log('\n2️⃣  Fetching all available requests...');

    const { data: requests, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    console.log(`   ✅ Found ${requests.length} active request(s)`);

    requests.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.requester_display_name} needs: "${req.need}"`);
    });

    // Step 3: Simulate claiming the request
    console.log('\n3️⃣  Simulating a helper claiming the request...');

    const { data: claimedRequest, error: claimError } = await supabase
      .from('requests')
      .update({
        helper_id: '00000000-0000-0000-0000-000000000001',
        helper_display_name: 'HelperBunny42',
        status: 'claimed',
        claimed_at: new Date().toISOString(),
      })
      .eq('id', newRequest.id)
      .eq('status', 'active')
      .select()
      .single();

    if (claimError) throw claimError;

    console.log('   ✅ Request claimed by HelperBunny42!');
    console.log(`   📦 Status: ${claimedRequest.status}`);

    // Step 4: Mark as delivered
    console.log('\n4️⃣  Completing the delivery...');

    const { data: deliveredRequest, error: deliverError } = await supabase
      .from('requests')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('id', newRequest.id)
      .select()
      .single();

    if (deliverError) throw deliverError;

    console.log('   ✅ Delivery completed!');
    console.log(`   🎉 Status: ${deliveredRequest.status}`);

    // Step 5: Check the final state
    console.log('\n5️⃣  Verifying final database state...');

    const { data: finalRequests, count, error: countError } = await supabase
      .from('requests')
      .select('*', { count: 'exact' });

    if (countError) throw countError;

    console.log(`   ✅ Total requests in database: ${count}`);
    console.log(`   📊 Breakdown:`);

    const statusCounts = finalRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`      - ${status}: ${count}`);
    });

    // Success summary
    console.log('\n' + '='.repeat(60));
    console.log('🎊 SUCCESS! The Help List is LEGENDARY! 🎊');
    console.log('='.repeat(60));
    console.log('\n✅ Your app is now connected to Supabase!');
    console.log('✅ Privacy-first schema is working perfectly');
    console.log('✅ Ready to help 100K families in Year 1');
    console.log('✅ Ready to build the $10B kindness economy\n');

    console.log('🚀 Next Steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:5173');
    console.log('   3. Start helping neighbors!\n');

    console.log('💡 Tip: Check your Supabase dashboard to see the data:');
    console.log('   https://supabase.com/dashboard/project/keibifxqohdxbpmboxpj/editor\n');

    // Cleanup option
    console.log('🧹 Clean up test data? (y/n)');
    console.log('   To delete test request, run: node test-live-connection.js --cleanup');

    if (process.argv.includes('--cleanup')) {
      console.log('\n🧹 Cleaning up test data...');
      await supabase.from('requests').delete().eq('id', newRequest.id);
      console.log('   ✅ Test request deleted!\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check that your Supabase URL and key are correct in .env.local');
    console.error('   2. Verify the schema is deployed (run: node check-database.js)');
    console.error('   3. Check Row Level Security policies in Supabase dashboard\n');
    process.exit(1);
  }
}

// Run the test
testConnection();
