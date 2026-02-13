import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateMetadata as genMeta } from '@/lib/utils/seo';
import { CheckCircle } from 'lucide-react';
import { AIFoundationsEmailGate } from './AIFoundationsEmailGate';

export const metadata = genMeta({
  title: 'AI Foundations for Educators — Adult AI Academy',
  description:
    'The practical, no-shame AI course built for educators who are skeptical, overwhelmed, or just tired of being told to embrace AI without guidance. 6 modules, 18 lessons.',
  canonical: 'https://adultaiacademy.com/courses/ai-foundations',
});

const LEARN_ITEMS = [
  'How to spot AI hallucinations before they embarrass you (Module 1)',
  'How to draft parent emails, summaries, and reports in seconds instead of hours (Module 2)',
  'Exactly what data you can and cannot put into AI tools under FERPA and COPPA (Module 3)',
  'A fill-in-the-blank prompting framework that works every time (Module 4)',
  'How to design AI-enhanced lessons that make students think harder, not less (Module 5)',
  'How to lead AI adoption in your building with a ready-to-present proposal (Module 6)',
];

const DIFFERENTIATORS = [
  { title: 'No jargon', desc: 'Plain language. Technical terms are defined immediately.' },
  { title: 'No hour-long lectures', desc: 'Every lesson is 30 minutes or less. Short video, guided activity, real deliverable.' },
  { title: 'No shame', desc: 'We meet you where you are. We do not use AI anxiety as a sales tactic.' },
  { title: 'Built by a practitioner', desc: 'Created by John Lyman, former Utah State K-12 Data Privacy Lead who took statewide compliance from 8% to 92%.' },
];

const MODULES = [
  { id: 1, title: 'The BS Detector', question: 'How do I know when AI is lying to me?', lessons: 3 },
  { id: 2, title: 'The Virtual Intern', question: 'What can AI actually do for me right now?', lessons: 3 },
  { id: 3, title: 'The Walled Garden', question: 'How do I use AI without getting fired?', lessons: 3 },
  { id: 4, title: 'The Prompt Engineer', question: 'How do I get AI to do what I actually want?', lessons: 3 },
  { id: 5, title: 'The Classroom Architect', question: 'How do I bring this to my students?', lessons: 3 },
  { id: 6, title: 'The AI Leader', question: 'How do I lead AI adoption in my building?', lessons: 3 },
];

const PRICING_TIERS = [
  { name: 'Free Preview', price: '$0', desc: 'Module 1, Lesson 1 ("Why AI Lies") + Verification Checklist template', cta: 'Start Free', href: '#free-preview' },
  { name: 'Prompt Rescue Kit', price: '$47', desc: 'CRAFT Framework guide + 20 tested prompt templates + cheat sheet', cta: 'Get the Kit', href: '/contact' },
  { name: 'Full Course', price: '$497', desc: 'All 6 modules, 18 lessons, templates, prompt library, certificate', cta: 'Enroll Now', href: '/contact', primary: true },
  { name: 'Site License', price: '$7,500+', desc: 'Full course for up to 50 educators + admin dashboard + live Q&A', cta: 'Contact Us', href: '/contact' },
];

export default function AIFoundationsLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/adult-ai-academy/courses"
          className="text-sm text-slate-600 hover:text-slate-700 mb-8 inline-block"
        >
          &larr; All courses
        </Link>

        {/* Hero */}
        <header className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            AI Foundations for Educators: Stop Guessing. Start Governing.
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            The practical, no-shame AI course built for educators who are skeptical, overwhelmed, or
            just tired of being told to &quot;embrace AI&quot; without any actual guidance on how.
          </p>
          <p className="text-slate-700 leading-relaxed max-w-2xl mx-auto">
            You are not behind. If you have tried ChatGPT once, got a weird answer, and closed the
            tab, you are not alone. If you have sat through an AI training that made you feel like
            the only person in the room who did not get it, you are not alone. If you are terrified
            of accidentally putting student data somewhere it should not go, that is not paranoia.
            That is good judgment. This course was built for you.
          </p>
        </header>

        {/* What You Will Learn */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Will Learn</h2>
          <ul className="space-y-3">
            {LEARN_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What Makes This Different */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Makes This Different</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {DIFFERENTIATORS.map((d) => (
              <Card key={d.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{d.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">{d.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Course Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Module</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Core Question</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Lessons</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MODULES.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{m.question}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{m.lessons}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-2">Total: 6 modules · 18 lessons · ~9 hours</p>
        </section>

        {/* Pricing */}
        <section className="mb-12" id="pricing">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={tier.primary ? 'ring-2 ring-orange-500' : ''}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <div className="text-2xl font-bold text-orange-500">{tier.price}</div>
                  <p className="text-sm text-slate-600">{tier.desc}</p>
                </CardHeader>
                <CardContent>
                  <Link href={tier.href}>
                    <Button
                      className={`w-full ${tier.primary ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Free Preview - Email Gate */}
        <section className="mb-12" id="free-preview">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Free: Module 1, Lesson 1</h2>
          <p className="text-slate-600 mb-4">
            Get instant access to &quot;Why AI Lies&quot; and the Verification Checklist template. No credit card required.
          </p>
          <AIFoundationsEmailGate />
        </section>

        {/* About Instructor */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Instructor</h2>
          <p className="text-slate-700 leading-relaxed">
            John Lyman is the former Utah State K-12 Data Privacy Lead. He led the statewide
            transformation that moved compliance from 8% to 92%. He has built seven platforms in
            eight months and now runs WasatchWise, providing AI governance consulting for K-12
            districts. This course reflects what actually works in schools, not theory.
          </p>
        </section>

        {/* Primary CTA */}
        <div className="text-center bg-orange-50 border border-orange-200 rounded-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Enroll Now – $497</h3>
          <p className="text-slate-600 mb-4">
            9 hours of practical training. 18 deliverables you can use Monday. Certificate of
            completion. Lifetime access.
          </p>
          <Link href="/contact?service=AI+Foundations+Course">
            <Button className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
              Enroll Now – $497
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
