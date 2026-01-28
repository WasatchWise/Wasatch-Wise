-- ============================================================================
-- DAiTE Supabase Database Schema
-- Based on Design Specification v1.0
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    pseudonym TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    
    -- Account status
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'paused', 'graduated', 'deleted')),
    verification_tier INTEGER NOT NULL DEFAULT 0 CHECK (verification_tier IN (0, 1, 2, 3)),
    
    -- Premium
    is_premium BOOLEAN NOT NULL DEFAULT false,
    premium_tier TEXT CHECK (premium_tier IN ('monthly', 'yearly')),
    premium_expires_at TIMESTAMPTZ,
    
    -- Onboarding
    onboarding_completed_at TIMESTAMPTZ,
    onboarding_skipped BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- User profiles (public-facing data)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Basic info
    age INTEGER,
    bio TEXT,
    location_city TEXT,
    location_state TEXT,
    location_country TEXT,
    location_coordinates POINT, -- PostGIS point for location-based queries
    
    -- Preferences
    looking_for TEXT[] DEFAULT ARRAY['dating']::TEXT[] CHECK (looking_for <@ ARRAY['dating', 'friends', 'community']::TEXT[]),
    age_preference_min INTEGER DEFAULT 18,
    age_preference_max INTEGER DEFAULT 100,
    distance_preference_km INTEGER DEFAULT 50,
    
    -- Relationship goals
    relationship_goals TEXT,
    dealbreakers TEXT[],
    values TEXT[],
    
    -- Aesthetic profile (visual preferences)
    aesthetic_profile JSONB,
    
    -- Profile completeness
    profile_completeness_score INTEGER DEFAULT 0 CHECK (profile_completeness_score BETWEEN 0 AND 100),
    
    -- Embedding for semantic search
    profile_embedding vector(768),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User settings
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Notification settings
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    notification_tier_1_enabled BOOLEAN NOT NULL DEFAULT true, -- Always on tier
    notification_tier_2_enabled BOOLEAN NOT NULL DEFAULT true, -- On by default
    notification_tier_3_enabled BOOLEAN NOT NULL DEFAULT false, -- Off by default
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    
    -- Privacy settings
    discovery_blur_level INTEGER NOT NULL DEFAULT 3 CHECK (discovery_blur_level BETWEEN 1 AND 5),
    read_receipts_enabled BOOLEAN NOT NULL DEFAULT true,
    typing_indicator_enabled BOOLEAN NOT NULL DEFAULT true,
    show_last_active BOOLEAN NOT NULL DEFAULT true,
    
    -- CY coaching
    cy_coaching_enabled BOOLEAN NOT NULL DEFAULT true,
    cy_coaching_global BOOLEAN NOT NULL DEFAULT true,
    
    -- Accessibility
    color_blind_mode TEXT,
    high_contrast_enabled BOOLEAN NOT NULL DEFAULT false,
    dark_mode TEXT NOT NULL DEFAULT 'system' CHECK (dark_mode IN ('light', 'dark', 'system')),
    font_size_scale INTEGER DEFAULT 100 CHECK (font_size_scale BETWEEN 50 AND 200),
    reduced_motion_enabled BOOLEAN NOT NULL DEFAULT false,
    simple_language_enabled BOOLEAN NOT NULL DEFAULT false,
    explicit_communication_mode BOOLEAN NOT NULL DEFAULT false,
    social_scripting_enabled BOOLEAN NOT NULL DEFAULT false,
    quiet_mode_enabled BOOLEAN NOT NULL DEFAULT false,
    
    -- Communication preferences
    preferred_communication_style TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Neurodivergent profile
CREATE TABLE public.user_neurodivergent_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- ND-specific attributes
    neurodivergent_types TEXT[],
    sensory_needs JSONB, -- Noise, lighting, crowd density preferences
    communication_preferences JSONB,
    social_needs JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PSEUDONYM SYSTEM
-- ============================================================================

-- Pseudonym history (for preventing reuse)
CREATE TABLE public.pseudonym_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pseudonym TEXT NOT NULL,
    released_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '90 days')
);

