'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { ALL_STATES, hasEcosystemData } from '@/lib/ecosystem';
import { EXTERNAL_RESOURCES } from '@/lib/ecosystem/partners';
import { setStoredPersona } from '@/lib/persona';
import {
  getAppsContent,
  getStateLawsContent,
  getAdvocateContent,
  getRolePersonaId,
  type PersonaId,
} from '@/lib/learn/role-content';

const PERSONAS: { id: PersonaId; label: string; icon: typeof Users; hash: string }[] = [
  { id: 'parent', label: "I'm a parent", icon: Users, hash: '#apps' },
  { id: 'educator', label: "I'm an educator", icon: BookOpen, hash: '#apps' },
  { id: 'administrator', label: "I'm an administrator", icon: Shield, hash: '#state-laws' },
  { id: 'student', label: "I'm a student", icon: GraduationCap, hash: '#apps' },
  { id: 'just_learning', label: "I'm just learning", icon: Smartphone, hash: '#apps' },
];

const WHO_LABELS: Record<string, string> = {
  parent: 'parent',
  educator: 'educator',
  administrator: 'administrator',
  student: 'student',
  just_learning: 'just learning',
};

export default function LearnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const who = searchParams.get('who');
  const persona: PersonaId = getRolePersonaId(who) ?? 'just_learning';
  const whoLabel = WHO_LABELS[persona] ?? null;

  const appsContent = getAppsContent(persona);
  const stateLawsContent = getStateLawsContent(persona);
  const advocateContent = getAdvocateContent(persona);

  // Persist persona for the session so Certification / Ecosystem can use it
  useEffect(() => {
    if (persona) setStoredPersona(persona);
  }, [persona]);

  // Scroll to hash on load (e.g. from WhoAreYou modal: /learn?who=parent#apps)
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash) {
      const timer = setTimeout(() => scrollTo(hash || '#apps'), 300);
      return () => clearTimeout(timer);
    }
  }, [who]);

  const scrollTo = (hash: string) => {
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const switchPersona = (id: PersonaId, hash: string) => {
    const targetHash = hash || '#apps';
    router.push(`/learn?who=${id}${targetHash}`);
    // Scroll after navigation; requestAnimationFrame ensures DOM has updated
    requestAnimationFrame(() => {
      setTimeout(() => scrollTo(targetHash), 150);
    });
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
            <p className="text-sm text-gray-500 mb-4">
              Pick your path below. Everything here is meant to be useful and checkable.
            </p>
            <p className="text-sm mb-8">
              <Link href="/tools/wisebot" className="text-orange-600 font-medium hover:text-orange-700 underline">
                Have a quick question? Ask WiseBot
              </Link>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {PERSONAS.map(({ id, label, hash }) => (
                <button
                  key={id}
                  onClick={() => switchPersona(id, hash)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    persona === id
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white border-orange-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 mb-1">Also on this page</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => scrollTo('#certification')}
                className="px-3 py-1.5 rounded-full bg-white/80 border border-gray-200 text-gray-600 text-sm hover:bg-orange-50 hover:border-orange-200 transition-colors"
              >
                Certification
              </button>
              <button
                onClick={() => scrollTo('#external-resources')}
                className="px-3 py-1.5 rounded-full bg-white/80 border border-gray-200 text-gray-600 text-sm hover:bg-orange-50 hover:border-orange-200 transition-colors"
              >
                External resources
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
          {/* Understand apps — role-specific */}
          <section id="apps" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{appsContent.heading}</h2>
                <p className="text-gray-600 text-sm">{appsContent.subheading}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              <p className="text-gray-600 text-sm mb-6">{appsContent.intro}</p>
              <ul className="space-y-4 text-gray-700">
                {appsContent.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">•</span>
                    <span><strong>{b.strong}</strong> {b.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-4">
                {appsContent.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700"
                    >
                      {link.label}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href} className="inline-flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700">
                      {link.label}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )
                )}
              </div>
            </div>
          </section>

          {/* State laws & procedures — role-specific */}
          <section id="state-laws" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{stateLawsContent.heading}</h2>
                <p className="text-gray-600 text-sm">{stateLawsContent.subheading}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              <p className="text-gray-700 mb-6">{stateLawsContent.intro}</p>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Select your state</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATES.map((state) => {
                    const hasFullGuide = hasEcosystemData(state.code);
                    return (
                      <Link
                        key={state.code}
                        href={`/ecosystem/${state.code.toLowerCase()}`}
                        aria-label={`${state.name} (${state.code})${hasFullGuide ? ' — full guide' : ''}`}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          hasFullGuide
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {state.code}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <Button href={stateLawsContent.ctaHref} variant="primary" size="md">
                {stateLawsContent.ctaLabel}
              </Button>
              <p className="mt-4 text-sm text-gray-500">{stateLawsContent.footer}</p>
            </div>
          </section>

          {/* Be an advocate — role-specific */}
          <section id="advocate" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{advocateContent.heading}</h2>
                <p className="text-gray-600 text-sm">{advocateContent.subheading}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              <p className="text-gray-600 text-sm mb-6">{advocateContent.intro}</p>
              <ul className="space-y-4 text-gray-700">
                {advocateContent.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-500 font-bold">•</span>
                    <span><strong>{b.strong}</strong> {b.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button href={advocateContent.primaryCtaHref} variant="primary" size="md">
                  {advocateContent.primaryCtaLabel}
                </Button>
                <Link href={advocateContent.secondaryCtaHref} className="inline-flex items-center gap-2 text-gray-600 font-medium hover:text-gray-900">
                  {advocateContent.secondaryCtaLabel}
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

          {/* External Resources */}
          <section id="external-resources" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-6 h-6 text-orange-500" />
              External Resources
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              We point you to trusted partners and tools so you can verify at the source.
            </p>
            <div className="space-y-4">
              {EXTERNAL_RESOURCES.map((resource) => (
                <div key={resource.name} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-200 transition-colors">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {resource.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">{resource.org}</p>
                    <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                    <span className="inline-flex items-center gap-1 text-orange-600 text-sm font-medium mt-2 group-hover:underline">
                      Visit resource
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </a>
                </div>
              ))}
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
