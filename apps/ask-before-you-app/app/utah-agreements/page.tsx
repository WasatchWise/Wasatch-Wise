'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink, Mountain } from 'lucide-react'

const PAGE_SIZE = 25
const STATUS_OPTIONS = ['Active', 'Inactive', 'Needs Attention'] as const

type UtahAgreement = {
  id: string
  company: string | null
  product: string | null
  originator: string | null
  type: string | null
  status: string | null
  expiration_notes: string | null
  date_approved: string | null
  expires_on: string | null
}

export default function UtahAgreementsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [originatorFilter, setOriginatorFilter] = useState<string>('')
  const [rows, setRows] = useState<UtahAgreement[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [originators, setOriginators] = useState<string[]>([])

  const supabase = createClient()

  const fetchOriginators = useCallback(async () => {
    const { data } = await supabase
      .from('utah_agreements')
      .select('originator')
      .not('originator', 'is', null)
    const uniq = [...new Set((data || []).map((r) => r.originator).filter(Boolean) as string[])].sort()
    setOriginators(uniq)
  }, [supabase])

  const fetchData = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('utah_agreements')
      .select('id, company, product, originator, type, status, expiration_notes, date_approved, expires_on', { count: 'exact' })

    if (query.trim()) {
      const term = `%${query.trim()}%`
      q = q.or(`company.ilike.${term},product.ilike.${term},originator.ilike.${term}`)
    }
    if (statusFilter) {
      q = q.eq('status', statusFilter)
    }
    if (originatorFilter) {
      q = q.eq('originator', originatorFilter)
    }

    const from = page * PAGE_SIZE
    const { data, count, error } = await q
      .order('company', { ascending: true, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error(error)
      setRows([])
      setTotal(0)
    } else {
      setRows((data as UtahAgreement[]) || [])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [supabase, query, statusFilter, originatorFilter, page])

  useEffect(() => {
    fetchOriginators()
  }, [fetchOriginators])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link href="/" className="text-orange-600 hover:underline">Ask Before You App</Link>
              <span>/</span>
              <Link href="/ecosystem/ut" className="text-[#005696] hover:underline">Utah</Link>
              <span>/</span>
              <span className="text-slate-700 font-medium">Vendor Agreements</span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-xl bg-[#005696]/10 flex items-center justify-center">
                <Mountain className="w-7 h-7 text-[#005696]" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  Utah Vendor Agreement Registry
                </h1>
                <p className="text-slate-600 mt-1">
                  Search {total > 0 ? total.toLocaleString() : '1,000+'} vendor and product agreements—DPAs, NDPA exhibits, and statewide contracts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <div className="max-w-6xl mx-auto px-4 py-6 sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="search"
                placeholder="Search company, product, or district..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#005696] focus:ring-2 focus:ring-[#005696]/20 outline-none transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(0)
                }}
                className="px-4 py-3 rounded-xl border border-slate-300 focus:border-[#005696] focus:ring-2 focus:ring-[#005696]/20 outline-none bg-white"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={originatorFilter}
                onChange={(e) => {
                  setOriginatorFilter(e.target.value)
                  setPage(0)
                }}
                className="px-4 py-3 rounded-xl border border-slate-300 focus:border-[#005696] focus:ring-2 focus:ring-[#005696]/20 outline-none bg-white min-w-[180px]"
              >
                <option value="">All districts / charters</option>
                {originators.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <button
                onClick={() => fetchData()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#005696] text-white font-semibold hover:bg-[#004577] transition-colors"
              >
                <Filter className="w-4 h-4" />
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-pulse text-slate-400">Loading agreements...</div>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-slate-600">No agreements match your search.</p>
              <button
                onClick={() => {
                  setQuery('')
                  setStatusFilter('')
                  setOriginatorFilter('')
                  setPage(0)
                }}
                className="mt-4 text-[#005696] font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 font-semibold text-slate-700">Company</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Product</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Originator</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-900 font-medium">{r.company || '—'}</td>
                        <td className="px-4 py-3 text-slate-700">{r.product || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{r.originator || '—'}</td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{r.type || '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              r.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : r.status === 'Needs Attention'
                                  ? 'bg-amber-100 text-amber-800'
                                  : r.status === 'Inactive'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {r.status || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{formatDate(r.expires_on)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-slate-600 text-sm">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-slate-600">
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer note */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="rounded-xl bg-slate-100 border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">
              <strong>Source:</strong> Utah Student Privacy Alliance (USPA) Agreement Hub. Data is maintained by LEAs and aggregated for reference. Last updated 09/22/2025. 
              Verify with your district or{' '}
              <a href="https://schools.utah.gov/studentdataprivacy" target="_blank" rel="noopener noreferrer" className="text-[#005696] hover:underline inline-flex items-center gap-1">
                USBE Student Data Privacy
                <ExternalLink className="w-4 h-4" />
              </a>
              {' '}for official status.
            </p>
            <p className="text-slate-600 text-sm mt-2">
              <Link href="/ecosystem/ut" className="text-[#005696] hover:underline">← Back to Utah ecosystem guide</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
