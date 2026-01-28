#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

const args = process.argv.slice(2);
const command = args[0];
const value = args[1];

async function checkRecentSignups(limit = 5) {
  console.log(`\n📧 Recent Email Signups (last ${limit}):\n`);
  
  const { data, error } = await supabase
    .from('email_captures')
    .select('email, source, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No signups found.');
    return;
  }
  
  data.forEach((signup, i) => {
    console.log(`${i + 1}. ${signup.email}`);
    console.log(`   Source: ${signup.source}`);
    console.log(`   Notes: ${signup.notes || 'N/A'}`);
    console.log(`   Date: ${new Date(signup.created_at).toLocaleString()}`);
    console.log('');
  });
}

async function checkConfig() {
  console.log('\n⚙️  Configuration Check:\n');
  
  console.log('Environment Variables:');
  const vars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'SENDGRID_API_KEY': process.env.SENDGRID_API_KEY,
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
    'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL
  };
  
  Object.entries(vars).forEach(([name, value]) => {
    const status = value ? '✅' : '❌';
    const display = value ? 
      (value.length > 40 ? value.slice(0, 40) + '...' : value) : 
      'NOT SET';
    console.log(`   ${status} ${name}`);
    console.log(`      ${display}`);
  });
  
  console.log('\nDatabase Connection:');
  const { data, error } = await supabase.from('tripkits').select('count').limit(1);
  
  if (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  } else {
    console.log('   ✅ Connected successfully');
  }
  
  console.log('\n');
}

async function main() {
  switch (command) {
    case '--recent-signups':
      await checkRecentSignups(parseInt(value) || 5);
      break;
    case '--check-config':
      await checkConfig();
      break;
    default:
      console.log('Usage: node test-hci-flow.mjs --check-config');
      console.log('       node test-hci-flow.mjs --recent-signups [limit]');
  }
}

main().catch(console.error);
