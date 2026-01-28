import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value.trim().replace(/"/g, '');
            if (key.trim() === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = value.trim().replace(/"/g, '');
        }
    });
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTK000() {
    // 1. Get TK-000 ID
    const { data: tk, error: tkError } = await supabase
        .from('tripkits')
        .select('id, name, code')
        .eq('code', 'TK-000')
        .single();

    if (tkError) {
        console.error('Error fetching TK-000:', tkError);
        return;
    }

    console.log('Found TK-000:', tk);

    // 2. Get destinations count for TK-000
    const { count: tkCount, error: countError } = await supabase
        .from('tripkit_destinations')
        .select('*', { count: 'exact', head: true })
        .eq('tripkit_id', tk.id);

    if (countError) {
        console.error('Error counting TK destinations:', countError);
        return;
    }

    console.log(`TK-000 has ${tkCount} destinations linked.`);

    // 3. Get TOTAL destinations count
    const { count: totalCount, error: totalError } = await supabase
        .from('destinations')
        .select('*', { count: 'exact', head: true });

    if (totalError) {
        console.error('Error counting total destinations:', totalError);
        return;
    }

    console.log(`Total destinations in database: ${totalCount}`);

    // 4. Check specific missing destinations
    const { data: missing, error: missingError } = await supabase
        .from('destinations')
        .select('id, name, county')
        .or('name.ilike.%Flaming Gorge%,name.ilike.%Dutch John%');

    if (missingError) {
        console.error('Error fetching missing items:', missingError);
        return;
    }

    console.log('Found specific items:', missing);
}

checkTK000();
