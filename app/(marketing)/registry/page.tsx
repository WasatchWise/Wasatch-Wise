import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type Vendor = {
  id: string;
  name: string;
  website: string | null;
  vendor_type: string | null;
  sdpc_member: boolean | null;
  compliance_status: string | null;
  risk_tier: string | null;
};

export default async function VendorRegistryPage({ searchParams }: any) {
  const params = await searchParams;
  const query = typeof params?.q === 'string' ? params.q.trim() : '';
  const supabase = await createClient();

  let vendorQuery = supabase
    .from('vendors')
    .select('id,name,website,vendor_type,sdpc_member,compliance_status,risk_tier')
    .order('name', { ascending: true });

  if (query) {
    vendorQuery = vendorQuery.ilike('name', `%${query}%`);
  }

  const { data: vendors, error } = await vendorQuery;
  const results = vendors ?? [];

  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-blue-600 font-semibold mb-2">
            SDPC Registry
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Vendor Registry
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Trusted EdTech vendors assessed for compliance and risk.
          </p>
        </header>

        <form className="max-w-2xl mx-auto mb-10" method="get">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="q">
            Search vendors
          </label>
          <div className="flex gap-3">
            <input
              id="q"
              name="q"
              defaultValue={query}
              placeholder="Search by vendor name"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            Unable to load vendors right now.
          </div>
        )}

        {results.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No vendors found. Try a different search.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((vendor) => (
              <div
                key={vendor.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {vendor.name}
                    </h2>
                    {vendor.vendor_type && (
                      <p className="text-sm text-gray-500">{vendor.vendor_type}</p>
                    )}
                  </div>
                  {vendor.sdpc_member && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      SDPC Member
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>
                    Compliance: <span className="font-medium text-gray-900">{vendor.compliance_status ?? 'pending'}</span>
                  </p>
                  <p>
                    Risk tier: <span className="font-medium text-gray-900">{vendor.risk_tier ?? 'Unrated'}</span>
                  </p>
                  {vendor.website && (
                    <Link
                      href={vendor.website}
                      className="text-blue-600 hover:text-blue-700 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit website
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
