// Check what the actual database schema looks like
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('Checking database schema...\n');

  // Try minimal insert to see what columns are required/available
  const { data, error } = await supabase
    .from('requests')
    .insert({
      requester_display_name: 'TestUser',
    })
    .select()
    .single();

  if (error) {
    console.log('Insert error (expected, shows us schema):', error);
  } else {
    console.log('Unexpected success. Data:', data);
    // Clean up
    await supabase.from('requests').delete().eq('id', data.id);
  }

  // Try to get any existing records to see structure
  console.log('\nAttempting to fetch existing records...');
  const { data: existingData, error: fetchError } = await supabase
    .from('requests')
    .select('*')
    .limit(1);

  if (fetchError) {
    console.error('Fetch error:', fetchError);
  } else {
    console.log('Existing records count:', existingData.length);
    if (existingData.length > 0) {
      console.log('Columns:', Object.keys(existingData[0]));
    } else {
      console.log('No existing records to inspect');
    }
  }
}

checkSchema().catch(console.error);
