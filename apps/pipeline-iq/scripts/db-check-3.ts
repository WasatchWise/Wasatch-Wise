import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function listProjects() {
  const { data, error } = await supabase
    .from('high_priority_projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.log('Error:', error.message)
    return
  }
  
  console.log('Found', data?.length, 'projects:\n')
  data?.forEach((p, i) => {
    console.log((i+1) + '. ' + (p.project_name || 'No name'))
    console.log('   City: ' + p.city + ', ' + p.state)
    console.log('   Value: $' + ((p.project_value || 0) / 1000000).toFixed(1) + 'M')
    console.log('   Score: ' + p.groove_score)
    console.log('   Stage: ' + p.stage)
    console.log('   CW ID: ' + (p.cw_project_id || 'None'))
    console.log('   Created: ' + (p.created_at || 'Unknown'))
    console.log('')
  })
}

listProjects().catch(console.error)
