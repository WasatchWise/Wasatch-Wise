/**
 * Grant Admin Access to All TripKits
 * 
 * This script grants access to all TripKits for a specific user email.
 * Run with: node grant-admin-tripkit-access.mjs your-email@example.com
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantAdminAccess(email) {
  console.log(`\n🔐 Granting admin access to all TripKits for: ${email}\n`);

  // 1. Get user ID from email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('❌ Error fetching users:', userError);
    return;
  }

  const user = users.users.find(u => u.email === email);
  
  if (!user) {
    console.error(`❌ User with email ${email} not found.`);
    console.log('\nAvailable users:');
    users.users.slice(0, 10).forEach(u => {
      console.log(`  - ${u.email}`);
    });
    return;
  }

  console.log(`✅ Found user: ${user.email} (ID: ${user.id})\n`);

  // 2. Get all TripKits
  const { data: tripkits, error: tripkitsError } = await supabase
    .from('tripkits')
    .select('id, code, name, price')
    .in('status', ['active', 'freemium'])
    .order('code');

  if (tripkitsError) {
    console.error('❌ Error fetching TripKits:', tripkitsError);
    return;
  }

  console.log(`📚 Found ${tripkits.length} TripKits:\n`);

  // 3. Grant access to each TripKit
  let granted = 0;
  let skipped = 0;
  let errors = 0;

  for (const tk of tripkits) {
    // Check if access already exists
    const { data: existingAccess } = await supabase
      .from('customer_product_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', tk.id)
      .eq('product_type', 'tripkit')
      .maybeSingle();

    if (existingAccess) {
      console.log(`⏭️  ${tk.code} (${tk.name}) - Already has access`);
      skipped++;
      continue;
    }

    // Grant access
    const { error: insertError } = await supabase
      .from('customer_product_access')
      .insert({
        user_id: user.id,
        product_id: tk.id,
        product_type: 'tripkit',
        access_type: 'complimentary',
        access_granted_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error(`❌ ${tk.code} (${tk.name}) - Error:`, insertError.message);
      errors++;
    } else {
      console.log(`✅ ${tk.code} (${tk.name}) - Access granted`);
      granted++;
    }
  }

  // 4. Summary
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Granted: ${granted} TripKits`);
  console.log(`   ⏭️  Skipped: ${skipped} (already had access)`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n🎉 Admin access setup complete!\n`);
  console.log(`You can now access all TripKits at:`);
  tripkits.forEach(tk => {
    console.log(`   - /tripkits/${tk.slug}/view`);
  });
  console.log('');
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('\nUsage: node grant-admin-tripkit-access.mjs your-email@example.com\n');
  process.exit(1);
}

grantAdminAccess(email).catch(console.error);
