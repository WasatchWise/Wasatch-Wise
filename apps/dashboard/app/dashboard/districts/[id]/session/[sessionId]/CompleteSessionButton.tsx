'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { completeBriefingSessionAction } from '@/app/actions/daros';

interface CompleteSessionButtonProps {
  sessionId: string;
  districtId: string;
}

export function CompleteSessionButton({ sessionId, districtId }: CompleteSessionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const handleComplete = async () => {
    setLoading(true);
    try {
      const result = await completeBriefingSessionAction(sessionId, {}, notes);
      if (result.success) {
        router.push(`/dashboard/districts/${districtId}?tab=artifacts&success=session_completed`);
        router.refresh();
      } else {
        alert(result.error || 'Failed to complete session');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to complete session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-amber-800">
        Optional notes
      </label>
      <textarea
        className="w-full px-3 py-2 border border-amber-200 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        rows={3}
        placeholder="Key takeaways, follow-ups..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Button variant="primary" onClick={handleComplete} disabled={loading}>
        {loading ? 'Generating artifacts...' : 'Complete session & generate artifacts'}
      </Button>
    </div>
  );
}
