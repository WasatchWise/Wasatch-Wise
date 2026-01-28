'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Send, Search, Loader2, Sparkles } from 'lucide-react'
import { ConciergeServiceModal } from '@/components/ConciergeServiceModal'

interface Conversation {
  id: string
  match_id: string
  user_1_id: string
  user_2_id: string
  last_message_at: string
  otherUser: {
    id: string
    pseudonym: string
  }
  lastMessage?: {
    content: string
    created_at: string
    sender_user_id: string
  }
  unreadCount: number
}

interface Message {
  id: string
  content: string
  sender_user_id: string
  recipient_user_id: string
  created_at: string
  is_read: boolean
}

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const client = useSupabaseClient()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showMessageCoaching, setShowMessageCoaching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!client) return

    const loadMessagesData = async () => {
      try {
        setLoading(true)
        
        const { data: { user } } = await client.auth.getUser()
        if (!user) {
          router.push('/')
          return
        }
        setCurrentUserId(user.id)

        // Check for match ID in URL
        const matchId = searchParams?.get('match')
        
        // Load conversations
        const { data: conversationsData, error: convError } = await client
          .from('conversations')
          .select(`
            id,
            match_id,
            user_1_id,
            user_2_id,
            last_message_at,
            matches!inner (
              user_1_id,
              user_2_id
            )
          `)
          .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
          .eq('is_active', true)
          .order('last_message_at', { ascending: false, nullsFirst: false })

        if (convError) throw convError

        if (conversationsData) {
          // Get other user details and last message for each conversation
          const conversationsWithDetails = await Promise.all(
            conversationsData.map(async (conv) => {
              const otherUserId = conv.user_1_id === user.id ? conv.user_2_id : conv.user_1_id
              
              const [userResult, lastMessageResult, unreadResult] = await Promise.all([
                client
                  .from('users')
                  .select('id, pseudonym')
                  .eq('id', otherUserId)
                  .single(),
                client
                  .from('messages')
                  .select('content, created_at, sender_user_id')
                  .eq('conversation_id', conv.id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single(),
                client
                  .from('messages')
                  .select('id', { count: 'exact', head: true })
                  .eq('conversation_id', conv.id)
                  .eq('recipient_user_id', user.id)
                  .eq('is_read', false)
              ])

              return {
                id: conv.id,
                match_id: conv.match_id,
                user_1_id: conv.user_1_id,
                user_2_id: conv.user_2_id,
                last_message_at: conv.last_message_at || conv.id,
                otherUser: {
                  id: userResult.data?.id || otherUserId,
                  pseudonym: userResult.data?.pseudonym || 'Anonymous'
                },
                lastMessage: lastMessageResult.data || undefined,
                unreadCount: unreadResult.count || 0
              }
            })
          )

          setConversations(conversationsWithDetails)
          
          // Find matching conversation if matchId provided
          if (matchId) {
            const matchingConv = conversationsWithDetails.find(c => c.match_id === matchId)
            if (matchingConv) {
              setSelectedConversation(matchingConv.id)
            }
          } else if (conversationsWithDetails.length > 0) {
            // Auto-select first conversation if none selected and matchId not provided
            setSelectedConversation(prev => prev || conversationsWithDetails[0].id)
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMessagesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, router, searchParams])

  useEffect(() => {
    if (!selectedConversation || !currentUserId || !client) return

    const loadMessages = async () => {
      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      if (data) {
        setMessages(data)
        
        // Mark messages as read
        const unreadMessages = data.filter(m => 
          m.recipient_user_id === currentUserId && !m.is_read
        )
        
        if (unreadMessages.length > 0) {
          await client
            .from('messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .in('id', unreadMessages.map(m => m.id))
        }
      }
    }

    loadMessages()

    // Subscribe to new messages
    const channel = client
      .channel(`conversation:${selectedConversation}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
        scrollToBottom()
      })
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [client, selectedConversation, currentUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation || !currentUserId || !client) return

    const conversation = conversations.find(c => c.id === selectedConversation)
    if (!conversation) return

    setSending(true)
    try {
      const recipientId = conversation.user_1_id === currentUserId 
        ? conversation.user_2_id 
        : conversation.user_1_id

      const { error } = await client
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_user_id: currentUserId,
          recipient_user_id: recipientId,
          content: message.trim(),
          message_type: 'text'
        })

      if (error) throw error

      // Update conversation last_message_at
      await client
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          last_message_from_user_id: currentUserId
        })
        .eq('id', selectedConversation)

      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe mb-20 md:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="h-full flex flex-col">
                <CardContent className="p-4 border-b border-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
                
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-slate-400">Loading...</div>
                  ) : conversations.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      <p className="mb-2">No conversations yet</p>
                      <p className="text-sm text-slate-500">Start a conversation from your matches!</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`
                          p-4 border-b border-slate-700 cursor-pointer transition-colors
                          ${selectedConversation === conv.id ? 'bg-purple-600/20' : 'hover:bg-slate-700/30'}
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                              <span className="text-sm font-bold">{conv.otherUser.pseudonym[0]?.toUpperCase() || '?'}</span>
                            </div>
                            <div>
                              <p className="font-medium">{conv.otherUser.pseudonym}</p>
                              <p className="text-xs text-slate-400">{formatTime(conv.last_message_at)}</p>
                            </div>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 ml-13">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                {selectedConversation && selectedConv ? (
                  <>
                    {/* Chat Header */}
                    <CardContent className="p-4 border-b border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                            <span className="text-sm font-bold">
                              {selectedConv.otherUser.pseudonym[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{selectedConv.otherUser.pseudonym}</p>
                            <p className="text-xs text-slate-400">Active</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    {/* Messages */}
                    <div 
                      ref={messagesContainerRef}
                      className="flex-1 overflow-y-auto p-4 space-y-4"
                    >
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isOwn = msg.sender_user_id === currentUserId
                          return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] rounded-lg p-3 ${
                                isOwn 
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                                  : 'bg-slate-700'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-slate-400'}`}>
                                  {formatTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          )
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <CardContent className="p-4 border-t border-slate-700">
                      <div className="flex items-center space-x-2 mb-2">
                        <button
                          onClick={() => setShowMessageCoaching(true)}
                          className="p-2 text-slate-400 hover:text-purple-400 transition-colors"
                          title="Get message coaching"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && message.trim() && !sending) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          disabled={sending}
                        />
                        <Button
                          variant="primary"
                          onClick={handleSendMessage}
                          disabled={!message.trim() || sending}
                        >
                          {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-slate-400 mb-4">Select a conversation to start messaging</p>
                      {conversations.length === 0 && (
                        <p className="text-slate-500 text-sm">Get matched to start conversations!</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>

          {/* Message Coaching Modal */}
          <ConciergeServiceModal
            serviceType="message_coaching"
            isOpen={showMessageCoaching}
            onClose={() => setShowMessageCoaching(false)}
            contextData={{
              match: selectedConv,
              conversation: messages
            }}
            inputData={{ message }}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading messages...</p>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}

