import Container from '@/components/Container'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spider Network — Internal Operations Manual v1.0',
  description: 'Internal documentation for The Rock Salt administrators.',
}

export default function SpiderManualPage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900 pb-20">
      <Container className="py-12 max-w-4xl">
        {/* Admin Header */}
        <header className="bg-white border-b-4 border-purple-600 p-8 rounded-t-2xl shadow-sm mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">
                Internal Use Only
              </div>
              <h1 className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                Spider Network — Internal Operations Manual
              </h1>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Version 1.0 | January 2026 | The Rock Salt Digital Band Manager
              </div>
            </div>
            <div className="text-right flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Classification</span>
              <span className="text-sm font-bold text-slate-900">Internal Administration</span>
              <span className="text-[10px] text-red-500 font-bold uppercase">Not for Distribution</span>
            </div>
          </div>
        </header>

        <div className="space-y-10">
          {/* Section 1: COI */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xl font-black text-purple-600">1.</span>
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">COI Enforcement Policy</h2>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-slate-600 leading-relaxed text-sm">
                The Spider Network Protocol (§10.2) requires venues to maintain general liability insurance. Enforcement varies by tier to balance professionalism with operational reality.
              </p>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                <strong className="block text-purple-900 text-xs font-black uppercase tracking-widest mb-2">Guiding Principle</strong>
                <p className="text-purple-800 text-sm italic">
                  "Tier 1 dive bars don't have their shit together. Don't make them a blocker. Tier 2+ venues can handle professional requirements."
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <th className="px-4 py-3">Tier</th>
                      <th className="px-4 py-3">Capacity</th>
                      <th className="px-4 py-3">Requirement</th>
                      <th className="px-4 py-3">Enforcement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { tier: "TIER 1", cap: "0-200", req: "Requested", enf: "Soft reminder at 14 days. Optional at load-in." },
                      { tier: "TIER 2", cap: "201-500", req: "Required 14d", enf: "Final notice at 16d. Cancel option at 14d." },
                      { tier: "TIER 3", cap: "501-1k", req: "Required 14d", enf: "Must name Artist as additional insured." },
                      { tier: "TIER 4", cap: "1,001+", req: "At Booking", enf: "Deposit withheld until COI verified." }
                    ].map((row, i) => (
                      <tr key={i} className="group">
                        <td className="px-4 py-4 font-mono font-bold text-xs text-purple-600">{row.tier}</td>
                        <td className="px-4 py-4 text-slate-600 font-medium">{row.cap}</td>
                        <td className="px-4 py-4 text-slate-900 font-bold">{row.req}</td>
                        <td className="px-4 py-4 text-xs text-slate-500 leading-relaxed">{row.enf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 2: Default Workflow */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xl font-black text-purple-600">2.</span>
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">Payment Default & Collection</h2>
              </div>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Default Timeline</h3>
                <div className="relative pl-6 space-y-8 border-l-2 border-slate-100">
                  {[
                    { day: "Day 0", status: "Due", action: "Confirm receipt per §5.1." },
                    { day: "Day 1-2", status: "Grace", action: "Send friendly reminder email." },
                    { day: "Day 3-7", status: "Late", action: "Formal notice + $50/day late fees (per §5.3)." },
                    { day: "Day 8-14", status: "Warning", action: "Final 48h warning: Status suspension imminent." },
                    { day: "Day 14+", status: "Default", action: "Suspend status. Flag in Network. Start collections." }
                  ].map((step, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-purple-500 shadow-sm"></div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-black text-purple-600 uppercase tracking-tighter">{step.day}</span>
                          <h4 className="text-sm font-bold text-slate-900">{step.status}</h4>
                        </div>
                        <p className="text-sm text-slate-500 md:max-w-md">{step.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <strong className="block text-red-900 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  ⚠️ Network Reporting
                </strong>
                <p className="text-red-800 text-sm leading-relaxed">
                  When a venue enters default status (Day 14+), their profile in the Spider Network 
                  directory is flagged. This reputation lever is our primary enforcement mechanism.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Suspension */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xl font-black text-purple-600">3.</span>
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">Suspension & Revocation</h2>
              </div>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-8 text-sm">
              <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
                <h3 className="text-amber-900 font-black uppercase tracking-widest text-xs mb-4">Suspension (Temporary)</h3>
                <ul className="space-y-3 text-amber-800 list-disc pl-4 font-medium">
                  <li>Payment default (14+ days)</li>
                  <li>COI non-compliance (Tier 2+)</li>
                  <li>Single safety violation</li>
                  <li>Failure to provide Exhibit A gear</li>
                </ul>
              </div>
              <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                <h3 className="text-red-900 font-black uppercase tracking-widest text-xs mb-4">Revocation (Permanent)</h3>
                <ul className="space-y-3 text-red-800 list-disc pl-4 font-medium">
                  <li>Day-of cancellation (per §7.1)</li>
                  <li>Capacity fraud (per §4.1)</li>
                  <li>Violent or harassing conduct</li>
                  <li>Attempted payment fraud</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Quick Ref */}
          <section className="bg-slate-900 rounded-xl shadow-xl p-8 text-white">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Quick Reference: Key Protocol Sections</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              {[
                { sec: "§4.1", label: "Capacity Fraud" },
                { sec: "§5.3", label: "Late Fees ($50/d)" },
                { sec: "§7.1", label: "Cancel Penalties" },
                { sec: "§8.1(d)", label: "Safe Passage" },
                { sec: "§10.2", label: "Insurance Req" },
                { sec: "§11.3", label: "Dispute Tiers" },
                { sec: "§12.3", label: "Termination" },
                { sec: "v2.1", label: "Master Protocol" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col border-l border-slate-800 pl-4">
                  <span className="font-mono text-purple-400 font-bold">{item.sec}</span>
                  <span className="text-slate-400 text-xs mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="mt-16 text-center space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Spider Network Internal Operations Manual v1.0
          </div>
          <div className="text-[10px] text-slate-400">
            The Rock Salt Digital Band Manager | Confidential and Proprietary
          </div>
        </footer>
      </Container>
    </div>
  )
}