-- ============================================================================
-- PHOTO SYSTEM
-- ============================================================================

-- User photos with progressive reveal
CREATE TABLE public.user_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Photo data
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    prompt TEXT, -- "A photo that shows your vibe", etc.
    
    -- Moderation
    moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderation_notes TEXT,
    moderation_reviewed_at TIMESTAMPTZ,
    
    -- Ordering
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    
    -- Requirements
    clearly_shows_face BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Photo reveal levels (who can see what)
CREATE TABLE public.photo_reveals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES public.user_photos(id) ON DELETE CASCADE,
    viewer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reveal_level INTEGER NOT NULL DEFAULT 3 CHECK (reveal_level BETWEEN 1 AND 5),
    
    -- Token unlock tracking
    unlocked_with_tokens BOOLEAN NOT NULL DEFAULT false,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(photo_id, viewer_user_id)
);

-- ============================================================================
-- CYRAiNO AGENT SYSTEM
-- ============================================================================

-- CYRAiNO agents (each user has one)
CREATE TABLE public.cyraino_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Agent identity
    name TEXT NOT NULL,
    avatar_url TEXT,
    personality_traits JSONB,
    
    -- Agent state
    agent_embedding vector(768), -- For semantic matching
    
    -- Reset tracking
    reset_count INTEGER NOT NULL DEFAULT 0,
    last_reset_at TIMESTAMPTZ,
    reset_type TEXT CHECK (reset_type IN ('memory_wipe', 'full_reset', 'profile_reset')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent memory (conversational memory with summarization)
CREATE TABLE public.agent_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.cyraino_agents(id) ON DELETE CASCADE,
    
    -- Memory content
    memory_type TEXT NOT NULL CHECK (memory_type IN ('core_identity', 'conversational', 'match', 'user_explicit')),
    content TEXT NOT NULL,
    summary TEXT, -- Summarized version for older memories
    
    -- Memory lifecycle
    memory_age_days INTEGER NOT NULL DEFAULT 0,
    memory_status TEXT NOT NULL DEFAULT 'active' CHECK (memory_status IN ('active', 'summarized', 'archived')),
    
    -- Embedding for RAG
    memory_embedding vector(768),
    
    -- User control
    user_tagged BOOLEAN NOT NULL DEFAULT false, -- User explicitly asked to remember
    user_deleted BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent learning logs (what CY learned from interactions)
CREATE TABLE public.agent_learning_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.cyraino_agents(id) ON DELETE CASCADE,
    
    learning_type TEXT NOT NULL,
    learning_content JSONB NOT NULL,
    source_type TEXT NOT NULL, -- 'vibe_check', 'match', 'date', 'user_feedback'
    source_id UUID,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ASSESSMENTS
-- ============================================================================

-- Assessment types (OCEAN, attachment style, love languages, etc.)
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    assessment_type TEXT NOT NULL,
    questions JSONB NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User assessment results
CREATE TABLE public.user_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    
    results JSONB NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_id, assessment_id)
);

-- ============================================================================
-- VIBE CHECK SYSTEM
-- ============================================================================

-- Vibe checks (user initiates)
CREATE TABLE public.vibe_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.cyraino_agents(id) ON DELETE CASCADE,
    
    -- Vibe check type
    vibe_check_type TEXT NOT NULL DEFAULT 'standard' CHECK (vibe_check_type IN ('standard', 'extended')),
    token_cost INTEGER NOT NULL DEFAULT 10,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    estimated_completion_at TIMESTAMPTZ,
    
    -- Results
    discoveries_count INTEGER DEFAULT 0,
    tokens_refunded INTEGER DEFAULT 0,
    refund_percentage INTEGER DEFAULT 0,
    
    -- Limits tracking
    week_number INTEGER NOT NULL, -- For tracking weekly limits
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent-to-agent conversations (within vibe checks)
CREATE TABLE public.agent_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vibe_check_id UUID NOT NULL REFERENCES public.vibe_checks(id) ON DELETE CASCADE,
    
    -- Participants
    agent_1_id UUID NOT NULL REFERENCES public.cyraino_agents(id) ON DELETE CASCADE,
    agent_2_id UUID NOT NULL REFERENCES public.cyraino_agents(id) ON DELETE CASCADE,
    user_1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Conversation
    conversation_exchanges JSONB NOT NULL, -- Array of exchanges
    exchange_count INTEGER NOT NULL DEFAULT 0,
    
    -- Evaluation
    compatibility_score DECIMAL(5,2), -- Internal, not shown to users
    match_decision TEXT CHECK (match_decision IN ('yes', 'maybe', 'no')),
    narrative_excerpt TEXT, -- Poetic compatibility narrative
    
    -- Status
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    
    CHECK (agent_1_id != agent_2_id),
    CHECK (user_1_id != user_2_id)
);

