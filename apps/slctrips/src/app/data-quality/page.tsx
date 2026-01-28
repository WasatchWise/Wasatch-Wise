import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Initialize Supabase client (Server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0; // Disable caching for real-time data

export default async function DataQualityDashboard() {
    // 1. Fetch Data
    const { data: destinations, error } = await supabase
        .from('public_destinations')
        .select('id, name, last_verified_at, source_name, image_url, description, slug');

    if (error) {
        return <div className="p-8 text-red-600">Error loading data: {error.message}</div>;
    }

    // 2. Analyze Data
    const total = destinations.length;
    const staleDate = new Date();
    staleDate.setMonth(staleDate.getMonth() - 6); // 6 months ago

    const staleItems: any[] = [];
    const missingAttributionItems: any[] = [];
    let staleCount = 0;
    let missingAttributionCount = 0;
    let missingImageCount = 0;
    let missingDescriptionCount = 0;

    destinations.forEach(d => {
        // Stale Check
        const lastVerified = d.last_verified_at ? new Date(d.last_verified_at) : null;
        if (!lastVerified || lastVerified < staleDate) {
            staleCount++;
            if (staleItems.length < 50) staleItems.push(d);
        }

        // Attribution Check
        if (!d.source_name) {
            missingAttributionCount++;
            if (missingAttributionItems.length < 50) missingAttributionItems.push(d);
        }

        // Image Check
        if (!d.image_url) missingImageCount++;

        // Description Check
        if (!d.description) missingDescriptionCount++;
    });

    // 3. Calculate Percentages
    const stalePct = ((staleCount / total) * 100).toFixed(1);
    const attrPct = ((missingAttributionCount / total) * 100).toFixed(1);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">🛡️ Data Quality Dashboard</h1>
                    <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Destinations</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Stale Records (&gt;6mo)</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <p className="text-3xl font-bold text-orange-600">{staleCount}</p>
                            <span className="text-sm text-orange-600 font-medium">({stalePct}%)</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Missing Attribution</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <p className="text-3xl font-bold text-red-600">{missingAttributionCount}</p>
                            <span className="text-sm text-red-600 font-medium">({attrPct}%)</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Content Health</h3>
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Missing Images:</span>
                                <span className={missingImageCount > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                    {missingImageCount}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Missing Desc:</span>
                                <span className={missingDescriptionCount > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                    {missingDescriptionCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Stale List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">⚠️ Stale Records (Top 50)</h2>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Needs Verification</span>
                        </div>
                        <div className="overflow-y-auto max-h-[600px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Last Verified</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {staleItems.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{item.name}</td>
                                            <td className="p-4 text-gray-500">
                                                {item.last_verified_at ? new Date(item.last_verified_at).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <a
                                                    href={`https://www.google.com/search?q=${encodeURIComponent(item.name + ' Utah current status')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                    Verify ↗
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Missing Attribution List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">🔍 Missing Attribution (Top 50)</h2>
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Needs Source</span>
                        </div>
                        <div className="overflow-y-auto max-h-[600px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {missingAttributionItems.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{item.name}</td>
                                            <td className="p-4 text-right">
                                                <a
                                                    href={`https://www.google.com/search?q=${encodeURIComponent(item.name + ' Utah official website')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                    Find Source ↗
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
