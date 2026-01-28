
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkTables() {
    const tables = ['subscription_plans', 'usage_tracking', 'organizations']

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })

        if (error) {
            console.log(`Table '${table}': NOT FOUND or ERROR (${error.message})`)
        } else {
            console.log(`Table '${table}': EXISTS (Rows: ${count})`)
        }
    }
}

checkTables()
