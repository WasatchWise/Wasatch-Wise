import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AgentProfile } from '../services/gemini'

interface CYRAiNOBuilderProps {
  onComplete: (agent: AgentProfile) => void
}

export function CYRAiNOBuilder({ onComplete }: CYRAiNOBuilderProps) {
  const [agent, setAgent] = useState<Partial<AgentProfile>>({
    name: '',
    persona: '',
    values: [],
    interests: [],
    communicationStyle: '',
  })
  const [currentValue, setCurrentValue] = useState('')
  const [currentInterest, setCurrentInterest] = useState('')
  const [saving, setSaving] = useState(false)

  const addValue = () => {
    if (currentValue.trim() && !agent.values?.includes(currentValue.trim())) {
      setAgent({
        ...agent,
        values: [...(agent.values || []), currentValue.trim()],
      })
      setCurrentValue('')
    }
  }

  const removeValue = (value: string) => {
    setAgent({
      ...agent,
      values: agent.values?.filter((v) => v !== value) || [],
    })
  }

  const addInterest = () => {
    if (currentInterest.trim() && !agent.interests?.includes(currentInterest.trim())) {
      setAgent({
        ...agent,
        interests: [...(agent.interests || []), currentInterest.trim()],
      })
      setCurrentInterest('')
    }
  }

  const removeInterest = (interest: string) => {
    setAgent({
      ...agent,
      interests: agent.interests?.filter((i) => i !== interest) || [],
    })
  }

  const handleSave = async () => {
    if (!supabase || !agent.name || !agent.persona) {
      return
    }

    setSaving(true)
    try {
      // Save to Supabase (when table is ready)
      // For now, just complete the flow
      const completeAgent: AgentProfile = {
        name: agent.name,
        persona: agent.persona,
        values: agent.values || [],
        interests: agent.interests || [],
        communicationStyle: agent.communicationStyle || '',
      }
      onComplete(completeAgent)
    } catch (error) {
      console.error('Error saving CYRAiNO:', error)
    } finally {
      setSaving(false)
    }
  }

  const isComplete = agent.name && agent.persona && agent.values && agent.values.length > 0

  return (
    <div className="max-w-2xl mx-auto bg-slate-800/50 rounded-lg p-8 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Create Your CYRAiNO</h2>
        <p className="text-slate-400">
          Your personal AI companion. Let&apos;s build its personality so it can help you find the connections you&apos;re looking for.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            What should your CYRAiNO be called?
          </label>
          <input
            type="text"
            value={agent.name}
            onChange={(e) => setAgent({ ...agent, name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="e.g., Sage, Luna, Atlas..."
          />
        </div>

        {/* Step 2: Persona */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Describe your CYRAiNO&apos;s personality
          </label>
          <textarea
            value={agent.persona}
            onChange={(e) => setAgent({ ...agent, persona: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="e.g., A thoughtful parent who values authentic friendships and community, or a musician seeking creative collaboration..."
          />
        </div>

        {/* Step 3: Values */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Core Values (what matters most to you)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
              className="flex-1 px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., Authenticity, Adventure, Growth..."
            />
            <button
              type="button"
              onClick={addValue}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {agent.values?.map((value) => (
              <span
                key={value}
                className="px-3 py-1 bg-purple-600/30 rounded-full text-sm flex items-center gap-2"
              >
                {value}
                <button
                  onClick={() => removeValue(value)}
                  className="text-purple-300 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Step 4: Interests */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Interests & Hobbies
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentInterest}
              onChange={(e) => setCurrentInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              className="flex-1 px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., Reading, Hiking, Art..."
            />
            <button
              type="button"
              onClick={addInterest}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {agent.interests?.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-pink-600/30 rounded-full text-sm flex items-center gap-2"
              >
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="text-pink-300 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Step 5: Communication Style */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Communication Style
          </label>
          <input
            type="text"
            value={agent.communicationStyle}
            onChange={(e) => setAgent({ ...agent, communicationStyle: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="e.g., Warm and thoughtful, Direct and honest..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!isComplete || saving}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Creating...' : 'Create My CYRAiNO'}
        </button>
      </div>
    </div>
  )
}

