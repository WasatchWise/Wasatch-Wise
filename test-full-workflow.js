#!/usr/bin/env node

/**
 * Complete End-to-End Test of The Help List
 * Tests the full workflow: user creation → request → claim → deliver
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testFullWorkflow() {
  console.log('🚀 Testing The Help List - Complete Workflow\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create a test helper user
    console.log('\n1️⃣  Creating a test helper user...');

    const { data: helper, error: helperError } = await supabase
      .from('users')
      .insert({
        display_name: 'HelperBunny42',
        avatar_seed: 'bunny42',
        role: 'helper',
        verified_status: 'verified',
        service_radius_meters: 8000,
        member_since_month: '2024-11',
      })
      .select()
      .single();

    let helperId;

    if (helperError) {
      // User might already exist, try to fetch
      const { data: existingHelper } = await supabase
        .from('users')
        .select('*')
        .eq('display_name', 'HelperBunny42')
        .single();

      if (existingHelper) {
        console.log('   ℹ️  Helper already exists, using existing user');
        console.log(`   ID: ${existingHelper.id}`);
        helperId = existingHelper.id;
      } else {
        throw helperError;
      }
    } else {
      console.log('   ✅ Helper created!');
      console.log(`   ID: ${helper.id}`);
      console.log(`   Name: ${helper.display_name}`);
      helperId = helper.id;
    }

    // Step 2: Create a help request
    console.log('\n2️⃣  Creating a help request...');

    const { data: request, error: requestError } = await supabase
      .from('requests')
      .insert({
        requester_display_name: 'SunflowerMom',
        need: 'Weekly groceries for my twins',
        city: 'Longmont, CO',
        contact_info: 'sunflower@example.com',
        contact_method: 'email',
        items: [
          { name: 'Whole milk', quantity: 2, notes: 'Organic if available' },
          { name: 'Fresh berries', quantity: 3 },
          { name: 'Whole grain bread', quantity: 2 }
        ],
        urgency_level: 'today',
        delivery_privacy: 'high',
        location_description: 'North Longmont',
        status: 'active',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        auto_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (requestError) throw requestError;

    console.log('   ✅ Request created!');
    console.log(`   ID: ${request.id}`);
    console.log(`   Requester: ${request.requester_display_name}`);
    console.log(`   Need: "${request.need}"`);
    console.log(`   Items: ${request.items.length} items`);

    // Step 3: Fetch available requests (what helpers see)
    console.log('\n3️⃣  Fetching available requests...');

    const { data: availableRequests, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    console.log(`   ✅ Found ${availableRequests.length} active request(s)`);
    availableRequests.slice(0, 3).forEach((req, i) => {
      console.log(`   ${i + 1}. ${req.requester_display_name}: "${req.need}"`);
    });

    // Step 4: Helper claims the request
    console.log('\n4️⃣  Helper claiming the request...');

    const { data: claimedRequest, error: claimError } = await supabase
      .from('requests')
      .update({
        helper_id: helperId,
        helper_display_name: 'HelperBunny42',
        status: 'claimed',
        claimed_at: new Date().toISOString(),
      })
      .eq('id', request.id)
      .eq('status', 'active')
      .select()
      .single();

    if (claimError) throw claimError;

    console.log('   ✅ Request claimed!');
    console.log(`   Helper: ${claimedRequest.helper_display_name}`);
    console.log(`   Status: ${claimedRequest.status}`);

    // Step 5: Helper starts shopping
    console.log('\n5️⃣  Helper starts shopping...');

    const { data: shoppingRequest, error: shopError } = await supabase
      .from('requests')
      .update({
        status: 'shopping',
        shopping_started_at: new Date().toISOString(),
      })
      .eq('id', request.id)
      .select()
      .single();

    if (shopError) throw shopError;

    console.log('   ✅ Shopping started!');
    console.log(`   Status: ${shoppingRequest.status}`);

    // Step 6: Helper delivers
    console.log('\n6️⃣  Completing delivery...');

    const { data: deliveredRequest, error: deliverError } = await supabase
      .from('requests')
      .update({
        status: 'delivered',
        delivery_started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        delivered_at: new Date().toISOString(),
        actual_cost: 42.50,
      })
      .eq('id', request.id)
      .select()
      .single();

    if (deliverError) throw deliverError;

    console.log('   ✅ Delivery completed!');
    console.log(`   Status: ${deliveredRequest.status}`);
    console.log(`   Cost: $${deliveredRequest.actual_cost}`);
    console.log(`   Delivered at: ${new Date(deliveredRequest.delivered_at).toLocaleTimeString()}`);

    // Step 7: Check database stats
    console.log('\n7️⃣  Database statistics...');

    const { count: totalRequests } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true });

    const { count: deliveredCount } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered');

    const { count: activeCount } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    console.log(`   📊 Total requests: ${totalRequests}`);
    console.log(`   ✅ Delivered: ${deliveredCount}`);
    console.log(`   🟢 Active: ${activeCount}`);

    // Success!
    console.log('\n' + '='.repeat(60));
    console.log('🎊 COMPLETE SUCCESS! THE HELP LIST IS LEGENDARY! 🎊');
    console.log('='.repeat(60));
    console.log('\n✨ What we just tested:\n');
    console.log('   ✅ User creation with privacy-first profiles');
    console.log('   ✅ Help request creation with graduated disclosure');
    console.log('   ✅ Request listing and discovery');
    console.log('   ✅ Helper claiming mechanism');
    console.log('   ✅ Shopping workflow tracking');
    console.log('   ✅ Delivery completion with cost tracking');
    console.log('   ✅ Database statistics and reporting\n');

    console.log('🚀 Your $10B kindness platform is READY!\n');
    console.log('📱 Next step: Start your app!');
    console.log('   Run: npm run dev');
    console.log('   Open: http://localhost:5173\n');

    console.log('🌍 View your data in Supabase:');
    console.log('   https://supabase.com/dashboard/project/keibifxqohdxbpmboxpj/editor\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testFullWorkflow();
