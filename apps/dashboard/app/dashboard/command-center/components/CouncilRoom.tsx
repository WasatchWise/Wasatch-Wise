'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Win95Window, Win95Panel, Win95Button } from './Win95Window';

interface Council {
  id: string;
  name: string;
  description: string;
  icon: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
  }>;
}

interface CouncilMessage {
  agentId: string;
  agentName: string;
  content: string;
  timestamp: Date;
  isUser?: boolean;
}

interface CouncilRoomProps {
  isOpen: boolean;
  onClose: () => void;
  councilId: string | null;
}

// Available councils
const COUNCILS: Record<string, Council> = {
  'c001-0001-0001-0001-000000000001': {
    id: 'c001-0001-0001-0001-000000000001',
    name: 'Executive Council',
    description: 'Strategic leadership and major decisions',
    icon: '🏛️',
    members: [
      { id: 'A001', name: 'The Mayor', role: 'CEO & Founder', avatar: '👔' },
      { id: 'A002', name: 'CFO', role: 'Chief Financial Officer', avatar: '📊' },
      { id: 'A010', name: 'City Planner', role: 'Growth Strategy', avatar: '📐' },
    ],
  },
  'c001-0001-0001-0001-000000000002': {
    id: 'c001-0001-0001-0001-000000000002',
    name: 'Content Council',
    description: 'Content strategy across all platforms',
    icon: '📝',
    members: [
      { id: 'A003', name: 'Park Director', role: 'SLC Trips', avatar: '🎢' },
      { id: 'A004', name: 'Concert Manager', role: 'Rock Salt', avatar: '🎸' },
      { id: 'A005', name: 'The Dean', role: 'Adult AI Academy', avatar: '🎓' },
    ],
  },
  'c001-0001-0001-0001-000000000003': {
    id: 'c001-0001-0001-0001-000000000003',
    name: 'Finance Council',
    description: 'Financial health and planning',
    icon: '💰',
    members: [
      { id: 'A002', name: 'CFO', role: 'Chief Financial Officer', avatar: '📊' },
      { id: 'A008', name: 'Bank Manager', role: 'Treasury Operations', avatar: '🏦' },
    ],
  },
  'c001-0001-0001-0001-000000000004': {
    id: 'c001-0001-0001-0001-000000000004',
    name: 'Compliance Council',
    description: 'Privacy, documentation, and standards',
    icon: '📋',
    members: [
      { id: 'A007', name: 'Superintendent', role: 'Privacy Lead', avatar: '📚' },
      { id: 'A009', name: 'Librarian', role: 'Knowledge', avatar: '📖' },
    ],
  },
};

export default function CouncilRoom({ isOpen, onClose, councilId }: CouncilRoomProps) {
  const [messages, setMessages] = useState<CouncilMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const council = councilId ? COUNCILS[councilId] : null;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setConversationId(null);
    }
  }, [isOpen]);

  // Add welcome message when opening
  useEffect(() => {
    if (isOpen && council && messages.length === 0) {
      setMessages([
        {
          agentId: 'system',
          agentName: 'Council Room',
          content: `Welcome to the ${council.name}. ${council.description}. All members are present and ready to discuss.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, council, messages.length]);

  async function sendMessage() {
    if (!input.trim() || !council || isLoading) return;

    const userMessage: CouncilMessage = {
      agentId: 'user',
      agentName: 'You',
      content: input.trim(),
      timestamp: new Date(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          councilId: council.id,
          message: input.trim(),
          conversationId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setConversationId(data.conversationId);

      // Add each agent's response
      for (const agentResponse of data.responses) {
        setMessages((prev) => [
          ...prev,
          {
            agentId: agentResponse.agentId,
            agentName: agentResponse.agentName,
            content: agentResponse.response,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Council chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          agentId: 'system',
          agentName: 'System',
          content: 'There was an error communicating with the council. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!isOpen || !council) return null;

  return (
    <Win95Window
      title={`${council.icon} ${council.name}`}
      onClose={onClose}
      className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-[600px]"
    >
      <div className="flex flex-col gap-2 p-2">
        {/* Council Header */}
        <div className="flex gap-3 items-center border-b border-gray-400 pb-2">
          <div className="flex-1">
            <div className="font-bold text-sm">{council.name}</div>
            <div className="text-[10px] text-gray-600">{council.description}</div>
          </div>
        </div>

        {/* Members Bar */}
        <div className="flex gap-2 items-center py-1 px-2 bg-gray-200 border border-gray-400">
          <span className="text-[10px] text-gray-600">Present:</span>
          {council.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-1 bg-white px-2 py-1 border border-gray-300"
              title={`${member.name} - ${member.role}`}
            >
              <span>{member.avatar}</span>
              <span className="text-[10px]">{member.name}</span>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          ))}
        </div>

        {/* Messages */}
        <Win95Panel className="h-72 overflow-y-auto bg-white">
          <div className="space-y-3 p-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${msg.isUser ? 'ml-8' : 'mr-8'}`}
              >
                <div
                  className={`p-2 text-[11px] ${
                    msg.isUser
                      ? 'bg-blue-100 border border-blue-300'
                      : msg.agentId === 'system'
                      ? 'bg-gray-100 border border-gray-300 italic text-center'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  {msg.agentId !== 'system' && (
                    <div className="font-bold text-[10px] mb-1 flex items-center gap-1">
                      {!msg.isUser && (
                        <span className="bg-blue-500 text-white text-[8px] px-1 rounded">
                          {msg.agentName}
                        </span>
                      )}
                      {msg.isUser && <span className="text-blue-600">You</span>}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-[10px] text-gray-500">
                <span className="animate-pulse">Council members are deliberating...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Win95Panel>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Address the council..."
            disabled={isLoading}
            className="flex-1 border-2 border-gray-600 border-b-white border-r-white bg-white p-1 text-xs focus:outline-none"
          />
          <Win95Button onClick={sendMessage} className={isLoading ? 'opacity-50' : ''}>
            Speak
          </Win95Button>
        </div>

        {/* Quick Topics */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setInput("What's the current state of the city?")}
            className="text-[9px] bg-gray-200 px-2 py-1 border border-gray-400 hover:bg-gray-300"
          >
            🏙️ City Status
          </button>
          <button
            onClick={() => setInput('What should be our top priority this week?')}
            className="text-[9px] bg-gray-200 px-2 py-1 border border-gray-400 hover:bg-gray-300"
          >
            🎯 Priorities
          </button>
          <button
            onClick={() => setInput('Are there any concerns or risks I should know about?')}
            className="text-[9px] bg-gray-200 px-2 py-1 border border-gray-400 hover:bg-gray-300"
          >
            ⚠️ Risks
          </button>
          <button
            onClick={() => setInput('What opportunities are you seeing?')}
            className="text-[9px] bg-gray-200 px-2 py-1 border border-gray-400 hover:bg-gray-300"
          >
            ✨ Opportunities
          </button>
        </div>
      </div>
    </Win95Window>
  );
}

// Export council list for the menu
export const COUNCIL_LIST = Object.values(COUNCILS);
