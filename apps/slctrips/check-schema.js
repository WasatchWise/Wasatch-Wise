// Check what columns exist in destinations table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('Checking destinations table schema...\n');

  // Try to get one row to see what columns exist
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in destinations table:');
    console.log(Object.keys(data[0]).join(', '));
    console.log('\nFirst destination:', data[0].name);
  } else {
    console.log('No destinations found');
  }

  // Also check count
  const { count } = await supabase
    .from('destinations')
    .select('*', { count: 'exact', head: true });

  console.log('\nTotal destinations:', count);
}

checkSchema().catch(console.error);
