'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/shared/Button';
import { Form, Input } from '@/components/shared/Form';

// Set page title for accessibility
if (typeof document !== 'undefined') {
  document.title = 'WiseBot - AI Governance Assistant | WasatchWise';
}

const EXAMPLE_PROMPTS = [
  'How do we close the shadow AI policy gap?',
  'What does training beyond prompting look like?',
  'How do we evaluate bias in AI tools?',
  'How do we address teacher skepticism and verification burden?',
];

export default function WiseBotPage() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
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
      // Stream response from Claude
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversation,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullResponse += data.text;
                setStreamingContent(fullResponse);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add complete response to conversation
      setConversation((prev) => [...prev, { role: 'assistant', content: fullResponse }]);
      setStreamingContent('');

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
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12" role="main">
      <div className="max-w-4xl mx-auto px-6">
        <header className="text-center mb-8">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-orange-50 flex items-center justify-center">
            <Image
              src="/wisebot.png"
              alt="WiseBot icon"
              width={48}
              height={48}
              className="h-12 w-12"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            WiseBot (AI Assistant)
          </h1>
          <p className="text-gray-600">
            Your AI governance and training consultant. Ask about policy gaps,
            shadow AI, evaluation, bias, and assessment redesign.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">⌘K</kbd> for commands, <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">/</kbd> to focus input
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

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Example Prompts */}
          {conversation.length === 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExamplePrompt(prompt)}
                    className="px-4 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                    type="button"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div 
            className="h-96 overflow-y-auto mb-4 space-y-4"
            role="log"
            aria-label="Conversation"
          >
            {conversation.length === 0 && !isStreaming ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg mb-2">👋 Hi! I'm WiseBot.</p>
                <p>
                  Ask me about governance, teacher training beyond prompts, or how to close
                  the optimism gap.
                </p>
              </div>
            ) : (
              <>
                {conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-message={msg.role}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                      role={msg.role === 'user' ? 'user-message' : 'assistant-message'}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {/* Streaming response */}
                {isStreaming && streamingContent && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                      <p className="whitespace-pre-wrap">{streamingContent}</p>
                      <span className="inline-block w-2 h-4 bg-orange-500 ml-1 animate-pulse" aria-hidden="true" />
                    </div>
                  </div>
                )}
                {/* Loading indicator (non-blocking) */}
                {isStreaming && !streamingContent && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-gray-500">WiseBot is thinking...</p>
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
                className="flex-1"
                disabled={isStreaming}
                aria-label="WiseBot input"
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
              >
                {isStreaming ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </Form>

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
