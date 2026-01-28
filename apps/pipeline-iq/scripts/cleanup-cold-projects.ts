
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log("🧹 Cleaning up 'Cold' Projects...\n");

    // 1. Double check count
    const { count, error: countError } = await supabase
        .from('high_priority_projects')
        .select('*', { count: 'exact', head: true })
        .eq('priority_level', 'cold');

    if (countError) {
        console.error("Error counting:", countError);
        return;
    }

    console.log(`Found ${count} projects marked as 'cold'. in priority_level`);

    if (!count || count === 0) {
        console.log("Nothing to delete.");
        return;
    }

    // 2. Delete
    const { error: deleteError, count: deletedCount } = await supabase
        .from('high_priority_projects')
        .delete({ count: 'exact' }) // Request count of deleted rows
        .eq('priority_level', 'cold');

    if (deleteError) {
        console.error("❌ Error deleting:", deleteError);
    } else {
        console.log(`✅ Successfully deleted 'cold' projects.`);
        // Note: Supabase delete response doesn't always return count depending on version/headers, 
        // but if no error, we assume success based on previous count.
    }

}

cleanup().catch(console.error);
