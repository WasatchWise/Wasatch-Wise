import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkProjectsSchema() {
    // Query the information_schema for the projects table columns
    const { data, error } = await supabase
        .rpc('sql', {
            query: `
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `})

    if (error) {
        console.log('Error querying schema:', error.message)
        // Try an alternative approach - just select from projects table
        const { data: sample, error: sampleError } = await supabase
            .from('projects')
            .select('*')
            .limit(1)

        if (sampleError) {
            console.log('Error fetching sample:', sampleError.message)
        } else {
            console.log('Sample project keys:', sample?.[0] ? Object.keys(sample[0]) : 'none')
        }
        return
    }

    console.log('Projects table schema:')
    data?.forEach((col: any) => {
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : ''
        console.log(`  ${col.column_name}: ${col.data_type}${length}`)
    })
}

checkProjectsSchema()
