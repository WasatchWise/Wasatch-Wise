# Safety & Trust Framework
## Protecting Users from Catfishing, Manipulation, and Dangerous Individuals

### Overview

DAiTE faces inherent risks in facilitating human connections. This framework addresses:
- **Catfishing/Identity Fraud**: Fake profiles, stolen photos, misrepresentation
- **Manipulation**: Emotional manipulation, gaslighting, coercive control
- **Dangerous Individuals**: Psychopaths, sociopaths, predators
- **Inauthenticity**: Misleading profiles, hidden agendas

### Multi-Layer Defense Strategy

#### Layer 1: Identity Verification (Entry Point)
#### Layer 2: Behavioral Pattern Detection (Ongoing)
#### Layer 3: Community Reporting (Crowdsourced)
#### Layer 4: AI-Assisted Risk Assessment (Automated)
#### Layer 5: Professional Review & Authority Coordination (Escalation)

---

## Layer 1: Identity Verification

### Verification Tiers

**Tier 0 (Unverified)**: Default for new users
- Limited matching capabilities
- Cannot message until Tier 1
- Lower visibility in discovery

**Tier 1 (Photo Verification)**: Basic trust
- Selfie with specific gesture (e.g., "Make a peace sign")
- AI photo matching to profile photos
- Can message and match

**Tier 2 (ID + Photo Match)**: Enhanced trust
- Government ID verification (name, DOB, photo match)
- Biometric comparison (AI face matching)
- Increased visibility and features

**Tier 3 (Comprehensive Verification)**: Highest trust
- Tier 2 requirements +
- Social media cross-reference (optional, encrypted)
- Phone number verification
- Background check (optional, consent-based)

### Red Flags in Verification

**Catfishing Indicators**:
- Photo mismatch between selfie and profile
- Stolen photo detection (reverse image search)
- ID photo doesn't match selfie
- Multiple accounts using same photos
- Photo quality inconsistencies (professional vs. selfie)

**Automated Detection**:
```sql
-- Flag users with photo inconsistencies
CREATE FUNCTION detect_photo_inconsistencies()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for:
  -- 1. Profile photos vs. verification selfie mismatch
  -- 2. Multiple accounts using same photo
  -- 3. Reverse image search hits (external service)
  -- 4. AI-generated face detection
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Layer 2: Behavioral Pattern Detection

### Red Flag Behaviors (Automated Monitoring)

#### 1. **Catfishing Patterns**
- **Photo Inconsistencies**: Multiple photos that don't look like the same person
- **Profile Completeness Mismatch**: Very detailed profile but refuses video calls
- **Avoidance Patterns**: Consistently avoids video/voice verification
- **Story Inconsistencies**: CYRAiNO narratives reveal conflicting information
- **Reverse Image Search Hits**: Profile photos found on other sites/accounts

#### 2. **Manipulation Indicators**
- **Love Bombing**: Excessive compliments, rapid emotional escalation in early messages
- **Isolation Attempts**: Encouraging users to move conversations off-platform
- **Pressure Tactics**: Pushing for in-person meetings before verification
- **Victim Positioning**: Constant stories about being wronged, seeking sympathy
- **Boundary Pushing**: Ignoring "no" or user-set boundaries repeatedly

#### 3. **Psychopath/Sociopath Indicators**
- **Lack of Empathy Signals**: CYRAiNO conversations show zero emotional intelligence
- **Superficial Charm**: Extremely polished, but conversations lack depth
- **Grandiose Narratives**: Constant self-aggrandizement, unrealistic claims
- **History of Deceit**: Pattern of lying (detected through cross-referencing)
- **Impulsivity**: Rapid behavior changes, inconsistency
- **Lack of Remorse**: When called out, shows no accountability

#### 4. **Predatory Patterns**
- **Age/Situation Targeting**: Consistently matches with vulnerable demographics
- **Rapid Relationship Escalation**: Pushing for commitment/meeting too fast
- **Financial Requests**: Any mention of money, investment, loans
- **Sexual Aggression**: Unsolicited sexual content, pressure
- **Privacy Violations**: Sharing other users' information, doxxing

### Automated Detection System

```sql
-- Behavioral pattern detection
CREATE TABLE public.behavioral_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    pattern_type TEXT NOT NULL CHECK (pattern_type IN (
        'catfishing',
        'manipulation',
        'predatory',
        'harassment',
        'spam',
        'verification_avoidance',
        'boundary_violation',
        'financial_scam'
    )),
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    evidence JSONB NOT NULL,
    reviewed_by_admin BOOLEAN NOT NULL DEFAULT false,
    action_taken TEXT,
    
    INDEX idx_behavioral_user (user_id),
    INDEX idx_behavioral_type (pattern_type),
    INDEX idx_behavioral_severity (severity)
);

