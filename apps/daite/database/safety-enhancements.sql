-- ============================================================================
-- Safety & Trust Enhancements
-- Adds behavioral pattern detection, risk scoring, and enhanced reporting
-- ============================================================================

-- Behavioral Pattern Detection Table
CREATE TABLE IF NOT EXISTS public.behavioral_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL CHECK (pattern_type IN (
        'catfishing',
        'manipulation',
        'predatory',
        'harassment',
        'spam',
        'verification_avoidance',
        'boundary_violation',
        'financial_scam',
        'love_bombing',
        'isolation_attempt',
        'threat',
        'doxxing'
    )),
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    evidence JSONB NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('automated', 'user_report', 'admin_review', 'ai_analysis')),
    reviewed_by_admin BOOLEAN NOT NULL DEFAULT false,
    review_notes TEXT,
    action_taken TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_behavioral_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_behavioral_user ON public.behavioral_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_type ON public.behavioral_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_behavioral_severity ON public.behavioral_patterns(severity);
CREATE INDEX IF NOT EXISTS idx_behavioral_detected ON public.behavioral_patterns(detected_at);

-- User Risk Scores Table
CREATE TABLE IF NOT EXISTS public.user_risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Component scores (0-100, higher = more risky)
    verification_risk INTEGER DEFAULT 0 CHECK (verification_risk BETWEEN 0 AND 100),
    behavioral_risk INTEGER DEFAULT 0 CHECK (behavioral_risk BETWEEN 0 AND 100),
    report_risk INTEGER DEFAULT 0 CHECK (report_risk BETWEEN 0 AND 100),
    conversation_risk INTEGER DEFAULT 0 CHECK (conversation_risk BETWEEN 0 AND 100),
    
    -- Overall risk score (weighted average)
    overall_risk_score INTEGER DEFAULT 0 CHECK (overall_risk_score BETWEEN 0 AND 100),
    risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    
    -- Last calculated
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    next_recalculation_at TIMESTAMPTZ,
    
    -- Flag if above threshold
    auto_flagged BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    calculation_version INTEGER DEFAULT 1,
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_risk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_risk_score ON public.user_risk_scores(overall_risk_score);
CREATE INDEX IF NOT EXISTS idx_risk_level ON public.user_risk_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_flagged ON public.user_risk_scores(auto_flagged);

-- Authority Reports Table
CREATE TABLE IF NOT EXISTS public.authority_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Authority type
    authority_type TEXT NOT NULL CHECK (authority_type IN (
        'local_police',
        'fbi',
        'ftc',
        'ncmec',
        'state_attorney',
        'cyber_crime_unit',
        'other'
    )),
    
    -- Report details
    report_reason TEXT NOT NULL,
    evidence_summary JSONB NOT NULL,
    urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    
    -- Coordination
    reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reported_by UUID REFERENCES auth.users(id), -- Admin user ID
    case_number TEXT,
    authority_contact TEXT,
    authority_contact_email TEXT,
    follow_up_required BOOLEAN NOT NULL DEFAULT true,
    follow_up_date TIMESTAMPTZ,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'submitted',
        'acknowledged',
        'investigating',
        'closed',
        'no_action'
    )),
    
    -- Legal
    legal_counsel_informed BOOLEAN NOT NULL DEFAULT false,
    legal_counsel_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_authority_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_authority_user ON public.authority_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_authority_status ON public.authority_reports(status);
CREATE INDEX IF NOT EXISTS idx_authority_urgency ON public.authority_reports(urgency);
CREATE INDEX IF NOT EXISTS idx_authority_type ON public.authority_reports(authority_type);

-- Enhanced Reports Table (add new columns if table exists)
DO $$ 
BEGIN
    -- Add behavioral indicators column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reports' 
        AND column_name = 'behavioral_indicators'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN behavioral_indicators TEXT[];
    END IF;
    
    -- Add urgency score column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reports' 
        AND column_name = 'urgency_score'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN urgency_score INTEGER DEFAULT 5 CHECK (urgency_score BETWEEN 1 AND 10);
    END IF;
    
    -- Expand report categories (requires dropping and recreating constraint)
    -- Note: This is complex - may need manual update depending on current constraint
END $$;

-- Auto-flag risky users function
CREATE OR REPLACE FUNCTION auto_flag_risky_users()
RETURNS TRIGGER AS $$
DECLARE
    pattern_count INTEGER;
    severity_sum INTEGER;
    current_risk_level TEXT;
