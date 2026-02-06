'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Destination } from '@/types/database.types';

interface Message {
  id: string;
  role: 'user' | 'dan';
  content: string;
  timestamp: Date;
  ctaUrl?: string;
  ctaLabel?: string;
}

interface DanConciergeProps {
  /** TripKit code; use "site" for global/main-page chat (no TripKit context) */
  tripkitCode?: string;
  /** Display name for context; e.g. "SLCTrips" for site mode */
  tripkitName?: string;
  /** Destinations for TripKit-specific search; empty for site mode */
  destinations?: Destination[];
  isOpen?: boolean;
  onToggle?: () => void;
}

// TripKit-specific quick prompts
const TRIPKIT_PROMPTS: Record<string, Array<{ icon: string; text: string; prompt: string }>> = {
  // Ski Utah TripKit
  'TK-002': [
    { icon: '⛷️', text: 'Ski conditions', prompt: "What are the ski conditions like today? Which resort should I hit?" },
    { icon: '🚗', text: 'Canyon traffic', prompt: "How's the canyon traffic right now? Should I take the bus?" },
    { icon: '🌤️', text: 'Mountain weather', prompt: "What's the weather like at the ski resorts today?" },
    { icon: '🍽️', text: 'Après ski spots', prompt: "Where should I go for après ski food and drinks?" },
  ],
  // 250 Under $25 Budget TripKit
  'TK-045': [
    { icon: '💰', text: 'Free activities', prompt: "What are the best free things to do in my TripKit today?" },
    { icon: '🥾', text: 'Free hikes', prompt: "What's a good free hike I can do today?" },
    { icon: '🌤️', text: 'Weather check', prompt: "What's the weather like? Is it good for outdoor activities?" },
    { icon: '🎉', text: 'Free events', prompt: "Are there any free events happening today?" },
  ],
  // Foodie's Paradise
  'TK-024': [
    { icon: '🍽️', text: 'Best restaurants', prompt: "What are the must-try restaurants in my TripKit?" },
    { icon: '🍺', text: 'Local breweries', prompt: "What local breweries should I check out?" },
    { icon: '☕', text: 'Coffee spots', prompt: "Where's the best coffee in Salt Lake City?" },
    { icon: '🎉', text: 'Food events', prompt: "Are there any food festivals or events happening?" },
  ],
  // Family Fun
  'TK-005': [
    { icon: '👨‍👩‍👧‍👦', text: 'Kid-friendly', prompt: "What are the best kid-friendly activities in my TripKit?" },
    { icon: '🎢', text: 'Fun attractions', prompt: "What family attractions should we visit today?" },
    { icon: '🌤️', text: 'Weather check', prompt: "What's the weather like? Good for outdoor family activities?" },
    { icon: '🍽️', text: 'Family dining', prompt: "Where are good places to eat with kids?" },
  ],
  // Default prompts for any TripKit
  default: [
    { icon: '🌤️', text: "What's the weather?", prompt: "What's the weather like right now in Salt Lake City?" },
    { icon: '🔍', text: 'Recommend something', prompt: "What do you recommend I do today from my TripKit?" },
    { icon: '🎉', text: "What's happening", prompt: "What's happening in Salt Lake City today?" },
    { icon: '🍽️', text: 'Food nearby', prompt: "What are the best food spots in my TripKit?" },
  ],
};

function getQuickPrompts(tripkitCode: string) {
  return TRIPKIT_PROMPTS[tripkitCode] || TRIPKIT_PROMPTS.default;
}

// Free-tier limit for site-wide Dan: N user messages per day (TripKit owners get unlimited in-context)
const FREE_TIER_DAILY_LIMIT = 5;
const SITE_COUNT_KEY_PREFIX = 'dan-site-count-';

function getSiteModeMessageCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(SITE_COUNT_KEY_PREFIX + today);
    return raw ? Math.max(0, parseInt(raw, 10)) : 0;
  } catch {
    return 0;
  }
}

function incrementSiteModeMessageCount(): void {
  if (typeof window === 'undefined') return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = SITE_COUNT_KEY_PREFIX + today;
    const next = getSiteModeMessageCount() + 1;
    localStorage.setItem(key, String(next));
  } catch {
    // Ignore
  }
}

