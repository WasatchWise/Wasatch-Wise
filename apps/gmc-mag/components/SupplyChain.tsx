import React from 'react';
import { ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from 'recharts';

const globalDominanceData = [
  { name: 'China (High-Risk)', value: 90, color: '#b91c1c' },
  { name: 'Western Alliance', value: 10, color: '#1e40af' }
];

export const SupplyChain: React.FC = () => {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <div className="h-72 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={globalDominanceData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {globalDominanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                 contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', fontSize: '16px', color: '#fff' }}
                 itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-6xl font-black text-white leading-none tracking-tighter">90%</span>
            <span className="text-base mono text-white uppercase tracking-widest mt-2 font-bold">Chinese Control</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-5 bg-red-950/40 border-2 border-red-700 rounded-xl shadow-lg">
          <span className="mono text-base text-white font-bold uppercase tracking-wider">Single Point of Failure</span>
          <span className="text-base text-red-400 font-black tracking-tight uppercase">Unacceptable Risk</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/70 border border-slate-600 p-6 rounded-xl">
            <span className="block text-white font-bold text-lg mb-3 uppercase tracking-tight">Foreign Dominance</span>
            <p className="text-base text-white leading-relaxed">Carbon-intensive Pidgeon process, export controls, policy volatility, geopolitical leverage.</p>
          </div>
          <div className="bg-slate-900/70 border border-slate-600 p-6 rounded-xl">
            <span className="block text-white font-bold text-lg mb-3 uppercase tracking-tight">NATO Vulnerability</span>
            <p className="text-base text-white leading-relaxed">Decades of underinvestment, zero domestic primary production since 2001.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
