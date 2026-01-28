import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Container from '@/components/Container'
import Link from 'next/link'
import ConversationsList from '@/components/ConversationsList'
import { getConversations } from '@/app/actions/messages'

export default async function MessagesPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/signin?redirect=/dashboard/messages')
  }

  const { conversations } = await getConversations()

  return (
    <Container className="py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Messages
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Conversations with bands and venues
        </p>
      </div>

      {/* Conversations List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <ConversationsList conversations={conversations} />
      </div>
    </Container>
  )
}
