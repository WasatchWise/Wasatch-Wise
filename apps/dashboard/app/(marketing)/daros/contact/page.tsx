import { DarosContactForm } from './DarosContactForm';
import { generateMetadata as genMeta } from '@/lib/utils/seo';

export const metadata = genMeta({
  title: 'Request DAROS Briefing Proposal',
  description: 'Get the full DAROS Briefing Proposal PDF. Share your district details and we will send the proposal plus next steps.',
  canonical: 'https://www.wasatchwise.com/daros/contact',
});

export default function DarosContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Request Your DAROS Briefing Proposal
          </h1>
          <p className="text-gray-600">
            Fill out the form below. We will send the full proposal PDF and reach out to schedule
            your 60-minute briefing.
          </p>
        </div>
        <DarosContactForm />
      </div>
    </div>
  );
}