-- Trigger automated flags based on patterns
CREATE FUNCTION auto_flag_risky_users()
RETURNS TRIGGER AS $$
DECLARE
    pattern_count INTEGER;
    severity_sum INTEGER;
BEGIN
    -- Count patterns in last 30 days
    SELECT COUNT(*), SUM(severity)
    INTO pattern_count, severity_sum
    FROM public.behavioral_patterns
    WHERE user_id = NEW.user_id
    AND detected_at > now() - INTERVAL '30 days';
    
    -- Auto-flag if threshold exceeded
    IF pattern_count >= 3 OR severity_sum >= 15 THEN
        INSERT INTO public.safety_flags (
            flagged_user_id,
            flag_type,
            flag_severity,
            flag_context
        ) VALUES (
            NEW.user_id,
            'behavioral_patterns',
            CASE 
                WHEN severity_sum >= 25 THEN 'critical'
                WHEN severity_sum >= 15 THEN 'severe'
                ELSE 'moderate'
            END,
            jsonb_build_object(
                'pattern_count', pattern_count,
                'severity_sum', severity_sum,
                'patterns', (
                    SELECT jsonb_agg(pattern_type)
                    FROM public.behavioral_patterns
                    WHERE user_id = NEW.user_id
                    AND detected_at > now() - INTERVAL '30 days'
                )
            )
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER detect_behavioral_patterns
AFTER INSERT ON public.behavioral_patterns
FOR EACH ROW
EXECUTE FUNCTION auto_flag_risky_users();
```

### CYRAiNO Conversation Analysis

**Red Flags in Agent Conversations**:
- Extremely polished, no vulnerability (sociopath indicator)
- Lack of empathy responses (psychopath indicator)
- Inconsistencies between what they say and their profile
- Rapid escalation without depth (manipulation)
- Boundary-pushing language
- Grandiose claims without substance

**AI Analysis Prompt Addition**:
```
Analyze this CYRAiNO conversation for red flags:

1. Authenticity Indicators:
   - Does the conversation feel genuine or performative?
   - Are there moments of vulnerability vs. constant perfection?
   
2. Empathy Assessment:
   - Does this person show emotional intelligence?
   - Can they understand others' perspectives?
   
3. Consistency Checks:
   - Does the narrative align with their profile?
   - Are there contradictions or evasiveness?
   
4. Manipulation Signals:
   - Love bombing, rapid escalation, pressure tactics
   - Boundary violations, victim positioning
   
5. Risk Assessment:
   - Low, Moderate, High, Critical
   - Specific concerns and evidence
```

---

## Layer 3: Community Reporting

### Enhanced Reporting System

```sql
-- Expand report categories
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS behavioral_indicators TEXT[],
ADD COLUMN IF NOT EXISTS urgency_score INTEGER DEFAULT 5 CHECK (urgency_score BETWEEN 1 AND 10);

-- Report categories already include:
-- 'harassment', 'inappropriate_content', 'spam', 'fake_profile', 
-- 'scam', 'offensive_behavior', 'safety_concern', 'other'

-- Add new categories
-- Need to update CHECK constraint to include:
-- 'catfishing', 'manipulation', 'predatory_behavior', 
-- 'threat', 'doxxing', 'financial_scam'
```

### Report Types

1. **Catfishing**: "This person's photos don't match / stolen photos"
2. **Manipulation**: "Feels like emotional manipulation / gaslighting"
3. **Predatory Behavior**: "Making me uncomfortable / boundary violations"
4. **Threat**: "Made threats or felt unsafe"
5. **Financial Scam**: "Asked for money / investment opportunity"
6. **Harassment**: Standard harassment reporting
7. **Fake Profile**: Obvious bot or fake account

### Reporting UI Components

- One-click reporting from messages
- Screenshot capture (automatic)
- Evidence collection (message IDs, timestamps)
- Anonymity options (some reports can be anonymous)
- Priority escalation (immediate threat → escalated)

---

## Layer 4: AI-Assisted Risk Assessment

### Risk Scoring Algorithm

```sql
CREATE TABLE public.user_risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id),
    
    -- Component scores (0-100, higher = more risky)
    verification_risk INTEGER DEFAULT 0,
    behavioral_risk INTEGER DEFAULT 0,
    report_risk INTEGER DEFAULT 0,
    conversation_risk INTEGER DEFAULT 0,
    
    -- Overall risk score (weighted average)
    overall_risk_score INTEGER DEFAULT 0 CHECK (overall_risk_score BETWEEN 0 AND 100),
    risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    
    -- Last calculated
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    next_recalculation_at TIMESTAMPTZ,
    
    -- Flag if above threshold
    auto_flagged BOOLEAN NOT NULL DEFAULT false,
    
    INDEX idx_risk_score (overall_risk_score),
    INDEX idx_risk_level (risk_level)
);
```

### Risk Calculation

```sql
CREATE FUNCTION calculate_user_risk_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    b_score INTEGER := 0;
    r_score INTEGER := 0;
    c_score INTEGER := 0;
    final_score INTEGER;
