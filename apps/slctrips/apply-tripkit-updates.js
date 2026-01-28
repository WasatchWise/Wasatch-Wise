const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function applyMigrations() {
    const schemaMigrationPath = path.join(__dirname, 'migrations/update_tripkits_schema.sql');
    const dataMigrationPath = path.join(__dirname, 'migrations/update_tripkits_data.sql');

    try {
        console.log('Reading schema migration file...');
        const schemaSql = fs.readFileSync(schemaMigrationPath, 'utf8');

        console.log('Applying schema changes...');
        const { error: schemaError } = await supabase.rpc('exec_sql', { sql_query: schemaSql });

        if (schemaError) {
            console.error('❌ Error applying schema migration:', schemaError.message);
            // If the error is that the function doesn't exist, we might need another way, but assuming it works as per previous scripts.
            // Also, if columns already exist, the SQL uses IF NOT EXISTS, so it should be fine.
            throw schemaError;
        }
        console.log('✅ Schema changes applied successfully!');

        console.log('Reading data migration file...');
        const dataSql = fs.readFileSync(dataMigrationPath, 'utf8');

        console.log('Applying data updates...');
        const { error: dataError } = await supabase.rpc('exec_sql', { sql_query: dataSql });

        if (dataError) {
            console.error('❌ Error applying data migration:', dataError.message);
            throw dataError;
        }
        console.log('✅ Data updates applied successfully!');

        // Verification
        console.log('\nVerifying updates...');
        const { data: tripkits, error: verifyError } = await supabase
            .from('tripkits')
            .select('tripkit_id, learning_objectives, estimated_time, difficulty_level, curriculum_alignment')
            .in('tripkit_id', ['TK-000', 'TK-002', 'TK-005']);

        if (verifyError) {
            console.error('❌ Verification failed:', verifyError.message);
        } else {
            console.log(`✅ Verified ${tripkits.length} tripkits.`);
            tripkits.forEach(tk => {
                console.log(`\n${tk.tripkit_id}:`);
                console.log(`  - Learning Objectives: ${tk.learning_objectives ? tk.learning_objectives.length : 0}`);
                console.log(`  - Estimated Time: ${tk.estimated_time}`);
                console.log(`  - Difficulty: ${tk.difficulty_level}`);
                console.log(`  - Curriculum: ${tk.curriculum_alignment ? 'Present' : 'Missing'}`);
            });
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
        process.exit(1);
    }
}

applyMigrations();
