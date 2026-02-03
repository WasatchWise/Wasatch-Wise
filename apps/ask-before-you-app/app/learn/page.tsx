'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/shared/Button';
import {
  Smartphone,
  MapPin,
  Megaphone,
  BookOpen,
  Shield,
  Users,
  GraduationCap,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ALL_STATES, SDPC_MEMBER_STATES, STATE_ECOSYSTEMS } from '@/lib/ecosystem';
import { setStoredPersona } from '@/lib/persona';

const PERSONAS = [
  { id: 'parent', label: "I'm a parent", icon: Users, hash: '#apps' },
  { id: 'educator', label: "I'm an educator", icon: BookOpen, hash: '#apps' },
  { id: 'administrator', label: "I'm an administrator", icon: Shield, hash: '#state-laws' },
  { id: 'student', label: "I'm a student", icon: GraduationCap, hash: '#apps' },
  { id: 'everyone', label: "I'm just learning", icon: Smartphone, hash: '#apps' },
] as const;

const WHO_LABELS: Record<string, string> = {
  parent: 'parent',
  educator: 'educator',
  administrator: 'administrator',
  student: 'student',
  just_learning: 'just learning',
};

export default function LearnPage() {
  const searchParams = useSearchParams();
  const who = searchParams.get('who');
  const whoLabel = who && WHO_LABELS[who] ? WHO_LABELS[who] : null;
  const availableStates = Object.keys(STATE_ECOSYSTEMS);

  // Persist persona for the session so Certification / Ecosystem can use it
  useEffect(() => {
    if (who && WHO_LABELS[who]) setStoredPersona(who);
  }, [who]);

  const scrollTo = (hash: string) => {
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero */}
        <section className="bg-gradient-to-b from-orange-50 to-white border-b border-orange-100 py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-gray-500 mb-4">
              <Link href="/" className="text-orange-600 hover:underline">Ask Before You App</Link>
              {' '}/ Knowledge hub
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Knowledge Hub
            </h1>
            {whoLabel && (
              <p className="text-sm font-medium text-orange-600 mb-2">
                Here for you as a {whoLabel} — we’ve scrolled to what’s most relevant.
              </p>
            )}
            <p className="text-lg text-gray-700 mb-4">
              Facts, procedures, and sources—so you can verify, not just trust. Understand apps, state laws, and how to be an advocate.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Pick your path below. Everything here is meant to be useful and checkable.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {PERSONAS.map(({ id, label, hash }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(hash)}
                  className="px-4 py-2 rounded-full bg-white border border-orange-200 text-gray-700 text-sm font-medium hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
          {/* Understand apps */}
          <section id="apps" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Understand apps</h2>
                <p className="text-gray-600 text-sm">What to ask before you (or your kids) use an app</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              {whoLabel && (
                <p className="text-orange-600 text-sm font-medium mb-3">{who === 'just_learning' ? 'For you: ' : `For ${whoLabel}s: `}what to ask and where to check.</p>
              )}
              <p className="text-gray-600 text-sm mb-6">
                It&apos;s reasonable to want to verify before you (or your kids) use an app. Here&apos;s what actually matters and where to check.
              </p>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>Ask before you download.</strong> Parents: ask the school what apps they use and what data they collect—in writing if you want a record. Educators: ask your tech or privacy lead before adding a new tool.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>Traffic light thinking.</strong> Green = vetted and approved; Yellow = use with caution or after review; Red = not approved. We don&apos;t tell you which apps are green—we give you the criteria so you (or your district) can decide.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>SDPC Registry.</strong> Many states use the Student Data Privacy Consortium registry to see which vendors have signed standard agreements. Your state or district may use it; we link to the source so you can confirm.</span>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="https://privacy.a4l.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700"
                >
                  SDPC Registry & resources
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Link href="/certification" className="inline-flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700">
                  For educators: App vetting certification
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* State laws & procedures */}
          <section id="state-laws" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">State laws & procedures</h2>
                <p className="text-gray-600 text-sm">Federal and state privacy laws, workflows, and compliance by state</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              {whoLabel && (
                <p className="text-blue-600 text-sm font-medium mb-3">{who === 'just_learning' ? 'For you: ' : `For ${whoLabel}s: `}roles, laws, and workflows that apply in your state.</p>
              )}
              <p className="text-gray-700 mb-6">
                If you want to know exactly what&apos;s required in your state—not summaries, but roles, laws, and workflows—we lay it out. Federal laws (FERPA, PPRA), state-specific laws, who does what (Data Manager, Security Officer, etc.), and what your state actually requires. Pick your state and get the details; you can cross-reference with official state sources we link to.
              </p>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Select your state</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATES.map((state) => {
                    const hasData = availableStates.includes(state.code);
                    return (
                      <Link
                        key={state.code}
                        href={hasData ? `/ecosystem/${state.code.toLowerCase()}` : '/ecosystem'}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          hasData
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {state.code}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <Button href="/ecosystem" variant="primary" size="md">
                View all states & pick yours
              </Button>
              <p className="mt-4 text-sm text-gray-500">
                {SDPC_MEMBER_STATES.length}+ states are SDPC members; we&apos;re adding full ecosystem guides state by state. Utah is available now as a model.
              </p>
            </div>
          </section>

          {/* Be an advocate */}
          <section id="advocate" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Be an advocate & steward</h2>
                <p className="text-gray-600 text-sm">Increase your knowledge and push for better practices</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              {whoLabel && (
                <p className="text-green-600 text-sm font-medium mb-3">{who === 'just_learning' ? 'For you: ' : `For ${whoLabel}s: `}learn, ask, and advocate from a position of knowledge.</p>
              )}
              <p className="text-gray-600 text-sm mb-6">
                Knowing the facts reduces guesswork and gives you a clear role. We&apos;re not here to calm you down—we&apos;re here to give you what you need to act.
              </p>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">•</span>
                  <span><strong>Learn.</strong> Use this hub and your state&apos;s ecosystem page so you know what laws and procedures actually apply where you live or work.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">•</span>
                  <span><strong>Ask.</strong> Ask your school, district, or employer what they do with data and how they vet apps. Document answers when it matters to you.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">•</span>
                  <span><strong>Share.</strong> Tell other parents, colleagues, or friends to ask before they app. One habit, scaled.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">•</span>
                  <span><strong>Get certified (educators).</strong> Our free NDPA-focused certification teaches the same language districts and state alliances use—so you can advocate from a position of knowledge, not just concern.</span>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button href="/certification" variant="primary" size="md">
                  Free certification for educators
                </Button>
                <Link href="/ecosystem" className="inline-flex items-center gap-2 text-gray-600 font-medium hover:text-gray-900">
                  Your state&apos;s ecosystem
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* Certification card — one path */}
          <section id="certification" className="scroll-mt-24">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">For educators: NDPA certification</h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Structured training on what the law says, how vetting works, and how to talk to vendors—aligned with the SDPC framework. No fluff; you leave with something you can use and cite.
                  </p>
                </div>
                <Button href="/certification" variant="primary" size="lg" className="flex-shrink-0">
                  Start free certification
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8 px-4 mt-12">
          <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
            <p>
              Ask Before You App is a national awareness campaign. Built on the{' '}
              <a href="https://privacy.a4l.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">SDPC</a>
              {' '}framework ·{' '}
              <a href="https://a4l.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">A4L Community</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
