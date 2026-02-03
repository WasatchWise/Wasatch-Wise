import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface AgentMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: {
    traits: string[];
    voice: string;
    tone: string;
    quirks: string[];
  };
  data_scope: string[];
  system_prompt: string;
  building_id: string;
}

export interface AgentContext {
  metrics: Record<string, number | string>;
  recentActivity?: string[];
}

/**
 * Load an agent from the database
 */
export async function loadAgent(agentId: string): Promise<Agent | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();

  if (error || !data) {
    logger.error('Failed to load agent', error, { agentId });
    return null;
  }

  return data as Agent;
}

/**
 * Load metrics for an agent's data scope
 */
export async function loadAgentContext(agent: Agent): Promise<AgentContext> {
  const supabase = await createClient();

  // Get recent metrics for the agent's building
  const { data: metrics } = await supabase
    .from('city_metrics')
    .select('metric_name, metric_value, metric_unit, source')
    .eq('building_id', agent.building_id)
    .order('recorded_at', { ascending: false })
    .limit(20);

  // Format metrics into a readable object
  const formattedMetrics: Record<string, number | string> = {};
  if (metrics) {
    for (const m of metrics) {
      const key = m.metric_name;
      if (!(key in formattedMetrics)) {
        formattedMetrics[key] = m.metric_unit === 'currency'
          ? `$${m.metric_value.toLocaleString()}`
          : m.metric_value;
      }
    }
  }

  // If agent has 'all' scope, get metrics from all buildings
  if (agent.data_scope.includes('all')) {
    const { data: allMetrics } = await supabase
      .from('city_metrics')
      .select('building_id, metric_name, metric_value, metric_unit')
      .order('recorded_at', { ascending: false })
      .limit(50);

    if (allMetrics) {
      for (const m of allMetrics) {
        const key = `${m.building_id}_${m.metric_name}`;
        if (!(key in formattedMetrics)) {
          formattedMetrics[key] = m.metric_unit === 'currency'
            ? `$${m.metric_value.toLocaleString()}`
            : m.metric_value;
        }
      }
    }
  }

  return { metrics: formattedMetrics };
}

/**
 * Build the full system prompt for an agent with context
 */
function buildSystemPrompt(agent: Agent, context: AgentContext): string {
  const metricsSection = Object.entries(context.metrics)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  return `${agent.system_prompt}

CURRENT METRICS:
${metricsSection || 'No metrics available yet.'}

Remember to stay in character as ${agent.name}, the ${agent.role}.
Use your ${agent.personality.tone} tone and incorporate your quirks naturally.`;
}

/**
 * Chat with an agent using Gemini
 */
export async function chatWithAgent(
  agentId: string,
  messages: AgentMessage[],
  options: {
    conversationId?: string;
    userId?: string;
  } = {}
): Promise<{ response: string; conversationId: string }> {
  const supabase = await createClient();

  // Load agent
  const agent = await loadAgent(agentId);
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }

  // Load context (metrics for their data scope)
  const context = await loadAgentContext(agent);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(agent, context);

  // Get or create conversation
  let conversationId = options.conversationId;
  if (!conversationId) {
    const { data: conv } = await supabase
      .from('agent_conversations')
      .insert({
        agent_id: agentId,
        user_id: options.userId,
        context: context.metrics,
      })
      .select('id')
      .single();
    conversationId = conv?.id;
  }

  // Store user message
  const lastUserMessage = messages[messages.length - 1];
  if (lastUserMessage && conversationId) {
    await supabase.from('agent_messages').insert({
      conversation_id: conversationId,
      agent_id: agentId,
      role: 'user',
      content: lastUserMessage.content,
    });
  }

  try {
    // Call Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastUserMessage.content);
    const response = result.response.text();

    // Store agent response
    if (conversationId) {
      await supabase.from('agent_messages').insert({
        conversation_id: conversationId,
        agent_id: agentId,
        role: 'agent',
        content: response,
      });
    }

    return {
      response,
      conversationId: conversationId || '',
    };
  } catch (error) {
    logger.error('Agent chat error', error, { agentId });
    throw error;
  }
}

/**
 * Chat with a council (multiple agents)
 */
export async function chatWithCouncil(
  councilId: string,
  message: string,
  options: {
    conversationId?: string;
    userId?: string;
  } = {}
): Promise<{ responses: Array<{ agentId: string; agentName: string; response: string }>; conversationId: string }> {
  const supabase = await createClient();

  // Load council
  const { data: council } = await supabase
    .from('councils')
    .select('*')
    .eq('id', councilId)
    .single();

  if (!council) {
    throw new Error(`Council ${councilId} not found`);
  }

  // Get or create conversation
  let conversationId = options.conversationId;
  if (!conversationId) {
    const { data: conv } = await supabase
      .from('agent_conversations')
      .insert({
        council_id: councilId,
        user_id: options.userId,
      })
      .select('id')
      .single();
    conversationId = conv?.id;
  }

  // Store user message
  if (conversationId) {
    await supabase.from('agent_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    });
  }

  // Get responses from each agent based on orchestration mode
  const responses: Array<{ agentId: string; agentName: string; response: string }> = [];

  for (const agentId of council.member_agent_ids) {
    const agent = await loadAgent(agentId);
    if (!agent) continue;

    const context = await loadAgentContext(agent);
    const systemPrompt = buildSystemPrompt(agent, context);

    // Add council context to system prompt
    const councilContext = `
You are participating in a ${council.name} meeting with other agents.
Previous responses from other council members:
${responses.map(r => `${r.agentName}: ${r.response}`).join('\n\n')}

Respond to the user's question from your perspective as ${agent.name}.
Build on or respectfully disagree with previous responses if relevant.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt + councilContext,
    });

    const result = await model.generateContent(message);
    const response = result.response.text();

    responses.push({
      agentId: agent.id,
      agentName: agent.name,
      response,
    });

    // Store agent response
    if (conversationId) {
      await supabase.from('agent_messages').insert({
        conversation_id: conversationId,
        agent_id: agentId,
        role: 'agent',
        content: response,
      });
    }
  }

  return {
    responses,
    conversationId: conversationId || '',
  };
}
