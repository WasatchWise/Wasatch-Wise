import { NextRequest, NextResponse } from 'next/server';
import { chatWithAgent, chatWithCouncil, loadAgent, type AgentMessage } from '@/lib/ai/agent-chat';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agentId,
      councilId,
      messages,
      message,
      conversationId,
    } = body;

    // Council chat (multi-agent)
    if (councilId) {
      if (!message) {
        return NextResponse.json(
          { error: 'Message is required for council chat' },
          { status: 400 }
        );
      }

      const result = await chatWithCouncil(councilId, message, {
        conversationId,
      });

      return NextResponse.json({
        responses: result.responses,
        conversationId: result.conversationId,
      });
    }

    // Single agent chat
    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId or councilId is required' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      );
    }

    const result = await chatWithAgent(agentId, messages as AgentMessage[], {
      conversationId,
    });

    return NextResponse.json({
      response: result.response,
      conversationId: result.conversationId,
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to chat with agent' },
      { status: 500 }
    );
  }
}

// GET endpoint to load agent info
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json(
      { error: 'agentId is required' },
      { status: 400 }
    );
  }

  const agent = await loadAgent(agentId);
  if (!agent) {
    return NextResponse.json(
      { error: 'Agent not found' },
      { status: 404 }
    );
  }

  // Return public agent info (not the system prompt)
  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    personality: agent.personality,
    building_id: agent.building_id,
  });
}
