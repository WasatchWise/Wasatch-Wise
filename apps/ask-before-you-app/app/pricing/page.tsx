import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/shared/Button';
import { CheckCircle, GraduationCap } from 'lucide-react';

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-gray-500 mb-4">
            <Link href="/" className="text-orange-600 hover:underline">Ask Before You App</Link>
            {' '}/ Pricing
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Pricing
          </h1>
          <p className="text-lg text-gray-700 mb-10">
            Our awareness campaign and NDPA-aligned resources are free. For districts that want deeper implementation, we offer consulting and training.
          </p>

          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">NDPA Certification</h2>
                  <p className="text-gray-600 mb-4">
                    Free. Five modules—Foundations, Document Anatomy, DPA Workflow, Registry Ninja, Crisis Mastery—aligned with the SDPC framework. No sign-up required to start.
                  </p>
                  <Button href="/certification" variant="primary" size="md">
                    Start certification
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Always free</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Knowledge hub and state ecosystem guides
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  SDPC Registry links and &quot;what to ask&quot; resources
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  NDPA certification course (all 5 modules)
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Who Are You persona and tailored paths
                </li>
              </ul>
            </div>

            <div className="bg-orange-50 rounded-xl border border-orange-100 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">District consulting & training</h2>
              <p className="text-gray-700 mb-4">
                For boards, admins, and districts that want AI governance briefings, policy implementation, or training beyond the free certification—we offer DAROS briefings and implementation sprints. Pricing is custom.
              </p>
              <Button href="/contact" variant="primary" size="md">
                Contact us
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
