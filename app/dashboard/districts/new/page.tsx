import { DistrictForm } from '@/components/dashboard/DistrictForm';

export const metadata = {
    title: 'New District | WasatchWise',
    description: 'Onboard a new school district to DAROS.',
};

export default function NewDistrictPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-2xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Onboard District</h1>
                <p className="text-gray-600 mt-2">
                    Start a new engagement by creating a district profile. This will initialize the controls checklist and stakeholder matrix.
                </p>
            </div>

            <DistrictForm />
        </main>
    );
}
