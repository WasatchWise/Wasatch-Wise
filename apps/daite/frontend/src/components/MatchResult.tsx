import type { AgentConversation } from '../services/gemini'

interface MatchResultProps {
  result: AgentConversation
}

export function MatchResult({ result }: MatchResultProps) {
  return (
    <div className="max-w-3xl mx-auto bg-slate-800/50 rounded-lg p-8 backdrop-blur-sm space-y-6">
      <div className="text-center">
        <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {result.compatibilityScore}%
        </div>
        <div className={`text-xl font-semibold ${
          result.matchDecision === 'YES' ? 'text-green-400' : 'text-red-400'
        }`}>
          {result.matchDecision === 'YES' ? '✨ Connection Found!' : 'No Connection'}
        </div>
      </div>

      {result.narrative && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-xl font-semibold mb-3">Why This Works</h3>
          <p className="text-lg leading-relaxed text-slate-200 italic">
            {result.narrative}
          </p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">The Conversation</h3>
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
          {result.transcript.split('\n').map((line, i) => (
            <div key={i} className="text-slate-300">
              {line}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <p className="text-slate-300">{result.summary}</p>
      </div>
    </div>
  )
}