BEGIN
    -- Verification risk (0-40 points)
    SELECT 
        CASE 
            WHEN verification_tier = 0 THEN 40
            WHEN verification_tier = 1 THEN 20
            WHEN verification_tier = 2 THEN 5
            WHEN verification_tier = 3 THEN 0
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
    -- (Would integrate with AI analysis)
    c_score := 0; -- Placeholder
    
    -- Weighted final score
    final_score := v_score + b_score + r_score + c_score;
    
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
        auto_flagged
    ) VALUES (
        user_uuid,
        v_score,
        b_score,
        r_score,
        c_score,
        final_score,
        CASE
            WHEN final_score >= 70 THEN 'critical'
            WHEN final_score >= 50 THEN 'high'
            WHEN final_score >= 30 THEN 'moderate'
            ELSE 'low'
        END,
        now(),
        final_score >= 50
    )
    ON CONFLICT (user_id) DO UPDATE SET
        verification_risk = EXCLUDED.verification_risk,
        behavioral_risk = EXCLUDED.behavioral_risk,
        report_risk = EXCLUDED.behavioral_risk,
        report_risk = EXCLUDED.report_risk,
        conversation_risk = EXCLUDED.conversation_risk,
        overall_risk_score = EXCLUDED.overall_risk_score,
        risk_level = EXCLUDED.risk_level,
        calculated_at = EXCLUDED.calculated_at,
        auto_flagged = EXCLUDED.auto_flagged;
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;
```

---

## Layer 5: Professional Review & Authority Coordination

### Escalation Protocol

**Risk Level: Moderate (30-49)**
- Automated review by AI
- Additional verification required
- Limited visibility in discovery

**Risk Level: High (50-69)**
- Manual admin review
- Account restrictions (cannot match new users)
- Existing matches notified (optional, privacy-protected)

**Risk Level: Critical (70+)**
- Immediate account suspension
- Evidence preservation
- Law enforcement notification if:
  - Threats made
  - Sexual crimes indicated
  - Financial crimes (report to FTC/FBI)
  - Child exploitation (report to NCMEC)

### Authority Coordination

```sql
CREATE TABLE public.authority_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    
    -- Authority type
    authority_type TEXT NOT NULL CHECK (authority_type IN (
        'local_police',
        'fbi',
        'ftc',
        'ncmec',
        'state_attorney',
        'other'
    )),
    
    -- Report details
    report_reason TEXT NOT NULL,
    evidence_summary JSONB NOT NULL,
    urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    
    -- Coordination
    reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reported_by UUID REFERENCES auth.users(id), -- Admin user
    case_number TEXT,
    authority_contact TEXT,
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
    
    INDEX idx_authority_user (user_id),
    INDEX idx_authority_status (status),
    INDEX idx_authority_urgency (urgency)
);
```

### When to Report to Authorities

**Immediate Reporting Required**:
1. **Child Exploitation**: Any indication of minor involvement → NCMEC
2. **Threats of Violence**: Specific, credible threats → Local Police + FBI
3. **Sexual Assault**: Reports of assault → Local Police
4. **Financial Crimes**: Scams, fraud over $500 → FTC + Local Police
5. **Stalking**: Pattern of stalking behavior → Local Police
6. **Revenge Porn**: Non-consensual image sharing → Local Police + FBI

**Evidence Preservation**:
- All communications preserved
- Screenshots/evidence stored securely
- Chain of custody maintained
- User consent (where legally required)

---

## User Protection Features

### 1. **Safety Settings Dashboard**
- Verification status
- Risk indicators (if applicable)
- Report history
- Block list
- Privacy controls

### 2. **Pre-Meeting Safety Checklist**
Before first in-person meeting:
- ✅ Video call completed
- ✅ Verification tier 2+ achieved
- ✅ Mutual friends/connections verified (if available)
- ✅ Public meeting place selected
- ✅ Share meeting details with friend/family
- ✅ Safety contact set up

### 3. **Emergency Features**
- Panic button (discreet)
- Emergency contact notification
- Quick block + report
- Location sharing (opt-in)

### 4. **Transparency for Safe Users**
- Show verification badges prominently
- Display "Verified" status
- Risk indicators only for high-risk users (privacy-protected)
- "Safety score" visible to user themselves

---

## Privacy & Legal Considerations

### Data Protection
- Minimal data collection (only what's necessary)
- Encrypted storage for sensitive info (ID photos, reports)
- Right to deletion (GDPR/CCPA compliant)
- Anonymization of reports (where possible)

### False Positives
- Appeal process for flagged users
- Manual review available
- Transparency about why flagged (where safe)
- Path to reinstatement

### Legal Compliance
- COPPA (13+ only, verified)
- GDPR (EU users)
- CCPA (California users)
- Terms of Service clearly state safety policies
- Liability limitations (platform is facilitator, not guarantor)

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- ✅ Verification tier system (already in schema)
- Implement photo verification
- Basic reporting system
- Block functionality

### Phase 2: Detection (Weeks 5-8)
- Behavioral pattern detection
- AI conversation analysis
- Risk scoring algorithm
- Automated flagging

### Phase 3: Enhancement (Weeks 9-12)
- Advanced verification (ID, social)
- Community reporting improvements
- Safety dashboard
- Pre-meeting checklist

### Phase 4: Authority Coordination (Weeks 13-16)
- Authority reporting system
- Evidence preservation
- Law enforcement protocols
- Legal review

---

## Key Metrics to Track

- **False Positive Rate**: Users incorrectly flagged
- **Detection Rate**: Catfish/manipulators caught
- **User Safety Reports**: Incidents reported by users
- **Authority Reports**: Cases escalated to authorities
- **Verification Adoption**: % of users completing verification tiers
- **Time to Detection**: How quickly we catch bad actors

---

## The Balance: Safety vs. Privacy

**Challenge**: How to protect users without creating a surveillance state?

**Approach**:
- Transparent about what we monitor (behavioral patterns, not private thoughts)
- User control (can see their own risk score)
- Minimal data collection
- Clear boundaries (what triggers flags, what doesn't)
- Appeals process for mistakes

**Ethical Principle**: We're protecting vulnerable users, not building a perfect surveillance system. Some risk will always exist—we minimize it while preserving user autonomy and privacy.

