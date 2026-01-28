
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

async function inspect() {
    console.log("🔍 Inspecting Project Statuses...\n");

    const { data: projects, error } = await supabase
        .from('high_priority_projects')
        .select('priority_level, outreach_status, total_score');

    if (error) {
        console.error(error);
        return;
    }

    const priorityCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    let lowScoreCount = 0; // Assuming < 50 might be "cold" if no explicit flag

    projects.forEach(p => {
        const prio = p.priority_level || 'null';
        const stat = p.outreach_status || 'null';

        priorityCounts[prio] = (priorityCounts[prio] || 0) + 1;
        statusCounts[stat] = (statusCounts[stat] || 0) + 1;

        if ((p.total_score || 0) < 50) lowScoreCount++;
    });

    console.log("--- Priority Levels ---");
    console.table(priorityCounts);

    console.log("\n--- Outreach Statuses ---");
    console.table(statusCounts);

    console.log(`\n--- Score Analysis ---`);
    console.log(`Projects with Total Score < 50: ${lowScoreCount}`);
}

inspect().catch(console.error);
