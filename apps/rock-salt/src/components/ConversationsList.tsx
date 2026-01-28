'use client'

import Link from 'next/link'

interface Conversation {
  id: string
  otherParty: {
    id: string
    name: string
    slug: string
    image_url: string | null
  }
  otherPartyType: 'band' | 'venue'
  myParty: {
    id: string
    name: string
    slug: string
    image_url: string | null
  }
  myPartyType: 'band' | 'venue'
  lastMessage: {
    content: string
    senderType: string
    createdAt: string
  } | null
  unreadCount: number
  lastMessageAt: string
}

interface ConversationsListProps {
  conversations: Conversation[]
}

export default function ConversationsList({ conversations }: ConversationsListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No conversations yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Start a conversation by messaging a band or venue from their page, or when a show submission is made.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map((convo) => (
        <Link
          key={convo.id}
          href={`/dashboard/messages/${convo.id}`}
          className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            {convo.otherParty.image_url ? (
              <img
                src={convo.otherParty.image_url}
                alt={convo.otherParty.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                convo.otherPartyType === 'venue'
                  ? 'bg-amber-100 dark:bg-amber-900'
                  : 'bg-indigo-100 dark:bg-indigo-900'
              }`}>
                <span className={`text-lg font-bold ${
                  convo.otherPartyType === 'venue'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                  {convo.otherParty.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`font-semibold truncate ${
                convo.unreadCount > 0
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {convo.otherParty.name}
              </h3>
              {convo.lastMessage && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {formatTimeAgo(convo.lastMessage.createdAt)}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {convo.otherPartyType === 'venue' ? 'Venue' : 'Band'}
              {' · '}
              <span className="text-gray-400">
                via {convo.myParty.name}
              </span>
            </p>

            {convo.lastMessage && (
              <p className={`text-sm truncate ${
                convo.unreadCount > 0
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {convo.lastMessage.senderType === convo.myPartyType && (
                  <span className="text-gray-400">You: </span>
                )}
                {convo.lastMessage.content}
              </p>
            )}
          </div>

          {/* Unread badge */}
          {convo.unreadCount > 0 && (
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-indigo-600 rounded-full">
                {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
