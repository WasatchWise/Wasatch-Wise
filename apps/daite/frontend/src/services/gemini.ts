import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn('Gemini API key not set. AI features will be unavailable.')
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }) : null

/**
 * Simulate a conversation between two CYRAiNO agents
 */
export interface AgentProfile {
  name: string
  persona: string
  values: string[]
  interests: string[]
  communicationStyle: string
}

export interface AgentConversation {
  transcript: string
  summary: string
  compatibilityScore: number
  matchDecision: 'YES' | 'NO'
  narrative?: string
  safetyAnalysis?: {
    authenticityScore: number // 0-100, higher = more authentic
    empathyScore: number // 0-100, higher = more empathetic
    consistencyScore: number // 0-100, higher = more consistent
    riskLevel: 'low' | 'moderate' | 'high' | 'critical'
    concerns: string[]
    redFlags: string[]
  }
}

export async function simulateAgentDialogue(
  agentA: AgentProfile,
  agentB: AgentProfile,
  connectionType?: string // Optional: specific connection type being evaluated
): Promise<AgentConversation | { error: string }> {
  if (!model) {
    return { error: 'Gemini API not configured' }
  }

  // Build connection type context
  const connectionTypeContext = connectionType 
    ? `\n\nSPECIFIC CONNECTION TYPE BEING EVALUATED: ${connectionType.toUpperCase()}\nFocus this vibe check specifically on ${connectionType} compatibility. The conversation should explore whether these two people would be a good match for ${connectionType}, considering:\n- Shared interests relevant to ${connectionType}\n- Compatible values and lifestyles for ${connectionType}\n- Mutual availability and commitment level for ${connectionType}\n- Chemistry and rapport specific to ${connectionType} relationships\n\n`
    : `\n\nNote: These users may be seeking multiple types of connections. Evaluate overall compatibility across all potential connection types they might share.\n`

  const prompt = `
You are facilitating a "vibe check" conversation between two users' personal CYRAiNO agents. DAiTE is a social connection platform for all kinds of relationships: friendship, community, playdates, music collaboration, support groups, romantic connections, fitness partners, hiking partners, foodies, gaming, book clubs, and more. 

IMPORTANT: Users can be looking for MULTIPLE types of connections simultaneously. For example, someone might want:
- Romantic dating AND male friends AND music collaborators
- Playdates AND community building AND support groups
- Any combination of connection types

The goal is helping humans embrace meaningful connections of all types. When evaluating compatibility, consider what types of connections both users are seeking and find alignment in those areas.
${connectionTypeContext}

Agent A (${agentA.name}):
- Persona: ${agentA.persona}
- Values: ${agentA.values.join(', ')}
- Interests: ${agentA.interests.join(', ')}
- Communication Style: ${agentA.communicationStyle}

Agent B (${agentB.name}):
- Persona: ${agentB.persona}
- Values: ${agentB.values.join(', ')}
- Interests: ${agentB.interests.join(', ')}
- Communication Style: ${agentB.communicationStyle}

Instructions:
1. Simulate a natural, insightful conversation (3-5 exchanges each, 6-10 lines total) between these two CYRAiNO agents discussing their humans' potential for connection. ${connectionType ? `Focus specifically on ${connectionType} compatibility.` : 'This could be friendship, community, collaboration, playdates, support, or romantic—whatever makes sense based on their profiles.'}

SAFETY ANALYSIS: After the conversation, analyze for red flags:
- Authenticity: Does the conversation feel genuine or performative? Are there moments of vulnerability vs. constant perfection?
- Empathy: Does this person show emotional intelligence? Can they understand others' perspectives?
- Consistency: Does the narrative align with their profile? Are there contradictions or evasiveness?
- Manipulation Signals: Love bombing, rapid escalation, pressure tactics, boundary violations, victim positioning
- Risk Assessment: Rate as low, moderate, high, or critical with specific concerns and evidence

2. Provide a brief summary of their interaction and perceived compatibility.

3. Provide a compatibilityScore (0-100).

4. Provide a matchDecision ("YES" or "NO").

5. If matchDecision is "YES", provide a narrative that combines:
   - **Emotional resonance (System 1)**: A beautiful, poetic explanation (2-3 sentences) that gives readers "chills" - specific, warm, and insightful about ${connectionType ? `the ${connectionType} connection` : 'the type of connection'} and why it matters. Frame it to trigger emotional recognition: "This person gets you" or "This connection aligns with who you are."
   - **Rational justification (System 2)**: Include 2-3 concrete, shareable reasons that help justify the connection. Focus on specific shared values, compatible lifestyles, mutual interests, or identity alignment ${connectionType ? `relevant to ${connectionType}` : ''} (e.g., "Both are parents who see themselves as community builders" or "Both musicians seeking authentic collaboration"). These reasons should help the user explain to themselves and others why this connection makes sense.

The narrative should address identity alignment (Self-Congruity Theory) - how this connection reflects their actual self, ideal self, or social self. Use framing that helps users see what they might miss by not connecting (loss aversion), while celebrating what they gain (positive framing).

Format as JSON:
{
  "transcript": "Agent A: ...\\nAgent B: ...",
  "summary": "...",
  "compatibilityScore": 85,
  "matchDecision": "YES",
  "narrative": "Your combined emotional + rational explanation here. First paragraph: poetic, emotional resonance. Second paragraph: concrete justification points that help validate the connection choice.",
  "safetyAnalysis": {
    "authenticityScore": 85,
    "empathyScore": 90,
    "consistencyScore": 80,
    "riskLevel": "low",
    "concerns": [],
    "redFlags": []
  }
}
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/)
    const jsonText = jsonMatch ? jsonMatch[1] : text
    
    const parsed = JSON.parse(jsonText.trim())
    
    return {
      transcript: parsed.transcript || '',
      summary: parsed.summary || '',
      compatibilityScore: parsed.compatibilityScore || 0,
      matchDecision: parsed.matchDecision || 'NO',
      narrative: parsed.narrative,
    }
  } catch (error) {
    console.error('Error in agent dialogue:', error)
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

