import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runMigration() {
  console.log('Running FK migration...\n')

  // We can't run raw SQL with Supabase JS client
  // Instead, let's just test if the link works now by checking if projects table IDs
  // can be used in project_stakeholders

  // Get a sample project ID from the projects table
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .select('id, project_name')
    .limit(1)
    .single()

  if (pErr) {
    console.log('Error getting project:', pErr.message)
    return
  }

  console.log('Sample project:', project.project_name)
  console.log('Project ID:', project.id)

  // Get a sample contact ID
  const { data: contact, error: cErr } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .limit(1)
    .single()

  if (cErr) {
    console.log('Error getting contact:', cErr.message)
    return
  }

  console.log('Sample contact:', contact.first_name, contact.last_name)
  console.log('Contact ID:', contact.id)

  // Try to insert a link
  console.log('\nTrying to create stakeholder link...')

  const { data: link, error: linkErr } = await supabase
    .from('project_stakeholders')
    .upsert({
      project_id: project.id,
      contact_id: contact.id,
      role_in_project: 'owner',
      is_primary: true,
    }, {
      onConflict: 'project_id,contact_id'
    })
    .select()

  if (linkErr) {
    console.log('Link error:', linkErr.message)
    console.log('\nThe FK constraint still references high_priority_projects.')
    console.log('You need to run this SQL in Supabase SQL Editor:\n')
    console.log(`
ALTER TABLE project_stakeholders
DROP CONSTRAINT IF EXISTS project_stakeholders_project_id_fkey;

ALTER TABLE project_stakeholders
ADD CONSTRAINT project_stakeholders_project_id_fkey
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    `)
  } else {
    console.log('SUCCESS! Link created:', link)
  }
}

runMigration().catch(console.error)
