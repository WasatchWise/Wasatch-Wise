-- WiseBot Operational Knowledge Base (Phase 2)
-- Adds Q&A entries from "Operationalizing AI in K-12" report
-- Covers: deepfake protocols, K-5 literacy, opt-out mechanics, ESSA evidence, IEP/note-taking, sustainability

-- Ensure category constraint allows all needed categories (idempotent)
ALTER TABLE public.knowledge_base DROP CONSTRAINT IF EXISTS knowledge_base_category_check;
ALTER TABLE public.knowledge_base ADD CONSTRAINT knowledge_base_category_check CHECK (
  category IN (
    'FERPA', 'COPPA', 'State Law', 'State Privacy Laws', 'Policy', 'Policy Development',
    'Tool Evaluation', 'Vendor Evaluation', 'Process', 'Practical Procedures',
    'Best Practice', 'FAQ', 'Troubleshooting', 'Training',
    'AI Governance', 'AI Specific Risks', 'Compliance', 'Incident Response',
    'Accessibility', 'Special Populations', 'Parent Rights', 'Shadow AI',
    'Federal Laws', 'Edge Cases'
  )
);

INSERT INTO public.knowledge_base (category, question, answer, tags, confidence_level, priority, active)
SELECT v.category, v.question, v.answer, v.tags, v.confidence_level, v.priority, v.active
FROM (VALUES
  ('Incident Response', 'What is a step-by-step deepfake response playbook for school administrators?',
   'Establish a trauma-informed, victim-centered protocol with five phases: (1) **Initial Discovery:** Believe the victim immediately; preserve evidence without deleting; notify parents and school counselor. (2) **Legal Reporting:** File a CyberTipline report with NCMEC; notify local law enforcement/SRO if NCII or CSAM is involved. (3) **Content Mitigation:** Guide families to NCMEC Take It Down (TakeItDown.NCMEC.org), which uses privacy-preserving hashing to remove explicit content from participating platforms without uploading imagery. (4) **Disciplinary Action:** Apply amended code of conduct; consider restorative justice. (5) **Community Recovery:** Provide transparency to families; train staff on deepfake recognition. Update codes of conduct to specifically address generation and dissemination of deepfakes—research shows only 47% of schools provide education on synthetic media misuse. The Take It Down Act federalizes the crime of publishing nonconsensual explicit images of children, whether real or synthetic.',
   ARRAY['deepfake', 'NCII', 'NCMEC', 'Take It Down', 'trauma-informed', 'incident response', 'CyberTipline'],
   'high', 10, true),

  ('Training', 'What does developmentally appropriate AI literacy look like for K-5?',
   'For K-2: Avoid humanizing AI. Use "unplugged" activities—no screens. **Awareness:** "Is it a Person or a Tool?" game to identify voice assistants. **Logic:** Art Bot / drawing algorithm challenge where students follow rigid step-by-step instructions to illustrate that computers only do what they are told. **Error spotting:** Deliberately provide wrong answers so students "correct the machine," leading to age-appropriate bias discussions. For grades 3-5: **Ethics:** "Spot the Mistake" machine learning simulation; recognize bias and inaccuracy. **Application:** Use AI as a creative partner, not a primary source; AI-generated story revision. **Critique:** "Hallucination Detective" output review. North Dakota''s framework emphasizes that problem-solving skills must be prioritized—early dependence on generative AI can harm critical thinking. Link AI concepts to literacy, math, and science (e.g., pattern recognition in math, weather prediction in science) without requiring a dedicated CS period.',
   ARRAY['K-5', 'elementary', 'AI literacy', 'unplugged', 'developmental', 'North Dakota', 'curriculum'],
   'high', 9, true),

  ('Vendor Evaluation', 'How do we evaluate the pedagogical efficacy of new AI tools?',
   'Apply the ESSA (Every Student Succeeds Act) Tiers of Evidence: **Tier 1 (Strong):** At least one well-designed randomized controlled trial. **Tier 2 (Moderate):** At least one well-designed quasi-experimental study. **Tier 3 (Promising):** Correlational studies with statistical controls for selection bias. **Tier 4 (Rationale):** High-quality logic model with ongoing study. Digital Promise''s "Responsibly Designed AI" certification requires vendors to demonstrate data security, privacy, and bias-mitigation. Require vendors to notify the district within 10 business days of any new generative AI features added to existing platforms—these changes can alter privacy and bias profiles. Use the "Algorithmic Bias Safeguards for Workforce" 55-question evaluation (13 categories) for vendor accountability. Move procurement from reactive adoption to proactive evidence-based selection.',
   ARRAY['ESSA', 'efficacy', 'evidence', 'Digital Promise', 'procurement', 'pedagogical'],
   'high', 10, true),

  ('Practical Procedures', 'What is the specific checklist for vetting AI sub-processors?',
   'When an AI vendor uses sub-processors (e.g., an app calling OpenAI''s API), verify: (1) **Contract chain:** The primary vendor has a written agreement with the sub-processor imposing the same FERPA/COPPA data limits—specifically, no use of student data to train foundational models. (2) **Data flow mapping:** Identify exactly which data elements are passed to whom; document the "chain of trust." (3) **School official status:** Confirm the sub-processor meets FERPA "school official" definition—under direct control of the district regarding data use. (4) **Audit rights:** Contract should allow the district to request sub-processor compliance attestations or SOC 2 reports. (5) **Deletion on request:** Sub-processors must delete or return data when no longer needed, per the primary DPA. Document all sub-processors in your metadata dictionary and require advance notice of any new sub-processor addition.',
   ARRAY['sub-processors', 'vetting', 'checklist', 'chain of trust', 'FERPA', 'vendor evaluation'],
   'high', 10, true),

  ('Compliance', 'How do we draft a DPA that supersedes click-wrap terms?',
   'Include explicit "Order of Precedence" or "Supersession" language: "In the event of any conflict between this Data Privacy Agreement and the Vendor''s standard Terms of Service, Privacy Policy, or any click-wrap or browse-wrap agreement, the terms of this DPA shall control with respect to the collection, use, storage, and disclosure of Student Data." Specify that the DPA is the "entire agreement" for data handling. Require the vendor to provide a signed DPA (or NDPA with Exhibit H modifications) before any district user may access the tool—individual teachers cannot bind the district to click-wrap. The Edmodo FTC settlement established that vendors cannot shift COPPA compliance to schools via TOS; similar logic applies to FERPA. Retain a right to terminate if the vendor materially changes TOS in a way that conflicts with the DPA.',
   ARRAY['DPA', 'click-wrap', 'contract', 'order of precedence', 'NDPA', 'supersession'],
   'high', 9, true),

  ('Compliance', 'What audit logs are required for CIPA compliance with AI usage?',
   'CIPA requires monitoring of minors'' online activities. For AI tools, districts must: (1) Use "Walled Garden" environments that provide audit logs of student interactions—who accessed what, when, and what was generated. (2) Log AI-generated content requests and outputs to detect harmful or inappropriate use (obscene, pornographic, or harmful to minors). (3) Retain logs per your data governance plan; typical retention is 1–3 years for security/disciplinary purposes. (4) Ensure content filters block non-educational AI sites; audit logs should capture attempted access to blocked sites. (5) Integrate AI tool logs with existing CIPA-compliant filtering/monitoring systems. Logs must be reviewable by designated staff (e.g., tech director, student data manager) for incident investigation. Automated alerts for high-risk patterns (e.g., prompt injection attempts, inappropriate content generation) support proactive compliance.',
   ARRAY['CIPA', 'audit logs', 'monitoring', 'E-Rate', 'filtering', 'compliance'],
   'high', 9, true),

  ('Practical Procedures', 'How do we manage parent opt-out of AI tools and provide equitable alternatives?',
   'Establish a written workflow: (1) Run a Privacy Data Protection Impact Assessment (DPIA) before tool launch. (2) Publish family notices explaining data flows and opt-out choices. (3) When a parent opts out, provide a non-AI alternative that meets the same learning outcomes without disadvantage. Use "AI-resistant" assignment design for all students: **Process artifacts** (brainstorming logs, drafts, research journals); **Localized context** (prompts requiring local news, community interviews, classroom-specific content); **Multimodal formats** (flowcharts, podcasts, physical prototypes instead of essays); **Verification conferences** (5–15 min oral defense of work). Wisconsin recommends "Use with Care" posters near tech stations and a "3-source rule" for factual claims. Alternatives must be transparent and documented—teachers should not improvise ad-hoc substitutes.',
   ARRAY['opt-out', 'alternative assignments', 'equity', 'AI-resistant', 'FERPA', 'process artifacts'],
   'high', 10, true),

  ('Special Populations', 'Can we use AI note-taking tools during IEP or 504 meetings?',
   'Exercise extreme caution. If an AI note-taker stores notes on a third-party server, **attorney-client privilege** may be breached or waived—the communication is no longer strictly between client and attorney. For contentious meetings where legal counsel is present, avoid consumer AI note-takers entirely. If using a district-designated, FERPA-compliant tool with a signed DPA and no third-party training on PII, ensure: (1) The vendor is designated a "school official" under FERPA. (2) Notes are stored in district-controlled systems, not vendor cloud. (3) No PII, diagnoses, or sensitive history is entered into consumer AI. CDC/Thrun Law and similar guidance warn that AI note-taking creates discoverable records that could undermine confidentiality. Prefer human notetakers or district-approved, on-premises solutions for meetings involving sensitive special education discussions.',
   ARRAY['IEP', '504', 'note-taking', 'attorney-client privilege', 'FERPA', 'special education', 'confidentiality'],
   'high', 10, true),

  ('Vendor Evaluation', 'What are the ESSA Tiers of Evidence and how do they apply to AI EdTech?',
   'ESSA defines four tiers: **Tier 1 (Strong Evidence):** At least one well-designed randomized controlled trial. **Tier 2 (Moderate Evidence):** At least one well-designed quasi-experimental study. **Tier 3 (Promising Evidence):** Correlational studies with statistical controls for selection bias. **Tier 4 (Demonstrates a Rationale):** High-quality logic model with ongoing effort to study effects. Most AI EdTech lacks longitudinal efficacy data—districts should require vendors to disclose which tier applies and provide supporting research. Digital Promise''s "Responsibly Designed AI" certification and "Research-Based Design" (ESSA Tier 4) product certification add credibility. Apply the same evidence bar to AI tools as to other interventions; marketing claims ("AI-powered personalization") are insufficient without empirical backing.',
   ARRAY['ESSA', 'evidence tiers', 'efficacy', 'Digital Promise', 'procurement', 'research'],
   'high', 9, true),

  ('AI Governance', 'What should we know about AI in non-instructional areas like transportation or HR?',
   '**Transportation:** AI-driven predictive maintenance uses telematics (engine voltage, temperature, vibration) to predict bus failures—districts report ~73% reduction in roadside breakdowns. Ensure location/telematics data is covered by DPAs and data governance plans. **HR/Recruitment:** Over 80% of employers use algorithmic tools for resume scanning, interview scheduling, or video analysis. Risks include algorithmic bias (models trained on non-representative historical hires). Implement: disparate impact analysis for protected groups; diversification of teams building tools; human review of AI screening decisions. California''s Civil Rights Council (effective Oct 2025) makes it unlawful to use Automated Decision Systems for discriminatory purposes in employment. Districts using AI for teacher recruitment must audit for adverse effects on protected classes.',
   ARRAY['operational AI', 'transportation', 'HR', 'predictive maintenance', 'hiring bias', 'algorithmic bias'],
   'high', 8, true),

  ('AI Governance', 'What is the environmental impact of AI and should districts consider it?',
   'AI has measurable environmental costs. **Training** a large model (e.g., GPT-3) generates ~550 tons CO2. **Inference** (answering a prompt): a single Gemini-class prompt uses ~0.24 Wh and 0.26 mL water (~1–2% of a smartphone charge). Data centers consume ~2 L water per kWh (Water Usage Effectiveness). **Mitigation:** Hyperscale cloud (AWS, Google Cloud) can reduce AI workload carbon footprint by up to 99% vs. on-premises due to efficient cooling and carbon-free energy procurement. Consider cloud for district AI services. Integrate "carbon footprinting" into K-12 science curriculum so students understand the physicality of digital activity. This supports sustainability literacy and aligns with district green goals.',
   ARRAY['sustainability', 'carbon footprint', 'environment', 'cloud', 'data center', 'water usage'],
   'medium', 7, true)
) AS v(category, question, answer, tags, confidence_level, priority, active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.knowledge_base kb WHERE kb.question = v.question
);
