import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: './slctrips-v2/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking for recent Welcome Wagon submissions...\n');

const { data, error } = await supabase
  .from('email_captures')
  .select('*')
  .eq('source', 'welcome_wagon_free_guide')
  .order('created_at', { ascending: false })
  .limit(10);

if (error) {
  console.error('❌ Error:', error);
} else {
  if (data.length === 0) {
    console.log('📭 No Welcome Wagon submissions found yet.');
  } else {
    console.log(`📬 Found ${data.length} recent submission(s):\n`);
    data.forEach((submission, i) => {
      console.log(`${i + 1}. Email: ${submission.email}`);
      console.log(`   Notes: ${submission.notes || 'N/A'}`);
      console.log(`   Created: ${new Date(submission.created_at).toLocaleString()}`);
      console.log('');
    });
  }
}
