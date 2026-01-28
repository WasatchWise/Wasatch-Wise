// Test if guardians can be queried from the client
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mkepcjzqnbowrgbvjfem.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGuardiansQuery() {
  console.log('Testing guardians query...\n');

  const { data, error } = await supabase
    .from('guardians')
    .select('*');

  if (error) {
    console.error('❌ Error querying guardians:');
    console.error(error);
    return;
  }

  if (!data) {
    console.log('⚠️  Query succeeded but returned no data');
    return;
  }

  console.log(`✅ Successfully fetched ${data.length} guardians`);
  console.log('\nFirst 3 guardians:');
  data.slice(0, 3).forEach(g => {
    console.log(`  - ${g.display_name} (${g.county})`);
  });
}

testGuardiansQuery().catch(console.error);
