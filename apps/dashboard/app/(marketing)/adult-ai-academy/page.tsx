import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { CheckCircle } from 'lucide-react';

export default function AdultAIAcademyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <header className="text-center mb-12 sm:mb-16">
          <div className="mx-auto mb-6 sm:mb-8 h-32 w-32 sm:h-48 sm:w-48 rounded-3xl bg-white shadow-sm flex items-center justify-center">
            <Image
              src="/AAA.png"
              alt="Adult AI Academy logo"
              width={160}
              height={160}
              className="h-28 w-28 sm:h-40 sm:w-40"
              priority
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Adult AI Academy
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Practical AI literacy for adults—whether you're upskilling, hesitant to try AI, or ready to go beyond the basics. Built for real people, not just tech early adopters.
          </p>
        </header>

        {/* What We Offer */}
        <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 sm:p-8 md:p-10 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="border-l-4 border-orange-500 pl-4 sm:pl-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                Foundation Courses
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                Core AI concepts, safety principles, and clear guidance for adult learners who are new to AI or have been reluctant to dive in.
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>AI basics without the jargon</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Privacy and safety in everyday use</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>When and how to trust AI outputs</span>
                </li>
              </ul>
            </div>
            <div className="border-l-4 border-orange-500 pl-4 sm:pl-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                Application Workshops
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                Hands-on practice using AI for work, side projects, and daily life—beyond basic prompting.
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Writing, research, and productivity with AI</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Evaluating AI outputs and spotting bias</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Staying in control when tools get it wrong</span>
                </li>
              </ul>
            </div>
            <div className="border-l-4 border-orange-500 pl-4 sm:pl-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                Governance Training
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                Responsible use and simple governance—for yourself, your team, or your organization—without needing a compliance department.
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Tool vetting workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Risk assessment methods</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Compliance verification</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            Who It's For
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reluctant or Hesitant Learners</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                You've heard the hype but held back. We meet you where you are—no shame, no assumed tech fluency.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gen X, Xennials & Career Upskilling</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                You need AI literacy for work or life. Practical, clear training that fits your pace and goals.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center sm:col-span-2 md:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Anyone Ready to Go Beyond Basics</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                You've dabbled and want to use AI responsibly and effectively—without drinking the Kool-Aid.
              </p>
            </div>
          </div>
        </section>

        {/* Coming Soon Notice */}
        <section className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 sm:p-8 mb-8 text-center">
          <p className="text-lg sm:text-xl font-semibold text-orange-700 mb-2">
            🚀 Launching Spring 2026
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Adult AI Academy courses are currently in development. Join our waitlist to be notified when courses launch and receive early access pricing.
          </p>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 sm:p-8 md:p-10 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            Training Options <span className="text-sm font-normal text-gray-500">(Coming Soon)</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto opacity-75">
            <div className="border border-gray-200 rounded-lg p-6 relative">
              <div className="absolute top-2 right-2">
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">Coming Soon</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Individual Courses</h3>
              <p className="text-2xl font-bold text-orange-500 mb-3">$497 - $1,497</p>
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                Self-paced online courses with practical exercises and certification upon completion.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Access to course materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Certificate of completion</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Community forum access</span>
                </li>
              </ul>
            </div>
            <div className="border-2 border-orange-500 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">Coming Soon</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Workshops & Certifications</h3>
              <p className="text-2xl font-bold text-orange-500 mb-3">$1,997 - $2,997</p>
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                Live workshops with hands-on training, group collaboration, and advanced certification.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Live instructor-led sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Advanced certification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Ongoing support and resources</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
            Ready to build AI literacy on your terms?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact?service=Adult%20AI%20Academy" variant="primary" size="lg">
              Get Started
            </Button>
            <Button href="/tools/ai-readiness-quiz" variant="outline" size="lg">
              Take Free Assessment
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            K-12 or higher ed? See <Link href="/ask-before-you-app" className="text-orange-500 hover:text-orange-600 underline">Ask Before You App</Link>. Need compliance or consulting? <Link href="/" className="text-orange-500 hover:text-orange-600 underline">WasatchWise</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
