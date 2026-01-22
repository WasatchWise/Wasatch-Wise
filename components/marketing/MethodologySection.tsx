export function MethodologySection() {
  return (
    <section id="methodology" className="py-20 bg-orange-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-orange-500 font-semibold mb-2">
            Methodology
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            A simple, defensible process
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            We align governance with teacher reality—so policies stick and training goes
            beyond prompts to real instructional change.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-semibold text-orange-500 mb-2">Step 1</p>
            <h3 className="text-xl font-semibold mb-3">Assess</h3>
            <p className="text-gray-700">
              Inventory AI usage, data flows, and teacher/admin sentiment to surface
              shadow AI and training gaps.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-semibold text-orange-500 mb-2">Step 2</p>
            <h3 className="text-xl font-semibold mb-3">Align</h3>
            <p className="text-gray-700">
              Draft clear policy, define tool approval workflows, and set guidance that
              works for both administrators and teachers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-semibold text-orange-500 mb-2">Step 3</p>
            <h3 className="text-xl font-semibold mb-3">Equip + Verify</h3>
            <p className="text-gray-700">
              Train staff to evaluate outputs, detect bias, and redesign assessments, then
              verify compliance and communicate with families.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
