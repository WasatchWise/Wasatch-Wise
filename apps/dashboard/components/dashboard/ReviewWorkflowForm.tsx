'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Form, FormField, Input, Textarea } from '@/components/shared/Form';
import { useRouter } from 'next/navigation';

interface ReviewWorkflowFormProps {
  reviewId: string;
  currentStatus: string;
}

export function ReviewWorkflowForm({ reviewId, currentStatus }: ReviewWorkflowFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/dashboard/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFinding = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const finding = {
      finding_type: formData.get('finding_type') as string,
      severity: formData.get('severity') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      recommendation: formData.get('recommendation') as string || null,
    };

    try {
      const response = await fetch(`/api/dashboard/reviews/${reviewId}/findings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finding),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add finding');
      }

      setSuccess(true);
      e.currentTarget.reset();
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Review Workflow</h2>

      {/* Status Update */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Update Status
        </label>
        <div className="space-y-2">
          {['submitted', 'in_progress', 'reviewing', 'completed'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusUpdate(status)}
              disabled={loading || currentStatus === status}
              className={`w-full text-left px-3 py-2 text-sm rounded border transition-colors ${
                currentStatus === status
                  ? 'bg-orange-50 border-orange-500 text-orange-700 font-semibold'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
              } disabled:opacity-50`}
            >
              {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Add Finding */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Finding</h3>
        <Form onSubmit={handleAddFinding}>
          <FormField label="Finding Type" required>
            <select
              name="finding_type"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select type</option>
              <option value="privacy">Privacy</option>
              <option value="compliance">Compliance</option>
              <option value="ai_detection">AI Detection</option>
              <option value="bias">Bias</option>
              <option value="security">Security</option>
              <option value="data_practices">Data Practices</option>
            </select>
          </FormField>

          <FormField label="Severity" required>
            <select
              name="severity"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
          </FormField>

          <FormField label="Title" required>
            <Input type="text" name="title" required placeholder="Brief finding title" />
          </FormField>

          <FormField label="Description" required>
            <Textarea name="description" rows={3} required placeholder="Detailed description" />
          </FormField>

          <FormField label="Recommendation">
            <Textarea name="recommendation" rows={2} placeholder="Optional recommendation" />
          </FormField>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Finding added successfully!
            </div>
          )}

          <Button type="submit" variant="primary" size="sm" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Finding'}
          </Button>
        </Form>
      </div>

      {/* Generate Report */}
      {currentStatus === 'reviewing' && (
        <div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={async () => {
              setLoading(true);
              try {
                const response = await fetch(`/api/dashboard/reviews/${reviewId}/generate-report`, {
                  method: 'POST',
                });
                if (response.ok) {
                  router.refresh();
                }
              } catch (err) {
                setError('Failed to generate report');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      )}
    </div>
  );
}
