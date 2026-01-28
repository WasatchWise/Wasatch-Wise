'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TripKit } from '@/types/database.types';
import SafeImage from '@/components/SafeImage';

interface TripKitFiltersProps {
    tripkits: TripKit[];
}

type PriceFilter = 'all' | 'free' | 'paid';
type DifficultyFilter = 'all' | 'easy' | 'intermediate' | 'advanced' | 'variable';
type TimeFilter = 'all' | 'short' | 'half_day' | 'full_day' | 'multi_day';
type ThemeFilter = 'all' | 'outdoors' | 'dark' | 'food' | 'culture' | 'budget';

export default function TripKitFilters({ tripkits }: TripKitFiltersProps) {
    const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const [themeFilter, setThemeFilter] = useState<ThemeFilter>('all');

    const filteredTripKits = useMemo(() => {
        return tripkits.filter((tk) => {
            // Price Filter
            if (priceFilter === 'free' && tk.price > 0) return false;
            if (priceFilter === 'paid' && tk.price === 0) return false;

            // Difficulty Filter
            if (difficultyFilter !== 'all') {
                const level = tk.difficulty_level?.toLowerCase() || 'variable';
                if (difficultyFilter === 'variable' && level === 'variable') return true;
                if (!level.includes(difficultyFilter)) return false;
            }

            // Time Filter
            if (timeFilter !== 'all') {
                const time = tk.estimated_time?.toLowerCase() || '';
                if (timeFilter === 'short' && !time.includes('hour') && !time.includes('min')) return false;
                if (timeFilter === 'half_day' && !time.includes('half')) return false;
                if (timeFilter === 'full_day' && !time.includes('full')) return false;
                if (timeFilter === 'multi_day' && !time.includes('day') && !time.includes('variable')) return false;
            }

            // Theme Filter
            if (themeFilter !== 'all') {
                // Map themes to filter values
                const theme = tk.primary_theme?.toLowerCase() || '';
                const name = (tk.name || '').toLowerCase();

                if (themeFilter === 'dark' && !theme.includes('dark') && !theme.includes('mysterious')) return false;
                if (themeFilter === 'outdoors' && !theme.includes('adventure') && !theme.includes('outdoors')) return false;
                if (themeFilter === 'food' && !theme.includes('food') && !theme.includes('drink')) return false;
                if (themeFilter === 'culture' && !theme.includes('culture') && !theme.includes('arts')) return false;
                if (themeFilter === 'budget' && !theme.includes('budget') && !name.includes('under')) return false;
            }

            return true;
        });
    }, [tripkits, priceFilter, difficultyFilter, timeFilter, themeFilter]);

    return (
        <div className="space-y-8">
            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Price Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Price</label>
                        <select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
                            aria-label="Filter by Price"
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="all">All Prices</option>
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Difficulty</label>
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
                            aria-label="Filter by Difficulty"
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="all">Any Difficulty</option>
                            <option value="easy">Easy / Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    {/* Time Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Time Commitment</label>
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                            aria-label="Filter by Time Commitment"
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="all">Any Duration</option>
                            <option value="short">Short (1-2 Hours)</option>
                            <option value="half_day">Half Day</option>
                            <option value="full_day">Full Day</option>
                        </select>
                    </div>

                    {/* Theme Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Theme</label>
                        <select
                            value={themeFilter}
                            onChange={(e) => setThemeFilter(e.target.value as ThemeFilter)}
                            aria-label="Filter by Theme"
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="all">All Themes</option>
                            <option value="outdoors">Adventure & Outdoors</option>
                            <option value="dark">Dark & Mysterious</option>
                            <option value="food">Food & Drink</option>
                            <option value="culture">Culture & Arts</option>
                            <option value="budget">Budget Friendly</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTripKits.map((tk) => (
                    <Link
                        key={tk.id}
                        href={`/tripkits/${tk.slug}`}
                        data-testid="tripkit-card"
                        className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden flex flex-col h-full"
                    >
                        {tk.cover_image_url && (
                            <div className="aspect-video w-full overflow-hidden bg-gray-200 relative">
                                <SafeImage
                                    src={tk.cover_image_url}
                                    alt={tk.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {tk.difficulty_level && (
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                                        {tk.difficulty_level}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{tk.code}</span>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                        {tk.price === 0 ? (tk.code === 'TK-000' ? 'FREE' : 'FREE') : `$${tk.price.toFixed(2)}`}
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {tk.name}
                            </h2>

                            {tk.tagline && (
                                <p className="text-gray-600 mb-4 text-sm italic line-clamp-2">
                                    {tk.tagline}
                                </p>
                            )}

                            <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
                                {tk.destination_count > 0 && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        {tk.destination_count} destinations
                                    </div>
                                )}
                                {tk.estimated_time && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        {tk.estimated_time}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredTripKits.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No TripKits Found</h3>
                    <p className="text-gray-600">Try adjusting your filters to find what you're looking for.</p>
                    <button
                        onClick={() => {
                            setPriceFilter('all');
                            setDifficultyFilter('all');
                            setTimeFilter('all');
                            setThemeFilter('all');
                        }}
                        className="mt-4 text-blue-600 font-semibold hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
}
