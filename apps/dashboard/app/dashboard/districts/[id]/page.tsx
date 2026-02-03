'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';

interface DistrictData {
  district: {
    id: string;
    name: string;
    state: string;
    size_band: string;
    contacts: any;
    status: 'red' | 'yellow' | 'green';
    created_at: string;
  };
  controls: any[];
  controlsSummary: {
    total: number;
    complete: number;
    partial: number;
    notStarted: number;
    completionRate: number;
  };
  stakeholderMatrix: {
    admin: any;
    teachers: any;
    parents: any;
    students: any;
    board: any;
  };
  artifacts: any[];
  briefingSessions: any[];
  vendors: any[];
  adoptionPlans: any[];
}

const TAB_KEYS = ['overview', 'briefing', 'artifacts', 'controls', 'vendors'] as const;
type TabKey = (typeof TAB_KEYS)[number];

export default function DistrictDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const districtId = params.id as string;
  const [data, setData] = useState<DistrictData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tabParam = searchParams.get('tab');
  const initialTab: TabKey = useMemo(
    () => (TAB_KEYS.includes(tabParam as TabKey) ? (tabParam as TabKey) : 'overview'),
    [tabParam]
  );
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    if (TAB_KEYS.includes(tabParam as TabKey)) setActiveTab(tabParam as TabKey);
  }, [tabParam]);

  useEffect(() => {
    async function fetchDistrict() {
      try {
        const response = await fetch(`/api/daros/districts/${districtId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('District not found');
          } else {
            throw new Error('Failed to fetch district');
          }
          return;
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching district:', err);
        setError('Failed to load district data');
      } finally {
        setLoading(false);
      }
    }
    fetchDistrict();
  }, [districtId]);

  const district = data?.district;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading district...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/dashboard" className="text-orange-500 hover:text-orange-600">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-6">
          <Link href="/dashboard" className="text-orange-500 hover:text-orange-600 text-sm mb-4 inline-block">
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
            {TAB_KEYS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                  ? 'border-orange-500 text-orange-500'
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
          {activeTab === 'overview' && <OverviewTab data={data} districtId={districtId} />}
          {activeTab === 'briefing' && <BriefingTab data={data} districtId={districtId} />}
          {activeTab === 'artifacts' && <ArtifactsTab data={data} districtId={districtId} />}
          {activeTab === 'controls' && <ControlsTab data={data} districtId={districtId} />}
          {activeTab === 'vendors' && <VendorsTab data={data} districtId={districtId} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ data, districtId }: { data: DistrictData | null; districtId: string }) {
  if (!data) return null;

  const { controlsSummary, stakeholderMatrix, artifacts, vendors } = data;

  const getOutcomeLabel = (level: string | null) => {
    const labels: Record<string, string> = {
      home_run: 'Home Run',
      triple: 'Triple',
      double: 'Double',
      single: 'Single',
      miss: 'Miss',
    };
    return level ? labels[level] || level : 'Not Set';
  };

  const getOutcomeColor = (level: string | null) => {
    const colors: Record<string, string> = {
      home_run: 'text-green-600',
      triple: 'text-green-500',
      double: 'text-yellow-600',
      single: 'text-orange-500',
      miss: 'text-red-600',
    };
    return level ? colors[level] || 'text-gray-500' : 'text-gray-400';
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Overview</h2>

      {/* Controls Progress */}
      <div className="mb-8">
        <h3 className="font-medium mb-3">Controls Progress</h3>
        <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${controlsSummary.completionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-sm mt-2 text-gray-600">
          <span>{controlsSummary.complete} of {controlsSummary.total} controls complete</span>
          <span className="font-medium">{controlsSummary.completionRate}%</span>
        </div>
      </div>

      {/* Stakeholder Matrix Summary */}
      <div className="mb-8">
        <h3 className="font-medium mb-3">Stakeholder Outcomes</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(['admin', 'teachers', 'parents', 'students', 'board'] as const).map((stakeholder) => {
            const entry = stakeholderMatrix[stakeholder];
            return (
              <div key={stakeholder} className="border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">{stakeholder}</p>
                <p className={`font-semibold ${getOutcomeColor(entry?.outcome_level)}`}>
                  {getOutcomeLabel(entry?.outcome_level)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Artifacts Generated</h3>
          <p className="text-3xl font-bold text-blue-600">{artifacts.length}</p>
          <p className="text-sm text-gray-500 mt-1">Documents and reports</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Vendors Mapped</h3>
          <p className="text-3xl font-bold text-purple-600">{vendors.length}</p>
          <p className="text-sm text-gray-500 mt-1">AI tools tracked</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Controls Status</h3>
          <div className="flex gap-4 mt-2">
            <div>
              <span className="text-green-600 font-bold">{controlsSummary.complete}</span>
              <span className="text-xs text-gray-500 ml-1">done</span>
            </div>
            <div>
              <span className="text-yellow-600 font-bold">{controlsSummary.partial}</span>
              <span className="text-xs text-gray-500 ml-1">partial</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold">{controlsSummary.notStarted}</span>
              <span className="text-xs text-gray-500 ml-1">pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefingTab({ data, districtId }: { data: DistrictData | null; districtId: string }) {
  if (!data) return null;

  const { briefingSessions } = data;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || styles.scheduled;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Briefing Sessions</h2>
        <Button href={`/dashboard/districts/${districtId}/session`} variant="primary">
          New Briefing Session
        </Button>
      </div>

      {briefingSessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No briefing sessions yet</p>
          <Button href={`/dashboard/districts/${districtId}/session`} variant="outline">
            Schedule First Session
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {briefingSessions.map((session: any) => (
            <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">
                      {new Date(session.session_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(session.status)}`}>
                      {session.status.replace('_', ' ')}
                    </span>
                  </div>
                  {session.facilitator && (
                    <p className="text-sm text-gray-600">Facilitator: {session.facilitator}</p>
                  )}
                  {session.notes && (
                    <p className="text-sm text-gray-500 mt-2">{session.notes}</p>
                  )}
                </div>
                <Button href={`/dashboard/districts/${districtId}/session/${session.id}`} variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArtifactsTab({ data, districtId }: { data: DistrictData | null; districtId: string }) {
  if (!data) return null;

  const { artifacts } = data;

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      stakeholder_matrix: 'Stakeholder Matrix',
      controls_checklist: 'Controls Checklist',
      adoption_plan: 'Adoption Plan',
      board_one_pager: 'Board One-Pager',
      training_deck: 'Training Deck',
      vendor_map: 'Vendor Map',
      risk_assessment: 'Risk Assessment',
      policy_draft: 'Policy Draft',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      stakeholder_matrix: '📊',
      controls_checklist: '✅',
      adoption_plan: '📅',
      board_one_pager: '📄',
      training_deck: '🎓',
      vendor_map: '🗺️',
      risk_assessment: '⚠️',
      policy_draft: '📝',
    };
    return icons[type] || '📁';
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Generated Artifacts</h2>

      {artifacts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">No artifacts generated yet</p>
          <p className="text-sm">Complete a briefing session to generate artifacts</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artifacts.map((artifact: any) => (
            <div key={artifact.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getTypeIcon(artifact.type)}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{artifact.title}</h3>
                  <p className="text-sm text-gray-500">{getTypeLabel(artifact.type)}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(artifact.created_at).toLocaleDateString()}
                    {artifact.version > 1 && ` • v${artifact.version}`}
                  </p>
                </div>
              </div>
              {(artifact.url || artifact.type === 'board_one_pager') && (
                <Button
                  href={artifact.type === 'board_one_pager' ? `/api/artifacts/${artifact.id}/download` : (artifact.url || '#')}
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                >
                  Download PDF
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ControlsTab({ data, districtId }: { data: DistrictData | null; districtId: string }) {
  if (!data) return null;

  const { controls, controlsSummary } = data;

  // Group controls by domain
  const controlsByDomain = controls.reduce((acc: Record<string, any[]>, control: any) => {
    if (!acc[control.domain]) acc[control.domain] = [];
    acc[control.domain].push(control);
    return acc;
  }, {});

  const getDomainLabel = (domain: string) => {
    const labels: Record<string, string> = {
      policy: 'Policy',
      training: 'Training',
      vendor_management: 'Vendor Management',
      data_protection: 'Data Protection',
      incident_response: 'Incident Response',
      monitoring: 'Monitoring',
      governance: 'Governance',
    };
    return labels[domain] || domain;
  };

  const getStatusBadge = (status: string | null) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      complete: { bg: 'bg-green-100', text: 'text-green-700', label: 'Complete' },
      partial: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Partial' },
      not_started: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Not Started' },
      not_applicable: { bg: 'bg-gray-50', text: 'text-gray-400', label: 'N/A' },
    };
    const s = styles[status || 'not_started'];
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'text-red-600 font-semibold',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-gray-500',
    };
    return styles[priority] || styles.medium;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Controls Checklist</h2>
        <div className="text-sm text-gray-600">
          {controlsSummary.completionRate}% complete
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(controlsByDomain).map(([domain, domainControls]) => (
          <div key={domain} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium">{getDomainLabel(domain)}</h3>
            </div>
            <div className="divide-y">
              {domainControls.map((control: any) => {
                const status = control.districtControl?.status || 'not_started';
                return (
                  <div key={control.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={getPriorityBadge(control.priority)}>
                          {control.priority === 'critical' && '●'}
                        </span>
                        <span className="font-medium">{control.title}</span>
                      </div>
                      {control.description && (
                        <p className="text-sm text-gray-500 mt-1">{control.description}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorsTab({ data, districtId }: { data: DistrictData | null; districtId: string }) {
  if (!data) return null;

  const { vendors } = data;

  const getRiskBadge = (riskLevel: string | null) => {
    const styles: Record<string, { bg: string; text: string }> = {
      low: { bg: 'bg-green-100', text: 'text-green-700' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700' },
      critical: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    const s = styles[riskLevel || 'medium'];
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${s.bg} ${s.text}`}>
        {riskLevel || 'Unknown'}
      </span>
    );
  };

  const getAiUsageLabel = (level: string | null) => {
    const labels: Record<string, string> = {
      none: 'No AI',
      embedded: 'Embedded AI',
      teacher_used: 'Teacher-Used',
      student_facing: 'Student-Facing',
    };
    return labels[level || 'none'] || level || 'Unknown';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Vendor Risk Map</h2>
        <Button href={`/dashboard/districts/${districtId}/vendors/import`} variant="primary">
          Import Vendors
        </Button>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No vendors mapped yet</p>
          <Button href={`/dashboard/districts/${districtId}/vendors/import`} variant="outline">
            Import Vendor List
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Usage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Types</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((dv: any) => (
                <tr key={dv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{dv.vendor?.name || 'Unknown'}</div>
                    {dv.vendor?.website && (
                      <a
                        href={dv.vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-500 hover:underline"
                      >
                        {dv.vendor.website}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {dv.vendor?.category || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {getAiUsageLabel(dv.ai_usage_level)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(dv.data_types || []).map((dt: string) => (
                        <span
                          key={dt}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
                          {dt.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getRiskBadge(dv.risk_level)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
