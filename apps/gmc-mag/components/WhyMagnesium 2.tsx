
import React from 'react';

const WhyMagnesium: React.FC = () => {
  return (
    <section id="magnesium" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Magnesium Matters</h2>
          <p className="text-lg text-slate-600">
            Magnesium is the structural metal of choice for the 21st century. Where weight matters, magnesium is mandatory.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Defense & Aerospace",
              icon: "✈️",
              desc: "Critical for airframe structural components, missile housings, and lightweight weaponry."
            },
            {
              title: "Energy Storage",
              icon: "🔋",
              desc: "Emerging magnesium-ion battery technologies offer safer, higher-density alternatives to lithium."
            },
            {
              title: "Automotive Tech",
              icon: "🚗",
              desc: "Essential for range extension in EVs through significant vehicle weight reduction."
            }
          ].map((item, idx) => (
            <div key={idx} className="p-8 border border-slate-100 rounded-2xl hover:border-slate-300 transition-colors bg-slate-50/30">
              <div className="text-4xl mb-6">{item.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyMagnesium;
