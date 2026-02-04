import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Ask Before You App</h3>
            <p className="text-sm">
              National awareness campaign for student data privacy. Learn, get certified, find your state.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Campaign</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/learn" className="hover:text-white">
                  Knowledge hub
                </Link>
              </li>
              <li>
                <Link href="/certification" className="hover:text-white">
                  Certification
                </Link>
              </li>
              <li>
                <Link href="/ecosystem" className="hover:text-white">
                  State resources
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Tools & resources</h4>
            <ul className="space-y-2 text-sm">
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
                <Link href="/clarion" className="hover:text-white">
                  Clarion Brief
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Our other properties</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.adultaiacademy.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Adult AI Academy
                </a>
              </li>
              <li>
                <a href="https://wasatchwise.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WasatchWise
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Ask Before You App / WasatchWise LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
