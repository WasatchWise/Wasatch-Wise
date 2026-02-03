'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Win95Window, Win95Panel, Win95Button } from './Win95Window';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  personality: {
    traits: string[];
    voice: string;
    tone: string;
    quirks: string[];
  };
  building_id: string;
}

interface AgentChatProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string | null;
  agentName?: string;
  agentRole?: string;
  agentAvatar?: string;
}

export default function AgentChat({
  isOpen,
  onClose,
  agentId,
  agentName,
  agentRole,
  agentAvatar = '🤖',
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load agent info on mount
  useEffect(() => {
    if (agentId && isOpen) {
      fetch(`/api/agent/chat?agentId=${agentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setAgent(data);
            // Add greeting message
            setMessages([
              {
                role: 'agent',
                content: getGreeting(data),
                timestamp: new Date(),
              },
            ]);
          }
        })
        .catch(console.error);
    }
  }, [agentId, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setConversationId(null);
      setAgent(null);
    }
  }, [isOpen]);

  function getGreeting(agent: Agent): string {
    const greetings: Record<string, string> = {
      A001: "Good to see you, Mayor John. I've been reviewing the city's status. What would you like to discuss?",
      A002: "Hello. I've got the numbers ready. Treasury is stable. What financial matters can I help you with?",
      A003: "Hey! Perfect timing. I was just looking at the latest engagement numbers. What's on your mind?",
      A004: "What's up? The scene's been buzzing lately. Got some interesting things happening in the venues.",
      A005: "Welcome! I've been reviewing our enrollment figures. How can I help with the Academy today?",
      A006: "Hello there. The park's been peaceful today. What brings you by?",
      A007: "Good day. I've been monitoring our compliance status. What can I clarify for you?",
      A008: "Welcome to the Bank. All accounts are balanced and secure. How may I assist you?",
      A009: "Ah, a visitor! I've catalogued some interesting findings recently. What knowledge are you seeking?",
      A010: "Greetings. I've been mapping out some expansion possibilities. Shall we discuss the city's future?",
    };
    return greetings[agent.id] || `Hello! I'm ${agent.name}, the ${agent.role}. How can I help you today?`;
  }

  async function sendMessage() {
    if (!input.trim() || !agentId || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content,
          })),
          conversationId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: "I apologize, but I'm having trouble connecting right now. Please try again.",
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

  if (!isOpen || !agentId) return null;

  const displayName = agent?.name || agentName || 'Agent';
  const displayRole = agent?.role || agentRole || '';

  return (
    <Win95Window
      title={`Chat: ${displayName}`}
      onClose={onClose}
      className="fixed top-20 right-20 z-50 w-96"
    >
      <div className="flex flex-col gap-2 p-2">
        {/* Agent Header */}
        <div className="flex gap-3 items-center border-b border-gray-400 pb-2">
          <Win95Panel className="w-12 h-12 flex items-center justify-center bg-gray-200">
            <span className="text-xl">{agentAvatar}</span>
          </Win95Panel>
          <div>
            <div className="font-bold text-sm">{displayName}</div>
            <div className="text-[10px] text-gray-600">{displayRole}</div>
            {agent?.personality && (
              <div className="text-[9px] text-gray-500 italic">
                {agent.personality.tone}
              </div>
            )}
          </div>
          <div className="ml-auto">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              }`}
            />
          </div>
        </div>

        {/* Messages */}
        <Win95Panel className="h-64 overflow-y-auto bg-white">
          <div className="space-y-2 p-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 text-[11px] ${
                    msg.role === 'user'
                      ? 'bg-blue-100 border border-blue-300'
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className="font-bold text-[9px] mb-1 text-gray-500">
                    {msg.role === 'user' ? 'You' : displayName}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border border-gray-300 p-2 text-[11px]">
                  <span className="animate-pulse">●●●</span>
                </div>
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
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 border-2 border-gray-600 border-b-white border-r-white bg-white p-1 text-xs focus:outline-none"
          />
          <Win95Button onClick={sendMessage} className={isLoading ? 'opacity-50' : ''}>
            Send
          </Win95Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setInput('Give me a briefing')}
            className="text-[9px] bg-gray-200 px-2 py-1 border border-gray-400 hover:bg-gray-300"
          >
            📋 Briefing
          </button>
          <button
            onClick={() => setInput("What needs my attention?")}
            className="text-[9px] bg-gray-200 px-2 py-1 border border-gray-400 hover:bg-gray-300"
          >
            ⚠️ Alerts
          </button>
          <button
            onClick={() => setInput('Show me the key metrics')}
            className="text-[9px] bg-gray-200 px-2 py-1 border border-gray-400 hover:bg-gray-300"
          >
            📊 Metrics
          </button>
        </div>
      </div>
    </Win95Window>
  );
}
