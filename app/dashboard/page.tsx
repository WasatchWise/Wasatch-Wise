'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';

// Set page title for accessibility
if (typeof document !== 'undefined') {
  document.title = 'District AI Readiness Dashboard | WasatchWise';
}

interface District {
  id: string;
  name: string;
  state: string;
  size_band: string;
  created_at: string;
  status?: 'red' | 'yellow' | 'green';
}

export default function DashboardPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch districts from API
    // For now, show placeholder with sample data for testing
    setDistricts([
      { id: '1', name: 'Sample District', state: 'UT', size_band: 'Large', created_at: new Date().toISOString(), status: 'green' },
      { id: '2', name: 'Test District', state: 'UT', size_band: 'Medium', created_at: new Date().toISOString(), status: 'yellow' },
      { id: '3', name: 'Demo District', state: 'UT', size_band: 'Small', created_at: new Date().toISOString(), status: 'red' },
    ]);
    setLoading(false);
  }, []);

  const getStatusColor = (status?: 'red' | 'yellow' | 'green') => {
    switch (status) {
      case 'red':
        return 'bg-red-500 text-red-500 border-red-500';
      case 'yellow':
        return 'bg-yellow-500 text-yellow-500 border-yellow-500';
      case 'green':
        return 'bg-green-500 text-green-500 border-green-500';
      default:
        return 'bg-gray-500 text-gray-500 border-gray-500';
    }
  };

  const getStatusLabel = (status?: 'red' | 'yellow' | 'green') => {
    switch (status) {
      case 'red':
        return 'Action Required';
      case 'yellow':
        return 'Review Needed';
      case 'green':
        return 'Compliant';
      default:
        return 'Unknown';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50" role="main">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            District AI Readiness OS
          </h1>
          <p className="text-gray-600">
            Manage districts, briefing sessions, and generate governance artifacts
          </p>
        </header>

        {/* Status Overview - Traffic Light Pattern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-testid="risk-status-widget">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 rounded-full bg-red-500" data-status="red" />
              <h3 className="text-sm font-medium text-gray-500">Action Required</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {districts.filter(d => d.status === 'red').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Districts needing immediate attention</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" data-status="yellow" />
              <h3 className="text-sm font-medium text-gray-500">Review Needed</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {districts.filter(d => d.status === 'yellow').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Districts requiring review</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 rounded-full bg-green-500" data-status="green" />
              <h3 className="text-sm font-medium text-gray-500">Compliant</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {districts.filter(d => d.status === 'green').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Districts in good standing</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Districts</h2>
            <Button href="/dashboard/districts/new" variant="primary">
              Add District
            </Button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading districts...</div>
          ) : districts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No districts yet</p>
              <Button href="/dashboard/districts/new" variant="primary">
                Create Your First District
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {districts.map((district) => (
                <Link
                  key={district.id}
                  href={`/dashboard/districts/${district.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {district.status && (
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(district.status).split(' ')[0]}`}
                          data-status={district.status}
                          aria-label={getStatusLabel(district.status)}
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{district.name}</h3>
                        <p className="text-sm text-gray-500">
                          {district.state} • {district.size_band}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {district.status === 'red' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            // Handle fix action
                          }}
                          data-pending="fix"
                        >
                          Fix
                        </Button>
                      )}
                      <div className="text-sm text-gray-500">
                        View →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
