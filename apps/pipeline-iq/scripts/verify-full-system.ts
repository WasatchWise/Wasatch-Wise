
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error("❌ .env.local not found!");
    process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key to bypass RLS for verification
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log("🔍 Starting System Verification...\n");

    // 1. Verify Database Connection & Tables
    console.log("--- Database Tables ---");
    const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['projects', 'outreach_activities', 'outreach_element_clicks', 'subscription_plans', 'users']);

    // Note: RLS might block listing information_schema through API, so we try a direct select from key tables.

    const tablesToCheck = ['projects', 'outreach_element_clicks', 'subscription_plans', 'users'];
    for (const table of tablesToCheck) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ Table '${table}': Error - ${error.message}`);
        } else {
            console.log(`✅ Table '${table}': Exists (Rows: ${count})`);
        }
    }

    console.log("\n--- Subscription Plans ---");
    const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('name, is_active')
        .order('sort_order', { ascending: true });

    if (plansError) {
        console.log(`❌ Failed to fetch plans: ${plansError.message}`);
    } else {
        console.log(`✅ Found ${plans?.length ?? 0} plans: ${plans?.map(p => p.name).join(', ')}`);
    }

    console.log("\n--- God Mode Verification ---");
    const userEmail = 'msartain@getgrooven.com';
    const { data: user, error: userError } = await supabase.from('users').select('email, is_god_mode').eq('email', userEmail).single();

    if (userError) {
        console.log(`❌ Failed to fetch user ${userEmail}: ${userError.message}`);
    } else {
        console.log(user.is_god_mode ? `✅ User ${userEmail} HAS God Mode` : `❌ User ${userEmail} does NOT have God Mode`);
    }

    console.log("\n--- Organization Verification ---");
    const orgId = process.env.ORGANIZATION_ID;
    if (orgId) {
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select(`
            name, 
            subscription_status,
            subscription_plans (
                name
            )
        `)
            .eq('id', orgId)
            .single();

        if (orgError) {
            console.log(`❌ Failed to fetch org ${orgId}: ${orgError.message}`);
        } else {
            const planName = Array.isArray(org.subscription_plans) ? org.subscription_plans[0]?.name : (org.subscription_plans as any)?.name;
            console.log(`✅ Organization '${org.name}': Plan = ${planName}, Status = ${org.subscription_status}`);
        }
    } else {
        console.log("⚠️ ORGANIZATION_ID not set in env");
    }
}

verify().catch(console.error);
