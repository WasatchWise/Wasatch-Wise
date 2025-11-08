#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Try to insert a minimal request to see what columns are available
async function inspectSchema() {
  console.log('🔍 Inspecting requests table schema...\n');

  // Try with minimal fields
  const { data, error } = await supabase
    .from('requests')
    .insert({
      requester_display_name: 'SchemaTest',
      items: [],
    })
    .select()
    .single();

  if (error) {
    console.log('Error (this helps us see required fields):');
    console.log(error);

    if (error.message.includes('violates check constraint')) {
      console.log('\n💡 The items array cannot be empty. Let me try with actual items...\n');

      const { data: data2, error: error2 } = await supabase
        .from('requests')
        .insert({
          requester_display_name: 'SchemaTest',
          items: [{name: 'Test', quantity: 1}],
        })
        .select()
        .single();

      if (error2) {
        console.log('Still erroring:', error2.message);
      } else {
        console.log('✅ Success! Here are all the columns:');
        console.log(Object.keys(data2).sort());

        // Clean up
        await supabase.from('requests').delete().eq('id', data2.id);
        console.log('\n✅ Cleaned up test record');
      }
    }
  } else {
    console.log('✅ Success! Here are all the columns:');
    console.log(Object.keys(data).sort());

    // Clean up
    await supabase.from('requests').delete().eq('id', data.id);
    console.log('\n✅ Cleaned up test record');
  }
}

inspectSchema();
