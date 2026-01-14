import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">WasatchWise</h3>
            <p className="text-sm">
              AI governance for school districts that actually works.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services/cognitive-audit" className="hover:text-white">
                  Cognitive Audit
                </Link>
              </li>
              <li>
                <Link href="/services/compliance-protocol" className="hover:text-white">
                  90-Day Protocol
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/resources/blog" className="hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources/downloads" className="hover:text-white">
                  Downloads
                </Link>
              </li>
              <li>
                <Link href="/tools/ai-readiness-quiz" className="hover:text-white">
                  AI Readiness Quiz
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} WasatchWise LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