-- Discoveries (results from vibe checks)
CREATE TABLE public.discoveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vibe_check_id UUID NOT NULL REFERENCES public.vibe_checks(id) ON DELETE CASCADE,
    agent_conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE SET NULL,
    
    -- Users
    discoverer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    discovered_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Discovery data
    narrative_excerpt TEXT NOT NULL,
    compatibility_highlights JSONB,
    
    -- Lifecycle
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'interested', 'passed', 'saved', 'expiring', 'expired', 'matched')),
    interest_expressed_at TIMESTAMPTZ, -- When user clicked "Interested"
    
    -- Expiration
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    saved_expires_at TIMESTAMPTZ, -- Extended expiration if saved (30 days)
    
    -- Mutual interest
    is_mutual BOOLEAN NOT NULL DEFAULT false,
    matched_at TIMESTAMPTZ,
    
    CHECK (discoverer_user_id != discovered_user_id)
);

-- Saved discoveries
CREATE TABLE public.saved_discoveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discovery_id UUID NOT NULL UNIQUE REFERENCES public.discoveries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    token_cost INTEGER NOT NULL DEFAULT 2,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- ============================================================================
-- MATCHES & RELATIONSHIP PROGRESSION
-- ============================================================================

-- Matches (created from mutual interest)
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Source
    discovery_id UUID REFERENCES public.discoveries(id) ON DELETE SET NULL,
    
    -- Relationship stage
    relationship_stage TEXT NOT NULL DEFAULT 'matched' CHECK (relationship_stage IN ('matched', 'dating', 'exclusive', 'graduated')),
    exclusive_declared_at TIMESTAMPTZ,
    graduated_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    unmatched_at TIMESTAMPTZ,
    unmatched_by_user_id UUID REFERENCES public.users(id),
    unmatch_reason TEXT,
    
    -- Hidden from discovery
    hidden_from_discovery BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_1_id, user_2_id),
    CHECK (user_1_id != user_2_id)
);

-- ============================================================================
-- MESSAGING SYSTEM
-- ============================================================================

-- Conversations (chat threads)
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    
    user_1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Settings
    user_1_coaching_enabled BOOLEAN NOT NULL DEFAULT true,
    user_2_coaching_enabled BOOLEAN NOT NULL DEFAULT true,
    
    -- Last activity
    last_message_at TIMESTAMPTZ,
    last_message_from_user_id UUID REFERENCES public.users(id),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CHECK (user_1_id != user_2_id)
);

-- Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    
    sender_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Message content
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'cy_suggestion')),
    
    -- CY coaching data
    cy_coaching_data JSONB, -- Coaching suggestions that led to this message
    is_cy_suggested BOOLEAN NOT NULL DEFAULT false,
    
    -- Read status
    read_at TIMESTAMPTZ,
    is_read BOOLEAN NOT NULL DEFAULT false,
    
    -- Moderation
    moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'deleted')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CHECK (sender_user_id != recipient_user_id)
);

-- Message drafts (AI-assisted)
CREATE TABLE public.message_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    draft_content TEXT NOT NULL,
    cy_suggestions JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SAFETY SYSTEMS
-- ============================================================================

