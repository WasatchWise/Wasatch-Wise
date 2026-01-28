import React from 'react';
import { TECHNICAL_SPECS, GMC_RESOURCES } from '../constants';

export const AssetDeepDive: React.FC = () => {
  const technicalFields = [
    { label: 'Deposit', value: TECHNICAL_SPECS.deposit },
    { label: 'Location', value: TECHNICAL_SPECS.location },
    { label: 'Resource Size', value: TECHNICAL_SPECS.resourceSize },
    { label: 'Average Grade', value: TECHNICAL_SPECS.averageGrade },
    { label: 'Mine Life', value: TECHNICAL_SPECS.mineLife },
    { label: 'Control', value: TECHNICAL_SPECS.control },
    { label: 'Investment', value: TECHNICAL_SPECS.investment },
    { label: 'Compliance', value: TECHNICAL_SPECS.compliance },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-slate-900/40 border border-slate-600 rounded-3xl p-10 shadow-inner">
        <h4 className="mono text-base text-blue-400 uppercase tracking-widest font-bold mb-8">Technical Sheet: Whitney Deposit</h4>
        <div className="space-y-5 mb-8">
          {technicalFields.map((field, i) => (
            <div key={i} className="flex justify-between items-start border-b border-slate-700 pb-4">
              <span className="text-base text-white uppercase font-bold tracking-tight">
                {field.label}
              </span>
              <span className="text-base text-white text-right max-w-[60%] leading-relaxed">
                {field.value}
              </span>
            </div>
          ))}
          <div className="pt-4 border-t border-blue-500/30">
            <h5 className="text-base text-blue-400 font-bold mb-3 uppercase">Mining Method</h5>
            <p className="text-base text-white leading-relaxed mb-4">{TECHNICAL_SPECS.mining_method}</p>
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4 mb-4">
              <div className="text-sm text-blue-400 font-bold mb-2 uppercase">Field Trial Results</div>
              <div className="text-sm text-white space-y-1">
                <div><span className="font-bold">{TECHNICAL_SPECS.fieldTrial.tons}</span> extracted at <span className="font-bold">{TECHNICAL_SPECS.fieldTrial.cost}</span></div>
                <div>Confirmed beneficiation to <span className="font-bold">90% magnesite concentrate</span></div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed italic">
              The Whitney Deposit is close to the surface and suitable for continuous surface mining with a Wirtgen surface miner, a technique that requires no explosives, no blasting and no drilling and significantly reduces environmental disturbance, noise, dust, vibration and permitting delays.
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-blue-500/30 pl-4">
          GMC's Whitney Deposit also contains significant quantities of industrial-grade talc, which can create immediate revenue from sales to manufacturers of paint and coatings, plastics and specialty papers. Talc sales will generate cash flow before full magnesium production begins.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
          <h4 className="mono text-base text-blue-400 uppercase tracking-widest font-bold mb-6">Metallurgical Advantage</h4>
          <p className="text-lg text-white leading-relaxed">
            Unlike traditional Pidgeon process plants that rely on coal-fired calcination, the Whitney deposit supports
            a continuous, closed-loop hydrometallurgical circuit. This allows for <span className="text-blue-400 font-bold">99.95%+ purity</span> without the volatile carbon footprint associated with foreign supply.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-600 p-8 rounded-2xl text-center">
            <div className="text-4xl font-black text-white italic">34%</div>
            <div className="text-base mono text-white uppercase tracking-widest mt-3 font-bold">Avg Magnesite Grade</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-600 p-8 rounded-2xl text-center">
            <div className="text-4xl font-black text-white italic">47%</div>
            <div className="text-base mono text-white uppercase tracking-widest mt-3 font-bold">Avg Talc Grade</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-600 p-8 rounded-2xl">
          <h4 className="mono text-base text-blue-400 uppercase tracking-widest font-bold mb-6">Resource Summary</h4>
          <div className="space-y-4">
            {GMC_RESOURCES.map((res, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-700 pb-4 last:border-0 last:pb-0">
                <span className="text-lg text-white font-medium">{res.category}</span>
                <span className="text-lg text-blue-400 font-bold">{(res.tonnes / 1000000).toFixed(1)}M tons</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t border-blue-500/30">
              <span className="text-xl text-white font-bold uppercase">Total Resource</span>
              <span className="text-xl text-blue-400 font-black">~100M tons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
