import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 Production Readiness Check\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let passCount = 0;
let failCount = 0;

const test = async (name, fn) => {
  process.stdout.write(`${name}... `);
  try {
    await fn();
    console.log('✅');
    passCount++;
  } catch (err) {
    console.log('❌');
    console.log(`   Error: ${err.message}\n`);
    failCount++;
  }
};

// ============================================================================
// CRITICAL FIXES VALIDATION
// ============================================================================

console.log('📋 Critical Fixes Validation\n');

await test('1. Welcome Wagon Free Guide schema', async () => {
  const testEmail = `test-free-${Date.now()}@example.com`;
  const { error } = await supabase
    .from('email_captures')
    .insert({
      email: testEmail,
      source: 'welcome_wagon_free_guide',
      visitor_type: 'relocating',
      notes: 'Name: Test User'
    });

  if (error) throw new Error(error.message);
  await supabase.from('email_captures').delete().eq('email', testEmail);
});

await test('2. Welcome Wagon Corporate schema', async () => {
  const testEmail = `test-corp-${Date.now()}@example.com`;
  const { error } = await supabase
    .from('email_captures')
    .insert({
      email: testEmail,
      source: 'welcome_wagon_corporate',
      visitor_type: 'relocating',
      notes: 'Company: Test Corp, Employees: 50'
    });

  if (error) throw new Error(error.message);
  await supabase.from('email_captures').delete().eq('email', testEmail);
});

await test('3. Welcome Wagon Reservation schema', async () => {
  const testEmail = `test-reserve-${Date.now()}@example.com`;
  const { error } = await supabase
    .from('email_captures')
    .insert({
      email: testEmail,
      source: 'reservation_welcome-wagon',
      visitor_type: 'relocating',
      preferences: ['welcome-wagon-90-day'],
      notes: 'Name: Test User, Reservation: 90-Day Welcome Wagon ($49)'
    });

  if (error) throw new Error(error.message);
  await supabase.from('email_captures').delete().eq('email', testEmail);
});

await test('4. Deep Dive stories query format', async () => {
  // Test that we can query with OR for both TK- and TKE- formats
  const tkCode = 'TK-002';
  const tkeCode = 'TKE-002';
  const { error } = await supabase
    .from('deep_dive_stories')
    .select('id, title, tripkit_id')
    .or(`tripkit_id.eq.${tkCode},tripkit_id.eq.${tkeCode}`)
    .limit(1);

  if (error) throw new Error(error.message);
});

await test('5. TK-014 destination count accuracy', async () => {
  const { data: tk } = await supabase
    .from('tripkits')
    .select('destination_count')
    .eq('code', 'TK-014')
    .single();

  if (tk.destination_count !== 94) {
    throw new Error(`Expected 94, got ${tk.destination_count}`);
  }
});

await test('6. TK-045 destination count accuracy', async () => {
  const { data: tk } = await supabase
    .from('tripkits')
    .select('destination_count')
    .eq('code', 'TK-045')
    .single();

  if (tk.destination_count !== 25) {
    throw new Error(`Expected 25, got ${tk.destination_count}`);
  }
});

// ============================================================================
// STRIPE WEBHOOK READINESS
// ============================================================================

console.log('\n💳 Stripe Webhook Readiness\n');

await test('7. customer_product_access table exists', async () => {
  const { error } = await supabase
    .from('customer_product_access')
    .select('*')
    .limit(0);

  if (error) throw new Error('Table does not exist - run DEPLOY_CUSTOMER_ACCESS_TABLE.md SQL');
});

await test('8. Webhook can grant access', async () => {
  const testEmail = `test-access-${Date.now()}@example.com`;
  const { data, error } = await supabase
    .from('customer_product_access')
    .insert({
      customer_email: testEmail,
      product_type: 'welcome-wagon',
      product_id: 'welcome-wagon-90-day',
    })
    .select();

  if (error) throw new Error(error.message);
  await supabase.from('customer_product_access').delete().eq('customer_email', testEmail);
});

await test('9. Purchases table ready', async () => {
  const { error } = await supabase
    .from('purchases')
    .select('*')
    .limit(1);

  if (error) throw new Error(error.message);
});

await test('10. TripKit access codes table ready', async () => {
  const { error } = await supabase
    .from('tripkit_access_codes')
    .select('*')
    .limit(1);

  if (error) throw new Error(error.message);
});

// ============================================================================
// DATA INTEGRITY
// ============================================================================

console.log('\n📊 Data Integrity\n');

await test('11. Active TripKits have valid data', async () => {
  const { data, error } = await supabase
    .from('tripkits')
    .select('code, name, destination_count, price')
    .in('status', ['active', 'freemium']);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No active TripKits found');

  // Check for null/invalid prices
  const invalidPrices = data.filter(tk => tk.price == null || tk.price < 0);
  if (invalidPrices.length > 0) {
    throw new Error(`${invalidPrices.length} TripKits have invalid prices`);
  }
});

await test('12. Email captures table accessible', async () => {
  const { data, error } = await supabase
    .from('email_captures')
    .select('count')
    .limit(1);

  if (error) throw new Error(error.message);
});

await test('13. Public destinations table accessible', async () => {
  const { data, error } = await supabase
    .from('public_destinations')
    .select('count')
    .limit(1);

  if (error) throw new Error(error.message);
});

// ============================================================================
// ENVIRONMENT CHECKS
// ============================================================================

console.log('\n🔐 Environment Configuration\n');

await test('14. NEXT_PUBLIC_SUPABASE_URL set', async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
});

await test('15. SUPABASE_SERVICE_ROLE_KEY set', async () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
});

await test('16. STRIPE_SECRET_KEY set', async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }
});

await test('17. STRIPE_WEBHOOK_SECRET set', async () => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET (needed for webhook verification)');
  }
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Results: ${passCount} passed, ${failCount} failed`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (failCount === 0) {
  console.log('🎉 ALL SYSTEMS GO!\n');
  console.log('Production readiness: ✅ READY\n');
  console.log('You can now:');
  console.log('  ✅ Accept Welcome Wagon form submissions');
  console.log('  ✅ Process Stripe payments for TripKits');
  console.log('  ✅ Handle Welcome Wagon purchases');
  console.log('  ✅ Grant product access via webhooks\n');
  console.log('⚠️  Remaining tasks:');
  console.log('  • Test live form submission on www.slctrips.com');
  console.log('  • Test Stripe checkout in test mode');
  console.log('  • Decide on TK-045 positioning (250 vs 25)\n');
} else {
  console.log('⚠️  ISSUES DETECTED\n');
  console.log('Please address the failed checks above before going live.');
  console.log('Most common issue: customer_product_access table not deployed yet.\n');
  console.log('Run: DEPLOY_CUSTOMER_ACCESS_TABLE.md SQL in Supabase\n');
  process.exit(1);
}
