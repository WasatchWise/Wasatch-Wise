-- ============================================================================
-- BADGES & CHALLENGES SYSTEM
-- ============================================================================
-- This extends the existing schema with badge and challenge functionality

-- Badge definitions (what badges exist)
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Badge info
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'emotional_intelligence', 'conflict_management', 'communication', 
        'authenticity', 'empathy', 'growth', 'accountability', 'community'
    )),
    icon_name TEXT, -- Icon identifier for UI
    color TEXT, -- Badge color (e.g., 'purple', 'gold', 'blue')
    
    -- Requirements
    challenge_id UUID, -- Links to a challenge that awards this badge
    auto_award BOOLEAN NOT NULL DEFAULT false, -- Awarded automatically when criteria met
    
    -- Display
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Challenges (tasks users can complete to earn badges)
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Challenge info
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'emotional_intelligence', 'conflict_management', 'communication', 
        'authenticity', 'empathy', 'growth', 'accountability', 'community'
    )),
    
    -- Requirements
    token_cost INTEGER NOT NULL DEFAULT 5, -- Cost to take the challenge
    time_limit_minutes INTEGER, -- Optional time limit
    questions JSONB NOT NULL, -- Challenge questions/activities
    
    -- Rewards
    badge_id UUID REFERENCES public.badges(id) ON DELETE SET NULL,
    token_reward INTEGER DEFAULT 0, -- Tokens earned on completion
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User badge awards (which users have which badges)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    
    -- Award details
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    awarded_via TEXT CHECK (awarded_via IN ('challenge', 'auto', 'admin', 'peer_review')),
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
    
    -- Display
    is_visible BOOLEAN NOT NULL DEFAULT true, -- User can hide badges
    display_order INTEGER DEFAULT 0,
    
    UNIQUE(user_id, badge_id)
);

-- Challenge attempts and completions
CREATE TABLE IF NOT EXISTS public.challenge_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    
    -- Attempt details
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    time_taken_minutes INTEGER,
    
    -- Results
    score INTEGER, -- 0-100
    answers JSONB, -- User's answers
    passed BOOLEAN NOT NULL DEFAULT false,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'expired')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON public.challenges(category);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user ON public.challenge_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_challenge ON public.challenge_attempts(challenge_id);

-- RLS Policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;

-- Badges: Everyone can read
CREATE POLICY "Anyone can read badges" ON public.badges
    FOR SELECT USING (true);

-- Challenges: Everyone can read active challenges
CREATE POLICY "Anyone can read active challenges" ON public.challenges
    FOR SELECT USING (is_active = true);

-- User badges: Users can read their own and others' visible badges
CREATE POLICY "Users can read own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read visible badges" ON public.user_badges
    FOR SELECT USING (is_visible = true);

-- Challenge attempts: Users can manage their own
CREATE POLICY "Users can manage own challenge attempts" ON public.challenge_attempts
    FOR ALL USING (auth.uid() = user_id);

