/**
 * Post-Connection Reinforcement Service
 * 
 * Based on behavioral psychology: "Post-sale is the new pre-sale"
 * After a user takes action (reaches out, accepts connection), we reinforce
 * their decision with validation, justification, and celebration.
 * 
 * This reduces cognitive dissonance and increases long-term engagement.
 */

export interface ConnectionAction {
  type: 'reached_out' | 'accepted' | 'responded' | 'scheduled'
  connectionId: string
  otherUserName?: string
  connectionType?: 'friendship' | 'playdate' | 'music' | 'community' | 'romantic'
  timestamp: Date
}

export interface ReinforcementMessage {
  id: string
  title: string
  message: string
  type: 'validation' | 'justification' | 'celebration' | 'social_proof'
  showMetrics?: boolean
  showWhyThisWorks?: boolean
}

/**
 * Generate reinforcement message after user takes action
 */
export function generateReinforcementMessage(
  action: ConnectionAction,
  compatibilityData?: {
    score: number
    sharedValues: string[]
    sharedInterests: string[]
    narrative?: string
  }
): ReinforcementMessage {
  const actionVerbs = {
    reached_out: 'reached out',
    accepted: 'accepted',
    responded: 'responded to',
    scheduled: 'scheduled time with',
  }

  const actionVerb = actionVerbs[action.type]
  const name = action.otherUserName || 'this person'

  // Validation: Emotional reinforcement (System 1)
  const validationMessages = [
    `You ${actionVerb} to ${name}. That&apos;s brave, and it&apos;s how connections happen.`,
    `Taking action matters. You ${actionVerb} to ${name}, and that&apos;s the first step toward meaningful connection.`,
    `You made a choice to connect. That ${actionVerb} to ${name} shows you&apos;re ready to embrace new relationships.`,
  ]

  // Justification: Rational reinforcement (System 2)
  const justificationMessages: string[] = []
  
  if (compatibilityData) {
    if (compatibilityData.sharedValues.length > 0) {
      justificationMessages.push(
        `Here&apos;s why this makes sense: You both value ${compatibilityData.sharedValues.slice(0, 2).join(' and ')}. That shared foundation matters.`
      )
    }
    
    if (compatibilityData.sharedInterests.length > 0) {
      justificationMessages.push(
        `You both share interests in ${compatibilityData.sharedInterests.slice(0, 2).join(' and ')}—that&apos;s where real connection starts.`
      )
    }
    
    if (compatibilityData.score >= 80) {
      justificationMessages.push(
        `With a ${compatibilityData.score}% compatibility score, this connection has strong potential. The data supports what you felt.`
      )
    }
  }

  // Celebration: Dopamine reinforcement
  const celebrationMessages = [
    `Every connection starts with someone being brave enough to reach out. That was you today. 🎉`,
    `This is how it happens—one brave step at a time. You took yours. ✨`,
    `You&apos;re not just looking for connections—you&apos;re creating them. That&apos;s worth celebrating. 🌟`,
  ]

  // Combine messages based on available data
  const title = action.type === 'reached_out' 
    ? `You Reached Out to ${name}`
    : action.type === 'accepted'
    ? `Connection Accepted!`
    : `You Took Action`

  const message = [
    validationMessages[Math.floor(Math.random() * validationMessages.length)],
    ...justificationMessages,
    celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)],
  ].join('\n\n')

  return {
    id: `reinforcement-${action.connectionId}-${Date.now()}`,
    title,
    message,
    type: 'validation',
    showMetrics: !!compatibilityData,
    showWhyThisWorks: !!compatibilityData?.narrative,
  }
}

/**
 * Generate social proof message
 */
export function generateSocialProofMessage(
  connectionType: ConnectionAction['connectionType'],
  count: number
): ReinforcementMessage {
  const typeMessages = {
    playdate: `${count} other parents found playdate connections this week. You&apos;re part of a growing community.`,
    music: `${count} musicians connected this month. The creative community is growing.`,
    community: `${count} people joined community events this week. You&apos;re building something together.`,
    friendship: `${count} new friendships started this week. Your connection adds to this growing network.`,
    romantic: `${count} people found meaningful connections this month. You&apos;re part of this movement.`,
  }

  return {
    id: `social-proof-${Date.now()}`,
    title: 'You&apos;re Not Alone',
    message: typeMessages[connectionType || 'friendship'],
    type: 'social_proof',
  }
}

/**
 * Identity alignment message (Self-Congruity Theory)
 */
export function generateIdentityAlignmentMessage(
  userIdentity: string,
  connectionIdentity: string,
  connectionType: string
): ReinforcementMessage {
  return {
    id: `identity-${Date.now()}`,
    title: 'This Connection Aligns With Who You Are',
    message: `You see yourself as ${userIdentity}, and this connection with ${connectionIdentity} reinforces that identity. ${connectionType} connections like this help you become who you want to be.`,
    type: 'justification',
  }
}

