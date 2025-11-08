#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDatabase() {
  console.log('🔍 Checking database status...\n');

  // Check different tables
  const tables = ['users', 'requests', 'messages', 'helper_verifications'];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        console.log(`❌ ${table}: Table doesn't exist yet`);
      } else {
        console.log(`⚠️  ${table}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${table}: Table exists (${count || 0} rows)`);
    }
  }

  console.log('\n📊 Summary:');
  console.log('If you see "Table doesn\'t exist", deploy the schema from the dashboard.');
  console.log('If tables exist, you\'re ready to test!');
}

checkDatabase();