-- Verification records
CREATE TABLE public.verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    verification_type TEXT NOT NULL CHECK (verification_type IN ('photo', 'id', 'social')),
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
    
    -- Photo verification
    selfie_url TEXT,
    selfie_match_score DECIMAL(5,2),
    
    -- ID verification
    id_hash TEXT, -- Hash of ID, not actual ID data
    id_verified_at TIMESTAMPTZ,
    
    -- Social verification
    social_provider TEXT,
    social_profile_url TEXT,
    
    -- Review
    reviewed_by_admin_id UUID,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Report details
    report_category TEXT NOT NULL CHECK (report_category IN (
        'fake_profile', 'inappropriate_photos', 'harassment', 
        'dangerous_behavior', 'scam_spam', 'underage', 'other'
    )),
    report_description TEXT NOT NULL,
    report_evidence JSONB, -- Screenshots, message IDs, etc.
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'action_taken', 'dismissed', 'resolved')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    
    -- Review
    reviewed_by_admin_id UUID,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Action taken
    action_taken TEXT,
    action_details JSONB,
    
    -- Reporter notification
    reporter_notified BOOLEAN NOT NULL DEFAULT false,
    reporter_notified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CHECK (reporter_user_id != reported_user_id)
);

-- Blocks
CREATE TABLE public.blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    block_reason TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(blocker_user_id, blocked_user_id),
    CHECK (blocker_user_id != blocked_user_id)
);

-- Automated safety flags
CREATE TABLE public.safety_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flagged_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    flag_type TEXT NOT NULL,
    flag_severity TEXT NOT NULL DEFAULT 'warning' CHECK (flag_severity IN ('warning', 'moderate', 'severe', 'critical')),
    flag_context JSONB NOT NULL,
    
    -- Source
    source_type TEXT NOT NULL, -- 'message', 'profile', 'pattern'
    source_id UUID,
    
    -- Action
    action_taken TEXT,
    automated_action BOOLEAN NOT NULL DEFAULT false,
    
    -- Review
    reviewed_by_admin_id UUID,
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Date safety features
CREATE TABLE public.date_safety (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_id UUID NOT NULL, -- References planned_dates
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Pre-date
    emergency_contact_shared BOOLEAN NOT NULL DEFAULT false,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    video_vibe_check_completed BOOLEAN NOT NULL DEFAULT false,
    
    -- During date
    check_in_enabled BOOLEAN NOT NULL DEFAULT false,
    location_sharing_enabled BOOLEAN NOT NULL DEFAULT false,
    sos_triggered BOOLEAN NOT NULL DEFAULT false,
    sos_triggered_at TIMESTAMPTZ,
    
    -- Post-date
    safety_feedback_provided BOOLEAN NOT NULL DEFAULT false,
    felt_safe BOOLEAN,
    safety_concerns TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- VENUE & EVENT DATA
-- ============================================================================

-- Venues
CREATE TABLE public.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    coordinates POINT,
    
    -- Source
    source_type TEXT NOT NULL CHECK (source_type IN ('google_places', 'yelp', 'slctrips', 'user_generated', 'partnership')),
    source_id TEXT, -- External ID from source
    source_data JSONB, -- Raw data from source
    
    -- Attributes
    noise_level TEXT CHECK (noise_level IN ('quiet', 'moderate', 'loud')),
    vibe TEXT[],
    price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
    best_for TEXT[] CHECK (best_for <@ ARRAY['first_date', 'getting_to_know', 'special_occasion']::TEXT[]),
    
    -- Accessibility
    wheelchair_accessible BOOLEAN,
    parking_available BOOLEAN,
    transit_accessible BOOLEAN,
    
    -- Sensory notes
    lighting TEXT,
    crowd_density TEXT,
    nd_friendly BOOLEAN,
    
    -- Other
    dog_friendly BOOLEAN,
    dog_friendly_details TEXT,
    reservation_needed TEXT CHECK (reservation_needed IN ('yes', 'no', 'recommended')),
    peak_times TEXT,
    
    -- Enrichment
    user_rating_avg DECIMAL(3,2),
    user_rating_count INTEGER DEFAULT 0,
    ai_extracted_keywords TEXT[],
    manually_curated BOOLEAN NOT NULL DEFAULT false,
    
    -- Featured
    is_featured BOOLEAN NOT NULL DEFAULT false,
    featured_until TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    name TEXT NOT NULL,
    description TEXT,
    event_type TEXT,
    
    -- Location
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    address TEXT,
    city TEXT,
    
    -- Timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurrence_pattern TEXT,
    
    -- Source
    source_type TEXT NOT NULL CHECK (source_type IN ('eventbrite', 'venue_calendar', 'local_feed', 'user_submission')),
    source_id TEXT,
    source_url TEXT,
    
    -- Matching
    vibe_tags TEXT[],
    nd_friendly BOOLEAN,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- DATE PLANNING
-- ============================================================================

-- Planned dates
CREATE TABLE public.planned_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    
    -- Participants
    planned_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    other_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Date details
    date_type TEXT NOT NULL CHECK (date_type IN ('first', 'follow_up', 'special_occasion')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    
    -- Venue/Event
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    location_details TEXT,
    
    -- CY suggestions
    cy_suggested BOOLEAN NOT NULL DEFAULT false,
    cy_suggestion_reason TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled', 'no_show')),
    confirmed_by_both BOOLEAN NOT NULL DEFAULT false,
    
    -- Post-date
    feedback_provided BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CHECK (planned_by_user_id != other_user_id)
);

-- Date feedback
CREATE TABLE public.date_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_id UUID NOT NULL REFERENCES public.planned_dates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Feedback
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    enjoyed_aspects TEXT[],
    concerns TEXT,
    would_see_again BOOLEAN,
    
    -- Venue feedback
    venue_rating INTEGER CHECK (venue_rating BETWEEN 1 AND 5),
    venue_feedback TEXT,
    was_good_spot BOOLEAN,
    
    -- Learning for CY
    learning_notes JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TOKEN ECONOMY
-- ============================================================================

-- Token balances
CREATE TABLE public.token_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    
    -- Premium tokens
    premium_tokens_monthly INTEGER DEFAULT 0,
    premium_tokens_last_reset TIMESTAMPTZ,
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Token transactions
CREATE TABLE public.token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'earn', 'spend', 'refund', 'purchase', 'premium_grant', 'referral', 'bonus'
    )),
    amount INTEGER NOT NULL, -- Positive for earn, negative for spend
    balance_after INTEGER NOT NULL,
    
    -- Context
    context_type TEXT, -- 'vibe_check', 'photo_reveal', 'pseudonym_change', etc.
    context_id UUID,
    description TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Token purchases
