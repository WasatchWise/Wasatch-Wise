import { Button } from '@/components/shared/Button';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Close the Governance + Training Gap?
        </h2>
        <p className="text-xl mb-8 text-blue-100">
          Start with a free Cognitive Audit. We'll map shadow AI, policy risk,
          and training depth—then show you exactly where to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/tools/ai-readiness-quiz" variant="secondary" size="lg">
            Take Free Quiz (2 min)
          </Button>
          <Button href="/contact" variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
            Book Cognitive Audit
          </Button>
        </div>
        <p className="mt-6 text-sm text-blue-200">
          No credit card required • Results in 24 hours
        </p>
      </div>
    </section>
  );
}

