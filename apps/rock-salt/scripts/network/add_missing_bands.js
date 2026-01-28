/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const DATA_PATH = path.join(__dirname, 'person_group_seed.json')

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function slugify(input) {
  if (!input) return null
  return String(input)
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeName(input) {
  return String(input)
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function main() {
  const seed = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))

  // Get existing bands
  const { data: bands } = await supabase.from('bands').select('id, name, slug')

  const bandBySlug = new Map()
  const bandByName = new Map()
  ;(bands || []).forEach(b => {
    if (b.slug) bandBySlug.set(String(b.slug).toLowerCase(), b)
    bandByName.set(normalizeName(b.name), b)
  })

  // Collect all unique group names from seed
  const allGroups = new Set()
  for (const entry of seed) {
    const groups = (entry.groups || []).filter(Boolean)
    groups.forEach(g => allGroups.add(g))
  }

  // Find groups that don't exist
  const missingBands = []
  const seenSlugs = new Set()

  for (const groupName of allGroups) {
    const groupSlug = slugify(groupName)
    const exists =
      (groupSlug ? bandBySlug.has(groupSlug) : false) ||
      bandByName.has(normalizeName(groupName))

    if (!exists && groupSlug && !seenSlugs.has(groupSlug)) {
      seenSlugs.add(groupSlug)
      missingBands.push({
        name: groupName,
        slug: groupSlug,
        origin_city: 'Salt Lake City',
        state: 'UT',
        country: 'USA',
        tier: 'free',
        status: 'active',
      })
    }
  }

  console.log('Existing bands:', bands?.length || 0)
  console.log('Missing bands to add:', missingBands.length)
  console.log('')
  console.log('Bands to insert:')
  missingBands.forEach(b => console.log('  -', b.name, `(${b.slug})`))

  if (!APPLY) {
    console.log('')
    console.log('Dry run only. Use --apply to insert.')
    process.exit(0)
  }

  // Insert missing bands
  if (missingBands.length > 0) {
    const { data, error } = await supabase
      .from('bands')
      .insert(missingBands)
      .select('id, name, slug')

    if (error) {
      console.error('Error inserting bands:', error)
      process.exit(1)
    }

    console.log('')
    console.log('Successfully inserted', data.length, 'bands')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
