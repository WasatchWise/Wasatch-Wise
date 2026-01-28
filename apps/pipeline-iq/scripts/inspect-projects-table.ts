import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function inspect() {
  // Get sample with all fields
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)
  
  if (error) {
    console.log('Error:', error.message)
    return
  }
  
  console.log('Sample projects from projects table:\n')
  data?.forEach((p: any, i: number) => {
    console.log('Project', i+1, ':')
    console.log('  project_name:', p.project_name)
    console.log('  city:', p.city)
    console.log('  state:', p.state)
    console.log('  project_value:', p.project_value)
    console.log('  cw_project_id:', p.cw_project_id)
    console.log('  project_type:', p.project_type)
    console.log('  project_stage:', p.project_stage)
    console.log('  created_at:', p.created_at?.slice(0,19))
    console.log('')
  })
  
  // Count with proper data
  const { data: allProjects } = await supabase
    .from('projects')
    .select('project_name, city, state, project_value, cw_project_id')
  
  let withName = 0, withCity = 0, withValue = 0, withCwId = 0
  allProjects?.forEach((p: any) => {
    if (p.project_name && !p.project_name.includes('(PM)') && !p.project_name.includes('(O)')) withName++
    if (p.city) withCity++
    if (p.project_value && p.project_value > 0) withValue++
    if (p.cw_project_id) withCwId++
  })
  
  console.log('Data Quality (out of', allProjects?.length, 'rows):')
  console.log('  With real project names (not company names):', withName)
  console.log('  With city:', withCity)
  console.log('  With project value:', withValue)
  console.log('  With CW ID:', withCwId)
}

inspect().catch(console.error)
