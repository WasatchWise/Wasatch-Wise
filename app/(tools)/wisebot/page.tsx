'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/shared/Button';
import { Form, Input } from '@/components/shared/Form';
import { BookOpen, ExternalLink } from 'lucide-react';

// Set page title for accessibility
if (typeof document !== 'undefined') {
  document.title = 'WiseBot - AI Governance Assistant | WasatchWise';
}

interface Citation {
  number: number;
  title: string;
  author?: string;
  type: string;
  url?: string;
  summary?: string;
  topics?: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

const EXAMPLE_PROMPTS = [
  'How do we close the shadow AI policy gap?',
  'What does training beyond prompting look like?',
  'How do we evaluate bias in AI tools?',
  'How do we address teacher skepticism and verification burden?',
];

export default function WiseBotPage() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, streamingContent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Escape to close command palette
      if (e.key === 'Escape' && showCommandPalette) {
        setShowCommandPalette(false);
      }
      // Focus input on '/' key
      if (
        e.key === '/' &&
        !showCommandPalette &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent, overrideMessage?: string) => {
    e.preventDefault();
    const messageToSend = overrideMessage || message;
    if (!messageToSend.trim() || isStreaming) return;

    const userMessage = messageToSend;
    if (!overrideMessage) {
      setMessage('');
    }
    setIsStreaming(true);
    setError(null);
    setStreamingContent('');

    // Add user message to conversation
    setConversation((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Use new WiseBot API with citation support
      const response = await fetch('/api/wisebot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to get response: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response isn't JSON, use status text
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const fullResponse = data.response || '';
      const citations = data.citations || [];

      // Add complete response to conversation with citations
      setConversation((prev) => [...prev, { 
        role: 'assistant', 
        content: fullResponse,
        citations: citations.length > 0 ? citations : undefined
      }]);
      setStreamingContent('');

      // Convert to voice
      try {
        const voiceRes = await fetch('/api/voice/elevenlabs-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: fullResponse }),
        });

        if (voiceRes.ok) {
          const audioBlob = await voiceRes.blob();
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          // Auto-play audio
          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.play().catch((err) => {
              console.error('Audio play failed:', err);
            });
          }
        }
      } catch (voiceError) {
        console.error('Voice generation failed:', voiceError);
        // Continue without voice
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [conversation, isStreaming, message]);

  const handleRetry = useCallback(() => {
    if (conversation.length > 0) {
      const lastUserMessage = [...conversation].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        setRetryCount(prev => prev + 1);
        setError(null);
        handleSubmit(new Event('submit') as any, lastUserMessage.content);
      }
    }
  }, [conversation, handleSubmit]);

  const handleExamplePrompt = (prompt: string) => {
    setMessage(prompt);
    inputRef.current?.focus();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-8 sm:py-12" role="main">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-3 sm:mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-orange-50 flex items-center justify-center">
            <Image
              src="/wisebot.png"
              alt="WiseBot icon"
              width={48}
              height={48}
              className="h-10 w-10 sm:h-12 sm:w-12"
              priority
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 leading-tight">
            WiseBot (AI Assistant)
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Your AI governance and training consultant. Ask about policy gaps,
            shadow AI, evaluation, bias, and assessment redesign.
          </p>
          <div className="mt-2 text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-1">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Powered by 226+ expert sources with citations</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Press <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 rounded text-xs">⌘K</kbd> for commands, <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 rounded text-xs">/</kbd> to focus input
          </p>
        </header>

        {/* Command Palette */}
        {showCommandPalette && (
          <div 
            className="fixed inset-0 bg-black/20 z-50 flex items-start justify-center pt-32"
            onClick={() => setShowCommandPalette(false)}
            role="dialog"
            aria-label="Command palette"
            data-command-palette
          >
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <input
                  type="text"
                  placeholder="Type a command..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowCommandPalette(false);
                    }
                  }}
                />
              </div>
              <div className="p-2">
                <div className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                  <div className="font-medium">New Conversation</div>
                  <div className="text-sm text-gray-500">Start a fresh conversation</div>
                </div>
                <div className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                  <div className="font-medium">Export Conversation</div>
                  <div className="text-sm text-gray-500">Download as text file</div>
                </div>
                <div className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                  <div className="font-medium">Clear History</div>
                  <div className="text-sm text-gray-500">Remove all messages</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Example Prompts */}
          {conversation.length === 0 && (
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExamplePrompt(prompt)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                    type="button"
                    aria-label={`Example prompt: ${prompt}`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div 
            className="h-80 sm:h-96 overflow-y-auto mb-3 sm:mb-4 space-y-3 sm:space-y-4"
            role="log"
            aria-label="Conversation"
            aria-live="polite"
          >
            {conversation.length === 0 && !isStreaming ? (
              <div className="text-center text-gray-500 py-8 sm:py-12">
                <p className="text-base sm:text-lg mb-2">👋 Hi! I'm WiseBot.</p>
                <p className="text-sm sm:text-base">
                  Ask me about governance, teacher training beyond prompts, or how to close
                  the optimism gap.
                </p>
              </div>
            ) : (
              <>
                {conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    data-message={msg.role}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                      role={msg.role === 'user' ? 'user-message' : 'assistant-message'}
                    >
                      <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 max-w-[85%] sm:max-w-[80%] bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
                        <div className="text-xs font-semibold text-orange-700 mb-1.5 sm:mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" aria-hidden="true" />
                          <span>SOURCES CITED:</span>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          {msg.citations.map((citation) => (
                            <div
                              key={citation.number}
                              className="text-xs bg-white rounded p-1.5 sm:p-2 border border-orange-100"
                            >
                              <div className="font-semibold text-orange-600">
                                [Source {citation.number}] {citation.title}
                              </div>
                              {citation.author && (
                                <div className="text-gray-600 mt-0.5 text-[11px]">By: {citation.author}</div>
                              )}
                              {citation.summary && (
                                <div className="text-gray-500 italic mt-1 text-[10px] leading-relaxed">
                                  {citation.summary.substring(0, 100)}...
                                </div>
                              )}
                              {citation.url && (
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-500 hover:underline flex items-center gap-1 mt-1"
                                  aria-label={`View source ${citation.number}: ${citation.title}`}
                                >
                                  <span>View source</span> <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Streaming response */}
                {isStreaming && streamingContent && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 sm:p-4 max-w-[85%] sm:max-w-[80%]">
                      <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{streamingContent}</p>
                      <span className="inline-block w-2 h-4 bg-orange-500 ml-1 animate-pulse" aria-hidden="true" aria-label="Streaming" />
                    </div>
                  </div>
                )}
                {/* Loading indicator (non-blocking) */}
                {isStreaming && !streamingContent && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                      <p className="text-sm sm:text-base text-gray-500">WiseBot is thinking...</p>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error with retry */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 mb-2">{error}</p>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                type="button"
              >
                Retry ({retryCount > 0 && `${retryCount} `}attempts)
              </Button>
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about shadow AI, training gaps, or policy..."
                className="flex-1 text-sm sm:text-base"
                disabled={isStreaming}
                aria-label="WiseBot input"
                aria-describedby="wisebot-input-help"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isStreaming || !message.trim()}
                aria-label="Send message"
                className="text-sm sm:text-base px-4 sm:px-6"
              >
                {isStreaming ? 'Sending...' : 'Send'}
              </Button>
            </div>
            <p id="wisebot-input-help" className="sr-only">
              Type your question and press Enter or click Send to get an AI-powered response with citations
            </p>
          </Form>

          {audioUrl && (
            <div className="mt-4">
              <audio 
                ref={audioRef} 
                controls 
                className="w-full" 
                autoPlay
                aria-label="Audio response"
                onPlay={() => {
                  // Ensure audio plays automatically
                  if (audioRef.current) {
                    audioRef.current.play().catch(() => {
                      // Auto-play may be blocked, user can click play
                    });
                  }
                }}
              />
            </div>
          )}
        </div>

        <footer className="text-center">
          <Button href="/contact" variant="outline">
            Want to talk to a human? Contact Us
          </Button>
        </footer>
      </div>
    </main>
  );
}