export default function DanConcierge({
  tripkitCode = 'site',
  tripkitName = 'SLCTrips',
  destinations = [],
  isOpen: controlledIsOpen,
  onToggle,
}: DanConciergeProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Storage key for this TripKit's chat history
  const storageKey = `dan-chat-${tripkitCode}`;

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const restored = parsed.map((m: Message & { timestamp: string }) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(restored);
        if (restored.length > 0) {
          setHasGreeted(true);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    setHydrated(true);
  }, [storageKey]);

  // Save chat history to localStorage when messages change
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (messages.length > 0) {
        // Only keep last 50 messages to avoid storage limits
        const toSave = messages.slice(-50);
        localStorage.setItem(storageKey, JSON.stringify(toSave));
      }
    } catch {
      // Ignore localStorage errors (quota exceeded, etc.)
    }
  }, [messages, storageKey, hydrated]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup any pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Cancel pending requests when chat is closed
  useEffect(() => {
    if (!isOpen && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initial greeting when first opened (wait for hydration to avoid duplicate greetings)
  useEffect(() => {
    if (hydrated && isOpen && !hasGreeted && messages.length === 0) {
      setHasGreeted(true);
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

      setMessages([{
        id: 'greeting',
        role: 'dan',
        content: tripkitCode === 'site'
          ? `${greeting}! I'm Dan, your Utah concierge. I can check weather, ski conditions, canyon traffic, find events, or help you explore. What would you like to know?`
          : `${greeting}! I'm Dan, your Utah concierge. I can check weather, ski conditions, canyon traffic, find events, or help you explore your ${tripkitName}. What would you like to know?`,
        timestamp: new Date(),
      }]);
    }
  }, [hydrated, isOpen, hasGreeted, messages.length, tripkitName, tripkitCode]);

  const toggleOpen = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const isSiteMode = tripkitCode === 'site';
    if (isSiteMode && getSiteModeMessageCount() >= FREE_TIER_DAILY_LIMIT) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      const upsellMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'dan',
        content: "You've used your free asks for today. Unlock unlimited Dan + curated TripKits for itineraries, guardian tips, and more.",
        timestamp: new Date(),
        ctaUrl: '/tripkits',
        ctaLabel: 'Browse TripKits',
      };
      setMessages(prev => [...prev, upsellMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    if (isSiteMode) incrementSiteModeMessageCount();
    setIsLoading(true);

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Set a 30-second timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    try {
      // Build conversation history (exclude greeting)
      const history = messages
        .filter(m => m.id !== 'greeting')
        .map(m => ({
          role: m.role === 'dan' ? 'assistant' : 'user',
          content: m.content,
        }));

      const response = await fetch('/api/dan/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          tripkitCode,
          tripkitName,
          tripkitDestinations: destinations,
          conversationHistory: history,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if request was aborted (user navigated away)
      if (controller.signal.aborted) {
        return;
      }

      const data = await response.json();

      const danMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'dan',
        content: data.success ? data.message : "Sorry, I'm having trouble right now. Try asking again!",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, danMessage]);
    } catch (error) {
      clearTimeout(timeoutId);

      // Don't show error if request was intentionally aborted (user navigated away)
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'dan',
        content: "Hmm, I'm having trouble connecting. Give me a second and try again!",
        timestamp: new Date(),
      }]);
    } finally {
      // Only update loading state if this is still the current request
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const clearChat = () => {
    setMessages([]);
    setHasGreeted(false);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-gray-800' : 'bg-gradient-to-br from-purple-600 to-indigo-700'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Ask Dan'}
      >
        {isOpen ? (
          <svg className="w-8 h-8 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/images/Favicons-Optimized/png/favicon_2-192x192.png"
              alt="Dan Concierge"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
              priority
            />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/Favicons-Optimized/png/favicon_2-192x192.png"
                alt="Dan Concierge"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-white">Ask Dan</h3>
              <p className="text-xs text-white/80">Your Utah Concierge</p>
            </div>
            <div className="flex items-center gap-2">
              {tripkitCode === 'site' && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {Math.max(0, FREE_TIER_DAILY_LIMIT - getSiteModeMessageCount())} free asks today
                </span>
              )}
              <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live
              </div>
              {messages.length > 1 && (
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Clear chat"
                  title="Clear chat history"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[400px]">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.role === 'dan' && message.ctaUrl && message.ctaLabel && (
                    <a
                      href={message.ctaUrl}
                      className="mt-2 inline-block text-sm font-semibold text-purple-600 hover:text-purple-700 underline"
                    >
                      {message.ctaLabel} →
                    </a>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {getQuickPrompts(tripkitCode).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt.prompt)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                  >
                    <span>{prompt.icon}</span>
                    <span>{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Dan anything..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/**
 * Minimal floating button version for pages where full chat isn't needed
 */
export function DanConciergeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full shadow-2xl hover:scale-105 transition-all"
    >
      <Image
        src="/images/Favicons-Optimized/png/favicon_2-192x192.png"
        alt="Dan Concierge"
        width={24}
        height={24}
        className="w-6 h-6 rounded-full object-cover"
        priority
      />
      <span className="font-semibold">Ask Dan</span>
      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
    </button>
  );
}
