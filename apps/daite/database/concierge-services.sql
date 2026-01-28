-- ============================================================================
-- CONCIERGE SERVICES SYSTEM
-- ============================================================================
-- Token-based premium services that enhance user experience

-- Concierge service definitions
CREATE TABLE IF NOT EXISTS public.concierge_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Service info
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN (
        'profile_review', 'message_coaching', 'date_planning', 
        'compatibility_deep_dive', 'photo_review', 'conversation_starter',
        'relationship_advice', 'profile_optimization'
    )),
    icon_name TEXT,
    
    -- Pricing
    token_cost INTEGER NOT NULL DEFAULT 5,
    premium_only BOOLEAN NOT NULL DEFAULT false,
    
    -- Configuration
    ai_model TEXT DEFAULT 'gemini-2.0-flash-exp',
    prompt_template TEXT, -- Custom prompt for this service
    output_format JSONB, -- Expected output structure
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Concierge service requests (when users use a service)
CREATE TABLE IF NOT EXISTS public.concierge_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.concierge_services(id) ON DELETE CASCADE,
    
    -- Request details
    context_data JSONB, -- Service-specific context (message text, match ID, etc.)
    input_data JSONB, -- What the user provided
    
    -- Results
    output_data JSONB, -- AI-generated output
    ai_response TEXT, -- Raw AI response
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Timing
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    
    -- Feedback
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_concierge_services_type ON public.concierge_services(service_type);
CREATE INDEX IF NOT EXISTS idx_concierge_services_active ON public.concierge_services(is_active);
CREATE INDEX IF NOT EXISTS idx_concierge_requests_user ON public.concierge_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_concierge_requests_service ON public.concierge_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_concierge_requests_status ON public.concierge_requests(status);

-- RLS Policies
ALTER TABLE public.concierge_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concierge_requests ENABLE ROW LEVEL SECURITY;

-- Services: Everyone can read active services
CREATE POLICY "Anyone can read active services" ON public.concierge_services
    FOR SELECT USING (is_active = true);

-- Requests: Users can manage their own
CREATE POLICY "Users can manage own requests" ON public.concierge_requests
    FOR ALL USING (auth.uid() = user_id);

-- Seed concierge services
INSERT INTO public.concierge_services (name, description, service_type, token_cost, icon_name, display_order) VALUES
('Profile Review', 'Get AI feedback on your profile to improve your discovery potential', 'profile_review', 5, 'user-check', 1),
('Message Coaching', 'Get AI suggestions to improve your message before sending', 'message_coaching', 2, 'message-square', 2),
('Date Planning Assistant', 'Let CYRAiNO help plan the perfect gathering based on your match', 'date_planning', 3, 'calendar', 3),
('Compatibility Deep Dive', 'Get detailed analysis of why you and a match connect', 'compatibility_deep_dive', 5, 'search', 4),
('Photo Review', 'Get feedback on your photos before posting', 'photo_review', 2, 'image', 5),
('Conversation Starters', 'Get personalized conversation starters for a match', 'conversation_starter', 2, 'sparkles', 6),
('Relationship Advice', 'Get AI guidance on navigating a relationship', 'relationship_advice', 5, 'heart', 7),
('Profile Optimization', 'Get specific suggestions to optimize your profile for better matches', 'profile_optimization', 5, 'trending-up', 8)
ON CONFLICT (name) DO NOTHING;

-- Function to process concierge service
CREATE OR REPLACE FUNCTION process_concierge_service(
    p_user_id UUID,
    p_service_id UUID,
    p_input_data JSONB,
    p_context_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
    v_service RECORD;
    v_token_balance INTEGER;
BEGIN
    -- Get service details
    SELECT * INTO v_service
    FROM public.concierge_services
    WHERE id = p_service_id AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service not found or inactive';
    END IF;
    
    -- Check token balance
    SELECT balance INTO v_token_balance
    FROM public.token_balances
    WHERE user_id = p_user_id;
    
    IF v_token_balance < v_service.token_cost THEN
        RAISE EXCEPTION 'Insufficient tokens. Need % tokens, have %', v_service.token_cost, v_token_balance;
    END IF;
    
    -- Deduct tokens
    UPDATE public.token_balances
    SET balance = balance - v_service.token_cost
    WHERE user_id = p_user_id;
    
    -- Record transaction
    INSERT INTO public.token_transactions (
        user_id, transaction_type, amount, balance_after, context_type, context_id, description
    )
    VALUES (
        p_user_id, 
        'spend', 
        -v_service.token_cost,
        v_token_balance - v_service.token_cost,
        'concierge_service',
        p_service_id,
        v_service.name
    );
    
    -- Create request
    INSERT INTO public.concierge_requests (
        user_id, service_id, input_data, context_data, status
    )
    VALUES (
        p_user_id, p_service_id, p_input_data, p_context_data, 'pending'
    )
    RETURNING id INTO v_request_id;
    
    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.concierge_services IS 'Available concierge services users can purchase';
COMMENT ON TABLE public.concierge_requests IS 'User requests for concierge services';

