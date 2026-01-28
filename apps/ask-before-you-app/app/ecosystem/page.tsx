'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { ALL_STATES, SDPC_MEMBER_STATES, STATE_ECOSYSTEMS } from '@/lib/ecosystem'

export default function EcosystemPage() {
  const availableStates = Object.keys(STATE_ECOSYSTEMS)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#005696]/20 border border-[#005696]/40 rounded-full text-[#00A3E0] text-sm font-medium mb-6">
              <span>🗺️</span>
              50 States + DC
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              State Privacy{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005696] to-[#00A3E0]">
                Ecosystems
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Comprehensive guides to student data privacy laws, contacts, resources, and workflows 
              for every state. Built on the SDPC framework.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{SDPC_MEMBER_STATES.length}</p>
                <p className="text-slate-400 text-sm">SDPC Members</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{availableStates.length}</p>
                <p className="text-slate-400 text-sm">Guides Ready</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">50M+</p>
                <p className="text-slate-400 text-sm">Students Protected</p>
              </div>
            </div>
          </div>
        </section>

        {/* State Grid */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Select Your State</h2>
            
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {ALL_STATES.map((state) => {
                const hasData = availableStates.includes(state.code)
                const isSdpcMember = SDPC_MEMBER_STATES.includes(state.code)
                
                return (
                  <Link
                    key={state.code}
                    href={hasData ? `/ecosystem/${state.code.toLowerCase()}` : '#'}
                    className={`
                      relative p-3 rounded-lg text-center transition-all
                      ${hasData
                        ? 'bg-[#005696] hover:bg-[#005696]/80 text-white cursor-pointer hover:scale-105'
                        : isSdpcMember
                          ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-800/30 text-slate-500 cursor-not-allowed'
                      }
                    `}
                    onClick={(e) => !hasData && e.preventDefault()}
                  >
                    <span className="text-sm font-bold">{state.code}</span>
                    {hasData && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#005696] rounded" />
                <span className="text-slate-300">Guide Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-700/50 rounded" />
                <span className="text-slate-400">SDPC Member (Coming Soon)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-800/30 rounded" />
                <span className="text-slate-500">Not Yet Available</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured State */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
              <div className="flex items-start gap-6">
                <div className="text-6xl">🏔️</div>
                <div className="flex-1">
                  <span className="text-[#00A3E0] text-sm font-medium">FEATURED STATE</span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-3">Utah</h3>
                  <p className="text-slate-300 mb-4">
                    Utah's comprehensive student data privacy ecosystem serves as the model for 
                    this platform. With the Utah Student Privacy Alliance (USPA), standardized 
                    DPAs, and robust compliance frameworks protecting 700,000+ students.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      ✓ Complete Guide
                    </span>
                    <span className="px-3 py-1 bg-[#005696]/20 text-[#00A3E0] text-xs rounded-full">
                      SDPC Member
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      Model State
                    </span>
                  </div>
                  <Link
                    href="/ecosystem/ut"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#005696] text-white font-semibold rounded-xl hover:bg-[#005696]/90 transition-colors"
                  >
                    Explore Utah's Ecosystem
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 px-4 bg-slate-800/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              What's in Each State Guide?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: '⚖️',
                  title: 'Legal Framework',
                  items: ['Federal laws (FERPA, PPRA)', 'State-specific privacy laws', 'Board rules & regulations', 'Key provisions explained'],
                },
                {
                  icon: '👥',
                  title: 'Stakeholder Roles',
                  items: ['Data Manager duties', 'Security Officer requirements', 'Records Officer responsibilities', 'First steps for new staff'],
                },
                {
                  icon: '📚',
                  title: 'Resources & Tools',
                  items: ['DPA templates', 'Training courses', 'Compliance checklists', 'Contact directories'],
                },
                {
                  icon: '🔄',
                  title: 'Workflows',
                  items: ['Vendor approval process', 'Breach response protocol', 'Annual compliance steps', 'Records request handling'],
                },
                {
                  icon: '✅',
                  title: 'Compliance Requirements',
                  items: ['Mandatory designations', 'Annual requirements', 'Ongoing obligations', 'Audit preparation'],
                },
                {
                  icon: '🤝',
                  title: 'Support Network',
                  items: ['State contacts', 'SDPC resources', 'Training opportunities', 'Community connections'],
                },
              ].map((section) => (
                <div key={section.title} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <div className="text-3xl mb-3">{section.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-3">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="text-slate-400 text-sm flex items-start gap-2">
                        <span className="text-[#00A3E0]">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Your State Added?
            </h2>
            <p className="text-slate-300 mb-8">
              We're expanding coverage to all 50 states. If you'd like to contribute your state's 
              ecosystem information or request prioritization, let us know.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-[#005696] text-white font-semibold rounded-xl hover:bg-[#005696]/90 transition-colors"
              >
                Request Your State
              </Link>
              <Link
                href="/certification"
                className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
              >
                Take Certification Course
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-slate-800">
          <div className="max-w-6xl mx-auto text-center text-slate-400 text-sm">
            <p>
              Built on the{' '}
              <a href="https://privacy.a4l.org" target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] hover:underline">
                SDPC Framework
              </a>
              {' '}• Powered by{' '}
              <a href="https://a4l.org" target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] hover:underline">
                A4L Community
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
