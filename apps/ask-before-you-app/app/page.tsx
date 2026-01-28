import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { CheckCircle, Shield, Search, FileCheck, Users, BookOpen, Handshake } from 'lucide-react';

export default function AskBeforeYouAppPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <header className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
            <Handshake className="w-4 h-4" />
            <span>Supporting the SDPC Mission</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Ask Before <span className="text-orange-500">You App</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Free resources, training, and tools to help educators protect student data privacy—built on the SDPC framework.
          </p>
        </header>

        {/* Partnership Banner */}
        <section className="bg-gradient-to-r from-[#005696] to-[#2b6cb0] rounded-2xl p-6 sm:p-8 mb-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
              Extending the Student Data Privacy Consortium
            </h2>
            <p className="text-blue-100 leading-relaxed">
              The <a href="https://privacy.a4l.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Student Data Privacy Consortium (SDPC)</a> created the National Data Privacy Agreement (NDPA) used by 30+ state alliances. We provide free training, tools, and resources to help educators use these frameworks effectively.
            </p>
          </div>
        </section>

        {/* What We Provide - Free */}
        <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 sm:p-8 md:p-10 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
            Free Resources for Educators
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Everything you need to protect student privacy—no cost, no catch.
          </p>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                NDPA Certification Course
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                Master student data privacy in 50 minutes. Earn badges, build confidence, protect students.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>5 interactive modules</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Real breach case studies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Certificate upon completion</span>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                App Vetting Guidance
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                Learn to evaluate EdTech tools using the Traffic Light System and SDPC Registry.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Green/Yellow/Red classification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>AI detection frameworks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Registry navigation tips</span>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <FileCheck className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Templates & Toolkits
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                Ready-to-use email templates, decision trees, and crisis response protocols.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Vendor outreach scripts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Shadow IT response plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Breach notification checklists</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            Who We Serve
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tech Coordinators</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Streamline app vetting and master the SDPC Registry workflow.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">District Privacy Officers</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Build expertise in NDPA negotiation and vendor management.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Teachers</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Understand what to check before using apps in your classroom.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">State Alliances</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Training resources to onboard new member districts.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="bg-orange-50 rounded-2xl border border-orange-100 p-6 sm:p-8 mb-12">
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">SDPC Framework</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Built on the National Data Privacy Agreement used by 30+ state alliances.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">A4L Community</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Aligned with Access 4 Learning standards and best practices.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Handshake className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Always Free</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Training and resources provided at no cost to educators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
            Ready to become a student data privacy expert? Start your free certification today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/certification" variant="primary" size="lg">
              Start Free Certification
            </Button>
            <Button href="/ecosystem" variant="outline" size="lg">
              Explore State Resources
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Learn more about the <a href="https://privacy.a4l.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">Student Data Privacy Consortium</a> and the <a href="https://a4l.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">A4L Community</a>
          </p>
        </section>
      </div>
    </main>
  );
}
