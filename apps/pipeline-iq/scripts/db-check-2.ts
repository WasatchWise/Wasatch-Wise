import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkMore() {
  // Get all projects with details
  const { data: projects } = await supabase
    .from('high_priority_projects')
    .select('project_name, city, state, project_value, groove_score, cw_project_id, created_at, stage')
    .order('created_at', { ascending: false })
  
  console.log('=== ALL PROJECTS ===\n')
  projects?.forEach((p: any, i: number) => {
    const name = p.project_name ? p.project_name.slice(0,40) : 'Unknown'
    const value = p.project_value ? '$' + (p.project_value/1000000).toFixed(1) + 'M' : 'N/A'
    const created = p.created_at ? p.created_at.slice(0,10) : 'unknown'
    console.log((i+1) + '.', name)
    console.log('   ', p.city + ', ' + p.state, '|', value, '| Score:', p.groove_score, '| Stage:', p.stage)
    console.log('    Created:', created, '| CW ID:', p.cw_project_id ? 'Yes' : 'No')
    console.log('')
  })
  
  // Check what tables exist
  console.log('=== CHECKING TABLES ===')
  const tables = ['high_priority_projects', 'project_stakeholders', 'campaign_emails', 'meetings', 'scrape_logs', 'organizations']
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    if (error) {
      console.log(table + ': ERROR -', error.message)
    } else {
      console.log(table + ':', count, 'rows')
    }
  }
}

checkMore().catch(console.error)
