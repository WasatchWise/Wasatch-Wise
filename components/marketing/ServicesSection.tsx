import { Button } from '@/components/shared/Button';

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-orange-500 font-semibold mb-2">
            Services
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start with a Cognitive Audit
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            We surface shadow AI, policy risk, and the real training gap—then map a clear
            path to governance and deep teacher readiness.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Cognitive Audit</h3>
            <p className="text-gray-700 mb-6">
              A fast, structured assessment of AI usage, data flows, and staff sentiment—so
              you can close governance gaps and the optimism divide.
            </p>
            <Button href="/contact" variant="primary" size="md">
              Book a Cognitive Audit
            </Button>
          </div>
          <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">90-Day Protocol</h3>
            <p className="text-gray-700 mb-6">
              A practical implementation plan: governance, deep PD, and compliance
              verification—delivered in three focused phases.
            </p>
            <Button href="/contact" variant="outline" size="md">
              Review the Protocol
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
