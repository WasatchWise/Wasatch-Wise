import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTables() {
  console.log('Checking table structure...\n')

  // Check projects table
  const { data: projects, error: pErr } = await supabase
    .from('projects')
    .select('id')
    .limit(1)

  console.log('projects table:', pErr ? 'ERROR: ' + pErr.message : 'OK - ' + (projects?.length || 0) + ' rows')
  if (projects?.[0]) console.log('  Sample ID:', projects[0].id)

  // Check high_priority_projects table
  const { data: hpp, error: hErr } = await supabase
    .from('high_priority_projects')
    .select('id')
    .limit(1)

  console.log('high_priority_projects table:', hErr ? 'ERROR: ' + hErr.message : 'OK - ' + (hpp?.length || 0) + ' rows')
  if (hpp?.[0]) console.log('  Sample ID:', hpp[0].id)

  // Check project_stakeholders
  const { data: ps, error: sErr } = await supabase
    .from('project_stakeholders')
    .select('*')
    .limit(1)

  console.log('project_stakeholders table:', sErr ? 'ERROR: ' + sErr.message : 'OK - ' + (ps?.length || 0) + ' rows')

  // Check contacts
  const { data: contacts, count } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, phone', { count: 'exact' })
    .limit(5)

  console.log('\ncontacts table: ' + count + ' total')
  if (contacts) {
    contacts.forEach(c => {
      console.log('  - ' + c.first_name + ' ' + c.last_name + ': ' + (c.email || c.phone || 'no contact info'))
    })
  }
}

checkTables().catch(console.error)
