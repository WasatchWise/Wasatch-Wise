'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { getStateEcosystem, getStateFoundation, ALL_STATES } from '@/lib/ecosystem'
import { getTecSupportForState, TEC_SDPA_URL } from '@/lib/ecosystem/partners'

export default function StateEcosystemPage() {
  const params = useParams()
  const stateCode = (params.stateCode as string).toUpperCase()
  const ecosystem = getStateEcosystem(stateCode)
  const foundation = getStateFoundation(stateCode)
  const stateInfo = ALL_STATES.find((s) => s.code === stateCode)

  // No full guide and no foundation (invalid code)
  if (!ecosystem && !foundation) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🏗️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Coming Soon</h1>
            <p className="text-slate-400 mb-6">
              The {stateInfo?.name || stateCode} ecosystem guide is currently being developed.
              Check back soon or explore Utah&apos;s model ecosystem.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/ecosystem" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                All States
              </Link>
              <Link href="/ecosystem/ut" className="px-4 py-2 bg-[#005696] text-white rounded-lg hover:bg-[#005696]/80">
                View Utah
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Foundation overview only (no full guide yet)
  if (!ecosystem && foundation) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
          <section className="py-16 px-4 border-b border-slate-800">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                <Link href="/ecosystem" className="hover:text-white">Ecosystems</Link>
                <span>/</span>
                <span className="text-white">{foundation.name}</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">Overview</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{foundation.name}</h1>
                  {foundation.agencyName && (
                    <p className="text-slate-400">{foundation.agencyName}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {foundation.sdpcMember && (
                    <span className="px-4 py-2 bg-[#005696]/20 text-[#00A3E0] rounded-full text-sm font-medium">
                      SDPC Member
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-sm">
                {foundation.contactEmail && (
                  <a href={`mailto:${foundation.contactEmail}`} className="flex items-center gap-2 text-slate-300 hover:text-white">
                    <span>📧</span> {foundation.contactEmail}
                  </a>
                )}
                {foundation.contactPhone && (
                  <a href={`tel:${foundation.contactPhone}`} className="flex items-center gap-2 text-slate-300 hover:text-white">
                    <span>📞</span> {foundation.contactPhone}
                  </a>
                )}
                {foundation.website && (
                  <a href={foundation.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#00A3E0] hover:underline">
                    <span>🌐</span> Official website
                  </a>
                )}
              </div>
              <p className="mt-6 text-slate-500 text-sm">
                This is a summary from our state privacy &amp; AI governance profiles. A full guide (laws, roles, workflows, resources) is in development. See Utah for a complete example.
              </p>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
            {foundation.federalLawsNote && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">⚖️ Federal laws</h2>
                <p className="text-slate-300">{foundation.federalLawsNote}</p>
              </section>
            )}
            {foundation.stateLaws.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">📜 State laws</h2>
                <div className="space-y-4">
                  {foundation.stateLaws.map((law) => (
                    <div key={law.code} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 border-l-4 border-l-green-500">
                      <h3 className="font-semibold text-white">{law.name}</h3>
                      <p className="text-slate-400 text-sm">{law.code}</p>
                      {law.description && <p className="text-slate-300 text-sm mt-1">{law.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {foundation.requiredRolesSummary && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">👥 Required roles</h2>
                <p className="text-slate-300">{foundation.requiredRolesSummary}</p>
              </section>
            )}
            {foundation.complianceSummary && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">✅ Compliance</h2>
                <p className="text-slate-300">{foundation.complianceSummary}</p>
              </section>
            )}
            {foundation.dpaAvailable !== null && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">📄 DPA</h2>
                <p className="text-slate-300">{foundation.dpaAvailable ? 'DPA template available (e.g. NDPA or state-specific).' : 'Check with your state education agency for DPA requirements.'}</p>
              </section>
            )}
            {foundation.aiGovernanceNotes && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">🤖 AI governance</h2>
                <p className="text-slate-300">{foundation.aiGovernanceNotes}</p>
              </section>
            )}
            {getTecSupportForState(stateCode) && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">🛠️ Implementation support</h2>
                <TecSupportNote stateCode={stateCode} />
              </section>
            )}
          </div>

          <footer className="py-8 px-4 border-t border-slate-800">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 text-sm">
                Source: Ask Before You App state privacy &amp; AI governance profiles. Verify with your state education agency.
              </p>
              <div className="flex gap-4">
                <Link href="/ecosystem" className="text-slate-400 hover:text-white text-sm">All States</Link>
                <Link href="/ecosystem/ut" className="text-[#00A3E0] hover:underline text-sm">View full guide (Utah)</Link>
                <Link href="/certification" className="text-[#00A3E0] hover:underline text-sm">Certification</Link>
              </div>
            </div>
          </footer>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Hero */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
              <Link href="/ecosystem" className="hover:text-white">Ecosystems</Link>
              <span>/</span>
              <span className="text-white">{ecosystem.name}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{stateCode === 'UT' ? '🏔️' : '🏛️'}</span>
                  <h1 className="text-4xl font-bold text-white">{ecosystem.name}</h1>
                </div>
                <p className="text-xl text-slate-300">{ecosystem.overview.teamName}</p>
                <p className="text-slate-400 mt-2">{ecosystem.overview.agencyName}</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {ecosystem.sdpcMember && (
                  <span className="px-4 py-2 bg-[#005696]/20 text-[#00A3E0] rounded-full text-sm font-medium">
                    SDPC Member
                  </span>
                )}
                <span className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-full text-sm">
                  Updated: {ecosystem.lastUpdated}
                </span>
              </div>
            </div>
            
            {/* Contact Bar */}
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              {ecosystem.overview.email && (
                <a href={`mailto:${ecosystem.overview.email}`} className="flex items-center gap-2 text-slate-300 hover:text-white">
                  <span>📧</span> {ecosystem.overview.email}
                </a>
              )}
              {ecosystem.overview.phone && (
                <a href={`tel:${ecosystem.overview.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-white">
                  <span>📞</span> {ecosystem.overview.phone}
                </a>
              )}
              {ecosystem.overview.website && (
                <a href={ecosystem.overview.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#00A3E0] hover:underline">
                  <span>🌐</span> Official Website
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        {ecosystem.stats && (
          <section className="py-8 px-4 bg-slate-800/30">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-3 gap-6 text-center">
                {ecosystem.stats.studentsProtected && (
                  <div>
                    <p className="text-3xl font-bold text-white">{ecosystem.stats.studentsProtected}</p>
                    <p className="text-slate-400 text-sm">Students Protected</p>
                  </div>
                )}
                {ecosystem.stats.districtsParticipating && (
                  <div>
                    <p className="text-3xl font-bold text-white">{ecosystem.stats.districtsParticipating.split('+')[0]}+</p>
                    <p className="text-slate-400 text-sm">Districts & Charters</p>
                  </div>
                )}
                {ecosystem.stats.vendorAgreements && (
                  <div>
                    <p className="text-3xl font-bold text-white">100s</p>
                    <p className="text-slate-400 text-sm">Vendor Agreements</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Quick Links */}
          <nav className="flex flex-wrap gap-3 mb-12 pb-6 border-b border-slate-800">
            {['Legal Framework', 'Roles', 'Contacts', 'Resources', 'Workflows', 'Compliance'].map((section) => (
              <a
                key={section}
                href={`#${section.toLowerCase().replace(' ', '-')}`}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors text-sm"
              >
                {section}
              </a>
            ))}
          </nav>

          {/* Legal Framework */}
          <section id="legal-framework" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">⚖️</span> Legal Framework
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Federal Laws */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Federal Laws</h3>
                <div className="space-y-4">
                  {ecosystem.federalLaws.map((law) => (
                    <div key={law.code} className="border-l-2 border-[#005696] pl-4">
                      <h4 className="font-medium text-white">{law.name}</h4>
                      <p className="text-slate-400 text-sm">{law.code}</p>
                      <p className="text-slate-300 text-sm mt-1">{law.description}</p>
                      {law.url && (
                        <a href={law.url} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] text-sm hover:underline mt-1 inline-block">
                          Learn more →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* State Laws */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">State Laws</h3>
                <div className="space-y-4">
                  {ecosystem.stateLaws.map((law) => (
                    <div key={law.code} className="border-l-2 border-green-500 pl-4">
                      <h4 className="font-medium text-white">{law.name}</h4>
                      <p className="text-slate-400 text-sm">{law.code}</p>
                      <p className="text-slate-300 text-sm mt-1">{law.description}</p>
                      {law.keyProvisions && law.keyProvisions.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {law.keyProvisions.map((provision, i) => (
                            <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                              <span className="text-green-500">•</span> {provision}
                            </li>
                          ))}
                        </ul>
                      )}
                      {law.url && (
                        <a href={law.url} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] text-sm hover:underline mt-2 inline-block">
                          View full text →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Roles */}
          <section id="roles" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">👥</span> Key Roles
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {ecosystem.roles.dataManager && (
                <RoleCard role={ecosystem.roles.dataManager} color="#005696" />
              )}
              {ecosystem.roles.securityOfficer && (
                <RoleCard role={ecosystem.roles.securityOfficer} color="#00A3E0" />
              )}
              {ecosystem.roles.recordsOfficer && (
                <RoleCard role={ecosystem.roles.recordsOfficer} color="#7C3AED" />
              )}
            </div>
          </section>

          {/* Contacts */}
          <section id="contacts" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">📞</span> Key Contacts
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ecosystem.contacts.map((contact) => (
                <div key={contact.name} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <h3 className="font-medium text-white">{contact.name}</h3>
                  <p className="text-slate-400 text-sm">{contact.title}</p>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="text-[#00A3E0] text-sm hover:underline block mt-2">
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="text-slate-300 text-sm block mt-1">
                      {contact.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Resources */}
          <section id="resources" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">📚</span> Resources
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* DPA Templates */}
              {ecosystem.resources.dpaTemplates.length > 0 && (
                <ResourceSection title="DPA Templates" icon="📄" resources={ecosystem.resources.dpaTemplates} />
              )}
              
              {/* Guides */}
              {ecosystem.resources.guides.length > 0 && (
                <ResourceSection title="Guides" icon="📖" resources={ecosystem.resources.guides} />
              )}
              
              {/* Training */}
              {ecosystem.resources.training.length > 0 && (
                <ResourceSection title="Training" icon="🎓" resources={ecosystem.resources.training} />
              )}
              
              {/* Tools */}
              {ecosystem.resources.tools.length > 0 && (
                <ResourceSection title="Tools" icon="🔧" resources={ecosystem.resources.tools} />
              )}
            </div>
          </section>

          {/* Workflows */}
          <section id="workflows" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🔄</span> Workflows
            </h2>
            
            <div className="space-y-6">
              {ecosystem.workflows.map((workflow) => (
                <div key={workflow.name} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-2">{workflow.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{workflow.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {workflow.steps.map((step, i) => (
                      <div key={step.number} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                          <span className="w-6 h-6 bg-[#005696] text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {step.number}
                          </span>
                          <span className="text-slate-300 text-sm">{step.title}</span>
                        </div>
                        {i < workflow.steps.length - 1 && (
                          <span className="text-slate-600">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Compliance */}
          <section id="compliance" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">✅</span> Compliance Requirements
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-red-500">●</span> Mandatory Designations
                </h3>
                <ul className="space-y-2">
                  {ecosystem.compliance.mandatoryDesignations.map((item, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-red-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-yellow-500">●</span> Annual Requirements
                </h3>
                <ul className="space-y-2">
                  {ecosystem.compliance.annualRequirements.map((item, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-yellow-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-green-500">●</span> Ongoing Requirements
                </h3>
                <ul className="space-y-2">
                  {ecosystem.compliance.ongoingRequirements.map((item, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-green-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {getTecSupportForState(stateCode) && (
            <section id="implementation-support" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🛠️</span> Implementation Support
              </h2>
              <TecSupportNote stateCode={stateCode} />
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-slate-800">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              Last updated: {ecosystem.lastUpdated} • Data sourced from official state resources
            </p>
            <div className="flex gap-4">
              <Link href="/ecosystem" className="text-slate-400 hover:text-white text-sm">
                All States
              </Link>
              <Link href="/certification" className="text-[#00A3E0] hover:underline text-sm">
                Take Certification
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

// TEC Implementation Support Note
function TecSupportNote({ stateCode }: { stateCode: string }) {
  const tec = getTecSupportForState(stateCode)
  if (!tec) return null
  if (tec.type === 'direct') {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 border-l-4 border-l-[#00A3E0]">
        <p className="text-slate-300">
          The <a href={TEC_SDPA_URL} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] hover:underline">TEC Student Data Privacy Alliance</a> provides DPA procurement services for {stateCode} districts. Contact TEC to learn about their offerings.
        </p>
      </div>
    )
  }
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 border-l-4 border-l-[#00A3E0]">
      <p className="text-slate-300">
        {tec.partner} has partnered with the <a href={TEC_SDPA_URL} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] hover:underline">TEC Student Data Privacy Alliance</a> to provide DPA procurement services. Contact your {tec.partner} representative.
        {tec.url && (
          <> <a href={tec.url} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] hover:underline">Learn more →</a></>
        )}
      </p>
    </div>
  )
}

// Role Card Component
function RoleCard({ role, color }: { role: NonNullable<ReturnType<typeof getStateEcosystem>>['roles']['dataManager']; color: string }) {
  if (!role) return null
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-lg font-semibold text-white">{role.title}</h3>
      </div>
      
      {role.legalBasis && (
        <p className="text-slate-400 text-xs mb-3">{role.legalBasis}</p>
      )}
      
      <span className={`inline-block px-2 py-1 text-xs rounded-full mb-4 ${
        role.required 
          ? 'bg-red-500/20 text-red-400' 
          : 'bg-slate-700 text-slate-400'
      }`}>
        {role.required ? 'Required' : 'Recommended'}
      </span>
      
      <h4 className="text-sm font-medium text-white mb-2">Responsibilities:</h4>
      <ul className="space-y-1 mb-4">
        {role.responsibilities.slice(0, 4).map((resp, i) => (
          <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
            <span style={{ color }}>•</span> {resp}
          </li>
        ))}
        {role.responsibilities.length > 4 && (
          <li className="text-slate-500 text-xs">+{role.responsibilities.length - 4} more...</li>
        )}
      </ul>
      
      {role.firstSteps && role.firstSteps.length > 0 && (
        <>
          <h4 className="text-sm font-medium text-white mb-2">First Steps:</h4>
          <ul className="space-y-1">
            {role.firstSteps.slice(0, 3).map((step, i) => (
              <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                <span className="text-green-500">{i + 1}.</span> {step}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// Resource Section Component
function ResourceSection({ 
  title, 
  icon, 
  resources 
}: { 
  title: string
  icon: string
  resources: ReturnType<typeof getStateEcosystem>['resources']['dpaTemplates']
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <ul className="space-y-3">
        {resources.map((resource) => (
          <li key={resource.name} className="border-l-2 border-slate-600 pl-3">
            <h4 className="font-medium text-white text-sm">{resource.name}</h4>
            <p className="text-slate-400 text-xs">{resource.description}</p>
            {resource.url && (
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] text-xs hover:underline">
                Access →
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
