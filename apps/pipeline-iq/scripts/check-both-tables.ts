import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  // Check projects table
  const { count: projectsCount, error: e1 } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
  
  console.log('projects table:', e1 ? 'ERROR: ' + e1.message : projectsCount + ' rows')
  
  // Check high_priority_projects table
  const { count: hppCount, error: e2 } = await supabase
    .from('high_priority_projects')
    .select('*', { count: 'exact', head: true })
  
  console.log('high_priority_projects table:', e2 ? 'ERROR: ' + e2.message : hppCount + ' rows')
  
  // Sample from projects table
  const { data: samples } = await supabase
    .from('projects')
    .select('project_name, city, state, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (samples && samples.length > 0) {
    console.log('\nRecent entries in projects table:')
    samples.forEach((p: any) => {
      console.log('  -', p.project_name?.slice(0,50), '|', p.city, ',', p.state, '|', p.created_at?.slice(0,10))
    })
  }
}

check().catch(console.error)
