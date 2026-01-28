export function ProblemSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-wider text-red-600 font-semibold mb-2">
            The Opportunity + Risk
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            The Market is Huge, But the Gap is Growing
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Adoption is accelerating, but governance and training are not. That
            gap is creating real exposure for districts—and a clear entry point
            for the right partner.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⚠️</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">The "Shadow AI" Problem</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Most districts still lack formal AI policy while leaders and
              teachers are already using tools. Sensitive student data is being
              shared without clear FERPA-safe guidance.
            </p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🧭</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Training Is One-Off</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Half of teachers report any AI training, and it's often
              surface-level. Districts are forced into DIY PD that never moves
              beyond "how to prompt."
            </p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎯</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">The Optimism Gap</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Administrators see efficiency gains. Teachers worry about
              verification burden, bias, and being blamed when things go wrong.
              Training must address both audiences.
            </p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🌄</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">The AI Divide</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Rural and Title I districts lag most on policy and training. The
              gap is widening right where students need safe AI access the most.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

