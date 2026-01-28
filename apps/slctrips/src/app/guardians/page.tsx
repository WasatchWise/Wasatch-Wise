'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllRecords } from '@/lib/supabasePagination';
import GuardianCard from '@/components/GuardianCard';
import { Guardian, Destination } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function GuardiansIndex() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElement, setSelectedElement] = useState('');
  const [progressCount, setProgressCount] = useState<number | null>(null);
  const [discoveredCounties, setDiscoveredCounties] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    // Fetch all guardians
    supabase
      .from('guardians')
      .select('*')
      .then(({ data }) => {
        if (data) setGuardians(data as Guardian[]);
      });

    // Fetch ALL destinations to count per county (handles pagination)
    fetchAllRecords<Destination>(supabase, 'public_destinations')
      .then(data => setDestinations(data))
      .catch(error => console.error('Error fetching destinations:', error));
  }, []);

  useEffect(() => {
    if (!user) {
      setProgressCount(null);
      setDiscoveredCounties(new Set());
      return;
    }

    supabase
      .from('user_guardian_progress')
      .select('county')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) {
          console.warn('Failed to load guardian progress:', error.message);
          setProgressCount(null);
          setDiscoveredCounties(new Set());
          return;
        }
        const counties = new Set(
          (data || [])
            .map(row => row.county)
            .filter((county): county is string => Boolean(county))
        );
        setProgressCount(counties.size);
        setDiscoveredCounties(counties);
      });
  }, [user]);

  // Get unique elements for filter
  const elements = useMemo(() => {
    const set = new Set(guardians.map(g => g.element).filter((e): e is string => Boolean(e)));
    return ['', ...Array.from(set).sort()] as string[];
  }, [guardians]);

  // Count destinations per county
  const countyDestinationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    destinations.forEach(d => {
      if (d.county) {
        counts[d.county] = (counts[d.county] || 0) + 1;
      }
    });
    return counts;
  }, [destinations]);

  // Filter guardians
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return guardians.filter(g =>
      (!query ||
        g.display_name?.toLowerCase().includes(query) ||
        g.county?.toLowerCase().includes(query) ||
        g.bio?.toLowerCase().includes(query) ||
        g.motto?.toLowerCase().includes(query) ||
        g.codename?.toLowerCase().includes(query)
      ) &&
      (!selectedElement || g.element === selectedElement)
    ).sort((a, b) => {
      // Sort by county name, Luna (no county) goes last
      if (!a.county) return 1;
      if (!b.county) return -1;
      return (a.county || '').localeCompare(b.county || '');
    });
  }, [guardians, searchQuery, selectedElement]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
      <Header />

      {/* Hero Banner */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 opacity-90" />
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />

        <div className="relative mx-auto max-w-7xl text-center text-white">
          <h1 className="mb-6 text-5xl md:text-7xl font-extrabold drop-shadow-2xl text-white">
            Meet the Mt. Olympians
          </h1>
          <p className="text-xl md:text-2xl font-medium drop-shadow-lg max-w-3xl mx-auto">
            Mystical protectors of Utah's 29 counties. Each Olympian embodies the spirit,
            stories, and secrets of their land.
          </p>
          <p className="mt-4 text-lg opacity-90">
            {guardians.length} Mt. Olympians • {destinations.length} Destinations
            {progressCount !== null && (
              <span className="ml-2">• {progressCount} discovered</span>
            )}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <input
            className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="Search Mt. Olympians by name, county, element..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select
            className="rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
            value={selectedElement}
            onChange={e => setSelectedElement(e.target.value)}
          >
            {elements.map(el => (
              <option key={el} value={el}>
                {el || 'All Elements'}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600 font-medium">
          Showing {filtered.length} Mt. Olympian{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Guardian Cards Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(guardian => (
            <GuardianCard
              key={guardian.id}
              guardian={guardian}
              destinationCount={countyDestinationCounts[guardian.county || ''] || 0}
              isDiscovered={!user || !guardian.county || discoveredCounties.has(guardian.county)}
              showDiscoveryState={Boolean(user)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
            <p className="text-gray-600 text-lg mb-4">No Mt. Olympians match your search</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedElement('');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