BEGIN
    -- Count patterns in last 30 days
    SELECT COUNT(*), SUM(severity)
    INTO pattern_count, severity_sum
    FROM public.behavioral_patterns
    WHERE user_id = NEW.user_id
    AND detected_at > now() - INTERVAL '30 days';
    
    -- Auto-flag if threshold exceeded
    IF pattern_count >= 3 OR COALESCE(severity_sum, 0) >= 15 THEN
        -- Determine risk level
        current_risk_level := CASE 
            WHEN COALESCE(severity_sum, 0) >= 25 THEN 'critical'
            WHEN COALESCE(severity_sum, 0) >= 15 THEN 'severe'
            ELSE 'moderate'
        END;
        
        -- Insert or update safety flag
        INSERT INTO public.safety_flags (
            flagged_user_id,
            flag_type,
            flag_severity,
            flag_context,
            created_at
        ) VALUES (
            NEW.user_id,
            'behavioral_patterns',
            current_risk_level,
            jsonb_build_object(
                'pattern_count', pattern_count,
                'severity_sum', COALESCE(severity_sum, 0),
                'patterns', (
                    SELECT jsonb_agg(pattern_type)
                    FROM public.behavioral_patterns
                    WHERE user_id = NEW.user_id
                    AND detected_at > now() - INTERVAL '30 days'
                ),
                'triggered_by', NEW.id,
                'triggered_at', now()
            ),
            now()
        )
        ON CONFLICT (flagged_user_id, flag_type) 
        DO UPDATE SET
            flag_severity = EXCLUDED.flag_severity,
            flag_context = EXCLUDED.flag_context,
            updated_at = now();
        
        -- Recalculate risk score
        PERFORM calculate_user_risk_score(NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for behavioral pattern detection
DROP TRIGGER IF EXISTS detect_behavioral_patterns ON public.behavioral_patterns;
CREATE TRIGGER detect_behavioral_patterns
AFTER INSERT ON public.behavioral_patterns
FOR EACH ROW
EXECUTE FUNCTION auto_flag_risky_users();

-- Risk score calculation function
CREATE OR REPLACE FUNCTION calculate_user_risk_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    b_score INTEGER := 0;
    r_score INTEGER := 0;
    c_score INTEGER := 0;
    final_score INTEGER;
    risk_level_val TEXT;
BEGIN
    -- Verification risk (0-40 points)
    SELECT 
        CASE 
            WHEN verification_tier = 0 THEN 40
            WHEN verification_tier = 1 THEN 20
            WHEN verification_tier = 2 THEN 5
            WHEN verification_tier = 3 THEN 0
            ELSE 40
        END
    INTO v_score
    FROM public.users
    WHERE id = user_uuid;
    
    -- Behavioral pattern risk (0-30 points)
    SELECT COALESCE(
        GREATEST(0, LEAST(30, SUM(severity) * 2)),
        0
    )
    INTO b_score
    FROM public.behavioral_patterns
    WHERE user_id = user_uuid
    AND detected_at > now() - INTERVAL '90 days';
    
    -- Report risk (0-20 points)
    SELECT COALESCE(
        GREATEST(0, LEAST(20, COUNT(*) * 5)),
        0
    )
    INTO r_score
    FROM public.reports
    WHERE reported_user_id = user_uuid
    AND status IN ('pending', 'under_review', 'validated')
    AND created_at > now() - INTERVAL '90 days';
    
    -- Conversation risk from CYRAiNO analysis (0-10 points)
    -- Placeholder - would integrate with AI analysis
    c_score := 0;
    
    -- Weighted final score
    final_score := v_score + b_score + r_score + c_score;
    
    -- Determine risk level
    risk_level_val := CASE
        WHEN final_score >= 70 THEN 'critical'
        WHEN final_score >= 50 THEN 'high'
        WHEN final_score >= 30 THEN 'moderate'
        ELSE 'low'
    END;
    
    -- Update or insert
    INSERT INTO public.user_risk_scores (
        user_id,
        verification_risk,
        behavioral_risk,
        report_risk,
        conversation_risk,
        overall_risk_score,
        risk_level,
        calculated_at,
        auto_flagged,
        updated_at
    ) VALUES (
        user_uuid,
        v_score,
        b_score,
        r_score,
        c_score,
        final_score,
        risk_level_val,
        now(),
        final_score >= 50,
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        verification_risk = EXCLUDED.verification_risk,
        behavioral_risk = EXCLUDED.behavioral_risk,
        report_risk = EXCLUDED.report_risk,
        conversation_risk = EXCLUDED.conversation_risk,
        overall_risk_score = EXCLUDED.overall_risk_score,
        risk_level = EXCLUDED.risk_level,
        calculated_at = EXCLUDED.calculated_at,
        auto_flagged = EXCLUDED.auto_flagged,
        updated_at = EXCLUDED.updated_at;
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE public.behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authority_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Behavioral patterns: Only service role can access
CREATE POLICY "Only service role can access behavioral patterns"
ON public.behavioral_patterns
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Risk scores: Users can see their own
CREATE POLICY "Users can view own risk score"
ON public.user_risk_scores
FOR SELECT
USING (auth.uid() = user_id);

-- Authority reports: Only service role can access
CREATE POLICY "Only service role can access authority reports"
ON public.authority_reports
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Comments
COMMENT ON TABLE public.behavioral_patterns IS 'Automated detection of risky behavioral patterns (catfishing, manipulation, predatory behavior)';
COMMENT ON TABLE public.user_risk_scores IS 'Calculated risk scores for users based on verification, behavior, reports, and conversations';
COMMENT ON TABLE public.authority_reports IS 'Reports to law enforcement and authorities for serious safety concerns';

