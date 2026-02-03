import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBriefingSession } from '@/lib/daros/briefing';
import { createClient } from '@/lib/supabase/server';
import { CompleteSessionButton } from './CompleteSessionButton';

interface PageProps {
  params: Promise<{ id: string; sessionId: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const { id: districtId, sessionId } = await params;

  const session = await getBriefingSession(sessionId).catch(() => null);
  if (!session || session.district_id !== districtId) {
    notFound();
  }

  const statusStyles: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };
  const statusLabel = session.status.replace('_', ' ');

  let artifacts: { id: string; type: string; title: string; created_at: string }[] = [];
  if (session.status === 'completed' && session.artifacts_generated?.length) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('artifacts')
      .select('id, type, title, created_at')
      .in('id', session.artifacts_generated)
      .order('created_at', { ascending: false });
    artifacts = data || [];
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/dashboard/districts/${districtId}`}
          className="text-orange-500 hover:text-orange-600 text-sm mb-6 inline-block"
        >
          ← Back to District
        </Link>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Briefing Session</h1>
                <p className="text-gray-600 mt-1">
                  {new Date(session.session_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {session.facilitator && (
                  <p className="text-sm text-gray-500 mt-1">Facilitator: {session.facilitator}</p>
                )}
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${
                  statusStyles[session.status] || statusStyles.scheduled
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            {session.status === 'in_progress' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium mb-2">Session in progress</p>
                <p className="text-sm text-amber-700 mb-4">
                  Finish the session to generate the stakeholder matrix, controls checklist, adoption plan, and board one-pager.
                </p>
                <CompleteSessionButton sessionId={sessionId} districtId={districtId} />
              </div>
            )}

            {session.status === 'completed' && artifacts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Generated Artifacts</h2>
                <ul className="space-y-2">
                  {artifacts.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-900">{a.title}</span>
                      <Link
                        href={`/api/artifacts/${a.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Download PDF
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {session.status === 'completed' && artifacts.length === 0 && (
              <p className="text-gray-500 text-sm">No artifacts were generated for this session.</p>
            )}

            {session.notes && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Session Notes</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{session.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