CREATE TABLE public.token_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Purchase details
    token_package TEXT NOT NULL, -- '30', '75', '200', '500'
    token_amount INTEGER NOT NULL,
    price_usd DECIMAL(10,2) NOT NULL,
    bonus_tokens INTEGER DEFAULT 0,
    
    -- Payment
    payment_provider TEXT,
    payment_id TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Premium subscriptions
CREATE TABLE public.premium_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Subscription details
    subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('monthly', 'yearly')),
    price_usd DECIMAL(10,2) NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    
    -- Billing
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    
    -- Payment
    payment_provider TEXT,
    subscription_id TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accountability scores (affects token bonuses)
CREATE TABLE public.accountability_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    
    -- Factors
    response_rate DECIMAL(5,2),
    show_up_rate DECIMAL(5,2),
    no_show_count INTEGER DEFAULT 0,
    ghost_count INTEGER DEFAULT 0,
    
    -- Bonus eligibility
    token_bonus_percentage INTEGER DEFAULT 0 CHECK (token_bonus_percentage BETWEEN 0 AND 10),
    
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type TEXT NOT NULL,
    notification_tier INTEGER NOT NULL CHECK (notification_tier BETWEEN 1 AND 4),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    action_url TEXT,
    
    -- Status
    read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    sent BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMPTZ,
    
    -- Delivery
    push_sent BOOLEAN NOT NULL DEFAULT false,
    email_sent BOOLEAN NOT NULL DEFAULT false,
    
    -- Timing
    scheduled_for TIMESTAMPTZ,
    quiet_hours_respected BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- COMMUNITY FEATURES
