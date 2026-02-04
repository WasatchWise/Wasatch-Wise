import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Search, ExternalLink, Shield, BookOpen } from 'lucide-react';

export default function RegistryPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-gray-500 mb-4">
            <Link href="/" className="text-orange-600 hover:underline">Ask Before You App</Link>
            {' '}/ Vendor Registry
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Vendor Registry
          </h1>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            We point you to the official <strong>Student Data Privacy Consortium (SDPC) Registry</strong>—the same registry many states and districts use to see which vendors have signed standard agreements (e.g. NDPA). Your state or district may use it; we link to the source so you can verify.
          </p>

          <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-500" />
              Search the SDPC Registry
            </h2>
            <p className="text-gray-600 mb-6">
              Find which vendors have signed data privacy agreements in your state or across the consortium. Use the official SDPC search to confirm before you adopt a tool.
            </p>
            <a
              href="https://sdpc.a4l.org/search.php"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg font-semibold px-8 py-4 text-lg bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Open SDPC Registry search
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Link
              href="https://privacy.a4l.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
            >
              <Shield className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900">SDPC Framework</span>
                <p className="text-sm text-gray-600 mt-1">Learn about the Student Data Privacy Consortium, NDPA, and state alliances.</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
            </Link>
            <Link
              href="/learn"
              className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900">Knowledge hub</span>
                <p className="text-sm text-gray-600 mt-1">What to ask vendors, state laws, and how to be an advocate.</p>
              </div>
            </Link>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Ask Before You App is built on the same frameworks as the SDPC. We don&apos;t replace the registry—we send you to it.
          </p>
        </div>
      </main>
    </>
  );
}
