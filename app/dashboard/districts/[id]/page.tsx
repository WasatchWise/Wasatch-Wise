'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';

export default function DistrictDetailPage() {
  const params = useParams();
  const districtId = params.id as string;
  const [district, setDistrict] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'briefing' | 'artifacts' | 'controls' | 'vendors'>('overview');

  useEffect(() => {
    // TODO: Fetch district data
    setLoading(false);
  }, [districtId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading district...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {district?.name || 'District'}
          </h1>
          <p className="text-gray-600">
            AI Governance & Adoption Management
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {(['overview', 'briefing', 'artifacts', 'controls', 'vendors'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'overview' && <OverviewTab districtId={districtId} />}
          {activeTab === 'briefing' && <BriefingTab districtId={districtId} />}
          {activeTab === 'artifacts' && <ArtifactsTab districtId={districtId} />}
          {activeTab === 'controls' && <ControlsTab districtId={districtId} />}
          {activeTab === 'vendors' && <VendorsTab districtId={districtId} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ districtId }: { districtId: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Stakeholder Matrix</h3>
          <p className="text-sm text-gray-600 mb-4">Current outcome levels for each stakeholder group</p>
          <Button href={`/dashboard/districts/${districtId}?tab=stakeholders`} variant="outline" size="sm">
            View Matrix
          </Button>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Controls Status</h3>
          <p className="text-sm text-gray-600 mb-4">Privacy-by-design controls implementation</p>
          <Button href={`/dashboard/districts/${districtId}?tab=controls`} variant="outline" size="sm">
            View Controls
          </Button>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Adoption Plan</h3>
          <p className="text-sm text-gray-600 mb-4">30/60/90 day implementation roadmap</p>
          <Button href={`/dashboard/districts/${districtId}?tab=adoption`} variant="outline" size="sm">
            View Plan
          </Button>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Vendor Risk</h3>
          <p className="text-sm text-gray-600 mb-4">AI tool usage and data flow mapping</p>
          <Button href={`/dashboard/districts/${districtId}?tab=vendors`} variant="outline" size="sm">
            View Vendors
          </Button>
        </div>
      </div>
    </div>
  );
}

function BriefingTab({ districtId }: { districtId: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Briefing Sessions</h2>
        <Button href={`/dashboard/districts/${districtId}/briefing/new`} variant="primary">
          New Briefing Session
        </Button>
      </div>
      <p className="text-gray-600">Manage 60-minute briefing sessions and generate artifacts</p>
    </div>
  );
}

function ArtifactsTab({ districtId }: { districtId: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Generated Artifacts</h2>
      <p className="text-gray-600">All artifacts generated for this district</p>
    </div>
  );
}

function ControlsTab({ districtId }: { districtId: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Controls Checklist</h2>
      <p className="text-gray-600">Privacy-by-design controls implementation status</p>
    </div>
  );
}

function VendorsTab({ districtId }: { districtId: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Vendor Risk Map</h2>
        <Button href={`/dashboard/districts/${districtId}/vendors/import`} variant="primary">
          Import Vendors
        </Button>
      </div>
      <p className="text-gray-600">AI tool usage and data flow mapping</p>
    </div>
  );
}
