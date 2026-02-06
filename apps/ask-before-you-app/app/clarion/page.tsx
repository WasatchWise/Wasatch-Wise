"use client";

import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Callout } from "@/components/Callout";

export default function ClarionBrief() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20 selection:bg-orange-100 selection:text-orange-900">
      {/* Hero Section */}
      <header className="animate-in mb-24 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 mb-6 group cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-700">
            Private Strategic Briefing
          </p>
        </div>
        
        <h1 className="text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1] mb-8">
          Ask Before <br />
          <span className="text-orange-500">You App.</span>
        </h1>
        
        <p className="text-2xl text-zinc-600 leading-relaxed font-light mb-10">
          A Platform for K-12 Digital Literacy — Bridging the Gap Between Parent Panic and Vendor Marketing.
        </p>

        <div className="glass-panel p-8 rounded-3xl border-zinc-200/50 bg-white/80 shadow-xl shadow-orange-900/5">
          <p className="text-lg text-zinc-800 leading-relaxed italic">
            "<strong>Bennett,</strong> it's been a year since we did that Student Data Privacy Consortium panel together. A lot has changed in K-12 AI since then. I wanted to share what I'm seeing, and where I think there's a unique opportunity for Clarion."
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold">JL</div>
            <div>
              <p className="text-sm font-bold text-zinc-900 leading-none">John Lyman</p>
              <p className="text-xs text-zinc-500 mt-1">Ask Before You App</p>
            </div>
          </div>
        </div>
      </header>

      {/* The Problem */}
      <Section kicker="The Challenge" title="Who's Winning the K-12 AI Conversation?" className="animate-in [animation-delay:200ms]">
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <div className="p-8 rounded-2xl bg-zinc-900 text-white">
            <h3 className="text-xl font-bold mb-4 text-red-400">The Extremes</h3>
            <ul className="space-y-4 text-zinc-300">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                <span><strong className="text-white">Parent panic groups</strong> pushing fear-based narratives: "Ban Chromebooks, AI is surveillance."</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                <span><strong className="text-white">EdTech vendors</strong> pushing adoption without governance: "Trust us with your data, don't ask hard questions."</span>
              </li>
            </ul>
          </div>
          <div className="p-8 rounded-2xl bg-white border border-zinc-200">
            <h3 className="text-xl font-bold mb-4 text-orange-500">The Institutional Gap</h3>
            <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
              Government entities like USBE are bound by constraints. They can't call out predatory practices or move at the speed of the market.
            </p>
            <ul className="space-y-3 text-zinc-800 text-sm font-medium">
              <li>• "This vendor's practices are predatory"</li>
              <li>• "This tool is safe if configured correctly"</li>
              <li>• "Here's how to evaluate without fear"</li>
            </ul>
            <p className="mt-6 pt-6 border-t border-zinc-100 text-zinc-500 text-xs uppercase tracking-widest font-bold">These remain unsaid.</p>
          </div>
        </div>
      </Section>

      {/* The Asset */}
      <Section kicker="The Asset" title="askbeforeyouapp.com" className="animate-in [animation-delay:400ms]">
        <div className="max-w-3xl">
          <p className="text-xl text-zinc-700 leading-relaxed mb-8">
            The intellectual property and framework built during six years at USBE—now unshackled and ready to activate.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Callout title="Proven Scalability">
              Used by 150+ Utah school districts and charters to evaluate EdTech and AI tools responsibly.
            </Callout>
            <Callout title="National Credibility">
              Presented at A4L, CoSN, and national summits. Trusted methodology for FERPA/COPPA.
            </Callout>
          </div>
        </div>
      </Section>

      {/* The Opportunity */}
      <Section kicker="The Strategy" title="Clarion + Ask Before You App" className="animate-in [animation-delay:600ms]">
        <p className="text-2xl font-light text-zinc-900 leading-snug mb-10">
          What if <span className="font-semibold text-orange-500">"Ask Before You App"</span> becomes the front door to K-12 AI governance?
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            premium
            title="Face of Literacy"
            subtitle="The Educator-facing translator"
            bullets={["Moves at market pace", "Takes public positions", "Builds early trust"]}
          />
          <Card 
            premium
            title="Lead Engine"
            subtitle="The trust builder"
            bullets={["Free tools & frameworks", "High-value education", "Districts raise hands"]}
          />
          <Card 
            premium
            title="Enterprise Solution"
            subtitle="The Clarion backend"
            bullets={["Legal expertise", "Governance frameworks", "Compliance support"]}
          />
        </div>
      </Section>

      {/* Engagement Models */}
      <Section kicker="Next Steps" title="Three Possible Engagement Models" className="animate-in [animation-delay:800ms]">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="p-6 text-sm font-bold uppercase tracking-widest text-zinc-500">Model</th>
                <th className="p-6 text-sm font-bold uppercase tracking-widest text-zinc-500">Structure</th>
                <th className="p-6 text-sm font-bold uppercase tracking-widest text-zinc-500">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr className="hover:bg-orange-50/30 transition-colors">
                <td className="p-6 font-bold text-zinc-900 text-lg">Strategic Partnership</td>
                <td className="p-6 text-zinc-600">Stay Independent</td>
                <td className="p-6 text-zinc-600">Cross-referral & mutual frameworks</td>
              </tr>
              <tr className="hover:bg-orange-50/30 transition-colors">
                <td className="p-6 font-bold text-zinc-900 text-lg">Clarion Powered</td>
                <td className="p-6 text-zinc-600">License Platform</td>
                <td className="p-6 text-zinc-600">Your education market entry strategy</td>
              </tr>
              <tr className="hover:bg-orange-50/30 transition-colors">
                <td className="p-6 font-bold text-zinc-900 text-lg">Full-Time Role</td>
                <td className="p-6 text-zinc-600">Join Clarion</td>
                <td className="p-6 text-zinc-600">I build the K-12 vertical inside the firm</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <footer className="mt-32 pt-12 border-t border-zinc-200/50">
        <div className="max-w-2xl">
          <h3 className="text-3xl font-bold text-zinc-900 mb-4">Let's Talk.</h3>
          <p className="text-xl text-zinc-600 font-light mb-8">
            "Somebody needs to be the reasonable voice in the middle of this conversation. And right now, that voice doesn't exist. Do you see a way for us to do this together?"
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-8 rounded-3xl bg-orange-500 text-white shadow-2xl shadow-orange-500/20">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] mb-1 opacity-80">Monday, December 22nd</p>
              <h4 className="text-2xl font-bold">Discussion with Bennett</h4>
            </div>
            <div className="sm:ml-auto no-print">
              <button 
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl bg-white text-orange-500 font-bold hover:bg-zinc-100 transition-colors"
              >
                Download PDF Briefing
              </button>
            </div>
          </div>
          
          <div className="mt-12 text-sm text-zinc-500 space-y-2">
            <p><strong>John Lyman</strong> — Former AI & Student Data Privacy Specialist, USBE</p>
            <p>157 LEAs | 6 years | FERPA/COPPA/AI governance | Owner: askbeforeyouapp.com</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
