
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

async function analyze() {
    console.log("📊 Analyzing Pipeline Sophistication & Volume...\n");

    // 1. Project Volume
    const { count: totalProjects } = await supabase.from('high_priority_projects').select('*', { count: 'exact', head: true });
    const { count: newProjects } = await supabase.from('high_priority_projects').select('*', { count: 'exact', head: true }).eq('outreach_status', 'new');
    const { count: contactedProjects } = await supabase.from('high_priority_projects').select('*', { count: 'exact', head: true }).neq('outreach_status', 'new');

    // 2. High Value Targets
    const { count: highValue } = await supabase.from('high_priority_projects').select('*', { count: 'exact', head: true }).gt('project_value', 1000000);

    // 3. Contact Richness
    const { count: totalContacts } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
    const { count: contactsWithEmail } = await supabase.from('contacts').select('*', { count: 'exact', head: true }).not('email', 'is', null);
    const { count: contactsWithPhone } = await supabase.from('contacts').select('*', { count: 'exact', head: true }).not('mobile', 'is', null);

    // 4. "Ready in Canon" (New Projects with Email Contacts)
    // This requires a join. We'll simulate by checking projects that have stakeholders with emails.
    // Note: This is an estimation query.
    const { data: readyProjects, error } = await supabase
        .rpc('get_ready_projects_count') // Ideally we'd use an RPC, but let's try a direct complex query or estimation

    // Alternative "Ready" check: Projects with 'new' status that have at least one contact linked
    // Since we can't do complex joins easily in one count command without RPC, we will infer "Sophistication" by data fullness.

    // Let's check for Vertical Classification usage (Metadata richness)
    // We'll fetch a sample to check data depth
    const { data: sampleProjects } = await supabase
        .from('high_priority_projects')
        .select('raw_data, total_score')
        .limit(100);

    let classifiedCount = 0;
    if (sampleProjects) {
        classifiedCount = sampleProjects.filter(p => (p.raw_data as any)?.vertical_classification).length;
    }

    console.log("--- 🏗️ Projects Volume ---");
    console.log(`Total Projects: ${totalProjects}`);
    console.log(`New / Untouched: ${newProjects} (The Canon)`);
    console.log(`Already In-Flight: ${contactedProjects}`);
    console.log(`High Value (>$1M): ${highValue}`);

    console.log("\n--- 👥 Contact Detail ---");
    console.log(`Total Contacts: ${totalContacts}`);
    console.log(`With Email: ${contactsWithEmail} (${totalContacts ? Math.round(contactsWithEmail! / totalContacts! * 100) : 0}%)`);
    console.log(`With Phone: ${contactsWithPhone}`);

    console.log("\n--- 🧠 AI Sophistication ---");
    console.log(`Vertical Classification Data: ~${classifiedCount}% of recent projects have deep AI classification.`);

    console.log("\n--- ✅ READY TO FIRE ---");
    console.log(`Based on these metrics, you have roughly ${newProjects} projects in the pipe.`);
    console.log(`Assuming ~${totalContacts ? Math.round(contactsWithEmail! / totalContacts! * 100) : 0}% contact coverage,`);
    console.log(`You have approx. ${Math.round(newProjects! * (contactsWithEmail! / totalContacts!))} fully executable Warm Calls ready to go RIGHT NOW.`);

}

analyze().catch(console.error);
