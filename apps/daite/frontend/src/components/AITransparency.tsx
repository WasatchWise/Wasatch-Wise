/**
 * AI Transparency Component
 * 
 * Displays clear information about AI's role vs. human connection
 * Helps build trust through radical transparency
 */

'use client'

import { Info, Sparkles, Users, Zap } from 'lucide-react'
import { Card, CardContent } from './ui/Card'

interface AITransparencyProps {
  variant?: 'compact' | 'full'
  className?: string
}

export function AITransparency({ variant = 'compact', className = '' }: AITransparencyProps) {
  if (variant === 'compact') {
    return (
      <div className={`bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 ${className}`}>
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-slate-300">
              <strong className="text-purple-400">AI facilitates.</strong> Humans connect.{' '}
              <span className="text-slate-400">
                CYRAiNO helps discover compatibility, but real connections happen between you and other people.
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold">How AI Helps, How Humans Connect</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">What AI Does</h4>
              <p className="text-sm text-slate-400">
                CYRAiNO learns about you, articulates your authentic self, and has conversations with other agents to discover compatibility. AI helps you find people you might not have found otherwise.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-pink-600/20 rounded-lg">
              <Users className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">What Humans Do</h4>
              <p className="text-sm text-slate-400">
                You decide who to connect with. You meet in real life—coffee, playdates, jam sessions, community events. The real connection happens between you and other people, offline, authentically.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-slate-700/50 rounded-lg">
              <Zap className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">You&apos;re in Control</h4>
              <p className="text-sm text-slate-400">
                Your CYRAiNO reflects you—you shape it, you control it, you can change it anytime. AI suggests connections, but your judgment matters more than AI certainty. If something feels off, tell us.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 italic">
            AI isn&apos;t perfect, and that&apos;s okay. Your authenticity comes from you, not from AI. CYRAiNO just helps you express it and discover connections that might matter.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

