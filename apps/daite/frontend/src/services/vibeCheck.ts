import { supabase } from '@/lib/supabase'
import { simulateAgentDialogue, type AgentProfile } from './gemini'

export interface VibeCheckResult {
  success: boolean
  vibeCheckId?: string
  discoveries?: any[]
  error?: string
  message?: string
}

export interface VibeCheckEligibility {
  eligible: boolean
  reasons: string[]
  canRun: boolean
  tokenBalance?: number
  tokensNeeded?: number
  cooldownHours?: number
  weeklyCount?: number
  weeklyLimit?: number
}

/**
 * Check if user is eligible to run a vibe check
 */
export async function checkVibeCheckEligibility(
  userId: string,
  vibeCheckType: 'standard' | 'extended' = 'standard'
): Promise<VibeCheckEligibility> {
  if (!supabase) {
    return {
      eligible: false,
      reasons: ['Supabase not configured'],
      canRun: false
    }
  }

  const reasons: string[] = []
  const tokensNeeded = vibeCheckType === 'standard' ? 10 : 20

  try {
    // 1. Check if user has a CYRAiNO agent
    const { data: agent, error: agentError } = await supabase
      .from('cyraino_agents')
      .select('id, name, personality_traits')
      .eq('user_id', userId)
      .single()

    if (agentError || !agent) {
      reasons.push('You need to create your CYRAiNO agent first')
      return {
        eligible: false,
        reasons,
        canRun: false
      }
    }

    // 2. Check token balance
    const { data: tokenBalance, error: tokenError } = await supabase
      .from('token_balances')
      .select('balance')
      .eq('user_id', userId)
      .single()

    const balance = tokenBalance?.balance || 0
    if (balance < tokensNeeded) {
      reasons.push(`You need ${tokensNeeded} tokens (you have ${balance})`)
    }

    // 3. Check weekly limit (3 per week)
    const getWeekNumber = (date: Date): number => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    }
    const currentWeek = getWeekNumber(new Date())
    const { count: weeklyCount } = await supabase
      .from('vibe_checks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('week_number', currentWeek)
      .neq('status', 'refunded')

    if ((weeklyCount || 0) >= 3) {
      reasons.push('You\'ve reached your weekly limit of 3 vibe checks')
    }

    // 4. Check cooldown (24 hours)
    const { data: lastVibeCheck } = await supabase
      .from('vibe_checks')
      .select('started_at')
      .eq('user_id', userId)
      .in('status', ['completed', 'failed'])
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (lastVibeCheck?.started_at) {
      const hoursSince = (Date.now() - new Date(lastVibeCheck.started_at).getTime()) / (1000 * 60 * 60)
      if (hoursSince < 24) {
        const remaining = Math.ceil(24 - hoursSince)
        reasons.push(`You must wait ${remaining} more hour(s) before your next vibe check`)
      }
    }

    // 5. Check for pending/processing vibe checks
    const { data: pendingCheck } = await supabase
      .from('vibe_checks')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
      .single()

    if (pendingCheck) {
      reasons.push('You have a vibe check already in progress')
    }

    // 6. Check profile completeness (at least basic info)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('profile_completeness_score')
      .eq('user_id', userId)
      .single()

    if (!profile || (profile.profile_completeness_score || 0) < 30) {
      reasons.push('Complete your profile to run vibe checks (at least 30% complete)')
    }

    const canRun = reasons.length === 0

    return {
      eligible: canRun,
      reasons,
      canRun,
      tokenBalance: balance,
      tokensNeeded,
      weeklyCount: weeklyCount || 0,
      weeklyLimit: 3,
      cooldownHours: lastVibeCheck?.started_at 
        ? Math.max(0, 24 - (Date.now() - new Date(lastVibeCheck.started_at).getTime()) / (1000 * 60 * 60))
        : 0
    }
  } catch (error) {
    console.error('Error checking vibe check eligibility:', error)
    return {
      eligible: false,
      reasons: ['Error checking eligibility'],
      canRun: false
    }
  }
}

/**
 * Run a vibe check - the core matching functionality
 */
