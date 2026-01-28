import React from 'react';
import { STRATEGIC_NEWS } from '../constants';

export const StrategicNews: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="mono text-base text-white uppercase tracking-widest font-bold">Strategic Volatility Monitor</h4>
        <div className="flex gap-3 items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          <span className="text-base mono text-red-400 uppercase font-bold">Live Risks</span>
        </div>
      </div>
      {STRATEGIC_NEWS.map((news) => (
        <div key={news.id} className="bg-slate-900/60 border border-slate-600 p-6 rounded-xl hover:border-blue-500/50 transition-all cursor-default">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm mono text-blue-400 font-bold border border-blue-400/50 px-3 py-1 rounded uppercase">
              {news.tag}
            </span>
            <span className="text-sm mono text-white uppercase tracking-tight">{news.date}</span>
          </div>
          <h5 className="text-lg font-bold text-white mb-3 leading-snug">{news.title}</h5>
          <p className="text-base text-white leading-relaxed mb-4">{news.summary}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white font-medium uppercase">Impact:</span>
            <span className="text-sm text-blue-400 font-bold">{news.impact}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
