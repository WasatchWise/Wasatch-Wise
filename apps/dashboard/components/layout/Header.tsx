'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/shared/Button';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [clientPath, setClientPath] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') setClientPath(window.location.pathname);
  }, [pathname]);
  // Use router path when available; fallback to last known or client path so logo doesn't flip when pathname briefly becomes null
  const lastPathRef = useRef<string | null>(null);
  if (pathname != null) lastPathRef.current = pathname;
  const effectivePath = pathname ?? lastPathRef.current ?? clientPath ?? '';
  const isAdultAIAcademy = effectivePath.startsWith('/adult-ai-academy');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Brand (AAA when on /adult-ai-academy, else WasatchWise) */}
          <Link href={isAdultAIAcademy ? '/adult-ai-academy' : '/'} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={isAdultAIAcademy ? '/AAA.png' : '/wasatchwiselogo.png'}
                alt={isAdultAIAcademy ? 'Adult AI Academy' : 'WasatchWise Logo'}
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-orange-500 group-hover:text-orange-600 transition-colors">
                {isAdultAIAcademy ? 'Adult AI Academy' : 'WasatchWise'}
              </span>
              <span className="text-xs text-gray-600 font-medium tracking-wide">
                SMART TECH * WISER PEOPLE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation — AAA vs WasatchWise */}
          <nav className="hidden lg:flex items-center gap-8">
            {isAdultAIAcademy ? (
              <>
                <Link href="/adult-ai-academy/courses" className="text-gray-700 hover:text-slate-600 transition-colors text-sm font-medium">
                  Courses
                </Link>
                <Link href="/adult-ai-academy/blog" className="text-gray-700 hover:text-slate-600 transition-colors text-sm font-medium">
                  Blog
                </Link>
                <Link href="/contact?service=Adult%20AI%20Academy" className="text-gray-700 hover:text-slate-600 transition-colors text-sm font-medium">
                  Community
                </Link>
                <div className="relative group">
                  <button className="text-gray-700 hover:text-slate-600 transition-colors text-sm font-medium flex items-center gap-1">
                    Brands
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-700">
                        WasatchWise
                      </Link>
                      <Link href="https://www.askbeforeyouapp.com" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-700" target="_blank" rel="noopener noreferrer">
                        <Image src="/ABYA.png" alt="" width={24} height={24} className="rounded-md flex-shrink-0" />
                        Ask Before You App
                      </Link>
                    </div>
                  </div>
                </div>
                <Button href="/contact?service=Adult%20AI%20Academy" variant="primary" size="sm">
                  Get Started
                </Button>
              </>
            ) : (
              <>
                <Link href="/#services" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium">
                  Services
                </Link>
                <Link href="/pricing" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium">
                  Pricing
                </Link>
                <Link href="/blog" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium">
                  Blog
                </Link>
                <div className="relative group">
                  <button className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium flex items-center gap-1">
                    Tools
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
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
                <div className="relative group">
                  <button className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium flex items-center gap-1">
                    Brands
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link href="/adult-ai-academy" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                        <Image src="/AAA.png" alt="" width={24} height={24} className="rounded-md flex-shrink-0" />
                        Adult AI Academy
                      </Link>
                      <Link href="https://www.askbeforeyouapp.com" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500" target="_blank" rel="noopener noreferrer">
                        <Image src="/ABYA.png" alt="" width={24} height={24} className="rounded-md flex-shrink-0" />
                        Ask Before You App
                      </Link>
                    </div>
                  </div>
                </div>
                <Button href="/contact" variant="primary" size="sm">
                  Contact
                </Button>
              </>
            )}
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-4">
              {isAdultAIAcademy ? (
                <>
                  <Link href="/adult-ai-academy/courses" className="text-gray-700 hover:text-slate-600 transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Courses
                  </Link>
                  <Link href="/adult-ai-academy/blog" className="text-gray-700 hover:text-slate-600 transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Blog
                  </Link>
                  <Link href="/contact?service=Adult%20AI%20Academy" className="text-gray-700 hover:text-slate-600 transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Community
                  </Link>
                  <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-200">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brands</span>
                    <Link href="/" className="text-gray-700 hover:text-slate-600 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>
                      WasatchWise
                    </Link>
                    <Link href="https://www.askbeforeyouapp.com" className="flex items-center gap-2 text-gray-700 hover:text-slate-600 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)} target="_blank" rel="noopener noreferrer">
                      <Image src="/ABYA.png" alt="" width={22} height={22} className="rounded-md flex-shrink-0" />
                      Ask Before You App
                    </Link>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <Button href="/contact?service=Adult%20AI%20Academy" variant="primary" size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/#services" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Services
                  </Link>
                  <Link href="/pricing" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Pricing
                  </Link>
                  <Link href="/blog" className="text-gray-700 hover:text-orange-500 transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Blog
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
                  <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-200">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brands</span>
                    <Link href="/adult-ai-academy" className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>
                      <Image src="/AAA.png" alt="" width={22} height={22} className="rounded-md flex-shrink-0" />
                      Adult AI Academy
                    </Link>
                    <Link href="https://www.askbeforeyouapp.com" className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)} target="_blank" rel="noopener noreferrer">
                      <Image src="/ABYA.png" alt="" width={22} height={22} className="rounded-md flex-shrink-0" />
                      Ask Before You App
                    </Link>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <Button href="/contact" variant="primary" size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      Contact
                    </Button>
                  </div>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

