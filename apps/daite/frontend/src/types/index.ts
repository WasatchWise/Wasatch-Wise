export interface User {
  id: string
  email: string
  pseudonym: string
  avatarUrl?: string
  createdAt: string
}

export interface CYRAiNOAgent {
  id: string
  userId: string
  name: string
  persona: string
  values: string[]
  interests: string[]
  communicationStyle: string
  createdAt: string
}

export interface Match {
  id: string
  userAId: string
  userBId: string
  agentConversationId?: string
  compatibilityScore: number
  narrative?: string
  status: 'pending' | 'mutual' | 'declined'
  createdAt: string
}

export interface AgentConversation {
  id: string
  agentAId: string
  agentBId: string
  transcript: string
  summary: string
  compatibilityScore: number
  narrative?: string
  createdAt: string
}

