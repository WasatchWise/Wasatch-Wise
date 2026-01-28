
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkDuplicates() {
    const { data: projects, error } = await supabase
        .from('projects')
        .select('id, project_name, city, data_source, created_at')
        .ilike('project_name', '%Alta Merita%')

    if (error) {
        console.error(error)
        return
    }

    console.log('Projects matching Alta Merita:')
    console.table(projects)
}

checkDuplicates()
