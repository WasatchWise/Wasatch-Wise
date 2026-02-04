'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/shared/Button';
import { useState } from 'react';
import { OpenWhoModalButton } from '@/components/OpenWhoModalButton';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/wasatchwiselogo.png"
                alt="Ask Before You App"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-orange-500 group-hover:text-orange-600 transition-colors">
                Ask Before You App
              </span>
              <span className="text-xs text-gray-600 font-medium tracking-wide">
                Where you wonder. For K-12ers
              </span>
            </div>
          </Link>

          {/* Desktop Navigation — ABYA only */}
          <nav className="hidden lg:flex items-center gap-6">
            <OpenWhoModalButton />
            <Link href="/learn" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium">
              Knowledge hub
            </Link>
            <Link href="/certification" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium">
              Certification
            </Link>
            <Link href="/ecosystem" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium">
              State resources
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium flex items-center gap-1">
                Tools
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <Link href="/tools/ai-readiness-quiz" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                    AI Readiness Quiz
                  </Link>
                  <Link href="/tools/wisebot" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                    WiseBot
                  </Link>
                  <Link href="/registry" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                    Vendor Registry
                  </Link>
                </div>
              </div>
            </div>
            <Button href="/contact" variant="primary" size="sm">
              Contact
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <Button href="/contact" variant="primary" size="sm" className="hidden sm:inline-flex">
              Contact
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-orange-500"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation — ABYA only */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('abya-open-who-modal'));
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 border-orange-300 w-fit"
              >
                Who are you?
              </button>
              <Link href="/learn" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Knowledge hub
              </Link>
              <Link href="/certification" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Certification
              </Link>
              <Link href="/ecosystem" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                State resources
              </Link>
              <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</span>
                <Link href="/tools/ai-readiness-quiz" className="text-gray-700 hover:text-orange-500 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>
                  AI Readiness Quiz
                </Link>
                <Link href="/tools/wisebot" className="text-gray-700 hover:text-orange-500 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>
                  WiseBot
                </Link>
                <Link href="/registry" className="text-gray-700 hover:text-orange-500 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>
                  Vendor Registry
                </Link>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <Button href="/contact" variant="primary" size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
