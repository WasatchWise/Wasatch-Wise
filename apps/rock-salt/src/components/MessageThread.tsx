'use client'

import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '@/app/actions/messages'
import Link from 'next/link'

interface Message {
  id: string
  content: string
  sender_type: 'band' | 'venue'
  sender_user_id: string
  created_at: string
  read_at: string | null
}

interface ConversationInfo {
  id: string
  band: { id: string; name: string; slug: string; imageUrl: string | null }
  venue: { id: string; name: string; slug: string; imageUrl: string | null }
  myType: 'band' | 'venue'
}

interface MessageThreadProps {
  messages: Message[]
  conversation: ConversationInfo
}

export default function MessageThread({ messages, conversation }: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localMessages, setLocalMessages] = useState(messages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const otherParty = conversation.myType === 'band' ? conversation.venue : conversation.band
  const otherType = conversation.myType === 'band' ? 'venue' : 'band'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    setError(null)

    // Optimistically add message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      sender_type: conversation.myType,
      sender_user_id: 'temp',
      created_at: new Date().toISOString(),
      read_at: null
    }
    setLocalMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')

    const result = await sendMessage(conversation.id, newMessage.trim())

    if (!result.success) {
      setError(result.error || 'Failed to send message')
      // Remove optimistic message on error
      setLocalMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
      setNewMessage(optimisticMessage.content)
    }

    setSending(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {otherParty.imageUrl ? (
          <img
            src={otherParty.imageUrl}
            alt={otherParty.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            otherType === 'venue'
              ? 'bg-amber-100 dark:bg-amber-900'
              : 'bg-indigo-100 dark:bg-indigo-900'
          }`}>
            <span className={`font-bold ${
              otherType === 'venue'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-indigo-600 dark:text-indigo-400'
            }`}>
              {otherParty.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <Link
            href={`/${otherType === 'venue' ? 'venues' : 'bands'}/${otherParty.slug}`}
            className="font-semibold text-gray-900 dark:text-white hover:underline"
          >
            {otherParty.name}
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {otherType === 'venue' ? 'Venue' : 'Band'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {localMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          localMessages.map((message) => {
            const isMe = message.sender_type === conversation.myType
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isMe ? 'text-indigo-200' : 'text-gray-400'
                  }`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {error && (
          <div className="mb-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
