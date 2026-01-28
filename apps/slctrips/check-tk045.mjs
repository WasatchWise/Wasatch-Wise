import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get TK-045 ID
const { data: tk } = await supabase
  .from('tripkits')
  .select('id, code, name, description')
  .eq('code', 'TK-045')
  .single();

console.log(`TK-045: ${tk.name}`);
console.log(`Description: ${tk.description}\n`);

// Get destinations in TK-045
const { data: junctions } = await supabase
  .from('tripkit_destinations')
  .select('destination_id')
  .eq('tripkit_id', tk.id);

console.log(`Current destinations: ${junctions.length}`);

// Get actual destination details
if (junctions.length > 0) {
  const ids = junctions.map(j => j.destination_id);
  const { data: destinations } = await supabase
    .from('public_destinations')
    .select('codename, display_name, admission_fee')
    .in('id', ids);

  console.log('\nSample destinations:');
  destinations?.slice(0, 10).forEach(d => {
    console.log(`  - ${d.display_name} (${d.codename}): Fee $${d.admission_fee || 0}`);
  });
}

// Check how many destinations in total database could be "under $25"
const { data: allCheap } = await supabase
  .from('public_destinations')
  .select('id', { count: 'exact' })
  .or('admission_fee.eq.0,admission_fee.lt.25,admission_fee.is.null');

const cheapCount = allCheap?.length || 0;
console.log(`\nTotal destinations with admission under $25 in database: ${cheapCount}`);
