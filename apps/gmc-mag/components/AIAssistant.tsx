import React, { useState, useRef, useEffect } from 'react';
import { askAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';
import { REPORT_SUMMARY } from '../constants';

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Strategic Intelligence Unit Active. I can answer questions about magnesium markets, the Whitney project, geopolitical risks, or GMC's investment thesis. How can I assist you?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const response = await askAssistant(userMsg, REPORT_SUMMARY);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-slate-900 px-8 py-5 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
          <h3 className="mono text-base uppercase tracking-widest text-blue-400 font-bold">GMC Strategic Intelligence</h3>
        </div>
        <div className="flex items-center gap-6 mono text-sm text-white tracking-wider uppercase font-bold">
          <span className="hidden sm:inline">Secure Channel</span>
          <span className="text-blue-400">Status: Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-6 py-5 rounded-2xl ${
              m.role === 'user'
                ? 'bg-blue-600/20 text-white border border-blue-500/50'
                : 'bg-slate-800 text-white border border-slate-600'
            }`}>
              <div className={`text-sm mb-3 uppercase tracking-widest font-bold ${m.role === 'user' ? 'text-blue-400' : 'text-blue-400'}`}>
                {m.role === 'user' ? 'Your Question' : 'Intelligence Response'}
              </div>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="text-blue-400 animate-pulse tracking-widest font-bold text-base">Analyzing strategic context...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-700 flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about magnesium markets, the Whitney project, or investment thesis..."
          className="flex-1 bg-slate-950 border border-slate-600 rounded-xl px-6 py-4 text-base text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/50"
        />
        <button
          onClick={handleSend}
          disabled={isTyping}
          className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 px-8 py-4 rounded-xl text-base mono font-bold transition-all disabled:opacity-30 tracking-wider uppercase shadow-lg active:scale-95"
        >
          Send
        </button>
      </div>
    </div>
  );
};
