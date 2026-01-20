import { SessionWizard } from '@/components/dashboard/SessionWizard';
import { generateControlsChecklist } from '@/lib/daros/pce';
import { getStakeholderMatrixFull } from '@/lib/daros/soe';

export default async function NewBriefingSessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: districtId } = await params;

    // Use existing "generate" functions to get the data structure needed for the UI
    // These functions return the full nested objects the UI expects
    const [controlsData, matrixData] = await Promise.all([
        generateControlsChecklist(districtId),
        getStakeholderMatrixFull(districtId),
    ]);

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-5xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Briefing Session</h1>
                <div className="text-gray-600 mt-2 flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{matrixData.district.name}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <SessionWizard
                    districtId={districtId}
                    initialStakeholders={matrixData.stakeholders}
                    initialControls={controlsData.controls}
                />
            </div>
        </main>
    );
}
