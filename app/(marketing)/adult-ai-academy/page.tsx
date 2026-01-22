import Image from 'next/image';
import aaaLogo from '@/AAA.png';
import { Button } from '@/components/shared/Button';

export default function AdultAIAcademyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="max-w-5xl mx-auto px-6">
        <header className="text-center mb-12">
          <div className="mx-auto mb-6 h-48 w-48 rounded-3xl bg-white shadow-sm flex items-center justify-center">
            <Image
              src={aaaLogo}
              alt="Adult AI Academy logo"
              className="h-40 w-40"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Adult AI Academy
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Practical AI literacy for leaders and teams—clear, responsible, and
            ready for real-world use.
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 md:p-10">
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Foundation
              </h2>
              <p className="text-gray-600">
                Core concepts, safety, and policy-ready guidance for adult learners.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Application
              </h2>
              <p className="text-gray-600">
                Hands-on use cases for instruction, operations, and communication.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Governance
              </h2>
              <p className="text-gray-600">
                Responsible AI adoption aligned with district and compliance needs.
              </p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <Button href="/contact" variant="primary" size="lg">
              Learn More
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
