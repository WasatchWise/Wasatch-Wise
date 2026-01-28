#!/usr/bin/env tsx

/**
 * Select "PDF enrichment candidates" from imported ConstructionWire CSV projects.
 *
 * Goal:
 * - Given a limited CW download budget, pick a small subset of projects worth downloading PDFs for.
 * - Favor: GO NOW timing, high unit count, strong amenity/tech signals, and missing person emails.
 *
 * Usage:
 *   npm run select:pdf-candidates -- --limit=25
 *   npm run select:pdf-candidates -- --limit=50 --minScore=70
 *   npm run select:pdf-candidates -- --limit=25 --only-missing-contacts
 *
 * Env required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ORGANIZATION_ID
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local for local dev
const isGitHubActions = !!process.env.GITHUB_ACTIONS
const isCI = !!process.env.CI
if (!isGitHubActions && !isCI) config({ path: '.env.local' })

// Ensure fetch exists (supabase-js depends on it in Node runtimes).
// Some environments still run Node without global fetch, or with it unset.
async function ensureFetch() {
  const anyGlobal = globalThis as any
  if (typeof anyGlobal.fetch === 'function') return
  try {
    const undici = await import('undici')
    anyGlobal.fetch = undici.fetch
    anyGlobal.Headers = undici.Headers
    anyGlobal.Request = undici.Request
    anyGlobal.Response = undici.Response
  } catch {
    // If this fails, Supabase will throw later; we'll print a helpful error.
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const ORGANIZATION_ID = process.env.ORGANIZATION_ID

if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
if (!supabaseKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
if (!ORGANIZATION_ID) throw new Error('ORGANIZATION_ID is required')

let supabase = createClient(supabaseUrl, supabaseKey)

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

function norm(s?: string | null): string {
  return (s || '').trim()
}

function toNumber(v: any): number | null {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

type ProjectRow = {
  id: string
  cw_project_id: string
  project_name: string
  project_stage: string
  project_value: number | null
  units_count: number | null
  city: string | null
  state: string | null
  groove_fit_score: number | null
  timing_score: number | null
  priority_level: string | null
  raw_data: any
  services_needed: string[] | null
  last_updated: string | null
  data_source: string | null
}

function scoreCandidate(p: ProjectRow, hasAnyEmailContact: boolean): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  const units = p.units_count || 0
  const value = p.project_value || 0
  const stage = (p.project_stage || '').toLowerCase()
  const signals = (p.raw_data?.signals || {}) as any
  const timingBucket = signals?.timingBucket || 'unknown'
  const services = Array.isArray(p.services_needed) ? p.services_needed : []

  // Core: missing contacts (PDF is likely to add value)
  if (!hasAnyEmailContact) {
    score += 30
    reasons.push('missing_person_email')
  }

  // GO NOW timing / stage
  if (timingBucket === 'go_now') {
    score += 20
    reasons.push('go_now')
  }
  if (stage.includes('planning') || stage.includes('design') || stage.includes('pre')) {
    score += 10
    reasons.push(`stage:${p.project_stage}`)
  }

  // Size thresholds (playbook)
  if (units >= 350) {
    score += 15
    reasons.push('units>=350')
  } else if (units >= 251) {
    score += 10
    reasons.push('units>=251')
  }

  if (value >= 100_000_000) {
    score += 10
    reasons.push('value>=100M')
  } else if (value >= 50_000_000) {
    score += 6
    reasons.push('value>=50M')
  }

  // Signal triggers from notes/PDF
  if (signals.amenities) {
    score += 5
    reasons.push('amenities')
  }
  if (signals.technologies) {
    score += 5
    reasons.push('technologies')
  }
  if (signals.internet_included) {
    score += 6
    reasons.push('internet_included')
  }
  if (signals.smart_locks) {
    score += 4
    reasons.push('smart_locks/access_control')
  }
  if (signals.concrete_steel_leed) {
    score += 3
    reasons.push('concrete/steel/leed')
  }
  if (signals.pip || signals.garden_style || signals.historic) {
    score += 6
    reasons.push('retrofit_trigger')
  }

  // Service inference (proxy for bundle opportunity)
  const serviceHit = (k: string) => services.some((s) => (s || '').toLowerCase().includes(k))
  if (serviceHit('internet') || serviceHit('wifi')) {
    score += 3
    reasons.push('service:wifi/internet')
  }
  if (serviceHit('directv') || serviceHit('tv')) {
    score += 2
    reasons.push('service:tv')
  }
  if (serviceHit('access')) {
    score += 2
    reasons.push('service:access')
  }

  // Use existing groove score as tie-breaker
  const groove = p.groove_fit_score || 0
  score += Math.min(15, Math.floor(groove / 10)) // up to +15

  return { score, reasons }
}

async function main() {
  await ensureFetch()
  // Recreate client after fetch polyfill (safest for environments with late polyfill)
  supabase = createClient(supabaseUrl, supabaseKey)

  const limit = parseInt(getArgValue('--limit') || '25', 10)
  const minScore = parseInt(getArgValue('--minScore') || '0', 10)
  const onlyMissingContacts = hasFlag('--only-missing-contacts')

  console.log('📌 Selecting PDF candidates')
  console.log(`   Org: ${ORGANIZATION_ID}`)
  console.log(`   node: ${process.version}`)
  console.log(`   fetch: ${typeof (globalThis as any).fetch}`)
  console.log(`   supabase: ${supabaseUrl}`)
  console.log(`   limit: ${limit}`)
  console.log(`   minScore: ${minScore}`)
  console.log(`   onlyMissingContacts: ${onlyMissingContacts}`)
  console.log('━'.repeat(60))

  // Connectivity probe (helps diagnose "fetch failed")
  try {
    const resp = await (globalThis as any).fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    })
    console.log(`   probe: ${resp.status} ${resp.statusText}`)
  } catch (e: any) {
    console.log(`   probe: FAILED (${e?.message || String(e)})`)
    if (e?.cause) console.log(`   probe.cause: ${e.cause?.message || String(e.cause)}`)
  }

  // 1) Fetch recently imported CW projects (CSV)
  // Pull a reasonable pool, then rank locally.
  const { data: projects, error: projErr } = await (supabase as any)
    .from('projects')
    .select(
      'id,cw_project_id,project_name,project_stage,project_value,units_count,city,state,groove_fit_score,timing_score,priority_level,raw_data,services_needed,last_updated,data_source'
    )
    .eq('organization_id', ORGANIZATION_ID)
    .eq('data_source', 'construction_wire_csv')
    .order('last_updated', { ascending: false })
    .limit(1500)

  if (projErr) {
    console.error('❌ Projects query failed:', projErr)
    console.error('   Code:', projErr.code)
    console.error('   Details:', projErr.details)
    console.error('   Hint:', projErr.hint)
    throw projErr
  }
  const rows: ProjectRow[] = projects || []
  if (!rows.length) {
    console.log('No projects found for data_source=construction_wire_csv')
    return
  }

  // 2) Find which projects already have at least one email contact linked
  // Use two-step query (avoid joins to reduce query complexity)
  const projectIds = rows.map((r) => r.id)
  const { data: stakeholderRows, error: psErr } = await (supabase as any)
    .from('project_stakeholders')
    .select('project_id, contact_id')
    .in('project_id', projectIds)
    .not('contact_id', 'is', null)

  if (psErr) {
    console.error('❌ Stakeholder query failed:', psErr)
    console.error('   Code:', psErr.code)
    console.error('   Details:', psErr.details)
    console.error('   Hint:', psErr.hint)
    throw psErr
  }

  // Get unique contact IDs
  const contactIds = [...new Set((stakeholderRows || []).map((ps: any) => ps.contact_id).filter(Boolean))]
  const projectsWithEmail = new Set<string>()

  if (contactIds.length > 0) {
    // Fetch contacts to check which have emails
    const { data: contacts, error: contactErr } = await (supabase as any)
      .from('contacts')
      .select('id, email')
      .in('id', contactIds)
      .not('email', 'is', null)

    if (contactErr) {
      console.error('❌ Contact query failed:', contactErr)
      // Non-fatal: just assume no contacts have emails
    } else {
      const contactIdsWithEmail = new Set((contacts || []).map((c: any) => c.id).filter(Boolean))
      // Map back to projects
      for (const ps of stakeholderRows || []) {
        if (contactIdsWithEmail.has(ps.contact_id)) {
          projectsWithEmail.add(ps.project_id)
        }
      }
    }
  }

  const ranked = rows
    .map((p) => {
      const hasEmail = projectsWithEmail.has(p.id)
      const s = scoreCandidate(p, hasEmail)
      return { p, hasEmail, score: s.score, reasons: s.reasons }
    })
    .filter((x) => x.score >= minScore)
    .filter((x) => (onlyMissingContacts ? !x.hasEmail : true))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  console.log(`Selected ${ranked.length} candidates`)
  console.log('')
  console.log('CW ProjectId,Name,Location,Units,Stage,GrooveScore,HasEmailContact,Reasons')
  for (const r of ranked) {
    const cwId = r.p.cw_project_id?.replace(/^CW-/, '') || ''
    const loc = [norm(r.p.city), norm(r.p.state)].filter(Boolean).join(', ')
    const units = r.p.units_count ?? ''
    const stage = norm(r.p.project_stage)
    const groove = r.p.groove_fit_score ?? ''
    const hasEmail = r.hasEmail ? 'yes' : 'no'
    const reasons = r.reasons.slice(0, 6).join('|')
    console.log(`${cwId},"${r.p.project_name.replace(/"/g, '""')}",${loc},${units},${stage},${groove},${hasEmail},${reasons}`)
  }

  console.log('\nTip: download PDFs only for these ProjectIds (CW UI: Project #<id>).')
}

main().catch((err) => {
  console.error('💥 Failed selecting candidates:', err?.message || err)
  if (err?.cause) console.error('cause:', err.cause?.message || err.cause)
  if (err?.stack) console.error(err.stack)
  process.exit(1)
})


