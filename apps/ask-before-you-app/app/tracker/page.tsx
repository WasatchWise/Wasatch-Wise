'use client'

import { useState, useMemo, Fragment } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { STATE_FOUNDATION } from '@/lib/ecosystem'
import type { StateFoundation } from '@/lib/ecosystem'

type SortField = 'name' | 'sdpc' | 'ai' | 'dpa' | 'laws'
type SortDir = 'asc' | 'desc'
type FilterCategory = 'all' | 'sdpc' | 'no-sdpc' | 'has-ai' | 'no-ai' | 'has-dpa' | 'no-dpa'

function getAiStatus(s: StateFoundation): 'active' | 'emerging' | 'none' {
  const notes = (s.aiGovernanceNotes || '').toLowerCase()
  if (!notes || notes.includes('no formal') || notes.includes('no specific') || notes.includes('no dedicated') || notes.includes('no statewide')) return 'none'
  if (notes.includes('framework') || notes.includes('policy') || notes.includes('committee') || notes.includes('task force') || notes.includes('guidelines') || notes.includes('executive order')) return 'active'
  return 'emerging'
}

function AiBadge({ status }: { status: 'active' | 'emerging' | 'none' }) {
  if (status === 'active') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
  if (status === 'emerging') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Emerging</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">None</span>
}

