import React, { useState, useEffect } from 'react';
import { SupplyChain } from './components/SupplyChain';
import { AIAssistant } from './components/AIAssistant';
import { AssetDeepDive } from './components/AssetDeepDive';
import { StrategicNews } from './components/StrategicNews';
import { WhyMagnesium } from './components/WhyMagnesium';
import { GMC_RESOURCES, PROCESS_COMPARISON, PHASE_MILESTONES, TIMMINS_LOCATION, HYDROMETALLURGICAL_PROCESS, SUPPLY_CHAIN_STAGES, OWNERSHIP_SECURITY, CONTACT_INFO, COMPLIANCE_DISCLAIMER, JPMC_CONNECTION } from './constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { generateVisualRepresentation } from './services/geminiService';

const App: React.FC = () => {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  useEffect(() => {
    const fetchHero = async () => {
      const img = await generateVisualRepresentation("Modern industrial magnesium facility in northern Ontario, winter dawn, professional architectural rendering, cinematic lighting, ultra-realistic");
      if (img) setHeroImage(img);
    };
    fetchHero();
  }, []);

  const trackPdfDownload = () => {
    setPdfDownloaded(true);
    // In production, this would send analytics event
    console.log('PDF downloaded - timestamp:', new Date().toISOString());
  };

  // Capital Stack Data
  const capitalStackData = [
    { name: 'Phase I', amount: 25, type: 'Feasibility', color: '#3b82f6' },
    { name: 'Phase II', amount: 300, type: 'Construction', color: '#60a5fa' },
  ];

  return (
    <div className="bg-[#0a1128] text-white font-sans leading-relaxed overflow-x-hidden min-h-screen">
      {/* STICKY COMPLIANCE FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-[200] bg-[#1a2332]/98 backdrop-blur-md border-t border-[#4a5568] px-4 sm:px-6 py-2 sm:py-4 max-h-24 sm:max-h-32 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-[#e2e8f0] leading-relaxed">
            {COMPLIANCE_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* Bottom padding to prevent content from being hidden behind sticky footer */}
      <div className="h-24 sm:h-32"></div>

      {/* HEADER - Institutional */}
      <nav className="fixed top-0 w-full z-[100] bg-[#0a1128]/98 backdrop-blur-md border-b border-[#4a5568] px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4a5568] rounded border border-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">GMC</span>
          </div>
          <span className="font-bold text-lg tracking-tight uppercase text-white">General Magnesium Corporation</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-wider text-white font-medium">
          <a href="#presentation" className="hover:text-[#e2e8f0] transition-colors">Presentation</a>
          <a href="#capital" className="hover:text-[#e2e8f0] transition-colors">Capital Stack</a>
          <a href="#technical" className="hover:text-[#e2e8f0] transition-colors">Technical Brief</a>
          <a href="#resource" className="hover:text-[#e2e8f0] transition-colors">Resource</a>
        </div>
      </nav>

      {/* HERO SECTION - Executive Summary Landing */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 sm:pt-24 pb-24 sm:pb-32">
        <div className="absolute inset-0 -z-10">
          {heroImage && <img src={heroImage} alt="" className="w-full h-full object-cover opacity-20" />}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1128]/90 to-[#0a1128]" />
        </div>

        <div className="max-w-5xl">
          <div className="inline-block px-6 py-2 border border-[#4a5568] rounded bg-[#1a2332]/50 text-[#e2e8f0] text-sm uppercase tracking-widest mb-8 font-medium">
            Private Deal Room // 2026
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight leading-none text-white mb-6">
            The North American<br/>
            <span className="text-[#e2e8f0]">Magnesium Solution</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#e2e8f0] font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Building Supply Chain Resilience & National Security
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <a 
              href="#presentation" 
              className="px-12 py-5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold uppercase tracking-wider text-base rounded transition-all shadow-lg"
            >
              Watch the Executive Presentation (~13 Min)
            </a>
            <a 
              href="#presentation" 
              className="px-12 py-5 border-2 border-[#4a5568] hover:bg-[#1a2332] text-white font-bold uppercase tracking-wider text-base rounded transition-all"
            >
              View 7-Minute Summary
            </a>
          </div>
        </div>
      </section>

      {/* KYC & OWNERSHIP BLOCK - Critical Visibility */}
      <section className="py-16 px-6 bg-[#1a2332] border-y border-[#4a5568]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0a1128] border-2 border-[#3b82f6] rounded-lg p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">Ownership & Governance</h2>
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-white font-medium">
                  <span className="text-xl sm:text-2xl">🇺🇸</span>
                  <span>US</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white font-medium">
                  <span className="text-xl sm:text-2xl">🇨🇦</span>
                  <span>CA</span>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-[#3b82f6] rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-[#3b82f6] text-lg sm:text-xl">🛡️</span>
                </div>
              </div>
            </div>
            <p className="text-xl text-white leading-relaxed font-medium">
              100% Western Ownership. Explicit confirmation of <strong className="text-[#3b82f6]">NO Chinese beneficial ownership, control, or influence</strong> (Public or Private).
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#e2e8f0]">
              <div>✓ U.S. and Canadian shareholders only</div>
              <div>✓ No single shareholder owns more than 25%</div>
              <div>✓ Available, auditable shareholder registry</div>
            </div>
          </div>
        </div>
      </section>

      {/* JPMC CONNECTION - The Hook */}
      <section className="py-16 px-6 bg-[#0a1128] border-b border-[#4a5568]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-6">Strategic Market Alignment</h2>
          <div className="bg-[#1a2332] border border-[#4a5568] rounded-lg p-8">
            <p className="text-lg text-white leading-relaxed mb-4">
              {JPMC_CONNECTION.content}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-6">
              <div className="px-4 sm:px-6 py-3 bg-[#0a1128] border border-[#4a5568] rounded text-center w-full sm:w-auto min-w-0">
                <div className="text-xs sm:text-sm text-[#e2e8f0] uppercase tracking-wider mb-1">Downstream</div>
                <div className="text-base sm:text-lg font-bold text-white break-words">Arconic Corporation</div>
              </div>
              <div className="text-[#4a5568] text-xl sm:text-2xl rotate-90 sm:rotate-0">→</div>
              <div className="px-4 sm:px-6 py-3 bg-[#0a1128] border border-[#4a5568] rounded text-center w-full sm:w-auto min-w-0">
                <div className="text-xs sm:text-sm text-[#e2e8f0] uppercase tracking-wider mb-1">Portfolio Company</div>
                <div className="text-base sm:text-lg font-bold text-white break-words">Apollo Global Management</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIGITAL PRESENTATION PAGE - Core Deliverable */}
      <section id="presentation" className="py-24 px-6 bg-[#1a2332] border-y border-[#4a5568] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-6">
              Strategic Investment <br/>Presentation
            </h2>
            <p className="text-xl text-[#e2e8f0] max-w-3xl mx-auto leading-relaxed">
              Comprehensive overview of General Magnesium Corporation and the Whitney Deposit opportunity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Video Player A - 13 Minute */}
            <div className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Strategic Investment Presentation</h3>
              <p className="text-sm text-[#e2e8f0] mb-6">~13 Minutes</p>
              <div className="aspect-video bg-[#1a2332] border border-[#4a5568] rounded-lg overflow-hidden">
                <iframe
                  src="https://drive.google.com/file/d/1s6xz54ECReAs0rcAP12aPYGbUgjFg4oZ/preview"
                  className="w-full h-full"
                  allow="autoplay"
                  allowFullScreen
                  title="Strategic Investment Presentation - 13 Minutes"
                ></iframe>
              </div>
            </div>

            {/* Video Player B - 7 Minute */}
            <div className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Executive Summary</h3>
              <p className="text-sm text-[#e2e8f0] mb-6">~7 Minutes</p>
              <div className="aspect-video bg-[#1a2332] border border-[#4a5568] rounded-lg overflow-hidden">
                <iframe
                  src="https://drive.google.com/file/d/1-wpYd_UvRzzyD7mPamPAakVymx7lpc5P/preview"
                  className="w-full h-full"
                  allow="autoplay"
                  allowFullScreen
                  title="Executive Summary - 7 Minutes"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Document Repository */}
          <div className="bg-[#0a1128] border-2 border-[#3b82f6] rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight text-center">Official Presentation Deck</h3>
            <p className="text-[#e2e8f0] mb-6 text-center">Includes comprehensive technical appendices and financial modeling.</p>
            
            {/* Google Slides Embed */}
            <div className="mb-8">
              <div className="aspect-video bg-[#1a2332] border border-[#4a5568] rounded-lg overflow-hidden">
                <iframe
                  src="https://docs.google.com/presentation/d/14iQ5ObR9N4civNcjoF38Ck2BUXTAuk6FF1VFw5hzvmI/preview"
                  className="w-full h-full"
                  allowFullScreen
                  title="GMC Presentation Deck"
                ></iframe>
              </div>
            </div>

            {/* Download/View Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://docs.google.com/presentation/d/14iQ5ObR9N4civNcjoF38Ck2BUXTAuk6FF1VFw5hzvmI/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackPdfDownload}
                className="inline-block px-12 py-5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold uppercase tracking-wider text-base rounded transition-all shadow-lg"
              >
                View Full Presentation
              </a>
              <a
                href="https://docs.google.com/presentation/d/14iQ5ObR9N4civNcjoF38Ck2BUXTAuk6FF1VFw5hzvmI/export/pdf"
                download="GMC_Presentation_Deck.pdf"
                onClick={trackPdfDownload}
                className="inline-block px-12 py-5 border-2 border-[#4a5568] hover:bg-[#1a2332] text-white font-bold uppercase tracking-wider text-base rounded transition-all"
              >
                Download as PDF
              </a>
            </div>
            {pdfDownloaded && (
              <p className="text-sm text-green-400 mt-4 text-center">✓ Access tracked</p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 1: PROGRAM SUMMARY - The "Why" */}
      <section id="why" className="py-24 px-6 bg-[#0a1128] border-y border-[#4a5568] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-6">
              U.S.–Canada Supply <br/>Chain Integration
            </h2>
            <p className="text-xl text-[#e2e8f0] max-w-3xl mx-auto leading-relaxed">
              Building North American industrial strength and resilience through strategic mineral supply chain security.
            </p>
          </div>

          <div className="bg-[#1a2332] border border-[#4a5568] rounded-lg p-8 mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Strategic Location: Timmins, Ontario</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <img
                  src="/map.png"
                  alt="Timmins location map showing connections to major North American cities"
                  className="w-full rounded border border-[#4a5568]"
                />
              </div>
              <div className="space-y-4">
                <div className="text-lg text-white">
                  <span className="text-[#3b82f6] font-bold">Coordinates:</span> {TIMMINS_LOCATION.coordinates}
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-[#3b82f6] uppercase">Distances to Major Markets:</h4>
                  {TIMMINS_LOCATION.distances.map((d, i) => (
                    <div key={i} className="flex justify-between text-base text-white border-b border-[#4a5568] pb-2">
                      <span className="font-medium">{d.city}</span>
                      <span>{d.km} km - {d.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <WhyMagnesium />
        </div>
      </section>

      {/* SECTION 2: CAPITAL STACK - The "Ask" */}
      <section id="capital" className="py-24 px-6 bg-[#1a2332] border-y border-[#4a5568] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-6">
              Capital Stack
            </h2>
            <p className="text-xl text-[#e2e8f0] max-w-3xl mx-auto leading-relaxed">
              Strategy designed to leverage public sector financing to de-risk private co-investment.
            </p>
          </div>

          <div className="mb-16">
            <div className="h-96 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={capitalStackData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" horizontal={false} />
                  <XAxis type="number" stroke="#e2e8f0" fontSize={14} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#e2e8f0" fontSize={16} tickLine={false} axisLine={false} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a1128', border: '1px solid #4a5568', borderRadius: '8px', fontSize: '14px', color: '#fff' }}
                    formatter={(value: number) => [`$${value}M USD`, 'Capital']}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {PHASE_MILESTONES.map((milestone, i) => (
                <div key={i} className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{milestone.phase}</h3>
                    <span className="text-[#3b82f6] font-bold bg-[#1a2332] px-4 py-2 rounded">{milestone.capital}</span>
                  </div>
                  <p className="text-base text-[#e2e8f0] mb-6 uppercase tracking-wide">Duration: {milestone.duration}</p>
                  <ul className="space-y-3">
                    {milestone.objectives.slice(0, 6).map((obj, j) => (
                      <li key={j} className="text-base text-white flex items-start gap-3">
                        <span className="w-2 h-2 bg-[#3b82f6] rounded-full mt-2 flex-shrink-0"></span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* De-Risking Layer Logos */}
          <div className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-8">
            <h4 className="text-xl font-bold text-white mb-6 uppercase tracking-tight text-center">Government Financing Programs</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-[#1a2332] border border-[#4a5568] rounded">
                <div className="text-sm font-bold text-white mb-2">DOE</div>
                <div className="text-xs text-[#e2e8f0]">Title 17</div>
              </div>
              <div className="text-center p-4 bg-[#1a2332] border border-[#4a5568] rounded">
                <div className="text-sm font-bold text-white mb-2">DPA</div>
                <div className="text-xs text-[#e2e8f0]">Title III</div>
              </div>
              <div className="text-center p-4 bg-[#1a2332] border border-[#4a5568] rounded">
                <div className="text-sm font-bold text-white mb-2">Ex-Im Bank</div>
                <div className="text-xs text-[#e2e8f0]">U.S.</div>
              </div>
              <div className="text-center p-4 bg-[#1a2332] border border-[#4a5568] rounded">
                <div className="text-sm font-bold text-white mb-2">Canada SIF</div>
                <div className="text-xs text-[#e2e8f0]">Strategic Minerals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TECHNICAL BRIEF - The "How" */}
      <section id="technical" className="py-24 px-6 bg-[#0a1128] border-y border-[#4a5568] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-6">
              Technical Brief
            </h2>
            <p className="text-xl text-[#e2e8f0] max-w-3xl mx-auto leading-relaxed">
              GMC HydroMet vs. Pidgeon Process
            </p>
          </div>

          <div className="overflow-x-auto mb-16">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#4a5568]">
                  <th className="py-6 px-6 text-lg font-bold text-white uppercase bg-[#1a2332]">Feature</th>
                  <th className="py-6 px-6 text-lg font-bold text-red-400 uppercase bg-[#1a2332]">Pidgeon Process (China)</th>
                  <th className="py-6 px-6 text-lg font-bold text-[#3b82f6] uppercase bg-[#1a2332]">GMC HydroMet</th>
                </tr>
              </thead>
              <tbody>
                {PROCESS_COMPARISON.map((row, i) => (
                  <tr key={i} className="border-b border-[#4a5568]">
                    <td className="py-5 px-6 text-lg text-white font-medium bg-[#1a2332]/50">{row.feature}</td>
                    <td className="py-5 px-6 text-lg text-white bg-[#1a2332]/30">{row.pidgeon}</td>
                    <td className="py-5 px-6 text-lg text-[#3b82f6] font-medium bg-[#1a2332]/50">{row.electrolytic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 6-Step Process Diagram */}
          <div className="bg-[#1a2332] border border-[#4a5568] rounded-lg p-8 mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Hydrometallurgical Process (Dr. Anatoly Agulyansky)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {HYDROMETALLURGICAL_PROCESS.steps.map((step, i) => (
                <div key={i} className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-[#3b82f6] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {step.step}
                    </div>
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight">{step.name}</h4>
                  </div>
                  <p className="text-sm text-[#e2e8f0] leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <AssetDeepDive />
        </div>
      </section>

      {/* SECTION 4: THE RESOURCE (NI 43-101) */}
      <section id="resource" className="py-24 px-6 bg-[#1a2332] border-y border-[#4a5568] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-6">
              World-Class Asset
            </h2>
            <p className="text-xl text-[#e2e8f0] max-w-3xl mx-auto leading-relaxed">
              100 Million Tons Defined Resource
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Resource Summary</h3>
              <div className="space-y-4">
                {GMC_RESOURCES.map((res, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-[#4a5568] pb-4">
                    <span className="text-lg text-white font-medium">{res.category}</span>
                    <span className="text-lg text-[#3b82f6] font-bold">{(res.tonnes / 1000000).toFixed(1)}M tons</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t border-[#3b82f6]">
                  <span className="text-xl text-white font-bold uppercase">Total Resource</span>
                  <span className="text-xl text-[#3b82f6] font-black">~100M tons</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a1128] border-2 border-[#3b82f6] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">NI 43-101 Compliance</h3>
              <p className="text-base text-[#e2e8f0] leading-relaxed mb-6">
                Prepared in accordance with Canada's regulator-enforced standard for mineral project disclosure, widely relied upon in global mining capital markets.
              </p>
              <div className="space-y-3 text-sm text-white">
                <div className="flex items-start gap-3">
                  <span className="text-[#3b82f6] text-xl flex-shrink-0">✓</span>
                  <span>NI 43-101 compliant technical report</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#3b82f6] text-xl flex-shrink-0">✓</span>
                  <span>Pre-feasibility studies completed</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#3b82f6] text-xl flex-shrink-0">✓</span>
                  <span>Ready for development</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-10 text-center">
            <h3 className="text-3xl font-bold text-white mb-4 uppercase tracking-tight">Mine Life</h3>
            <div className="text-6xl font-black text-[#3b82f6] mb-4">100+</div>
            <p className="text-xl text-[#e2e8f0] leading-relaxed">
              Years of Continuous Domestic Production Capacity at Current Projections
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: REVENUE BRIDGE - The "Talc Strategy" */}
      <section className="py-24 px-6 bg-[#0a1128] border-y border-[#4a5568] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-6">
              Early Cash Flow Mechanism
            </h2>
            <p className="text-xl text-[#e2e8f0] max-w-3xl mx-auto leading-relaxed">
              Commercialization of Talc by-product during Magnesium ramp-up to reduce financing risk.
            </p>
          </div>

          <div className="bg-[#1a2332] border-2 border-[#3b82f6] rounded-lg p-10">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Talc Revenue Strategy</h3>
            <p className="text-lg text-[#e2e8f0] leading-relaxed mb-8">
              GMC's Whitney Deposit contains significant quantities of industrial-grade talc, which can create immediate revenue from sales to manufacturers of paint and coatings, plastics and specialty papers. Talc sales will generate cash flow before full magnesium production begins.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#3b82f6] mb-2">Phase I</div>
                <div className="text-sm text-[#e2e8f0]">Talc sales begin during feasibility</div>
              </div>
              <div className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#3b82f6] mb-2">Phase II</div>
                <div className="text-sm text-[#e2e8f0]">Ongoing talc revenue offsets construction costs</div>
              </div>
              <div className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#3b82f6] mb-2">Ramp-Up</div>
                <div className="text-sm text-[#e2e8f0]">Cash flow continues through magnesium production start</div>
              </div>
            </div>

            <div className="bg-[#0a1128] border border-[#4a5568] rounded-lg p-6">
              <h4 className="text-lg font-bold text-white mb-4 uppercase">Talc Applications</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#e2e8f0]">
                <div>• Paint & Coatings</div>
                <div>• Plastics</div>
                <div>• Specialty Papers</div>
                <div>• Industrial Fillers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT & VERIFICATION */}
      <section className="py-24 px-6 bg-[#1a2332] border-y border-[#4a5568]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-6">
              Contact & Verification
            </h2>
            <p className="text-xl text-[#e2e8f0] max-w-3xl mx-auto leading-relaxed">
              Immediate confirmation of receipt and further discussion.
            </p>
          </div>

          <div className="bg-[#0a1128] border-2 border-[#3b82f6] rounded-lg p-10 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-3xl font-bold text-white mb-2">{CONTACT_INFO.name}</div>
              <div className="text-lg text-[#e2e8f0] mb-6">{CONTACT_INFO.title}</div>
            </div>
            <div className="space-y-4 text-center">
              <div>
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-xl text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </div>
              <div>
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-xl text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI TERMINAL MODAL */}
      {showAI && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl">
          <div className="w-full max-w-6xl h-[85vh] relative flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-[#3b82f6] rounded animate-pulse"></div>
                <span className="text-base font-bold text-[#3b82f6] tracking-widest uppercase">GMC Strategic Liaison Active</span>
              </div>
              <button
                onClick={() => setShowAI(false)}
                className="text-white hover:text-[#3b82f6] text-base uppercase tracking-wider flex items-center gap-3 font-bold bg-[#0a1128] px-6 py-3 rounded border border-[#4a5568]"
              >
                Close Session ✕
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <AIAssistant />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
