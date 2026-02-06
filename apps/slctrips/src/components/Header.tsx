'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/destinations?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (searchQuery.trim()) {
        router.push(`/destinations?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
      }
    }
  };

  return (
    <header role="banner" className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          <div className="flex-shrink-0">
            <Link className="flex items-center gap-3 hover:opacity-80 transition" href="/">
              <Image
                src="/images/Site_logo.png"
                alt="SLCTrips"
                width={160}
                height={50}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>
          </div>
          
          <div className="hidden 2xl:flex items-center justify-center flex-shrink-0 text-xl 2xl:text-2xl font-bold text-white px-2 2xl:px-4">
            <span>From Salt Lake, to <span className="text-yellow-400">Everywhere</span></span>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1 md:gap-2 lg:gap-3 xl:gap-4 flex-1 min-w-0 overflow-hidden">
            <Link className="text-gray-300 hover:text-white transition font-medium text-sm md:text-base min-h-[44px] px-2 md:px-3 lg:px-4 py-2 flex items-center whitespace-nowrap" href="/destinations">
              Destinations
            </Link>
            <Link className="text-gray-300 hover:text-white transition font-medium text-sm md:text-base min-h-[44px] px-2 md:px-3 lg:px-4 py-2 flex items-center whitespace-nowrap" href="/guardians">
              County Guides
            </Link>
            <Link className="text-gray-300 hover:text-white transition font-medium text-sm md:text-base min-h-[44px] px-2 md:px-3 lg:px-4 py-2 flex items-center whitespace-nowrap" href="/tripkits">
              <span className="hidden lg:inline">Adventure </span>Guides
            </Link>
            {user ? (
              <>
                <Link className="text-gray-300 hover:text-white transition font-medium text-sm md:text-base min-h-[44px] px-2 md:px-3 lg:px-4 py-2 flex items-center whitespace-nowrap" href="/my-tripkits">
                  <span className="hidden xl:inline">My Saved </span>Guides
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-400 hover:text-white transition text-xs md:text-sm min-h-[44px] min-w-[44px] px-2 md:px-3 lg:px-4 py-2 flex items-center justify-center whitespace-nowrap"
                  aria-label="Sign out of your account"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link className="text-gray-300 hover:text-white transition font-medium text-sm md:text-base min-h-[44px] px-2 md:px-3 lg:px-4 py-2 flex items-center whitespace-nowrap" href="/auth/signin">
                Sign In
              </Link>
            )}
            <Link className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-2 md:px-3 lg:px-4 py-2 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition text-xs md:text-sm lg:text-base min-h-[44px] flex items-center whitespace-nowrap flex-shrink-0" href="/welcome-wagon">
              <span className="hidden lg:inline">New to Utah?</span>
              <span className="lg:hidden">Utah?</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-yellow-400 transition-colors p-3 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            data-testid="mobile-menu-button"
          >
            {isMobileMenuOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-nav" className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4 animate-slideDown" data-testid="mobile-menu">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-3">
              <Link
                href="/destinations"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white transition font-medium px-2 py-2 hover:bg-gray-800 rounded"
              >
                Destinations
              </Link>
              <Link
                href="/guardians"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white transition font-medium px-2 py-2 hover:bg-gray-800 rounded"
              >
                County Guides
              </Link>
              <Link
                href="/tripkits"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white transition font-medium px-2 py-2 hover:bg-gray-800 rounded"
              >
                Adventure Guides
              </Link>
              {user ? (
                <>
                  <Link
                    href="/my-tripkits"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-white transition font-medium px-2 py-2 hover:bg-gray-800 rounded"
                  >
                    My Saved Guides
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-400 hover:text-white transition font-medium px-2 py-2 hover:bg-gray-800 rounded text-left min-h-[44px] w-full flex items-center"
                    aria-label="Sign out of your account"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white transition font-medium px-2 py-2 hover:bg-gray-800 rounded"
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/welcome-wagon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition text-center"
              >
                New to Utah?
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}
