'use client';

import Link from 'next/link';
import Image from 'next/image';

// Stable year for SSR/client hydration; update annually if desired.
const COPYRIGHT_YEAR = 2026;

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div className="text-center md:text-left">
            <Link className="inline-block mb-2" href="/">
              <Image
                src="/images/Site_logo.png"
                alt="SLCTrips"
                width={160}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-400">From Salt Lake, to Everywhere</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <Link className="hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white" href="/destinations">
              Destinations
            </Link>
            <Link className="hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white" href="/tripkits">
              Adventure Guides
            </Link>
            <Link className="hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white" href="/welcome-wagon">
              New to Utah?
            </Link>
            <Link className="hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white" href="/partners">
              Partners
            </Link>
            <Link className="hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white" href="/faq">
              FAQ
            </Link>
          </nav>
          <div className="text-center md:text-right">
            <a href="mailto:Dan@slctrips.com" className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4 decoration-blue-500/70 hover:decoration-blue-300">
              Dan@slctrips.com
            </a>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
            <Link href="/faq" className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white">
              FAQ
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/legal/terms" className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white">
              Terms
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/legal/privacy" className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white">
              Privacy
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/legal/refund" className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white">
              Refund Policy
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/legal/contact" className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white">
              Contact
            </Link>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('openCookiePreferences'));
                }
              }}
              className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white"
            >
              Cookie Preferences
            </button>
            <span className="text-gray-600">•</span>
            <a
              href="http://paidforadvertising.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-white"
            >
              Affiliate Disclosure
            </a>
          </div>
          <p className="text-center text-gray-500 text-sm mb-2">
            As an Amazon Associate I earn from qualifying purchases.
          </p>
          <p className="text-center text-gray-500 text-sm">
            © {COPYRIGHT_YEAR} SLCTrips, a{' '}
            <a
              href="https://wasatchwise.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4 decoration-blue-500/70 hover:decoration-blue-300"
            >
              Wasatch Wise LLC
            </a>{' '}
            endeavor • Made with ❤️ by just some guy who really loves Utah
          </p>
        </div>
      </div>
    </footer>
  );
}
