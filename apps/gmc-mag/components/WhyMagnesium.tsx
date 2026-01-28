import React from 'react';
import { MAGNESIUM_IMPORTANCE } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WhyMagnesium: React.FC = () => {
  return (
    <div className="space-y-20">
      {/* PROPERTIES SECTION */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-8 uppercase tracking-tight text-center">Physical Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {MAGNESIUM_IMPORTANCE.properties.map((prop, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all">
              <div className="text-4xl font-black text-blue-400 mb-3">{prop.stat}</div>
              <h4 className="text-lg font-bold text-white mb-3 uppercase">{prop.title}</h4>
              <p className="text-base text-white leading-relaxed">{prop.description}</p>
            </div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto space-y-2 text-sm text-slate-400 mono">
          <p>* <span className="text-blue-400 font-bold">kN · m/kg:</span> Kilonewton-meters per kilogram, a measure of specific strength (strength-to-weight ratio).</p>
          <p>** <span className="text-blue-400 font-bold">IACS:</span> International Annealed Copper Standard, a unit of electrical conductivity relative to copper.</p>
        </div>
      </div>

      {/* CRITICAL FACTS */}
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-3xl p-10">
        <h3 className="text-2xl font-bold text-white mb-8 uppercase tracking-tight text-center">Critical Industry Facts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MAGNESIUM_IMPORTANCE.criticalFacts.map((fact, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="text-blue-400 text-2xl font-bold flex-shrink-0">→</span>
              <p className="text-lg text-white leading-relaxed">{fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* APPLICATIONS BY SECTOR */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-8 uppercase tracking-tight text-center">Applications by Sector</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {MAGNESIUM_IMPORTANCE.applications.map((app, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{app.icon}</span>
                <h4 className="text-2xl font-bold text-white uppercase">{app.sector}</h4>
              </div>
              <div className="space-y-4">
                {app.examples.map((ex, j) => (
                  <div key={j} className="flex justify-between items-start border-b border-slate-700 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-lg font-bold text-white">{ex.item}</div>
                      <div className="text-base text-white">{ex.note}</div>
                    </div>
                    <div className="text-lg font-bold text-blue-400 whitespace-nowrap ml-4">{ex.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MARKET DEMAND PROJECTION */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-8 uppercase tracking-tight text-center">Global Demand Projection</h3>
        <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-10">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MAGNESIUM_IMPORTANCE.marketDemand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="year" stroke="#ffffff" fontSize={16} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#ffffff"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', fontSize: '16px', color: '#fff' }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(0)}K tons`, 'Demand']}
                />
                <Bar dataKey="demandMT" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {MAGNESIUM_IMPORTANCE.marketDemand.map((d, i) => (
              <div key={i} className="text-center p-4 bg-slate-950 rounded-xl">
                <div className="text-2xl font-bold text-blue-400">{d.year}</div>
                <div className="text-lg text-white font-medium">{(d.demandMT / 1000000).toFixed(2)}M tons</div>
                <div className="text-base text-white">{d.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KEY TAKEAWAY */}
      <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/10 border border-blue-500/40 rounded-3xl p-10 text-center">
        <h3 className="text-3xl font-black text-white mb-6 uppercase">The Bottom Line</h3>
        <p className="text-xl text-white leading-relaxed max-w-4xl mx-auto">
          Magnesium demand is projected to <strong className="text-blue-400">double by 2035</strong> driven by defense reshoring, EV lightweighting, and aerospace growth.
          With <strong className="text-blue-400">zero North American primary production</strong> and <strong className="text-blue-400">90% Chinese control</strong>,
          the strategic case for domestic supply has never been stronger.
        </p>
      </div>
    </div>
  );
};