-- ============================================================================

-- Friendship mode settings
CREATE TABLE public.friendship_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    looking_for_friends BOOLEAN NOT NULL DEFAULT false,
    friendship_preferences JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_account_status ON public.users(account_status);
CREATE INDEX idx_users_verification_tier ON public.users(verification_tier);
CREATE INDEX idx_users_pseudonym ON public.users(pseudonym);
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_location ON public.user_profiles USING GIST(location_coordinates);
CREATE INDEX idx_user_profiles_embedding ON public.user_profiles USING ivfflat(profile_embedding vector_cosine_ops);

-- Photo indexes
CREATE INDEX idx_user_photos_user_id ON public.user_photos(user_id);
CREATE INDEX idx_user_photos_moderation ON public.user_photos(moderation_status);
CREATE INDEX idx_photo_reveals_viewer ON public.photo_reveals(viewer_user_id);

-- CYRAiNO indexes
CREATE INDEX idx_cyraino_agents_user_id ON public.cyraino_agents(user_id);
CREATE INDEX idx_agent_memory_agent_id ON public.agent_memory(agent_id);
CREATE INDEX idx_agent_memory_type ON public.agent_memory(memory_type);
CREATE INDEX idx_agent_memory_embedding ON public.agent_memory USING ivfflat(memory_embedding vector_cosine_ops);

-- Vibe check indexes
CREATE INDEX idx_vibe_checks_user_id ON public.vibe_checks(user_id);
CREATE INDEX idx_vibe_checks_status ON public.vibe_checks(status);
CREATE INDEX idx_vibe_checks_week ON public.vibe_checks(week_number, user_id);
CREATE INDEX idx_agent_conversations_vibe_check ON public.agent_conversations(vibe_check_id);
CREATE INDEX idx_agent_conversations_users ON public.agent_conversations(user_1_id, user_2_id);
CREATE INDEX idx_discoveries_user ON public.discoveries(discoverer_user_id);
CREATE INDEX idx_discoveries_status ON public.discoveries(status);
CREATE INDEX idx_discoveries_expires ON public.discoveries(expires_at) WHERE status NOT IN ('expired', 'matched');

-- Match indexes
CREATE INDEX idx_matches_user_1 ON public.matches(user_1_id);
CREATE INDEX idx_matches_user_2 ON public.matches(user_2_id);
CREATE INDEX idx_matches_stage ON public.matches(relationship_stage);
CREATE INDEX idx_matches_active ON public.matches(is_active);

-- Message indexes
CREATE INDEX idx_conversations_match ON public.conversations(match_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_user_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_user_id);
CREATE INDEX idx_messages_read ON public.messages(is_read, recipient_user_id);

-- Safety indexes
CREATE INDEX idx_blocks_blocker ON public.blocks(blocker_user_id);
CREATE INDEX idx_blocks_blocked ON public.blocks(blocked_user_id);
CREATE INDEX idx_reports_reporter ON public.reports(reporter_user_id);
CREATE INDEX idx_reports_reported ON public.reports(reported_user_id);
CREATE INDEX idx_reports_status ON public.reports(status, priority);
CREATE INDEX idx_verifications_user ON public.verifications(user_id);
CREATE INDEX idx_verifications_status ON public.verifications(verification_status);

-- Venue indexes
CREATE INDEX idx_venues_location ON public.venues USING GIST(coordinates);
CREATE INDEX idx_venues_city ON public.venues(city);
CREATE INDEX idx_venues_featured ON public.venues(is_featured, featured_until);

-- Token indexes
CREATE INDEX idx_token_transactions_user ON public.token_transactions(user_id);
CREATE INDEX idx_token_transactions_type ON public.token_transactions(transaction_type);
CREATE INDEX idx_token_transactions_date ON public.token_transactions(created_at);

-- Notification indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read, user_id);
CREATE INDEX idx_notifications_tier ON public.notifications(notification_tier);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_neurodivergent_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyraino_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can read/update their own data)
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- User profiles - read own, read matches
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Matches - users can read their matches
CREATE POLICY "Users can read own matches" ON public.matches
    FOR SELECT USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- Messages - users can read messages in their conversations
