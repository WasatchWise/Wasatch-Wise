import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupMikeGodMode() {
  console.log('🚀 Setting up Mike with God Mode...\n')

  // First, check if Mike exists
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .or('email.ilike.%mike%,email.ilike.%sartain%,email.ilike.%grooven%')

  if (userError) {
    console.error('Error fetching users:', userError.message)
    return
  }

  console.log('Found users:', users?.length || 0)

  if (users && users.length > 0) {
    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Name: ${user.full_name || 'Not set'}`)
      console.log(`   Role: ${user.role || 'Not set'}`)
      console.log(`   God Mode: ${user.god_mode ? '✅ Enabled' : '❌ Disabled'}`)

      // Update god_mode to true
      if (!user.god_mode) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            god_mode: true,
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          console.error(`   ❌ Failed to update god_mode: ${updateError.message}`)
        } else {
          console.log(`   ✅ God Mode ENABLED!`)
        }
      }
    }
  } else {
    console.log('\n⚠️ No user found with Mike/Sartain/Grooven in email')
    console.log('Creating Mike as admin user...')

    // Create Mike as admin
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: 'msartain@getgrooven.com',
        full_name: 'Mike Sartain',
        role: 'admin',
        god_mode: true,
        organization_id: process.env.ORGANIZATION_ID || '34249404-774f-4b80-b346-a2d9e6322584',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError.message)
    } else {
      console.log('✅ Mike created with God Mode!')
      console.log(newUser)
    }
  }

  // Check projects count
  console.log('\n📊 Checking projects...')
  const { count: projectCount, error: countError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Error counting projects:', countError.message)
  } else {
    console.log(`Total projects in database: ${projectCount}`)
  }

  // Get sample projects
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, name, status, created_at')
    .limit(5)
    .order('created_at', { ascending: false })

  if (projectError) {
    console.error('Error fetching projects:', projectError.message)
  } else if (projects && projects.length > 0) {
    console.log('\nRecent projects:')
    projects.forEach(p => {
      console.log(`  - ${p.name} (${p.status})`)
    })
  } else {
    console.log('\n⚠️ No projects found - database needs seeding!')
  }

  // Check leads count
  console.log('\n📊 Checking leads...')
  const { count: leadCount, error: leadCountError } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  if (leadCountError) {
    console.error('Error counting leads:', leadCountError.message)
  } else {
    console.log(`Total leads in database: ${leadCount}`)
  }
}

setupMikeGodMode()
  .then(() => {
    console.log('\n✅ Setup complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
