import Link from 'next/link';
import { Button } from '@/components/shared/Button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorsImportPage({ params }: PageProps) {
  const { id: districtId } = await params;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/dashboard/districts/${districtId}?tab=vendors`}
          className="text-orange-500 hover:text-orange-600 text-sm mb-6 inline-block"
        >
          ← Back to District
        </Link>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Import Vendors</h1>
          <p className="text-gray-600 mb-6">
            Map AI tools and edtech vendors used by this district. This powers the Vendor Risk Map and privacy-by-design controls.
          </p>

          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 font-medium mb-2">Coming soon</p>
            <p className="text-sm text-gray-400 mb-4">
              Bulk import via CSV or connect to your SIS/LMS vendor list. For now, add vendors manually from the Vendor Risk Map tab.
            </p>
            <Button href={`/dashboard/districts/${districtId}?tab=vendors`} variant="outline">
              Back to Vendor Map
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
