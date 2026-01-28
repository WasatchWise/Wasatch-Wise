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

function stripParen(input) {
  return String(input).replace(/\(.*?\)/g, '').trim()
}

function isAmbiguousName(name) {
  const cleaned = stripParen(name)
  return cleaned.split(/\s+/g).length < 2
}

async function main() {
  const seed = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))

  const [{ data: bands }, { data: musicians }] = await Promise.all([
    supabase.from('bands').select('id, name, slug'),
    supabase.from('musicians').select('id, name, slug'),
  ])

  const bandBySlug = new Map()
  const bandByName = new Map()
  ;(bands || []).forEach(b => {
    if (b.slug) bandBySlug.set(String(b.slug).toLowerCase(), b)
    bandByName.set(normalizeName(b.name), b)
  })

  const musicianBySlug = new Map()
  const musicianByName = new Map()
  ;(musicians || []).forEach(m => {
    if (m.slug) musicianBySlug.set(String(m.slug).toLowerCase(), m)
    musicianByName.set(normalizeName(m.name), m)
  })

  const toInsertMusicians = []
  const toInsertMembers = []
  const unmatchedBands = new Map()
  const ambiguousPeople = []
  const skippedAssociations = []

  for (const entry of seed) {
    const rawPerson = entry.person
    if (!rawPerson) continue

    if (isAmbiguousName(rawPerson)) {
      ambiguousPeople.push(rawPerson)
      continue
    }

    const cleanedPerson = stripParen(rawPerson)
    const personSlug = slugify(cleanedPerson)
    const personKey = normalizeName(cleanedPerson)

    let musician = musicianBySlug.get(personSlug) || musicianByName.get(personKey)

    if (!musician) {
      const insert = {
        name: cleanedPerson,
        slug: personSlug || null,
        role: entry.role || null,
      }
      toInsertMusicians.push(insert)
      musician = { id: null, name: cleanedPerson, slug: personSlug }
      musicianBySlug.set(personSlug, musician)
      musicianByName.set(personKey, musician)
    }

    const groups = (entry.groups || []).filter(Boolean)
    for (const groupName of groups) {
      const groupSlug = slugify(groupName)
      const band =
        (groupSlug ? bandBySlug.get(groupSlug) : null) ||
        bandByName.get(normalizeName(groupName))

      if (!band) {
        unmatchedBands.set(groupName, (unmatchedBands.get(groupName) || 0) + 1)
        skippedAssociations.push({ person: cleanedPerson, group: groupName })
        continue
      }

      toInsertMembers.push({
        band_id: band.id,
        musician_slug: personSlug,
        musician_name: cleanedPerson,
        role: entry.role || null,
        instrument: null,
      })
    }
  }

  // Deduplicate musician inserts by slug
  const uniqueMusicians = []
  const seenMusicians = new Set()
  for (const m of toInsertMusicians) {
    const key = m.slug || normalizeName(m.name)
    if (seenMusicians.has(key)) continue
    seenMusicians.add(key)
    uniqueMusicians.push(m)
  }

  if (!APPLY) {
    console.log('Dry run only. Use --apply to insert.')
    console.log('Musicians to insert:', uniqueMusicians.length)
    console.log('Memberships to insert:', toInsertMembers.length)
    console.log('Ambiguous people:', ambiguousPeople)
    console.log('Unmatched bands:', [...unmatchedBands.keys()])
    process.exit(0)
  }

  // Insert musicians
  let createdMusicians = []
  if (uniqueMusicians.length > 0) {
    const { data, error } = await supabase
      .from('musicians')
      .insert(uniqueMusicians)
      .select('id, name, slug')
    if (error) {
      console.error('Error inserting musicians:', error)
      process.exit(1)
    }
    createdMusicians = data || []
  }

  // Refresh musician map with created rows
  createdMusicians.forEach(m => {
    if (m.slug) musicianBySlug.set(String(m.slug).toLowerCase(), m)
    musicianByName.set(normalizeName(m.name), m)
  })

  // Insert band_members (idempotent check)
  let insertedCount = 0
  for (const link of toInsertMembers) {
    const musician =
      (link.musician_slug ? musicianBySlug.get(link.musician_slug) : null) ||
      musicianByName.get(normalizeName(link.musician_name))
    if (!musician?.id) continue

    const { data: existing } = await supabase
      .from('band_members')
      .select('band_id, musician_id, role')
      .eq('band_id', link.band_id)
      .eq('musician_id', musician.id)
      .maybeSingle()

    if (existing) {
      continue
    }

    const { error } = await supabase.from('band_members').insert({
      band_id: link.band_id,
      musician_id: musician.id,
      role: link.role || null,
      instrument: link.instrument || null,
    })
    if (!error) insertedCount += 1
  }

  console.log('Inserted musicians:', createdMusicians.length)
  console.log('Inserted memberships:', insertedCount)
  console.log('Ambiguous people:', ambiguousPeople)
  console.log('Unmatched bands:', [...unmatchedBands.keys()])
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
