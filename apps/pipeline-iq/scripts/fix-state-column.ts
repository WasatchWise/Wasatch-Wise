import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function alterStateColumn() {
    console.log('Altering state column in projects table...')

    // Try to alter via a raw SQL approach using supabase functions
    // Since we can't run raw SQL directly, we'll use a workaround

    // First, let's check what value is causing the issue by looking at a sample project in raw_data
    const { data: sample, error: sampleError } = await supabase
        .from('projects')
        .select('id, project_name, state, raw_data')
        .limit(1)

    if (sampleError) {
        console.log('Error:', sampleError.message)
        return
    }

    console.log('Sample project:')
    console.log('  Name:', sample?.[0]?.project_name)
    console.log('  State:', sample?.[0]?.state)

    // The issue is that raw_data might have a full state name
    // Let's check the raw_data structure
    if (sample?.[0]?.raw_data?.original?.state) {
        console.log('  Raw state:', sample[0].raw_data.original.state)
    }

    console.log('\nTo fix the varchar(2) issue, you need to run this SQL in Supabase SQL Editor:')
    console.log('\n  ALTER TABLE projects ALTER COLUMN state TYPE TEXT;\n')
    console.log('Or if the column doesn\'t exist or has a different issue, check with:')
    console.log('\n  SELECT column_name, data_type, character_maximum_length')
    console.log('  FROM information_schema.columns')
    console.log('  WHERE table_name = \'projects\' AND column_name = \'state\';')
}

alterStateColumn()
