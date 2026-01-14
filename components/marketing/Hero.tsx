import { Button } from '@/components/shared/Button';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          AI Governance for School Districts
          <br />
          <span className="text-blue-600">That Actually Works</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
          Stop worrying about AI compliance. Start building trust with parents,
          protecting student data, and empowering teachers—all in 90 days.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button href="/tools/ai-readiness-quiz" variant="primary" size="lg">
            Take Free AI Readiness Quiz
          </Button>
          <Button href="/contact" variant="outline" size="lg">
            Book Cognitive Audit
          </Button>
        </div>
        <div className="mt-12">
          <p className="text-sm text-gray-600 mb-4">Trusted by districts across the West</p>
          {/* Video placeholder - replace with HeyGen Dan character video */}
          <div className="max-w-4xl mx-auto aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Dan Character Video (HeyGen)</p>
          </div>
        </div>
      </div>
    </section>
  );
}