export default function TrackerPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [expandedState, setExpandedState] = useState<string | null>(null)

  const states = useMemo(() => Object.values(STATE_FOUNDATION), [])

  const filtered = useMemo(() => {
    let result = states

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.agencyName || '').toLowerCase().includes(q) ||
        s.stateLaws.some(l => l.name.toLowerCase().includes(q))
      )
    }

    // Filter
    if (filter === 'sdpc') result = result.filter(s => s.sdpcMember)
    if (filter === 'no-sdpc') result = result.filter(s => !s.sdpcMember)
    if (filter === 'has-ai') result = result.filter(s => getAiStatus(s) !== 'none')
    if (filter === 'no-ai') result = result.filter(s => getAiStatus(s) === 'none')
    if (filter === 'has-dpa') result = result.filter(s => s.dpaAvailable === true)
    if (filter === 'no-dpa') result = result.filter(s => !s.dpaAvailable)

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'sdpc': cmp = (a.sdpcMember ? 1 : 0) - (b.sdpcMember ? 1 : 0); break
        case 'ai': {
          const order = { active: 2, emerging: 1, none: 0 }
          cmp = order[getAiStatus(a)] - order[getAiStatus(b)]
          break
        }
        case 'dpa': cmp = (a.dpaAvailable ? 1 : 0) - (b.dpaAvailable ? 1 : 0); break
        case 'laws': cmp = a.stateLaws.length - b.stateLaws.length; break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [states, search, filter, sortField, sortDir])

  // Stats
  const sdpcCount = states.filter(s => s.sdpcMember).length
  const aiActiveCount = states.filter(s => getAiStatus(s) === 'active').length
  const aiEmergingCount = states.filter(s => getAiStatus(s) === 'emerging').length
  const dpaCount = states.filter(s => s.dpaAvailable).length

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="text-slate-500 ml-1">&#8597;</span>
    return <span className="text-orange-500 ml-1">{sortDir === 'asc' ? '&#9650;' : '&#9660;'}</span>
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-400 text-sm font-medium mb-6">
              <span>🗺️</span>
              50 States + DC | Updated February 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              State Privacy{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                Tracker
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
              The definitive guide to student data privacy laws, AI governance, and SDPC membership
              across every U.S. state. Find your state. Know your landscape. Close the gap.
            </p>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-2xl font-bold text-white">{states.length}</p>
                <p className="text-slate-400 text-sm">States Tracked</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-2xl font-bold text-green-400">{sdpcCount}</p>
                <p className="text-slate-400 text-sm">SDPC Members</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-2xl font-bold text-orange-400">{aiActiveCount + aiEmergingCount}</p>
                <p className="text-slate-400 text-sm">AI Governance</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-2xl font-bold text-blue-400">{dpaCount}</p>
                <p className="text-slate-400 text-sm">DPAs Available</p>
              </div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="py-6 px-4 border-b border-gray-200 bg-white sticky top-[73px] z-40 shadow-sm">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search by state, agency, or law..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as FilterCategory)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All States ({states.length})</option>
                <option value="sdpc">SDPC Members ({sdpcCount})</option>
                <option value="no-sdpc">Non-SDPC ({states.length - sdpcCount})</option>
                <option value="has-ai">Has AI Governance ({aiActiveCount + aiEmergingCount})</option>
                <option value="no-ai">No AI Governance ({states.length - aiActiveCount - aiEmergingCount})</option>
                <option value="has-dpa">DPA Available ({dpaCount})</option>
                <option value="no-dpa">No DPA ({states.length - dpaCount})</option>
              </select>

              <p className="text-sm text-gray-500 whitespace-nowrap">
                Showing {filtered.length} of {states.length}
              </p>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 cursor-pointer hover:text-orange-600" onClick={() => toggleSort('name')}>
                      State <SortIcon field="name" />
                    </th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700 cursor-pointer hover:text-orange-600" onClick={() => toggleSort('sdpc')}>
                      SDPC <SortIcon field="sdpc" />
                    </th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700 cursor-pointer hover:text-orange-600" onClick={() => toggleSort('ai')}>
                      AI Gov. <SortIcon field="ai" />
                    </th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700 cursor-pointer hover:text-orange-600" onClick={() => toggleSort('dpa')}>
                      DPA <SortIcon field="dpa" />
                    </th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700 cursor-pointer hover:text-orange-600" onClick={() => toggleSort('laws')}>
                      Laws <SortIcon field="laws" />
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">
                      Key Notes
                    </th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(state => {
                    const aiStatus = getAiStatus(state)
                    const isExpanded = expandedState === state.code
                    const isUtah = state.code === 'UT'
                    return (
                      <Fragment key={state.code}>
                        <tr
                          className={`border-b border-gray-100 hover:bg-orange-50/50 transition-colors cursor-pointer ${isUtah ? 'bg-orange-50/30' : ''} ${isExpanded ? 'bg-orange-50' : ''}`}
                          onClick={() => setExpandedState(isExpanded ? null : state.code)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{state.name}</span>
                              <span className="text-xs text-gray-400">({state.code})</span>
                              {isUtah && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">MODEL</span>
                              )}
                            </div>
                          </td>
                          <td className="text-center px-3 py-3">
                            {state.sdpcMember
                              ? <span className="text-green-600 font-bold" title="SDPC Member">&#10003;</span>
                              : <span className="text-gray-300">&mdash;</span>
                            }
                          </td>
                          <td className="text-center px-3 py-3">
                            <AiBadge status={aiStatus} />
                          </td>
                          <td className="text-center px-3 py-3">
                            {state.dpaAvailable
                              ? <span className="text-green-600 font-bold" title="DPA Available">&#10003;</span>
                              : <span className="text-gray-300">&mdash;</span>
                            }
                          </td>
                          <td className="text-center px-3 py-3">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${state.stateLaws.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                              {state.stateLaws.length}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs hidden lg:table-cell max-w-xs truncate" title={state.complianceSummary || ''}>
                            {state.complianceSummary || 'No data available'}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isExpanded && (
                          <tr key={`${state.code}-detail`} className="bg-slate-50 border-b border-gray-200">
                            <td colSpan={7} className="px-4 py-6">
                              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                                {/* Left column */}
                                <div className="space-y-4">
                                  {/* Agency */}
                                  {state.agencyName && (
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">State Agency</h4>
                                      <p className="text-sm text-gray-800">{state.agencyName}</p>
                                    </div>
                                  )}

                                  {/* Privacy Laws */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Privacy Laws</h4>
                                    {state.stateLaws.length > 0 ? (
                                      <ul className="space-y-2">
                                        {state.stateLaws.map((law, i) => (
                                          <li key={i} className="text-sm">
                                            <span className="font-medium text-gray-900">{law.name}</span>
                                            {law.code && <span className="text-gray-500 text-xs ml-1">({law.code})</span>}
                                            {law.description && <p className="text-gray-600 text-xs mt-0.5">{law.description}</p>}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-sm text-gray-500 italic">No state-specific student data privacy laws. Federal laws (FERPA, COPPA) apply.</p>
                                    )}
                                    {state.federalLawsNote && (
                                      <p className="text-xs text-gray-500 mt-2">Federal: {state.federalLawsNote}</p>
                                    )}
                                  </div>

                                  {/* Compliance */}
                                  {state.complianceSummary && (
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Compliance Requirements</h4>
                                      <p className="text-sm text-gray-700">{state.complianceSummary}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Right column */}
                                <div className="space-y-4">
                                  {/* AI Governance */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">AI Governance</h4>
                                    {state.aiGovernanceNotes ? (
                                      <p className="text-sm text-gray-700">{state.aiGovernanceNotes}</p>
                                    ) : (
                                      <p className="text-sm text-gray-500 italic">No formal AI governance framework identified.</p>
                                    )}
                                  </div>

                                  {/* Roles */}
                                  {state.requiredRolesSummary && (
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Required Roles</h4>
                                      <p className="text-sm text-gray-700">{state.requiredRolesSummary}</p>
                                    </div>
                                  )}

                                  {/* Contact */}
                                  {(state.contactEmail || state.contactPhone || state.website) && (
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Contact</h4>
                                      <div className="text-sm text-gray-700 space-y-1">
                                        {state.contactEmail && <p>Email: <a href={`mailto:${state.contactEmail}`} className="text-orange-600 hover:underline">{state.contactEmail}</a></p>}
                                        {state.contactPhone && <p>Phone: {state.contactPhone}</p>}
                                        {state.website && <p>Web: <a href={state.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">{state.website}</a></p>}
                                      </div>
                                    </div>
                                  )}

                                  {/* DPA Status */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">DPA Status</h4>
                                    <p className="text-sm text-gray-700">
                                      {state.dpaAvailable ? 'State-level DPA template available.' : 'No state-level DPA template identified. Districts may use the NDPA standard.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Gap Analysis CTA */}
                                <div className="md:col-span-2 mt-2">
                                  <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg p-4 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {aiStatus === 'none' && !state.dpaAvailable && state.stateLaws.length === 0
                                          ? `${state.name} has significant gaps in student data privacy infrastructure.`
                                          : aiStatus === 'none'
                                          ? `${state.name} has privacy laws but no formal AI governance framework yet.`
                                          : `See how ${state.name} compares to the Utah model.`
                                        }
                                      </p>
                                      <p className="text-xs text-gray-600 mt-0.5">
                                        Take the AI Readiness Quiz to find out where your district stands.
                                      </p>
                                    </div>
                                    <Link
                                      href="/tools/ai-readiness-quiz"
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap flex-shrink-0"
                                    >
                                      Take the Quiz
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                      </svg>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Utah Spotlight */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-center shadow-xl">
              <span className="text-4xl mb-4 block">🏔️</span>
              <h2 className="text-2xl font-bold text-white mb-3">Utah: The Model State</h2>
              <p className="text-orange-50 max-w-2xl mx-auto mb-6">
                Utah went from 8% to 92% data privacy compliance across 150+ LEAs over approximately four years.
                With 1,000+ vendor agreements, a dedicated state alliance, and comprehensive compliance frameworks,
                Utah is the proof of concept for every other state.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/ecosystem/ut"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
                >
                  Explore Utah&apos;s Full Ecosystem
                </Link>
                <Link
                  href="/utah-agreements"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-700/50 text-white font-semibold rounded-xl hover:bg-orange-700/70 transition-colors border border-orange-400/30"
                >
                  Browse 1,000+ Vendor Agreements
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <section className="py-16 px-4 bg-slate-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to close the gap?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you need a policy template, a board-ready briefing, or a full governance framework,
              we have resources for every starting point.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Link href="/tools/ai-readiness-quiz" className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                <span className="text-2xl">📊</span>
                <span className="font-semibold text-gray-900">AI Readiness Quiz</span>
                <span className="text-xs text-gray-500">Free, 5 minutes</span>
              </Link>
              <a href="https://wasatchwise.com/pricing" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                <span className="text-2xl">📋</span>
                <span className="font-semibold text-gray-900">AI Governance Starter Kit</span>
                <span className="text-xs text-gray-500">$79 - 3 professional PDFs</span>
              </a>
              <a href="https://calendar.app.google/9dJThZezeRbb4T486" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                <span className="text-2xl">📞</span>
                <span className="font-semibold text-gray-900">15-Min Consultation</span>
                <span className="text-xs text-gray-500">Free, no obligation</span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-gray-200">
          <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
            <p>
              Data sourced from state education departments, the{' '}
              <a href="https://privacy.a4l.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                SDPC Framework
              </a>
              , and the{' '}
              <a href="https://a4l.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                A4L Community
              </a>
              . Last verified February 2026.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Built by <a href="https://wasatchwise.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">WasatchWise</a> | Powered by{' '}
              <a href="/" className="text-orange-500 hover:underline">Ask Before You App</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
