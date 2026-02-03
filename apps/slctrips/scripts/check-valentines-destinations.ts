/**
 * Check if Valentine's TripKit destinations exist in the database.
 * Run from apps/slctrips: npx tsx scripts/check-valentines-destinations.ts
 * For all 20: npx tsx scripts/check-valentines-destinations.ts --all
 *
 * Top 5 (TikTok): Lava Hot Springs, Bonneville Salt Flats, Mirror Lake Highway, Goblin Valley, Great Basin NP.
 * 6–20: Park City, Midway, Zion, Bryce, Mystic Hot Springs, Antelope Island, Capitol Reef, Moab, Scenic Byway 12, Bear Lake, Lake Tahoe, Telluride, Kanab, Monument Valley, Sedona.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      const v = value.trim().replace(/^["']|["']$/g, '');
      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = v;
      if (key.trim() === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = v;
    }
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// TikTok Top 5: by name patterns (flexible). Slugs from DB verification doc.
const VALENTINES_FIVE = [
  { label: 'Lava Hot Springs (Idaho)', patterns: ['lava hot springs', 'lava hot spring'], expectedSlug: 'lava-hot-springs' },
  { label: 'Salt Flats / Bonneville (Utah)', patterns: ['salt flats', 'bonneville', 'bonneville salt'], expectedSlug: 'bonneville-salt-flats | salt-flats' },
  { label: 'Mirror Lake (Uinta Mountains, Utah)', patterns: ['mirror lake'], expectedSlug: 'mirror-lake | mirror-lake-highway' },
  { label: 'Goblin Valley (Utah)', patterns: ['goblin valley'], expectedSlug: 'goblin-valley' },
  { label: 'Great Basin NP (Nevada)', patterns: ['great basin'], expectedSlug: 'great-basin | great-basin-np' },
];

// All 20 slugs: best DB match per research name (attractions within areas). Use with --all.
const VALENTINES_TWENTY_SLUGS = [
  'lava-hot-springs',
  'bonneville-salt-flats',
  'mirror-lake-highway',
  'goblin-valley-state-park',
  'great-basin-national-park',
  'park-city-mountain-resort',
  'homestead-crater',
  'zion-national-park-kolob-canyons',
  'bryce-canyon-film-location',
  'mystic-hot-springs-monroe',
  'antelope-island-film-trail',
  'capitol-reef-visitor-center',
  'moab-jeep-safari',
  'highway-12-all-american-road',
  'raspberry-days-bear-lake',
  'lake-tahoe',
  'telluride',
  'kanab-little-hollywood-western-sets',
  'monument-valley-tribal-park',
  'sedona',
];

const checkAll = process.argv.includes('--all');

async function main() {
  if (checkAll) {
    await checkAllTwenty();
    return;
  }
  console.log('Checking Valentine\'s Top 5 destinations in database...\n');
  await checkTopFive();
}

async function checkTopFive() {
  let table = 'public_destinations';
  let { data: allDestinations, error } = await supabase
    .from(table)
    .select('id, name, slug, county, state')
    .order('name', { ascending: true });

  if (error) {
    table = 'destinations';
    const fallback = await supabase
      .from(table)
      .select('id, name, slug, county, state')
      .order('name', { ascending: true });
    if (fallback.error) {
      console.error('Error querying public_destinations:', error.message);
      console.error('Fallback to destinations:', fallback.error.message);
      process.exit(1);
    }
    allDestinations = fallback.data;
  }

  const destinations = allDestinations ?? [];
  console.log(`Loaded ${destinations.length} destinations from ${table}.\n`);

  const results: { label: string; expectedSlug: string; found: { id: string; name: string; slug: string }[]; missing: boolean }[] = [];

  for (const { label, patterns, expectedSlug } of VALENTINES_FIVE) {
    const found = destinations.filter((d) => {
      const name = (d.name ?? '').toLowerCase();
      return patterns.some((p) => name.includes(p));
    });
    results.push({
      label,
      expectedSlug: expectedSlug ?? '',
      found: found.map((d) => ({ id: d.id, name: d.name, slug: d.slug ?? '' })),
      missing: found.length === 0,
    });
  }

  console.log('--- Valentine\'s Top 5 check ---\n');
  let allFound = true;
  for (const r of results) {
    if (r.found.length > 0) {
      console.log(`✅ ${r.label}`);
      if (r.expectedSlug) console.log(`   Expected slug: ${r.expectedSlug}`);
      r.found.forEach((f) => console.log(`   id: ${f.id}  slug: ${f.slug || '(none)'}  name: ${f.name}`));
    } else {
      console.log(`❌ MISSING: ${r.label}`);
      if (r.expectedSlug) console.log(`   Expected slug: ${r.expectedSlug}`);
      allFound = false;
    }
    console.log('');
  }

  if (allFound) {
    console.log('All 5 destinations exist. You can use these slugs/IDs for the Valentine\'s TripKit migration.');
  } else {
    console.log('Some destinations are missing. Add them to the destinations table (or fix name/slug) before linking the TripKit.');
  }

  const singleMatches = results.filter((r) => r.found.length === 1);
  if (singleMatches.length === 5) {
    console.log('\n--- Ready for tripkit_destinations INSERT (in caption order) ---');
    singleMatches.forEach((r, i) => {
      const f = r.found[0];
      console.log(`-- ${i + 1}. ${r.label}`);
      console.log(`('${f.id}', ${i + 1}),  -- ${f.slug || f.name}`);
    });
  }
}

async function checkAllTwenty() {
  let table = 'public_destinations';
  let { data: rows, error } = await supabase
    .from(table)
    .select('id, name, slug')
    .in('slug', VALENTINES_TWENTY_SLUGS);

  if (error) {
    table = 'destinations';
    const fallback = await supabase.from(table).select('id, name, slug').in('slug', VALENTINES_TWENTY_SLUGS);
    if (fallback.error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
    rows = fallback.data;
  }

  const bySlug = new Map((rows ?? []).map((r) => [r.slug ?? '', r]));
  console.log(`Checking all 20 Valentine's TripKit destinations (by slug) in ${table}...\n`);

  const foundIds: string[] = [];
  let missing = 0;
  VALENTINES_TWENTY_SLUGS.forEach((slug, i) => {
    const row = bySlug.get(slug);
    const order = i + 1;
    if (row) {
      console.log(`✅ ${order}. ${slug}  → id: ${row.id}  name: ${row.name}`);
      foundIds.push(row.id);
    } else {
      console.log(`❌ ${order}. ${slug}  → NOT FOUND`);
      foundIds.push('');
      missing++;
    }
  });

  console.log(`\nFound ${foundIds.length - missing}/20. Missing: ${missing}.`);
  if (missing === 0 && foundIds.length === 20) {
    console.log('\n--- Ready for tripkit_destinations INSERT (all 20) ---');
    foundIds.forEach((id, i) => {
      console.log(`  ('<TRIPKIT_UUID>', '${id}', ${i + 1}),  -- ${VALENTINES_TWENTY_SLUGS[i]}`);
    });
  }
}

main();
