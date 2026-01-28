import Container from '@/components/Container'
import type { Metadata } from 'next'
import PrintButton from './PrintButton'

export const metadata: Metadata = {
  title: 'Spider Network Protocol v2.1 - Master Tour Rider Agreement',
  description: 'The official touring protocol for the Spider Network. Standardized terms for professional touring artists and venues.',
}

export default function SpiderProtocolPage() {
  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900 pb-20">
      {/* Floating Buttons - Hidden on Print */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 print:hidden">
        <a
          href="/api/protocol/download"
          download
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
        >
          <span>📥</span>
          <span>Download PDF</span>
        </a>
        <PrintButton />
      </div>

      <Container className="py-12 md:py-20 max-w-4xl">
        {/* Legal Header */}
        <header className="text-center mb-16 relative">
          <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">
            Enforceable Legal Instrument
          </div>
          <h1 className="font-mono text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-slate-900">
            Master Tour Spider Rider Agreement
          </h1>
          <div className="flex flex-col items-center gap-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              Protocol Version: SPIDER-v2.1 | Release Date: January 2026
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm font-semibold text-slate-600">A Standardized General Offer of Performance Terms</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                Spider Network Protocol
              </span>
            </div>
            <div className="mt-6 text-xs text-slate-400 flex flex-col items-center gap-1">
              <span>Maintained by The Rock Salt Digital Band Manager</span>
              <span className="font-mono text-purple-600 font-bold uppercase">TheRockSalt.com</span>
            </div>
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20"></div>
        </header>

        {/* Network Intro */}
        <section className="mb-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 md:p-10 text-white shadow-xl shadow-purple-200">
          <h4 className="flex items-center gap-3 text-lg font-bold uppercase tracking-wider mb-6 text-white">
            <span className="text-2xl">🕷️</span> The Spider Network Protocol
          </h4>
          <div className="space-y-4 text-purple-50 flex flex-col">
            <p className="leading-relaxed">
              This Agreement represents a <strong>standardized touring protocol</strong> developed by The Rock Salt to eliminate
              negotiation friction, establish transparent compensation structures, and create pre-qualified venue networks for
              professional touring artists.
            </p>
            <p className="leading-relaxed">
              <strong>How It Works:</strong> Artists adopting this protocol make a standing General Offer to qualified venues.
              Venues that accept become <strong>Authorized Venues</strong>—pre-qualified booking partners with streamlined access,
              priority holds, and transparent terms. One acceptance. Multiple bookings. Zero per-show negotiation.
            </p>
            <div className="pt-4 border-t border-purple-500/30 mt-4 italic text-purple-200">
              &quot;Think of it as EZ-Pass for live music. This is infrastructure, not a contract template.&quot;
            </div>
          </div>
        </section>

        {/* Quick Nav */}
        <nav className="mb-20 grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          {[
            { label: 'Compensation', href: '#compensation', icon: '💰' },
            { label: 'Technical (Exh. A)', href: '#exhibit-a', icon: '🎸' },
            { label: 'Hospitality (Exh. B)', href: '#exhibit-b', icon: '🥪' },
            { label: 'Conduct (Exh. C)', href: '#exhibit-c', icon: '⚖️' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-white transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 group-hover:text-purple-600">{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Clauses */}
        <div className="space-y-28">
          {/* Section 0 */}
          <section className="relative">
            <div className="flex items-baseline gap-4 mb-6 border-b-2 border-slate-100 pb-4">
              <span className="font-mono text-2xl font-bold text-purple-600">§0</span>
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">Protocol Adoption & Customization</h3>
            </div>
            <div className="space-y-6 text-slate-600 leading-relaxed pl-4 md:pl-10">
              <p>
                This document is <strong>The Spider Network Protocol v2.1</strong>—a standardized Master Tour Rider Agreement template
                maintained by The Rock Salt. Artists adopting this protocol customize the variable fields below and issue the completed
                Agreement as their standing General Offer to venues.
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
                <strong className="block text-amber-900 text-xs font-black uppercase tracking-widest mb-2">⚠️ Required Customization Fields</strong>
                <p className="text-amber-800 text-sm">
                  Before issuing this Agreement, Artist must complete all [VARIABLE] fields throughout this document.
                  Incomplete Agreements are not legally binding.
                </p>
              </div>
            </div>
          </section>

          {/* Section 1 */}
          <section className="relative">
            <div className="flex items-baseline gap-4 mb-6 border-b-2 border-slate-100 pb-4">
              <span className="font-mono text-2xl font-bold text-purple-600">§1</span>
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">Preamble & Intent</h3>
            </div>
            <div className="space-y-8 pl-4 md:pl-10 text-slate-600">
              <p className="leading-relaxed">
                This <strong>Master Tour Spider Rider Agreement</strong> (&quot;Agreement&quot;) constitutes a standing <strong>General Offer of Terms</strong>
                made by the Artist to any qualified venue, promoter, or booking entity (&quot;Presenter&quot;) within the Territory defined herein.
              </p>

              <div>
                <strong className="block font-bold text-slate-900 mb-4">1.1 Purpose:</strong>
                <div className="grid gap-3 text-sm">
                  {[
                    "Establish standardized performance terms to eliminate per-booking negotiation overhead",
                    "Create transparent compensation structures tied to venue capacity",
                    "Incorporate technical, hospitality, and safety standards by reference",
                    "Enable rapid, legally binding bookings through digital acceptance",
                    "Build a network of pre-qualified Authorized Venues"
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="font-mono text-xs text-slate-400">({String.fromCharCode(97 + i)})</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <strong className="block font-bold text-slate-900 mb-4">1.2 Network Membership:</strong>
                <p className="mb-4">Acceptance of this Agreement grants Presenter status as an <strong>&quot;Authorized Venue&quot;</strong>. Benefits include:</p>
                <div className="grid gap-3 text-sm">
                  {[
                    "Priority booking access via the &apos;Spider Hold&apos; mechanism (Section 6)",
                    "Listing in The Rock Salt's public Authorized Venue Directory",
                    "Access to Artist's touring schedule with advance notice",
                    "Streamlined booking confirmations without per-show negotiation",
                    "Promotional support through The Rock Salt network"
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="font-mono text-xs text-slate-400">({String.fromCharCode(97 + i)})</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Compensation */}
          <section id="compensation" className="relative scroll-mt-20">
            <div className="flex items-baseline gap-4 mb-6 border-b-2 border-slate-100 pb-4">
              <span className="font-mono text-2xl font-bold text-purple-600">§4</span>
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">Standardized Compensation Framework</h3>
            </div>
            <div className="space-y-8 pl-4 md:pl-10 text-slate-600">
              <p>
                Presenter&apos;s agrees to compensate Artist according to the following <strong>Tier Structure</strong>, determined exclusively
                by Presenter&apos;s <strong>Official Capacity</strong>.
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <th className="px-6 py-4">Tier</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4">Min. Guarantee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { tier: "TIER 1", cap: "0 – 200", min: "$250" },
                      { tier: "TIER 2", cap: "201 – 500", min: "$500" },
                      { tier: "TIER 3", cap: "501 – 1,000", min: "$1,200" },
                      { tier: "TIER 4", cap: "1,001+", min: "$2,500+" }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-purple-600">{row.tier}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{row.cap}</td>
                        <td className="px-6 py-4 font-black text-slate-900">{row.min}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <strong className="block text-red-900 text-xs font-black uppercase tracking-widest mb-3">🚫 Absolute Prohibition: Zero-Compensation Bookings</strong>
                <p className="text-red-800 text-sm leading-relaxed">
                  Artist categorically rejects any offer predicated on &quot;exposure,&quot; &quot;promotional consideration,&quot; or &quot;door split with no guarantee.&quot;
                  Acceptance of this Agreement constitutes a legally binding promise to pay <strong>monetary currency</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Payment */}
          <section className="relative">
            <div className="flex items-baseline gap-4 mb-6 border-b-2 border-slate-100 pb-4">
              <span className="font-mono text-2xl font-bold text-purple-600">§5</span>
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">Payment Terms & Enforcement</h3>
            </div>
            <div className="space-y-8 pl-4 md:pl-10 text-slate-600">
              <div>
                <strong className="block font-bold text-slate-900 mb-4">5.1 Timing of Payment:</strong>
                <div className="space-y-4 text-sm">
                  <p><strong>Guarantee/Flat Fee:</strong> Must be paid in full <strong>no later than 24 hours after performance conclusion</strong>.</p>
                  <p><strong>Settlements:</strong> Percentage-based settlements must occur <strong>within 4 hours of doors closing</strong>.</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <strong className="block text-slate-900 text-xs font-black uppercase tracking-widest mb-4">5.3 Late Payment Penalties:</strong>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-3">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>Late fee of $50 per day (Days 1–7)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>1.5% monthly finance charge thereafter (18% APR)</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Exhibits Section */}
          <section className="pt-20 border-t-4 border-slate-900">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black uppercase tracking-widest text-slate-900 mb-2">Incorporated Exhibits</h2>
              <p className="text-sm text-slate-500 font-mono tracking-tighter">The following sections are part of the Master Agreement per §9.1</p>
            </div>

            {/* Exhibit A: Technical Rider */}
            <div id="exhibit-a" className="bg-slate-50 rounded-3xl p-8 md:p-12 mb-20 border border-slate-200 shadow-sm relative overflow-hidden group scroll-mt-20">
              <div className="absolute top-0 right-0 text-[120px] font-black text-slate-200/50 leading-none -mr-4 -mt-4 select-none group-hover:text-blue-500/10 transition-colors">A</div>
              <header className="relative mb-12">
                <div className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded mb-4">
                  Exhibit A — Technical Rider
                </div>
                <h3 className="font-mono text-2xl font-black text-slate-900">Technical Specifications</h3>
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Artist:</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded font-mono font-bold">[ARTIST NAME]</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Version:</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded font-mono font-bold">1.0</span>
                  </div>
                </div>
              </header>

              <div className="space-y-12">
                {/* Stage Dimensions */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-200 pb-2">Minimum Stage Dimensions</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <th className="px-4 py-3">Venue Tier</th>
                          <th className="px-4 py-3">Width</th>
                          <th className="px-4 py-3">Depth</th>
                          <th className="px-4 py-3">Height</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        <tr>
                          <td className="px-4 py-4 text-slate-500">Tier 1 (0-200)</td>
                          <td className="px-4 py-4">16 ft</td>
                          <td className="px-4 py-4">10 ft</td>
                          <td className="px-4 py-4">Floor OK</td>
                        </tr>
                        <tr className="bg-blue-50/30">
                          <td className="px-4 py-4 text-slate-500">Tier 2 (201-500)</td>
                          <td className="px-4 py-4">20 ft</td>
                          <td className="px-4 py-4">12 ft</td>
                          <td className="px-4 py-4">18 in min</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-4 text-slate-500">Tier 3+ (501+)</td>
                          <td className="px-4 py-4">24 ft</td>
                          <td className="px-4 py-4">16 ft</td>
                          <td className="px-4 py-4">36 in min</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sound System */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-200 pb-2">Front of House (FOH)</h4>
                  <div className="grid gap-4">
                    {[
                      { item: "Main PA", req: "Full-range 105 dB SPL", priority: "Must" },
                      { item: "Subwoofers", req: "Dedicated for Tier 2+", priority: "Must" },
                      { item: "Mix Console", req: "16+ channels, Digital preferred", priority: "Must" },
                      { item: "Mix Position", req: "Center-audience (no side-stage)", priority: "Must" }
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 group-hover:border-blue-200 transition-colors">
                        <div>
                          <span className="block text-xs font-black uppercase text-slate-400 mb-1">{row.item}</span>
                          <span className="text-sm font-bold text-slate-900">{row.req}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded">{row.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Backline Warning */}
                <div className="bg-blue-900 text-blue-50 p-6 rounded-2xl shadow-lg border border-blue-700">
                  <div className="flex gap-4 items-start">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <strong className="block text-xs font-black uppercase tracking-widest mb-2 text-blue-300">Material Breach Clause</strong>
                      <p className="text-sm leading-relaxed opacity-90">
                        Failure to provide a functional PA system, safe electrical grounding, or promised backline gear
                        constitutes a material breach. Artist reserves the right to refuse performance without penalty
                        under §9.3(e) of the Master Agreement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Exhibit B: Hospitality Rider */}
          <div id="exhibit-b" className="bg-slate-50 rounded-3xl p-8 md:p-12 mb-20 border border-slate-200 shadow-sm relative overflow-hidden group scroll-mt-20">
            <div className="absolute top-0 right-0 text-[120px] font-black text-slate-200/50 leading-none -mr-4 -mt-4 select-none group-hover:text-emerald-500/10 transition-colors">B</div>
            <header className="relative mb-12">
              <div className="inline-block px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded mb-4">
                Exhibit B — Hospitality Rider
              </div>
              <h3 className="font-mono text-2xl font-black text-slate-900">Hospitality & Comfort</h3>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Artist:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-mono font-bold">[ARTIST NAME]</span>
                </div>
              </div>
            </header>

            <div className="space-y-12">
              {/* Food & Beverage */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 border-b border-emerald-200 pb-2">Food & Beverage Policy</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-xl border border-slate-200">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Tier 1 & 2</h5>
                    <ul className="text-sm space-y-2 text-slate-600">
                      <li>• Hot meal for touring party (6 ppl)</li>
                      <li>• OR Cash Buyout: $75 – $150</li>
                      <li>• Water, coffee, and assortment</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-white rounded-xl border border-slate-200">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Tier 3+</h5>
                    <ul className="text-sm space-y-2 text-slate-600">
                      <li>• Fully catered hot meal (protein/veg/starch)</li>
                      <li>• OR Cash Buyout: $300</li>
                      <li>• Premium beverage assortment</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Hospitality Warning */}
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-lg">
                <strong className="block text-emerald-900 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  🚫 The &quot;No Pizza&quot; Rule
                </strong>
                <p className="text-emerald-800 text-sm leading-relaxed">
                  Pizza alone is not an acceptable meal for professional touring artists.
                  If pizza is the only option, Presenter must provide a buyout instead.
                </p>
              </div>
            </div>
          </div>

          {/* Exhibit C: Code of Conduct */}
          <div id="exhibit-c" className="bg-slate-50 rounded-3xl p-8 md:p-12 mb-20 border border-slate-200 shadow-sm relative overflow-hidden group scroll-mt-20">
            <div className="absolute top-0 right-0 text-[120px] font-black text-slate-200/50 leading-none -mr-4 -mt-4 select-none group-hover:text-red-500/10 transition-colors">C</div>
            <header className="relative mb-12">
              <div className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded mb-4">
                Exhibit C — Safety & Conduct
              </div>
              <h3 className="font-mono text-2xl font-black text-slate-900">Code of Conduct</h3>
              <p className="text-xs text-slate-500 mt-2">Zero-tolerance for harassment, discrimination, or physical harm.</p>
            </header>

            <div className="space-y-8">
              <div className="grid gap-4">
                {[
                  "Immediate termination for Hate Speech or Violence",
                  "Zero-tolerance for Sexual Harassment",
                  "Mandatory Fire & Stage Safety compliance",
                  "Strict control over recording and Intellectual Property",
                  "Security requirements tiered by venue capacity"
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 bg-white rounded-lg border border-slate-100 italic text-sm text-slate-700">
                    <span className="text-red-500 font-bold">§{i + 1}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-red-900 text-white p-6 rounded-2xl shadow-xl border-t-4 border-red-500">
                <strong className="block text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Enforcement Clause</strong>
                <p className="text-sm leading-relaxed font-medium">
                  Artist reserves the right to immediately STOP performance and terminate the Booking
                  WITHOUT PENALTY if safety or anti-harassment standards are violated and unaddressed.
                  Full guarantee remains owed.
                </p>
              </div>
            </div>
          </div>

          {/* Mediation & Accountability Section */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 mb-20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">⚖️</span>
                <h3 className="text-xl font-black uppercase tracking-widest">Accountability & Platform Mediation</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <strong className="block text-purple-400 text-xs font-black uppercase tracking-widest">Digital Trust Engine</strong>
                  <p className="text-sm leading-relaxed text-slate-300">
                    The Rock Salt acts as a <strong>neutral third-party mediator</strong>. When a Presenter accepts this Agreement, the platform
                    generates a cryptographically hashed PDF contract that is stored permanently in our secure vault.
                  </p>
                </div>
                <div className="space-y-4">
                  <strong className="block text-purple-400 text-xs font-black uppercase tracking-widest">Hash Verification</strong>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Every agreement carries a unique <strong>SHA-256 fingerprint</strong>. Both parties can verify the integrity of their
                    contract at any time by matching this fingerprint against the platform record, ensuring total accountability.
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-800 flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Digital Signatures Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Immutable Audit Trail</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Centralized Mediation</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: Force Majeure */}
          <section className="relative">
            <div className="flex items-baseline gap-4 mb-6 border-b-2 border-slate-100 pb-4">
              <span className="font-mono text-2xl font-bold text-purple-600">§8</span>
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">Force Majeure & Safe Passage</h3>
            </div>
            <div className="space-y-8 pl-4 md:pl-10 text-slate-600">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                <strong className="block text-blue-900 text-xs font-black uppercase tracking-widest mb-3">❄️ Safe Passage Clause</strong>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Specifically for regional touring where winter weather can be life-threatening. Triggered by <strong>official road closures</strong>
                  or <strong>NWS Winter Storm Warnings</strong> on the direct travel route&mdash;not just &quot;it&apos;s snowing.&quot;
                </p>
              </div>
            </div>
          </section>

          {/* Footer Legal */}
          <footer className="pt-20 border-t border-slate-200 text-center space-y-6">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em]">
              Official Document: SPIDER-v2.1-FINAL
            </div>
            <div className="text-slate-500 text-sm italic max-w-2xl mx-auto">
              This protocol template is provided for informational and operational purposes.
              The Rock Salt is not a law firm and does not provide legal advice.
            </div>
            <div className="font-black text-xl text-purple-600 tracking-tighter">
              🕷️ THE ROCK SALT SPIDER NETWORK
            </div>
          </footer>
        </div>
      </Container>
    </div>
  )
}
