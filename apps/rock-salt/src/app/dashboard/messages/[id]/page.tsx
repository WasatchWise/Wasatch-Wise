import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Container from '@/components/Container'
import Link from 'next/link'
import MessageThread from '@/components/MessageThread'
import { getMessages } from '@/app/actions/messages'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect(`/auth/signin?redirect=/dashboard/messages/${id}`)
  }

  const { success, messages, conversation, error } = await getMessages(id)

  if (!success || !conversation) {
    notFound()
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-4">
        <Link
          href="/dashboard/messages"
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Messages
        </Link>
      </div>

      {/* Message Thread */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <MessageThread messages={messages} conversation={conversation} />
      </div>
    </Container>
  )
}
