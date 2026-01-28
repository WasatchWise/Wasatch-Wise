import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkDatabase() {
  console.log('=== DATABASE STATE REVIEW ===\n')
  
  // Count projects
  const { count: projectCount } = await supabase
    .from('high_priority_projects')
    .select('*', { count: 'exact', head: true })
  console.log('Total Projects:', projectCount)
  
  // Projects by stage
  const { data: stageData } = await supabase
    .from('high_priority_projects')
    .select('stage')
  const stageCounts: Record<string, number> = {}
  stageData?.forEach((p: any) => {
    const stage = p.stage || 'null'
    stageCounts[stage] = (stageCounts[stage] || 0) + 1
  })
  console.log('\nProjects by Stage:')
  Object.entries(stageCounts).sort((a, b) => b[1] - a[1]).forEach(([stage, count]) => {
    console.log('  ', stage + ':', count)
  })
  
  // Projects with CW IDs (scraped from Construction Wire)
  const { count: cwCount } = await supabase
    .from('high_priority_projects')
    .select('*', { count: 'exact', head: true })
    .not('cw_project_id', 'is', null)
  console.log('\nProjects with CW ID (scraped):', cwCount)
  
  // Recent projects (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: recentCount } = await supabase
    .from('high_priority_projects')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo)
  console.log('Projects added in last 7 days:', recentCount)
  
  // Check scrape_logs table
  const { data: scrapeLogs, error: logsError } = await supabase
    .from('scrape_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (logsError) {
    console.log('\nscrape_logs table error:', logsError.message)
  } else if (scrapeLogs && scrapeLogs.length > 0) {
    console.log('\nRecent Scrape Logs:')
    scrapeLogs.forEach((log: any) => {
      const date = log.created_at ? log.created_at.slice(0,16) : 'unknown'
      console.log('  ', date, '|', log.source, '|', log.status, '| Found:', log.projects_found, '| Inserted:', log.projects_inserted)
    })
  } else {
    console.log('\nNo scrape logs found (table may be empty)')
  }
  
  // Check contacts
  const { count: contactCount } = await supabase
    .from('project_stakeholders')
    .select('*', { count: 'exact', head: true })
  console.log('\nTotal Contacts/Stakeholders:', contactCount)
  
  // Check email campaigns
  const { count: campaignCount } = await supabase
    .from('campaign_emails')
    .select('*', { count: 'exact', head: true })
  console.log('Campaign Emails:', campaignCount)
  
  // Check meetings
  const { count: meetingCount } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
  console.log('Meetings:', meetingCount)
  
  // Sample recent project to see data quality
  const { data: sampleProject } = await supabase
    .from('high_priority_projects')
    .select('project_name, city, state, project_value, groove_score, cw_project_id, created_at')
    .not('cw_project_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(3)
  
  console.log('\nMost Recent Scraped Projects:')
  sampleProject?.forEach((p: any) => {
    const name = p.project_name ? p.project_name.slice(0,45) : 'Unknown'
    const value = p.project_value ? (p.project_value/1000000).toFixed(1) : '?'
    console.log('  ', name, '|', p.city + ', ' + p.state, '| $' + value + 'M | Score:', p.groove_score)
  })
}

checkDatabase().catch(console.error)
