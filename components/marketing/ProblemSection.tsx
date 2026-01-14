export function ProblemSection() {
  return (
    <section className="py-20 bg-red-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-red-600 font-semibold mb-2">
            The Problem
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your District is Flying Blind on AI
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-3">No Clear Policy</h3>
            <p className="text-gray-700">
              Teachers are using ChatGPT, Grammarly, and other AI tools without
              any governance. Every use is a potential FERPA violation waiting
              to happen.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">😰</div>
            <h3 className="text-xl font-semibold mb-3">Parent Trust Eroding</h3>
            <p className="text-gray-700">
              Parents see AI headlines and worry. Without transparency, they
              assume the worst. One data leak could destroy years of trust.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-xl font-semibold mb-3">Teacher Burnout</h3>
            <p className="text-gray-700">
              Teachers want to use AI to save time, but they're scared of
              getting in trouble. So they either avoid it or use it secretly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

