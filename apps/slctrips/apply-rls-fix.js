// Apply the RLS fix migration directly to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function applyMigration() {
  console.log('Reading migration file...');
  const migrationPath = path.join(__dirname, 'supabase/migrations/20251028_fix_destinations_rls.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Applying RLS fix to Supabase...\n');

  try {
    // Execute the SQL migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error applying migration:', error.message);
      console.error('Details:', error);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('');

    // Test by fetching destinations
    console.log('Testing: Fetching destinations...');
    const { data: destinations, error: testError } = await supabase
      .from('destinations')
      .select('id, name, slug')
      .limit(5);

    if (testError) {
      console.error('❌ Test failed:', testError.message);
    } else {
      console.log(`✅ Successfully fetched ${destinations?.length || 0} destinations`);
      if (destinations && destinations.length > 0) {
        console.log('\nSample destinations:');
        destinations.forEach(d => console.log(`  - ${d.name} (${d.slug})`));
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

applyMigration();
