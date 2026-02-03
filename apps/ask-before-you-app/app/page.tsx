import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { OpenWhoModalButton } from '@/components/OpenWhoModalButton';
import { Shield, MapPin, Smartphone, Users, Megaphone, BookOpen, GraduationCap } from 'lucide-react';

export default function AskBeforeYouAppPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Campaign nav */}
        <nav className="flex flex-wrap items-center justify-between gap-4 mb-10 sm:mb-12">
          <Link href="/" className="text-xl font-bold text-orange-500 hover:text-orange-600">
            Ask Before You App
          </Link>
          <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-gray-600">
            <OpenWhoModalButton />
            <Link href="/learn" className="hover:text-orange-500">
              Knowledge hub
            </Link>
            <Link href="/certification" className="hover:text-orange-500">
              Certification
            </Link>
            <Link href="/ecosystem" className="hover:text-orange-500">
              State resources
            </Link>
          </div>
        </nav>

        {/* Campaign Hero */}
        <header className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
            <Megaphone className="w-4 h-4" />
            <span>National awareness campaign</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Ask Before <span className="text-orange-500">You App</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-2">
            Before you download that app—ask. Ask a parent. Ask an administrator. Ask your boss. Ask someone.
          </p>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            One simple habit that protects privacy everywhere: at home, at school, at work.
          </p>
        </header>

        {/* Risk-averse: you're in the right place */}
        <section className="mb-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
            <p className="text-gray-700 leading-relaxed">
              If you&apos;re cautious about what gets on your devices or into your kids&apos; schools—you&apos;re in the right place. We don&apos;t tell you to relax. We give you the facts: what the law actually says, what procedures your state uses, and how to verify before you trust. No hype, no hand-waving. Just information you can use and check yourself.
            </p>
          </div>
        </section>

        {/* Who It's For — Campaign Audience */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            Whether you&apos;re a parent, educator, administrator, student, or just curious
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Parents</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                You have a right to know what apps touch your kids&apos; data. We show you what to ask and where to find real answers—not reassurance.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Educators</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Know the actual rules and how to vet tools before you use them. Fact-based, so you&apos;re not guessing.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Administrators</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Get the procedures, roles, and compliance requirements for your state—so you can run a tight ship and show it.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your school uses apps that touch your data. Learn what to ask and what your rights are—so you&apos;re not in the dark.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Everyone else</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Want to verify before you trust? Here you get the criteria, the laws, and the sources—not marketing.
              </p>
            </div>
          </div>
        </section>

        {/* What You Get — The Hub */}
        <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 sm:p-8 md:p-10 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
            One place to learn and take action
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Understand different apps, state laws, and procedures. See how your state works—and how you can be a better advocate and steward.
          </p>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Understand apps</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                How to evaluate tools, what to ask vendors, and where to find vetted apps (e.g. SDPC Registry).
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">State laws & procedures</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Federal and state privacy laws, workflows, and compliance—by state. Pick yours and get the details.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Megaphone className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Be an advocate</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Increase your knowledge. Share it. Push for better practices in your school, district, or state.
              </p>
            </div>
          </div>
        </section>

        {/* Trust / SDPC — factual, verifiable */}
        <section className="bg-orange-50 rounded-2xl border border-orange-100 p-6 sm:p-8 mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-700 leading-relaxed">
              We&apos;re built on the same frameworks used by the{' '}
              <a href="https://privacy.a4l.org" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 font-medium underline">
                Student Data Privacy Consortium (SDPC)
              </a>
              {' '}and state alliances nationwide. That means what you see here—laws, roles, workflows—tracks what districts and states actually use. You can cross-check with official sources; we point you to them.
            </p>
          </div>
        </section>

        {/* Primary CTA — Go to the hub */}
        <section className="text-center">
          <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
            Explore apps, state laws, procedures, and advocacy—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/learn" variant="primary" size="lg">
              Explore the knowledge hub
            </Button>
            <Button href="/certification" variant="outline" size="lg">
              For educators: free certification
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            <a href="https://privacy.a4l.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">SDPC</a>
            {' · '}
            <a href="https://a4l.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">A4L Community</a>
          </p>
        </section>
      </div>
    </main>
  );
}
