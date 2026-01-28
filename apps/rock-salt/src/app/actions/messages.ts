'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Start or get a conversation between a band and venue
export async function getOrCreateConversation(bandId: string, venueId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in' }
  }

  // Verify user owns the band or venue
  const [bandResult, venueResult] = await Promise.all([
    supabase.from('bands').select('id, claimed_by').eq('id', bandId).single(),
    supabase.from('venues').select('id, claimed_by').eq('id', venueId).single()
  ])

  const ownsBand = bandResult.data?.claimed_by === user.id
  const ownsVenue = venueResult.data?.claimed_by === user.id

  if (!ownsBand && !ownsVenue) {
    return { success: false, error: 'You must own the band or venue to start a conversation' }
  }

  // Check for existing conversation
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('band_id', bandId)
    .eq('venue_id', venueId)
    .single()

  if (existing) {
    return { success: true, conversationId: existing.id }
  }

  // Create new conversation
  const { data: newConvo, error: insertError } = await supabase
    .from('conversations')
    .insert({
      band_id: bandId,
      venue_id: venueId
    })
    .select('id')
    .single()

  if (insertError) {
    return { success: false, error: 'Failed to create conversation: ' + insertError.message }
  }

  return { success: true, conversationId: newConvo.id }
}

// Send a message
export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in' }
  }

  if (!content.trim()) {
    return { success: false, error: 'Message cannot be empty' }
  }

  // Get conversation and verify access
  const { data: conversation, error: convoError } = await supabase
    .from('conversations')
    .select(`
      id,
      band_id,
      venue_id,
      bands!conversations_band_id_fkey(claimed_by),
      venues!conversations_venue_id_fkey(claimed_by)
    `)
    .eq('id', conversationId)
    .single()

  if (convoError || !conversation) {
    return { success: false, error: 'Conversation not found' }
  }

  const band = conversation.bands as { claimed_by: string | null }
  const venue = conversation.venues as { claimed_by: string | null }
  const ownsBand = band?.claimed_by === user.id
  const ownsVenue = venue?.claimed_by === user.id

  if (!ownsBand && !ownsVenue) {
    return { success: false, error: 'You are not a participant in this conversation' }
  }

  const senderType = ownsBand ? 'band' : 'venue'

  // Insert message
  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_user_id: user.id,
      sender_type: senderType,
      content: content.trim()
    })

  if (msgError) {
    return { success: false, error: 'Failed to send message: ' + msgError.message }
  }

  // Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  revalidatePath('/dashboard/messages')

  return { success: true }
}

// Get all conversations for the current user
export async function getConversations() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in', conversations: [] }
  }

  // Get user's bands and venues
  const [bandsResult, venuesResult] = await Promise.all([
    supabase.from('bands').select('id').eq('claimed_by', user.id),
    supabase.from('venues').select('id').eq('claimed_by', user.id)
  ])

  const bandIds = bandsResult.data?.map(b => b.id) || []
  const venueIds = venuesResult.data?.map(v => v.id) || []

  if (bandIds.length === 0 && venueIds.length === 0) {
    return { success: true, conversations: [] }
  }

  // Get conversations
  let query = supabase
    .from('conversations')
    .select(`
      id,
      band_id,
      venue_id,
      last_message_at,
      show_submission_id,
      bands!conversations_band_id_fkey(id, name, slug, image_url),
      venues!conversations_venue_id_fkey(id, name, slug, image_url),
      messages(id, content, sender_type, created_at, read_at)
    `)
    .order('last_message_at', { ascending: false })

  if (bandIds.length > 0 && venueIds.length > 0) {
    query = query.or(`band_id.in.(${bandIds.join(',')}),venue_id.in.(${venueIds.join(',')})`)
  } else if (bandIds.length > 0) {
    query = query.in('band_id', bandIds)
  } else {
    query = query.in('venue_id', venueIds)
  }

  const { data: conversations, error } = await query

  if (error) {
    return { success: false, error: error.message, conversations: [] }
  }

  // Transform for easier consumption
  const transformed = conversations?.map(convo => {
    const isBandSide = bandIds.includes(convo.band_id)
    const lastMessage = convo.messages?.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    const unreadCount = convo.messages?.filter(m => {
      const isFromOther = isBandSide ? m.sender_type === 'venue' : m.sender_type === 'band'
      return isFromOther && !m.read_at
    }).length || 0

    return {
      id: convo.id,
      otherParty: isBandSide ? convo.venues : convo.bands,
      otherPartyType: isBandSide ? 'venue' : 'band',
      myParty: isBandSide ? convo.bands : convo.venues,
      myPartyType: isBandSide ? 'band' : 'venue',
      lastMessage: lastMessage ? {
        content: lastMessage.content,
        senderType: lastMessage.sender_type,
        createdAt: lastMessage.created_at
      } : null,
      unreadCount,
      lastMessageAt: convo.last_message_at
    }
  }) || []

  return { success: true, conversations: transformed }
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in', messages: [], conversation: null }
  }

  // Get conversation with verification
  const { data: conversation, error: convoError } = await supabase
    .from('conversations')
    .select(`
      id,
      band_id,
      venue_id,
      bands!conversations_band_id_fkey(id, name, slug, image_url, claimed_by),
      venues!conversations_venue_id_fkey(id, name, slug, image_url, claimed_by)
    `)
    .eq('id', conversationId)
    .single()

  if (convoError || !conversation) {
    return { success: false, error: 'Conversation not found', messages: [], conversation: null }
  }

  const band = conversation.bands as any
  const venue = conversation.venues as any
  const ownsBand = band?.claimed_by === user.id
  const ownsVenue = venue?.claimed_by === user.id

  if (!ownsBand && !ownsVenue) {
    return { success: false, error: 'Access denied', messages: [], conversation: null }
  }

  // Get messages
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('id, content, sender_type, sender_user_id, created_at, read_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (msgError) {
    return { success: false, error: msgError.message, messages: [], conversation: null }
  }

  // Mark unread messages from the other party as read
  const myType = ownsBand ? 'band' : 'venue'
  const otherType = ownsBand ? 'venue' : 'band'
  const unreadFromOther = messages?.filter(m => m.sender_type === otherType && !m.read_at) || []

  if (unreadFromOther.length > 0) {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadFromOther.map(m => m.id))
  }

  return {
    success: true,
    messages: messages || [],
    conversation: {
      id: conversation.id,
      band: { id: band.id, name: band.name, slug: band.slug, imageUrl: band.image_url },
      venue: { id: venue.id, name: venue.name, slug: venue.slug, imageUrl: venue.image_url },
      myType
    }
  }
}