export async function runVibeCheck(
  userId: string,
  vibeCheckType: 'standard' | 'extended' = 'standard',
  connectionType?: string // Optional: specific connection type to check for
): Promise<VibeCheckResult> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase not configured'
    }
  }

  try {
    // 1. Check eligibility
    const eligibility = await checkVibeCheckEligibility(userId, vibeCheckType)
    if (!eligibility.canRun) {
      return {
        success: false,
        error: 'Not eligible',
        message: eligibility.reasons.join('. ')
      }
    }

    // 2. Get user's agent
    const { data: userAgent, error: agentError } = await supabase
      .from('cyraino_agents')
      .select('id, name, personality_traits, user_id')
      .eq('user_id', userId)
      .single()

    if (agentError || !userAgent) {
      return {
        success: false,
        error: 'CYRAiNO agent not found'
      }
    }

    // 3. Deduct tokens
    const tokensNeeded = vibeCheckType === 'standard' ? 10 : 20
    const { data: tokenBalance } = await supabase
      .from('token_balances')
      .select('balance')
      .eq('user_id', userId)
      .single()

    const newBalance = (tokenBalance?.balance || 0) - tokensNeeded

    await supabase
      .from('token_balances')
      .update({ balance: newBalance })
      .eq('user_id', userId)

    // Record transaction
    await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'spend',
        amount: -tokensNeeded,
        balance_after: newBalance,
        context_type: 'vibe_check',
        description: `${vibeCheckType} vibe check`
      })

    // 4. Create vibe check record
    const getWeekNumber = (date: Date): number => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    }
    const currentWeek = getWeekNumber(new Date())
    const { data: vibeCheck, error: vibeCheckError } = await supabase
      .from('vibe_checks')
      .insert({
        user_id: userId,
        agent_id: userAgent.id,
        vibe_check_type: vibeCheckType,
        connection_type: connectionType || null, // Store the connection type being checked
        token_cost: tokensNeeded,
        status: 'processing',
        week_number: currentWeek,
        estimated_completion_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      })
      .select()
      .single()

    if (vibeCheckError || !vibeCheck) {
      // Refund tokens
      await supabase
        .from('token_balances')
        .update({ balance: (tokenBalance?.balance || 0) })
        .eq('user_id', userId)

      return {
        success: false,
        error: 'Failed to create vibe check'
      }
    }

    // 5. Find candidate users (3-5 candidates)
    const candidateCount = vibeCheckType === 'standard' ? 3 : 5

    // Get existing matches to exclude
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('user_1_id, user_2_id')
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
      .eq('is_active', true)

    const excludedIds = new Set([userId])
    existingMatches?.forEach(m => {
      excludedIds.add(m.user_1_id)
      excludedIds.add(m.user_2_id)
    })

    // Get existing discoveries to avoid duplicates
    const { data: existingDiscoveries } = await supabase
      .from('discoveries')
      .select('discovered_user_id')
      .eq('discoverer_user_id', userId)
      .in('status', ['new', 'interested', 'saved'])

    existingDiscoveries?.forEach(d => excludedIds.add(d.discovered_user_id))

      // Get user's connection types to find compatible matches
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('looking_for')
        .eq('user_id', userId)
        .single()

      const userConnectionTypes = (userProfile?.looking_for as string[]) || []
      
      // If a specific connection type is requested, use that; otherwise use all user's types
      const targetConnectionTypes = connectionType 
        ? [connectionType] 
        : userConnectionTypes

      // Find candidates with agents and profiles
      // Build filter to exclude matched users
      const excludedArray = Array.from(excludedIds)
      let candidatesQuery = supabase
        .from('users')
        .select(`
          id,
          pseudonym,
          cyraino_agents!inner (
            id,
            name,
            personality_traits
          ),
          user_profiles (
            bio,
            values,
            looking_for
          )
        `)
        .neq('id', userId)
        .eq('account_status', 'active')
        .limit(candidateCount * 3) // Get extra to filter by connection type overlap

      // Filter out excluded IDs
      if (excludedArray.length > 0) {
        excludedArray.forEach(id => {
          candidatesQuery = candidatesQuery.neq('id', id)
        })
      }

      const { data: candidates } = await candidatesQuery

      // Filter candidates to those with overlapping connection types
      // If a specific connection type is requested, only find people also looking for that type
      const compatibleCandidates = candidates?.filter(candidate => {
        const candidateTypes = (candidate.user_profiles as any)?.looking_for || []
        if (targetConnectionTypes.length === 0 || candidateTypes.length === 0) {
          return true // If no preferences set, include everyone
        }
      // Check for overlap with target connection types
      return targetConnectionTypes.some(type => candidateTypes.includes(type))
      }) || []

    if (!compatibleCandidates || compatibleCandidates.length === 0) {
      // No candidates - refund tokens
      await supabase
        .from('vibe_checks')
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', vibeCheck.id)

      await supabase
        .from('token_balances')
        .update({ balance: (tokenBalance?.balance || 0) })
        .eq('user_id', userId)

      await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'refund',
          amount: tokensNeeded,
          balance_after: (tokenBalance?.balance || 0),
          context_type: 'vibe_check',
          context_id: vibeCheck.id,
          description: 'Vibe check refund - no candidates'
        })

      return {
        success: false,
        error: 'No eligible candidates found',
        message: 'Try again later when more users have joined'
      }
    }

    // 6. Run agent-to-agent conversations
    const discoveries: any[] = []
    const userAgentProfile: AgentProfile = {
      name: userAgent.name,
      persona: (userAgent.personality_traits as any)?.persona || 'A thoughtful person seeking meaningful connections',
      values: (userAgent.personality_traits as any)?.values || [],
      interests: (userAgent.personality_traits as any)?.interests || [],
      communicationStyle: (userAgent.personality_traits as any)?.communicationStyle || 'Warm and thoughtful'
    }

    for (const candidate of compatibleCandidates.slice(0, candidateCount)) {
      const candidateAgent = (candidate.cyraino_agents as any)?.[0]
      if (!candidateAgent) continue

      const candidateAgentProfile: AgentProfile = {
        name: candidateAgent.name,
        persona: (candidateAgent.personality_traits as any)?.persona || 'A thoughtful person seeking meaningful connections',
        values: (candidateAgent.personality_traits as any)?.values || [],
        interests: (candidateAgent.personality_traits as any)?.interests || [],
        communicationStyle: (candidateAgent.personality_traits as any)?.communicationStyle || 'Warm and thoughtful'
      }

      // Run agent dialogue with connection type context
      const conversation = await simulateAgentDialogue(
        userAgentProfile, 
        candidateAgentProfile,
        connectionType || undefined
      )
      
      if ('error' in conversation) {
        console.error('Error in agent dialogue:', conversation.error)
        continue
      }

      // Store agent conversation
      const { data: agentConv } = await supabase
        .from('agent_conversations')
        .insert({
          vibe_check_id: vibeCheck.id,
          agent_1_id: userAgent.id,
          agent_2_id: candidateAgent.id,
          user_1_id: userId,
          user_2_id: candidate.id,
          conversation_exchanges: [{ transcript: conversation.transcript }],
          exchange_count: 1,
          compatibility_score: conversation.compatibilityScore,
          match_decision: conversation.matchDecision.toLowerCase() as 'yes' | 'no' | 'maybe',
          narrative_excerpt: conversation.narrative,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .select()
        .single()

      // If match decision is YES, create discovery
      if (conversation.matchDecision === 'YES' && conversation.narrative) {
        const { data: discovery } = await supabase
          .from('discoveries')
          .insert({
            vibe_check_id: vibeCheck.id,
            agent_conversation_id: agentConv?.id,
            discoverer_user_id: userId,
            discovered_user_id: candidate.id,
            narrative_excerpt: conversation.narrative,
            compatibility_highlights: {
              score: conversation.compatibilityScore,
              sharedValues: userAgentProfile.values.filter(v => 
                candidateAgentProfile.values.includes(v)
              ),
              summary: conversation.summary
            },
            status: 'new',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single()

        if (discovery) {
          discoveries.push(discovery)
        }
      }
    }

    // 7. Update vibe check status
    const refundPercentage = discoveries.length === 0 ? 100 : 0
    const tokensRefunded = discoveries.length === 0 ? tokensNeeded : 0

    if (tokensRefunded > 0) {
      await supabase
        .from('token_balances')
        .update({ balance: (tokenBalance?.balance || 0) })
        .eq('user_id', userId)

      await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'refund',
          amount: tokensRefunded,
          balance_after: (tokenBalance?.balance || 0),
          context_type: 'vibe_check',
          context_id: vibeCheck.id,
          description: 'Vibe check refund - no discoveries'
        })
    }

    await supabase
      .from('vibe_checks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        discoveries_count: discoveries.length,
        tokens_refunded: tokensRefunded,
        refund_percentage: refundPercentage
      })
      .eq('id', vibeCheck.id)

    return {
      success: true,
      vibeCheckId: vibeCheck.id,
      discoveries,
      message: discoveries.length > 0
        ? `Found ${discoveries.length} potential connection${discoveries.length > 1 ? 's' : ''}!`
        : 'No matches found this time, but your tokens were refunded.'
    }
  } catch (error) {
    console.error('Error running vibe check:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}


