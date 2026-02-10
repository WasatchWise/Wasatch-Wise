import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">WasatchWise</h3>
            <p className="text-sm">
              AI governance and deep training for school districts that actually works.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#services" className="hover:text-white">
                  Cognitive Audit
                </Link>
              </li>
              <li>
                <Link href="/#methodology" className="hover:text-white">
                  90-Day Protocol
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/tools/ai-readiness-quiz" className="hover:text-white">
                  AI Readiness Quiz
                </Link>
              </li>
              <li>
                <Link href="/registry" className="hover:text-white">
                  Vendor Registry
                </Link>
              </li>
              <li>
                <Link href="/tools/wisebot" className="hover:text-white">
                  WiseBot
                </Link>
              </li>
              <li>
                <Link href="https://www.adultaiacademy.com" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                  Adult AI Academy
                </Link>
              </li>
              <li>
                <Link href="https://www.askbeforeyouapp.com" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                  Ask Before You App
                </Link>
              </li>
              <li>
                <Link href="/clarion" className="hover:text-white">
                  Clarion Brief
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://johnlyman.net" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                  About the Founder
                </Link>
              </li>
              <li>
                <Link href="/#case-studies" className="hover:text-white">
                  Case Studies
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

