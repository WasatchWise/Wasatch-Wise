import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Fixing TripKit destination counts...\n');

// Fix TK-014
const tk014Result = await supabase
  .from('tripkits')
  .update({ destination_count: 94 })
  .eq('code', 'TK-014')
  .select();

if (tk014Result.error) {
  console.error('Error updating TK-014:', tk014Result.error);
} else {
  console.log('✓ Updated TK-014: 95 → 94');
}

// Fix TK-045
const tk045Result = await supabase
  .from('tripkits')
  .update({ destination_count: 25 })
  .eq('code', 'TK-045')
  .select();

if (tk045Result.error) {
  console.error('Error updating TK-045:', tk045Result.error);
} else {
  console.log('✓ Updated TK-045: 250 → 25');
  console.log('\n⚠️  NOTE: TK-045 is named "250 Under $25" but only has 25 destinations.');
  console.log('   Consider either:');
  console.log('   1. Adding 225 more destinations');
  console.log('   2. Renaming the product to match the actual count');
  console.log('   3. Implementing admission_fee filtering to find suitable destinations');
}

console.log('\n✓ Destination counts fixed!');
