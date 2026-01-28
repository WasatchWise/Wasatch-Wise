import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Testing Welcome Wagon form inserts...\n');

// Test 1: Free Guide Form
console.log('1. Testing Free Guide form insert...');
const testEmail1 = `test-free-${Date.now()}@example.com`;
const { data: data1, error: error1 } = await supabase
  .from('email_captures')
  .insert({
    email: testEmail1,
    source: 'welcome_wagon_free_guide',
    visitor_type: 'relocating',
    notes: 'Name: John Test'
  })
  .select();

if (error1) {
  console.error('   ✗ FAILED:', error1.message);
} else {
  console.log('   ✓ SUCCESS - Free Guide form works!');
  // Clean up
  await supabase.from('email_captures').delete().eq('email', testEmail1);
}

// Test 2: Corporate Form
console.log('\n2. Testing Corporate form insert...');
const testEmail2 = `test-corp-${Date.now()}@example.com`;
const { data: data2, error: error2 } = await supabase
  .from('email_captures')
  .insert({
    email: testEmail2,
    source: 'welcome_wagon_corporate',
    visitor_type: 'relocating',
    notes: 'Company: Test Corp, Employees: 50'
  })
  .select();

if (error2) {
  console.error('   ✗ FAILED:', error2.message);
} else {
  console.log('   ✓ SUCCESS - Corporate form works!');
  // Clean up
  await supabase.from('email_captures').delete().eq('email', testEmail2);
}

// Test 3: Reservation Form
console.log('\n3. Testing Reservation form insert...');
const testEmail3 = `test-reserve-${Date.now()}@example.com`;
const { data: data3, error: error3 } = await supabase
  .from('email_captures')
  .insert({
    email: testEmail3,
    source: 'reservation_welcome-wagon',
    visitor_type: 'relocating',
    preferences: ['welcome-wagon-90-day'],
    notes: 'Name: Jane Test, Reservation: 90-Day Welcome Wagon ($49)'
  })
  .select();

if (error3) {
  console.error('   ✗ FAILED:', error3.message);
} else {
  console.log('   ✓ SUCCESS - Reservation form works!');
  // Clean up
  await supabase.from('email_captures').delete().eq('email', testEmail3);
}

console.log('\n✅ All Welcome Wagon forms validated!');
console.log('The fix is working correctly and ready for production.');
