-- Create messages table for direct communication between bands and venues
-- Created: 2025-01-21

-- Conversations table to group messages
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants (one band + one venue per conversation)
  band_id uuid REFERENCES public.bands(id) ON DELETE CASCADE NOT NULL,
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,

  -- Optional: link to a show submission
  show_submission_id uuid REFERENCES public.show_submissions(id) ON DELETE SET NULL,

  -- Metadata
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),

  -- Ensure unique conversation per band/venue pair
  UNIQUE(band_id, venue_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,

  -- Sender info
  sender_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('band', 'venue')),

  -- Message content
  content text NOT NULL,

  -- Read status
  read_at timestamptz,

  -- Metadata
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations

-- Band owners can view their conversations
CREATE POLICY "Bands can view their conversations"
  ON public.conversations FOR SELECT
  USING (
    band_id IN (
      SELECT id FROM public.bands WHERE claimed_by = auth.uid()
    )
  );

-- Venue owners can view their conversations
CREATE POLICY "Venues can view their conversations"
  ON public.conversations FOR SELECT
  USING (
    venue_id IN (
      SELECT id FROM public.venues WHERE claimed_by = auth.uid()
    )
  );

-- Band owners can create conversations
CREATE POLICY "Bands can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT id FROM public.bands WHERE claimed_by = auth.uid()
    )
  );

-- Venue owners can create conversations
CREATE POLICY "Venues can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    venue_id IN (
      SELECT id FROM public.venues WHERE claimed_by = auth.uid()
    )
  );

-- Update policy for last_message_at
CREATE POLICY "Participants can update conversation"
  ON public.conversations FOR UPDATE
  USING (
    band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
    OR venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid())
  )
  WITH CHECK (
    band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
    OR venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid())
  );

-- RLS Policies for messages

-- Participants can view messages in their conversations
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
         OR c.venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid())
    )
  );

-- Participants can send messages
CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
         OR c.venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid())
    )
    AND sender_user_id = auth.uid()
  );

-- Participants can update messages (for marking as read)
CREATE POLICY "Participants can update messages"
  ON public.messages FOR UPDATE
  USING (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.band_id IN (SELECT id FROM public.bands WHERE claimed_by = auth.uid())
         OR c.venue_id IN (SELECT id FROM public.venues WHERE claimed_by = auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS conversations_band_id_idx ON public.conversations(band_id);
CREATE INDEX IF NOT EXISTS conversations_venue_id_idx ON public.conversations(venue_id);
CREATE INDEX IF NOT EXISTS conversations_last_message_at_idx ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_user_id_idx ON public.messages(sender_user_id);

-- Comments
COMMENT ON TABLE public.conversations IS 'Conversation threads between bands and venues';
COMMENT ON TABLE public.messages IS 'Individual messages within conversations';
COMMENT ON COLUMN public.messages.sender_type IS 'Whether the message was sent by the band or venue side';
