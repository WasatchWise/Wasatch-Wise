import Link from 'next/link';
import { Button } from '@/components/shared/Button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-500">
            WasatchWise
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#services" className="text-gray-700 hover:text-orange-500">
              Services
            </Link>
            <Link href="/#methodology" className="text-gray-700 hover:text-orange-500">
              Methodology
            </Link>
            <Link href="/#case-studies" className="text-gray-700 hover:text-orange-500">
              Case Studies
            </Link>
            <Link href="/#resources" className="text-gray-700 hover:text-orange-500">
              Resources
            </Link>
            <Link href="/registry" className="text-gray-700 hover:text-orange-500">
              Vendor Registry
            </Link>
            <Link href="/adult-ai-academy" className="text-gray-700 hover:text-orange-500">
              Adult AI Academy
            </Link>
            <Link href="/tools/wisebot" className="text-gray-700 hover:text-orange-500">
              WiseBot
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-orange-500">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button href="/contact" variant="primary" size="sm">
              Contact
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

