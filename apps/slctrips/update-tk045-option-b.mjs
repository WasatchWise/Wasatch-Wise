import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 Updating TK-045 with Option B: Growth Positioning\n');

// Option B: Growth Story copy
const updates = {
  tagline: 'Growing to 250 curated budget adventures - launching with 25 hand-verified picks',
  value_proposition: 'Join the journey to 250! Starting with 25 verified destinations, new additions weekly. Lock in founder pricing.',
  description: `The ultimate budget adventure guide for the Mountain West - launching with 25 handpicked experiences, growing weekly to 250.

We're starting with quality over quantity: 25 destinations that have been personally visited, verified, and vetted by our team. Each one delivers exceptional value at under $25.

✅ All 25 destinations personally verified
✅ Under $25 (many free!)
✅ New destinations added every week
✅ Lifetime access - no subscriptions
✅ Growing to 250 by Spring 2026
✅ Founder pricing locked forever

Purchase now to lock in early pricing and get automatic access to all future destinations at no extra charge. Watch your collection grow from 25 to 250 as we add 4-5 new verified adventures every week.

Filter by region, price, season, and activity type to find your next budget-friendly adventure.`
};

const { data, error } = await supabase
  .from('tripkits')
  .update(updates)
  .eq('code', 'TK-045')
  .select();

if (error) {
  console.error('❌ Failed to update:', error.message);
  process.exit(1);
}

console.log('✅ TK-045 updated successfully!\n');
console.log('Changes applied:');
console.log('─────────────────────────────────────');
console.log('Tagline:', updates.tagline);
console.log('\nValue Prop:', updates.value_proposition);
console.log('\nDescription updated ✓');
console.log('\n✅ Database updated. Ready for UI changes.');