-- Function to award badge
CREATE OR REPLACE FUNCTION award_badge(
    p_user_id UUID,
    p_badge_id UUID,
    p_awarded_via TEXT DEFAULT 'auto',
    p_challenge_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_badge_award_id UUID;
BEGIN
    -- Check if user already has this badge
    IF EXISTS (
        SELECT 1 FROM public.user_badges 
        WHERE user_id = p_user_id AND badge_id = p_badge_id
    ) THEN
        RETURN NULL; -- Already has badge
    END IF;
    
    -- Award the badge
    INSERT INTO public.user_badges (user_id, badge_id, awarded_via, challenge_id)
    VALUES (p_user_id, p_badge_id, p_awarded_via, p_challenge_id)
    RETURNING id INTO v_badge_award_id;
    
    RETURN v_badge_award_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete challenge and award badge
CREATE OR REPLACE FUNCTION complete_challenge(
    p_user_id UUID,
    p_challenge_id UUID,
    p_score INTEGER,
    p_answers JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_challenge RECORD;
    v_attempt_id UUID;
    v_badge_awarded BOOLEAN := false;
    v_tokens_earned INTEGER := 0;
BEGIN
    -- Get challenge details
    SELECT * INTO v_challenge
    FROM public.challenges
    WHERE id = p_challenge_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Challenge not found');
    END IF;
    
    -- Determine if passed (typically 70% or higher)
    DECLARE
        v_passed BOOLEAN := p_score >= 70;
    BEGIN
        -- Update or create challenge attempt
        INSERT INTO public.challenge_attempts (
            user_id, challenge_id, completed_at, score, answers, passed, status
        )
        VALUES (
            p_user_id, p_challenge_id, now(), p_score, p_answers, v_passed, 'completed'
        )
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_attempt_id;
        
        -- If passed and challenge has a badge, award it
        IF v_passed AND v_challenge.badge_id IS NOT NULL THEN
            PERFORM award_badge(p_user_id, v_challenge.badge_id, 'challenge', p_challenge_id);
            v_badge_awarded := true;
        END IF;
        
        -- Award token reward if passed
        IF v_passed AND v_challenge.token_reward > 0 THEN
            UPDATE public.token_balances
            SET balance = balance + v_challenge.token_reward
            WHERE user_id = p_user_id;
            
            INSERT INTO public.token_transactions (
                user_id, transaction_type, amount, balance_after, context_type, context_id, description
            )
            SELECT 
                p_user_id, 
                'earn',
                v_challenge.token_reward,
                balance,
                'challenge',
                p_challenge_id,
                'Challenge completion reward'
            FROM public.token_balances
            WHERE user_id = p_user_id;
            
            v_tokens_earned := v_challenge.token_reward;
        END IF;
        
        RETURN jsonb_build_object(
            'success', true,
            'passed', v_passed,
            'badge_awarded', v_badge_awarded,
            'tokens_earned', v_tokens_earned,
            'attempt_id', v_attempt_id
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some initial badges
INSERT INTO public.badges (name, description, category, icon_name, color, display_order) VALUES
('Emotional Navigator', 'Demonstrated strong emotional intelligence and self-awareness', 'emotional_intelligence', 'brain', 'purple', 1),
('Conflict Resolver', 'Successfully navigated and resolved conflicts with empathy', 'conflict_management', 'shield-check', 'blue', 2),
('Authentic Communicator', 'Shows genuine, honest communication in relationships', 'communication', 'message-circle', 'green', 3),
('Empathy Champion', 'Consistently demonstrates deep empathy and understanding', 'empathy', 'heart-handshake', 'pink', 4),
('Growth Mindset', 'Actively works on personal growth and development', 'growth', 'trending-up', 'amber', 5),
('Accountability Star', 'High accountability score - reliable and trustworthy', 'accountability', 'star', 'gold', 6),
('Community Builder', 'Actively contributes to building meaningful community', 'community', 'users', 'teal', 7)
ON CONFLICT (name) DO NOTHING;

-- Seed some initial challenges
INSERT INTO public.challenges (name, description, category, token_cost, token_reward, badge_id, questions) 
SELECT 
    'Emotional Intelligence Assessment',
    'Test your ability to recognize and manage emotions in yourself and others',
    'emotional_intelligence',
    5,
    10,
    (SELECT id FROM badges WHERE name = 'Emotional Navigator'),
    '[
        {
            "type": "scenario",
            "question": "Your match cancels a date last minute. How do you respond?",
            "options": [
                {"text": "Express understanding and suggest rescheduling", "score": 10},
                {"text": "Ask what happened and show concern", "score": 8},
                {"text": "Feel disappointed but keep it to yourself", "score": 5},
                {"text": "Get upset and question their commitment", "score": 2}
            ]
        },
        {
            "type": "self_awareness",
            "question": "When you feel stressed, you typically:",
            "options": [
                {"text": "Recognize it, identify the cause, and take action", "score": 10},
                {"text": "Notice it but aren't sure what to do", "score": 6},
                {"text": "Try to ignore it", "score": 3},
                {"text": "Don't really notice until it's overwhelming", "score": 1}
            ]
        }
    ]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE name = 'Emotional Intelligence Assessment');

INSERT INTO public.challenges (name, description, category, token_cost, token_reward, badge_id, questions)
SELECT 
    'Conflict Resolution Workshop',
    'Learn and demonstrate skills for healthy conflict resolution',
    'conflict_management',
    5,
    10,
    (SELECT id FROM badges WHERE name = 'Conflict Resolver'),
    '[
        {
            "type": "scenario",
            "question": "Your match says something that hurt your feelings. You:",
            "options": [
                {"text": "Express your feelings calmly and seek to understand their perspective", "score": 10},
                {"text": "Take time to process, then discuss it when ready", "score": 8},
                {"text": "Point out what they did wrong", "score": 4},
                {"text": "Withdraw and hope they notice", "score": 2}
            ]
        }
    ]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE name = 'Conflict Resolution Workshop');

COMMENT ON TABLE public.badges IS 'Available badges users can earn';
COMMENT ON TABLE public.challenges IS 'Challenges users can complete to earn badges';
COMMENT ON TABLE public.user_badges IS 'Badges awarded to users';
COMMENT ON TABLE public.challenge_attempts IS 'User attempts at completing challenges';

