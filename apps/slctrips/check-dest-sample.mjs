import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data } = await supabase
  .from('public_destinations')
  .select('*')
  .limit(2);

console.log('Sample destination columns:');
if (data && data[0]) {
  console.log(Object.keys(data[0]).join(', '));
  console.log('\nSample row:');
  console.log(JSON.stringify(data[0], null, 2));
}