CREATE POLICY "Users can read own messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
            AND (c.user_1_id = auth.uid() OR c.user_2_id = auth.uid())
        )
    );

-- Blocks - users can read their own blocks
CREATE POLICY "Users can read own blocks" ON public.blocks
    FOR SELECT USING (auth.uid() = blocker_user_id);

-- Token balances - users can read their own balance
CREATE POLICY "Users can read own token balance" ON public.token_balances
    FOR SELECT USING (auth.uid() = user_id);

-- Notifications - users can read their own notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Note: More comprehensive RLS policies should be added based on specific business logic requirements
-- These are basic policies to get started. You'll need to add policies for:
-- - Reading other users' profiles (with privacy filters)
-- - Vibe checks and discoveries
-- - Photo reveals based on blur levels
-- - Admin access
-- etc.

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cyraino_agents_updated_at BEFORE UPDATE ON public.cyraino_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_memory_updated_at BEFORE UPDATE ON public.agent_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user data on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, pseudonym)
    VALUES (
        NEW.id,
        NEW.email,
        'User_' || substring(NEW.id::text from 1 for 8)
    );
    
    INSERT INTO public.token_balances (user_id, balance)
    VALUES (NEW.id, 20); -- Starting tokens
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    INSERT INTO public.accountability_scores (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on auth signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to check vibe check limits
CREATE OR REPLACE FUNCTION check_vibe_check_limits(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_week INTEGER;
    vibe_checks_this_week INTEGER;
    last_vibe_check TIMESTAMPTZ;
    hours_since_last_check NUMERIC;
BEGIN
    current_week := EXTRACT(WEEK FROM now())::INTEGER;
    
    -- Check weekly limit (max 3 per week)
    SELECT COUNT(*) INTO vibe_checks_this_week
    FROM public.vibe_checks
    WHERE user_id = p_user_id
    AND week_number = current_week
    AND status != 'refunded';
    
    IF vibe_checks_this_week >= 3 THEN
        RETURN false;
    END IF;
    
    -- Check cooldown (24 hours between vibe checks)
    SELECT MAX(started_at) INTO last_vibe_check
    FROM public.vibe_checks
    WHERE user_id = p_user_id
    AND status IN ('completed', 'failed');
    
    IF last_vibe_check IS NOT NULL THEN
        hours_since_last_check := EXTRACT(EPOCH FROM (now() - last_vibe_check)) / 3600;
        IF hours_since_last_check < 24 THEN
            RETURN false;
        END IF;
    END IF;
    
    -- Check if there's already a pending/processing vibe check
    IF EXISTS (
        SELECT 1 FROM public.vibe_checks
        WHERE user_id = p_user_id
        AND status IN ('pending', 'processing')
    ) THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to expire discoveries
CREATE OR REPLACE FUNCTION expire_old_discoveries()
RETURNS void AS $$
BEGIN
    UPDATE public.discoveries
    SET status = 'expired'
    WHERE status NOT IN ('expired', 'matched')
    AND expires_at < now()
    AND (saved_expires_at IS NULL OR saved_expires_at < now());
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.users IS 'Main user table extending Supabase auth.users';
COMMENT ON TABLE public.user_profiles IS 'Public-facing user profile data';
COMMENT ON TABLE public.cyraino_agents IS 'Each user has one CYRAiNO AI agent';
COMMENT ON TABLE public.agent_memory IS 'CYRAiNO agent memory with summarization over time';
COMMENT ON TABLE public.vibe_checks IS 'User-initiated matchmaking searches';
COMMENT ON TABLE public.agent_conversations IS 'Agent-to-agent dialogues within vibe checks';
COMMENT ON TABLE public.discoveries IS 'Potential matches discovered via vibe checks';
COMMENT ON TABLE public.matches IS 'Mutual matches between users';
COMMENT ON TABLE public.messages IS 'Chat messages between matched users';
COMMENT ON TABLE public.blocks IS 'User blocking system for safety';
COMMENT ON TABLE public.token_balances IS 'User token economy balances';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

