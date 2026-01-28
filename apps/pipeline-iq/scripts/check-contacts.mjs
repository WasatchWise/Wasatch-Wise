import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Check projects with contacts in raw_data
const { data: projects, error } = await supabase
  .from('projects')
  .select('id, project_name, raw_data')
  .limit(10)

console.log('=== PROJECTS WITH RAW DATA ===')
let contactsFound = 0
for (const p of projects || []) {
  const contacts = p.raw_data?.original?.contacts || p.raw_data?.contacts || []
  if (contacts.length > 0) {
    console.log('\n' + p.project_name + ':')
    contacts.forEach(c => {
      const email = c.email || 'no email'
      const phone = c.phone || 'no phone'
      console.log('  - ' + c.first_name + ' ' + c.last_name + ': ' + email + ' | ' + phone)
    })
    contactsFound += contacts.length
  }
}
console.log('\nTotal contacts in raw_data: ' + contactsFound)

// Check contacts table directly
const { data: contactsTable, count } = await supabase
  .from('contacts')
  .select('*', { count: 'exact' })
  .limit(5)

console.log('\n=== CONTACTS TABLE ===')
console.log('Total rows in contacts table: ' + count)
if (contactsTable?.length > 0) {
  contactsTable.forEach(c => {
    const email = c.email || 'no email'
    console.log('  - ' + c.first_name + ' ' + c.last_name + ': ' + email)
  })
}
