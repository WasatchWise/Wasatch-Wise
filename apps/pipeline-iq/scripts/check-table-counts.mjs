import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkCounts() {
  const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
  const { count: hppCount } = await supabase.from('high_priority_projects').select('*', { count: 'exact', head: true })

  console.log('projects table: ' + projectsCount + ' records')
  console.log('high_priority_projects table: ' + hppCount + ' records')

  // Check if the scraper saves to projects
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, project_name, data_source, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  console.log('\nRecent projects (from projects table):')
  recentProjects?.forEach(p => console.log('  - ' + p.project_name + ' | source: ' + (p.data_source || 'unknown')))

  // Check high_priority_projects
  const { data: recentHpp } = await supabase
    .from('high_priority_projects')
    .select('id, project_name, data_source, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  console.log('\nRecent high_priority_projects:')
  recentHpp?.forEach(p => console.log('  - ' + p.project_name + ' | source: ' + (p.data_source || 'unknown')))
}

checkCounts().catch(console.error)
