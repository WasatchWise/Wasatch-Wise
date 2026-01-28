#!/usr/bin/env tsx

/**
 * ConstructionWire CSV Download Importer
 *
 * Why this exists:
 * - CW "Download Report" CSV exports contain projects + stakeholder contact blocks (Owner/Developer/Contractor/PM)
 * - This avoids brittle "click into property" scraping/auth flows.
 *
 * Usage:
 *   tsx scripts/import-construction-wire-download.ts --file "/path/to/download.csv"
 *
 * Common flags:
 *   --file=...            (required) Path to CW CSV download
 *   --limit=250           Limit number of rows processed
 *   --dry-run             Parse + score, but do not write to DB
 *
 * Env required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ORGANIZATION_ID
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { calculateGrooveScore, calculateTimingScore } from '../lib/utils/scoring'
import { config } from 'dotenv'

type CsvRow = Record<string, string | undefined>

// Local dev convenience: load `.env.local` unless running in CI/GitHub Actions.
const isGitHubActions = !!process.env.GITHUB_ACTIONS
const isCI = !!process.env.CI
if (!isGitHubActions && !isCI) {
  config({ path: '.env.local' })
}

// Read env vars AFTER loading .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const ORGANIZATION_ID = process.env.ORGANIZATION_ID

if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
if (!supabaseKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
if (!ORGANIZATION_ID) throw new Error('ORGANIZATION_ID is required')

const supabase = createClient(supabaseUrl, supabaseKey)

function getArgValue(prefix: string): string | undefined {
  const hit = process.argv.find((a) => a === prefix || a.startsWith(`${prefix}=`))
  if (!hit) return undefined
  if (hit === prefix) {
    const idx = process.argv.indexOf(hit)
    return process.argv[idx + 1]
  }
  return hit.split('=').slice(1).join('=')
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag)
}

function norm(s?: string): string {
  return (s || '').trim()
}

function splitList(s?: string): string[] | null {
  const v = norm(s)
  if (!v) return null
  const parts = v
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.toLowerCase().replace(/\s+/g, '_'))
  return parts.length ? Array.from(new Set(parts)) : null
}

function parseMdyToIso(s?: string): string | null {
  const v = norm(s)
  if (!v) return null
  // Accept "12/15/2025" or "12/15/25"
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/)
  if (!m) return null
  const mm = parseInt(m[1], 10)
  const dd = parseInt(m[2], 10)
  let yyyy = parseInt(m[3], 10)
  if (yyyy < 100) yyyy += 2000
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null
  // Use UTC midnight
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0))
  return dt.toISOString()
}

function parseMonthYearToIso(s?: string): string | null {
  const v = norm(s)
  if (!v) return null
  // Examples: "2/2026" or "02/2026"
  const m = v.match(/^(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const mm = parseInt(m[1], 10)
  const yyyy = parseInt(m[2], 10)
  if (mm < 1 || mm > 12) return null
  return new Date(Date.UTC(yyyy, mm - 1, 1, 0, 0, 0)).toISOString()
}

function detectKeywords(text: string): Record<string, boolean> {
  const t = text.toLowerCase()
  const has = (re: RegExp) => re.test(t)

  return {
    amenities: has(/\bamenit(y|ies)\b/),
    technologies: has(/\btechnolog(y|ies)\b/),
    ev: has(/\bev\b|\bev charging\b|\bcharging station(s)?\b/),
    parcel: has(/\bparcel\b|\bpackage\b|\bmailroom\b/),
    wellness: has(/\bwellness\b|\bspa\b|\bfitness\b|\bgym\b/),
    coworking: has(/\bcowork(ing)?\b|\bconference room(s)?\b/),
    rooftop_pool: has(/\brooftop\b|\bpool\b|\boutdoor lounge\b/),
    smart_locks: has(/\bsmart lock(s)?\b|\bkeyless\b|\bfob\b|\baccess control\b/),
    internet_included: has(/\binternet included\b|\bbulk wi-?fi\b|\bbulk internet\b/),
    pip: has(/\bproperty improvement plan\b|\bpip\b/),
    garden_style: has(/\bgarden style\b/),
    historic: has(/\bhistoric\b|\bpreservation\b/),
    concrete_steel_leed: has(/\bconcrete\b|\bsteel\b|\bleed\b/),
    erces_das: has(/\berces\b|\bpublic safety das\b|\bdas\b|\bemergency responder\b/),
    directv_tv: has(/\bdirectv\b|\bcom3000\b|\bdre\b|\bpro:centric\b|\blg pro:centric\b|\bcasting\b|\biptv\b|\btv\b/),
    structured_cabling: has(/\bstructured cabling\b|\bcabling\b|\blow voltage\b|\bfiber\b|\bcat6\b|\bcat 6\b/),
  }
}

function detectBrandFlags(text: string): string[] {
  const t = text.toLowerCase()
  const brands = [
    'marriott',
    'hilton',
    'hyatt',
    'ihg',
    'holiday inn',
    'wyndham',
    'choice',
    'best western',
    'embassy suites',
    'hampton',
    'courtyard',
    'residence inn',
    'fairfield',
    'doubletree',
    'westin',
    'sheraton',
    'four seasons',
    'renaissance',
    'aloft',
    'ac hotels',
  ]
  const hits = brands.filter((b) => t.includes(b))
  return Array.from(new Set(hits))
}

function inferServicesNeededFromSignals(signals: Record<string, boolean>): string[] {
  const services: string[] = []
  if (signals.internet_included) services.push('wifi', 'internet')
  if (signals.smart_locks) services.push('access_control')
  if (signals.directv_tv) services.push('directv', 'tv')
  if (signals.structured_cabling) services.push('structured_cabling', 'cabling')
  if (signals.erces_das || signals.concrete_steel_leed) services.push('public_safety_das', 'erces')
  return Array.from(new Set(services))
}

function parseMaybeNumber(s?: string): number | null {
  const v = norm(s)
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function parseUnitsCountToNumber(s?: string): number | null {
  const v = norm(s)
  if (!v) return null
  // Examples: "< 50", "> 350", "50-100", "101-150", "528", "9"
  const range = v.match(/^(\d+)\s*-\s*(\d+)$/)
  if (range) return parseInt(range[2], 10)
  const gt = v.match(/^>\s*(\d+)$/)
  if (gt) return parseInt(gt[1], 10)
  const lt = v.match(/^<\s*(\d+)$/)
  if (lt) return parseInt(lt[1], 10)
  const num = v.replace(/[^\d]/g, '')
  if (!num) return null
  return parseInt(num, 10)
}

function parseProjectValueToDollars(s?: string): number | null {
  const vRaw = norm(s)
  if (!vRaw) return null

  // Examples:
  // "$25-$100" (assume millions)
  // "$1.5" (assume millions)
  // "$1000" (assume millions => $1B)
  const lower = vRaw.toLowerCase()

  // Take upper bound of range if present.
  const v = vRaw.includes('-') ? vRaw.split('-').pop()!.trim() : vRaw

  const hasB = lower.includes('billion') || /\b[b]\b/.test(lower)
  const hasM = lower.includes('million') || /\b[m]\b/.test(lower)
  const hasK = lower.includes('thousand') || /\b[k]\b/.test(lower)

  const numericStr = v.replace(/[^0-9.]/g, '')
  const n = parseFloat(numericStr)
  if (!Number.isFinite(n)) return null

  if (hasB) return Math.round(n * 1_000_000_000)
  if (hasK) return Math.round(n * 1_000)
  if (hasM) return Math.round(n * 1_000_000)

  // CW exports frequently represent value in millions when no unit marker exists.
  // Heuristic: treat any "plain" value <= 10,000 as millions.
  if (n <= 10_000) return Math.round(n * 1_000_000)
  return Math.round(n)
}

function normalizeStage(stage?: string): string {
  const s = norm(stage).toLowerCase()
  if (!s) return 'planning'
  if (s.includes('cancel')) return 'cancelled'
  if (s.includes('retired')) return 'retired'
  if (s.includes('complete')) return 'completed'
  if (s.includes('construct')) return 'construction'
  if (s.includes('groundbreak')) return 'pre_construction'
  if (s.includes('shell') || s.includes('foundation') || s.includes('early construction')) return 'pre_construction'
  if (s.includes('permit') || s.includes('planning/approval') || s.includes('planning')) return 'planning'
  if (s.includes('design')) return 'design'
  if (s.includes('bid')) return 'bidding'
  if (s.includes('bid')) return 'bidding'
  if (s.includes('design')) return 'design'
  if (s.includes('plan')) return 'planning'
  return s.replace(/\s+/g, '_')
}

function looksLikeStreetAddress(s?: string): boolean {
  const v = norm(s)
  if (!v) return false
  return /^\d{1,6}\s+\S+/.test(v) // "1170 Eighth Avenue"
}

function nameFromEmail(email: string): { first: string; last: string } | null {
  const local = email.split('@')[0] || ''
  const cleaned = local.replace(/[^a-zA-Z._-]/g, '')
  const dot = cleaned.split('.').filter(Boolean)
  if (dot.length === 2) return { first: dot[0], last: dot[1] }
  const under = cleaned.split('_').filter(Boolean)
  if (under.length === 2) return { first: under[0], last: under[1] }
  return null
}

function splitName(full?: string): { first_name: string; last_name: string } {
  const v = norm(full)
  if (!v) return { first_name: 'Unknown', last_name: 'Contact' }
  const parts = v.split(/\s+/).filter(Boolean)
  const first = parts[0] || 'Unknown'
  const last = parts.slice(1).join(' ') || 'Contact'
  return { first_name: first, last_name: last }
}

async function upsertProject(row: CsvRow, opts: { dryRun: boolean }) {
  const projectIdRaw = norm(row.ProjectId)
  if (!projectIdRaw) return { projectId: null as string | null, cwProjectId: null as string | null }

  const cwProjectId = `CW-${projectIdRaw}`
  const projectName = norm(row.Title) || `CW Project ${projectIdRaw}`

  const project_type = Array.from(
    new Set([
      ...(splitList(row.ProjectType) || []),
      ...(splitList(row.ProductType) || []),
      ...(splitList(row.ConstructionType) || []),
      ...(splitList(row.BuildingType) || []),
    ].filter(Boolean))
  )

  const projectStage = normalizeStage(row.Stage || row.ProjectSchedule || row.ProjectType)
  const unitsCount = parseUnitsCountToNumber(row.UnitsCount)
  const projectValue = parseProjectValueToDollars(row.ProjectValue)
  const lat = parseMaybeNumber(row.Latitude)
  const lng = parseMaybeNumber(row.Longitude)

  const address =
    looksLikeStreetAddress(row.LocationInfo) ? norm(row.LocationInfo) :
    looksLikeStreetAddress(row.Location) ? norm(row.Location) :
    null

  const lastUpdatedIso = parseMdyToIso(row.UpdatedDate) || parseMdyToIso(row.SubmittedDate)

  const notesPieces = [norm(row.ProjectDetails), norm(row.ProjectNotes)].filter(Boolean)
  const notes = notesPieces.length ? notesPieces.join('\n\n') : null

  const searchableText = [projectName, notes || '', norm(row.LocationInfo), norm(row.ProjectSchedule)].join('\n')
  const keywordSignals = detectKeywords(searchableText)
  const brandFlags = detectBrandFlags(searchableText)
  const inferredServices = inferServicesNeededFromSignals(keywordSignals)

  // Timing bucket (GO NOW / CAUTION / RETROFIT) from stage + signals
  const timingBucket =
    keywordSignals.pip || keywordSignals.garden_style || keywordSignals.historic
      ? 'retrofit'
      : projectStage === 'planning' || projectStage === 'design' || projectStage === 'pre_construction'
        ? 'go_now'
        : projectStage === 'construction'
          ? 'caution'
          : 'monitor'

  // Best-effort start-date parsing
  const estimatedStartDate =
    parseMonthYearToIso(row.ConstructionDate) ||
    null

  const scoringInput = {
    project_type,
    project_stage: projectStage,
    project_value: projectValue || 0,
    project_size_sqft: undefined,
    units_count: unitsCount ?? undefined,
    services_needed: inferredServices,
    decision_timeline: undefined,
    city: norm(row.City) || undefined,
    state: norm(row.State) || undefined,
    estimated_start_date: estimatedStartDate,
    notes: notes || undefined,
    raw_data: {
      signals: {
        ...keywordSignals,
        brandFlags,
        timingBucket,
      },
    },
  }

  const grooveFitScore = calculateGrooveScore(scoringInput as any)
  const timingScore = calculateTimingScore(scoringInput as any)
  const priorityLevel = grooveFitScore >= 80 ? 'hot' : grooveFitScore >= 60 ? 'warm' : 'cold'

  const projectData = {
    organization_id: ORGANIZATION_ID,
    cw_project_id: cwProjectId,
    project_name: projectName,
    project_type: project_type.length ? project_type : null,
    project_stage: projectStage,
    project_value: projectValue,
    units_count: unitsCount,
    address,
    city: norm(row.City) || 'Unknown',
    state: norm(row.State) || 'Unknown',
    zip: norm(row.PostalCode) || null,
    county: norm(row.County) || null,
    latitude: lat,
    longitude: lng,
    estimated_start_date: estimatedStartDate,
    groove_fit_score: grooveFitScore,
    timing_score: timingScore,
    // NOTE: total_score is a computed/generated column in some DB schemas. Do not write to it.
    priority_level: priorityLevel,
    outreach_status: 'new',
    data_source: 'construction_wire_csv',
    scraped_at: new Date().toISOString(),
    last_updated: lastUpdatedIso,
    notes,
    services_needed: inferredServices.length ? inferredServices : null,
    raw_data: {
      source: 'construction_wire_csv',
      imported_at: new Date().toISOString(),
      cw: {
        ProjectId: row.ProjectId,
        Stage: row.Stage,
        Sector: row.Sector,
        ConstructionType: row.ConstructionType,
        ProjectType: row.ProjectType,
        ProductType: row.ProductType,
        BuildingType: row.BuildingType,
        BuildingCount: row.BuildingCount,
        ProjectSchedule: row.ProjectSchedule,
        ConstructionDate: row.ConstructionDate,
        SubmittedDate: row.SubmittedDate,
        UpdatedDate: row.UpdatedDate,
      },
      signals: {
        ...keywordSignals,
        brandFlags,
        timingBucket,
      },
    },
  }

  if (opts.dryRun) {
    return { projectId: null as string | null, cwProjectId }
  }

  const { data, error } = await (supabase as any)
    .from('projects')
    .upsert(projectData, { onConflict: 'cw_project_id' })
    .select('id')
    .single()

  if (error) throw error
  return { projectId: data?.id as string, cwProjectId }
}

async function upsertCompany(companyName: string, meta: { website?: string | null; phone?: string | null; city?: string | null; state?: string | null; address?: string | null }, opts: { dryRun: boolean }) {
  const name = norm(companyName)
  if (!name) return null as string | null
  if (opts.dryRun) return null

  const { data: existing } = await (supabase as any)
    .from('companies')
    .select('id')
    .eq('organization_id', ORGANIZATION_ID)
    .eq('company_name', name)
    .limit(1)
    .maybeSingle()

  if (existing?.id) return existing.id as string

  const { data, error } = await (supabase as any)
    .from('companies')
    .insert({
      organization_id: ORGANIZATION_ID,
      company_name: name,
      website: meta.website || null,
      phone: meta.phone || null,
      city: meta.city || null,
      state: meta.state || null,
      address: meta.address || null,
    })
    .select('id')
    .single()

  if (error) throw error
  return data?.id as string
}

async function upsertContact(input: { name?: string; title?: string; email?: string; phone?: string }, opts: { dryRun: boolean }) {
  const email = norm(input.email).toLowerCase() || null
  const phone = norm(input.phone) || null
  const title = norm(input.title) || null

  if (!email && !phone) return null as string | null
  if (opts.dryRun) return null

  let existing: { id: string } | null = null

  if (email) {
    const { data } = await (supabase as any).from('contacts').select('id').eq('email', email).maybeSingle()
    if (data?.id) existing = data
  }
  if (!existing && phone) {
    const { data } = await (supabase as any).from('contacts').select('id').eq('phone', phone).maybeSingle()
    if (data?.id) existing = data
  }

  let firstLast = splitName(input.name)
  if ((!input.name || !norm(input.name)) && email) {
    const derived = nameFromEmail(email)
    if (derived) {
      firstLast = { first_name: derived.first, last_name: derived.last }
    }
  }

  if (existing?.id) {
    await (supabase as any)
      .from('contacts')
      .update({
        first_name: firstLast.first_name || undefined,
        last_name: firstLast.last_name || undefined,
        title: title || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
    return existing.id
  }

  const cwContactId = `CWC-${email || phone}-${Date.now()}`
  const { data, error } = await (supabase as any)
    .from('contacts')
    .insert({
      organization_id: ORGANIZATION_ID,
      cw_contact_id: cwContactId,
      first_name: firstLast.first_name || 'Unknown',
      last_name: firstLast.last_name || 'Contact',
      title,
      email,
      phone,
      response_status: 'not_contacted',
    })
    .select('id')
    .single()

  if (error) throw error
  return data?.id as string
}

async function linkStakeholder(opts: { dryRun: boolean; projectId: string; contactId: string | null; companyId: string | null; role: string; isPrimary: boolean }) {
  if (opts.dryRun) return
  if (!opts.contactId) return
  await (supabase as any)
    .from('project_stakeholders')
    .upsert(
      {
        project_id: opts.projectId,
        contact_id: opts.contactId,
        company_id: opts.companyId,
        role_in_project: opts.role,
        is_primary: opts.isPrimary,
      },
      { onConflict: 'project_id,contact_id' }
    )
}

function extractStakeholders(row: CsvRow) {
  const roles = [
    { prefix: 'Owner', count: 3, role: 'owner' },
    { prefix: 'Developer', count: 3, role: 'developer' },
    { prefix: 'Contractor', count: 2, role: 'contractor' },
    { prefix: 'PropertyManager', count: 1, role: 'property_manager' },
  ] as const

  const out: Array<{
    role: string
    companyName?: string
    companyUrl?: string
    contactName?: string
    contactTitle?: string
    contactEmail?: string
    contactPhone?: string
    locationAddress1?: string
    locationAddress2?: string
    locationCity?: string
    locationState?: string
    locationPostalCode?: string
    locationPhone?: string
  }> = []

  for (const r of roles) {
    for (let i = 1; i <= r.count; i++) {
      const companyName = row[`${r.prefix}${String(i).padStart(2, '0')}CompanyName`] || row[`${r.prefix}${i}CompanyName`]
      const companyUrl = row[`${r.prefix}${String(i).padStart(2, '0')}CompanyUrl`] || row[`${r.prefix}${i}CompanyUrl`]
      const contactName = row[`${r.prefix}${String(i).padStart(2, '0')}ContactName`] || row[`${r.prefix}${i}ContactName`]
      const contactTitle = row[`${r.prefix}${String(i).padStart(2, '0')}ContactTitle`] || row[`${r.prefix}${i}ContactTitle`]
      const contactPhone = row[`${r.prefix}${String(i).padStart(2, '0')}ContactPhone`] || row[`${r.prefix}${i}ContactPhone`]
      const contactEmail = row[`${r.prefix}${String(i).padStart(2, '0')}ContactEmail`] || row[`${r.prefix}${i}ContactEmail`]
      const locationAddress1 = row[`${r.prefix}${String(i).padStart(2, '0')}LocationAddress1`] || row[`${r.prefix}${i}LocationAddress1`]
      const locationAddress2 = row[`${r.prefix}${String(i).padStart(2, '0')}LocationAddress2`] || row[`${r.prefix}${i}LocationAddress2`]
      const locationCity = row[`${r.prefix}${String(i).padStart(2, '0')}LocationCity`] || row[`${r.prefix}${i}LocationCity`]
      const locationState = row[`${r.prefix}${String(i).padStart(2, '0')}LocationState`] || row[`${r.prefix}${i}LocationState`]
      const locationPostalCode = row[`${r.prefix}${String(i).padStart(2, '0')}LocationPostalCode`] || row[`${r.prefix}${i}LocationPostalCode`]
      const locationPhone = row[`${r.prefix}${String(i).padStart(2, '0')}LocationPhone`] || row[`${r.prefix}${i}LocationPhone`]

      const any =
        norm(companyName) ||
        norm(contactName) ||
        norm(contactEmail) ||
        norm(contactPhone)

      if (!any) continue

      out.push({
        role: r.role,
        companyName: companyName,
        companyUrl: companyUrl,
        contactName: contactName,
        contactTitle: contactTitle,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
        locationAddress1,
        locationAddress2,
        locationCity,
        locationState,
        locationPostalCode,
        locationPhone,
      })
    }
  }

  return out
}

async function main() {
  const filePath = getArgValue('--file') || process.argv[2]
  const limitRaw = getArgValue('--limit')
  const dryRun = hasFlag('--dry-run') || hasFlag('--dryrun') || hasFlag('--dry-run=true')
  const limit = limitRaw ? parseInt(limitRaw, 10) : null

  if (!filePath) {
    console.error('❌ Missing --file. Usage: tsx scripts/import-construction-wire-download.ts --file "/path/to/download.csv"')
    process.exit(1)
  }

  console.log('🏗️  CW CSV Importer')
  console.log(`   File: ${filePath}`)
  console.log(`   Org: ${ORGANIZATION_ID}`)
  console.log(`   Dry run: ${dryRun ? 'YES' : 'NO'}`)
  console.log(`   Limit: ${limit ?? 'none'}`)
  console.log('━'.repeat(60))

  const csvContent = readFileSync(filePath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  }) as CsvRow[]

  const total = limit ? Math.min(limit, records.length) : records.length
  console.log(`📄 Parsed ${records.length} rows; processing ${total}`)

  let processed = 0
  let projectUpserts = 0
  let contactsUpserts = 0
  let stakeholderLinks = 0
  let companyUpserts = 0
  let skipped = 0

  for (const row of records.slice(0, total)) {
    processed++
    try {
      const { projectId, cwProjectId } = await upsertProject(row, { dryRun })
      projectUpserts++

      // In dry-run we stop here (no DB ids to link).
      if (dryRun || !projectId) continue

      const stakeholders = extractStakeholders(row)
      let primaryByRole = new Set<string>()

      for (const s of stakeholders) {
        const companyId = s.companyName
          ? await upsertCompany(
              s.companyName,
              {
                website: norm(s.companyUrl) || null,
                phone: norm(s.locationPhone) || null,
                city: norm(s.locationCity) || null,
                state: norm(s.locationState) || null,
                address: [norm(s.locationAddress1), norm(s.locationAddress2)].filter(Boolean).join(' ') || null,
              },
              { dryRun }
            )
          : null
        if (companyId) companyUpserts++

        const contactId = await upsertContact(
          {
            name: s.contactName,
            title: s.contactTitle,
            email: s.contactEmail,
            phone: s.contactPhone,
          },
          { dryRun }
        )
        if (contactId) contactsUpserts++

        const isPrimary = !primaryByRole.has(s.role)
        if (isPrimary) primaryByRole.add(s.role)

        await linkStakeholder({
          dryRun,
          projectId,
          contactId,
          companyId,
          role: s.role,
          isPrimary,
        })
        if (contactId) stakeholderLinks++
      }

      if (processed % 25 === 0) {
        console.log(`   … ${processed}/${total} processed (last: ${cwProjectId || 'n/a'})`)
      }
    } catch (e: any) {
      skipped++
      const id = norm(row.ProjectId) || 'n/a'
      console.warn(`⚠️  Skipped ProjectId=${id}: ${e?.message || String(e)}`)
    }
  }

  console.log('━'.repeat(60))
  console.log('✅ Import finished')
  console.log(`   Rows processed: ${processed}`)
  console.log(`   Project upserts: ${projectUpserts}`)
  console.log(`   Company upserts (best-effort): ${companyUpserts}`)
  console.log(`   Contact upserts: ${contactsUpserts}`)
  console.log(`   Stakeholder links: ${stakeholderLinks}`)
  console.log(`   Skipped: ${skipped}`)
  if (dryRun) {
    console.log('\n(dry-run mode: no DB writes were performed)')
  }
}

main().catch((err) => {
  console.error('💥 Import failed:', err?.message || err)
  process.exit(1)
})


