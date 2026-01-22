import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { CheckCircle, Shield, Search, FileCheck, AlertTriangle } from 'lucide-react';

export default function AskBeforeYourAppPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Ask Before <span className="text-orange-500">Your App</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            App safety reviews, AI detection, and privacy audits for K-12 tools—helping parents, teachers, and schools make informed decisions.
          </p>
        </header>

        {/* What We Offer */}
        <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 sm:p-8 md:p-10 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                App Safety Reviews
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                Comprehensive evaluation of educational apps for data privacy, security practices, and student safety.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>FERPA/COPPA compliance check</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Data collection analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Third-party sharing review</span>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI Detection & Analysis
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                Identify AI-powered features, assess bias risks, and evaluate how AI is used in educational tools.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>AI functionality detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Bias and fairness assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Transparency evaluation</span>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <FileCheck className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Privacy Audits
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                Detailed privacy policy analysis and data practice reviews to ensure student information is protected.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Privacy policy review</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Data retention analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Parent rights documentation</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Parents</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Get peace of mind knowing the apps your child's school uses are safe and compliant.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Teachers</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Verify apps before using them in your classroom—ensure they meet district standards.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-5 sm:p-6 text-center sm:col-span-2 md:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tech Coordinators</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Streamline app vetting with professional reviews that save time and reduce risk.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 sm:p-8 md:p-10 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            Review Options
          </h2>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="border border-gray-200 rounded-lg p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Review</h3>
              <p className="text-2xl font-bold text-orange-500 mb-3">$49</p>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
                Quick safety check for a single app
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Privacy policy review</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Basic compliance check</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Summary report</span>
                </li>
              </ul>
            </div>
            <div className="border-2 border-orange-500 rounded-lg p-5 sm:p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Standard Review</h3>
              <p className="text-2xl font-bold text-orange-500 mb-3">$149</p>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
                Comprehensive analysis with AI detection
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Full privacy audit</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>AI functionality analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Detailed report with recommendations</span>
                </li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Review</h3>
              <p className="text-2xl font-bold text-orange-500 mb-3">$299</p>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
                Complete audit with bias assessment
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Everything in Standard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Bias and fairness evaluation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Consultation call included</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="bg-orange-50 rounded-2xl border border-orange-100 p-6 sm:p-8 mb-12">
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Proven Methodology</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Framework used by 157 Utah school districts to evaluate EdTech and AI tools responsibly.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">National Credibility</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Presented at A4L, CoSN, and national summits. Trusted methodology for FERPA/COPPA compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
            Need an app reviewed? Get a professional safety assessment in 24-48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact?service=Ask%20Before%20Your%20App" variant="primary" size="lg">
              Request a Review
            </Button>
            <Button href="/" variant="outline" size="lg">
              Learn About Enterprise Solutions
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Districts: Explore our <Link href="/" className="text-orange-500 hover:text-orange-600 underline">comprehensive governance services</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
